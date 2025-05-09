import { useEffect, useState } from "react"

const WS_URL = "wss://chess-flmc.onrender.com";

export const useSocket = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(WS_URL);
        ws.onopen = () => {
            console.log("connected");
            setSocket(ws);
        }

        ws.onclose = () => {
            console.log("disconnected");
            setSocket(null);
        }

        return () => {
            ws.close();
        }
    }, [])

    return socket;
}