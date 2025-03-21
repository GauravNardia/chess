"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const ws_1 = require("ws");
const messages_1 = require("./messages");
class Game {
    constructor(player1, player2) {
        this.moveCount = 0;
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.moves = [];
        this.startTime = new Date();
        this.player1.send(JSON.stringify({ type: messages_1.INIT_GAME, payload: { color: "white" } }));
        this.player2.send(JSON.stringify({ type: messages_1.INIT_GAME, payload: { color: "black" } }));
    }
    makeMove(socket, move) {
        if (this.moveCount % 2 === 0 && socket !== this.player1)
            return;
        if (this.moveCount % 2 === 1 && socket !== this.player2)
            return;
        try {
            const result = this.board.move(move);
            if (!result) {
                console.log("Invalid move:", move);
                return;
            }
        }
        catch (error) {
            console.log("Move error:", error);
            return;
        }
        this.moveCount++;
        this.moves.push(`${move.from}-${move.to}`);
        // Send the move to the opponent
        const opponent = socket === this.player1 ? this.player2 : this.player1;
        if (opponent.readyState === ws_1.WebSocket.OPEN) {
            opponent.send(JSON.stringify({ type: messages_1.MOVE, payload: move }));
        }
        // Check for game over
        if (this.board.isGameOver()) {
            const winner = this.board.turn() === "w" ? "black" : "white";
            const gameOverMessage = JSON.stringify({ type: messages_1.GAME_OVER, payload: { winner } });
            if (this.player1.readyState === ws_1.WebSocket.OPEN)
                this.player1.send(gameOverMessage);
            if (this.player2.readyState === ws_1.WebSocket.OPEN)
                this.player2.send(gameOverMessage);
        }
    }
}
exports.Game = Game;
