// Game Configuration Variables
let BOARD_SIZE = 10;
let NUM_BOMBS = 15;
let REPOSITION_INTERVAL = 3;

// Difficulty Settings
const DIFFICULTY_SETTINGS = {
    easy: 0.10,      // 10% bombs
    medium: 0.15,    // 15% bombs
    hard: 0.25,      // 25% bombs
    extreme: 0.35    // 35% bombs
};

// Game State
let gameBoard = [];
let turnCounter = 0;
let gameOver = false;
let showProbs = false;

// Start Game from Setup
function startGame() {
    const boardSize = parseInt(document.getElementById("boardSize").value);
    const difficulty = document.getElementById("difficulty").value;
    const repositionCount = parseInt(document.getElementById("repositionCount").value);

    // Calculate number of bombs based on difficulty
    const bombPercentage = DIFFICULTY_SETTINGS[difficulty];
    const totalCells = boardSize * boardSize;
    const numBombs = Math.floor(totalCells * bombPercentage);

    // Set game configuration
    BOARD_SIZE = boardSize;
    NUM_BOMBS = numBombs;
    REPOSITION_INTERVAL = repositionCount;

    // Hide setup modal and show game container
    document.getElementById("setupModal").style.display = "none";
    document.getElementById("gameContainer").style.display = "block";

    // Update grid class
    const gameGrid = document.getElementById("gameGrid");
    gameGrid.className = `game-grid grid-${boardSize}`;

    // Initialize the game
    initializeGame();
}

// Go Back to Setup
function goToSetup() {
    document.getElementById("setupModal").style.display = "flex";
    document.getElementById("gameContainer").style.display = "none";
}

// Play Again with current settings
function playAgain() {
    initializeGame();
}

// Initialize Game
function initializeGame() {
    gameBoard = [];
    turnCounter = 0;
    gameOver = false;
    showProbs = false;

    // Create empty grid
    for (let r = 0; r < BOARD_SIZE; r++) {
        gameBoard[r] = [];
        for (let c = 0; c < BOARD_SIZE; c++) {
            gameBoard[r][c] = {
                isRevealed: false,
                isBomb: false,
                count: 0,
                id: `cell-${r}-${c}`
            };
        }
    }

    placeBombs();
    renderBoard();
    updateUI();
    updateStatus("Ready to play! Click a cell to start.");
}

// Place Bombs (only on unrevealed cells)
function placeBombs() {
    // Clear existing bombs
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            gameBoard[r][c].isBomb = false;
        }
    }

    let bombsPlaced = 0;
    while (bombsPlaced < NUM_BOMBS) {
        const r = Math.floor(Math.random() * BOARD_SIZE);
        const c = Math.floor(Math.random() * BOARD_SIZE);

        if (!gameBoard[r][c].isBomb && !gameBoard[r][c].isRevealed) {
            gameBoard[r][c].isBomb = true;
            bombsPlaced++;
        }
    }

    calculateHints();
}

// Calculate Hints (adjacent bomb counts)
function calculateHints() {
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (!gameBoard[r][c].isBomb) {
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                            if (gameBoard[nr][nc].isBomb) count++;
                        }
                    }
                }
                gameBoard[r][c].count = count;
            }
        }
    }
}

// Handle Cell Click
function handleCellClick(row, col) {
    if (gameOver || gameBoard[row][col].isRevealed) return;

    turnCounter++;

    if (gameBoard[row][col].isBomb) {
        // Game Over - Lost
        gameOver = true;
        gameBoard[row][col].isRevealed = true;
        revealAllBombs();
        updateUI();
        updateStatus("Game Over! You hit a bomb! 💣", "lose");
        return;
    }

    // Reveal cell and flood-fill if empty
    revealCell(row, col);

    // Check win condition
    if (checkWinCondition()) {
        gameOver = true;
        updateUI();
        updateStatus("You Won! Congratulations! 🎉", "win");
        return;
    }

    // Check if repositioning should happen
    checkRepositionTrigger();
    updateUI();
}

// Reveal Cell (with flood-fill for empty cells)
function revealCell(row, col) {
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return;
    if (gameBoard[row][col].isRevealed) return;

    gameBoard[row][col].isRevealed = true;

    // Flood-fill if no adjacent bombs
    if (gameBoard[row][col].count === 0) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                revealCell(row + dr, col + dc);
            }
        }
    }
}

// Reveal All Bombs (on game over)
function revealAllBombs() {
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (gameBoard[r][c].isBomb) {
                gameBoard[r][c].isRevealed = true;
            }
        }
    }
}

// Check Reposition Trigger
function checkRepositionTrigger() {
    if (turnCounter % REPOSITION_INTERVAL === 0) {
        updateStatus("💨 Bombs repositioned!", "reposition");
        placeBombs();
    }
}

// Check Win Condition
function checkWinCondition() {
    let revealedCount = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (gameBoard[r][c].isRevealed) revealedCount++;
        }
    }
    return revealedCount === BOARD_SIZE * BOARD_SIZE - NUM_BOMBS;
}

// Render Board
function renderBoard() {
    const grid = document.getElementById("gameGrid");
    grid.innerHTML = "";

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = gameBoard[r][c];
            const btn = document.createElement("button");
            btn.className = "cell";

            if (cell.isRevealed) {
                btn.className += " revealed";
                btn.disabled = true;

                if (cell.isBomb) {
                    btn.className += " bomb";
                    btn.textContent = "💣";
                } else {
                    if (cell.count === 0) {
                        btn.className += " revealed-empty";
                        btn.textContent = "";
                    } else {
                        btn.className += ` revealed-${cell.count}`;
                        btn.textContent = cell.count;
                    }
                }
            } else {
                btn.className += " unrevealed";
            }

            btn.onclick = () => handleCellClick(r, c);
            grid.appendChild(btn);
        }
    }
}

// Update UI
function updateUI() {
    document.getElementById("turnCounter").textContent = turnCounter;
    const remaining = REPOSITION_INTERVAL - (turnCounter % REPOSITION_INTERVAL);
    document.getElementById("repositionCountdown").textContent = 
        (turnCounter % REPOSITION_INTERVAL === 0) ? REPOSITION_INTERVAL : remaining;
    renderBoard();
}

// Update Status Message
function updateStatus(message, type = "normal") {
    const statusEl = document.getElementById("statusMessage");
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
}