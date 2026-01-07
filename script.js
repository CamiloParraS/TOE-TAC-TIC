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
  const getBoardSize = () => board.length();

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

    if (round === 9) return "draw";
    return null;
  };

  const playRound = (index) => {
    boardSize = gameBoard.getBoardSize();
    if (!Number.isInteger(index) || index < 0 || index >= boardSize) {
      return { ok: false, reason: "invalid-index" };
    }
    if (gameBoard.getField(index) !== "")
      return { ok: false, reason: "occupied" };

    const sign = currentPlayer();
    gameBoard.setField(index, sign);

    const result = checkWinConditions();
    if (result === "X" || result === "O") {
      console.log(`Winner: ${result}`);
      return { winner: result, round };
    }

    if (result === "draw") {
      console.log("DRAW");
      reset();
      return { winner: null, round };
    }

    console.log(`Current Round: ${round}`);
    round++;
    console.log(`${currentPlayer()} turn`);
  };

  return { playRound, currentPlayer, reset, checkWinConditions };
})();
