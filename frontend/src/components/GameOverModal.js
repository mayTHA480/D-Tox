import React from 'react';

export default function GameOverModal({ winner, players, onPlayAgain, onLobby, isAI }) {
  const youWon = winner === 'You' || winner?.isYou;
  const isTie  = winner === 'Tie';
  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-title">
          {isTie ? "💫 It's a Tie!" : youWon ? '🌸 You Win!' : '💙 Game Over'}
        </div>
        <p className="modal-sub">
          {youWon ? 'Your wellness held strong — well played!'
            : isTie ? 'Balanced living is its own reward!'
            : 'Keep going, every day is a new chance to detox!'}
        </p>
        <div className="modal-scores">
          {players.map((p, i) => (
            <div key={i} className={`modal-score ${i === 0 ? 'blue' : 'pink'}`}>
              <div className={`modal-score-name ${i === 0 ? 'blue' : 'pink'}`}>{p.displayName}</div>
              <div className={`modal-score-hp ${i === 0 ? 'blue' : 'pink'}`}>{p.hp} HP</div>
            </div>
          ))}
        </div>
        {isAI ? (
          <button className="btn btn-blue" onClick={onPlayAgain}>Play Again ✦</button>
        ) : (
          <div className="modal-btns">
            <button className="btn btn-blue" onClick={onPlayAgain}>Play Again ✦</button>
            <button className="btn btn-gray" onClick={onLobby}>Back to Lobby</button>
          </div>
        )}
      </div>
    </div>
  );
}
