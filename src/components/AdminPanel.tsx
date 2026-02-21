import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, LogOut, Trash2, Plus, Play, Brain, Copy, Lock, CheckCircle2, Shuffle, ArrowUp, ArrowDown, FileText, Hash, Timer, ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSocket } from '@/context/SocketContext';
import type { TrialQuestion } from '@/types';

interface AdminPanelProps {
    onBack: () => void;
    onStartGame: (code?: string, settings?: any) => void;
}

export const AdminPanel = ({
    onBack,
    onStartGame
}: AdminPanelProps) => {

    // ... (rest of component, check line numbers carefully)
    // I will use a larger context verify correct replacement

    const { socket, isConnected } = useSocket();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    // Question bank sub-panel auth
    const [isQuestionBankUnlocked, setIsQuestionBankUnlocked] = useState(false);
    const [questionBankPassword, setQuestionBankPassword] = useState('');
    const [questionBankError, setQuestionBankError] = useState(false);

    const [activeTab, setActiveTab] = useState<'questions' | 'room'>('room');
    const [questions, setQuestions] = useState<TrialQuestion[]>([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [newOptions, setNewOptions] = useState(['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState(0);
    const [newQuestionType, setNewQuestionType] = useState<'mcq' | 'text'>('mcq');
    const [isShuffling, setIsShuffling] = useState(false);
    const [newQuestionTimer, setNewQuestionTimer] = useState<number | ''>('');

    // Room Control States
    const [roomCode, setRoomCode] = useState('');
    const [isRoomOpen, setIsRoomOpen] = useState(false);
    const [players, setPlayers] = useState<any[]>([]);
    const [predictionTime, setPredictionTime] = useState(60);
    const [trialTime, setTrialTime] = useState(180);

    // Subscribe to player updates
    useEffect(() => {
        if (!socket) return;

        const handleUpdatePlayers = (updatedPlayers: any[]) => {
            setPlayers(updatedPlayers);
        };

        socket.on('updatePlayers', handleUpdatePlayers);

        return () => {
            socket.off('updatePlayers', handleUpdatePlayers);
        };
    }, [socket]);

    // Fetch questions when question bank is unlocked
    useEffect(() => {
        if (socket && isQuestionBankUnlocked) {
            socket.emit('adminGetQuestions', (response: any) => {
                if (response.success) {
                    setQuestions(response.questions);
                }
            });
        }
    }, [socket, isQuestionBankUnlocked]);

    const handleLogin = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (password === 'joker') {
            setIsAuthenticated(true);
            setError(false);
        } else {
            setError(true);
            setPassword('');
        }
    };

    const handleQuestionBankLogin = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (questionBankPassword === 'jarvis') {
            setIsQuestionBankUnlocked(true);
            setQuestionBankError(false);
        } else {
            setQuestionBankError(true);
            setQuestionBankPassword('');
        }
    };

    const generateRoomCode = () => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        setRoomCode(code);
        setIsRoomOpen(false); // Reset status if new code generated
        setPlayers([]);
    };

    const addQuestion = () => {
        if (!socket) return;

        if (newQuestionType === 'text') {
            if (!newQuestion) return;
            const questionData: any = {
                type: 'text',
                question: newQuestion,
            };
            if (newQuestionTimer) questionData.timeLimit = Number(newQuestionTimer);
            socket.emit('adminAddQuestion', questionData, (response: any) => {
                if (response.success) {
                    socket.emit('adminGetQuestions', (res: any) => {
                        if (res.success) setQuestions(res.questions);
                    });
                    setNewQuestion('');
                    setNewQuestionTimer('');
                }
            });
        } else {
            if (!newQuestion || !newOptions.every(o => o)) return;
            const questionData: any = {
                type: 'mcq',
                question: newQuestion,
                options: newOptions,
                correctAnswer
            };
            if (newQuestionTimer) questionData.timeLimit = Number(newQuestionTimer);
            socket.emit('adminAddQuestion', questionData, (response: any) => {
                if (response.success) {
                    socket.emit('adminGetQuestions', (res: any) => {
                        if (res.success) setQuestions(res.questions);
                    });
                    setNewQuestion('');
                    setNewOptions(['', '', '', '']);
                    setCorrectAnswer(0);
                    setNewQuestionTimer('');
                }
            });
        }
    };

    const deleteQuestion = (id: string) => {
        if (socket) {
            socket.emit('adminDeleteQuestion', id, (response: any) => {
                if (response.success) {
                    setQuestions(questions.filter(q => q.id !== id));
                }
            });
        }
    };

    const shuffleQuestions = () => {
        if (!socket) return;
        setIsShuffling(true);
        socket.emit('adminShuffleQuestions', (response: any) => {
            if (response.success) {
                setQuestions(response.questions);
            }
            setTimeout(() => setIsShuffling(false), 600);
        });
    };

    const reorderQuestion = (id: string, direction: 'up' | 'down') => {
        if (!socket) return;
        socket.emit('adminReorderQuestion', id, direction, (response: any) => {
            if (response.success) {
                setQuestions(response.questions);
            }
        });
    };

    const updateQuestionTimer = (id: string, timeLimit: number | undefined) => {
        if (!socket) return;
        socket.emit('adminUpdateQuestionTimer', id, timeLimit, (response: any) => {
            if (response.success) {
                setQuestions(prev => prev.map(q => q.id === id ? { ...q, timeLimit } : q));
            }
        });
    };

    const handleOpenLobby = () => {
        if (!socket || !roomCode) return;

        // Admin creates room as SPECTATOR
        socket.emit('createRoom', 'Admin', { roomCode, spectator: true }, (response: any) => {
            if (response.success) {
                setIsRoomOpen(true);
                // Don't close panel yet, wait for players
            } else {
                alert(response.error);
            }
        });
    };


    const handleReclaimHost = () => {
        if (!socket || !roomCode) return;

        socket.emit('reclaimHost', roomCode, 'joker', (response: any) => {
            if (response.success) {
                console.log('Host reclaimed successfully');
            } else {
                alert('Failed to reclaim host: ' + response.error);
            }
        });
    };

    const handleStartGame = () => {
        if (!socket || !roomCode) return;

        // Ensure we are host before starting
        handleReclaimHost();

        // Pass settings to start game
        const settings = {
            numberSelectionTime: predictionTime,
            trialTime: trialTime
        };

        // Set Joker Rule if provided
        if (newQuestion) { // abusing newQuestion state or should create new one? Better create new state.
            // Actually let's use a new state 'jokerRule'
        }

        onStartGame(roomCode, settings);
        onBack();
    };

    const handleStartNextRound = () => {
        if (!socket || !roomCode) return;

        // Reclaim host first to be safe
        handleReclaimHost();

        const settings = {
            numberSelectionTime: predictionTime,
            trialTime: trialTime
        };

        setTimeout(() => {
            socket.emit('nextRound', roomCode, settings, (response: any) => {
                if (response.success) {
                    onBack();
                } else {
                    alert('Failed to start next round: ' + response.error);
                }
            });
        }, 500);
    };

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomCode);
    };

    if (!isAuthenticated) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md p-8 border border-[#D92525]/30 rounded-xl bg-[#0a0a0a]"
                >
                    <div className="flex flex-col items-center mb-8">
                        <Lock className="w-12 h-12 text-[#D92525] mb-4" />
                        <h2 className="text-2xl font-bold text-white tracking-widest">ADMIN ACCESS</h2>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError(false);
                                }}
                                placeholder="Enter Password"
                                className={`bg-[#050505] border-gray-700 text-center text-xl tracking-widest ${error ? 'border-[#D92525]' : ''}`}
                                autoFocus
                            />
                            {error && (
                                <p className="text-[#D92525] text-xs text-center mt-2">INCORRECT PASSWORD</p>
                            )}
                        </div>
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                onClick={onBack}
                                variant="outline"
                                className="flex-1 border-gray-700 hover:bg-gray-800"
                            >
                                CANCEL
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-[#D92525] hover:bg-[#b91c1c] text-white"
                            >
                                ACCESS
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm overflow-y-auto">
            <div className="min-h-screen w-full p-8 relative flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full max-w-4xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Crown className="w-10 h-10 text-[#D92525]" />
                            <h1 className="text-4xl font-bold text-white tracking-widest">ADMIN PANEL</h1>
                        </div>
                        <Button
                            onClick={onBack}
                            variant="outline"
                            className="border-gray-700 text-gray-400 hover:bg-gray-800 rounded-none"
                            data-cursor-hover
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            EXIT
                        </Button>
                    </div>

                    {/* Connection Status */}
                    <div className="absolute top-8 right-32 flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-[#D92525] shadow-[0_0_10px_#D92525] animate-pulse'}`} />
                        <span className="text-xs text-gray-500 tracking-widest">{isConnected ? 'ONLINE' : 'OFFLINE'}</span>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 mb-8">
                        <Button
                            onClick={() => setActiveTab('questions')}
                            className={`flex-1 py-6 rounded-none text-lg tracking-widest transition-all duration-200 ${activeTab === 'questions' ? 'bg-gradient-to-r from-[#D92525] to-[#ff4444] text-white shadow-[0_0_20px_rgba(217,37,37,0.3)]' : 'bg-transparent border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'}`}
                            data-cursor-hover
                        >
                            <Brain className="w-5 h-5 mr-3" />
                            TRIAL QUESTIONS
                        </Button>
                        <Button
                            onClick={() => setActiveTab('room')}
                            className={`flex-1 py-6 rounded-none text-lg tracking-widest transition-all duration-200 ${activeTab === 'room' ? 'bg-gradient-to-r from-[#D92525] to-[#ff4444] text-white shadow-[0_0_20px_rgba(217,37,37,0.3)]' : 'bg-transparent border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'}`}
                            data-cursor-hover
                        >
                            <Play className="w-5 h-5 mr-3" />
                            ROOM CONTROL
                        </Button>
                    </div>

                    {/* Questions Tab */}
                    {activeTab === 'questions' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Question Bank Password Gate */}
                            {!isQuestionBankUnlocked ? (
                                <div className="border border-gray-800 rounded-xl p-12 bg-[#0f0f0f] flex flex-col items-center">
                                    <Lock className="w-10 h-10 text-amber-400 mb-4" />
                                    <h3 className="text-xl text-gray-400 font-bold tracking-widest mb-2">QUESTION BANK</h3>
                                    <p className="text-gray-600 text-sm mb-6">Enter password to access the question bank</p>
                                    <form onSubmit={handleQuestionBankLogin} className="w-full max-w-xs space-y-4">
                                        <Input
                                            type="password"
                                            value={questionBankPassword}
                                            onChange={(e) => {
                                                setQuestionBankPassword(e.target.value);
                                                setQuestionBankError(false);
                                            }}
                                            placeholder="Enter Question Bank Password"
                                            className={`bg-[#050505] border-gray-700 text-center text-lg tracking-widest ${questionBankError ? 'border-[#D92525]' : ''}`}
                                            autoFocus
                                        />
                                        {questionBankError && (
                                            <p className="text-[#D92525] text-xs text-center">INCORRECT PASSWORD</p>
                                        )}
                                        <Button
                                            type="submit"
                                            className="w-full py-5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-none tracking-widest"
                                        >
                                            <Lock className="w-4 h-4 mr-2" />
                                            UNLOCK
                                        </Button>
                                    </form>
                                </div>
                            ) : (
                                <>
                                    {/* Back to Room Control button */}
                                    <Button
                                        onClick={() => {
                                            setIsQuestionBankUnlocked(false);
                                            setQuestionBankPassword('');
                                            setActiveTab('room');
                                        }}
                                        variant="outline"
                                        className="border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 rounded-none mb-4"
                                        data-cursor-hover
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        BACK TO ROOM CONTROL
                                    </Button>

                                    {/* Stats Banner */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="border border-gray-800 rounded-xl p-5 bg-[#0f0f0f] text-center">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <Hash className="w-5 h-5 text-[#D92525]" />
                                                <span className="text-gray-500 text-xs tracking-widest">TOTAL</span>
                                            </div>
                                            <p className="text-4xl font-bold text-white font-mono">{questions.length}</p>
                                        </div>
                                        <div className="border border-gray-800 rounded-xl p-5 bg-[#0f0f0f] text-center">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <Brain className="w-5 h-5 text-blue-400" />
                                                <span className="text-gray-500 text-xs tracking-widest">MCQ</span>
                                            </div>
                                            <p className="text-4xl font-bold text-blue-400 font-mono">{questions.filter(q => q.type !== 'text').length}</p>
                                        </div>
                                        <div className="border border-gray-800 rounded-xl p-5 bg-[#0f0f0f] text-center">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <FileText className="w-5 h-5 text-amber-400" />
                                                <span className="text-gray-500 text-xs tracking-widest">TEXT</span>
                                            </div>
                                            <p className="text-4xl font-bold text-amber-400 font-mono">{questions.filter(q => q.type === 'text').length}</p>
                                        </div>
                                    </div>

                                    {/* Existing Questions List */}
                                    <div className="border border-gray-800 rounded-xl p-6 bg-[#0f0f0f]">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl text-gray-400 font-bold">QUESTION BANK ({questions.length})</h3>
                                            <Button
                                                onClick={shuffleQuestions}
                                                disabled={isShuffling || questions.length < 2}
                                                className="bg-[#1a1a1a] border border-gray-700 hover:border-purple-500 hover:text-purple-400 text-gray-300 rounded-none tracking-widest disabled:opacity-50"
                                                data-cursor-hover
                                            >
                                                <Shuffle className={`w-4 h-4 mr-2 ${isShuffling ? 'animate-spin' : ''}`} />
                                                SHUFFLE
                                            </Button>
                                        </div>
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                            <AnimatePresence mode="popLayout">
                                                {questions.map((q, i) => (
                                                    <motion.div
                                                        key={q.id}
                                                        layout
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                        className={`flex items-start justify-between p-4 rounded border group hover:border-gray-600 transition-colors ${i % 2 === 0 ? 'bg-[#0a0a0a] border-gray-800' : 'bg-[#0d0d0d] border-gray-800'
                                                            }`}
                                                    >
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className="text-xs text-[#D92525] bg-[#D92525]/10 px-2 py-1 rounded font-mono">Q{i + 1}</span>
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider ${q.type === 'text'
                                                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                                                    }`}>
                                                                    {q.type === 'text' ? 'TEXT' : 'MCQ'}
                                                                </span>
                                                                <p className="text-white font-mono text-sm leading-relaxed">{q.question.length > 120 ? q.question.substring(0, 120) + '...' : q.question}</p>
                                                            </div>
                                                            {q.options && (
                                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-10">
                                                                    {q.options.map((opt: string, idx: number) => (
                                                                        <span key={idx} className={`text-xs ${idx === q.correctAnswer ? 'text-green-500 font-bold' : 'text-gray-500'}`}>
                                                                            {String.fromCharCode(65 + idx)}) {opt}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {q.type === 'text' && (
                                                                <p className="text-gray-600 text-xs pl-10 italic">Admin-reviewed answer</p>
                                                            )}
                                                            <div className="flex items-center gap-2 pl-10 mt-2">
                                                                <Clock className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                                                                <input
                                                                    type="number"
                                                                    min={5}
                                                                    placeholder="Default"
                                                                    value={q.timeLimit ?? ''}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value ? parseInt(e.target.value) : undefined;
                                                                        updateQuestionTimer(q.id, val);
                                                                    }}
                                                                    className="bg-[#0a0a0a] border border-gray-700 text-cyan-400 text-[11px] font-mono px-2 py-1 w-20 rounded focus:outline-none focus:border-cyan-500"
                                                                />
                                                                <span className="text-gray-600 text-[10px]">sec</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-center gap-1 ml-2">
                                                            <Button
                                                                onClick={() => reorderQuestion(q.id, 'up')}
                                                                variant="ghost"
                                                                size="sm"
                                                                disabled={i === 0}
                                                                className="text-gray-600 hover:text-white hover:bg-gray-800 h-7 w-7 p-0 disabled:opacity-20"
                                                                data-cursor-hover
                                                            >
                                                                <ArrowUp className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                onClick={() => reorderQuestion(q.id, 'down')}
                                                                variant="ghost"
                                                                size="sm"
                                                                disabled={i === questions.length - 1}
                                                                className="text-gray-600 hover:text-white hover:bg-gray-800 h-7 w-7 p-0 disabled:opacity-20"
                                                                data-cursor-hover
                                                            >
                                                                <ArrowDown className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                onClick={() => deleteQuestion(q.id)}
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-gray-600 hover:text-[#D92525] hover:bg-[#D92525]/10 h-7 w-7 p-0"
                                                                data-cursor-hover
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                            {questions.length === 0 && (
                                                <p className="text-gray-600 text-center py-8 italic">No questions in the bank.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Add New Question Form */}
                                    <div className="border border-gray-800 rounded-xl p-6 bg-[#0f0f0f]">
                                        <h3 className="text-xl mb-6 text-gray-400 font-bold">ADD NEW QUESTION</h3>
                                        <div className="space-y-4">
                                            {/* Type Toggle */}
                                            <div className="flex gap-2 mb-2">
                                                <Button
                                                    onClick={() => setNewQuestionType('mcq')}
                                                    className={`flex-1 py-3 rounded-none text-sm tracking-widest ${newQuestionType === 'mcq'
                                                        ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                                                        : 'bg-transparent border border-gray-700 text-gray-500 hover:text-gray-300'
                                                        }`}
                                                    data-cursor-hover
                                                >
                                                    <Brain className="w-4 h-4 mr-2" />
                                                    MCQ
                                                </Button>
                                                <Button
                                                    onClick={() => setNewQuestionType('text')}
                                                    className={`flex-1 py-3 rounded-none text-sm tracking-widest ${newQuestionType === 'text'
                                                        ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                                                        : 'bg-transparent border border-gray-700 text-gray-500 hover:text-gray-300'
                                                        }`}
                                                    data-cursor-hover
                                                >
                                                    <FileText className="w-4 h-4 mr-2" />
                                                    TEXT (RIDDLE)
                                                </Button>
                                            </div>

                                            {/* Question input */}
                                            {newQuestionType === 'text' ? (
                                                <textarea
                                                    value={newQuestion}
                                                    onChange={(e) => setNewQuestion(e.target.value)}
                                                    placeholder="Enter riddle / text question...\n(Admin will manually judge answers)"
                                                    rows={4}
                                                    className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-3 text-sm font-mono resize-none focus:outline-none focus:border-amber-500"
                                                />
                                            ) : (
                                                <Input
                                                    value={newQuestion}
                                                    onChange={(e) => setNewQuestion(e.target.value)}
                                                    placeholder="Enter MCQ question..."
                                                    className="bg-[#0a0a0a] border-gray-700 rounded-none h-12"
                                                    data-cursor-hover
                                                />
                                            )}

                                            {/* Options (only for MCQ) */}
                                            {newQuestionType === 'mcq' && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    {newOptions.map((opt, i) => (
                                                        <div key={i} className="flex items-center gap-3">
                                                            <div
                                                                onClick={() => setCorrectAnswer(i)}
                                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${correctAnswer === i ? 'border-[#D92525] bg-[#D92525]/20' : 'border-gray-600'}`}
                                                            >
                                                                {correctAnswer === i && <div className="w-3 h-3 bg-[#D92525] rounded-full" />}
                                                            </div>
                                                            <Input
                                                                value={opt}
                                                                onChange={(e) => {
                                                                    const newOpts = [...newOptions];
                                                                    newOpts[i] = e.target.value;
                                                                    setNewOptions(newOpts);
                                                                }}
                                                                placeholder={`Option ${i + 1}`}
                                                                className={`bg-[#0a0a0a] border-gray-700 rounded-none ${correctAnswer === i ? 'border-[#D92525] text-[#D92525]' : ''}`}
                                                                data-cursor-hover
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Timer per question */}
                                            <div className="flex items-center gap-3">
                                                <Timer className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <p className="text-gray-500 text-xs tracking-widest mb-1">TIME LIMIT (SECONDS) — leave blank for default</p>
                                                    <Input
                                                        type="number"
                                                        value={newQuestionTimer}
                                                        onChange={(e) => setNewQuestionTimer(e.target.value ? parseInt(e.target.value) : '')}
                                                        placeholder={`Default: global trial time`}
                                                        className="bg-[#0a0a0a] border-gray-700 rounded-none h-10 font-mono text-cyan-400"
                                                        data-cursor-hover
                                                        min={5}
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                onClick={addQuestion}
                                                disabled={!newQuestion || (newQuestionType === 'mcq' && newOptions.some(o => !o))}
                                                className="w-full py-6 bg-gradient-to-r from-[#D92525] to-[#ff4444] hover:from-[#b91c1c] hover:to-[#D92525] text-white rounded-none disabled:opacity-50 text-lg tracking-widest mt-4 shadow-[0_0_20px_rgba(217,37,37,0.2)] hover:shadow-[0_0_30px_rgba(217,37,37,0.4)] transition-all"
                                                data-cursor-hover
                                            >
                                                <Plus className="w-5 h-5 mr-2" />
                                                ADD {newQuestionType === 'text' ? 'TEXT' : 'MCQ'} QUESTION
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}

                    {/* Room Control Tab */}
                    {activeTab === 'room' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border border-gray-800 rounded-xl p-12 bg-[#0f0f0f]"
                        >
                            <h3 className="text-xl mb-8 text-gray-400 font-bold">ROOM CONTROL</h3>

                            <div className="space-y-12">
                                {/* Generate Room Code */}
                                <div>
                                    <p className="text-gray-500 mb-4 tracking-widest text-sm">ROOM CODE</p>
                                    <div className="flex gap-6">
                                        <div className="flex-1 bg-[#0a0a0a] border border-gray-700 h-20 flex items-center justify-center text-4xl tracking-[0.5em] font-mono font-bold text-white shadow-inner">
                                            {roomCode || '------'}
                                        </div>
                                        <Button
                                            onClick={generateRoomCode}
                                            disabled={isRoomOpen}
                                            className="bg-[#1a1a1a] border border-gray-700 hover:border-[#D92525] hover:text-[#D92525] text-gray-300 rounded-none h-20 px-8 text-lg tracking-widest disabled:opacity-50"
                                            data-cursor-hover
                                        >
                                            GENERATE
                                        </Button>
                                        {roomCode && (
                                            <Button
                                                onClick={copyRoomCode}
                                                variant="outline"
                                                className="border-gray-700 rounded-none h-20 px-6 text-gray-400 hover:text-white"
                                                data-cursor-hover
                                            >
                                                <Copy className="w-6 h-6" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Timer Settings (Visible for adjustments between rounds) */}
                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-gray-500 mb-4 tracking-widest text-sm">PREDICTION TIMER (SEC)</p>
                                            <Input
                                                type="number"
                                                value={predictionTime}
                                                onChange={(e) => setPredictionTime(parseInt(e.target.value) || 60)}
                                                className="bg-[#0a0a0a] border-gray-700 text-white h-16 text-2xl text-center font-mono rounded-none focus:border-[#D92525]"
                                                data-cursor-hover
                                            />
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-4 tracking-widest text-sm">TRIAL TIMER (SEC)</p>
                                            <Input
                                                type="number"
                                                value={trialTime}
                                                onChange={(e) => setTrialTime(parseInt(e.target.value) || 180)}
                                                className="bg-[#0a0a0a] border-gray-700 text-white h-16 text-2xl text-center font-mono rounded-none focus:border-[#D92525]"
                                                data-cursor-hover
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Players List */}
                                {isRoomOpen && (
                                    <div>
                                        <p className="text-gray-500 mb-4 tracking-widest text-sm">CONNECTED TEAMS ({players.length})</p>
                                        <div className="bg-[#0a0a0a] border border-gray-800 rounded p-4 min-h-[100px] max-h-[200px] overflow-y-auto">
                                            {players.length === 0 ? (
                                                <p className="text-gray-600 text-center italic">Waiting for teams to join...</p>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-2">
                                                    {players.map((p, i) => (
                                                        <div key={i} className="flex items-center justify-between p-2 bg-[#1a1a1a] rounded border border-gray-700">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                                <span className="text-white font-bold">{p.name}</span>
                                                            </div>
                                                            {p.hasTrialSubmitted && <CheckCircle2 className="w-4 h-4 text-[#D92525]" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="pt-8 border-t border-gray-800">
                                    {!isRoomOpen ? (
                                        <>
                                            <Button
                                                onClick={handleOpenLobby}
                                                disabled={!roomCode}
                                                className="w-full h-24 text-3xl bg-[#D92525] hover:bg-[#b91c1c] text-white rounded-none disabled:opacity-50 tracking-[0.3em] font-bold shadow-[0_0_30px_rgba(217,37,37,0.3)] hover:shadow-[0_0_50px_rgba(217,37,37,0.5)] transition-all"
                                                data-cursor-hover
                                            >
                                                OPEN LOBBY
                                            </Button>
                                            <p className="text-center text-gray-600 mt-4 text-sm font-mono">
                                                * Opens the room for players to join
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                onClick={handleStartGame}
                                                disabled={players.length < 1}
                                                className="w-full h-24 text-3xl bg-green-600 hover:bg-green-700 text-white rounded-none disabled:opacity-50 tracking-[0.3em] font-bold shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_50px_rgba(34,197,94,0.5)] transition-all mb-4"
                                                data-cursor-hover
                                            >
                                                <Play className="w-8 h-8 mr-4 fill-current" />
                                                START GAME
                                            </Button>

                                            <p className="text-center text-gray-600 mt-4 text-sm font-mono">
                                                * Needs at least 1 player to start
                                            </p>

                                            <div className="flex gap-4 mt-4">
                                                <Button
                                                    onClick={handleStartNextRound}
                                                    className="flex-1 py-6 bg-[#D92525] hover:bg-[#b91c1c] text-white rounded-none tracking-widest font-bold"
                                                    data-cursor-hover
                                                >
                                                    START NEXT ROUND
                                                </Button>

                                                <Button
                                                    onClick={handleReclaimHost}
                                                    variant="outline"
                                                    className="py-6 border-gray-700 text-gray-400 hover:text-white rounded-none tracking-widest"
                                                    data-cursor-hover
                                                >
                                                    RECLAIM HOST
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div >
        </div >
    );
};
