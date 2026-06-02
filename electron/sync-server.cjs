const { WebSocketServer } = require("ws");
const http = require("http");
const os = require("os");

const PORT = 9847;
const DISCOVER_PORT = 9846;
let wss = null;
let discoverServer = null;
let expectedToken = null;
let latestState = null;
let onStateFromClient = null;

function getLanAddresses() {
  const ips = [];
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const iface of ifaces || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

function broadcast(message, except) {
  if (!wss) return;
  const raw = JSON.stringify(message);
  for (const client of wss.clients) {
    if (client !== except && client.authenticated && client.readyState === 1) {
      client.send(raw);
    }
  }
}

function startSyncServer(authToken, callbacks) {
  expectedToken = authToken;
  onStateFromClient = callbacks.onStateFromClient;

  if (wss) return { port: PORT, addresses: getLanAddresses() };

  if (!discoverServer) {
    discoverServer = http.createServer((req, res) => {
      if (req.url === "/discover") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            service: "prism-finance",
            wsPort: PORT,
            ips: getLanAddresses(),
          })
        );
        return;
      }
      res.writeHead(404);
      res.end();
    });
    discoverServer.listen(DISCOVER_PORT, "0.0.0.0");
  }

  wss = new WebSocketServer({ host: "0.0.0.0", port: PORT });

  wss.on("connection", (ws) => {
    ws.authenticated = false;

    ws.on("message", (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        ws.close();
        return;
      }

      if (msg.type === "auth") {
        if (msg.token === expectedToken) {
          ws.authenticated = true;
          ws.send(JSON.stringify({ type: "auth_ok" }));
          if (latestState) {
            ws.send(JSON.stringify({ type: "state", payload: latestState }));
          } else {
            callbacks.onNeedHostState?.();
          }
        } else {
          ws.send(JSON.stringify({ type: "auth_fail" }));
          ws.close();
        }
        return;
      }

      if (!ws.authenticated) {
        ws.close();
        return;
      }

      if (msg.type === "state" && msg.payload) {
        latestState = msg.payload;
        onStateFromClient?.(msg.payload);
        broadcast({ type: "state", payload: msg.payload }, ws);
      }
    });

    ws.on("close", () => {});
  });

  return { port: PORT, addresses: getLanAddresses() };
}

function stopSyncServer() {
  if (wss) {
    wss.close();
    wss = null;
  }
  if (discoverServer) {
    discoverServer.close();
    discoverServer = null;
  }
  latestState = null;
}

function pushHostState(state) {
  latestState = state;
  broadcast({ type: "state", payload: state });
}

module.exports = {
  startSyncServer,
  stopSyncServer,
  pushHostState,
  getLanAddresses,
  PORT,
};
