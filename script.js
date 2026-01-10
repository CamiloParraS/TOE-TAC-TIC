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

const player = (sign) => {
  const marker = sign;
  const getSign = () => marker;
  return { getSign };
};

const gameController = (() => {
  const playerX = player("X");
  const playerO = player("O");
  let round = 1;
  let matchCount = 0;
  let gameOver = false;
  let result = null;

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

  const currentPlayer = () =>
    (round + matchCount) % 2 === 0 ? playerO.getSign() : playerX.getSign();

  const checkWinConditions = () => {
    const board = gameBoard.getBoard();
    for (const combo of winningCombos) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
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
      result = winCheck;
      matchCount++;
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
  };
})();

const displayController = (() => {
  const resetButton = document.getElementById("resetButton");
  const statusMessage = document.getElementById("statusMessage");
  const cells = document.querySelectorAll(".cell");

  let messageTimeout;

  const getStatusText = () => {
    if (gameController.isGameOver()) {
      const result = gameController.getResult();
      return result === "draw" ? "Draw" : `${result} WINS!!`;
    }
    return `${gameController.currentPlayer()} Turn to move`;
  };

  const showMessage = (message) => {
    if (!statusMessage) return;
    statusMessage.textContent = message;

    if (messageTimeout) clearTimeout(messageTimeout);

    messageTimeout = setTimeout(() => {
      updateGameStatus();
    }, 2000);
  };

  const updateGameStatus = () => {
    if (statusMessage) {
      statusMessage.textContent = getStatusText();
    }
  };

  const renderBoard = () => {
    const board = gameBoard.getBoard();

    cells.forEach((cell, i) => {
      const currentMark = cell.textContent;
      const newMark = board[i];

      // Only modify the DOM if the value has actually changed
      if (currentMark !== newMark) {
        cell.innerHTML = ""; // Clear the cell

        if (newMark !== "") {
          const span = document.createElement("span");
          span.textContent = newMark;
          cell.appendChild(span);
        }
      }
    });
  };

  const handleResult = (game) => {
    if (!game.ok) {
      let msg = "Invalid Move";
      if (game.reason === "game-over") msg = "Game over --- press Reset";
      else if (game.reason === "occupied") msg = "That cell is taken";

      showMessage(msg);
      return;
    }

    updateGameStatus();
  };

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      gameController.reset();
      renderBoard();

      showMessage("The board has been reset");

      setTimeout(() => {
        showMessage(`${gameController.currentPlayer()} Turn to move`);
      }, 3000);
    });
  }

  cells.forEach((cell, i) => {
    cell.addEventListener("click", () => {
      console.log(`clicked cell ${i}`);
      const index = i;
      const game = gameController.playRound(index);
      handleResult(game);
      renderBoard();
    });
  });

  renderBoard();
  updateGameStatus();

  return { renderBoard };
})();
