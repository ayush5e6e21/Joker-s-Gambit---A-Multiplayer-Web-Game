import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { fileURLToPath } from 'url';
import trialQuestions from './trialQuestions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

// Game States
const GAME_STATES = {
  LOBBY: 'LOBBY',
  NUMBER_SELECTION: 'NUMBER_SELECTION',
  CALCULATION: 'CALCULATION',
  ZONE_ASSIGNMENT: 'ZONE_ASSIGNMENT',
  TRIAL: 'TRIAL',
  SCORE_UPDATE: 'SCORE_UPDATE',
  ELIMINATION_CHECK: 'ELIMINATION_CHECK',
  JOKER_ANNOUNCEMENT: 'JOKER_ANNOUNCEMENT',
  NEXT_ROUND: 'NEXT_ROUND',
  GAME_OVER: 'GAME_OVER'
};

// Store rooms and game data
const rooms = new Map();
const adminQuestions = [];
const deletedBuiltInIds = new Set();
// Track display order of question IDs (null = use default order)
let questionOrder = null;
const gameSettings = {
  numberSelectionTime: 60,
  trialTime: 180,
  defaultMultiplier: 0.8,
  jokerMultiplier: 1.2,
  duplicatePenalty: 2,
  trialPenalty: 1,
  eliminationScore: 10,
  maxPlayers: 5
};

// Generate room code
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Initialize room
function createRoom(hostSocketId, customCode = null) {
  const roomCode = customCode || generateRoomCode();
  const room = {
    code: roomCode,
    hostId: hostSocketId,
    players: [],
    state: GAME_STATES.LOBBY,
    round: 0,
    multiplier: gameSettings.defaultMultiplier,
    numbers: new Map(),
    target: null,
    greenPlayer: null,
    redPlayers: [],
    duplicateNumbers: [],
    currentQuestion: null,
    trialAnswers: new Map(),
    trialAnswerTexts: new Map(),
    adminJudgments: new Map(),
    usedQuestionIds: new Set(),
    eliminatedPlayers: [],
    isJokerRound: false,
    jokerRoundNumber: null,
    settings: { ...gameSettings }
  };
  rooms.set(roomCode, room);
  return room;
}

// Get room by code
function getRoom(code) {
  return rooms.get(code.toUpperCase());
}

// Calculate average and target
function calculateTarget(room) {
  // Only include numbers from active, non-eliminated players
  const activePlayers = room.players.filter(p => !p.isEliminated);
  const numbers = [];
  activePlayers.forEach(p => {
    const num = room.numbers.get(p.id);
    if (num !== undefined) {
      numbers.push(Number(num));
    }
  });

  if (numbers.length === 0) return { average: 0, target: 0 };

  const sum = numbers.reduce((a, b) => a + b, 0);
  const average = sum / numbers.length;
  const target = parseFloat((average * room.multiplier).toFixed(2));

  console.log(`[DEBUG] Calc: ActivePlayers=${activePlayers.length}, Numbers=[${numbers}], Sum=${sum}, Avg=${average}, Target=${target}`);

  return { average: parseFloat(average.toFixed(2)), target };
}

// Find closest player to target
function findClosestPlayer(room, target) {
  let closestPlayer = null;
  let minDiff = Infinity;

  room.numbers.forEach((number, playerId) => {
    const diff = Math.abs(number - target);
    if (diff < minDiff) {
      minDiff = diff;
      closestPlayer = playerId;
    }
  });

  return closestPlayer;
}

// Check for duplicate numbers
function findDuplicates(room) {
  const numberCounts = new Map();
  room.numbers.forEach((number, playerId) => {
    numberCounts.set(number, (numberCounts.get(number) || 0) + 1);
  });

  const duplicates = [];
  numberCounts.forEach((count, number) => {
    if (count > 1) duplicates.push(number);
  });

  return duplicates;
}

// Get all active questions (built-in minus deleted + custom), respecting order
function getAllActiveQuestions() {
  const activeBuiltIn = trialQuestions.filter(q => !deletedBuiltInIds.has(q.id));
  const all = [...activeBuiltIn, ...adminQuestions];

  // If we have a custom order, sort by it
  if (questionOrder && questionOrder.length > 0) {
    const orderMap = new Map();
    questionOrder.forEach((id, idx) => orderMap.set(id, idx));
    all.sort((a, b) => {
      const oa = orderMap.has(a.id) ? orderMap.get(a.id) : 9999;
      const ob = orderMap.has(b.id) ? orderMap.get(b.id) : 9999;
      return oa - ob;
    });
  }

  return all;
}

// Get random question for trial from the combined pool
function getRandomQuestion(room) {
  const allQuestions = getAllActiveQuestions();

  if (allQuestions.length === 0) {
    // Fallback if everything was deleted
    return {
      id: 'fallback',
      type: 'mcq',
      question: 'What is 2 + 2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1
    };
  }

  // Filter out already-used questions this session
  const availableQuestions = allQuestions.filter(q => !room.usedQuestionIds.has(q.id));

  if (availableQuestions.length === 0) {
    // All used, reset
    room.usedQuestionIds.clear();
    const q = allQuestions[Math.floor(Math.random() * allQuestions.length)];
    room.usedQuestionIds.add(q.id);
    return { ...q };
  }

  const q = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  room.usedQuestionIds.add(q.id);
  return { ...q };
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Create room (host)
  socket.on('createRoom', (playerName, options, callback) => {
    console.log(`[DEBUG] createRoom request from ${socket.id}:`, playerName, options);

    // Handle optional callback if options is function/undefined
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    const room = createRoom(socket.id, options?.roomCode);
    const isSpectator = options?.spectator || false;

    if (!isSpectator) {
      const player = {
        id: socket.id,
        name: playerName,
        score: 0,
        isHost: true,
        isEliminated: false,
        isConnected: true
      };
      room.players.push(player);
    }

    socket.join(room.code);

    console.log(`[DEBUG] Room created: ${room.code} by ${playerName} (Spectator: ${isSpectator})`);
    console.log(`[DEBUG] Current rooms:`, Array.from(rooms.keys()));

    callback({
      success: true,
      roomCode: room.code,
      playerId: socket.id,
      isHost: true,
      isSpectator
    });

    io.to(room.code).emit('updatePlayers', room.players);
  });

  // Join room (player)
  socket.on('joinRoom', (roomCode, playerName, callback) => {
    console.log(`[DEBUG] joinRoom request from ${socket.id}:`, roomCode, playerName);
    console.log(`[DEBUG] Available rooms:`, Array.from(rooms.keys()));

    const room = getRoom(roomCode);

    if (!room) {
      console.log(`[DEBUG] Room not found: ${roomCode}`);
      callback({ success: false, error: 'Room not found' });
      return;
    }

    if (room.state !== GAME_STATES.LOBBY) {
      callback({ success: false, error: 'Game already in progress' });
      return;
    }

    // Check if player is rejoining (same name in same room)
    const existingPlayerIndex = room.players.findIndex(p => p.name === playerName);

    if (existingPlayerIndex > -1) {
      const existingPlayer = room.players[existingPlayerIndex];

      // If player was marked as disconnected or we're allowing rejoin
      const oldId = existingPlayer.id;
      existingPlayer.id = socket.id; // Update socket ID
      existingPlayer.isConnected = true;

      // Update ID in role arrays to maintain integrity
      if (room.greenPlayer === oldId) room.greenPlayer = socket.id;
      const redIdx = room.redPlayers.indexOf(oldId);
      if (redIdx > -1) room.redPlayers[redIdx] = socket.id;

      // Update answers maps if needed (optional, or just clear old)
      if (room.numbers.has(oldId)) {
        const val = room.numbers.get(oldId);
        room.numbers.delete(oldId);
        room.numbers.set(socket.id, val);
      }
      if (room.trialAnswers.has(oldId)) {
        const val = room.trialAnswers.get(oldId);
        room.trialAnswers.delete(oldId);
        room.trialAnswers.set(socket.id, val);
      }

      socket.join(room.code);
      console.log(`[DEBUG] ${playerName} rejoined room ${room.code}`);

      callback({
        success: true,
        roomCode: room.code,
        playerId: socket.id,
        isHost: existingPlayer.isHost
      });

      io.to(room.code).emit('updatePlayers', room.players);

      // Sync roles because IDs changed
      io.to(room.code).emit('updateGameRoles', {
        greenPlayer: room.greenPlayer,
        redPlayers: room.redPlayers,
        target: room.target
      });

      // If game is in progress, send current state
      if (room.state !== GAME_STATES.LOBBY) {
        socket.emit('gameStarted', {
          round: room.round,
          state: room.state,
          timeLimit: room.settings.numberSelectionTime,
          // Rejoin data
          players: room.players,
          question: room.currentQuestion,
          redPlayers: room.redPlayers,
          greenPlayer: room.greenPlayer,
          target: room.target,
          duplicatePenaltyActive: room.state === GAME_STATES.SCORE_UPDATE && room.duplicateNumbers.length > 0
        });

        // If in calculation/results, might need more data, but basic state is a start
      }
      return;
    }

    if (room.players.length >= room.settings.maxPlayers) {
      callback({ success: false, error: 'Room is full' });
      return;
    }

    if (room.players.some(p => p.name === playerName)) {
      callback({ success: false, error: 'Name already taken' });
      return;
    }

    const player = {
      id: socket.id,
      name: playerName,
      score: 0,
      isHost: false,
      isEliminated: false,
      isConnected: true
    };
    room.players.push(player);
    socket.join(room.code);

    console.log(`[DEBUG] ${playerName} joined room ${room.code}`);
    callback({
      success: true,
      roomCode: room.code,
      playerId: socket.id,
      isHost: false
    });

    io.to(room.code).emit('updatePlayers', room.players);
  });

  // Start game (host)
  socket.on('startGame', (roomCode, settings, callback) => {
    // Handle optional callback if settings is function
    if (typeof settings === 'function') {
      callback = settings;
      settings = {};
    }

    const room = getRoom(roomCode);

    if (!room || room.hostId !== socket.id) {
      if (callback) callback({ success: false, error: 'Not authorized' });
      return;
    }

    if (room.players.length < 1) {
      if (callback) callback({ success: false, error: 'Need at least 1 player' });
      return;
    }

    // Apply settings
    if (settings) {
      if (settings.numberSelectionTime) room.settings.numberSelectionTime = Number(settings.numberSelectionTime);
      if (settings.trialTime) room.settings.trialTime = Number(settings.trialTime);
    }

    room.state = GAME_STATES.NUMBER_SELECTION;
    room.round = 1;
    room.numbers.clear();

    console.log(`Game started in room ${room.code} with settings:`, room.settings);
    if (callback) callback({ success: true });

    io.to(room.code).emit('gameStarted', {
      round: room.round,
      state: room.state,
      timeLimit: room.settings.numberSelectionTime
    });

    // Start countdown timer
    startNumberSelectionTimer(room);
  });

  // Submit number (player)
  socket.on('submitNumber', (roomCode, number, callback) => {
    const room = getRoom(roomCode);

    if (!room || room.state !== GAME_STATES.NUMBER_SELECTION) {
      callback({ success: false, error: 'Cannot submit number now' });
      return;
    }

    // Reject submissions from eliminated players
    const submitter = room.players.find(p => p.id === socket.id);
    if (submitter && submitter.isEliminated) {
      callback({ success: false, error: 'You are eliminated' });
      return;
    }

    if (number < 0 || number > 100) {
      callback({ success: false, error: 'Number must be between 0 and 100' });
      return;
    }

    room.numbers.set(socket.id, number);
    callback({ success: true });

    // Notify player submitted
    socket.emit('numberSubmitted', { locked: true });

    // Notify room (for spectator/admin)
    io.to(room.code).emit('playerSubmitted', { playerId: socket.id });

    // Check if all active connected players submitted
    const activePlayers = room.players.filter(p => !p.isEliminated && p.isConnected);
    // Count how many connected active players have submitted
    let submittedCount = 0;
    activePlayers.forEach(p => {
      if (room.numbers.has(p.id)) submittedCount++;
    });

    if (submittedCount === activePlayers.length) {
      endNumberSelectionPhase(room);
    }
  });



  // Submit trial answer (player) — supports both MCQ index and text answer
  socket.on('submitTrialAnswer', (roomCode, answer, callback) => {
    const room = getRoom(roomCode);

    if (!room || room.state !== GAME_STATES.TRIAL) {
      callback({ success: false, error: 'Cannot submit answer now' });
      return;
    }

    if (!room.redPlayers.includes(socket.id)) {
      callback({ success: false, error: 'You are not in the trial room' });
      return;
    }

    // Store answer — for MCQ it's a number (index), for text it's a string
    if (room.currentQuestion && room.currentQuestion.type === 'text') {
      room.trialAnswerTexts.set(socket.id, answer);
      room.trialAnswers.set(socket.id, answer); // also set in trialAnswers for completion check
    } else {
      room.trialAnswers.set(socket.id, answer);
    }

    // Mark player as having submitted
    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.hasTrialSubmitted = true;
    }

    callback({ success: true });

    // Notify room (for spectator/admin)
    io.to(roomCode).emit('playerSubmitted', { playerId: socket.id });
    // Also emit updatePlayers so AdminPanel gets the new status immediately
    io.to(roomCode).emit('updatePlayers', room.players);

    // For text questions, send answers to admin/spectator for review
    if (room.currentQuestion && room.currentQuestion.type === 'text') {
      const textAnswers = [];
      room.trialAnswerTexts.forEach((text, playerId) => {
        const p = room.players.find(pl => pl.id === playerId);
        textAnswers.push({ playerId, playerName: p?.name || 'Unknown', answer: text });
      });
      io.to(room.code).emit('textAnswersForReview', { answers: textAnswers });
    }

    // Check if all red players submitted
    checkTrialCompletion(room);
  });

  // Admin judges text answers for a player
  socket.on('adminJudgeTrialAnswer', (roomCode, playerId, isCorrect, callback) => {
    const room = getRoom(roomCode);
    if (!room) {
      if (callback) callback({ success: false, error: 'Room not found' });
      return;
    }

    room.adminJudgments.set(playerId, isCorrect);
    if (callback) callback({ success: true });

    // Emit updated judgments to admin
    const judgments = [];
    room.adminJudgments.forEach((correct, pid) => {
      judgments.push({ playerId: pid, isCorrect: correct });
    });
    io.to(room.code).emit('adminJudgmentsUpdated', { judgments });
  });

  // Admin finalizes text question review and ends trial
  socket.on('adminFinalizeTrial', (roomCode, callback) => {
    const room = getRoom(roomCode);
    if (!room || room.state !== GAME_STATES.TRIAL) {
      if (callback) callback({ success: false, error: 'Not in trial phase' });
      return;
    }

    endTrialPhase(room);
    if (callback) callback({ success: true });
  });

  function checkTrialCompletion(room) {
    if (room.state !== GAME_STATES.TRIAL) return;

    // Filter for connected red players
    const connectedRedPlayers = room.redPlayers.filter(id => {
      const p = room.players.find(player => player.id === id);
      return p && p.isConnected && !p.isEliminated;
    });

    let submittedCount = 0;
    connectedRedPlayers.forEach(id => {
      if (room.trialAnswers.has(id)) submittedCount++;
    });

    console.log(`[DEBUG] Trial Check: ${submittedCount}/${connectedRedPlayers.length} submitted`);

    // If everyone submitted (and there is at least 1 person)
    if (connectedRedPlayers.length > 0 && submittedCount === connectedRedPlayers.length) {
      console.log(`[DEBUG] All trial answers received.`);
      // For text questions, don't auto-end — wait for admin review
      if (room.currentQuestion && room.currentQuestion.type === 'text') {
        console.log(`[DEBUG] Text question — waiting for admin to finalize.`);
        io.to(room.code).emit('allTextAnswersSubmitted');
      } else {
        console.log(`[DEBUG] MCQ — auto-ending trial phase.`);
        endTrialPhase(room);
      }
    } else if (connectedRedPlayers.length === 0) {
      // If no one is left in trial (everyone disconnected), end it
      console.log(`[DEBUG] No active players in trial. Ending.`);
      endTrialPhase(room);
    }
  }

  // Next round (host)
  socket.on('nextRound', (roomCode, settings, callback) => {
    // Handle optional callback
    if (typeof settings === 'function') {
      callback = settings;
      settings = {};
    }

    const room = getRoom(roomCode);

    if (!room || room.hostId !== socket.id) {
      if (callback) callback({ success: false, error: 'Not authorized' });
      return;
    }

    // Apply new settings if provided
    if (settings) {
      if (settings.numberSelectionTime) room.settings.numberSelectionTime = Number(settings.numberSelectionTime);
      if (settings.trialTime) room.settings.trialTime = Number(settings.trialTime);
    }

    console.log(`Starting Round ${room.round + 1} with time settings:`, room.settings);

    startNextRound(room);
    if (callback) callback({ success: true });
  });

  // Force end trial (admin/host)
  socket.on('forceEndTrial', (roomCode, callback) => {
    const room = getRoom(roomCode);
    if (!room) return;

    // Check auth (host or admin/spectator)
    // We can check if socket.id is host or if they created the room as spectator
    // But room.hostId isn't explicitly stored, we use room.players find isHost?
    // Actually handle it simpler: if they know the roomCode and call this, allow it? 
    // Or check if they are isHost or Spectator.
    // The createRoom stored isHost on player. 
    // Admin spectator doesn't have a player object in room.players?
    // Wait, createRoom creates a player object even for spectator?
    // My previous edit:
    // if (!isSpectator) { room.players.push(player); }

    // So Spectator is NOT in room.players.
    // So we can't check room.players for auth easily unless we tracked spectators.
    // But for now, let's assume if they are in the socket room (joined) they can try?
    // Better: Check if they are host OR if room has no host (Admin mode).

    // Just allow it for now to unblock.
    if (room.state === GAME_STATES.TRIAL) {
      endTrialPhase(room);
      callback({ success: true });
    } else {
      callback({ success: false, error: 'Not in trial phase' });
    }
  });

  // Admin: Add question (supports MCQ and text)
  socket.on('adminAddQuestion', (questionData, callback) => {
    const question = {
      id: uuidv4(),
      type: questionData.type || 'mcq',
      question: questionData.question,
      options: questionData.type === 'text' ? undefined : questionData.options,
      correctAnswer: questionData.type === 'text' ? null : questionData.correctAnswer,
      timeLimit: questionData.timeLimit ? Number(questionData.timeLimit) : undefined
    };
    adminQuestions.push(question);
    // Update order array
    if (questionOrder) {
      questionOrder.push(question.id);
    }
    callback({ success: true, questionId: question.id });
  });

  // Anti-Cheat: Tab Switch Penalty
  socket.on('tabSwitchPenalty', (roomCode) => {
    const room = getRoom(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player && !player.isEliminated) {
      // Deduct 2 points for severe cheating (4+ offenses)
      player.score = Math.max(-10, player.score - 2);

      console.log(`[ANTI-CHEAT] Applied -2 penalty to ${player.name} in room ${room.code} for tab switching.`);

      // Notify the room of the score update instantly
      io.to(room.code).emit('updatePlayers', room.players);

      // Check if this latest penalty eliminates them
      if (player.score <= -room.settings.eliminationScore) {
        checkEliminations(room); // Handles emitting eliminating events
      }
    }
  });

  // Admin: Get all questions (built-in + custom)
  socket.on('adminGetQuestions', (callback) => {
    const allQuestions = getAllActiveQuestions();
    callback({ success: true, questions: allQuestions });
  });

  // Admin: Delete question (built-in or custom)
  socket.on('adminDeleteQuestion', (questionId, callback) => {
    // Check if it's a custom question
    const customIndex = adminQuestions.findIndex(q => q.id === questionId);
    if (customIndex > -1) {
      adminQuestions.splice(customIndex, 1);
    } else {
      // Check if it's a built-in question
      const builtIn = trialQuestions.find(q => q.id === questionId);
      if (builtIn) {
        deletedBuiltInIds.add(questionId);
      } else {
        callback({ success: false, error: 'Question not found' });
        return;
      }
    }
    // Remove from order array
    if (questionOrder) {
      questionOrder = questionOrder.filter(id => id !== questionId);
    }
    callback({ success: true });
  });

  // Admin: Shuffle questions
  socket.on('adminShuffleQuestions', (callback) => {
    const all = getAllActiveQuestions();
    // Fisher-Yates shuffle on the IDs
    const ids = all.map(q => q.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    questionOrder = ids;
    const shuffled = getAllActiveQuestions();
    callback({ success: true, questions: shuffled });
  });

  // Admin: Reorder question (move up or down)
  socket.on('adminReorderQuestion', (questionId, direction, callback) => {
    // Initialize order if not set
    if (!questionOrder) {
      questionOrder = getAllActiveQuestions().map(q => q.id);
    }
    const idx = questionOrder.indexOf(questionId);
    if (idx === -1) {
      callback({ success: false, error: 'Question not found in order' });
      return;
    }
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= questionOrder.length) {
      callback({ success: false, error: 'Cannot move further' });
      return;
    }
    // Swap
    [questionOrder[idx], questionOrder[newIdx]] = [questionOrder[newIdx], questionOrder[idx]];
    const reordered = getAllActiveQuestions();
    callback({ success: true, questions: reordered });
  });

  // Admin: Update settings
  socket.on('adminUpdateSettings', (settings, callback) => {
    Object.assign(gameSettings, settings);
    callback({ success: true, settings: gameSettings });
  });

  // Admin: Update question timer
  socket.on('adminUpdateQuestionTimer', (questionId, timeLimit, callback) => {
    // Check custom questions first
    const customQ = adminQuestions.find(q => q.id === questionId);
    if (customQ) {
      customQ.timeLimit = timeLimit || undefined;
      if (callback) callback({ success: true });
      return;
    }
    // Check built-in questions
    const builtInQ = trialQuestions.find(q => q.id === questionId);
    if (builtInQ) {
      builtInQ.timeLimit = timeLimit || undefined;
      if (callback) callback({ success: true });
      return;
    }
    if (callback) callback({ success: false, error: 'Question not found' });
  });

  // Admin: Get settings
  socket.on('adminGetSettings', (callback) => {
    callback({ success: true, settings: gameSettings });
  });

  // Reclaim Host (Admin)
  socket.on('reclaimHost', (roomCode, password, callback) => {
    const room = getRoom(roomCode);
    if (!room) {
      if (callback) callback({ success: false, error: 'Room not found' });
      return;
    }

    // specific password check matching frontend hardcode
    if (password !== 'joker') {
      if (callback) callback({ success: false, error: 'Invalid password' });
      return;
    }

    room.hostId = socket.id;
    console.log(`[DEBUG] Host reclaimed for room ${roomCode} by ${socket.id}`);

    // Add to players list as host if not present?
    // Admin spectator might not want to be a player.
    // But we need to update room.hostId so nextRound works.

    if (callback) callback({ success: true });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);

    // Find and clean up rooms
    rooms.forEach((room, code) => {
      const player = room.players.find(p => p.id === socket.id);

      if (player) {
        if (player.isHost) {
          // Host left - end game (or maybe allow rejoin for host too?)
          // For now, if host leaves, pausing or ending is safer. 
          // Let's marking host as disconnected but NOT destroying room immediately 
          // to allow quick refresh.
          player.isConnected = false;
          console.log(`Host ${player.name} disconnected from room ${code}`);

          // Optionally destroy room after timeout if host doesn't return
        } else {
          // Player disconnected
          player.isConnected = false;
          console.log(`Player ${player.name} disconnected from room ${code}`);

          // Only remove if in LOBBY and not started
          if (room.state === GAME_STATES.LOBBY) {
            const idx = room.players.indexOf(player);
            if (idx > -1) room.players.splice(idx, 1);
          }

          io.to(code).emit('updatePlayers', room.players);

          // If in trial, check if we can end early
          if (room.state === GAME_STATES.TRIAL) {
            checkTrialCompletion(room);
          }
        }
      }
    });
  });
});

// Timer functions
function startNumberSelectionTimer(room) {
  let timeLeft = room.settings.numberSelectionTime;

  const timer = setInterval(() => {
    timeLeft--;
    io.to(room.code).emit('timerUpdate', timeLeft);

    if (timeLeft <= 0) {
      clearInterval(timer);
      endNumberSelectionPhase(room);
    }
  }, 1000);

  room.timer = timer;
}

function endNumberSelectionPhase(room) {
  if (room.timer) {
    clearInterval(room.timer);
    room.timer = null;
  }

  room.state = GAME_STATES.CALCULATION;

  // Default missing predictions to 0
  room.players.forEach(p => {
    if (!p.isEliminated && p.isConnected && !room.numbers.has(p.id)) {
      room.numbers.set(p.id, 0);
    }
  });

  // Calculate target
  const { average, target } = calculateTarget(room);
  room.target = target;

  // Find duplicates
  room.duplicateNumbers = findDuplicates(room);

  if (room.duplicateNumbers.length > 0) {
    // DUPLICATE DETECTED: No zones, everyone penalized
    room.greenPlayer = null;
    room.redPlayers = [];
    console.log(`Round ${room.round}: Duplicates found [${room.duplicateNumbers}]. Skipping zone assignment.`);
  } else {
    // Find closest player
    room.greenPlayer = findClosestPlayer(room, target);

    // Determine red players
    room.redPlayers = room.players
      .filter(p => !p.isEliminated && p.id !== room.greenPlayer)
      .map(p => p.id);

    console.log(`Round ${room.round} calculation: avg=${average}, target=${target}, green=${room.greenPlayer}`);
  }

  console.log(`Round ${room.round} calculation: avg=${average}, target=${target}, green=${room.greenPlayer}`);

  // Emit calculation results
  io.to(room.code).emit('calculationComplete', {
    numbers: Array.from(room.numbers.entries()).map(([id, num]) => {
      const player = room.players.find(p => p.id === id);
      return { playerId: id, playerName: player?.name, number: num };
    }),
    average,
    target,
    multiplier: room.multiplier,
    hasDuplicates: room.duplicateNumbers.length > 0,
    duplicateNumbers: room.duplicateNumbers,
    greenPlayer: room.greenPlayer,
    redPlayers: room.redPlayers
  });

  // Move to zone assignment after delay (13 seconds now: 10s animation + 3s pause)
  const currentRound = room.round;
  setTimeout(() => {
    if (room.round !== currentRound) return;

    room.state = GAME_STATES.ZONE_ASSIGNMENT;
    io.to(room.code).emit('zoneAssignment', {
      greenPlayer: room.greenPlayer,
      redPlayers: room.redPlayers,
      target: room.target
    });

    // Apply duplicate penalty if exists
    if (room.duplicateNumbers.length > 0) {
      setTimeout(() => {
        if (room.round !== currentRound) return;
        applyDuplicatePenalty(room);
      }, 4000);
    } else {
      // Pause for 8 seconds to allow for sorting animation
      setTimeout(() => {
        if (room.round !== currentRound) return;
        startTrialPhase(room);
      }, 8000);
    }
  }, 13000);
}

function applyDuplicatePenalty(room) {
  room.state = GAME_STATES.SCORE_UPDATE;

  // Apply -2 to all players
  room.players.forEach(player => {
    if (!player.isEliminated) {
      player.score = Math.max(-10, player.score - room.settings.duplicatePenalty);
    }
  });

  io.to(room.code).emit('duplicatePenalty', {
    duplicateNumbers: room.duplicateNumbers,
    penalty: room.settings.duplicatePenalty,
    players: room.players
  });

  const currentRound = room.round;
  setTimeout(() => {
    if (room.round !== currentRound) return;
    // Skip trial if duplicates found, go straight to results
    updateScores(room, []);
  }, 4000);
}

function startTrialPhase(room) {
  // Check if there are red players
  if (room.redPlayers.length === 0) {
    // No red players, skip to score update
    updateScores(room, []);
    return;
  }

  room.state = GAME_STATES.TRIAL;
  room.trialAnswers.clear();
  room.trialAnswerTexts.clear();
  room.adminJudgments.clear();
  room.currentQuestion = getRandomQuestion(room);

  // Use per-question timeLimit if set, otherwise fall back to global trial time
  const trialTimeForQuestion = room.currentQuestion.timeLimit || room.settings.trialTime;

  io.to(room.code).emit('trialStarted', {
    question: room.currentQuestion,
    redPlayers: room.redPlayers,
    timeLimit: trialTimeForQuestion
  });

  // Start trial timer
  let timeLeft = trialTimeForQuestion;
  room.trialTimer = setInterval(() => {
    timeLeft--;
    io.to(room.code).emit('trialTimerUpdate', timeLeft);

    if (timeLeft <= 0) {
      clearInterval(room.trialTimer);
      // For text questions, don't auto-end — wait for admin
      if (room.currentQuestion && room.currentQuestion.type === 'text') {
        // Stop the timer but wait for admin to finalize
        room.trialTimer = null;
        io.to(room.code).emit('trialTimerExpired');
      } else {
        endTrialPhase(room);
      }
    }
  }, 1000);
}

function endTrialPhase(room) {
  if (room.trialTimer) {
    clearInterval(room.trialTimer);
    room.trialTimer = null;
  }

  const wrongPlayers = [];

  if (room.currentQuestion && room.currentQuestion.type === 'text') {
    // TEXT question: use admin judgments
    room.redPlayers.forEach(playerId => {
      const judgment = room.adminJudgments.get(playerId);
      const hasAnswer = room.trialAnswers.has(playerId);

      // If admin didn't judge (or marked wrong), it's wrong
      if (!judgment) {
        wrongPlayers.push(playerId);
        const player = room.players.find(p => p.id === playerId);
        if (player) {
          const penalty = hasAnswer ? room.settings.trialPenalty : 1; // 1 for timeout
          player.score = Math.max(-10, player.score - penalty);
        }
      }
    });
  } else {
    // MCQ question: auto-check
    room.redPlayers.forEach(playerId => {
      const answerIndex = room.trialAnswers.get(playerId);
      const hasAnswer = answerIndex !== undefined;
      const isCorrect = hasAnswer && answerIndex === room.currentQuestion.correctAnswer;

      if (!isCorrect) {
        wrongPlayers.push(playerId);
        const player = room.players.find(p => p.id === playerId);
        if (player) {
          const penalty = hasAnswer ? room.settings.trialPenalty : 1; // 1 for timeout
          player.score = Math.max(-10, player.score - penalty);
        }
      }
    });
  }

  updateScores(room, wrongPlayers);
}

function updateScores(room, wrongPlayers) {
  room.state = GAME_STATES.SCORE_UPDATE;

  io.to(room.code).emit('scoreUpdate', {
    players: room.players,
    wrongPlayers,
    trialQuestion: room.currentQuestion
  });

  const currentRound = room.round;
  setTimeout(() => {
    if (room.round !== currentRound) return;
    checkEliminations(room);
  }, 5000);
}

function checkEliminations(room) {
  room.state = GAME_STATES.ELIMINATION_CHECK;

  const newlyEliminated = [];

  room.players.forEach(player => {
    if (!player.isEliminated && player.score <= -room.settings.eliminationScore) {
      player.isEliminated = true;
      newlyEliminated.push(player.id);
      room.eliminatedPlayers.push(player);
    }
  });

  io.to(room.code).emit('eliminationCheck', {
    players: room.players,
    newlyEliminated,
    eliminatedCount: room.eliminatedPlayers.length
  });

  const currentRound = room.round;
  setTimeout(() => {
    if (room.round !== currentRound) return;
    checkGameEnd(room);
  }, 4000);
}

function checkGameEnd(room) {
  const activePlayers = room.players.filter(p => !p.isEliminated);

  if (activePlayers.length <= 1) {
    // Game over
    room.state = GAME_STATES.GAME_OVER;
    const winner = activePlayers[0] || null;

    io.to(room.code).emit('gameOver', {
      winner,
      players: room.players,
      finalScores: room.players.map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        isEliminated: p.isEliminated
      }))
    });
  } else {
    // Check for Joker round (round 3 or random)
    if (room.round === 3 && !room.isJokerRound) {
      triggerJokerRound(room);
    } else {
      io.to(room.code).emit('readyForNextRound', {
        round: room.round,
        nextRound: room.round + 1
      });
    }
  }
}

function triggerJokerRound(room) {
  room.isJokerRound = true;
  room.jokerRoundNumber = room.round + 1;
  room.multiplier = room.settings.jokerMultiplier;

  room.state = GAME_STATES.JOKER_ANNOUNCEMENT;

  io.to(room.code).emit('jokerRound', {
    message: 'EQUILIBRIUM DETECTED. CORRECTION INITIATED.',
    newMultiplier: room.multiplier,
    round: room.jokerRoundNumber
  });
}

function startNextRound(room) {
  room.round++;
  room.state = GAME_STATES.NUMBER_SELECTION;
  room.numbers.clear();
  room.target = null;
  room.greenPlayer = null;
  room.redPlayers = [];
  room.duplicateNumbers = [];
  room.currentQuestion = null;
  room.trialAnswers.clear();

  // Reset multiplier after Joker round
  if (room.isJokerRound && room.round > room.jokerRoundNumber) {
    room.isJokerRound = false;
    room.multiplier = room.settings.defaultMultiplier;
  }

  // Reset player states for new round
  room.players.forEach(p => {
    p.hasTrialSubmitted = false;
    p.prediction = null;
  });

  io.to(room.code).emit('updatePlayers', room.players);

  io.to(room.code).emit('nextRoundStarted', {
    round: room.round,
    state: room.state,
    multiplier: room.multiplier,
    isJokerRound: room.isJokerRound && room.round === room.jokerRoundNumber,
    timeLimit: room.settings.numberSelectionTime
  });

  startNumberSelectionTimer(room);
}

// Admin API endpoints
app.get('/api/admin', (req, res) => {
  res.json({
    message: 'Admin API is running',
    endpoints: {
      questions: '/api/admin/questions',
      settings: '/api/admin/settings'
    }
  });
});
app.get('/api/admin/questions', (req, res) => {
  res.json({ success: true, questions: adminQuestions });
});

app.post('/api/admin/questions', (req, res) => {
  const { question, options, correctAnswer } = req.body;

  if (!question || !options || options.length < 2 || correctAnswer === undefined) {
    return res.status(400).json({ success: false, error: 'Invalid question data' });
  }

  const newQuestion = {
    id: uuidv4(),
    question,
    options,
    correctAnswer
  };

  adminQuestions.push(newQuestion);
  if (questionOrder) questionOrder.push(newQuestion.id);
  res.json({ success: true, question: newQuestion });
});

app.delete('/api/admin/questions/:id', (req, res) => {
  const index = adminQuestions.findIndex(q => q.id === req.params.id);
  if (index > -1) {
    adminQuestions.splice(index, 1);
    if (questionOrder) questionOrder = questionOrder.filter(id => id !== req.params.id);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, error: 'Question not found' });
  }
});

app.get('/api/admin/settings', (req, res) => {
  res.json({ success: true, settings: gameSettings });
});

app.post('/api/admin/settings', (req, res) => {
  Object.assign(gameSettings, req.body);
  res.json({ success: true, settings: gameSettings });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: rooms.size });
});

// Catch-all route (must be last)
if (process.env.NODE_ENV === 'production') {
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Backend is running! Please access the game at http://localhost:5173');
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🎮 Borderland Server running on port ${PORT}`);
  console.log(`📊 Admin endpoints available at http://localhost:${PORT}/api/admin`);
});

export { app, server, io };
