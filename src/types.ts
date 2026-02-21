export type GamePhase = 'entrance' | 'lobby' | 'rules' | 'prediction' | 'computation' | 'zone-reveal' | 'trial' | 'results' | 'game-over';

export interface Team {
    id: string;
    name: string;
    score: number;
    prediction: number | null;
    isEliminated: boolean;
    isReady: boolean;
    isHost?: boolean;
}

export interface TrialQuestion {
    id: string;
    question: string;
    type?: 'mcq' | 'text';
    options?: string[];
    correctAnswer?: number | null;
    timeLimit?: number;
}

export interface GameState {
    phase: GamePhase;
    round: number;
    teams: Team[];
    roomCode: string;
    currentTeamId: string | null;
    targetNumber: number | null;
    average: number | null;
    multiplier: number;
    greenZoneTeam: string | null;
    redZoneTeams: string[];
    duplicatePenaltyActive: boolean;
    duplicateDetected: boolean;
    trialQuestion: TrialQuestion | null;
    timeRemaining: number;
    jokerRule?: string;
    wrongPlayers?: string[];
    playerName?: string;
}
