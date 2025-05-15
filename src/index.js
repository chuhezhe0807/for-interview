import { createRoot } from 'react-dom/client'

import { App } from './App'
import './styles.css'
function Root() {
  return (
    <>
      <App />
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', color: "white" }}>
        <a href="https://pmnd.rs/" style={{ position: 'absolute', bottom: 40, left: 90, fontSize: '13px', color: "white" }}>
          bowen pmnd.rs
          <br />
          dev collective
        </a>
        <div style={{ position: 'absolute', bottom: 40, right: 40, fontSize: '13px' }}>07/05/2025</div>
      </div>{' '}
    </>
  )
}

createRoot(document.getElementById('root')).render(<Root />)
