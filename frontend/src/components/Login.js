import React, { useState, useEffect } from 'react';
import {
  signInWithRedirect,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged
} from 'firebase/auth';

import { auth, googleProvider } from '../firebase';
import '../index.css';

const BACKEND =
  process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

function Login() {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // -----------------------------
  // BACKEND SYNC
  // -----------------------------
  const syncWithBackend = async (firebaseUser) => {
    const token = await firebaseUser.getIdToken();

    await fetch(`${BACKEND}/api/auth/google`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  };

  // -----------------------------
  // HANDLE GOOGLE REDIRECT RETURN
  // -----------------------------
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);

        if (result?.user) {
          await syncWithBackend(result.user);
          window.location.href = '/singleplayer.html';
        }
      } catch (err) {
        console.error(err);
      }
    };

    handleRedirect();
  }, []);

  // -----------------------------
  // AUTO LOGIN CHECK
  // -----------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const guest = sessionStorage.getItem('detox_guest');

      if (user || guest) {
        window.location.href = '/singleplayer.html';
      }
    });

    return () => unsubscribe();
  }, []);

  // -----------------------------
  // GOOGLE LOGIN
  // -----------------------------
  const handleGoogle = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // EMAIL LOGIN
  // -----------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      await syncWithBackend(result.user);

      window.location.href = '/singleplayer.html';
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // REGISTER
  // -----------------------------
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return setError('Enter your name');
    }

    setLoading(true);
    setError('');

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await result.user.updateProfile({
        displayName: name.trim()
      });

      await syncWithBackend(result.user);

      window.location.href = '/singleplayer.html';
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // GUEST LOGIN
  // -----------------------------
  const handleGuest = async (e) => {
    e.preventDefault();

    if (guestName.trim().length < 2) {
      return setError('Name must be at least 2 characters');
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${BACKEND}/api/auth/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          displayName: guestName.trim()
        })
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.error);

      sessionStorage.setItem(
        'detox_guest',
        JSON.stringify({
          ...data.user,
          isGuest: true
        })
      );

      window.location.href = '/singleplayer.html';
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="page-center">
      <div className="max-w-sm">

        <div className="text-center mb-8">
          <div className="logo">
            Detox<span>ism</span>
          </div>
          <div className="tagline">
            Game your way to better social health
          </div>
        </div>

        <div className="card-box">

          {/* Tabs */}
          <div className="tabs">
            {['login', 'register', 'guest'].map((t) => (
              <button
                key={t}
                className={tab === t ? 'active' : ''}
                onClick={() => {
                  setTab(t);
                  setError('');
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {error && (
            <div className="error-box">{error}</div>
          )}

          {/* Google */}
          {tab !== 'guest' && (
            <>
              <button
                className="btn-google"
                onClick={handleGoogle}
                disabled={loading}
              >
                Continue with Google
              </button>

              <div className="divider">OR</div>
            </>
          )}

          {/* LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLogin}>
              <input
                className="input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

              <input
                className="input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

              <button className="btn" type="submit">
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
          )}

          {/* REGISTER */}
          {tab === 'register' && (
            <form onSubmit={handleRegister}>
              <input
                className="input"
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
              />

              <input
                className="input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

              <input
                className="input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                minLength={6}
              />

              <button className="btn" type="submit">
                {loading
                  ? 'Creating...'
                  : 'Create Account'}
              </button>
            </form>
          )}

          {/* GUEST */}
          {tab === 'guest' && (
            <form onSubmit={handleGuest}>
              <input
                className="input"
                type="text"
                placeholder="Guest name"
                value={guestName}
                onChange={(e) =>
                  setGuestName(e.target.value)
                }
                required
              />

              <button className="btn" type="submit">
                {loading ? 'Joining...' : 'Play'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

export default Login;