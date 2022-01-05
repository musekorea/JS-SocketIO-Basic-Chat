import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';

const app = express();
const httpServer = http.createServer(app);
const socketIO = new Server(httpServer, {
  cors: {
    origin: ['https://admin.socket.io'],
    credntials: true,
  },
});
instrument(socketIO, {
  auth: false,
});

app.use('/public', express.static(__dirname + '/../public'));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/../views');

app.get('/', (req, res) => {
  return res.status(200).render('index.ejs');
});

let publicRooms = [];

const findPublicRooms = () => {
  publicRooms = []; //초기화
  const roomsData = [];
  const socketIDs = socketIO.sockets.adapter.sids;
  const rooms = socketIO.sockets.adapter.rooms;

  rooms.forEach((value, key) => {
    //만들어진 Room 추출
    if (!socketIDs.has(key)) {
      roomsData.push(key);
    }
  });

  roomsData.forEach((room) => {
    const members = rooms.get(room); //id로 된 멤버
    const membersNickname = [];
    members.forEach((member) => {
      //id에서 닉네임 추출
      socketIO.sockets.sockets.forEach((socket) => {
        if (member === socket.id) {
          membersNickname.push({ id: member, nickname: socket.nickname });
        }
      });
    });
    publicRooms.push({ room, membersNickname });
  });
  return publicRooms;
};

socketIO.on('connection', (socket) => {
  socketIO.emit('newRoom', findPublicRooms());
  socket.onAny((event) => {
    console.log('Socket Event ➡  ' + event);
  });

  socket.on('disconnecting', (reason) => {
    console.log(`disconnection reason - `, reason);
    socket.rooms.forEach((room) => {
      socket.to(room).emit('leftRoom', `${socket.nickname} is left`);
    });
    /* socketIO.emit('newRoom', findPublicRooms()); 이렇게 해줘도 되고  */
  });
  socket.on('disconnect', () => {
    socketIO.emit(
      'newRoom',
      findPublicRooms()
    ); /* 이렇게 disconnect로 완전히 끊어졌을때 해줘도 됨 */
  });

  socket.on('nickname', (data, showRoomForm) => {
    socket.nickname = data.nickname;
    showRoomForm(data.nickname);
  });

  socket.on('enterRoom', (data, showMessageForm) => {
    socket.join(data.roomname);
    showMessageForm();
    socket.to(data.roomname).emit('welcomeRoom', `${data.nickname} is joined`);
    socketIO.emit('newRoom', findPublicRooms());
  });

  socket.on('newMessage', (data, done) => {
    socket.to(data.roomname).emit('newMessage', data.message);
    done(data.message);
  });
});

httpServer.listen(8080, () => {
  console.log(`Server is listening on PORT 8080`);
});
