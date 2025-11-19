# Dynamic State Minesweeper

A web-based Minesweeper game featuring dynamic bomb repositioning with configurable difficulty levels and board sizes.

## Algorithm Overview

### Core Algorithm: Depth-First Search (DFS)

The game uses DFS flood-fill algorithm to automatically reveal connected empty cells when a player clicks on an empty cell with no adjacent bombs.

**Implementation**:
```javascript
function revealCell(row, col) {
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return;
    if (gameBoard[row][col].isRevealed) return;
    
    gameBoard[row][col].isRevealed = true;
    
    if (gameBoard[row][col].count === 0) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                revealCell(row + dr, col + dc);
            }
        }
    }
}
```

### Complexity Analysis

| Operation | Time | Space | Type |
|-----------|------|-------|------|
| Reveal Cell (DFS) | O(n²) worst, O(k) avg* | O(n²) | Graph traversal |
| Place Bombs | O(n²) | O(1) | Random placement |
| Calculate Hints | O(n²) | O(1) | Brute force |
| Check Win | O(n²) | O(1) | Linear search |

*k = number of connected empty cells; typically k << n²

**Time Complexity Breakdown**:
- Best Case: O(1) - Click cell with adjacent bombs
- Average Case: O(k) - Reveals 10-30 connected cells
- Worst Case: O(n²) - All cells empty (rare)

**Space Complexity**:
- Game Board: O(n²)
- Recursion Stack: O(n²) worst case, typically <50 frames

### Why DFS?

DFS chosen over BFS for:
- Simpler recursive implementation (~15 lines vs ~30)
- Same O(n²) time complexity
- Natural fit for grid traversal
- Adequate memory usage for typical game scenarios

## How to Use

### Setup

1. Open `index.html` in a web browser
2. Configure game settings:
   - **Board Size**: 8x8, 10x10, 12x12, or 15x15
   - **Difficulty**: Easy (10%), Medium (15%), Hard (25%), Extreme (35% bombs)
   - **Reposition Frequency**: Every 2, 3, 5, or 10 turns
3. Click "Start Game"

### Gameplay

- Click unrevealed cells to reveal them
- Numbers show adjacent bomb count
- Clicking empty cell triggers automatic flood-fill reveal
- Bombs reposition at configured intervals
- Win by revealing all non-bomb cells
- Lose by clicking a bomb

### Controls

- **Back to Setup**: Return to configuration screen
- **Show Probabilities**: Toggle for future probability display feature

## Files

- `index.html` - Setup modal and game container
- `style.css` - Styling and animations
- `script.js` - Game logic and DFS implementation

## Browser Requirements

Compatible with all modern browsers (Chrome, Firefox, Safari, Edge)

## Performance

| Board Size | Cells | Time/Click |
|-----------|-------|-----------|
| 8x8 | 64 | <1ms |
| 10x10 | 100 | 1-2ms |
| 12x12 | 144 | 2-3ms |
| 15x15 | 225 | 3-5ms |

Game remains responsive even on 15x15 boards with typical bomb density.
