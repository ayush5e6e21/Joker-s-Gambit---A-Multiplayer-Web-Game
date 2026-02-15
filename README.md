# Joker's Gambit

**Joker's Gambit** is a high-stakes, real-time multiplayer strategy game that brings the psychological tension of *Alice in Borderland* to the web.

Inspired by the "King of Diamonds" trial (Balance Game), players act as participants in a deadly game of logic and probability. The goal is simple yet terrifying: choose a number between 0 and 100. The target is **0.8 × the average of all numbers**. Those closest to this target survive; those who stray too far face the Joker's Trials and eventual elimination.

Featuring a glitch-horror aesthetic, immersive sound design, and live multiplayer synchronization, this project showcases advanced React state management and real-time socket communication.

![Game Screenshot](/public/joker-bg.png)

## 🎮 Game Concept

Players must choose a number between 0 and 100. The target number is calculated as **0.8 × Average of all chosen numbers**.
-   **Green Zone (Safe)**: The team closest to the target number survives.
-   **Red Zone (The Descent)**: Failure carries a heavy price. Teams that stray too far are marked by the Joker and must endure *The Joker's Trial*.
-   **Elimination**: When hope runs out (-10 points), existence is erased.

### 🃏 The Joker's Trial

> *"Do you truly understand the rules? Or are you simply playing into his hand?"*

The Trial is not a punishment... it is a psychological experiment. Those who fail the calculation are cast into a distorted reality where logic bends and sanity frays. What happens in the Trial remains a closely guarded secret among the survivors. Prepare for the unknown.

## ✨ Features

-   **Real-time Multiplayer**: Powered by Socket.io for instant updates across all clients.
-   **Admin Control Panel**: unique interface for the game master to control game flow, set timers, and manage rounds.
-   **Dynamic Game Phases**:
    -   **Prediction Phase**: Players submit numbers.
    -   **Calculation Phase**: visual breakdown of the math (Average × 0.8).
    -   **Zone Reveal**: 50/50 split screen showing Safe vs Trial teams.
    -   **Trial Phase**: A cryptic challenge designed to test your resolve. Expect the unexpected.
-   **Immersive UI**:
    -   CRT/Glitch effects and scanlines.
    -   Joker-themed horror aesthetic.
    -   Smooth framer-motion animations.
-   **Dynamic Timers**: Admin can adjust round pacing on the fly.

## 🛠️ Tech Stack

-   **Frontend**: React, Vite, Tailwind CSS, Framer Motion
-   **Backend**: Node.js, Express, Socket.io
-   **Styling**: Custom CSS variables, gradients, and rigorous responsive design.

## 🚀 Getting Started

### Prerequisites
-   Node.js (v16 or higher)
-   npm (v7 or higher)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/ayush5e6e21/joker-game.git
    cd joker-game
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Game

You need to run both the backend server and the frontend client.

1.  **Start the Backend Server** (Port 3001):
    ```bash
    npm run server
    ```

2.  **Start the Frontend Client** (Port 5173):
    ```bash
    npm run dev
    ```

3.  Open your browser to `http://localhost:5173`.

## 🕹️ How to Play

### As Admin (Game Master)
1.  Open the game in a browser window.
2.  Click **"ADMIN PANEL"**.
3.  Set the **Prediction Timer** (default 60s) and **Trial Timer** (default 180s).
4.  Click **"CREATE ROOM"**.
5.  Share the 6-character **Room Code** with players.
6.  Once players join, click **"START GAME"**.
7.  Use the Admin Panel to advance rounds and manage the game flow.

### As Player
1.  Open the game in a browser window.
2.  Enter your **Team Name** and the **Room Code** provided by the Admin.
3.  Click **"ENTER GAME"**.
4.  Wait for the Admin to start.
5.  Submit your number when the **Prediction Phase** begins!

## 📂 Project Structure

-   `src/App.tsx`: Main game logic and UI components.
-   `src/components/AdminPanel.tsx`: Admin-specific controls.
-   `server.js`: Backend logic for room management and game state.
-   `src/index.css`: Global styles, animations (glitch, scanlines), and theme variables.

## 📜 License

This project is open-source and available under the MIT License.
