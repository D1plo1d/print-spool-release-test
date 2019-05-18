import React from 'react'
import { compose } from 'recompose'
import {
  Grid,
  Button,
} from '@material-ui/core'
import { Field, reduxForm, formValues } from 'redux-form'

import withJog from '../../higherOrderComponents/withJog'
import JogDistanceButtons from '../jog/JogDistanceButtons'

const enhance = compose(
  withJog,
  reduxForm({
    initialValues: {
      distance: 10,
    },
  }),
  formValues('distance'),
)

const ExtruderButtons = ({
  printer,
  address,
  distance,
  jog,
  disabled,
}) => (
  <Grid
    container
    spacing={8}
  >
    <Grid item sm={6}>
      <Field
        name="distance"
        component={JogDistanceButtons}
        distanceOptions={[0.1, 1, 10, 50, 100]}
      />
    </Grid>
    <Grid item sm={6}>
      <div style={{ textAlign: 'right' }}>
        <Button
          variant="contained"
          disabled={disabled}
          onClick={jog(printer.id, address, '-', distance)}
        >
          Retract
        </Button>
        <div style={{ display: 'inline-block', width: '16px' }} />
        <Button
          variant="contained"
          color="primary"
          disabled={disabled}
          onClick={jog(printer.id, address, '+', distance)}
        >
          Extrude
        </Button>
      </div>
    </Grid>
  </Grid>
)

export default enhance(ExtruderButtons)
