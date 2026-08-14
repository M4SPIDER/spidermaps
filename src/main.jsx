import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app.jsx'

import './index.css' // <-- This line is essential. It loads all the styles.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)



