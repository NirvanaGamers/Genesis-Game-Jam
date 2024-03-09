const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { randomUUID } = require("crypto");
const { SocketAddress } = require("net");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const allUsers = {};

const easyQueue = [];
const mediumQueue = [];
const hardQueue = [];

const allRooms = {};
const privateRooms = {};

io.on("connection", async (socket) => {
  console.log(`User Connected:  + ${socket.id}`);

  // new user is added to list of users when joins
  allUsers[socket.id] = {
    socket: socket,
    userName: undefined,
    room: undefined,
  };

  // creates privateRoom 
  socket.on("create_room", (data) => {
    const currentUser = allUsers[socket.id]
    currentUser.userName = data.userName

    const roomId = randomUUID()
    currentUser.room = roomId

    socket.join(roomId)

    privateRooms[roomId] = {
      difficulty: data.difficulty,
      players: [socket.id]
    }
  })

  socket.on("join_room", (data) => {
    const currentUser = allUsers[socket.io]
    currentUser.userName = data.userName

    const roomId = data.roomId
    if (privateRooms[roomId] === undefined) {
      socket.emit("room_not_found", {})
      return
    }
    currentUser.room = roomId

    const room = privateRooms[roomId]
    delete privateRooms[roomId]

    room.players.push(socket.id)
    allRooms[roomId] = room

    room.players.push(socket.id)
    socket.join(roomId)

    socket.to(roomId).emit("match_found", {
      player1: allUsers[room.players[0]].userName,
      player2: data.userName
    })
  })

  socket.on("find_match", (data) => {
    const currentUser = allUsers[socket.id]
    currentUser.name = data.userName

    let queue = undefined
    if (data.difficulty == "easy") {
      queue = easyQueue
    } else if (data.difficulty == "medium") {
      queue = mediumQueue
    } else {
      queue = hardQueue
    }

    if (queue.length > 0) {
      const opponent = queue.pop()
      const roomId = randomUUID()
      const room = {
        difficulty: data.difficulty,
        players: [currentUser.socket.id, opponent.socket.id]
      }
      allRooms[roomId] = room

      opponent.socket.join(roomId)
      currentUser.socket.join(roomId)

      opponent.room = roomId
      currentUser.room = roomId

      socket.to(roomId).emit("match_found", {
        player1: currentUser.userName,
        player2: opponent.userName
      })
    } else {
      queue.push(currentUser)
    }
  })

  // puts player in random queue
  socket.on("request_to_play", (data) => {
    const currentUser = allUsers[socket.id];
    currentUser.playerName = data.playerName;

    let opponentPlayer;

    for (const key in allUsers) {
      const user = allUsers[key];
      if (user.online && !user.playing && socket.id !== key) {
        opponentPlayer = user;
        break;
      }
    }

    if (opponentPlayer) {
      allRooms.push({
        player1: opponentPlayer,
        player2: currentUser,
      });

      currentUser.socket.emit("OpponentFound", {
        opponentName: opponentPlayer.playerName,
      });

      opponentPlayer.socket.emit("OpponentFound", {
        opponentName: currentUser.playerName,
      });

      currentUser.socket.on("playerMoveFromClient", (data) => {
        currentUser.damage = data.result;
        opponentPlayer.socket.emit("playerMoveFromServer", {
          ...data,
        });
      });
k
      opponentPlayer.socket.on("playerMoveFromClient", (data) => {
        opponentPlayer.damage = data.result;
        currentUser.socket.emit("playerMoveFromServer", {
          ...data,
        });
      });
    } else {
      currentUser.socket.emit("OpponentNotFound");
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(reason);
    const currentUser = allUsers[socket.id];
    currentUser.online = false;
    currentUser.playing = false;

    for (let index = 0; index < allRooms.length; index++) {
      const { player1, player2 } = allRooms[index];

      if (player1.socket.id === socket.id) {
        player2.socket.emit("opponentLeftMatch");
        break;
      }

      if (player2.socket.id === socket.id) {
        player1.socket.emit("opponentLeftMatch");
        break;
      }
    }
    delete allUsers[socket.id];
  });
});

server.listen(3000, () => {
  console.log("SERVER IS RUNNING");
});
