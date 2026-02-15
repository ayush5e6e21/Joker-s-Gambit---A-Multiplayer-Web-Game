
import { io } from "socket.io-client";

const SERVER_URL = "http://127.0.0.1:3001";
const ROOM_CODE = "TEST04";

console.log("Starting Round Verification (2 Players)...");

const hostSocket = io(SERVER_URL, { forceNew: true, transports: ["websocket"] });
const player1 = io(SERVER_URL, { forceNew: true, transports: ["websocket"] });
const player2 = io(SERVER_URL, { forceNew: true, transports: ["websocket"] });

let step = 0;
function passStep(msg) {
    step++;
    console.log(`[PASS] Step ${step}: ${msg}`);
}
function fail(msg) {
    console.error(`\n❌ FAILED: ${msg}`);
    process.exit(1);
}

// Host Flow
hostSocket.on("connect", () => {
    console.log(`Host connected: ${hostSocket.id}`);

    hostSocket.emit("createRoom", "AdminHost", { roomCode: ROOM_CODE, spectator: true }, (res) => {
        if (res.success) {
            passStep(`Room ${ROOM_CODE} created`);
            joinPlayers();
        } else {
            fail(`Create room failed: ${res.error}`);
        }
    });

    hostSocket.onAny((event, ...args) => {
        if (!['timerUpdate', 'trialTimerUpdate'].includes(event)) {
            console.log(`[HOST EVENT] ${event}`);
        }
    });

    hostSocket.on("scoreUpdate", () => {
        passStep("Score Update (Round Ends)");
        setTimeout(() => {
            console.log("Attempting to start Next Round...");
            hostSocket.emit("nextRound", ROOM_CODE, (res) => {
                if (res.success) passStep("Next Round request sent");
                else fail(`Next Round failed: ${res.error}`);
            });
        }, 2000);
    });

    hostSocket.on("nextRoundStarted", (data) => {
        passStep(`Next Round Started! (Round ${data.round})`);
        console.log("\n✅ VERIFICATION SUCCESSFUL");
        process.exit(0);
    });
});

let joinedCount = 0;
function joinPlayers() {
    [player1, player2].forEach((p, i) => {
        p.on("connect", () => {
            p.emit("joinRoom", ROOM_CODE, `Bot${i + 1}`, (res) => {
                if (res.success) {
                    console.log(`Bot${i + 1} joined`);
                    joinedCount++;
                    if (joinedCount === 2) startGame();
                }
            });
        });

        p.on("gameStarted", () => {
            setTimeout(() => {
                p.emit("submitNumber", ROOM_CODE, 50 + (i * 10), () => { });
            }, 500);
        });

        p.on("trialStarted", () => {
            // Submit answer if in trial
            p.emit("submitTrialAnswer", ROOM_CODE, 0, () => { });
        });
    });
}

function startGame() {
    hostSocket.emit("startGame", ROOM_CODE, { numberSelectionTime: 2, trialTime: 2 }, (res) => {
        if (res.success) passStep("Game Started");
    });
}

setTimeout(() => {
    fail("Timeout");
}, 20000);
