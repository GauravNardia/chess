import  express from "express";
import http from "http"
import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";

const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({ port: 8000 });

const gameManager = new GameManager();

wss.on('connection', function connection(ws){
    gameManager.addUser(ws);
    ws.on('disconnect', () => gameManager.removeUser(ws))
})

app.get("/", (_req, res) => {
    res.send("WebSocket server is live on Render 🚀");
  });

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});