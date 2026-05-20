const { Server } = require('socket.io');
const { getStartingHP } = require('../services/gameService');
const CARD_DATA = require('./cardData');

const rooms = {}; // in-memory active rooms

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function calcEffect(cards) {
  return cards.reduce((sum, c) => sum + c.values.reduce((s, v) => s + v, 0), 0);
}

function drawUpToSix(room, playerIndex) {
  const p = room.players[playerIndex];
  while (p.hand.length < 6 && room.deck.length > 0) p.hand.push(room.deck.pop());
}

function checkGameOver(room) {
  return room.deck.length === 0 || room.players.some(p => p.hp <= 0);
}

function getWinner(room) {
  const alive = room.players.filter(p => p.hp > 0);
  if (alive.length === 1) return alive[0];
  return room.players.reduce((a, b) => a.hp >= b.hp ? a : b);
}

// Send room state to each player (hide other players' hands)
function emitRoomState(io, room, event) {
  room.players.forEach(p => {
    io.to(p.socketId).emit(event, {
      roomCode:          room.roomCode,
      playerCount:       room.playerCount,
      status:            room.status,
      currentTurnIndex:  room.currentTurnIndex,
      deckCount:         room.deck.length,
      players: room.players.map(pl => ({
        socketId:     pl.socketId,
        userId:       pl.userId,
        displayName:  pl.displayName,
        photoUrl:     pl.photoUrl,
        hp:           pl.hp,
        handCount:    pl.hand.length,
        hand:         pl.socketId === p.socketId ? pl.hand : undefined,
        isCurrentTurn: room.players[room.currentTurnIndex]?.socketId === pl.socketId,
      })),
    });
  });
}

function initSocket(server) {
  const io = new Server(server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    console.log('🔌 Connected:', socket.id);

    socket.on('create_room', ({ roomCode, playerCount, userId, displayName, photoUrl }) => {
      rooms[roomCode] = {
        roomCode, playerCount, status: 'waiting', currentTurnIndex: 0,
        deck: shuffle([...CARD_DATA, ...CARD_DATA]),
        players: [],
      };
      const hp = getStartingHP(playerCount);
      rooms[roomCode].players.push({ socketId: socket.id, userId, displayName, photoUrl, hp, hand: [], turnOrder: 1 });
      socket.join(roomCode);
      socket.emit('room_joined', { roomCode, playerCount });
      emitRoomState(io, rooms[roomCode], 'room_update');
    });

    socket.on('join_room', ({ roomCode, userId, displayName, photoUrl }) => {
      const room = rooms[roomCode];
      if (!room) return socket.emit('error', { message: 'Room not found' });
      if (room.status !== 'waiting') return socket.emit('error', { message: 'Game already started' });
      if (room.players.length >= room.playerCount) return socket.emit('error', { message: 'Room is full' });
      if (room.players.find(p => p.userId === userId)) return socket.emit('error', { message: 'Already in room' });

      const hp = getStartingHP(room.playerCount);
      room.players.push({ socketId: socket.id, userId, displayName, photoUrl, hp, hand: [], turnOrder: room.players.length + 1 });
      socket.join(roomCode);
      socket.emit('room_joined', { roomCode, playerCount: room.playerCount });
      emitRoomState(io, room, 'room_update');

      // Start game if full
      if (room.players.length === room.playerCount) {
        room.status = 'playing';
        // Deal 6 cards to each player
        room.players.forEach((p, i) => {
          for (let j = 0; j < 6; j++) if (room.deck.length > 0) p.hand.push(room.deck.pop());
        });
        emitRoomState(io, room, 'game_start');
      }
    });

    socket.on('play_cards', ({ roomCode, cardIndices, target }) => {
      const room = rooms[roomCode];
      if (!room || room.status !== 'playing') return;

      const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
      if (playerIndex !== room.currentTurnIndex) return socket.emit('error', { message: 'Not your turn' });

      const player = room.players[playerIndex];
      const cards = cardIndices.map(i => player.hand[i]).filter(Boolean);
      if (!cards.length) return;

      // Validate play
      if (cards.length === 2 && cards.some(c => c.type === 'double'))
        return socket.emit('error', { message: 'Double-trait must be played alone' });

      const effect = calcEffect(cards);

      // Apply to target
      if (target === 'self') {
        player.hp = Math.max(0, player.hp + effect);
      } else {
        const t = room.players.find(p => p.socketId === target);
        if (t) t.hp = Math.max(0, t.hp + effect);
      }

      // Remove played cards and draw back up
      [...cardIndices].sort((a, b) => b - a).forEach(i => player.hand.splice(i, 1));
      drawUpToSix(room, playerIndex);

      io.to(roomCode).emit('card_played', {
        playerSocketId: socket.id, displayName: player.displayName,
        cards, target, effect,
      });

      if (checkGameOver(room)) {
        room.status = 'finished';
        const winner = getWinner(room);
        io.to(roomCode).emit('game_over', {
          winner: { socketId: winner.socketId, displayName: winner.displayName, hp: winner.hp },
          players: room.players.map(p => ({ socketId: p.socketId, displayName: p.displayName, hp: p.hp })),
        });
        delete rooms[roomCode];
        return;
      }

      room.currentTurnIndex = (room.currentTurnIndex + 1) % room.players.length;
      emitRoomState(io, room, 'turn_update');
    });

    socket.on('disconnect', () => {
      for (const code in rooms) {
        const room = rooms[code];
        const idx = room.players.findIndex(p => p.socketId === socket.id);
        if (idx !== -1) {
          const left = room.players.splice(idx, 1)[0];
          io.to(code).emit('player_left', { displayName: left.displayName, message: `${left.displayName} left the game.` });
          if (room.players.length === 0) delete rooms[code];
        }
      }
    });
  });
}

module.exports = { initSocket };
