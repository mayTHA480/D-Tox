import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        // check guest in sessionStorage
        const guest = sessionStorage.getItem('detox_guest');
        setUser(guest ? JSON.parse(guest) : null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut(auth);
    sessionStorage.removeItem('detox_guest');
    setUser(null);
    window.location.href = '/index.html';
  };

  const isGuest = user?.isGuest === true;
  const displayName = user?.displayName || user?.display_name || 'Player';
  const photoURL = user?.photoURL || user?.photo_url || null;

  return { user, loading, logout, isGuest, displayName, photoURL };
}
