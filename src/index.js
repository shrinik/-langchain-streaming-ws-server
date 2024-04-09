const WebSocket = require('ws');
const ollama = require("@langchain/community/chat_models/ollama")

const port = process.env.PORT || 3000

const server = new WebSocket.Server({
  port: port
});

let sockets = [];
server.on('connection', function (socket) {
  console.log("Client connected")
  sockets.push(socket);

  socket.on('message', function (msg) {
    var enc = new TextDecoder("utf-8");
    let query = enc.decode(msg);
    const ollamaLlm = new ollama.ChatOllama({
      baseUrl: "http://localhost:11434", // Default value
      model: "mistral",
      streaming: true,
      callbacks: [
        {
          handleLLMNewToken(token) {
            socket.send(token)
          },
        },
      ],
    });
    ollamaLlm.invoke(query)
  });

  // When a socket closes, or disconnects, remove it from the array.
  socket.on('close', function () {
    sockets = sockets.filter(s => s !== socket);
  });
});