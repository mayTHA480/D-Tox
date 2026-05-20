import { useState, useEffect, useRef, useCallback } from 'react';
import { socket } from '../socket';

export function useMultiplayer(user) {
  const [roomState, setRoomState]   = useState(null);
  const [phase, setPhase]           = useState('lobby'); // lobby | waiting | playing | gameover
  const [selected, setSelected]     = useState([]);
  const [log, setLog]               = useState([]);
  const [gameOver, setGameOver]     = useState(null);
  const [status, setStatus]         = useState('');
  const [error, setError]           = useState('');
  const mySocketId                  = useRef(null);

  const addLog = (msg) => setLog(prev => [msg, ...prev].slice(0, 8));

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => { mySocketId.current = socket.id; });

    socket.on('room_joined', ({ roomCode }) => {
      setPhase('waiting');
      setStatus(`Room ${roomCode} — waiting for players...`);
    });

    socket.on('room_update', (state) => {
      setRoomState(state);
      setStatus(`Waiting for players... (${state.players.length}/${state.playerCount})`);
    });

    socket.on('game_start', (state) => {
      setRoomState(state);
      setPhase('playing');
      updateTurnStatus(state);
    });

    socket.on('card_played', ({ displayName, cards, target, effect }) => {
      const tLabel = target === 'self' ? 'themselves'
                   : target === mySocketId.current ? 'you' : 'opponent';
      addLog(`${displayName} played ${cards.map(c => c.name).join(' + ')} on ${tLabel} (${effect >= 0 ? '+' : ''}${effect} HP)`);
    });

    socket.on('turn_update', (state) => {
      setRoomState(state);
      updateTurnStatus(state);
    });

    socket.on('game_over', (data) => {
      setGameOver(data);
      setPhase('gameover');
    });

    socket.on('player_left', ({ message }) => {
      addLog(`⚠️ ${message}`);
      setStatus(message);
    });

    socket.on('error', ({ message }) => setError(message));

    return () => socket.disconnect();
  }, []);

  function updateTurnStatus(state) {
    const current = state.players[state.currentTurnIndex];
    if (current?.socketId === mySocketId.current) {
      setStatus('Your turn! Select cards to play.');
    } else {
      setStatus(`Waiting for ${current?.displayName}...`);
    }
  }

  const createRoom = useCallback((playerCount) => {
    if (!user) return;
    setError('');
    socket.emit('create_room', {
      playerCount,
      userId:      user.uid || user.firebase_uid,
      displayName: user.displayName || user.display_name,
      photoUrl:    user.photoURL || user.photo_url || null,
    });
  }, [user]);

  const joinRoom = useCallback((roomCode) => {
    if (!user) return;
    setError('');
    socket.emit('join_room', {
      roomCode:    roomCode.toUpperCase(),
      userId:      user.uid || user.firebase_uid,
      displayName: user.displayName || user.display_name,
      photoUrl:    user.photoURL || user.photo_url || null,
    });
  }, [user]);

  const toggleCard = useCallback((idx) => {
    if (!roomState) return;
    const myPlayer = roomState.players.find(p => p.socketId === mySocketId.current);
    if (!myPlayer) return;
    const card = myPlayer.hand[idx];
    setSelected(prev => {
      if (prev.includes(idx)) return prev.filter(i => i !== idx);
      if (card.type === 'double') return prev.length === 0 ? [idx] : prev;
      if (prev.length === 0) return [idx];
      if (prev.length === 1 && myPlayer.hand[prev[0]].type !== 'double') return [...prev, idx];
      return prev;
    });
  }, [roomState]);

  const playCards = useCallback((target) => {
    if (selected.length === 0 || !roomState) return;
    socket.emit('play_cards', { roomCode: roomState.roomCode, cardIndices: selected, target });
    setSelected([]);
  }, [selected, roomState]);

  const isMyTurn = roomState
    ? roomState.players[roomState.currentTurnIndex]?.socketId === mySocketId.current
    : false;

  const myPlayer = roomState?.players.find(p => p.socketId === mySocketId.current);
  const opponents = roomState?.players.filter(p => p.socketId !== mySocketId.current) || [];

  return {
    roomState, phase, selected, log, gameOver, status, error,
    mySocketId, myPlayer, opponents, isMyTurn,
    createRoom, joinRoom, toggleCard, playCards,
  };
}
