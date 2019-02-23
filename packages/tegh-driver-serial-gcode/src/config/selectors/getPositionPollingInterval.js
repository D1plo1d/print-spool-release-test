import { createSelector } from 'reselect'
import { getController } from '@tegh/core'

const getPollingInterval = createSelector(
  getController,
  controller => controller.model.get('positionPollingInterval'),
)

export default getPollingInterval
