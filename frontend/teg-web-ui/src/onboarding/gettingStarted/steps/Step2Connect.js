import React from 'react'

import {
  Typography,
  TextField,
} from '@material-ui/core'

import QRReader from 'react-qr-reader'

// import { parseInviteCode } from 'graphql-things/client'
// import { parseInviteCode } from 'graphql-things'
import base64url from 'base64url'

import Step2ConnectStyles from './Step2ConnectStyles'

import ButtonsFooter from '../ButtonsFooter'

const Step2Connect = ({
  className,
  history,
}) => {
  const classes = Step2ConnectStyles()

  const onSubmit = (inviteString) => {
    // let sanitizedInviteString = inviteString
    //   .replace(/[\n ]/g, '')
    //   .replace(/.*\/i\//, '')
    // sanitizedInviteString = base64url.toBase64(sanitizedInviteString)

    // const invite = parseInviteCode(sanitizedInviteString)

    // if (invite == null) return

    const params = new URLSearchParams()

    // params.set('invite', base64url.fromBase64(sanitizedInviteString))

    params.set('invite', inviteString)

    history.push(`/get-started/3?${params.toString()}`)
  }

  const onTextChange = (event) => {
    const inviteString = event.target.value
    if (inviteString == null || inviteString.length === 0) return
    onSubmit(inviteString)
  }

  const onScan = (scan) => {
    if (scan != null) onSubmit(scan)
  }

  const onError = (error) => {
    // eslint-disable-next-line no-console
    console.error(error)
  }

  return (
    <React.Fragment>
      <div className={className}>
        <div className={classes.root}>
          <Typography variant="h5" paragraph>
            Connect to your 3D Printer
          </Typography>
          <Typography variant="body1" paragraph>
            Scan or copy the Invite Code from your Raspberry Pi&apos;s terminal to establish a secure connection.
          </Typography>
          <Typography variant="h6">
            Scan your Invite QR Code
          </Typography>
          <div className={classes.qrCodeContainer}>
            <QRReader
              onScan={onScan}
              onError={onError}
              className={classes.qrCode}
            />
          </div>
          <TextField
            label="Or paste the Invite text"
            margin="normal"
            onChange={onTextChange}
          />
        </div>
      </div>
      <ButtonsFooter step={2} disable history={history} />
    </React.Fragment>
  )
}

export default Step2Connect
