import React, { useEffect, useState } from 'react';
import Header from './Header';
import Card from './Card';
import ScoreBoard from './ScoreBoard';
import GameOverModal from './GameOverModal';
import { useMultiplayer } from '../hooks/useMultiplayer';
import { useAuth } from '../hooks/useAuth';
import '../index.css';

function Lobby({ onCreate, onJoin, error }) {
  const [tab, setTab] = useState('create');
  const [playerCount, setPlayerCount] = useState(2);
  const [joinCode, setJoinCode] = useState('');
  const maxHP = playerCount <= 2 ? 20 : 10;

  return (
    <div className="page-center">
      <div className="max-w-md">
        <div className="text-center mb-6">
          <div className="logo">Detox<span>ism</span></div>
          <div className="tagline">Multiplayer 🎮</div>
        </div>
        {error && <div className="error-box">{error}</div>}
        <div className="card-box">
          <div className="tabs">
            {['create','join'].map(t => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t === 'create' ? '✦ Create Room' : '↗ Join Room'}
              </button>
            ))}
          </div>
          {tab === 'create' ? (
            <>
              <p style={{ fontSize:11, fontWeight:800, color:'#9ca3af', textTransform:'uppercase', letterSpacing:2, marginBottom:8 }}>Players</p>
              <div className="player-count-grid">
                {[2,3,4].map(n => (
                  <button key={n} className={`count-btn ${playerCount === n ? 'active' : ''}`} onClick={() => setPlayerCount(n)}>
                    {n} Players
                  </button>
                ))}
              </div>
              <div className="hp-hint">{maxHP} HP each · {playerCount <= 2 ? 'Full wellness mode' : 'Quick match'}</div>
              <button className="btn btn-pink" style={{ marginTop:16 }} onClick={() => onCreate(playerCount)}>Create Room ✦</button>
            </>
          ) : (
            <>
              <input className="input-code" type="text" placeholder="AB3K9"
                value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} maxLength={5} />
              <button className="btn btn-blue" onClick={() => onJoin(joinCode)}>Join Room →</button>
            </>
          )}
        </div>
        <div style={{ marginTop:16, textAlign:'center' }}>
          <a href="/singleplayer" style={{ fontSize:12, fontWeight:800, color:'#7aaccf' }}>← Back to Solo</a>
        </div>
      </div>
    </div>
  );
}

function WaitingRoom({ roomCode, status, players, playerCount }) {
  return (
    <div className="page-center">
      <div className="card-box text-center max-w-sm">
        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:'#4a7bbf', marginBottom:8 }}>Room Code</div>
        <div className="room-code">{roomCode}</div>
        <button className="copy-btn" onClick={() => navigator.clipboard.writeText(roomCode)}>📋 Copy code</button>
        <p style={{ fontSize:13, fontWeight:700, color:'#9ca3af', marginBottom:12 }}>{status}</p>
        {players?.map((p, i) => (
          <div key={i} className="player-slot filled">
            {p.photoUrl && <img src={p.photoUrl} alt="" />}
            <span className="name">{p.displayName}</span>
            {i === 0 && <span className="host-badge">Host</span>}
          </div>
        ))}
        {Array.from({ length: Math.max(0, playerCount - (players?.length || 0)) }).map((_, i) => (
          <div key={i} className="player-slot empty">
            <span className="empty-name">Waiting for player...</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GameBoard({ roomState, myPlayer, opponents, isMyTurn, selected, log, gameOver, status, toggleCard, playCards, mySocketId }) {
  const [preview, setPreview] = useState(null);
  const maxHP = roomState.players.length <= 2 ? 20 : 10;
  const canPlay = selected.length > 0 && isMyTurn;

  return (
    <div className="page-game">
      <Header />
      <ScoreBoard
        players={roomState.players.map(p => ({
          label: p.displayName, hp: p.hp, photoURL: p.photoUrl,
          isActive: p.socketId === roomState.players[roomState.currentTurnIndex]?.socketId,
        }))}
        maxHP={maxHP}
      />
      <div className="status-bar">{status}</div>

      {opponents.map((opp, oi) => (
        <div key={oi}>
          <div className="section-label">{opp.displayName}'s Hand</div>
          <div className="hand-row">
            {Array.from({ length: opp.handCount }).map((_, i) => <div key={i} className="card-back">✦</div>)}
          </div>
        </div>
      ))}

      <div className="center-row">
        <div>
          <div className="pile-label">Deck</div>
          <div className="deck-pile">
            <div className="deck-num">{roomState.deckCount}</div>
            <div className="deck-txt">cards</div>
          </div>
        </div>
        <div>
          <div className="pile-label">Last Played</div>
          <div className="last-played"><span className="last-played-empty">—</span></div>
        </div>
      </div>

      <div>
        <div className="section-label section-label-blue">Your Hand</div>
        <div className="hand-row">
          {(myPlayer?.hand || []).map((card, idx) => (
            <Card key={idx} card={card} selected={selected.includes(idx)} disabled={!isMyTurn}
              onClick={() => toggleCard(idx)} onMouseEnter={setPreview} onMouseLeave={() => setPreview(null)} />
          ))}
        </div>
      </div>

      {isMyTurn && (
        <div className="action-panel">
          <div className="action-hint">
            {selected.length === 0 ? 'Select cards to play'
              : `${selected.length} card${selected.length > 1 ? 's' : ''} selected — play on:`}
          </div>
          <div className="action-row">
            <button className="btn-action blue" disabled={!canPlay} onClick={() => playCards('self')}>✦ Myself</button>
            {opponents.map(opp => (
              <button key={opp.socketId} className="btn-action pink" disabled={!canPlay}
                onClick={() => playCards(opp.socketId)}>✦ {opp.displayName}</button>
            ))}
          </div>
        </div>
      )}

      {log.length > 0 && (
        <div className="game-log">
          {log.map((l, i) => <div key={i} className="log-line">{l}</div>)}
        </div>
      )}

      {preview && (
        <div className="card-preview">
          <img src={require(`../images/detox${preview.id}.png`)} alt={preview.name} />
        </div>
      )}

      {gameOver && (
        <GameOverModal
          winner={{ isYou: gameOver.winner?.socketId === mySocketId }}
          players={gameOver.players.map(p => ({ displayName: p.displayName, hp: p.hp }))}
          onPlayAgain={() => window.location.reload()}
          onLobby={() => window.location.href = '/multiplayer'}
        />
      )}
    </div>
  );
}

export default function Multiplayer() {
  const { user, loading, isGuest } = useAuth();
  const { roomState, phase, selected, log, gameOver, status, error,
          mySocketId, myPlayer, opponents, isMyTurn,
          createRoom, joinRoom, toggleCard, playCards } = useMultiplayer(user);

  useEffect(() => {
    if (!loading && (!user || isGuest)) window.location.href = '/';
  }, [user, loading, isGuest]);

  if (loading || !user) return <div className="loading-screen"><div className="loading-dot">✦</div></div>;
  if (phase === 'lobby') return <Lobby onCreate={createRoom} onJoin={joinRoom} error={error} />;
  if (phase === 'waiting') return <WaitingRoom roomCode={roomState?.roomCode} status={status} players={roomState?.players} playerCount={roomState?.playerCount} />;

  return (
    <GameBoard roomState={roomState} myPlayer={myPlayer} opponents={opponents}
      isMyTurn={isMyTurn} selected={selected} log={log} gameOver={gameOver}
      status={status} toggleCard={toggleCard} playCards={playCards} mySocketId={mySocketId.current} />
  );
}
