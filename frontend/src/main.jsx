/**
 * @file Punto de entrada de la aplicacion React.
 *
 * Monta `<App />` en el elemento `#root` del HTML con `StrictMode`
 * habilitado para detectar problemas en desarrollo.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);