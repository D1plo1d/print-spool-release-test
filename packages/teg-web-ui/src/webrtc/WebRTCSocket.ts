import SimplePeer from 'simple-peer'

import {
  chunkifier,
  dechunkifier,
  RELIABLE_ORDERED,
  MAX_MESSAGE_SIZE,
  UNORDERED_UNRELIABLE,
} from './saltyRTCChunk'

export type FileLike = File | Blob | FileList;

const EVENT_NAMES = [
  'close',
  'message',
  'error',
]

// Set to true for messages to be delivered in order
const ORDERED = false

export type WebRTCOptions = {
  iceServers: string[],
  files: Map<string, FileLike>,
  connectToPeer: (any) => Promise<any>,
  onSignallingError: (any) => void,
  onSignallingSuccess: () => void,
}

const socketFactory = (options: WebRTCOptions) => {
  return class WebRTCSocket {
    static CLOSED: string = 'CLOSED'
    static CLOSING: string = 'CLOSING'
    static CONNECTING: string = 'CONNECTING'
    static OPEN: string = 'OPEN'

    readyState: string
    private listeners: any
    private peer: any
    private chunkifier: any

    constructor(url: string, protocol: string) {
      this.listeners = {}
      this.innerClose = this.innerClose.bind(this)
      this.innerHandleError = this.innerHandleError.bind(this)

      this.init()
        .catch((e) => setTimeout(() => {
          options.onSignallingError(e)
          this.innerHandleError(e)
        }, 0))
    }

    private async init() {
      const {
        iceServers,
        connectToPeer,
        onSignallingSuccess,
      } = options

      // const iceServers = [
      //   { urls: 'stun:stun.l.google.com:19302' },
      //   { urls: 'stun:global.stun.twilio.com:3478?transport=udp' },
      // ]
      // console.log({ iceServers })

      this.peer = new SimplePeer({
        initiator: true,
        trickle: false,
        config: { iceServers },
        channelConfig: { ordered: ORDERED },
      })

      // Change the bufferedAmountLowThreshold to the chunk size
      const originalSetupData = this.peer._setupData.bind(this.peer)
      this.peer._setupData = function (event) {
        originalSetupData(event)
        if (typeof this._channel.bufferedAmountLowThreshold === 'number') {
          this._channel.bufferedAmountLowThreshold = MAX_MESSAGE_SIZE
        }
      }

      this.chunkifier = chunkifier(
        {
          mode: ORDERED ? RELIABLE_ORDERED : UNORDERED_UNRELIABLE,
        },
        this.peer,
      )

      this.peer.on('connect', () => {
        // console.log('CONNECT')
        this.onopen()
          .catch(this.innerHandleError)
      })

      // Register event listeners

      this.peer.on('close', () => {
        // console.log('PEER CONNECTION CLOSED')
        this.innerClose({ message: 'WebRTC peer connection closed'}, 1000)
      })

      let firstMessage = true
      this.peer.on('data', dechunkifier(data => {
        if (firstMessage) {
          firstMessage = false
          const { type, payload } = JSON.parse(data)

          if (type === 'connection_error') {
            this.innerHandleError(payload, { unrecoverable: true })
            return
          }
        }

        // messages are received both through onmessage and an event listener
        try {
          this.onmessage?.({ data })
          this.listeners.message?.forEach(listener => listener({ data }))
        } catch (error) {
          console.error(`Error receiving message: ${error.message}`, { error, data })
          this.close(4000, `Error receiving message: ${error.message}: ${JSON.stringify(data)}`)
        }
      }))

      this.peer.on('error', this.innerHandleError)
      this.peer.on('iceStateChange', (state) => {
        if (state === 'disconnected') {
          console.log('iceState changed to disconnected')
          this.innerHandleError({ message: 'Connection lost' }, { code: 4444 })
        }
      })

      // Connect to the Peer

      const offer = await new Promise((resolve, reject) => {
        this.peer.on('error', reject)
        this.peer.on('signal', resolve)
      })
      // console.log("sending", { offer })

      const {
        answer,
        iceCandidates
      } = await connectToPeer(offer)

      // console.log('received', { answer, iceCandidates })
      this.peer.signal(answer)

      iceCandidates.forEach((candidate) => {
        // console.log('ADD', { candidate })
        this.peer.signal({ candidate })
      })
      // console.log('END 2??')
      // this.peer.signal({ candidate: '' })
      onSignallingSuccess()
    }

    send(message: string) {
      if (localStorage.getItem('PRINT_STRINGIFY_TIMES') === '1' && message.length >= 1_000_000) {
        const json = JSON.parse(message)
        const startTime = performance.now()
        const serialized = JSON.stringify(json)
        const endTime = performance.now()
        const mb = serialized.length / 1_000_000
        const millis = endTime - startTime
        const mbPerSecond = Math.round(mb / (millis / 1000))
        console.log(`${Math.round(mb)}MB serialized in ${Math.round(millis)}ms = ${mbPerSecond} MB/s`)
      }

      let files = []
      const parsedMessage = JSON.parse(message);

      let normalizedMessage = message;
      if (parsedMessage.payload?.variables != null) {
        let fileIndex = 0;
        const normalizeVariables = (varsWithFiles) => (
          Object.fromEntries(Object.entries(varsWithFiles).map(([key, val]) => {
            if (typeof val === 'string' && val.startsWith('#__graphql_file__:')) {
              const file = options.files.get(val)
              options.files.delete(val)

              if (file == null) {
                throw new Error(`File pointer missing for file upload: ${val}`)
              }

              files.push(file)

              const pointer = `#__graphql_file__:${fileIndex}`
              fileIndex += 1;
              return [key, pointer];
            } else if (val instanceof Array) {
              return [key, val.map(normalizeVariables)]
            } else if (typeof val === 'object' && val != null) {
              return [key, normalizeVariables(val)]
            } else {
              // not a file, just pass the value through
              return [key, val];
            }
          }))
        );

        const normalizedVariables = normalizeVariables(parsedMessage.payload.variables);

        normalizedMessage = JSON.stringify({
          ...parsedMessage,
          payload: {
            ...parsedMessage.payload,
            variables: normalizedVariables,
          },
        })

        if (files.length > 0) {
          console.log(`Uploading ${files.length} files, ${options.files.size} remain unsent`)
          console.log(files)
        }
      }

      // console.log(`SEND: ${message}`)
      this.chunkifier(normalizedMessage, files)
    }

    private beforeCloseOrError() {
      this.readyState = WebRTCSocket.CLOSED
      this.peer?.destroy()
    }

    private innerHandleError(error: any, { unrecoverable = false, code = null } = {}) {
      if (this.readyState == WebRTCSocket.CLOSED) {
        return
      }

      // console.log("WebRTCSocket Error", error)
      this.beforeCloseOrError()

      const socketError = new CloseEvent('error', {
        reason: error.message,
        code: code || (unrecoverable ? 4400 : 4000),
      })
      // console.log({ socketError })

      this.listeners.error?.forEach(listener => listener(socketError))
      this.onerror(socketError)

      this.onclose(socketError)
    }

    private innerClose(error: any, code: number = 4000) {
      if (this.readyState == WebRTCSocket.CLOSED) {
        return
      }

      // console.log("WebRTCSocket Close", error)
      this.beforeCloseOrError()

      const socketError = {
        reason: error.message,
        code,
      }

      this.onclose(new CloseEvent(error?.message, socketError))
    }

    close(code: number, message: string) {
      // console.log(`APOLLO HAS DECIDED TO CLOSE THE CONNECTION (code: ${code})`)
      if (code !== 1000) {
        console.warn(`WebRTCSocket closed with code: ${code}, message: ${message}`)
      }
      this.innerClose({ message }, code)
    }

    addEventListener(eventName: string, listener: any) {
      if (!EVENT_NAMES.includes(eventName)) {
        console.warn(`Listener added for un-triggered event: ${eventName}`)
      }
      this.listeners[eventName] = this.listeners[eventName] || []
      this.listeners[eventName].push(listener)
    }

    removeEventListener(eventName: string, listener: any) {
      this.listeners[eventName] = this.listeners[eventName].filter(lsnr => lsnr != listener)
    }

    onerror(err) {}
    onclose(event) {}
    async onopen() {}
    onmessage(message: { data: string }) {}
  }
}

export default socketFactory
