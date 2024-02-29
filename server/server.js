var express = require("express");

var app = express();

var server = app.listen(3000, async () => {
  console.log("server is running on port", server.address().port);
});

app.get('/game', (req, res) => {
  res.send("hello world!")
})

var http = require("http").Server(app);
var io = require("socket.io")(http);

let fullRooms = {}
let rooms = {}

io.on("connection", async (socket) => {
  console.log("User Connected");
  socket.on("disconnect", (reason) => {
    console.log(reason);
  });

  socket.on("create", async (room) => {
    if (!(room.name in rooms || room.name in fullRooms)) {
      socket.join(room.name)
      rooms[room.name] = { "players": [socket,], "current": 0 }
      socket.send({ "message": "OK" })
    }
    socket.send({ "message": "Room with same name already exists" })
  })

  socket.on("search", async () => {
    socket.send(rooms)
  })

  socket.on("join", async (room) => {
    if (room.name in rooms) {
      const room = rooms[room.name]
      room.players.push(socket)

      delete rooms[room.name]
      socket.join(room.name)
      
      fullRooms[room.name] = room
    }
  })
});