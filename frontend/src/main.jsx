import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';  // Optional: If you have global styles

// Get the root element in the HTML file to render the React app
const rootElement = document.getElementById('root');

// Create a root to render the React app into
const root = ReactDOM.createRoot(rootElement);

// Render the App component
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
