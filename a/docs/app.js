const API = "http://localhost:3000";

// REGISTER
async function register(){
  const res = await fetch(API+"/auth/register",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({
      name: rname.value,
      email: remail.value,
      password: rpass.value
    })
  });
  const data = await res.json();
  msg.innerText = data.msg || data.error;
}

// LOGIN
async function login(){
  const res = await fetch(API + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: lemail.value,
      password: lpass.value
    })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.user._id);
    localStorage.setItem("userName", data.user.name); // ⭐ MISSING LINE
    location.href = "feed.html";
  } else {
    msg.innerText = "Login failed";
  }
}

// CREATE POST
async function createPost(){
  await fetch(API+"/post",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({
      userId: localStorage.getItem("userId"),
      text: postText.value
    })
  });
  loadFeed();
}

// LOAD FEED
async function loadFeed(){
  const res = await fetch(API+"/post");
  const posts = await res.json();
  feed.innerHTML = "";
  posts.forEach(p=>{
    feed.innerHTML += `<p>${p.text}</p><hr>`;
  });
}

if(typeof feed !== "undefined"){
  loadFeed();
}
