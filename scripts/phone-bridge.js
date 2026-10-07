// scripts/phone-bridge.js
const http = require('http');

const PORT = 3000;
const TARGET_PORT = 8081;

const server = http.createServer((req, res) => {
  const options = {
    hostname: 'localhost',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${TARGET_PORT}`,
    },
  };

  const proxy = http.request(options, (targetRes) => {
    res.writeHead(targetRes.statusCode, targetRes.headers);
    targetRes.pipe(res, { end: true });
  });

  proxy.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <body style="font-family:sans-serif; background:#09090B; color:#fff; text-align:center; padding:40px;">
          <h2 style="color:#F5B942;">🍽️ TasteMatch Mobile Bridge</h2>
          <p>Connecting to Metro Bundler on port ${TARGET_PORT}...</p>
          <p style="color:#71717A;">Make sure <code>npx expo start</code> is running in your terminal.</p>
        </body>
      </html>
    `);
  });

  req.pipe(proxy, { end: true });
});

// WebSocket support for Metro bundler hot reload & HMR
server.on('upgrade', (req, socket, head) => {
  const proxyReq = http.request({
    hostname: 'localhost',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers,
  });

  proxyReq.on('upgrade', (targetRes, targetSocket, targetHead) => {
    socket.write(
      `HTTP/1.1 101 Switching Protocols\r\n` +
      Object.entries(targetRes.headers).map(([k, v]) => `${k}: ${v}`).join('\r\n') +
      '\r\n\r\n'
    );
    targetSocket.pipe(socket);
    socket.pipe(targetSocket);
  });

  proxyReq.on('error', () => {
    socket.destroy();
  });

  proxyReq.end();
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`TasteMatch Mobile Bridge running at http://0.0.0.0:${PORT}`);
});
