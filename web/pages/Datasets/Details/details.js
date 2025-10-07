const datasetView = () => {
  return `
    <!doctype html>
    <html lang="es">
    <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Dataset • Detail</title>
    <style>
    :root{ --bg:#0b0d10; --panel:#12161c; --muted:#9fb0c8; --line:#2a3340; --text:#e7eef7; --accent:#5aa9ff }
    *{ box-sizing:border-box }
    body{ margin:0; font-family:system-ui,arial,segoe ui; background:var(--bg); color:var(--text) }
    a,button,input,textarea{ font:inherit }
    .btn{ padding:10px 12px; border-radius:10px; border:1px solid var(--line); background:#0f1217; color:var(--text); cursor:pointer; display:inline-flex; align-items:center; gap:8px; text-decoration:none }
    .btn.primary{ background:#0f141c }
    .btn.danger{ border-color:#4b1f24; background:#1a0d10; color:#ffb3b3 }
    .btn[disabled]{ opacity:.6; cursor:not-allowed }
    .card{ background:var(--panel); border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,.3) }
    .muted{ color:var(--muted) }
    .topbar{ position:sticky; top:0; z-index:20; backdrop-filter:saturate(1.2) blur(4px); display:flex; gap:12px; align-items:center; justify-content:space-between; padding:12px 18px; border-bottom:1px solid #0e1218; background:rgba(11,13,16,.6) }
    .brand{display:flex; align-items:center; gap:10px; font-weight:600}
        .brand .logo{width:28px; height:28px; border-radius:50%; background:#000; display:inline-block;background-image: url(https://cdn-icons-png.flaticon.com/512/18495/18495588.png);background-size: contain;}        .top-actions{display:flex; gap:10px; align-items:center}
    .btn.sm{ padding:6px 8px; font-size:.85rem }
    .comment-body{ white-space:pre-wrap; }
    .replies{ display:grid; gap:10px; margin-top:6px }

    .page{ max-width:1100px; margin:24px auto; padding:0 16px; display:grid; gap:18px; grid-template-columns:340px 1fr }
    @media (max-width: 900px){ .page{ grid-template-columns:1fr } }

    .sidebar{
        padding:16px;
        display:grid;
        gap:14px;
        align-self:start;
        position: sticky;
        top: 72px;
        }
    .divider{ height:1px; background:#0e1218; margin:6px 0 }

    .hero{ padding:18px; display:grid; gap:14px }
    .title-row{ display:flex; gap:12px; align-items:flex-start }
    .title-col{ display:grid; gap:6px }
    .ds-avatar{ width:56px; height:56px; border-radius:12px; object-fit:cover; }
    .hero h1{ margin:0; font-size:1.4rem }
    .pill{padding:2px 8px; border-radius:999px; font-size:.8rem; border:1px solid var(--line)}
    .pill.pending   { background:#0f141c; color:var(--text); border-color:var(--line); }
    .pill.submitted { background:#3b2f0a; color:#f2c94c; border-color:#5a4a14; }
    .pill.approved  { background:#0f1a14; color:#27ae60; border-color:#1d6a3e; }
    .pill.declined  { background:#1a0f10; color:#eb5757; border-color:#6a1f22; }

    .meta-links.downloads{
        margin-top:12px;
        padding-top:10px;
        border-top:1px solid var(--line);
        gap:12px;
    }

    .owner{ display:flex; align-items:center; gap:10px }
    .owner img{ width:40px; height:40px; border-radius:10px; object-fit:cover; background:#121820; border:1px solid var(--line) }

    .panel{ padding:18px }
    .section-title{ margin:0 0 8px; font-size:1.05rem }
    .box{ border:1px solid var(--line); border-radius:12px; padding:12px; background:#0f1217 }

    .lists{ display:grid; grid-template-columns:1fr 1fr; gap:12px }
    @media (max-width: 900px){ .lists{ grid-template-columns:1fr } }
    .chip-list{ display:flex; flex-wrap:wrap; gap:8px }
    .chip{ display:flex; align-items:center; gap:8px; padding:6px 10px; border:1px solid var(--line); border-radius:10px; background:#0f1217; max-width:100% }
    .chip .name{ white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:280px; color: var(--text) }
    .video-grid{ display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:10px }
    .video-wrap{ position:relative; border:1px solid var(--line); border-radius:10px; overflow:hidden; background:#0f1217; height:160px }
    .video-wrap video{ width:100%; height:100%; object-fit:cover }

    .footer-actions{ display:flex; gap:10px; justify-content:flex-end; margin-top:10px }

    /* Comentarios */
    .comments{ margin-top:16px }
    .comment-item{ border:1px solid var(--line); border-radius:10px; padding:10px; background:#0f1217; display:grid; gap:6px }
    .comment-meta{ font-size:.85rem; color:var(--muted); display:flex; gap:8px; align-items:center }
    .comment-form{ display:grid; gap:8px; margin-top:10px }
    textarea.input{ min-height:80px; resize:vertical }
    .meta-links{ display:flex; gap:10px; align-items:center }
    .star {
    cursor: pointer; font-size: 22px; line-height: 1; user-select:none;
    transition: transform .08s ease;
    }
    .star:hover { transform: scale(1.05); }
    .star[aria-checked="true"] { filter: drop-shadow(0 0 2px rgba(255,215,0,.25)); }
    .star[disabled] { cursor: default; opacity: .6 }

    [data-owneronly],
    [data-owneronly-inline] { display: none; }

    body.owner [data-owneronly] { display: flex; }
    body.owner [data-owneronly-inline] { display: inline-flex; }
    </style>
    </head>
    <body>
    <header class="topbar">
    <div class="brand"><span class="logo"></span><span>Dataset</span></div>
    <div style="display:flex; gap:8px">
        <a id="btnBack" href="/profile" class="btn">← Back</a>
    </div>
    </header>

    <main class="page">
    <!-- Lado izquierdo -->
    <aside class="card sidebar">
        <div class="title-row">
        <img id="dsAvatar" class="ds-avatar" alt="dataset avatar" />
        <div class="title-col">
            <h1 id="dsName">—</h1>
            <div class="muted" id="dsDates">—</div>
            <div id="dsStatusPill"></div>
            <div class="meta-links downloads">
                <button id="btnDownload" class="btn primary">⬇️ Download</button>
                <a id="downloadsLink" href="#" class="muted" title="See who downloaded">0 downloads</a>
                <span id="downloadsCount" class="muted" style="display:none">0 downloads</span>
            </div>
        </div>
        </div>

        <div class="divider"></div>

        <div>
        <div class="muted" style="margin-bottom:6px">Owner, click on username to view profile</div>
        <div class="owner">
            <img id="ownerAvatar" alt="owner avatar" />
            <div>
            <div id="ownerName">—</div>
            <a id="userProfile" style="text-decoration:none"><div class="muted" id="ownerUsername">@user</div></a>
            </div>
        </div>
        </div>
    </aside>

    <!-- Lado derecho -->
    <section class="card">
        <div class="hero">
        <div>
            <div class="muted" style="margin-bottom:6px">Short description</div>
            <div id="dsDesc" class="box">—</div>
        </div>
        </div>

        <div class="panel">
        <h3 class="section-title">Files & Videos</h3>
        <div class="lists">
            <div>
                <div class="muted" style="margin-bottom:6px">
                    <span data-files-header>Files</span>
                </div>
                <div id="fileList" class="box chip-list">
                    <span class="muted">No files yet</span>
                </div>
            </div>
            <div>
                <div class="muted" style="margin-bottom:6px">Videos</div>
                <div id="videoList" class="box">
                    <div class="video-grid" id="videoGrid">
                    <span class="muted">No videos yet</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer-actions" data-owneronly>
            <button id="btnEdit" class="btn">Edit</button>
            <button id="btnSubmit" class="btn primary">Submit for review</button>
            <button id="btnClone" class="btn">Clone</button>
            <button id="btnDelete" class="btn danger">Delete</button>
        </div>

        <div id="status" class="muted" style="min-height:20px"></div>

        <!-- Estrellas -->
        <div class="panel">
        <h3 class="section-title">Community rating</h3>
        <div id="ratingWrap" class="box" style="display:flex; align-items:center; gap:10px">
            <div id="ratingStars" aria-label="Rate this dataset" role="radiogroup"></div>
            <div class="muted" id="ratingMeta">—</div>
        </div>
        </div>

        <!-- Comentarios -->
        <div class="comments">
            <h3 class="section-title">Comments</h3>
            <div id="commentsList" class="grid" style="display:grid; gap:10px">
            <div class="muted">No comments yet</div>
            </div>

            <div class="comment-form">
            <textarea id="commentInput" class="input" placeholder="Write a comment…"></textarea>
            <div style="display:flex; gap:8px; justify-content:flex-end">
                <button id="btnPostComment" class="btn primary">Post comment</button>
            </div>
            <div id="commentStatus" class="muted"></div>
            </div>
        </div>
        </div>
    </section>
    </main>

    <script>
    (function(){
    var API = "http://localhost:3000";
    var API_COMMENTS = API;

    // Ayudan a que se vea bien
    function authHeaders(){
        var t = localStorage.getItem("token");
        return t ? { "Authorization": "Bearer " + t } : {};
    }
    function $(id){ return document.getElementById(id); }
    function setText(id, v){ var el=$(id); if(el) el.textContent = v; }
    function ensureToken(){ if(!localStorage.getItem("token")) window.location.replace("/"); }

    function apiGet(path){
        return fetch(API + path, {
        headers: Object.assign({ "Content-Type":"application/json" }, authHeaders())
        }).then(r => r.ok ? r.json() : r.json().then(d=>{throw new Error(d.error||r.statusText)}));
    }
    function apiPost(path, body){
        return fetch(API + path, {
        method:"POST",
        headers: Object.assign({ "Content-Type":"application/json" }, authHeaders()),
        body: JSON.stringify(body||{})
        }).then(r => r.ok ? r.json() : r.json().then(d=>{throw new Error(d.error||r.statusText)}));
    }

    function cGet(path){
        return fetch(API_COMMENTS + path, {
            headers: Object.assign({ "Content-Type":"application/json" }, authHeaders())
        }).then(r=>r.ok?r.json():r.json().then(d=>{throw new Error(d.error||r.statusText)}));
    }
    function cPost(path, body){
        return fetch(API_COMMENTS + path, {
            method:"POST",
            headers: Object.assign({ "Content-Type":"application/json" }, authHeaders()),
            body: JSON.stringify(body||{})
        }).then(r=>r.ok?r.json():r.json().then(d=>{throw new Error(d.error||r.statusText)}));
    }

    function fmtDate(d){ try{ return new Date(d).toLocaleString(); } catch(_){ return d || "—"; } }
    function datasetIdFromPath(){ var parts = location.pathname.split("/"); return parts[2] || ""; }

    function statusPillHtml(s){
        const st = (s || "pending").toLowerCase();
        const label = st==="submitted"?"Submitted":st==="approved"?"Approved":st==="declined"?"Declined":"Pending submission";
        return '<span class="pill '+st+'">'+label+'</span>';
    }
    function setStatusPill(s){
        $("dsStatusPill").innerHTML = statusPillHtml(s);
        var bs = $("btnSubmit");
        if (bs) bs.disabled = ["submitted","approved","declined"].includes((s||"").toLowerCase());
    }

    // Funciones para dueños y otros usuarios
    function applyMode(isOwner){
        document.querySelectorAll("[data-owneronly]").forEach(el=>{
        el.style.display = isOwner ? "flex" : "none";
        });
        var link  = $("downloadsLink");
        var count = $("downloadsCount");
        if (link)  link.style.display  = isOwner ? "inline-flex" : "none";
        if (count) count.style.display = isOwner ? "none"        : "inline";
    }
    function setDownloadsUI(downloads, isOwner){
        var txt = downloads + (downloads === 1 ? " download" : " downloads");
        var link  = $("downloadsLink");
        var count = $("downloadsCount");
        if (isOwner) { if (link)  link.textContent  = txt; }
        else         { if (count) count.textContent = txt; }
    }
    function updateDownloadsDisplay(n){
    const label = n + (n === 1 ? " download" : " downloads");
    const link  = $("downloadsLink");   if (link)  link.textContent  = label;
    const count = $("downloadsCount");  if (count) count.textContent = label;
    }

    function computeIsOwner(me, ds){
        function toList(x){ return [x && x._id, x && x.id, x && x.userId, x && x.username].filter(Boolean).map(String); }
        var meVals = toList(me);
        var owVals = toList(ds && ds.owner || {});
        return meVals.some(m => owVals.includes(m));
    }

    // Votaciones
    function initVoting(ds, ctx){
        var wrap = $("ratingStars");
        var meta = $("ratingMeta");
        if (!wrap || !meta) return;

        wrap.innerHTML = "";

        // Presentar el promedio y la cantidad de votos
        var avg = Number(ds.ratingAvg || 0);
        var cnt = Number(ds.ratingCount || 0);
        meta.textContent = cnt ? (avg.toFixed(1) + " / 5 · " + cnt + " vote" + (cnt===1?"":"s")) : "No votes yet";

        // Se puede cambiar el voto
        var localKey = "vote:" + (ds.datasetId || ds._id || ds.id || "");
        var lastLocal = Number(localStorage.getItem(localKey));
        var current = (Number.isFinite(lastLocal) && lastLocal >= 1 && lastLocal <= 5)
        ? lastLocal
        : (Math.round(avg) || 0);

        var canVote = !ctx.isOwner; // Los dueños no votan

        // Ver las 5 estrellas
        for (let i=1;i<=5;i++){
        var b = document.createElement("button");
        b.className = "star";
        b.type = "button";
        b.setAttribute("role","radio");
        b.setAttribute("aria-label", i + " star" + (i>1?"s":""));
        b.setAttribute("aria-checked", String(i<=current));
        b.textContent = i<=current ? "★" : "☆";
        if (!canVote) b.disabled = true;

        // Mostrar cómo se llenan con el mouse
        b.addEventListener("mouseenter", function(){
            for (let k=0;k<wrap.children.length;k++){
            var node = wrap.children[k];
            node.textContent = (k < i) ? "★" : "☆";
            node.setAttribute("aria-checked", String(k < i));
            }
        });

        // Click para votar
        b.addEventListener("click", function(){
            if (!canVote) return;
            var val = i;

            current = val;
            for (let k=0;k<wrap.children.length;k++){
            var on = (k+1) <= current;
            var node = wrap.children[k];
            node.textContent = on ? "★" : "☆";
            node.setAttribute("aria-checked", String(on));
            }
            meta.textContent = "Submitting vote…";

            apiPost("/api/datasets/" + encodeURIComponent(ds.datasetId || ds.id || ds._id) + "/votes", { value: val })
            .then(function(r){
                var newAvg = Number((r && r.ratingAvg) != null ? r.ratingAvg : avg);
                var newCnt = Number((r && r.ratingCount) != null ? r.ratingCount : (cnt + 1));
                meta.textContent = newAvg.toFixed(1) + " / 5 · " + newCnt + " vote" + (newCnt===1?"":"s");
                localStorage.setItem(localKey, String(val));
            })
            .catch(function(e){
                meta.textContent = (e && e.message) ? e.message : "Failed to submit vote";
            });
        });

        wrap.appendChild(b);
        }

        // Mostrar selección
        wrap.addEventListener("mouseleave", function(){
        for (let k=0;k<wrap.children.length;k++){
            var on = (k+1) <= current;
            var node = wrap.children[k];
            node.textContent = on ? "★" : "☆";
            node.setAttribute("aria-checked", String(on));
        }
        });
    }

    // Archivos
    function bytesFmt(n){
        if (!n) return "0 B";
        const u = ["B","KB","MB","GB","TB"];
        const i = Math.floor(Math.log(n)/Math.log(1024));
        return (n/Math.pow(1024, i)).toFixed(i ? 1 : 0) + " " + u[i];
    }
    function authFetch(path, opts = {}) {
        const headers = Object.assign({}, authHeaders(), opts.headers || {});
        return fetch(API + path, { ...opts, headers });
    }

    async function downloadBlob(path, filename){
        const r = await authFetch(path);
        if (!r.ok) {
            const err = await r.text().catch(()=>r.statusText);
            throw new Error(err || r.statusText);
        }
        const blob = await r.blob();
        const url  = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename || "download";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(()=>URL.revokeObjectURL(url), 5000);
    }

    // Comentarios
    function cDelete(path){
        return fetch(API_COMMENTS + path, {
        method: "DELETE",
        headers: { "Content-Type":"application/json" }
        }).then(async r => {
        if (r.status === 204) return { ok:true };
        const data = await r.text();
        try { return JSON.parse(data); } catch { throw new Error(data || r.statusText); }
        });
    }

    // Botón para publicar un comentario
    function wirePostForm(postId, authorId, isAdmin){
        var btn = $("btnPostComment");
        var ta  = $("commentInput");
        if (!btn || !ta) return;

        btn.onclick = function(){
            var txt = (ta.value || "").trim();
            if (!txt){
            setText("commentStatus", "Write something first.");
            ta.focus();
            return;
            }
            btn.disabled = true;
            setText("commentStatus", "Posting…");

            cPost("/posts/" + encodeURIComponent(postId) + "/comments", { texto: txt, idAutor: authorId })
            .then(function(){
                ta.value = "";
                return cGet("/posts/" + encodeURIComponent(postId) + "/comments");
            })
            .then(function(data){
                renderComments(data.comentarios || [], authorId, isAdmin, postId);
                setText("commentStatus", "");
            })
            .catch(function(e){
                setText("commentStatus", e.message || "Failed to post");
            })
            .finally(function(){ btn.disabled = false; });
        };
    }

    // Botón para regresar a la pantalla anterior
    function setupBackButton(){
        var btn = $("btnBack");
        if (!btn) return;

        var FALLBACK = "/profile";

        try {
            var ref = document.referrer;
            if (ref) {
            var u = new URL(ref, location.href);
            if (u.origin === location.origin && u.pathname !== location.pathname) {
                btn.href = u.href;
            } else {
                btn.href = FALLBACK;
            }
            } else {
            btn.href = FALLBACK;
            }
        } catch(_) { btn.href = FALLBACK; }
        
        btn.addEventListener("click", function(e){
            if (history.length > 1) {
            e.preventDefault();
            history.back();
            }
        });
    }
    function buildTree(list){
        const byParent = new Map();
        list.forEach(c => {
        const pid = c.parentId || null;
        if (!byParent.has(pid)) byParent.set(pid, []);
        byParent.get(pid).push(c);
        });
        for (const arr of byParent.values()) arr.sort((a,b)=>a.fecha-b.fecha);
        return pid => byParent.get(pid) || [];
    }

    function renderComments(list, currentUserId, isAdmin, postId){
        const box = $("commentsList");
        box.innerHTML = "";
        if (!list || !list.length){
        box.innerHTML = '<div class="muted">No comments yet</div>';
        return;
        }

        const childrenOf = buildTree(list);

        function makeComment(c, depth=0){
        const replies = childrenOf(c.id);
        const hasReplies = replies && replies.length > 0;

        if (c.deleted && !isAdmin && !hasReplies) return null;

        const div = document.createElement("div");
        div.className = "comment-item";
        div.style.marginLeft = depth ? Math.min(depth,3)*16 + "px" : "0";

        const isOwn = c.idAutor === currentUserId;

        let bodyHTML = "";
        if (c.deleted) {
            if (isAdmin) {
            bodyHTML = '<div class="comment-body"><span class="muted">[Deleted]</span> ' + (c.texto || "") + '</div>';
            } else {
            bodyHTML = '<span class="muted">[Deleted]</span>';
            }
        } else {
            bodyHTML = '<div class="comment-body">' + (c.texto || "") + '</div>';
        }

        div.innerHTML =
            '<div class="comment-meta">' +
            '<strong>' + (c.idAutor || "anon") + '</strong>' +
            '<span>•</span><span>' + fmtDate(c.fecha) + '</span>' +
            (c.deleted && isAdmin ? '<span class="pill declined" style="margin-left:8px">deleted</span>' : '') +
            '</div>' +
            bodyHTML +
            '<div class="meta-links" style="gap:8px">' +
            (c.deleted ? '' : '<button class="btn sm" data-act="reply">Reply</button>') +
            ((isOwn || isAdmin) && !c.deleted ? '<button class="btn sm danger" data-act="delete">Delete</button>' : '') +
            '</div>';

        const replyForm = document.createElement("div");
        replyForm.style.display = "none";
        replyForm.innerHTML =
            '<div class="comment-form" style="margin-top:8px">'+
            '<textarea class="input" placeholder="Write a reply…"></textarea>'+
            '<div style="display:flex;gap:8px;justify-content:flex-end">'+
                '<button class="btn sm" data-act="cancel-reply">Cancel</button>'+
                '<button class="btn sm primary" data-act="send-reply">Reply</button>'+
            '</div>'+
            '</div>';
        div.appendChild(replyForm);

        div.addEventListener("click", function (e) {
            const btn = e.target.closest("[data-act]");
            if (!btn || btn.closest(".comment-item") !== div) return;

            const act = btn.dataset.act;

            if (act === "reply") {
            replyForm.style.display = replyForm.style.display === "none" ? "block" : "none";
            e.stopPropagation(); return;
            }

            if (act === "cancel-reply") {
            replyForm.style.display = "none";
            e.stopPropagation(); return;
            }

            if (act === "send-reply") {
            const ta  = replyForm.querySelector("textarea");
            const txt = (ta.value || "").trim();
            if (!txt) return;

            setText("commentStatus", "Posting reply…");
            cPost("/posts/" + encodeURIComponent(postId) + "/comments", {
                texto: txt, idAutor: currentUserId, parentId: c.id
            })
            .then(() => {
                ta.value = "";
                replyForm.style.display = "none";
                return cGet("/posts/" + encodeURIComponent(postId) + "/comments");
            })
            .then(data => {
                renderComments(data.comentarios || [], currentUserId, isAdmin, postId);
                setText("commentStatus", "");
            })
            .catch(err => setText("commentStatus", err.message));

            e.stopPropagation(); return;
            }

            if (act === "delete") {
            setText("commentStatus", "Deleting…");
            cDelete("/posts/" + encodeURIComponent(postId) + "/comments/" + encodeURIComponent(c.id))
                .then(() => cGet("/posts/" + encodeURIComponent(postId) + "/comments"))
                .then(data => {
                renderComments(data.comentarios || [], currentUserId, isAdmin, postId);
                setText("commentStatus", "");
                })
                .catch(err => setText("commentStatus", err.message));

            e.stopPropagation(); return;
            }
        });

        if (replies.length){
            const toggle = document.createElement("button");
            toggle.className = "btn sm";
            toggle.textContent = "Show " + replies.length + " repl" + (replies.length===1?"y":"ies");
            let open = false;
            const wrap = document.createElement("div");
            wrap.className = "replies";
            wrap.style.display = "none";

            toggle.addEventListener("click", ()=>{
            open = !open;
            toggle.textContent = (open?"Hide":"Show") + " " + replies.length + " repl" + (replies.length===1?"y":"ies");
            if (open && !wrap.hasChildNodes()){
                replies.forEach(r => {
                const node = makeComment(r, depth+1);
                if (node) wrap.appendChild(node);
                });
            }
            wrap.style.display = open ? "grid" : "none";
            });

            div.appendChild(toggle);
            div.appendChild(wrap);
        }

        return div;
        }

        childrenOf(null).forEach(root => {
        const node = makeComment(root, 0);
        if (node) box.appendChild(node);
        });
    }

    function loadComments(postId, currentUserId, isAdmin){
        setText("commentStatus", "Loading comments…");
        cGet("/posts/" + encodeURIComponent(postId) + "/comments")
        .then(data => {
            renderComments(data.comentarios || [], currentUserId, isAdmin, postId);
            setText("commentStatus", "");
        })
        .catch(e => { setText("commentStatus", e.message); });
    }

    function postComment(postId, texto, idAutor){
        setText("commentStatus", "Posting…");
        return cPost("/posts/" + encodeURIComponent(postId) + "/comments", { texto, idAutor })
        .then(c => { setText("commentStatus", "Posted ✔"); return c; })
        .catch(e => { setText("commentStatus", e.message); throw e; });
    }

    // Para poder ver todo
    function render(ds){
        $("dsAvatar").src =
        ds.datasetAvatarUrl ||
        "https://api.dicebear.com/8.x/shapes/svg?seed=" + encodeURIComponent(ds.name || "dataset");

        setText("dsName", ds.name || "—");
        setText("dsDates", "Created " + fmtDate(ds.createdAt) + " • Last update " + fmtDate(ds.updatedAt));

        var o = ds.owner || {};
        $("ownerAvatar").src =
        o.avatarUrl ||
        "https://api.dicebear.com/8.x/initials/svg?seed=" + encodeURIComponent(o.fullName || o.username || "Owner");
        setText("ownerName", o.fullName || "—");
        setText("ownerUsername", o.username ? "@" + o.username : "@user");
        $("userProfile").href = o.username ? ("/profile/" + encodeURIComponent(o.username)) : "#";

        setText("dsDesc", ds.description || "—");
        setStatusPill(ds.status);

        const datasetMongoId = ds._id;
        if (!datasetMongoId) { setText("status", "Missing dataset id"); return; }

        // Archivos y videos
        const idForAssets = ds._id;
        if (!idForAssets) { setText("status", "Missing dataset id"); return; }

        authFetch("/api/datasets/" + encodeURIComponent(datasetMongoId) + "/assets")
        .then(r => {
            if (!r.ok) return r.text().then(t => { throw new Error(t || r.statusText); });
            return r.json();
        })
        .then(function (list) {
            // Archivos
            const fileList = $("fileList");
            if (fileList) {
            fileList.innerHTML = "";

            const totalBytes = (list.files || []).reduce((a, f) => a + (f.bytes || 0), 0);
            const filesHeader = document.querySelector('[data-files-header]');
            if (filesHeader) filesHeader.textContent = "Files · " + bytesFmt(totalBytes);

            if (list.files && list.files.length) {
                list.files.forEach(function (f) {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "chip";
                btn.innerHTML =
                    '<span class="muted" style="font-size:.85rem">FILE</span>' +
                    '<span class="name" title="' + (f.name || "") + '">' +
                    (f.name || "unnamed") + "</span>" +
                    " <span class='muted'>· " + bytesFmt(f.bytes) + "</span>";

                btn.addEventListener("click", async function () {
                    const path = "/api/datasets/" + encodeURIComponent(datasetMongoId) +
                                "/assets/" + encodeURIComponent(f.assetId);
                    try {
                        const t = await apiPost(
                        "/api/datasets/" + encodeURIComponent(datasetMongoId) + "/track-download",
                        { source: "file", assetId: f.assetId }
                        );
                        if (t && Number.isFinite(t.downloadsCount)) {
                        updateDownloadsDisplay(t.downloadsCount);
                        }
                    } catch (_) { }

                    await downloadBlob(path, f.name || "file");
                });

                fileList.appendChild(btn);
                });
            } else {
                fileList.innerHTML = '<span class="muted">No files yet</span>';
            }
            }

            // Videos
            const videoGrid = $("videoGrid");
            if (videoGrid) {
            videoGrid.innerHTML = "";
            if (list.videos && list.videos.length) {
                list.videos.forEach(function (v) {
                const wrap = document.createElement("div");
                wrap.className = "video-wrap";

                const videoEl = document.createElement("video");
                videoEl.controls = true;
                videoEl.preload  = "metadata";
                videoEl.style.width = "100%";
                videoEl.style.height = "100%";
                videoEl.style.objectFit = "cover";
                wrap.appendChild(videoEl);
                videoGrid.appendChild(wrap);

                const assetPath = "/api/datasets/" + encodeURIComponent(datasetMongoId) +
                                    "/assets/" + encodeURIComponent(v.assetId);

                authFetch(assetPath)
                    .then(r => { if (!r.ok) throw new Error("Failed to load video"); return r.blob(); })
                    .then(blob => { videoEl.src = URL.createObjectURL(blob); })
                    .catch(() => { wrap.innerHTML = '<span class="muted">Failed to load video</span>'; });
                });
            } else {
                videoGrid.innerHTML = '<span class="muted">No videos yet</span>';
            }
            }
        })
        .catch(function (e) {
            console.error("Assets load failed:", e);
            setText("status", "Assets: " + (e && e.message ? e.message : "Failed to load assets"));
        });

        // Descargas
        var downloads = Number.isFinite(ds.downloadsCount) ? ds.downloadsCount : 0;
        updateDownloadsDisplay(downloads);
        var downloadsLink = $("downloadsLink");
        if (downloadsLink) {
        downloadsLink.href = "/datasets/" + encodeURIComponent(datasetMongoId) + "/downloads";
        downloadsLink.addEventListener("click", function(e){
        });
        }

        // Botones
        const btnDownload = $("btnDownload");
        const btnEdit     = $("btnEdit");
        const btnSubmit   = $("btnSubmit");
        const btnClone    = $("btnClone");
        const btnDelete   = $("btnDelete");

        // Botón clonar
        if (btnClone) {
        btnClone.addEventListener("click", async function () {
            if (!confirm("Clone this dataset? This creates a new dataset with the same files and videos. Status becomes Pending. Comments, votes and downloads do NOT transfer.")) {
            return;
            }
            try {
            btnClone.disabled = true;
            setText("status", "Cloning…");

            const res = await apiPost("/api/datasets/" + encodeURIComponent(datasetMongoId) + "/clone", {});
            const newId = (res && res.datasetId) || (res && res.id) || (res && res._id);
            if (!newId) throw new Error("Clone succeeded but no new id returned.");

            try { sessionStorage.setItem("flash", "Dataset cloned ✔"); } catch (_) {}

            window.location.href = "/profile";
            } catch (e) {
            setText("status", (e && e.message) || "Failed to clone");
            } finally {
            btnClone.disabled = false;
            }
        });
        }

        // Descargar un .zip
        btnDownload?.addEventListener("click", async function(){
            try {
                const t = await apiPost(
                "/api/datasets/" + encodeURIComponent(datasetMongoId) + "/track-download",
                { source: "zip" }
                );
                if (t && Number.isFinite(t.downloadsCount)) {
                updateDownloadsDisplay(t.downloadsCount);
                }

                // Descarga
                await downloadBlob(
                "/api/datasets/" + encodeURIComponent(datasetMongoId) + "/download",
                (ds.name || "dataset") + ".zip"
                );
            } catch (e) {
                setText("status", e.message || "Failed to download");
            }
        });

        // Botón de editar
        btnEdit?.addEventListener("click", (e) => {
            const url = "/datasets/" + encodeURIComponent(datasetMongoId) + "/edit";
            location.replace(url);
        });

        // Ingresar para que se revise
        btnSubmit?.addEventListener("click", function(){
        setText("status", "Submitting…");
        apiPost("/api/datasets/" + encodeURIComponent(datasetMongoId) + "/submit")
            .then(resp => {
            setText("status", "Submitted ✔");
            setStatusPill(resp.status || "submitted");
            })
            .catch(e => setText("status", e.message));
        });

        // Borrar dataset, sus comentarios y sus archivos
        btnDelete?.addEventListener("click", function(){
        if (!confirm("Delete this dataset? This cannot be undone.")) return;
        setText("status", "Deleting…");
        fetch(API + "/api/datasets/" + encodeURIComponent(datasetMongoId), {
            method: "DELETE",
            headers: Object.assign({ "Content-Type":"application/json" }, authHeaders())
        })
        .then(r => r.ok ? r.json() : r.json().then(d=>{throw new Error(d.error||r.statusText)}))
        .then(() => { setText("status", "Deleted ✔"); window.location.href = "/profile"; })
        .catch(e => setText("status", e.message));
        });


        // Comentarios
        var postId = ds.datasetId || ds._id;

        // Se determina si se muestra el público o el del dueño
        apiGet("/me")
            .then(function(me){
                const authorId = me.username || me._id || me.id || "anon";
                const isOwner  = computeIsOwner(me, ds);

                applyMode(isOwner);
                setDownloadsUI(downloads, isOwner);

                loadComments(postId, authorId, me.role === "admin");
                wirePostForm(postId, authorId, me.role === "admin");
                initVoting(ds, { isOwner, meId: (me._id || me.id || me.username || null) });
            })
            .catch(function(){
                // Se muestra el perfil público si no se obtiene un dueño
                const authorId = "anon";

                applyMode(false);
                setDownloadsUI(downloads, false);

                loadComments(postId, authorId, false);
                wirePostForm(postId, authorId, false);
                initVoting(ds, { isOwner:false, meId:null });
        });
    }

    // Correr todo
    ensureToken();
    var id = datasetIdFromPath();
    if (!id){ setText("status", "Missing dataset id in URL"); return; }
    setText("status", "Loading…");
    setupBackButton();
    apiGet("/api/datasets/" + encodeURIComponent(id))
        .then(function(ds){ render(ds); setText("status", ""); })
        .catch(function(e){ setText("status", e.message || "Failed to load"); });

    })();
    </script>
    </body>
    </html>
  `;
};

export default datasetView;
