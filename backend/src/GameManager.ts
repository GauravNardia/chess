import { WebSocket } from "ws";
import { INIT_GAME, MOVE } from "./messages";
import { Game } from "./Game";

export class GameManager {
    private games: Game[] = [];
    private pendingUser: WebSocket | null = null;
    private users: WebSocket[] = [];

    addUser(socket: WebSocket) {
        this.users.push(socket);
        this.addHandler(socket);
    }

    removeUser(socket: WebSocket) {
        this.users = this.users.filter(user => user !== socket);

        // Remove the user from any game
        const gameIndex = this.games.findIndex(game => game.player1 === socket || game.player2 === socket);
        if (gameIndex !== -1) {
            const game = this.games[gameIndex];
            const opponent = game.player1 === socket ? game.player2 : game.player1;
            opponent.send(JSON.stringify({ type: "GAME_ABORTED", message: "Opponent left the game." }));
            this.games.splice(gameIndex, 1);
        }

        // Clear pending user if it's the one disconnecting
        if (this.pendingUser === socket) {
            this.pendingUser = null;
        }

        socket.removeAllListeners();
    }

    private addHandler(socket: WebSocket) {
        socket.on('message', (data) => {
            let message;
            try {
                message = JSON.parse(data.toString());
            } catch (e) {
                console.error("Invalid JSON received:", data);
                return;
            }

            switch (message.type) {
                case INIT_GAME:
                    if (this.pendingUser && this.pendingUser !== socket) {
                        const game = new Game(this.pendingUser, socket);
                        this.games.push(game);
                        this.pendingUser = null;
                    } else {
                        this.pendingUser = socket;
                    }
                    break;

                case MOVE:
                    const game = this.games.find(
                        game => game.player1 === socket || game.player2 === socket
                    );
                    if (game) {
                        game.makeMove(socket, message.payload.move);
                    }
                    break;

                default:
                    console.warn("Unhandled message type:", message.type);
                    break;
            }
        });

        socket.on('close', () => {
            this.removeUser(socket);
        });
    }
}
