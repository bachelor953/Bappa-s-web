const API = "https://bappa-s-web.onrender.com";

/* =====================
   REGISTER
===================== */
async function register(){
  const res = await fetch(API + "/auth/register", {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({
      name: rname.value,
      email: remail.value,
      password: rpass.value
    })
  });

  const data = await res.json();
  msg.innerText = data.msg || data.error;
}

/* =====================
   LOGIN
===================== */
async function login(){
  const res = await fetch(API + "/auth/login", {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({
      email: lemail.value,
      password: lpass.value
    })
  });

  const data = await res.json();

  if(data.token){
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.user._id);
    localStorage.setItem("userName", data.user.name);
    location.href = "feed.html";
  } else {
    msg.innerText = "Login failed";
  }
}

/* =====================
   CREATE POST
===================== */
async function createPost(){
  const text = postText.value.trim();
  if(!text) return;

  await fetch(API + "/post", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      userId: localStorage.getItem("userId"),
      text
    })
  });

  postText.value = "";
  // ❌ loadFeed এখানে আর কল হবে না
}

/* =====================
   LOAD WALLET
===================== */
async function loadWallet(){
  const userId = localStorage.getItem("userId");
  if(!userId) return;

  const res = await fetch(API + "/users/wallet/" + userId);
  const data = await res.json();

  const walletEl = document.getElementById("wallet");
  if(walletEl){
    walletEl.innerText = "💰 Wallet: ₹" + data.wallet;
  }
}

/* =====================
   AUTO LOAD
===================== */
window.onload = () => {
  loadWallet();
};

/* =====================
   LOGOUT
===================== */
function logout(){
  localStorage.clear();
  location.href = "/";
}
