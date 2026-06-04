
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// This comment is added to help bust browser cache.
// If you are still seeing SyntaxError, please ensure you've cleared your browser's cache completely.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
    