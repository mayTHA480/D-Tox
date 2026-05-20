import React from 'react';

export default function Card({ card, selected, disabled, onClick, onMouseEnter, onMouseLeave }) {
  const imgSrc = require(`../images/detox${card.id}.png`);
  return (
    <div
      className={`game-card ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={() => !disabled && onClick && onClick()}
      onMouseEnter={() => onMouseEnter && onMouseEnter(card)}
      onMouseLeave={() => onMouseLeave && onMouseLeave()}
    >
      <img src={imgSrc} alt={card.name} draggable={false} />
    </div>
  );
}
