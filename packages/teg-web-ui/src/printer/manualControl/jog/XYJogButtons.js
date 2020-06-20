import React, { useState } from 'react'
import {
  Card,
  CardContent,
  Grid,
} from '@material-ui/core'

import ArrowForward from '@material-ui/icons/ArrowForward'
import ArrowBack from '@material-ui/icons/ArrowBack'
import ArrowUpward from '@material-ui/icons/ArrowUpward'
import ArrowDownward from '@material-ui/icons/ArrowDownward'

import useJog from '../../_hooks/useJog'

import JogButton from './JogButton'
import JogDistanceButtons from './JogDistanceButtons'
import useContinuousMove from '../../_hooks/useContinuousMove'

const CONTINUOUS = 'Continuous'

const XYJogButtons = ({ machine }) => {
  const distanceOptions = [1, 10, 100, CONTINUOUS]
  const [distance, onChange] = useState(CONTINUOUS)

  const isContinuous = distance === CONTINUOUS

  let jog = useJog({ machine, distance })
  jog = isContinuous ? () => null : jog

  const continuousMove = useContinuousMove({ machine })
  const startContinuous = isContinuous ? continuousMove.start : () => null

  const { swapXAndYOrientation } = machine

  const axes = swapXAndYOrientation ? ['y', 'x'] : ['x', 'y']

  return (
    <Card>
      <CardContent>
        <Grid
          container
        >
          <JogDistanceButtons
            distanceOptions={distanceOptions}
            input={{
              value: distance,
              onChange,
            }}
          />
          <JogButton
            xs={12}
            onClick={jog('y', -1)}
            onMouseDown={startContinuous({ [axes[1]]: { forward: false } })}
          >
            <ArrowUpward />
          </JogButton>
          <JogButton
            xs={4}
            onClick={jog('x', -1)}
            onMouseDown={startContinuous({ [axes[0]]: { forward: false } })}
          >
            <ArrowBack />
          </JogButton>
          <JogButton xs={4} disabled>
            XY
          </JogButton>
          <JogButton
            xs={4}
            onClick={jog('x', 1)}
            onMouseDown={startContinuous({ [axes[0]]: { forward: true } })}
          >
            <ArrowForward />
          </JogButton>
          <JogButton
            xs={12}
            onClick={jog('y', 1)}
            onMouseDown={startContinuous({ [axes[1]]: { forward: true } })}
          >
            <ArrowDownward />
          </JogButton>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default XYJogButtons
