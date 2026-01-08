const socket = io();

function sendMsg() {
  const input = document.getElementById("msg");
  const message = input.value.trim();

  if (message === "") return;

  socket.emit("chat", message);
  input.value = "";
}

socket.on("chat", (data) => {
  const li = document.createElement("li");
  li.innerText = data;
  document.getElementById("messages").appendChild(li);
});
