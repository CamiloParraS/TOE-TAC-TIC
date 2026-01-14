# TOE-TAC-TIC

A browser-based Tic-Tac-Toe game built as part of [The Odin Project's JavaScript Curriculum](https://www.theodinproject.com/lessons/node-path-javascript-tic-tac-toe)

This project focuses on JavaScript design patterns specifically **Factory Functions** and the **Module Pattern** while using an ui inspired by the game *Nier Automata*

**[PLAY HERE!](https://camiloparras.github.io/TOE-TAC-TIC/)**

* Game logic is separated from the DOM manipulation.
* Users can rename "Player X" and "Player O" dynamically.
* Persists win/loss/draw counts for the current session.

## Technologies Used

* **HTML5**
* **CSS3** (Custom styles + `yorha.css`)
* **JavaScript (ES6+)**

## Concepts Learned

The main goal of this assignment was to use encapsulating logic

* **Module Pattern:** Used for the `gameBoard`, `gameController`, and `displayController` to create private scopes and expose only public methods.
* **Factory Functions:** Used for creating `player` objects, allowing multiple instances without using classes.

----

UI components styled using YoRHa UI by metakirby5, used under the MIT License.

Original source: https://github.com/metakirby5/yorha
