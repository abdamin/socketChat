const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const userList = document.getElementById("users");
const roomName = document.getElementById("room-name");

//notification sound
const notifAudio = new Audio("/sounds/messenger.mp3");

//Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

//Join chatroom
socket.emit("joinRoom", { username, room });

//get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//message from server
socket.on("message", message => {
  console.log(message);

  outputMessage(message);

  //Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//message submit
chatForm.addEventListener("submit", e => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;

  //Emit msg to server
  socket.emit("chatMessage", msg);

  //clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

//out messsage to dom
const outputMessage = message => {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
      ${message.text}
    </p>`;

  chatMessages.appendChild(div);

  if (username !== message.username) {
    notifAudio.play();
  }
};

//Add room name to dom
const outputRoomName = room => {
  roomName.innerText = room;
};

//Add users to DOM
const outputUsers = users => {
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join("")}
    `;
};
