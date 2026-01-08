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
  let gameOver = false;

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
  };

  const currentPlayer = () =>
    round % 2 === 1 ? playerX.getSign() : playerO.getSign();

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
    if (gameOver) {
      return { ok: false, reason: "game-over" };
    }

    const boardSize = gameBoard.getBoardSize();
    if (!Number.isInteger(index) || index < 0 || index >= boardSize) {
      return { ok: false, reason: "invalid-index" };
    }

    if (gameBoard.getField(index) !== "")
      return { ok: false, reason: "occupied" };

    const sign = currentPlayer();
    gameBoard.setField(index, sign);

    const result = checkWinConditions();
    if (result === "X" || result === "O") {
      gameOver = true;
      return { ok: true, winner: result, round, finished: true };
    }

    if (result === "draw") {
      gameOver = true;
      console.log("DRAW");
      return { ok: true, winner: null, round, finished: true };
    }

    round++;
    return { ok: true, finished: false };
  };

  const isGameOver = () => gameOver;

  return { playRound, currentPlayer, reset, checkWinConditions, isGameOver };
})();

const displayController = (() => {
  const resetButton = document.getElementById("resetButton");
  const statusMessage = document.getElementById("statusMessage");
  const cells = document.querySelectorAll(".cell");

  const showMessage = (message) => {
    if (!statusMessage) return;
    statusMessage.textContent = message;
  };

  const renderBoard = () => {
    const board = gameBoard.getBoard();
    cells.forEach((cell, i) => {
      cell.textContent = board[i];
    });
  };

  const handleResult = (game) => {
    if (!game.ok) {
      if (game.reason === "game-over") {
        showMessage("Game over --- press Reset to play again");
        return;
      }
      showMessage(
        game.reason === "occupied" ? "That cell is taken" : "Invalid Move",
      );
      return;
    }

    if (game.finished) {
      if (game.winner) {
        showMessage(`${game.winner} WINS!!`);
      } else {
        showMessage("Draw");
      }
      return;
    }

    showMessage(`${gameController.currentPlayer()} Turn to move`);
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
  showMessage(`${gameController.currentPlayer()} Turn to move`);

  return { renderBoard };
})();
