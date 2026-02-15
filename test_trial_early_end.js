
import { io } from "socket.io-client";

const SERVER_URL = "http://127.0.0.1:3001";
const ROOM_CODE = "TRIAL02";

console.log("Starting Trial Early End Verification...");

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

// Setup players immediately
[player1, player2].forEach((p, i) => {
    p.on("connect", () => {
        console.log(`Player ${i + 1} connected: ${p.id}`);
    });
});

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

    hostSocket.on("trialTimerUpdate", (timeLeft) => {
        // console.log(`Timer: ${timeLeft}`);
    });

    hostSocket.on("scoreUpdate", () => {
        const elapsed = Date.now() - lastSubmissionTime;
        console.log(`Score Update received ${elapsed}ms after last submission.`);
        if (elapsed < 3000) { // Slack for network
            passStep("Trial ended immediately after submissions!");
            console.log("✅ VERIFICATION SUCCESSFUL");
            process.exit(0);
        } else {
            fail(`Trial did NOT end immediately. Elapsed: ${elapsed}ms`);
        }
    });
});

let joinedCount = 0;
function joinPlayers() {
    [player1, player2].forEach((p, i) => {
        // Just emit join, assuming they are connected or will connect
        if (p.connected) {
            p.emit("joinRoom", ROOM_CODE, `Bot${i + 1}`, handleJoin);
        } else {
            p.on("connect", () => {
                p.emit("joinRoom", ROOM_CODE, `Bot${i + 1}`, handleJoin);
            });
        }

        // ... game listeners
        p.on("gameStarted", () => {
            setTimeout(() => {
                p.emit("submitNumber", ROOM_CODE, i === 0 ? 40 : 100, () => { });
            }, 500);
        });

        p.on("trialStarted", () => {
            // Only red player (Bot2 likely) will be here
            console.log(`Bot${i + 1} trial started. Submitting answer...`);
            setTimeout(() => {
                if (lastSubmissionTime === 0) lastSubmissionTime = Date.now(); // approximate
                p.emit("submitTrialAnswer", ROOM_CODE, 0, (res) => {
                    lastSubmissionTime = Date.now(); // update to true last
                    if (!res.success) console.log(`Bot${i + 1} answer rejected: ${res.error}`);
                    else console.log(`Bot${i + 1} answer accepted`);
                });
            }, 1000);
        });
    });
}

function handleJoin(res) {
    if (res && res.success) {
        // console.log(`Bot joined`);
        joinedCount++;
        if (joinedCount === 2) startGame();
    }
}

let lastSubmissionTime = 0;

function startGame() {
    // Set Trial Time to 30s to verify we don't wait for it
    hostSocket.emit("startGame", ROOM_CODE, { numberSelectionTime: 2, trialTime: 30 }, (res) => {
        if (res.success) passStep("Game Started (Trial Time: 30s)");
    });
}

setTimeout(() => {
    fail("Timeout - Trial Timer likely ran out");
}, 20000);
