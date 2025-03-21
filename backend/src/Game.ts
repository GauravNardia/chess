import { Chess } from "chess.js";
import { WebSocket } from "ws";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";

export class Game {
    public player1: WebSocket;
    public player2: WebSocket;
    private board: Chess;
    private moves: string[];
    private startTime: Date;
    private moveCount = 0;

    constructor(player1: WebSocket, player2: WebSocket) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.moves = [];
        this.startTime = new Date();

        this.player1.send(JSON.stringify({ type: INIT_GAME, payload: { color: "white" } }));
        this.player2.send(JSON.stringify({ type: INIT_GAME, payload: { color: "black" } }));
    }

    makeMove(socket: WebSocket, move: { from: string; to: string }) {
        if (this.moveCount % 2 === 0 && socket !== this.player1) return;
        if (this.moveCount % 2 === 1 && socket !== this.player2) return;

        try {
            const result = this.board.move(move);
            if (!result) {
                console.log("Invalid move:", move);
                return;
            }
        } catch (error) {
            console.log("Move error:", error);
            return;
        }

        this.moveCount++;
        this.moves.push(`${move.from}-${move.to}`);

        // Send the move to the opponent
        const opponent = socket === this.player1 ? this.player2 : this.player1;
        if (opponent.readyState === WebSocket.OPEN) {
            opponent.send(JSON.stringify({ type: MOVE, payload: move }));
        }

        // Check for game over
        if (this.board.isGameOver()) {
            const winner = this.board.turn() === "w" ? "black" : "white";
            const gameOverMessage = JSON.stringify({ type: GAME_OVER, payload: { winner } });

            if (this.player1.readyState === WebSocket.OPEN) this.player1.send(gameOverMessage);
            if (this.player2.readyState === WebSocket.OPEN) this.player2.send(gameOverMessage);
        }
    }
}
