const socket = io();
const h2 = document.querySelector('h2');
const nicknameWrapper = document.querySelector('#nicknameWrapper');
const nicknameForm = document.querySelector('#nicknameForm');
const nicknameinput = document.querySelector('#nicknameInput');
const roomWrapper = document.querySelector('#roomWrapper');
const roomForm = document.querySelector('#roomForm');
const roomInput = document.querySelector('#roomInput');
const messageWrapper = document.querySelector('#messageWrapper');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#messageInput');
const messageUL = document.querySelector('#messageUL');
const roomsUL = document.querySelector('#roomsUL');
const welcomeText = document.createElement('p');
const membersWrapper = document.querySelector('#membersWrapper');
const membersText = document.querySelector('#membersText');

let currentRoom = '';
let nickname = '';

const init = () => {
  messageWrapper.hidden = true;
  roomWrapper.hidden = true;
  membersWrapper.hidden = true;
  roomInput.focus();
};

init();

/* ====== Toggle Form ======= */
const showRoomForm = (newNickname) => {
  nickname = newNickname;
  nicknameWrapper.hidden = true;
  roomWrapper.hidden = false;
  messageWrapper.hidden = true;
  roomInput.focus();
  const p = document.createElement('p');
  p.innerHTML = `😎 Hello ${nickname}~ Please Join a room `;
  roomWrapper.prepend(p);
};

const showMessageForm = () => {
  nicknameWrapper.hidden = true;
  roomWrapper.hidden = true;
  messageWrapper.hidden = false;
  membersWrapper.hidden = false;
  h2.hidden = true;
  messageInput.focus();
  welcomeText.innerHTML = `👋 ${nickname} in Room ${currentRoom} `;
  document.body.insertBefore(welcomeText, messageUL);
};

/* ====== SOCKET EVENT ======= */

const addMessage = (message) => {
  console.log(`new message`, message);
  const li = document.createElement('li');
  li.innerText = message;
  messageUL.append(li);
};

socket.on('welcomeRoom', (message) => {
  console.log('welcome room', message);
  addMessage(message);
});

socket.on('leftRoom', (message) => {
  console.log('Leaved Room', message);
  addMessage(message);
});

socket.on('newRoom', (rooms) => {
  const roomsLength = document.querySelector('#roomsLength');
  roomsLength.innerHTML = rooms.length;
  roomsUL.innerHTML = '';
  const roomMembers = [];
  rooms.forEach((room) => {
    const li = document.createElement('li');
    li.innerHTML = `${room.room} ➡ ${room.membersNickname.length} users`;
    roomsUL.append(li);
    if (room.room === currentRoom) {
      room.membersNickname.forEach((member) => {
        roomMembers.push(member.nickname);
      });
    }
  });
  membersText.innerHTML = roomMembers.toString();
});

socket.on('newMessage', (message) => {
  console.log('new message', message);
  addMessage(`${nickname} : ${message}`);
});

/* ======== CLIENT EVENT =============*/

const handleNickname = (e) => {
  e.preventDefault();
  socket.emit('nickname', { nickname: nicknameinput.value }, showRoomForm);
};

const handleRoom = (e) => {
  e.preventDefault();
  socket.emit(
    'enterRoom',
    { roomname: roomInput.value, nickname },
    showMessageForm
  );
  currentRoom = roomInput.value;
  roomInput.value = '';
};

const handleMessage = (e) => {
  e.preventDefault();
  const message = messageInput.value;
  socket.emit(
    'newMessage',
    { roomname: currentRoom, message, nickname },
    (message) => {
      addMessage(`me : ${message}`);
    }
  );
  messageInput.value = '';
};

nicknameForm.addEventListener('submit', handleNickname);
roomForm.addEventListener('submit', handleRoom);
messageForm.addEventListener('submit', handleMessage);
