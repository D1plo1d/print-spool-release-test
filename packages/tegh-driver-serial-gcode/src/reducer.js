import { throwErrorOnInvalidGCode } from './txParser.js'

const initializeCollection = (arrayOfIDs, initialValueFn) => {
  return arrayOfIDs.reduce(
    (collection, id) => {
      collection[id] = initialValueFn(id)
      return collection
    },
    {}
  )
}

const initialState = (config) => ({
  targetTemperaturesCountdown: null,
  heaters: initializeCollection(config.heaters, (id) => ({
    id,
    currentTemperature: 0,
    targetTemperature: null,
    blocking: false,
  })),
  fans: initializeCollection(config.fans, (id) => ({
    id,
    enabled: false,
    speed: 0,
  })),
  // 'errored', 'estopped', 'disconnected', 'connecting', 'ready'
  status: 'disconnected',
  error: null,
  currentLineNumber: 1,
})

const serialGCodeReducer = ({ config }) => (
  state = initialState(config),
  action
) => {
  switch(action.type) {
    case 'DRIVER_ERROR':
      return {
        ...initialState(config),
        status: 'errored',
        error: action.error,
      }
    case 'ESTOP':
      return {
        ...initialState(config),
        status: 'estopped',
      }
    case 'SERIAL_CLOSE':
      return {
        ...initialState(config),
        status: 'disconnected',
      }
    case 'SERIAL_OPEN':
      return {
        ...initialState(config),
        status: 'connecting',
      }
    case 'PRINTER_READY':
      return {
        ...initialState(config),
        status: 'ready',
      }
    case 'SERIAL_RECEIVE':
      if (action.data.type === 'greeting') {
        return {
          ...initialState(config),
          status: 'connecting',
        }
      }
      if (action.data.temperatures != null) {
        const heaters = {...state.heaters}
        Object.entries(action.data.temperatures).forEach(([k, v]) => {
          heaters[k] = {...heaters[k], currentTemperature: v}
        })
        const {targetTemperaturesCountdown} = action.data
        return {
          ...state,
          targetTemperaturesCountdown,
          heaters,
        }
      }
      return state
    case 'SPOOL':
      throwErrorOnInvalidGCode(action.task.data)
      return state
    case 'SERIAL_SEND':
      const {lineNumber, collectionKey, id, changes} = action
      const nextState = {
        ...state,
      }
      if (typeof lineNumber === 'number') {
        nextState.currentLineNumber = lineNumber + 1
      }
      if (collectionKey == null) return nextState
      // update the heater or fan's state.
      return {
        ...nextState,
        [collectionKey]: {
          ...state[collectionKey],
          [id]: {
            ...state[collectionKey][id],
            ...changes,
          },
        },
      }
    default:
      return state
  }
}

export default serialGCodeReducer
