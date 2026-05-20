import React from 'react';

function ScoreBox({ label, hp, maxHP, color, isActive, photoURL }) {
  const pct = Math.max(0, Math.min(100, (hp / maxHP) * 100));
  return (
    <div className={`score-box ${isActive ? 'active' : ''}`}>
      <div className="score-label-row">
        {photoURL && <img src={photoURL} alt="" style={{ width:18, height:18, borderRadius:'50%' }} />}
        <div className="score-label">{label}</div>
      </div>
      <div className={color === 'blue' ? 'score-num-blue' : 'score-num-pink'}>{Math.max(0, hp)}</div>
      <div className="score-bar-bg">
        <div className={`score-bar ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ScoreBoard({ players, maxHP }) {
  if (players.length === 2) {
    return (
      <div className="scoreboard-2">
        <ScoreBox {...players[0]} maxHP={maxHP} color="blue" />
        <div className="flex-center"><div className="vs-badge">VS</div></div>
        <ScoreBox {...players[1]} maxHP={maxHP} color="pink" />
      </div>
    );
  }
  return (
    <div className="scoreboard-n" style={{ gridTemplateColumns: `repeat(${players.length}, 1fr)` }}>
      {players.map((p, i) => <ScoreBox key={i} {...p} maxHP={maxHP} color={i === 0 ? 'blue' : 'pink'} />)}
    </div>
  );
}
