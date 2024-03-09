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

  // join private room
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
      player1: {
        userName: allUsers[room.players[0]].userName,
        id: room.players[0]
      },
      player2: {
        id: socket.id,
        userName: data.userName
      }
    })
  })

  // enter matchmaking (random queue)
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
        player1: {
          id: currentUser.socket.id,
          userName: currentUser.userName
        },
        player2: {
          id: opponent.socket.id,
          userName: opponent.userName
        }
      })
    } else {
      queue.push(currentUser)
    }
  })

  // send damage
  socket.on("attack", (data) => {
    socket.to(allUsers[socket.id].room).emit("damage", {attacker: socket.id, damage: data.damage})
  })

  // update equations

  // handle on player disocnnect
  socket.on("disconnect", (reason) => {
    const currentUser = allUsers[socket.id]
    const roomId = currentUser.room

    if (roomId && allRooms[roomId] !== undefined) {
      const players = allRooms[roomId].players
      if (players[0] === socket.id) { players[1].room == undefined} else {}
      
      delete allRooms[roomId]

      socket.to(roomId).emit("opponent_disconnected", reason)
    } else if (roomId && privateRooms[roomId] !== undefined) {
      delete privateRooms[roomId]
    }

    delete allUsers[socket.id]
  });
});

server.listen(3000, () => {
  console.log("SERVER IS RUNNING");
});
