import React from 'react';
import ReactDOM from 'react-dom/client';
import Login from './components/Login';
import SinglePlayer from './components/SinglePlayer';
import './index.css';

const guest = sessionStorage.getItem('detox_guest');
const path = window.location.pathname;

const root = ReactDOM.createRoot(document.getElementById('root'));

if (path.includes('singleplayer')) {
  if (!guest) {
    window.location.href = '/';
  } else {
    root.render(
      <React.StrictMode>
        <SinglePlayer />
      </React.StrictMode>
    );
  }
} else {
  root.render(
    <React.StrictMode>
      <Login />
    </React.StrictMode>
  );
}