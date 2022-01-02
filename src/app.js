import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = http.createServer(app);
const socketIO = new Server(httpServer);

app.use('/public', express.static(__dirname + '/../public'));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/../views');

app.get('/', (req, res) => {
  return res.status(200).render('index.ejs');
});

const findPublicRooms = () => {
  const publicRooms = [];
  const socketIDs = socketIO.sockets.adapter.sids;
  const rooms = socketIO.sockets.adapter.rooms;
  rooms.forEach((value, key) => {
    if (!socketIDs.has(key)) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
};

socketIO.on('connection', (socket) => {
  socket.onAny((event) => {
    console.log('Socket Event ➡  ' + event);
    console.log(socketIO.sockets.adapter);
    const publicRooms = findPublicRooms();
    console.log(publicRooms);
  });

  socket.on('disconnecting', (reason) => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit('leftRoom', `${socket.nickname} is left`);
    });
  });

  socket.on('nickname', (data, showRoomForm) => {
    socket.nickname = data.nickname;
    showRoomForm(data.nickname);
  });

  socket.on('enterRoom', (data, showMessageForm) => {
    socket.join(data.roomname);
    showMessageForm();
    socket.to(data.roomname).emit('welcomeRoom', `${data.nickname} is joined`);
  });

  socket.on('newMessage', (data, done) => {
    socket.to(data.roomname).emit('newMessage', data.message);
    done(data.message);
  });
});

httpServer.listen(8080, () => {
  console.log(`Server is listening on PORT 8080`);
});
