import React from 'react';
import ReactDOM from 'react-dom/client';
import Login from './components/Login';
import SinglePlayer from './components/SinglePlayer';
import Multiplayer from './components/Multiplayer';
import './index.css';

// Route to the right component based on which root div exists
const loginRoot = document.getElementById('root-login');
const singleRoot = document.getElementById('root-singleplayer');
const multiRoot = document.getElementById('root-multiplayer');

if (loginRoot) {
  ReactDOM.createRoot(loginRoot).render(<Login />);
} else if (singleRoot) {
  ReactDOM.createRoot(singleRoot).render(<SinglePlayer />);
} else if (multiRoot) {
  ReactDOM.createRoot(multiRoot).render(<Multiplayer />);
}
