import React, { useState, useEffect } from 'react';
import { signInWithRedirect , createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import '../index.css';

const BACKEND = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

function Login() {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const guest = sessionStorage.getItem('detox_guest');
    if (guest || auth.currentUser) window.location.href = '/singleplayer';
  }, []);

  const syncWithBackend = async (firebaseUser) => {
    const token = await firebaseUser.getIdToken();
    await fetch(`${BACKEND}/api/auth/google`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
  };

  const handleGoogle = async () => {
    setLoading(true); setError('');
    try {
      const result = await signInWithRedirect(auth, googleProvider);
      await syncWithBackend(result.user);
      window.location.href = '/multiplayer.html';
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Enter your name');
    setLoading(true); setError('');
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await result.user.updateProfile({ displayName: name.trim() });
      await syncWithBackend(result.user);
      window.location.href = '/singleplayer';
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = '/singleplayer';
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleGuest = async (e) => {
    e.preventDefault();
    if (guestName.trim().length < 2) return setError('Name must be at least 2 characters');
    setLoading(true); setError('');
    try {
      const res = await fetch(`${BACKEND}/api/auth/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: guestName.trim() }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      sessionStorage.setItem('detox_guest', JSON.stringify({ ...data.user, isGuest: true }));
      window.location.href = '/singleplayer.html';
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-center">
      <div className="snowflake" style={{ left: '8%', animationDuration: '12s', fontSize: 18 }}>❄</div>
      <div className="snowflake" style={{ left: '80%', animationDuration: '9s', animationDelay: '3s', fontSize: 14 }}>❄</div>
      <div className="deco" style={{ bottom: 60, right: 48 }}>🩷</div>
      <div className="deco" style={{ top: 60, left: 48 }}>💙</div>

      <div className="max-w-sm">
        <div className="text-center mb-8">
          <div className="logo">Detox<span>ism</span></div>
          <div className="tagline">Game your way to better social health</div>
        </div>

        <div className="card-box">
          <div className="tabs">
            {['login','register','guest'].map(t => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`}
                onClick={() => { setTab(t); setError(''); }}>
                {t === 'login' ? 'Login' : t === 'register' ? 'Register' : 'Guest'}
              </button>
            ))}
          </div>

          {error && <div className="error-box">{error}</div>}

          {tab !== 'guest' && (
            <>
              <button className="btn-google" onClick={handleGoogle} disabled={loading}>
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continue with Google
              </button>
              <div className="divider"><div className="divider-line"/><span>OR</span><div className="divider-line"/></div>
            </>
          )}

          {tab === 'login' && (
            <form onSubmit={handleLogin}>
              <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
              <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              <button className="btn btn-blue" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Log In →'}</button>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister}>
              <input className="input" type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
              <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
              <input className="input" type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              <button className="btn btn-pink" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account ✦'}</button>
            </form>
          )}

          {tab === 'guest' && (
            <form onSubmit={handleGuest}>
              <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
                Try the game without an account! Solo mode only.
              </p>
              <input className="input" type="text" placeholder="Enter your name..." value={guestName} onChange={e => setGuestName(e.target.value)} maxLength={20} required />
              <button className="btn btn-blue" type="submit" disabled={loading}>{loading ? 'Joining...' : "Let's Play! 🎮"}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
