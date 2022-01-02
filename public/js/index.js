const socket = io();
const h1 = document.querySelector('h1');
const nicknameWrapper = document.querySelector('#nicknameWrapper');
const nicknameForm = document.querySelector('#nicknameForm');
const nicknameinput = document.querySelector('#nicknameInput');
const roomWrapper = document.querySelector('#roomWrapper');
const roomForm = document.querySelector('#roomForm');
const roomInput = document.querySelector('#roomInput');
const messageWrapper = document.querySelector('#messageWrapper');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#messageInput');
const ul = document.querySelector('ul');

let room = '';
let nickname = '';

const init = () => {
  messageWrapper.hidden = true;
  roomWrapper.hidden = true;
  roomInput.focus();
};

init();

/* ====== Toggle Form ======= */
const showRoomForm = (newNickname) => {
  console.log(newNickname);
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
  h1.hidden = true;
  messageInput.focus();
  const p = document.createElement('p');
  p.innerHTML = `👋 ${nickname} in Room ${room} `;
  document.body.insertBefore(p, ul);
};

/* ====== SOCKET EVENT ======= */

const addMessage = (message) => {
  console.log(message);
  const li = document.createElement('li');
  li.innerText = message;
  ul.append(li);
};

socket.on('welcomeRoom', (message) => {
  console.log('welcome room', message);
  addMessage(message);
});

socket.on('leftRoom', (message) => {
  console.log('Leaved Room', message);
  addMessage(message);
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
  room = roomInput.value;
  roomInput.value = '';
};

const handleMessage = (e) => {
  e.preventDefault();
  const message = messageInput.value;
  console.log(`roomname`, room);
  socket.emit(
    'newMessage',
    { roomname: room, message, nickname },
    (message) => {
      addMessage(`me : ${message}`);
    }
  );
  messageInput.value = '';
};

nicknameForm.addEventListener('submit', handleNickname);
roomForm.addEventListener('submit', handleRoom);
messageForm.addEventListener('submit', handleMessage);
