import './assets/main.css';
import './utils/i18n';

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';

const init = () => {
  return localStorage.getItem('theme') || 'light';
}

const Root = () => {
  const [theme] = useState(init);

  useEffect(() => {
    // Cambiar el atributo data-bs-theme en el body
    document.body.setAttribute("data-bs-theme", theme);
    localStorage.setItem('theme', theme);

  }, [theme]);


  return (
    <>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </>
  );
};

// Usando el nuevo método ReactDOM.createRoot
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("El elemento raíz con id 'root' no fue encontrado.");
}
const root = ReactDOM.createRoot(rootElement);
root.render(<Root />);