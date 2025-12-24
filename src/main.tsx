import React from 'react'
import ReactDOM from 'react-dom/client'

// Runtime shims (must be first)
import 'src/shims/runtime-globals'

// i18n
import 'src/configs/i18n'

// Prismjs Styles
import 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'

// React Perfect Scrollbar Style
import 'react-perfect-scrollbar/dist/css/styles.css'

// Iconify bundle
import 'src/iconify-bundle/icons-bundle-react'

// Global css styles
import '../styles/globals.css'

import App from './spa/App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
