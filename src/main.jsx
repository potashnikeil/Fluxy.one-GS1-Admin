import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'  // Импорт CSS, который должен быть для Tailwind
import App from './App'  // Импорт главного компонента App

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />  {/* Рендерим компонент App */}
  </React.StrictMode>
)
