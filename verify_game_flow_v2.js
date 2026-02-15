
import { io } from "socket.io-client";

const SERVER_URL = "http://127.0.0.1:3000";
const TEST_ROOM_CODE = "TEST01";

console.log("Starting Game Flow Verification...");

const hostSocket = io(SERVER_URL, { forceNew: true, transports: ["websocket"] });
const playerSocket = io(SERVER_URL, { forceNew: true, transports: ["websocket"] });

hostSocket.on("connect_error", (err) => {
    console.error(`Host connection error: ${err.message}`);
});
playerSocket.on("connect_error", (err) => {
    console.error(`Player connection error: ${err.message}`);
});

let step = 0;

function passStep(limit, validMsg) {
    step++;
    console.log(`[PASS] Step ${step}: ${validMsg}`);
    if (step === limit) {
        console.log("\n✅ VERIFICATION SUCCESSFUL: Game flow is working!");
        process.exit(0);
    }
}

function fail(msg) {
    console.error(`\n❌ VERIFICATION FAILED: ${msg}`);
    process.exit(1);
}

// 1. Host connects and creates room
hostSocket.on("connect", () => {
    console.log(`Host connected: ${hostSocket.id}`);

    hostSocket.emit("createRoom", "AdminHost", { roomCode: TEST_ROOM_CODE, spectator: true }, (response) => {
        if (response.success) {
            passStep(3, `Room created: ${TEST_ROOM_CODE}`);
            // Trigger player join after room is ready
            joinPlayer();
        } else {
            fail(`Failed to create room: ${response.error}`);
        }
    });
});

function joinPlayer() {
    playerSocket.on("connect", () => {
        console.log(`Player connected: ${playerSocket.id}`);

        playerSocket.emit("joinRoom", TEST_ROOM_CODE, "BotPlayer", (response) => {
            if (response.success) {
                passStep(3, "Player joined room");
                // Trigger start game
                startGame();
            } else {
                fail(`Failed to join room: ${response.error}`);
            }
        });
    });
}

function startGame() {
    hostSocket.emit("startGame", TEST_ROOM_CODE, { numberSelectionTime: 30, trialTime: 60 }, (response) => {
        if (response.success) {
            console.log("Start game request sent successfully.");
        } else {
            fail(`Failed to start game: ${response.error}`);
        }
    });
}

// Listen for game started event
hostSocket.on("gameStarted", (data) => {
    passStep(3, `Game Started! Round: ${data.round}`);
});

// Timeout fail-safe
setTimeout(() => {
    fail("Timeout waiting for events.");
}, 5000);
