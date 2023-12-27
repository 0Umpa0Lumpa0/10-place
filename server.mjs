import * as path from "path";
import express from "express";
import { log } from "console";
import WebSocket from "ws";

const port = process.env.PORT || 5000;
@@ -41,22 +42,66 @@ for (const [colorIndex, colorValue] of colors.entries()) {

const app = express();

app.use(express.static(path.join(process.cwd(), "client")));
const addPoint = (payload) => {
  const { x, y, color } = payload;
  if (!colors.includes(color)) throw 'Unknown color';
  if (x < 0 || x >= size || y < 0 || y >= size) throw 'Unknown coords';
  place[x + y * size] = color;
  return { x, y, color };
}

app.get("/*", (_, res) => {
  res.send("Place(holder)");
});

const ACTIONS = {
  getColors: () => colors,
  getPlace: () => place,
  addPoint: addPoint,
}

const BROADCAST_ACTIONS = ['addPoint'];

const makeMessage = (type, payload) => {
  const res = { type };
  try {
    if (!type || !(type in ACTIONS)) throw 'Unknown action type';
    res.payload = ACTIONS[type](payload);
  } catch (payload) {
    res.type = 'error';
    res.payload = payload;
  }
  return JSON.stringify(res);
}

const wss = new WebSocket.Server({
  noServer: true,
});

app.use(express.static(path.join(process.cwd(), "client")));

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url, req.headers.origin);
  console.log(url);
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

wss.on('connection', ws => {
  ws.on('error', console.error);
  ws.send(makeMessage('getPlace'));
  ws.on('message', msg => {
    const { type, payload } = JSON.parse(msg);
    const answer = makeMessage(type, payload);
    if (type && BROADCAST_ACTIONS.includes(type)) {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(answer);
      });
    } else ws.send(answer);
  });
});
