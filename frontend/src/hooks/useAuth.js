import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check guest FIRST before waiting for Firebase
    const guest = sessionStorage.getItem('detox_guest');
    if (guest) {
      setUser(JSON.parse(guest));
      setLoading(false);
      return;
    }

    // Only wait for Firebase if no guest
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
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