import { Chess, Move } from "chess.js";
import { WebSocket } from "ws";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";

export class Game {
    public player1: WebSocket;
    public player2: WebSocket;
    private board: Chess;
    private moves: string[];
    private startTime: Date;

    constructor(player1: WebSocket, player2: WebSocket) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.moves = [];
        this.startTime = new Date();

        // Assign colors
        this.player1.send(JSON.stringify({ type: INIT_GAME, payload: { color: "white" } }));
        this.player2.send(JSON.stringify({ type: INIT_GAME, payload: { color: "black" } }));
    }

    makeMove(socket: WebSocket, move: { from: string; to: string }) {
        const isWhiteTurn = this.board.turn() === "w";
        const isPlayerTurn = (isWhiteTurn && socket === this.player1) || (!isWhiteTurn && socket === this.player2);

        if (!isPlayerTurn) {
            socket.send(JSON.stringify({ type: "INVALID_MOVE", payload: { reason: "Not your turn." } }));
            return;
        }

        const legalMoves = this.board.moves({ verbose: true });
        const isLegal = legalMoves.some(
            (m) => m.from === move.from && m.to === move.to
        );

        if (!isLegal) {
            socket.send(JSON.stringify({ type: "INVALID_MOVE", payload: { reason: "Illegal move." } }));
            return;
        }

        let result: Move | null;
        try {
            result = this.board.move({ from: move.from, to: move.to, promotion: "q" }); // auto-queen promotion
        } catch (error) {
            socket.send(JSON.stringify({ type: "INVALID_MOVE", payload: { reason: "Move error." } }));
            console.error("Move error:", error);
            return;
        }

        if (!result) {
            socket.send(JSON.stringify({ type: "INVALID_MOVE", payload: { reason: "Invalid move." } }));
            return;
        }

        this.moves.push(`${move.from}-${move.to}`);

        const moveMessage = JSON.stringify({ type: MOVE, payload: result });

        // Send move to both players
        if (this.player1.readyState === WebSocket.OPEN) this.player1.send(moveMessage);
        if (this.player2.readyState === WebSocket.OPEN) this.player2.send(moveMessage);

        // Game over check
        if (this.board.isGameOver()) {
            const winner = this.board.isCheckmate()
                ? (isWhiteTurn ? "white" : "black")
                : "draw";

            const gameOverMessage = JSON.stringify({ type: GAME_OVER, payload: { winner } });

            if (this.player1.readyState === WebSocket.OPEN) this.player1.send(gameOverMessage);
            if (this.player2.readyState === WebSocket.OPEN) this.player2.send(gameOverMessage);
        }
    }
}
