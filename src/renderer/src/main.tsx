// import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './assets/styles/main.scss'

import { HashRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // <React.StrictMode>
  <HashRouter>
    <App></App>
  </HashRouter>
  // </React.StrictMode>
)
