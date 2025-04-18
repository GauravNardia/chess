import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";

const app = express();
const server = http.createServer(app);

// Create WebSocketServer on the same HTTP server
const wss = new WebSocketServer({ server });

const gameManager = new GameManager();

// WebSocket connection handling
wss.on('connection', function connection(ws) {
  gameManager.addUser(ws);
  ws.on('disconnect', () => gameManager.removeUser(ws));
});

// HTTP route for checking if the server is live
app.get("/", (_req, res) => {
  res.send("WebSocket server is live on Render 🚀");
});

// Use the port provided by Render or fallback to 3000 for local dev
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
