// ==============================
//   Game Board Module
// ==============================

const gameBoard = (() => {
  const board = Array(9).fill("");

  const reset = () => {
    for (let i = 0; i < board.length; i++) {
      board[i] = "";
    }
  };

  const getField = (index) => board[index];

  const setField = (index, sign) => {
    if (index < 0 || index >= board.length) return;
    board[index] = sign;
  };

  const getBoard = () => board.slice();
  const getBoardSize = () => board.length;

  return { reset, getField, setField, getBoard, getBoardSize };
})();

// ==============================
//   Player Factory
// ==============================
const player = (sign) => {
  const marker = sign;
  let wins = 0;

  const getSign = () => marker;
  const getWins = () => wins;
  const incrementWins = () => {
    wins++;
  };
  return { getSign, getWins, incrementWins };
};

// ==============================
//   Game Controller
// ==============================
const gameController = (() => {
  const playerX = player("X");
  const playerO = player("O");

  let round = 1;
  let matchCount = 0;
  let gameOver = false;
  let result = null;
  let draws = 0;

  const winningCombos = [
    [0, 1, 2], // rows
    [3, 4, 5], // rows
    [6, 7, 8], // rows
    [0, 3, 6], // cols
    [1, 4, 7], // cols
    [2, 5, 8], // cols
    [0, 4, 8], // diagonals
    [2, 4, 6], // diagonals
  ];

  const reset = () => {
    gameBoard.reset();
    round = 1;
    gameOver = false;
    result = null;
  };

  const getWins = (sign) => {
    return sign === "X" ? playerX.getWins() : playerO.getWins();
  };

  const getDraws = () => draws;

  const currentPlayer = () =>
    (round + matchCount) % 2 === 0 ? playerO.getSign() : playerX.getSign();

  const checkWinConditions = () => {
    const board = gameBoard.getBoard();
    for (const combo of winningCombos) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], combo: combo };
      }
    }

    if (!gameBoard.getBoard().includes("")) return "draw";
    return null;
  };

  const playRound = (index) => {
    const boardSize = gameBoard.getBoardSize();

    if (gameOver) return { ok: false, reason: "game-over" };
    if (!Number.isInteger(index) || index < 0 || index >= boardSize) {
      return { ok: false, reason: "invalid-index" };
    }
    if (gameBoard.getField(index) !== "") {
      return { ok: false, reason: "occupied" };
    }

    const sign = currentPlayer();
    gameBoard.setField(index, sign);

    const winCheck = checkWinConditions();

    if (winCheck) {
      gameOver = true;
      matchCount++;

      if (typeof winCheck === "object" && winCheck.combo) {
        result = winCheck.winner;
        if (winCheck.winner === "X") {
          playerX.incrementWins();
        } else {
          playerO.incrementWins();
        }
        return { ok: true, finished: true, combo: winCheck.combo };
      }

      if (winCheck === "draw") {
        result = "draw";
        draws++;
        return { ok: true, finished: true };
      }

      return { ok: true, finished: true };
    }

    round++;
    return { ok: true, finished: false };
  };

  const isGameOver = () => gameOver;
  const getResult = () => result;

  return {
    playRound,
    currentPlayer,
    reset,
    isGameOver,
    getResult,
    getDraws,
    getWins,
  };
})();

// ==============================
//   Display Controller
// ==============================
const displayController = (() => {
  const cells = document.querySelectorAll(".cell");
  const statusMessage = document.getElementById("statusMessage");
  const resetButton = document.getElementById("resetButton");

  const scoreX = document.getElementById("scoreX");
  const scoreO = document.getElementById("scoreO");
  const scoreDraw = document.getElementById("scoreDraw");

  const labelX = document.getElementById("label-playerX");
  const labelO = document.getElementById("label-playerO");

  let messageTimeout;

  // --- UI Helpers ---
  const updateStatus = (customMsg) => {
    if (!statusMessage) return;

    if (customMsg) {
      statusMessage.textContent = customMsg;
    } else if (gameController.isGameOver()) {
      const res = gameController.getResult();
      statusMessage.textContent =
        res === "draw" ? "It's a Draw!" : `${res} Wins!`;
    } else {
      statusMessage.textContent = `${gameController.currentPlayer()}'s Turn`;
    }
  };

  const updateActivePlayer = () => {
    if (gameController.isGameOver()) {
      labelX.classList.remove("active");
      labelO.classList.remove("active");
      return;
    }

    const currentPlayer = gameController.currentPlayer();
    labelX.classList.toggle("active", currentPlayer === "X");
    labelO.classList.toggle("active", currentPlayer === "O");
  };

  const flashMessage = (msg, duration = 2000) => {
    updateStatus(msg);
    clearTimeout(messageTimeout);
    messageTimeout = setTimeout(() => updateStatus(), duration);
  };

  const renderBoard = () => {
    const board = gameBoard.getBoard();
    cells.forEach((cell, i) => {
      if (cell.textContent !== board[i]) {
        cell.innerHTML = board[i] ? `<span>${board[i]}</span>` : "";
      }
    });
  };

  const updateScores = () => {
    const scores = [
      { element: scoreX, value: gameController.getWins("X") },
      { element: scoreO, value: gameController.getWins("O") },
      { element: scoreDraw, value: gameController.getDraws() },
    ];

    scores.forEach(({ element, value }) => {
      if (element.textContent !== String(value)) {
        element.textContent = value;

        element.classList.remove("animate-score");

        setTimeout(() => {
          element.classList.add("animate-score");
        }, 10);
      }
    });
  };

  // --- Handlers ---
  const handleCellClick = (e) => {
    const index = parseInt(e.target.closest(".cell").dataset.index);
    const result = gameController.playRound(index);

    if (!result.ok) {
      flashMessage(
        result.reason === "game-over"
          ? "Game Over! Reset to play."
          : "Cell taken!",
      );
      return;
    }

    renderBoard();

    if (result.finished) {
      highlightResult(result.combo);
      updateScores();
    }
    updateStatus();
    updateActivePlayer();
  };

  const highlightResult = (combo) => {
    cells.forEach((cell, idx) => {
      if (combo?.includes(idx)) {
        cell.classList.add("highlight-winner");
      } else {
        cell.classList.add("highlight-other");
      }
    });
  };

  const resetGame = () => {
    gameController.reset();
    cells.forEach((cell) => {
      cell.classList.remove("highlight-winner", "highlight-other");
    });
    renderBoard();
    updateScores();
    updateActivePlayer();
    flashMessage("Board Reset!", 1500);
  };

  // --- Initialization ---
  cells.forEach((cell, i) => {
    cell.dataset.index = i;
    cell.addEventListener("click", handleCellClick);
  });

  resetButton?.addEventListener("click", resetGame);

  renderBoard();
  updateStatus();
  updateActivePlayer();
})();
