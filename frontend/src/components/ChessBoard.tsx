import { useState } from 'react';
import { MOVE } from '../screens/Game';
import { Color, PieceSymbol, Square } from 'chess.js';

const ChessBoard = ({chess, board, socket, setBoard }: {
    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color
    } | null)[][];
    socket: WebSocket;
    setBoard: any;
    chess: any;
}) => {
    const [from, setFrom] = useState<null | Square>(null);
  return (
    <div className='w-full text-white-200'>
        {board.map((row, i) => {
            return <div key={i} className='flex' >
                {row.map((square, j) => {
                    const squareRepresentation = String.fromCharCode(97 + (j % 8)) + "" + (8 - i) as Square;
                    return <div 
                    onClick={() => {
                        if(!from){
                            setFrom(squareRepresentation);
                        } else {
                            socket.send(JSON.stringify({
                                type: MOVE,
                                payload: {
                                  move: {
                                    from,
                                    to: squareRepresentation
                                  }
                                    
                                }
                            }))

                            setFrom(null);
                            chess.move({
                                from,
                                to: squareRepresentation
                            });
                            setBoard(chess.board());
                            console.log({
                                from,
                                to: squareRepresentation
                            })
                        }
                    }}
                    key={j} 
                    className={`w-16 h-16 ${(i+j)%2 ===0 ? 'bg-green-500' : 'bg-green-300' }`} >
                     <div className='w-full justify-center flex h-full' >
                        <div className='h-full flex flex-col justify-center'>
                        {square ? (
                          <img 
                            className='w-10' 
                            src={`/${square.color === "b" ? `b${square.type}` : `w${square.type}`}.png`} 
                            alt={`${square.color === "b" ? "Black" : "White"} ${square.type}`}
                          />
                        ) : null}
                        </div>
                     </div>
                    </div>
                })}
            </div>
        })}
    </div>
  )
}

export default ChessBoard