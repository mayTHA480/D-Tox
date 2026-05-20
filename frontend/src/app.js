import React from 'react';
import ReactDOM from 'react-dom/client';
import Login from './components/Login';
import SinglePlayer from './components/SinglePlayer';
import './index.css';

// Check if guest or Firebase user is already logged in
const guest = sessionStorage.getItem('detox_guest');

// Route based on current page path
const path = window.location.pathname;

const root = ReactDOM.createRoot(document.getElementById('root'));

if (path.includes('singleplayer')) {
  // Only allow access if logged in
  if (!guest) {
    window.location.href = '/singleplayer';
  } else {
    root.render(
      <React.StrictMode>
        <SinglePlayer />
      </React.StrictMode>
    );
  }
} else {
  // Default: show Login page
  root.render(
    <React.StrictMode>
      <Login />
    </React.StrictMode>
  );
}