import React from 'react'
import { compose, withProps } from 'recompose'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import gql from 'graphql-tag'

import {
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core'

import UpdateDialog, { UPDATE_DIALOG_FRAGMENT } from './components/UpdateDialog/Index'

import withLiveData from '../shared/higherOrderComponents/withLiveData'

import transformComponentSchema from './printerComponents/transformComponentSchema'
import useMachineDefSuggestions from '../../../common/hooks/useMachineDefSuggestions'

const DEVICES_SUBSCRIPTION = gql`
  subscription DevicesSubscription {
    live {
      patch { op, path, from, value }
      query {
        teghVersion
        hasPendingUpdates
        devices {
          id
          type
        }
        printers {
          id
          status
        }
      }
    }
  }
`

const enhance = compose(
  withRouter,
  withProps(({ match }) => ({
    printerID: match.params.printerID,
    printerDialogOpen: match.path === '/:hostID/:printerID/config/printer/',
    subscription: DEVICES_SUBSCRIPTION,
  })),
  withLiveData,
  Component => (props) => {
    const {
      suggestions: machineDefSuggestions,
      loading: loadingMachineDefs,
    } = useMachineDefSuggestions()

    const nextProps = {
      ...props,
      machineDefSuggestions,
      loadingMachineDefs,
    }

    return (
      <Component {...nextProps} />
    )
  }
)

const ConfigPage = ({
  printerID,
  printerDialogOpen = false,
  teghVersion,
  hasPendingUpdates,
  devices,
  printers,
  loading,
  machineDefSuggestions,
  loadingMachineDefs,
}) => (
  <main>
    {
      printerDialogOpen && !loading && !loadingMachineDefs && (
        <UpdateDialog
          title="3D Printer"
          collection="MACHINE"
          open={printerDialogOpen}
          variables={{ printerID }}
          status={printers[0].status}
          hasPendingUpdates={hasPendingUpdates}
          transformSchema={schema => transformComponentSchema({
            schema,
            materials: [],
            devices,
            machineDefSuggestions,
          })}
          query={gql`
            query($printerID: ID!) {
              printers(printerID: $printerID) {
                configForm {
                  ...UpdateDialogFragment
                }
              }
            }
            ${UPDATE_DIALOG_FRAGMENT}
          `}
        />
      )
    }
    <List component="nav">
      <ListItem divider>
        <ListItemText
          primary={`Tegh v${teghVersion}`}
          secondary={
            (
              hasPendingUpdates
              && 'Updates Pending. Please empty job queue to auto-update.'
            )
            || 'Tegh is up to date and running the latest version available.'
          }
        />
      </ListItem>
      <ListItem
        button
        component={props => <Link to="printer/" {...props} />}
      >
        <ListItemText primary="3D Printer" />
      </ListItem>
      <ListItem
        button
        component={props => <Link to="components/" {...props} />}
      >
        <ListItemText primary="Components" />
      </ListItem>
      <ListItem
        button
        component={props => <Link to="plugins/" {...props} />}
      >
        <ListItemText primary="Plugins" />
      </ListItem>
      <ListItem
        button
        component={props => <Link to="materials/" {...props} />}
      >
        <ListItemText primary="Materials" />
      </ListItem>
    </List>
  </main>
)

export const Component = ConfigPage
export default enhance(ConfigPage)
