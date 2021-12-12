import React from 'react'

import Switch from '@material-ui/core/Switch'
import FormControlLabel from '@material-ui/core/FormControlLabel'

import useExecGCodes from '../_hooks/useExecGCodes'

const MotorsEnabled = ({
  machine,
}) => {
  const toggleMotorsEnabled = useExecGCodes(() => ({
    machine,
    gcodes: [
      { toggleMotorsEnabled: { enable: !machine.motorsEnabled } },
    ],
  }))

  return (
    <FormControlLabel
      style={{
        marginBottom: 16,
      }}
      control={
        <Switch
          checked={machine.motorsEnabled}
          onChange={toggleMotorsEnabled}
          aria-label="motor-power"
        />
      }
      label="Enable Motors"
    />
  )
}

export default MotorsEnabled
