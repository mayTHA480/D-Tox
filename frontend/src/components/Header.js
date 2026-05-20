import React from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { displayName, photoURL, logout, isGuest } = useAuth();
  return (
    <div className="header">
      <a href="/"><span className="logo-sm">Detox<span>ism</span></span></a>
      <div className="header-nav">
        {!isGuest && (
          <div className="nav-user">
            {photoURL && <img src={photoURL} alt="" />}
            <span>{displayName}</span>
          </div>
        )}
        {isGuest && <span className="guest-badge">Guest</span>}
        <div className="nav-links">
          <a href="/singleplayer" className="nav-link blue">Solo</a>
          {!isGuest && <a href="/multiplayer" className="nav-link pink">Multiplayer</a>}
          <button className="nav-link gray" onClick={logout}>Sign out</button>
        </div>
      </div>
    </div>
  );
}
