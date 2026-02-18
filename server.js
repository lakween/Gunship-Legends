// server.js (Root Folder)
const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));
  const io = new Server(httpServer, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("Trainer connected:", socket.id);

    socket.on("spawn_pokemon", async () => {
      try {
        // Fetch a random Pokemon between ID 1 and 151
        const randomId = Math.floor(Math.random() * 151) + 1;
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
        const data = await res.json();

        // Game Logic: Is this Pokemon "Heavy" (over 50kg)?
        socket.isHeavy = data.weight > 500; // PokéAPI weight is in hectograms
        
        socket.emit("new_encounter", {
          name: data.name,
          sprite: data.sprites.front_default,
          weight: data.weight
        });
      } catch (err) {
        console.error("PokéAPI Error", err);
      }
    });

    socket.on("action", (choice) => {
      // Choice 'RUN' is safe for heavy, 'FIGHT' is safe for light
      const survived = (choice === 'FIGHT' && !socket.isHeavy) || (choice === 'RUN' && socket.isHeavy);
      
      if (survived) {
        socket.emit("success");
      } else {
        socket.emit("crash");
      }
    });
  });

  httpServer.listen(3000);
});