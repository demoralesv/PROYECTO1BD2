
const chatPage = () => {
  return `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Messages</title>
<style>
  :root{ --bg:#0b0d10; --panel:#12161c; --muted:#9fb0c8; --line:#2a3340; --text:#e7eef7; --accent:#5aa9ff }
  *{ box-sizing:border-box }
  body{ margin:0; font-family:system-ui,arial,segoe ui; background:var(--bg); color:var(--text) }
  a,button,input,textarea{ font:inherit }
  .btn{ padding:10px 12px; border-radius:10px; border:1px solid var(--line); background:#0f1217; color:var(--text); cursor:pointer; display:inline-flex; align-items:center; gap:8px; text-decoration:none }
  .btn.primary{ background:#0f141c }
  .btn.sm{ padding:6px 8px; font-size:.85rem }
  .card{ background:var(--panel); border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,.3) }
  .muted{ color:var(--muted) }
  .topbar{ position:sticky; top:0; z-index:20; backdrop-filter:saturate(1.2) blur(4px); display:flex; gap:12px; align-items:center; justify-content:space-between; padding:12px 18px; border-bottom:1px solid #0e1218; background:rgba(11,13,16,.6) }
  .brand .logo{width:28px; height:28px; border-radius:50%; background:#000; display:inline-block;background-image:url(https://cdn-icons-png.flaticon.com/512/18495/18495588.png);background-size:contain;}
  .page{ max-width:1200px; margin:24px auto; padding:0 16px; display:grid; gap:18px; grid-template-columns:320px 1fr }
  @media (max-width: 920px){ .page{ grid-template-columns:1fr } }
  .sidebar{ padding:12px; display:grid; gap:12px; align-self:start; position:sticky; top:72px }
  .search{ display:flex; gap:8px; }
  .input{ width:100%; padding:10px 12px; border-radius:10px; border:1px solid var(--line); background:#0f1217; color:#e7eef7 }
  .list{ display:grid; gap:6px; max-height:70vh; overflow:auto; padding-right:4px }
  .conv{ display:flex; gap:10px; align-items:center; padding:8px; border:1px solid var(--line); border-radius:12px; background:#0f1217; cursor:pointer }
  .conv:hover{ background:#10151d; }
  .conv.active{ border-color:#2f3b4c; background:#121923 }
  .avatar{ width:36px; height:36px; border-radius:10px; background:#1a2230; object-fit:cover }
  .row{ display:flex; align-items:center; justify-content:space-between; gap:8px }
  .name{ font-weight:600; }
  .last{ color:var(--muted); font-size:.9rem; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; max-width:210px }
  .chat{ display:grid; grid-template-rows:auto 1fr auto; height:78vh; }
  .chat-header{ display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 16px; border-bottom:1px solid var(--line) }
  .peer{ display:flex; align-items:center; gap:10px }
  .peer img{ width:40px; height:40px; border-radius:10px; object-fit:cover; background:#121820; border:1px solid var(--line) }
  .messages{
    overflow:auto;
    padding:12px;
    display:grid;
    gap:6px;
    }
    .bubble{
        padding:8px 10px;     /* ↓ más compacto */
        border-radius:14px;
        border:1px solid #2a3340;
        background:#10151a;   /* color para “ellos” */
        line-height:1.25;
        word-wrap:break-word;
    }
    .msg.me .bubble{
        background:#182030;   /* color para “yo” */
    }  
    .msg{
        display:flex;
        margin:2px 0;         
    }
    .msg.me{ justify-content:flex-end; }
    .msg.them{ justify-content:flex-start; }
    .msg .stack{
        max-width:72%;
        display:flex;
        flex-direction:column;
        gap:4px;             
    }

  .time{ font-size:.78rem; color:var(--muted) }
  .empty{ display:grid; place-items:center; color:var(--muted); height:78vh }
  .meta{
    font-size:.75rem;
    color:#9fb0c8;        /* muted */
    }
</style>
</head>
<body>
<header class="topbar">
  <div class="brand"><span class="logo"></span><span>Messages</span></div>
  <div style="display:flex; gap:8px">
    <a href="/profile" class="btn">← Back</a>
  </div>
</header>

<main class="page">
  <aside class="card sidebar">
    <div class="search">
      <input id="searchInput" class="input" placeholder="Search username…"/>
      <button id="newChatBtn" class="btn sm">+ New</button>
    </div>
    <div id="convList" class="list"></div>
  </aside>

  <section class="card" style="padding:0">
    <div id="emptyState" class="empty">Select a conversation to start chatting</div>
    <div id="chatPanel" class="chat" style="display:none">
      <div class="chat-header">
        <div class="peer">
          <img id="peerAvatar" alt="avatar"/>
          <div>
            <div id="peerName" style="font-weight:600">—</div>
            <div id="peerMeta" class="muted">—</div>
          </div>
        </div>
      </div>
      <div id="messages" class="messages"></div>
      <div style="border-top:1px solid var(--line); padding:10px; display:flex; gap:8px; align-items:center">
        <textarea id="inputMsg" class="input" placeholder="Message"></textarea>
        <button id="btnSend" class="btn primary">Send</button>
        <span class="muted">Enter</span>
      </div>
    </div>
  </section>
</main>

<script>
(function(){
  const API = "";
  const token = localStorage.getItem("token");
  if (!token) { alert("Please login"); return; }
    function decodeJwt(token){
  try{
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g,"+").replace(/_/g,"/"));
    return JSON.parse(json);
  }catch{ return {}; }
    }
    function getIdentity(){
    const idLS = localStorage.getItem("userId") || "";
    const userLS = localStorage.getItem("username") || "";
    const t = localStorage.getItem("token") || "";
    const p = t ? decodeJwt(t) : {};
    const id = String(idLS || p.id || p._id || p.userId || "").trim();
    const username = String(userLS || p.username || p.user || "").trim();

    return { id, username };
    }

    //el mensaje es mio?
    function isMine(msg, me){
    const mid = String(msg.userId || msg.idAutor || msg.authorId || "").trim();
    const mu  = String(msg.username || msg.authorUsername || "").trim();

    if (me.id && mid) return mid === me.id;
    if (me.username && mu) return mu === me.username;
    return false;
    }
  const convList   = document.getElementById('convList');
  const chatPanel  = document.getElementById('chatPanel');
  const emptyState = document.getElementById('emptyState');
  const messagesEl = document.getElementById('messages');
  const peerAvatar = document.getElementById('peerAvatar');
  const peerName   = document.getElementById('peerName');
  const peerMeta   = document.getElementById('peerMeta');
  const inputMsg   = document.getElementById('inputMsg');
  const btnSend    = document.getElementById('btnSend');
  const searchInput= document.getElementById('searchInput');
  const newChatBtn = document.getElementById('newChatBtn');

  let state = { chats: [], currentChatId: null, currentPeer: null };

  newChatBtn.onclick = async () => {
    const uname = (prompt("Start chat with username:") || "").trim();
    if (!uname) return;
    try {
      const res = await fetch(API + "/api/chat/start/" + encodeURIComponent(uname), {
        method: "POST",
        headers: { "Authorization":"Bearer " + token, "Content-Type":"application/json" }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cannot start chat");
      await loadChats();
      openChat(data.chatId);
    } catch(e){ alert(e.message); }
  };

  async function loadChats(){
    const res = await fetch(API + "/api/chat", { headers: { "Authorization":"Bearer " + token }});
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Cannot load chats");
    state.chats = data.chats || [];
    renderList(searchInput.value || "");
  }

  function renderList(filter=""){
    convList.innerHTML = "";
    state.chats
      .filter(c => {
        const n = (c.peer?.username || c.peer?.fullname || c.chatId || "").toLowerCase();
        return n.includes(filter.toLowerCase());
      })
      .forEach(c => {
        const item = document.createElement("div");
        item.className = "conv";
        item.dataset.id = c.chatId;
        const avatar = c.peer?.avatarUrl || "https://api.dicebear.com/8.x/initials/svg?seed=" + encodeURIComponent(c.peer?.username || "User");
        const title  = c.peer?.fullname || c.peer?.username || c.chatId;
        item.innerHTML =
          '<img class="avatar" src="'+avatar+'" alt=""/>'+
          '<div style="flex:1; min-width:0">'+
            '<div class="row"><div class="name">'+ title +'</div></div>'+
            '<div class="row"><div class="last">Open to view messages…</div></div>'+
          '</div>';
        item.onclick = () => openChat(c.chatId);
        convList.appendChild(item);
      });
  }

  async function openChat(chatId){
    state.currentChatId = chatId;
    Array.from(convList.children).forEach(n=> n.classList.toggle('active', n.dataset.id===chatId));
    const chat = state.chats.find(c => c.chatId === chatId);
    state.currentPeer = chat?.peer || null;

    emptyState.style.display = 'none';
    chatPanel.style.display = 'grid';
    peerAvatar.src = state.currentPeer?.avatarUrl || "https://api.dicebear.com/8.x/initials/svg?seed=" + encodeURIComponent(state.currentPeer?.username || "User");
    peerName.textContent = state.currentPeer?.fullname || state.currentPeer?.username || "—";
    peerMeta.textContent = state.currentPeer?.username ? ("@" + state.currentPeer.username) : "—";

    await loadMessages();
    inputMsg.focus();
  }

  async function loadMessages(){
  if (!state.currentChatId) return;
  const res = await fetch(API + "/api/chat/" + encodeURIComponent(state.currentChatId) + "/messages", {
    headers: { "Authorization":"Bearer " + token }
  });
  const data = await res.json();
  if (!res.ok) {
    messagesEl.innerHTML = "<div class='muted' style='padding:12px'>Cannot load messages</div>";
    return;
  }
  state.messages = Array.isArray(data.mensajes) ? data.mensajes : [];
  renderMessages(state.messages);
}


  function renderMessages(list){
 
  list = Array.isArray(list) ? list.filter(Boolean) : [];
  messagesEl.innerHTML = "";

  const me = getIdentity();  
  let lastSenderKey = null;

  list.forEach(m => {
 
    const text = (m && (m.mensaje || m.texto || "")).trim();
    const fecha = (m && m.fecha) || Date.now();
    const mine  = isMine(m || {}, me);

    const senderKey = mine
      ? "me:" + (me.id || me.username || "")
      : "them:" + (m?.userId || m?.idAutor || m?.username || m?.authorUsername || "?");

    const row = document.createElement("div");
    row.className = "msg " + (mine ? "me" : "them");

    const stack = document.createElement("div");
    stack.className = "stack";

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;

    const meta = document.createElement("div");
    meta.className = "meta";
    const who = mine ? "You" : (state.currentPeer?.username ? "@"+state.currentPeer.username : "Them");
    const time = fmtTime(fecha);
    meta.textContent = (senderKey !== lastSenderKey) ? (who + " • " + time) : time;

    stack.appendChild(bubble);
    stack.appendChild(meta);
    row.appendChild(stack);
    messagesEl.appendChild(row);

    lastSenderKey = senderKey;
  });

  messagesEl.scrollTop = messagesEl.scrollHeight;
}




  btnSend.onclick = send;
  inputMsg.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); send(); }
  });

  async function send(){
  const txt = (inputMsg.value || "").trim();
  if (!txt || !state.currentChatId) return;

  const me = getIdentity();
  const optimistic = {
    userId: me.id || undefined,
    username: me.username || undefined,
    mensaje: txt,
    fecha: Date.now()
  };

  // 1) UI optimista: agrega al estado y renderiza
  state.messages = [...state.messages, optimistic];
  renderMessages(state.messages);
  inputMsg.value = "";

  try {
    const res = await fetch(API + "/api/chat/" + encodeURIComponent(state.currentChatId) + "/messages", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ mensaje: txt, username: me.username })
    });

    if (!res.ok) {
      const err = await res.json().catch(()=> ({}));
      throw new Error(err.error || "Send failed");
    }

    // 2) Re-sincroniza con servidor (por si hay normalización/ids)
    await loadMessages();

  } catch(e){
    // (opcional) revertir último optimista si falla
    state.messages.pop();
    renderMessages(state.messages);
    alert(e.message);
  }
}


  function getUserId(){
    try{
      return localStorage.getItem("userId") || ""; 
    }catch{ return ""; }
  }

  function fmtTime(t){ try{ return new Date(t).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}catch{ return '—'; } }
  function escapeHtml(s){ return (s||"").replace(/[&<>"]/g, c=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c])); }

  searchInput.addEventListener('input', (e)=> renderList(e.target.value));
  function qs(name){ return new URLSearchParams(location.search).get(name); }

    document.addEventListener("DOMContentLoaded", async () => {
    await loadChats();

    const to = qs("to");
    if (to) {
        try {
        const res = await fetch(API + "/api/chat/start/" + encodeURIComponent(to), {
            method: "POST",
            headers: {
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json"
            }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Cannot start chat");


        await loadChats();
        openChat(data.chatId);

        
        history.replaceState({}, "", "/chat");
        } catch(e){
        alert(e.message || "Cannot open chat");
        }
    }
    });

    
    if (!qs("to")) loadChats();
})();
</script>
</body>
</html>
`;
};

export default chatPage;
