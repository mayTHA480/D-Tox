// import React from 'react';
// import ReactDOM from 'react-dom/client';
// // import Login from './components/Login';
// // import SinglePlayer from './components/SinglePlayer';
// import Multiplayer from './components/Multiplayer';
// import './index.css';

// Route to the right component based on current page URL
// const path = window.location.pathname;
// const root = document.getElementById('root');

// if (path.includes('singleplayer')) {
//   ReactDOM.createRoot(root).render(<SinglePlayer />);
// } else if (path.includes('multiplayer')) {
//   ReactDOM.createRoot(root).render(<Multiplayer />);
// } else {
//   ReactDOM.createRoot(root).render(<Login />);
// }
import React from 'react';
import ReactDOM from 'react-dom/client';
import SinglePlayer from './components/SinglePlayer';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<SinglePlayer />);