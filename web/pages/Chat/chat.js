const chatPage = () => {
  return `
    <!doctype html>
    <html lang="es">
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
        .brand .logo{width:28px; height:28px; border-radius:50%; background:#000; display:inline-block;background-image: url(https://cdn-icons-png.flaticon.com/512/18495/18495588.png);background-size: contain;}        .top-actions{display:flex; gap:10px; align-items:center}
    .logo{ width:28px; height:28px; border-radius:50%; background:#1a2230; display:inline-block }

    /* Página */
    .page{ max-width:1200px; margin:24px auto; padding:0 16px; display:grid; gap:18px; grid-template-columns:320px 1fr }
    @media (max-width: 920px){ .page{ grid-template-columns:1fr } }

    /* Lista de usuarios */
    .sidebar{ padding:12px; display:grid; gap:12px; align-self:start; position:sticky; top:72px }
    .search{ display:flex; gap:8px; }
    .input{ width:100%; padding:10px 12px; border-radius:10px; border:1px solid var(--line); background:#0f1217; color:var(--text) }
    .section{ font-size:.82rem; letter-spacing:.02em; text-transform:uppercase; color:var(--muted) }
    .list{ display:grid; gap:6px; max-height:70vh; overflow:auto; padding-right:4px }
    .conv{ display:flex; gap:10px; align-items:center; padding:8px; border:1px solid var(--line); border-radius:12px; background:#0f1217; cursor:pointer }
    .conv:hover{ background:#10151d; }
    .conv.active{ border-color:#2f3b4c; background:#121923 }
    .avatar{ width:36px; height:36px; border-radius:10px; background:#1a2230; object-fit:cover }
    .row{ display:flex; align-items:center; justify-content:space-between; gap:8px }
    .name{ font-weight:600; }
    .pill{ font-size:.72rem; padding:2px 8px; border-radius:999px; border:1px solid var(--line); color:var(--muted) }
    .dot{ width:8px; height:8px; border-radius:50%; background:var(--accent); display:inline-block }
    .last{ color:var(--muted); font-size:.9rem; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; max-width:190px }

    /* Panel del chat */
    .chat{ display:grid; grid-template-rows:auto 1fr auto; height:78vh; }
    .chat-header{ display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 16px; border-bottom:1px solid var(--line) }
    .peer{ display:flex; align-items:center; gap:10px }
    .peer img{ width:40px; height:40px; border-radius:10px; object-fit:cover; background:#121820; border:1px solid var(--line) }
    .peer .meta{ font-size:.85rem; color:var(--muted) }
    .toolbar{ display:flex; gap:8px; align-items:center }
    .iconbtn{ width:36px; height:36px; display:flex; align-items:center; justify-content:center; border-radius:10px; border:1px solid var(--line); background:#0f1217; cursor:pointer }
    .iconbtn:hover{ background:#10151d }

    .messages{ overflow:auto; padding:16px; display:grid; gap:8px }
    .bubble{ max-width:70%; padding:10px 12px; border-radius:14px; border:1px solid var(--line); background:#0f1217 }
    .msg{ display:flex; gap:8px; align-items:flex-end }
    .msg.me{ justify-content:flex-end }
    .msg.me .bubble{ background:#0f141c; }
    .time{ font-size:.78rem; color:var(--muted) }
    .sys{ text-align:center; color:var(--muted); font-size:.85rem; margin:10px 0 }

    .composer{ border-top:1px solid var(--line); padding:10px; display:flex; gap:8px; align-items:center }
    .composer textarea{ flex:1; min-height:44px; max-height:140px; resize:vertical }
    .kbd{ font-family:ui-monospace, SFMono-Regular, Menlo, monospace; background:#0e1218; border:1px solid var(--line); padding:2px 6px; border-radius:6px; color:var(--muted); font-size:.78rem }

    .typing{ color:var(--muted); font-size:.85rem; padding:6px 16px; }
    .empty{ display:grid; place-items:center; color:var(--muted); height:78vh }
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
    <!-- Parte izquierda: lista de usuarios -->
    <aside class="card sidebar">
        <div class="search">
        <input id="searchInput" class="input" placeholder="Search people or channels…"/>
        <button id="newChatBtn" class="btn sm">+ New</button>
        </div>

        <div class="section">Conversations</div>
        <div id="convList" class="list"></div>
    </aside>

    <!-- Parte derecha: Chat -->
    <section id="chatCard" class="card" style="padding:0">
        <div id="emptyState" class="empty">Select a conversation to start chatting</div>

        <div id="chatPanel" class="chat" style="display:none">
        <div class="chat-header">
            <div class="peer">
            <img id="peerAvatar" alt="avatar"/>
            <div>
                <div id="peerName" style="font-weight:600">—</div>
                <div id="peerMeta" class="meta">—</div>
            </div>
            </div>
            <div class="toolbar">
            <div class="iconbtn" title="Search in conversation">🔎</div>
            <div class="iconbtn" title="Call">📞</div>
            <div class="iconbtn" title="More">⋯</div>
            </div>
        </div>

        <div id="typing" class="typing" style="display:none">typing…</div>
        <div id="messages" class="messages"></div>

        <div class="composer">
            <div class="iconbtn" id="btnAttach" title="Attach">📎</div>
            <textarea id="inputMsg" class="input" placeholder="Message"></textarea>
            <button id="btnSend" class="btn primary">Send</button>
            <span class="kbd">Enter</span>
        </div>
        </div>
    </section>
    </main>

    <script>
    (function(){
    // Datos falsos por ahora
    const ME = { id:"me", name:"You", avatar:"https://api.dicebear.com/8.x/initials/svg?seed=You" };
    const PEOPLE = [
        { id:"amber", name:"Amber Garzia", avatar:"https://api.dicebear.com/8.x/initials/svg?seed=Amber%20Garzia" },
        { id:"marc",  name:"Marc Collins", avatar:"https://api.dicebear.com/8.x/initials/svg?seed=Marc%20Collins" },
        { id:"jira",  name:"Jira",          avatar:"https://api.dicebear.com/8.x/shapes/svg?seed=Jira" },
        { id:"ann",   name:"Ann Miller",    avatar:"https://api.dicebear.com/8.x/initials/svg?seed=Ann%20Miller" },
        { id:"agency",name:"Marketing Agency", avatar:"https://api.dicebear.com/8.x/shapes/svg?seed=Agency" },
    ];
    const THREADS = {
        amber: [
        { from:"amber", text:"Hey! did you see the latest build?", at: ts(-42) },
        { from:"me",    text:"Yep—looks solid. Ship it.", at: ts(-40) },
        { from:"amber", text:"Nice! I'll prep the notes.", at: ts(-38) }
        ],
        marc: [
        { from:"marc", text:"Hi! Could you take a look at the release draft?", at: ts(-130) },
        { from:"me",   text:"On it.", at: ts(-125) }
        ],
        jira: [
        { from:"jira", text:"Task DEV-214 moved to QA", at: ts(-300) }
        ],
        ann: [],
        agency: [{ from:"agency", text:"We shared the new media kit.", at: ts(-500) }]
    };

    function ts(minsAgo){ const d=new Date(); d.setMinutes(d.getMinutes()+minsAgo); return d; }
    function fmtTime(d){ try{ return new Date(d).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}catch{ return '—'; } }

    // Elementos
    const convList   = document.getElementById('convList');
    const chatPanel  = document.getElementById('chatPanel');
    const emptyState = document.getElementById('emptyState');
    const messagesEl = document.getElementById('messages');
    const peerAvatar = document.getElementById('peerAvatar');
    const peerName   = document.getElementById('peerName');
    const peerMeta   = document.getElementById('peerMeta');
    const typingEl   = document.getElementById('typing');
    const inputMsg   = document.getElementById('inputMsg');
    const btnSend    = document.getElementById('btnSend');
    const searchInput = document.getElementById('searchInput');

    let currentId = null;
    let typingTimer = null;

    // Crear la lista de contactos
    function renderList(filter=""){
        convList.innerHTML = "";
        PEOPLE
        .filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
        .forEach(p=>{
            const last = (THREADS[p.id]||[])[(THREADS[p.id]||[]).length-1];
            const item = document.createElement('div');
            item.className = 'conv';
            item.dataset.id = p.id;
            item.innerHTML =
            '<img class="avatar" src="'+p.avatar+'" alt=""/>'+
            '<div style="flex:1; min-width:0">'+
                '<div class="row">'+
                '<div class="name">'+p.name+'</div>'+
                '<div class="muted" style="font-size:.85rem">'+(last?fmtTime(last.at):'')+'</div>'+
                '</div>'+
                '<div class="row">'+
                '<div class="last">'+(last?(last.text):'No messages yet')+'</div>'+
                (Math.random()<0.25?'<span class="dot" title="unread"></span>':'')+
                '</div>'+
            '</div>';
            item.addEventListener('click',()=>openThread(p.id));
            convList.appendChild(item);
        });
    }

    function openThread(id){
        currentId = id;
        Array.from(convList.children).forEach(n=> n.classList.toggle('active', n.dataset.id===id));
        const peer = PEOPLE.find(p=>p.id===id);
        if (!peer) return;
        emptyState.style.display = 'none';
        chatPanel.style.display = 'grid';
        peerAvatar.src = peer.avatar;
        peerName.textContent = peer.name;
        peerMeta.textContent = "Online";
        renderMessages();
        inputMsg.focus();
    }

    function renderMessages(){
        const list = THREADS[currentId] || [];
        messagesEl.innerHTML = "";
        list.forEach(m=>{
        const me = m.from === 'me';
        const row = document.createElement('div');
        row.className = 'msg' + (me?' me':'');
        row.innerHTML = '<div class="bubble">'+escapeHtml(m.text)+'</div><div class="time">'+fmtTime(m.at)+'</div>';
        messagesEl.appendChild(row);
        });
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function escapeHtml(s){ return (s||"").replace(/[&<>"]/g, c=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c])); }

    // Enviar mensaje
    btnSend.addEventListener('click', send);
    inputMsg.addEventListener('keydown', (e)=>{
        if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); send(); }
        showTyping();
    });

    function send(){
        const txt = (inputMsg.value||"").trim();
        if (!txt || !currentId) return;
        (THREADS[currentId] = THREADS[currentId] || []).push({ from:"me", text:txt, at:new Date() });
        inputMsg.value = "";
        renderMessages();
        fakeReply(); // mensajes falsos
    }

    function showTyping(){
        clearTimeout(typingTimer);
        typingEl.style.display = 'block';
        typingTimer = setTimeout(()=> typingEl.style.display='none', 800);
    }

    function fakeReply(){
        const peer = PEOPLE.find(p=>p.id===currentId);
        if (!peer) return;
        typingEl.style.display = 'block';
        setTimeout(()=>{
        (THREADS[currentId] = THREADS[currentId] || []).push({
            from: currentId,
            text: "👍",
            at: new Date()
        });
        typingEl.style.display = 'none';
        renderMessages();
        }, 600);
    }

    // Buscar en la lista de usuarios
    searchInput.addEventListener('input', (e)=> renderList(e.target.value));

    // Correr todo
    renderList();
    })();
    </script>
    </body>
    </html>
    `;
};

export default chatPage;
