import React, { useMemo, useEffect } from 'react'
import {
  Route,
  Switch,
  Redirect,
  useLocation,
} from 'react-router'

import { useAuth } from './common/auth'

import LandingPage from './onboarding/landingPage/LandingPage'
import PrivacyPolicy from './onboarding/privacyPolicy/PrivacyPolicy'
import LoginRegister from './onboarding/loginRegister/LoginRegister'

import Home from './printer/home/Home'
import UserAccount from './printer/userAccount/UserAccount'
import Terminal from './printer/terminal/Terminal.page'

import ConnectionFrame from './printer/common/frame/ConnectionFrame'
import QueuePage from './printer/jobQueue/JobQueue.page'
import PartPage from './printer/part/Job.page'
import EditPartPage from './printer/part/edit/EditPart.page'
import PrintHistoryPage from './printer/part/printHistory/PrintHistory.page'
import StarredPage from './printer/starred/Starred.page'

import ConfigIndexPage from './printer/config/Config.page'
import ComponentsConfigPage from './printer/config/printerComponents/PrinterComponents.page'
import MaterialsConfigPage from './printer/config/materials/Materials.page'
import UsersConfigPage from './printer/config/users/User.page'
import InvitesConfigPage from './printer/config/invites/Invites.page'
import LatencyNotification from './printer/common/LatencyNotification'

const GettingStarted = React.lazy(() => (
  import('./onboarding/gettingStarted/GettingStarted')
))

const GraphQLPlayground = React.lazy(() => (
  import('./printer/graphqlPlayground/GraphQLPlayground')
))

const PrintDialog = React.lazy(() => (
  import('./printer/printDialog/PrintDialog')
))

const ManualControlPage = React.lazy(() => (
  import('./printer/manualControl/ManualControl.page')
))
const FilamentSwapDialog = React.lazy(() => (
  import('./printer/manualControl/filamentSwap/FilamentSwapDialog')
))

// const ConfigIndexPage = React.lazy(() => (
//  import('./printer/config/Config.page')
// ))
// const ComponentsConfigPage = React.lazy(() => (
//  import('./printer/config/printerComponents/PrinterComponents.page')
// ))
// const MaterialsConfigPage = React.lazy(() => (
//  import('./printer/config/materials/Materials.page')
// ))
// const UsersConfigPage = React.lazy(() => (
//  import('./printer/config/users/User.page')
// ))
// const InvitesConfigPage = React.lazy(() => (
//   import('./printer/config/invites/Invites.page')
// ))

const AuthRedirect = () => {
  // const urlWithToken = new URL(document.location.origin + document.location.hash.replace(/#/, '?'))
  // const params = Object.fromEntries(urlWithToken.searchParams)

  // const googleJWT = params.id_token

  // console.log({ googleJWT, params })

  // TODO: log the user in here

  const redirectURL = useMemo(() => {
    const url = localStorage.getItem('redirectURL') || '/'
    localStorage.removeItem('redirectURL')
    return url
  }, [])

  return (
    <Redirect to={redirectURL} />
  )
}

const Routes = () => {
  const loading = false

  const { isSignedIn } = useAuth()

  // console.log({ isSignedIn, loading })

  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  if (loading) {
    return <div />
  }

  return (
    <Switch>
      <Route
        exact
        path="/privacy-policy"
        component={PrivacyPolicy}
      />
      <Route
        exact
        path="auth"
      >
        <AuthRedirect />
      </Route>
      { !isSignedIn && (
        <Route>
          <Switch>
            <Route
              exact
              path="/"
            >
              <LandingPage />
            </Route>
            <Route>
              <LoginRegister />
            </Route>
          </Switch>
        </Route>
      )}
      { isSignedIn && (
        <Route exact path="/:m/:hostID/:machineID/graphql-playground/" component={GraphQLPlayground} />
      )}
      { isSignedIn && (
        <Route>
          <Switch>
            <Route
              exact
              path="/login"
            >
              <Redirect to="/" />
            </Route>
            <Route
              exact
              path="/i/:inviteURLCode"
              render={({ match }) => (
                <Redirect to={`/get-started/3?invite=${match.params.inviteURLCode}`} />
              )}
            />
            <Route
              exact
              path="/get-started/:step?"
              component={GettingStarted}
            />
            <Route
              exact
              path="/account"
            >
              <UserAccount />
            </Route>
            <Route
              exact
              path={['/', '/print/']}
              render={() => (
                <React.Fragment>
                  <Home />
                  {/* <Route
                    exact
                    path="/print/"
                    render={({ history, location }) => {
                      const hostID = new URLSearchParams(location.search).get('q')
                      const machineID = new URLSearchParams(location.search).get('m')

                      return (
                        <React.Suspense fallback={<div />}>
                          <PrintDialog
                            history={history}
                            match={{ params: { hostID, machineID } }}
                          />
                        </React.Suspense>
                      )
                    }}
                  /> */}
                </React.Fragment>
              )}
            />
            <Route
              path={[
                '/m/:hostID/:machineID/',
                // '/q/:hostID/',
              ]}
              render={({ match }) => (
                <ConnectionFrame match={match}>
                  <LatencyNotification />

                  <Route
                    exact
                    path="/:m/:hostID/:machineID/"
                    component={QueuePage}
                  />
                  <Route exact strict path="/:m/:hostID/:machineID/printing/:partID/" component={PartPage} />
                  <Route exact strict path="/:m/:hostID/:machineID/printing/:partID/print-history" component={PrintHistoryPage} />
                  <Route exact strict path="/:m/:hostID/:machineID/printing/:partID/settings" component={EditPartPage} />

                  <Route exact strict path="/:m/:hostID/:machineID/starred/" component={StarredPage} />

                  <Route
                    path="/m/:hostID/:machineID/manual-control/"
                    component={ManualControlPage}
                  />

                  <React.Suspense fallback={<div />}>
                    <Route
                      exact
                      path="/m/:hostID/:machineID/manual-control/swap-filament/:componentID"
                      component={FilamentSwapDialog}
                    />
                  </React.Suspense>

                  <Route exact path="/m/:hostID/:machineID/terminal/" component={Terminal} />

                  <Route
                    exact
                    path={[
                      '/m/:hostID/:machineID/config/',
                      '/m/:hostID/:machineID/config/machine/',
                    ]}
                    component={ConfigIndexPage}
                  />
                  <Route
                    exact
                    path={[
                      '/m/:hostID/:machineID/config/components/',
                      '/m/:hostID/:machineID/config/components/:componentID/',
                      '/m/:hostID/:machineID/config/components/:componentID/:verb',
                    ]}
                    component={ComponentsConfigPage}
                  />
                  <Route
                    exact
                    path={[
                      '/m/:hostID/:machineID/config/materials/',
                      '/m/:hostID/:machineID/config/materials/:materialID/',
                      '/m/:hostID/:machineID/config/materials/:materialID/:verb',
                    ]}
                    component={MaterialsConfigPage}
                  />
                  <Route
                    exact
                    path={[
                      '/m/:hostID/:machineID/config/users/',
                      '/m/:hostID/:machineID/config/users/:userID/',
                      '/m/:hostID/:machineID/config/users/:userID/:verb',
                    ]}
                    component={UsersConfigPage}
                  />
                  <Route
                    exact
                    path={[
                      '/m/:hostID/:machineID/config/invites/',
                      '/m/:hostID/:machineID/config/invites/:inviteID/',
                      '/m/:hostID/:machineID/config/invites/:inviteID/:verb',
                    ]}
                    component={InvitesConfigPage}
                  />
                </ConnectionFrame>
              )}
            />
          </Switch>
        </Route>
      )}
    </Switch>
  )
}

export default Routes
