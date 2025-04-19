import { useEffect, useState } from "react";
import ChessBoard from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess } from "chess.js";

// Game event types
export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";

const Game = () => {
  const socket = useSocket();
  const [chess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case INIT_GAME:
          setBoard(chess.board());
          setStarted(true);
          break;

        case MOVE: {
          const { from, to, promotion } = message.payload;
          try {
            chess.move({ from, to, promotion: promotion || "q" });
            setBoard(chess.board());
            console.log("Move made");
          } catch (err) {
            console.error("Invalid move received from server", err);
          }
          break;
        }

        case GAME_OVER:
          console.log("Game over");
          break;
      }
    };
  }, [socket]);

  if (!socket) return <div className="text-center py-10">Connecting...</div>;

  return (
    <div className="w-full flex justify-center p-4">
      <div className="max-w-screen-lg w-full">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <div className="md:col-span-4 flex justify-center">
            <ChessBoard
              chess={chess}
              setBoard={setBoard}
              socket={socket}
              board={board}
            />
          </div>
          <div className="md:col-span-2 bg-green-200 p-6 rounded-lg flex flex-col items-center justify-center shadow-md">
            {!started ? (
              <button
                className="bg-neutral-900 hover:bg-neutral-800 border-none text-white px-6 py-3 rounded-lg transition-all"
                onClick={() => {
                  socket.send(JSON.stringify({ type: INIT_GAME }));
                }}
              >
                Start Game
              </button>
            ) : (
              <p className="text-gray-700 text-lg font-semibold">
                Game in Progress
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
