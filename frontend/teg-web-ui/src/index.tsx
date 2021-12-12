import 'regenerator-runtime/runtime'

import React from 'react'
import ReactDOM from 'react-dom'
// import { ReduxSnackbar } from '@d1plo1d/material-ui-redux-snackbar'
// import { ApolloProvider } from 'react-apollo

// eslint-disable-next-line import/first
import App from './App'

// eslint-disable-next-line no-undef
const wrapper = document.getElementById('teg-app')
ReactDOM.render(<App />, wrapper)

export default App
