import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  Skull,
  Target,
  Timer,
  AlertTriangle,
  ChevronRight,
  Shield,
  Swords,
  Brain,
  Copy,
  CheckCircle2,
  Settings,
  Crown
} from 'lucide-react';
import { AdminPanel } from './components/AdminPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { GameState } from '@/types';
import { SocketProvider, useSocket } from './context/SocketContext';

// ... (Existing CustomCursor, EntranceScreen, etc. keep unchanged)


// ============== CUSTOM CURSOR COMPONENT ==============
const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailsRef = useRef<HTMLDivElement[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }

      // Update trails with delay
      trailsRef.current.forEach((trail, index) => {
        if (trail) {
          const delay = (index + 1) * 0.05;
          setTimeout(() => {
            trail.style.left = `${e.clientX}px`;
            trail.style.top = `${e.clientY}px`;
          }, delay * 100);
        }
      });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    document.addEventListener('mousemove', handleMouseMove);

    // Add hover detection for interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input, [data-cursor-hover]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      {/* Cursor Trails */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          ref={el => { if (el) trailsRef.current[i] = el; }}
          className="cursor-trail"
          style={{
            opacity: (5 - i) * 0.15,
            transform: `translate(-50%, -50%) scale(${1 - i * 0.15})`,
          }}
        />
      ))}
      {/* Main Cursor */}
      <div
        ref={cursorRef}
        className={`custom-cursor ${isHovering ? 'hover' : ''}`}
      />
    </>
  );
};

// ============== LIGHTNING EFFECT ==============
// ============== LIGHTNING EFFECT ==============
// ============== ENTRANCE SCREEN ==============

// ============== ENTRANCE SCREEN ==============
const EntranceScreen = ({ onEnter, onAdminClick }: { onEnter: () => void; onAdminClick: () => void }) => {
  const [showJoker, setShowJoker] = useState(false);
  const [showText1, setShowText1] = useState(false);
  const [showText2, setShowText2] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [jokerTwitch, setJokerTwitch] = useState(false);

  useEffect(() => {
    // Dramatic entrance sequence
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 1000));
      // Text 1
      setShowText1(true);
      await new Promise(r => setTimeout(r, 4000));
      setShowText1(false);

      // 3s Darkness/Gap
      await new Promise(r => setTimeout(r, 3000));

      // Text and Joker together
      setShowText2(true);
      setShowJoker(true);
      await new Promise(r => setTimeout(r, 2000));
      setShowButton(true);
    };
    sequence();

    // Random joker twitch
    const twitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setJokerTwitch(true);
        setTimeout(() => setJokerTwitch(false), 200);
      }
    }, 3000);

    return () => clearInterval(twitchInterval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {/* Dramatic Lighting */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black opacity-80" />

      {/* Joker Image */}
      <AnimatePresence>
        {showJoker && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} // Smooth fade in
            animate={{
              scale: jokerTwitch ? [1, 1.05, 0.98, 1] : 1,
              opacity: 1
            }}
            transition={{
              scale: { duration: 0.2 },
              opacity: { duration: 2, ease: 'easeInOut' } // Slower, smoother fade
            }}
            className="relative z-10"
          >
            <motion.img
              src="/joker.png"
              alt="Joker"
              className="w-80 h-auto breathe"
              style={{ filter: 'drop-shadow(0 0 50px rgba(217, 37, 37, 0.5))' }}
            />
            {/* Glowing Eyes Effect */}
            <div className="absolute top-[32%] left-[38%] w-4 h-4 bg-[#D92525] rounded-full blur-sm animate-pulse" />
            <div className="absolute top-[32%] right-[38%] w-4 h-4 bg-[#D92525] rounded-full blur-sm animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text Messages */}
      <div className="mt-8 h-20 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {showText1 && (
            <motion.p
              key="text1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: [0, 1, 1, 0.2, 1, 0.5, 0] }} // Flicker out like a dying bulb
              exit={{ opacity: 0 }}
              transition={{
                duration: 4,
                times: [0, 0.1, 0.8, 0.85, 0.9, 0.95, 1]
              }}
              className="text-2xl md:text-3xl text-gray-400 tracking-widest typewriter"
            >
              The game is not over yet...
            </motion.p>
          )}
          {showText2 && (
            <motion.h1
              key="text2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'backOut' }}
              className="text-5xl md:text-7xl font-bold text-[#D92525] glow-red tracking-wider"
            >
              THE JOKER IS HERE
            </motion.h1>
          )}
        </AnimatePresence>
      </div>

      {/* Enter Button */}
      <AnimatePresence>
        {showButton && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-12"
          >
            <div className="flex gap-4 items-center mt-12 relative z-50">
              <Button
                onClick={() => {
                  try {
                    const element = document.documentElement;
                    if (element.requestFullscreen) {
                      element.requestFullscreen();
                    }
                  } catch (e) { /* ignore */ }
                  onEnter();
                }}
                className="btn-horror px-12 py-6 text-xl bg-transparent border-2 border-[#D92525] text-[#D92525] hover:bg-[#D92525] hover:text-black transition-all duration-300 rounded-none tracking-widest"
                data-cursor-hover
              >
                ENTER THE BORDERLAND
              </Button>

              <Button
                onClick={onAdminClick}
                variant="outline"
                className="h-[76px] px-6 border-2 border-gray-800 text-gray-600 hover:text-[#D92525] hover:border-[#D92525] uppercase tracking-widest bg-transparent transition-all rounded-none"
                data-cursor-hover
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ... (RulesScreen and LobbyScreen skipped - no changes) ...

// ============== RULES SCREEN ==============
const RulesScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [currentRule, setCurrentRule] = useState(0);
  const [showAnimation, setShowAnimation] = useState(true);

  const rules = [
    {
      title: 'PREDICTION PHASE',
      description: 'Each team secretly chooses a number from 0 to 100.',
      icon: <Brain className="w-16 h-16 text-[#D92525]" />,
      animation: 'prediction'
    },
    {
      title: 'THE CALCULATION',
      description: 'Target = Average of all predictions × 0.8',
      icon: <Target className="w-16 h-16 text-[#D92525]" />,
      animation: 'calculation'
    },
    {
      title: 'ZONE ASSIGNMENT',
      description: 'Closest to Target = GREEN ZONE (Safe). Others = RED ZONE (Trial).',
      icon: <Shield className="w-16 h-16 text-green-500" />,
      animation: 'zones'
    },
    {
      title: 'THE TRIAL',
      description: 'Red Zone teams face logic puzzles. Wrong answer = -1 point.',
      icon: <Swords className="w-16 h-16 text-[#D92525]" />,
      animation: 'trial'
    },
    {
      title: 'DUPLICATE PENALTY',
      description: 'After Round 2: If any two teams choose the same number, ALL teams lose 2 points.',
      icon: <Copy className="w-16 h-16 text-[#D92525]" />,
      animation: 'duplicate'
    },
    {
      title: 'ELIMINATION',
      description: 'Reach -10 points and you are ELIMINATED. Last team standing wins.',
      icon: <Skull className="w-16 h-16 text-[#D92525]" />,
      animation: 'elimination'
    }
  ];

  const handleNext = () => {
    if (currentRule < rules.length - 1) {
      setShowAnimation(false);
      setTimeout(() => {
        setCurrentRule(prev => prev + 1);
        setShowAnimation(true);
      }, 300);
    } else {
      onComplete();
    }
  };

  // 2D Animation Components
  const PredictionAnimation = () => (
    <div className="relative w-64 h-40 flex items-center justify-center">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="absolute w-12 h-16 bg-[#1a1a1a] border border-[#D92525] rounded flex items-center justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{
            opacity: 1,
            y: 0,
            x: (i - 2) * 50
          }}
          transition={{ delay: i * 0.2, duration: 0.5 }}
        >
          <span className="text-[#D92525] font-mono text-lg">?</span>
        </motion.div>
      ))}
      <motion.div
        className="absolute -bottom-8 text-sm text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        5 Teams, 5 Hidden Numbers
      </motion.div>
    </div>
  );

  const CalculationAnimation = () => (
    <div className="relative w-80 h-40 flex flex-col items-center justify-center">
      <motion.div className="flex items-center gap-4">
        <motion.span
          className="text-2xl text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          AVG
        </motion.span>
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="text-[#D92525] text-3xl"
        >
          ×
        </motion.span>
        <motion.span
          className="text-2xl text-[#D92525]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          0.8
        </motion.span>
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.1, type: 'spring' }}
          className="text-[#D92525] text-3xl"
        >
          =
        </motion.span>
        <motion.span
          className="text-3xl text-green-500 font-bold glow-red"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4, type: 'spring' }}
        >
          TARGET
        </motion.span>
      </motion.div>
    </div>
  );

  const ZonesAnimation = () => (
    <div className="relative w-80 h-40 flex items-center justify-center gap-8">
      <motion.div
        className="w-24 h-32 green-zone rounded-lg flex flex-col items-center justify-center"
        initial={{ scale: 0, rotateY: 180 }}
        animate={{ scale: 1, rotateY: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <Shield className="w-8 h-8 text-green-500 mb-2" />
        <span className="text-green-500 text-xs">SAFE</span>
      </motion.div>
      <motion.div
        className="text-4xl text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        VS
      </motion.div>
      <motion.div
        className="w-24 h-32 red-zone rounded-lg flex flex-col items-center justify-center"
        initial={{ scale: 0, rotateY: -180 }}
        animate={{ scale: 1, rotateY: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <Swords className="w-8 h-8 text-[#D92525] mb-2" />
        <span className="text-[#D92525] text-xs">TRIAL</span>
      </motion.div>
    </div>
  );

  const TrialAnimation = () => (
    <div className="relative w-80 h-40 flex flex-col items-center justify-center">
      <motion.div
        className="text-lg text-gray-300 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        2 + 3 × 4 = ?
      </motion.div>
      <div className="flex gap-2">
        {['20', '14', '24', '10'].map((opt, i) => (
          <motion.button
            key={opt}
            className={`w-12 h-12 border rounded ${i === 1 ? 'border-green-500 bg-green-500/20' : 'border-gray-600'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
          >
            {opt}
          </motion.button>
        ))}
      </div>
      <motion.div
        className="mt-4 text-sm text-[#D92525]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        Wrong answer: -1 point
      </motion.div>
    </div>
  );

  const DuplicateAnimation = () => (
    <div className="relative w-80 h-40 flex items-center justify-center">
      <div className="flex gap-4">
        {[42, 42, 35, 50, 28].map((num, i) => (
          <motion.div
            key={i}
            className={`w-12 h-16 border rounded flex items-center justify-center ${i < 2 ? 'border-[#D92525] bg-[#D92525]/20' : 'border-gray-600'}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.15 }}
          >
            <span className={i < 2 ? 'text-[#D92525]' : 'text-gray-400'}>{num}</span>
          </motion.div>
        ))}
      </div>
      <motion.div
        className="absolute -bottom-4 text-xl font-bold text-[#D92525]"
        initial={{ opacity: 0, scale: 2 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
      >
        ALL TEAMS -2 POINTS
      </motion.div>
    </div>
  );

  const EliminationAnimation = () => (
    <div className="relative w-80 h-40 flex items-center justify-center">
      <motion.div
        className="text-6xl font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.span
          className="text-gray-600"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          -10
        </motion.span>
      </motion.div>
      <motion.div
        className="absolute"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: 'spring' }}
      >
        <Skull className="w-24 h-24 text-[#D92525]" />
      </motion.div>
    </div>
  );

  const getAnimation = () => {
    switch (rules[currentRule].animation) {
      case 'prediction': return <PredictionAnimation />;
      case 'calculation': return <CalculationAnimation />;
      case 'zones': return <ZonesAnimation />;
      case 'trial': return <TrialAnimation />;
      case 'duplicate': return <DuplicateAnimation />;
      case 'elimination': return <EliminationAnimation />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full"
      >
        {/* Progress */}
        <div className="flex gap-2 mb-12 justify-center">
          {rules.map((_, i) => (
            <div
              key={i}
              className={`w-12 h-1 rounded ${i <= currentRule ? 'bg-[#D92525]' : 'bg-gray-700'}`}
            />
          ))}
        </div>

        {/* Rule Card */}
        <div className="game-card rounded-xl p-12 text-center min-h-[500px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {showAnimation && (
              <motion.div
                key={currentRule}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="mb-8"
                >
                  {rules[currentRule].icon}
                </motion.div>

                {/* Title */}
                <h2 className="text-4xl font-bold mb-6 text-white">
                  {rules[currentRule].title}
                </h2>

                {/* 2D Animation */}
                <div className="mb-8 h-40 flex items-center justify-center">
                  {getAnimation()}
                </div>

                {/* Description */}
                <p className="text-xl text-gray-400 max-w-lg">
                  {rules[currentRule].description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleNext}
            className="btn-horror px-8 py-4 bg-transparent border-2 border-[#D92525] text-[#D92525] hover:bg-[#D92525] hover:text-black rounded-none"
            data-cursor-hover
          >
            {currentRule < rules.length - 1 ? (
              <>
                NEXT RULE <ChevronRight className="ml-2" />
              </>
            ) : (
              'ENTER THE GAME'
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// ============== LOBBY SCREEN ==============
const LobbyScreen = ({
  onJoinRoom
}: {
  onJoinRoom: (roomCode: string, teamName: string) => void;
}) => {
  const [teamName, setTeamName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleJoin = () => {
    if (teamName.trim() && roomCode.trim()) {
      onJoinRoom(roomCode.trim().toUpperCase(), teamName.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="game-card rounded-xl p-12 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
          JOIN ROOM
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-500 mb-2 tracking-widest">TEAM NAME</label>
            <Input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter your team name"
              className="bg-[#0a0a0a] border-gray-700 text-white focus:border-[#D92525] rounded-none h-12 text-lg"
              maxLength={20}
              data-cursor-hover
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-2 tracking-widest">ROOM CODE</label>
            <Input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              className="bg-[#0a0a0a] border-gray-700 text-white focus:border-[#D92525] rounded-none text-center tracking-widest text-2xl h-16 font-mono font-bold"
              maxLength={6}
              data-cursor-hover
            />
          </div>

          <div className="pt-6">
            <Button
              onClick={handleJoin}
              disabled={!teamName.trim() || !roomCode.trim()}
              className="w-full text-xl bg-[#D92525] hover:bg-[#b91c1c] text-white rounded-none disabled:opacity-50 py-8 tracking-widest font-bold shadow-[0_0_20px_rgba(217,37,37,0.3)] hover:shadow-[0_0_30px_rgba(217,37,37,0.5)] transition-all"
              data-cursor-hover
            >
              ENTER GAME
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const GameNavbar = ({
  leftContent,
  centerContent,
  rightContent
}: {
  leftContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}) => {
  return (
    <div className="fixed top-0 left-0 w-full p-6 bg-transparent flex items-start justify-between z-[10000] pointer-events-none">
      <div className="flex items-start gap-8 pointer-events-auto">
        {leftContent}
      </div>
      <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-auto">
        {centerContent}
      </div>
      <div className="flex items-start justify-end pointer-events-auto">
        {rightContent}
      </div>
    </div>
  );
};

// ============== WAITING ROOM ==============
const WaitingRoom = ({
  gameState,
  onStartGame,
  isHost
}: {
  gameState: GameState;
  onStartGame: () => void;
  isHost: boolean;
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="mb-8">
          <p className="text-gray-500 mb-2">ROOM CODE</p>
          <div className="text-5xl font-bold tracking-[0.3em] text-[#D92525] glow-red">
            {gameState.roomCode}
          </div>
        </div>

        <div className="game-card rounded-xl p-8 mb-8 max-w-2xl">
          <h3 className="text-xl mb-6 text-gray-400">TEAMS ({gameState.teams.length}/5)</h3>
          <div className="space-y-3">
            {gameState.teams.map((team, i) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded border border-gray-800"
              >
                <span className="text-lg">{team.name}</span>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </motion.div>
            ))}
            {[...Array(5 - gameState.teams.length)].map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center justify-between p-4 bg-[#0a0a0a]/50 rounded border border-gray-800/50"
              >
                <span className="text-gray-600">Waiting...</span>
                <div className="w-5 h-5 rounded-full border-2 border-gray-700" />
              </div>
            ))}
          </div>
        </div>

        {isHost ? (
          <Button
            onClick={onStartGame}
            disabled={gameState.teams.length < 2}
            className="btn-horror px-12 py-6 text-xl bg-[#D92525] hover:bg-[#b91c1c] text-white rounded-none disabled:opacity-50"
            data-cursor-hover
          >
            START GAME
          </Button>
        ) : (
          <p className="text-gray-500">Waiting for host to start...</p>
        )}
      </motion.div>
    </div>
  );
};

// ============== PREDICTION PHASE ==============
const PredictionPhase = ({
  gameState,
  onSubmit
}: {
  gameState: GameState;
  onSubmit: (number: number) => void;
}) => {
  const [number, setNumber] = useState<number | ''>('');
  // Local timer removed in favor of server sync
  // const [timeLeft, setTimeLeft] = useState(30);
  const [submitted, setSubmitted] = useState(false);

  // Auto-submit triggers are now handled by server state transitions or manual check
  // Actually, server force ends phases. Client just needs to show time.

  const handleSubmit = () => {
    const value = number === '' ? 0 : Math.max(0, Math.min(100, number));
    setSubmitted(true);
    onSubmit(value);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Header Info */}
      <GameNavbar
        leftContent={
          <div className="flex items-center gap-10">
            {/* Round */}
            <div className="flex flex-col items-center">
              <p className="text-gray-500 font-semibold tracking-[0.2em] text-[10px] uppercase mb-1">ROUND</p>
              <p className="text-5xl font-mono font-bold leading-none osd-text-red">
                {gameState.round.toString()}
              </p>
            </div>

            <div className="h-10 w-px bg-white/10"></div>

            {/* Team Scores List */}
            <div className="flex gap-8">
              {gameState.teams.map(team => (
                <div key={team.id} className="flex flex-col items-center">
                  <span className="text-[10px] text-gray-500 font-semibold tracking-[0.2em] uppercase mb-1">{team.name}</span>
                  <span className={`text-3xl font-mono font-bold leading-none ${team.score < 0 ? 'osd-text-red' : 'osd-text-green'}`}>
                    {team.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        }
        centerContent={null}
        rightContent={
          <div className="flex flex-col items-end">
            <p className="text-gray-500 font-semibold tracking-[0.2em] text-[10px] uppercase mb-1">TIMER</p>
            <div className={`text-5xl font-mono font-bold leading-none tracking-widest ${gameState.timeRemaining <= 10 ? 'osd-text-red' : 'osd-text-white'}`}>
              {gameState.timeRemaining.toString().padStart(2, '0')}s
            </div>
          </div>
        }
      />

      {/* Joker Rule Display - Centered below header */}
      {gameState.jokerRule && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-32 left-1/2 -translate-x-1/2 bg-[#D92525]/10 border border-[#D92525] px-8 py-4 rounded max-w-2xl text-center backdrop-blur-sm z-50"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-6 h-6 text-[#D92525]" />
            <span className="text-[#D92525] font-bold tracking-widest text-sm">METICULOUS RULE ACTIVE</span>
          </div>
          <p className="text-white font-mono text-xl leading-tight">{gameState.jokerRule}</p>
        </motion.div>
      )}

      {/* Duplicate Warning */}
      {gameState.duplicatePenaltyActive && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-48 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[#D92525] bg-[#D92525]/10 px-8 py-4 rounded border border-[#D92525]/30 z-40"
        >
          <AlertTriangle className="w-6 h-6" />
          <span className="font-bold tracking-widest">DUPLICATE PENALTY ACTIVE</span>
        </motion.div>
      )}

      <div className="text-center">
        <h2 className="text-5xl font-bold mb-4">PREDICTION PHASE</h2>
        <p className="text-xl text-gray-500 mb-12">
          Choose a number from 0 to 100. Closest to the target wins safety.
        </p>

        {!submitted ? (
          <div className="flex flex-col items-center">
            <div className="relative mb-8">
              <Input
                type="number"
                value={number}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setNumber('');
                  } else {
                    const num = parseInt(val);
                    if (!isNaN(num) && num >= 0 && num <= 100) {
                      setNumber(num);
                    }
                  }
                }}
                placeholder="0-100"
                className="w-48 h-32 text-6xl text-center bg-[#0a0a0a] border-2 border-gray-700 text-white focus:border-[#D92525] rounded-none"
                autoFocus
                data-cursor-hover
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={number === ''}
              className="px-12 py-6 text-xl bg-[#D92525] hover:bg-[#b91c1c] text-white rounded-none disabled:opacity-50"
              data-cursor-hover
            >
              SUBMIT PREDICTION
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className="w-32 h-32 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <p className="text-2xl text-green-500">PREDICTION LOCKED</p>
            <p className="text-4xl font-bold mt-4">{number}</p>
            <p className="text-gray-500 mt-8">Waiting for other teams...</p>
          </motion.div>
        )}

        {/* Team Status */}
        <div className="mt-16 flex justify-center gap-4">
          {gameState.teams.map((team) => (
            <div
              key={team.id}
              className={`w-3 h-3 rounded-full ${team.prediction !== null ? 'bg-green-500' : 'bg-gray-700'
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ============== COMPUTATION PHASE ==============
const ComputationPhase = ({ gameState }: { gameState: GameState }) => {
  const [step, setStep] = useState(0);
  const predictions = gameState.teams.map(t => ({
    name: t.name.charAt(0).toUpperCase(),
    value: t.prediction
  })).filter((p): p is { name: string; value: number } => p.value !== null);

  useEffect(() => {
    const sequence = async () => {
      // Slower animation pace
      await new Promise(r => setTimeout(r, 1500)); // Start arrows at 1.5s
      setStep(1);
      await new Promise(r => setTimeout(r, 2500)); // Show avg at 4s
      setStep(2);
      await new Promise(r => setTimeout(r, 2500)); // Show target at 6.5s
      setStep(3);
      await new Promise(r => setTimeout(r, 3000)); // Show zones at 9.5s
      setStep(4);
    };
    sequence();
  }, []);

  const average = predictions.length > 0
    ? predictions.reduce((a, b) => a + b.value, 0) / predictions.length
    : 0;
  const target = average * gameState.multiplier;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center w-full max-w-6xl mx-auto flex flex-col items-center"
      >
        <h2 className="text-4xl font-bold mb-12 text-gray-500 tracking-widest">CALCULATING TARGET...</h2>

        {/* Architecture Flow Diagram */}
        <div className="relative w-full flex flex-col items-center">
          {/* Step 1: Team Predictions Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: step >= 0 ? 1 : 0.3 }}
            className="flex flex-wrap justify-center gap-8 mb-8"
          >
            {predictions.map((pred, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: i * 0.15, type: 'spring' }}
                className="relative"
              >
                <div className="w-24 h-24 bg-[#0a0a0a] border-2 border-gray-600 rounded-xl flex flex-col items-center justify-center shadow-lg">
                  <span className="text-xl text-gray-400 font-bold mb-1">{pred.name}</span>
                  <span className="text-3xl font-bold text-white font-mono">{pred.value}</span>
                </div>
                {/* Arrow down */}
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: step >= 1 ? 1 : 0, height: step >= 1 ? 60 : 0 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full w-0.5 bg-[#D92525]"
                  style={{ transformOrigin: 'top' }}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Step 2: Converging to Average */}
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative py-12 w-full flex justify-center"
            >
              {/* Converging arrows - Simplified to just CSS lines for better centering or keep SVG but ensure bounds */}
              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
                {/* Logic for lines might need to be dynamic based on positions, but for now we keep the layout consistent */}
              </svg>

              <div className="flex items-center justify-center gap-6 bg-[#0a0a0a]/80 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="px-8 py-4 bg-[#1a1a1a] border border-gray-600 rounded-xl"
                >
                  <span className="text-gray-400 text-lg mr-2">AVG</span>
                  <span className="text-4xl font-bold text-white font-mono">{average.toFixed(2)}</span>
                </motion.div>

                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="text-4xl text-[#D92525] font-bold"
                >
                  ×
                </motion.span>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="px-8 py-4 bg-[#1a1a1a] border border-[#D92525] rounded-xl shadow-[0_0_15px_rgba(217,37,37,0.3)]"
                >
                  <span className="text-[#D92525] text-4xl font-bold font-mono">0.8</span>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Target Number */}
          {step >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-8"
            >
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="flex flex-col items-center"
              >
                <div className="text-8xl font-bold text-[#D92525] glow-red mb-4 font-mono tracking-tighter">
                  {target.toFixed(2)}
                </div>
                <p className="text-gray-500 tracking-[0.5em] text-sm font-bold uppercase">Target Number</p>
              </motion.div>
            </motion.div>
          )}

          {/* Step 4: Zone Assignment Preview */}
          {step >= 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl"
            >
              {/* Green Zone */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="green-zone rounded-2xl p-8 flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-500"
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-green-500" />
                  <span className="text-green-500 font-bold text-2xl tracking-widest">SAFE ZONE</span>
                </div>
                <p className="text-gray-400 mb-2">Closest to Target</p>
                <p className="text-white font-bold text-lg">NO TRIAL REQUIRED</p>
              </motion.div>

              {/* Red Zone */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="red-zone rounded-2xl p-8 flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-500"
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Swords className="w-8 h-8 text-[#D92525]" />
                  <span className="text-[#D92525] font-bold text-2xl tracking-widest">RED ZONE</span>
                </div>
                <p className="text-gray-400 mb-2">All Other Teams</p>
                <p className="text-white font-bold text-lg">MUST FACE TRIAL</p>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ============== ZONE REVEAL PHASE ==============
const ZoneRevealPhase = ({ gameState }: { gameState: GameState }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Sequence
    const timer1 = setTimeout(() => setStep(1), 1000); // Show Target
    const timer2 = setTimeout(() => setStep(2), 3000); // Move Teams

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const greenTeamId = gameState.greenZoneTeam;
  const redTeamIds = gameState.redZoneTeams;
  const target = gameState.targetNumber || 0;
  const isDuplicateRound = greenTeamId === null && step >= 2;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 overflow-hidden relative">
      {/* Background Zones (Always visible but subtle) */}
      {!isDuplicateRound && (
        <div className="absolute inset-0 flex">
          <div className="w-1/2 bg-green-900/5 border-r border-green-500/10 flex flex-col items-center pt-32 transition-colors duration-1000"
            style={{ backgroundColor: step >= 2 ? 'rgba(20, 83, 45, 0.1)' : 'transparent' }}>
            <Shield className="w-32 h-32 text-green-500/10 mb-4" />
            <h2 className="text-4xl font-bold text-green-500/20 tracking-widest">SAFE ZONE</h2>
          </div>
          <div className="w-1/2 bg-red-900/5 flex flex-col items-center pt-32 transition-colors duration-1000"
            style={{ backgroundColor: step >= 2 ? 'rgba(127, 29, 29, 0.1)' : 'transparent' }}>
            <Swords className="w-32 h-32 text-[#D92525]/10 mb-4" />
            <h2 className="text-4xl font-bold text-[#D92525]/20 tracking-widest">TRIAL ZONE</h2>
          </div>
        </div>
      )}

      {/* Duplicate / Confusion Background */}
      {isDuplicateRound && (
        <div className="absolute inset-0 bg-[#D92525]/10 flex flex-col items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <AlertTriangle className="w-96 h-96 text-[#D92525]/20" />
          </motion.div>
        </div>
      )}

      <LayoutGroup>
        {/* Header Area */}
        <div className="relative z-10 w-full max-w-6xl mb-12 h-32 flex items-center justify-center">
          <AnimatePresence>
            {step >= 1 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className={`bg-[#0a0a0a] border-2 ${isDuplicateRound ? 'border-[#D92525] animate-pulse' : 'border-[#D92525]'} px-12 py-6 rounded-xl flex flex-col items-center shadow-[0_0_50px_rgba(217,37,37,0.3)]`}
              >
                <h3 className="text-gray-500 tracking-widest text-sm mb-2">{isDuplicateRound ? 'CONFUSION' : 'TARGET NUMBER'}</h3>
                <h1 className="text-6xl font-bold text-[#D92525] glow-red">{target.toFixed(2)}</h1>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Teams Container */}
        <div className="relative z-10 w-full max-w-6xl h-[400px]">
          {/* Initial Lineup (Step 0 & 1) */}
          {step < 2 && (
            <div className="flex justify-center flex-wrap gap-8 pt-20">
              {gameState.teams.map((team: any) => (
                <TeamCard key={team.id} team={team} target={target} showDiff={step >= 1} />
              ))}
            </div>
          )}

          {/* Split Zones (Step 2+) - Normal Case */}
          {step >= 2 && !isDuplicateRound && (
            <div className="flex h-full w-full">
              {/* Green Zone Container */}
              <div className="w-1/2 flex flex-col items-center gap-6 pt-20">
                {gameState.teams.filter((t: any) => t.id === greenTeamId).map((team: any) => (
                  <TeamCard key={team.id} team={team} target={target} showDiff={true} isGreen={true} />
                ))}
              </div>

              {/* Red Zone Container */}
              <div className="w-1/2 flex flex-wrap justify-center content-start gap-6 pt-20 pl-8 border-l border-dashed border-gray-800">
                {gameState.teams.filter((t: any) => redTeamIds.includes(t.id)).map((team: any) => (
                  <TeamCard key={team.id} team={team} target={target} showDiff={true} isRed={true} />
                ))}
              </div>
            </div>
          )}

          {/* Duplicate Case - All clustered with Warning */}
          {step >= 2 && isDuplicateRound && (
            <div className="flex flex-col items-center gap-8 pt-12">
              <h2 className="text-4xl font-bold text-[#D92525] tracking-[0.5em] animate-pulse">DUPLICATE NUMBERS DETECTED</h2>
              <div className="flex justify-center flex-wrap gap-8">
                {gameState.teams.map((team: any) => (
                  <TeamCard key={team.id} team={team} target={target} showDiff={true} isRed={true} />
                ))}
              </div>
              <div className="text-2xl text-white font-mono bg-[#D92525] px-6 py-2 rounded">
                ALL TEAMS: -2 POINTS
              </div>
            </div>
          )}
        </div>
      </LayoutGroup>

      {(gameState.duplicatePenaltyActive || isDuplicateRound) && step >= 2 && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-12 flex items-center gap-4 bg-[#D92525]/20 border border-[#D92525] px-8 py-4 rounded-full z-20"
        >
          <Copy className="w-6 h-6 text-[#D92525]" />
          <span className="text-[#D92525] font-bold tracking-widest">ROUND VOIDED: GLOBAL PENALTY</span>
        </motion.div>
      )}
    </div>
  );
};

const TeamCard = ({
  team,
  target,
  showDiff = false,
  isGreen = false,
  isRed = false
}: {
  team: any,
  target: number,
  showDiff?: boolean,
  isGreen?: boolean,
  isRed?: boolean
}) => {
  const diff = team.prediction !== null ? Math.abs(team.prediction - target) : null;

  return (
    <motion.div
      layoutId={team.id}
      className={`w-40 h-52 rounded-xl border-2 flex flex-col items-center justify-center relative bg-[#0a0a0a] ${isGreen ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]' :
        isRed ? 'border-[#D92525] shadow-[0_0_30px_rgba(217,37,37,0.2)]' :
          'border-gray-700'
        }`}
    >
      {isGreen && (
        <div className="absolute -top-3 bg-green-500 text-black px-3 py-1 rounded-full text-xs font-bold">
          SAFE
        </div>
      )}
      {isRed && (
        <div className="absolute -top-3 bg-[#D92525] text-white px-3 py-1 rounded-full text-xs font-bold">
          TRIAL
        </div>
      )}

      <div className="w-14 h-14 rounded-full bg-gray-800 mb-3 flex items-center justify-center overflow-hidden">
        {/* Avatar or Initials */}
        <span className="text-xl font-bold text-gray-400">{team.name.substring(0, 2).toUpperCase()}</span>
      </div>

      <div className="text-center">
        <h3 className="text-white font-bold text-sm mb-1">{team.name}</h3>
        <p className="text-2xl font-mono text-gray-300">{team.prediction ?? '?'}</p>
      </div>

      {showDiff && diff !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`absolute -bottom-6 text-xs font-mono opacity-60 ${isGreen ? 'text-green-500' : isRed ? 'text-[#D92525]' : 'text-gray-500'
            }`}
        >
          Δ{diff.toFixed(2)}
        </motion.div>
      )}
    </motion.div>
  );
};

// ============== TRIAL PHASE ==============
const TrialPhase = ({
  gameState,
  onAnswer
}: {
  gameState: GameState;
  onAnswer: (answer: number | string) => void;
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  // Time is now synced from server
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    if (question?.type === 'text') {
      onAnswer(textAnswer);
    } else {
      onAnswer(selectedAnswer ?? -1);
    }
  };

  const question = gameState.trialQuestion;
  if (!question) return null;

  const isTextQuestion = question.type === 'text';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Header With Large Timer */}
      <GameNavbar
        leftContent={null}
        centerContent={null}
        rightContent={
          <div className="flex flex-col items-end">
            <p className="text-gray-500 font-semibold tracking-[0.2em] text-[10px] uppercase mb-1">TIMER</p>
            <div className={`text-5xl font-mono font-bold leading-none tracking-widest ${gameState.timeRemaining <= 5 ? 'osd-text-red' : 'osd-text-white'}`}>
              {gameState.timeRemaining.toString().padStart(2, '0')}s
            </div>
          </div>
        }
      />

      <div className="max-w-2xl w-full relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Swords className="w-8 h-8 text-[#D92525]" />
            <h2 className="text-3xl font-bold text-[#D92525] opacity-100">TRIAL PHASE</h2>
          </div>
          <p className="text-gray-500">
            {isTextQuestion ? 'Type your answer below' : 'Answer correctly to avoid penalty'}
          </p>
        </div>

        <div className="game-card rounded-xl p-8 mb-8">
          <p className="text-2xl text-center mb-8 whitespace-pre-line">{question.question}</p>

          {!submitted ? (
            isTextQuestion ? (
              /* Text / Fill-in-the-blank input */
              <div className="space-y-4">
                <textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={4}
                  className="w-full p-4 bg-[#0a0a0a] border-2 border-gray-700 rounded-lg text-white text-lg focus:border-[#D92525] focus:outline-none resize-none transition-colors"
                />
              </div>
            ) : (
              /* MCQ options grid */
              <div className="grid grid-cols-2 gap-4">
                {question.options?.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedAnswer(i)}
                    className={`p-6 border-2 rounded-lg text-xl transition-all ${selectedAnswer === i
                      ? 'border-[#D92525] bg-[#D92525]/20'
                      : 'border-gray-700 hover:border-gray-500'
                      }`}
                    data-cursor-hover
                  >
                    {option}
                  </button>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Timer className="w-10 h-10 text-gray-400" />
              </motion.div>
              <p className="text-xl text-gray-400">Answer submitted. Waiting for Host...</p>
            </div>
          )}
        </div>

        {!submitted && (
          <Button
            onClick={handleSubmit}
            disabled={isTextQuestion ? !textAnswer.trim() : selectedAnswer === null}
            className="w-full py-6 text-xl bg-[#D92525] hover:bg-[#b91c1c] text-white rounded-none disabled:opacity-50"
            data-cursor-hover
          >
            SUBMIT ANSWER
          </Button>
        )}
      </div>
    </div>
  );
};

// ============== SAFE SCREEN (SANCTUARY) ==============
const SafeScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[#020a05]">
        <div className="absolute inset-0 bg-green-500/5 noise-overlay mix-blend-overlay opacity-30" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-green-500/10 blur-[100px] rounded-full opacity-30" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 max-w-4xl w-full text-center"
      >
        {/* Eye/Shield Icon */}
        <div className="relative mb-12 inline-block">
          <motion.div
            className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"
          />
          <Shield className="w-32 h-32 text-green-500/80 relative z-10 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute bottom-0 left-0 h-1 bg-green-500/50"
          />
        </div>

        <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-green-300 to-green-700 tracking-widest mb-6 font-mono">
          SANCTUARY
        </h1>

        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-green-500/50" />
          <p className="text-xl md:text-2xl text-green-500/60 font-mono tracking-[0.2em] uppercase">
            HIDDEN FROM THE JOKER
          </p>
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-green-500/50" />
        </div>

        <div className="p-8 border border-green-500/20 bg-green-900/5 rounded-xl backdrop-blur-sm max-w-xl mx-auto">
          <p className="text-gray-400 tracking-widest text-sm">
            WAITING FOR SURVIVORS...
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// ============== RESULTS PHASE ==============
const ResultsPhase = ({
  gameState,
  isControl,
  onNextRound
}: {
  gameState: GameState;
  isControl: boolean;
  onNextRound: () => void;
}) => {
  const [showFeedback, setShowFeedback] = useState(true);
  const sortedTeams = [...gameState.teams].sort((a, b) => b.score - a.score);

  // Determine local player's result
  const myTeam = gameState.teams.find(t => t.id === gameState.currentTeamId);
  const isRedZone = myTeam && gameState.redZoneTeams.includes(myTeam.id);
  const isWrong = myTeam && gameState.wrongPlayers?.includes(myTeam.id);
  const isDuplicate = gameState.duplicatePenaltyActive;

  useEffect(() => {
    const timer = setTimeout(() => setShowFeedback(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  if (showFeedback && myTeam) {
    let message = "";
    let colorClass = "";
    let subMessage = "";

    if (isDuplicate) {
      // Handle Duplicate Case - Override everything else
      message = "VOID";
      colorClass = "text-[#D92525]";
      subMessage = "-2 PENALTY APPLIED";
    } else if (!isRedZone) {
      // Green Zone - Safe
      message = "SAFE";
      colorClass = "text-green-500";
      subMessage = "SANCTUARY GRANTED";
    } else {
      if (isWrong) {
        message = "WRONG";
        colorClass = "text-[#D92525]";
        subMessage = "PENALTY APPLIED";
      } else {
        message = "CORRECT";
        colorClass = "text-green-500";
        subMessage = "SURVIVED THE TRIAL";
      }
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-black z-50 fixed inset-0">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <h1 className={`text-[10rem] md:text-[12rem] leading-none font-bold mb-8 tracking-tighter ${colorClass} glow-red`}>
            {message}
          </h1>
          <p className="text-2xl md:text-4xl text-gray-400 tracking-[1em] font-bold uppercase">{subMessage}</p>
          {isDuplicate && (
            <p className="text-xl text-[#D92525] mt-4 font-mono">DUPLICATE NUMBERS DETECTED</p>
          )}
        </motion.div>
      </div>
    );
  } else if (showFeedback && !myTeam) {
    // Spectator View
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-black z-50 fixed inset-0">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <h1 className="text-8xl font-bold mb-4 tracking-tighter text-white">
            RESULTS
          </h1>
          <p className="text-2xl text-gray-500 tracking-[1em]">SCORES UPDATED</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-5xl w-full"
      >
        <h2 className="text-5xl font-bold text-center mb-12 tracking-tighter">STANDINGS</h2>

        <div className="game-card rounded-2xl p-8 mb-8 border-2 border-gray-800">
          <div className="space-y-4">
            {sortedTeams.map((team, i) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center justify-between p-6 rounded-xl ${team.score <= -10 ? 'bg-[#D92525]/20 border-2 border-[#D92525]' : 'bg-[#0a0a0a] border border-gray-800'
                  }`}
              >
                <div className="flex items-center gap-6">
                  <span className="text-3xl font-bold text-gray-500 font-mono">#{i + 1}</span>
                  <span className="text-2xl text-white font-bold tracking-wide">{team.name}</span>
                  {team.score <= -10 && <Skull className="w-8 h-8 text-[#D92525]" />}
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-5xl font-bold font-mono ${team.score < 0 ? 'text-[#D92525]' : 'text-green-500'
                    }`}>
                    {team.score > 0 ? '+' : ''}{team.score}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {isControl ? (
          <div className="flex justify-center">
            <Button
              onClick={onNextRound}
              className="px-12 py-6 text-2xl bg-[#D92525] hover:bg-[#b91c1c] text-white rounded-none tracking-widest"
              data-cursor-hover
            >
              START NEXT ROUND
            </Button>
          </div>
        ) : (
          <p className="text-center text-gray-500 text-xl tracking-widest">
            WAITING FOR HOST...
          </p>
        )}
      </motion.div>
    </div>
  );
};


// ============== ELIMINATION SCREEN ==============
const EliminationScreen = ({ gameState }: { gameState: GameState }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black">
      {/* Clear/Brightened Background - Removing the dark overlay effect by using a different blend or just raw image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-50 contrast-125 saturate-0"
        style={{ backgroundImage: 'url("/joker-bg.png")' }}
      />

      {/* Glitch Overlay */}
      <div className="absolute inset-0 noise-overlay opacity-50 mix-blend-overlay" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "circOut" }}
        className="relative z-10 text-center p-12 border-y-4 border-[#D92525] bg-black/80 backdrop-blur-md w-full"
      >
        <motion.div
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }}
          className="mb-8 inline-block"
        >
          <Skull className="w-32 h-32 text-[#D92525]" />
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-bold text-[#D92525] tracking-widest mb-4 glitch-text" data-text="ELIMINATED">
          ELIMINATED
        </h1>

        <p className="text-2xl md:text-4xl text-white font-mono tracking-[0.5em] uppercase">
          THE JOKER HAS CLAIMED YOU
        </p>

        {gameState.currentTeamId && (
          <div className="mt-8 text-xl text-[#D92525] font-mono">
            FINAL SCORE: {gameState.teams.find(t => t.id === gameState.currentTeamId)?.score || -10}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-12 text-gray-500"
        >
          Waiting for the game to end...
        </motion.div>
      </motion.div>
    </div>
  );
};

// ============== GAME OVER PHASE ==============
const GameOverPhase = ({ gameState }: { gameState: GameState }) => {
  const winner = gameState.teams.find(t => !t.isEliminated);
  const sortedTeams = [...gameState.teams].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {winner ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="mb-8"
            >
              <div className="w-40 h-40 rounded-full bg-green-500/20 border-4 border-green-500 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-20 h-20 text-green-500" />
              </div>
            </motion.div>
            <h2 className="text-6xl font-bold mb-4 text-green-500">GAME OVER</h2>
            <p className="text-3xl text-white mb-8">{winner.name} WINS!</p>
          </>
        ) : (
          <>
            <Skull className="w-40 h-40 text-[#D92525] mx-auto mb-8" />
            <h2 className="text-6xl font-bold mb-4 text-[#D92525]">ALL ELIMINATED</h2>
            <p className="text-2xl text-gray-500 mb-8">The Joker claims all...</p>
          </>
        )}

        <div className="game-card rounded-xl p-8 max-w-lg mx-auto">
          <h3 className="text-xl text-gray-500 mb-6">FINAL STANDINGS</h3>
          <div className="space-y-3">
            {sortedTeams.map((team, i) => (
              <div
                key={team.id}
                className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded"
              >
                <span className="text-gray-400">#{i + 1}</span>
                <span>{team.name}</span>
                <span className={team.score < 0 ? 'text-[#D92525]' : 'text-green-500'}>
                  {team.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={() => {
            sessionStorage.removeItem('roomCode');
            sessionStorage.removeItem('playerName');
            window.location.reload();
          }}
          className="mt-12 btn-horror px-12 py-6 text-xl bg-[#D92525] hover:bg-[#b91c1c] text-white rounded-none"
          data-cursor-hover
        >
          PLAY AGAIN
        </Button>
      </motion.div>
    </div>
  );
};

// ============== SPECTATOR VIEW ==============
const SpectatorView = ({
  gameState,
  submittedTeams
}: {
  gameState: GameState;
  submittedTeams: Set<string>;
}) => {
  const { socket } = useSocket();
  const sortedTeams = [...gameState.teams].sort((a, b) => b.score - a.score);
  const [textAnswers, setTextAnswers] = useState<{ playerId: string; playerName: string; answer: string }[]>([]);
  const [judgments, setJudgments] = useState<Map<string, boolean>>(new Map());

  const isTextQuestion = gameState.trialQuestion?.type === 'text';

  useEffect(() => {
    if (!socket) return;

    const handleTextAnswers = (data: { answers: { playerId: string; playerName: string; answer: string }[] }) => {
      setTextAnswers(data.answers);
    };

    const handleJudgmentsUpdated = (data: { judgments: { playerId: string; isCorrect: boolean }[] }) => {
      const newMap = new Map<string, boolean>();
      data.judgments.forEach(j => newMap.set(j.playerId, j.isCorrect));
      setJudgments(newMap);
    };

    socket.on('textAnswersForReview', handleTextAnswers);
    socket.on('adminJudgmentsUpdated', handleJudgmentsUpdated);

    return () => {
      socket.off('textAnswersForReview', handleTextAnswers);
      socket.off('adminJudgmentsUpdated', handleJudgmentsUpdated);
    };
  }, [socket]);

  const handleForceEndTrial = () => {
    if (socket) {
      if (confirm('Are you sure you want to force end the trial?')) {
        socket.emit('forceEndTrial', gameState.roomCode, (response: any) => {
          if (!response.success) alert(response.error);
        });
      }
    }
  };

  const handleJudgeAnswer = (playerId: string, isCorrect: boolean) => {
    if (socket) {
      socket.emit('adminJudgeTrialAnswer', gameState.roomCode, playerId, isCorrect, (response: any) => {
        if (!response.success) alert(response.error);
      });
    }
  };

  const handleFinalizeTrial = () => {
    if (socket) {
      socket.emit('adminFinalizeTrial', gameState.roomCode, (response: any) => {
        if (!response.success) alert(response.error);
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-8 pt-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Leaderboard Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="game-card rounded-xl p-6 border border-[#D92525]/30">
            <div className="flex items-center gap-3 mb-6">
              <Crown className="w-6 h-6 text-[#D92525]" />
              <h3 className="text-xl font-bold text-white tracking-widest">LEADERBOARD</h3>
            </div>
            <div className="space-y-3">
              {sortedTeams.map((team, i) => (
                <div
                  key={team.id}
                  className={`flex items-center justify-between p-4 rounded border ${team.isEliminated
                    ? 'bg-[#1a0505] border-[#D92525]/50 opacity-60'
                    : 'bg-[#0a0a0a] border-gray-800'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold ${i < 3 ? 'text-[#D92525]' : 'text-gray-500'}`}>
                      #{i + 1}
                    </span>
                    <span className="text-white">{team.name}</span>
                    {team.isEliminated && <Skull className="w-4 h-4 text-[#D92525]" />}
                  </div>
                  <span className={`font-bold ${team.score < 0 ? 'text-[#D92525]' : 'text-green-500'}`}>
                    {team.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status Column */}
        <div className="lg:col-span-2">
          <div className="game-card rounded-xl p-8 h-full border border-gray-800">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col">
                <h2 className="text-3xl font-bold text-white tracking-widest">
                  {gameState.phase === 'prediction' ? 'PREDICTION PHASE' : 'TRIAL PHASE'}
                </h2>
                {gameState.jokerRule && (
                  <div className="flex items-center gap-2 mt-2 text-[#D92525]">
                    <Crown className="w-4 h-4" />
                    <span className="text-sm font-bold tracking-widest">RULE: {gameState.jokerRule}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500 tracking-widest">ROUND</p>
                  <p className="text-2xl font-bold text-[#D92525]">{gameState.round}</p>
                </div>
                <div className="w-px h-8 bg-gray-800" />
                <div className="text-right">
                  <p className="text-xs text-gray-500 tracking-widest">TIMER</p>
                  <p className={`text-2xl font-bold font-mono ${gameState.timeRemaining <= 10 ? 'text-[#D92525]' : 'text-white'}`}>
                    {gameState.timeRemaining}s
                  </p>
                </div>
              </div>
            </div>

            {/* Phase Specific Content */}
            {gameState.phase === 'prediction' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gameState.teams.map((team) => (
                  <motion.div
                    key={team.id}
                    animate={{
                      borderColor: submittedTeams.has(team.id) ? '#22c55e' : '#374151',
                      backgroundColor: submittedTeams.has(team.id) ? 'rgba(34, 197, 94, 0.1)' : 'transparent'
                    }}
                    className="p-6 rounded-lg border-2 border-gray-700 flex flex-col items-center justify-center gap-3 aspect-square"
                  >
                    <div className={`w-3 h-3 rounded-full ${submittedTeams.has(team.id) ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-gray-600'}`} />
                    <span className="text-lg font-bold text-white text-center">{team.name}</span>
                    <span className={`text-xs tracking-widest ${submittedTeams.has(team.id) ? 'text-green-500' : 'text-gray-500'}`}>
                      {submittedTeams.has(team.id) ? 'SUBMITTED' : 'THINKING...'}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}

            {gameState.phase === 'trial' && (
              <div className="space-y-6">
                <div className="bg-[#0a0a0a] p-6 rounded-lg border border-gray-800">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-gray-500 text-sm tracking-widest">CURRENT QUESTION</p>
                    {isTextQuestion && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded tracking-widest">OPEN-ENDED</span>
                    )}
                  </div>
                  <p className="text-2xl text-white whitespace-pre-line">{gameState.trialQuestion?.question}</p>

                  {/* MCQ options (only for MCQ questions) */}
                  {!isTextQuestion && gameState.trialQuestion?.options && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {gameState.trialQuestion.options.map((opt, i) => (
                        <div key={i} className={`p-3 rounded border border-gray-700 ${i === gameState.trialQuestion?.correctAnswer ? 'border-green-500/50 bg-green-500/10' : ''}`}>
                          <span className="text-gray-500 mr-2">{String.fromCharCode(65 + i)})</span>
                          <span className={i === gameState.trialQuestion?.correctAnswer ? 'text-green-500' : 'text-gray-300'}>{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Player submission status */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {gameState.redZoneTeams.map((teamId) => {
                    const team = gameState.teams.find(t => t.id === teamId);
                    if (!team) return null;
                    const hasAnswered = submittedTeams.has(teamId);

                    return (
                      <div key={teamId} className="p-4 rounded bg-[#D92525]/10 border border-[#D92525]/30 flex items-center justify-between">
                        <span className="text-white">{team.name}</span>
                        {hasAnswered ? (
                          <CheckCircle2 className="w-5 h-5 text-[#D92525]" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-[#D92525]/50 border-t-[#D92525] animate-spin" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Text answer review section (only for text questions when answers come in) */}
                {isTextQuestion && textAnswers.length > 0 && (
                  <div className="border border-yellow-500/30 rounded-xl p-6 bg-yellow-500/5">
                    <h4 className="text-lg font-bold text-yellow-400 tracking-widest mb-4">REVIEW ANSWERS</h4>
                    <div className="space-y-4">
                      {textAnswers.map((ta) => {
                        const judged = judgments.has(ta.playerId);
                        const isCorrect = judgments.get(ta.playerId);

                        return (
                          <div key={ta.playerId} className={`p-4 rounded-lg border ${judged ? (isCorrect ? 'border-green-500/50 bg-green-500/10' : 'border-[#D92525]/50 bg-[#D92525]/10') : 'border-gray-700 bg-[#0a0a0a]'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-bold">{ta.playerName}</span>
                              {judged && (
                                <span className={`text-xs tracking-widest font-bold ${isCorrect ? 'text-green-500' : 'text-[#D92525]'}`}>
                                  {isCorrect ? 'CORRECT' : 'WRONG'}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-300 text-sm mb-3 whitespace-pre-line bg-[#050505] p-3 rounded">{ta.answer}</p>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleJudgeAnswer(ta.playerId, true)}
                                className={`flex-1 py-2 text-sm rounded-none ${judged && isCorrect ? 'bg-green-600 text-white' : 'bg-green-600/20 text-green-500 border border-green-500/30 hover:bg-green-600 hover:text-white'}`}
                              >
                                ✓ CORRECT
                              </Button>
                              <Button
                                onClick={() => handleJudgeAnswer(ta.playerId, false)}
                                className={`flex-1 py-2 text-sm rounded-none ${judged && !isCorrect ? 'bg-[#D92525] text-white' : 'bg-[#D92525]/20 text-[#D92525] border border-[#D92525]/30 hover:bg-[#D92525] hover:text-white'}`}
                              >
                                ✗ WRONG
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Finalize button */}
                    <div className="mt-6">
                      <Button
                        onClick={handleFinalizeTrial}
                        className="w-full py-4 text-lg bg-yellow-500 hover:bg-yellow-600 text-black rounded-none tracking-widest font-bold"
                      >
                        REVEAL RESULTS
                      </Button>
                      <p className="text-center text-gray-600 mt-2 text-xs">
                        * Un-judged answers will be marked as WRONG
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-center mt-8">
                  <Button
                    onClick={handleForceEndTrial}
                    className="btn-horror px-8 py-4 bg-[#D92525] text-white hover:bg-red-700"
                  >
                    FORCE END TRIAL
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ============== MAIN APP ==============
function App() {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'entrance',
    round: 1,
    teams: [],
    roomCode: sessionStorage.getItem('roomCode') || '',
    playerName: sessionStorage.getItem('playerName') || undefined,
    currentTeamId: null,
    targetNumber: null,
    average: null,
    multiplier: 0.8,
    greenZoneTeam: null,
    redZoneTeams: [],
    duplicatePenaltyActive: false,
    duplicateDetected: false,
    trialQuestion: null,
    timeRemaining: 30,
    wrongPlayers: [] // Track players who got the trial wrong
  });
  const [showAdmin, setShowAdmin] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false);
  const [submittedTeams, setSubmittedTeams] = useState<Set<string>>(new Set());

  const { socket } = useSocket();

  // Socket Event Listeners
  useEffect(() => {
    if (!socket) return;

    // Auto-rejoin on reconnect
    socket.on('connect', () => {
      console.log('Socket connected/reconnected:', socket.id);
      if (gameState.roomCode && gameState.playerName) {
        console.log('Attempting auto-rejoin for:', gameState.playerName, gameState.roomCode);
        socket.emit('joinRoom', gameState.roomCode, gameState.playerName, (response: any) => {
          if (response.success) {
            console.log('Auto-rejoin successful');
            // Update current team ID from response
            setGameState(prev => ({
              ...prev,
              currentTeamId: response.playerId,
              // If we are in lobby but game started, the gameStarted event will fix our phase
              // If we are just in lobby, stay in lobby
            }));
          } else {
            console.error('Auto-rejoin failed:', response.error);
            // Clear storage if rejoin fails (e.g. room closed)
            if (response.error === 'Room not found' || response.error === 'Game already in progress' && !response.success) {
              // Actually if game in progress we MIGHT be allowed to rejoin if we were already there.
              // The server returns success: true for rejoin even if game in progress.
              // So if we get here, it's a real failure.
              sessionStorage.removeItem('roomCode');
              sessionStorage.removeItem('playerName');
              setGameState(prev => ({ ...prev, phase: 'entrance', roomCode: '', playerName: undefined }));
            }
          }
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('updatePlayers', (players: any[]) => {
      setGameState(prev => ({ ...prev, teams: players }));
    });

    socket.on('gameStarted', (data: any) => {
      let phase: any = 'prediction';
      // Map server state to client phase
      if (data.state === 'TRIAL') phase = 'trial';
      else if (data.state === 'SCORE_UPDATE') phase = 'results';
      else if (data.state === 'ZONE_ASSIGNMENT') phase = 'zone-reveal';
      else if (data.state === 'CALCULATION') phase = 'computation';
      // Default to prediction for other states or if undefined

      setGameState(prev => ({
        ...prev,
        phase,
        round: data.round,
        timeRemaining: data.timeLimit,
        trialQuestion: data.question || null,
        redZoneTeams: data.redPlayers || [],
        greenZoneTeam: data.greenPlayer || null,
        targetNumber: data.target || null,
        duplicatePenaltyActive: data.duplicatePenaltyActive || false,
        teams: data.players || prev.teams
      }));
      setSubmittedTeams(new Set());
    });

    socket.on('timerUpdate', (time: number) => {
      setGameState(prev => ({ ...prev, timeRemaining: time }));
    });

    socket.on('playerSubmitted', ({ playerId }: { playerId: string }) => {
      setSubmittedTeams(prev => new Set(prev).add(playerId));
    });

    socket.on('calculationComplete', (data: any) => {
      setGameState(prev => {
        // Update teams with their predictions
        const updatedTeams = prev.teams.map(team => {
          const playerNum = data.numbers.find((n: any) => n.playerId === team.id);
          return playerNum ? { ...team, prediction: playerNum.number } : team;
        });

        return {
          ...prev,
          phase: 'computation',
          teams: updatedTeams,
          average: data.average,
          targetNumber: data.target,
          multiplier: data.multiplier,
          duplicateDetected: data.hasDuplicates,
          greenZoneTeam: data.greenPlayer,
          redZoneTeams: data.redPlayers
        };
      });
    });

    socket.on('zoneAssignment', (data: any) => {
      setGameState(prev => ({
        ...prev,
        phase: 'zone-reveal',
        greenZoneTeam: data.greenPlayer,
        redZoneTeams: data.redPlayers,
        targetNumber: data.target
      }));
    });

    socket.on('duplicatePenalty', (data: any) => {
      setGameState(prev => ({
        ...prev,
        phase: 'zone-reveal', // Keep showing zones/scores
        duplicatePenaltyActive: true,
        teams: data.players
      }));
    });

    socket.on('trialStarted', (data: any) => {
      setGameState(prev => ({
        ...prev,
        phase: 'trial',
        trialQuestion: data.question,
        redZoneTeams: data.redPlayers,
        timeRemaining: data.timeLimit,
        duplicatePenaltyActive: false
      }));
      setSubmittedTeams(new Set());
    });

    socket.on('trialTimerUpdate', (time: number) => {
      setGameState(prev => ({ ...prev, timeRemaining: time }));
    });

    socket.on('scoreUpdate', (data: any) => {
      setGameState(prev => ({
        ...prev,
        phase: 'results',
        teams: data.players,
        wrongPlayers: data.wrongPlayers || []
      }));
    });

    socket.on('eliminationCheck', (data: any) => {
      setGameState(prev => ({
        ...prev,
        teams: data.players
      }));
    });

    socket.on('readyForNextRound', () => {
      // Optional: Auto-start next round or wait for host
    });

    socket.on('nextRoundStarted', (data: any) => {
      setGameState(prev => ({
        ...prev,
        phase: 'prediction',
        round: data.round,
        multiplier: data.multiplier,
        timeRemaining: data.timeLimit,
        targetNumber: null,
        average: null,
        greenZoneTeam: null,
        redZoneTeams: [],
        trialQuestion: null,
        duplicateDetected: false,
        duplicatePenaltyActive: false
      }));
      setSubmittedTeams(new Set());
    });

    socket.on('jokerRound', (data: any) => {
      // Handle Joker round logic/announcement
      setGameState(prev => ({
        ...prev,
        multiplier: data.newMultiplier
      }));
    });

    socket.on('gameOver', (data: any) => {
      setGameState(prev => ({
        ...prev,
        phase: 'game-over',
        teams: data.players
      }));
    });

    socket.on('ruleUpdate', (data: any) => {
      setGameState(prev => ({
        ...prev,
        jokerRule: data.rule
      }));
    });

    socket.on('updateGameRoles', (data: any) => {
      setGameState(prev => ({
        ...prev,
        greenZoneTeam: data.greenPlayer,
        redZoneTeams: data.redPlayers || [],
        targetNumber: data.target
      }));
    });

    return () => {
      socket.off('updatePlayers');
      socket.off('updateGameRoles');
      socket.off('gameStarted');
      socket.off('timerUpdate');
      socket.off('playerSubmitted');
      socket.off('ruleUpdate');
      socket.off('calculationComplete');
      socket.off('zoneAssignment');
      socket.off('duplicatePenalty');
      socket.off('trialStarted');
      socket.off('trialTimerUpdate');
      socket.off('scoreUpdate');
      socket.off('eliminationCheck');
      socket.off('readyForNextRound');
      socket.off('nextRoundStarted');
      socket.off('jokerRound');
      socket.off('gameOver');
    };
  }, [socket]);

  // Handlers
  const handleEnterGame = () => {
    setGameState(prev => ({ ...prev, phase: 'rules' }));
  };

  const handleRulesComplete = () => {
    setGameState(prev => ({ ...prev, phase: 'lobby' }));
  };



  const handleJoinRoom = (roomCode: string, teamName: string) => {
    if (!socket) return;
    socket.emit('joinRoom', roomCode, teamName, (response: any) => {
      if (response.success) {
        setGameState(prev => ({
          ...prev,
          roomCode: response.roomCode,
          currentTeamId: response.playerId,
          playerName: teamName,
          phase: 'lobby'
        }));
        sessionStorage.setItem('roomCode', response.roomCode);
        sessionStorage.setItem('playerName', teamName);
        setIsHost(false);
      } else {
        alert(response.error);
      }
    });
  };

  const handleStartGame = (code?: string, settings?: any) => {
    const targetCode = code || gameState.roomCode;

    if (code) {
      setIsSpectator(true);
      setGameState(prev => ({ ...prev, roomCode: code }));
    }

    if (targetCode && socket) {
      socket.emit('startGame', targetCode, settings, (response: any) => {
        if (!response.success) {
          alert(response.error);
        }
      });
    }
  };

  const handleSubmitPrediction = (number: number) => {
    if (socket) {
      socket.emit('submitNumber', gameState.roomCode, number, (response: any) => {
        if (!response.success) {
          alert(response.error);
        }
      });
    }
  };



  const handleTrialAnswer = (answer: number | string) => {
    if (socket) {
      socket.emit('submitTrialAnswer', gameState.roomCode, answer, (response: any) => {
        if (!response.success) {
          alert('Submission failed: ' + response.error);
        }
      });
    }
  };

  // Auto-advance removed to ensure Admin control
  // Progression is now handled by server events:
  // - scoreUpdate -> results
  // - nextRoundStarted -> prediction
  // - gameOver -> game-over

  return (
    <div className="relative min-h-screen bg-[#050505]">
      {/* Joker Background */}
      <div className="joker-background" />

      {/* Visual Effects */}
      <div className="noise-overlay" />
      <div className="scanlines" />
      <div className="vignette" />

      {/* Custom Cursor */}
      <CustomCursor />

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {gameState.currentTeamId && gameState.teams.find(t => t.id === gameState.currentTeamId)?.isEliminated && (
          <motion.div key="eliminated" className="relative z-[9999]">
            <EliminationScreen gameState={gameState} />
          </motion.div>
        )}

        {gameState.phase === 'entrance' && !gameState.currentTeamId && (
          <EntranceScreen key="entrance" onEnter={handleEnterGame} onAdminClick={() => setShowAdmin(true)} />
        )}
        {gameState.phase === 'rules' && (
          <RulesScreen key="rules" onComplete={handleRulesComplete} />
        )}
        {gameState.phase === 'lobby' && !gameState.currentTeamId && (
          <LobbyScreen
            key="lobby-empty"
            onJoinRoom={handleJoinRoom}
          />
        )}
        {gameState.phase === 'lobby' && gameState.currentTeamId && (
          <WaitingRoom
            key="waiting"
            gameState={gameState}
            onStartGame={handleStartGame}
            isHost={isHost}
          />
        )}
        {gameState.phase === 'prediction' && (
          isSpectator ? (
            <SpectatorView
              key="spectator-prediction"
              gameState={gameState}
              submittedTeams={submittedTeams}
            />
          ) : (
            <PredictionPhase
              key={`prediction-${gameState.round}`}
              gameState={gameState}
              onSubmit={handleSubmitPrediction}
            />
          )
        )}
        {gameState.phase === 'computation' && (
          <ComputationPhase key="computation" gameState={gameState} />
        )}
        {gameState.phase === 'zone-reveal' && (
          <ZoneRevealPhase key="zone-reveal" gameState={gameState} />
        )}
        {gameState.phase === 'trial' && (
          isSpectator ? (
            <SpectatorView
              key="spectator-trial"
              gameState={gameState}
              submittedTeams={submittedTeams}
            />
          ) : (
            // Only show Trial Phase to Red Zone teams
            gameState.redZoneTeams.includes(gameState.currentTeamId!) ? (
              <TrialPhase
                key="trial"
                gameState={gameState}
                onAnswer={handleTrialAnswer}
              />
            ) : (
              // Safe Zone (Green) View
              <SafeScreen />
            )
          )
        )}
        {gameState.phase === 'results' && (
          <ResultsPhase
            key="results"
            gameState={gameState}
            isControl={isSpectator || gameState.teams.find(t => t.id === socket?.id)?.isHost || false}
            onNextRound={() => {
              if (socket) {
                socket.emit('nextRound', gameState.roomCode, (response: any) => {
                  if (!response.success) alert(response.error);
                });
              }
            }}
          />
        )}
        {gameState.phase === 'game-over' && (
          <GameOverPhase key="game-over" gameState={gameState} />
        )}
      </AnimatePresence>

      {/* Score Overlay (visible during game phases) */}
      {/* Score Overlay Removed - Integrated into GameNavbar */}

      {/* Admin Panel Overlay */}
      <AnimatePresence>
        {showAdmin && (
          <AdminPanel
            onBack={() => setShowAdmin(false)}
            onStartGame={handleStartGame}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const AppWrapper = () => (
  <SocketProvider>
    <App />
  </SocketProvider>
);

export default AppWrapper;
