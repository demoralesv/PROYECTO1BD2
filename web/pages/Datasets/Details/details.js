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
    .logo{ width:28px; height:28px; border-radius:50%; background:#1a2230; display:inline-block }
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
    .chip .name{ white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:280px }
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
    </style>
    </head>
    <body>
    <header class="topbar">
    <div class="brand"><span class="logo"></span><span>Dataset</span></div>
    <div style="display:flex; gap:8px">
        <a href="/profile" class="btn">← Back to profile</a>
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
            </div>
        </div>
        </div>

        <div class="divider"></div>

        <div>
        <div class="muted" style="margin-bottom:6px">Owner</div>
        <div class="owner">
            <img id="ownerAvatar" alt="owner avatar" />
            <div>
            <div id="ownerName">—</div>
            <div class="muted" id="ownerUsername">@user</div>
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
            <div class="muted" style="margin-bottom:6px">Files</div>
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

        <div class="footer-actions">
            <button id="btnEdit" class="btn">Edit</button>
            <button id="btnSubmit" class="btn primary">Submit for review</button>
            <button id="btnDelete" class="btn danger" disabled>Delete</button>
        </div>

        <div id="status" class="muted" style="min-height:20px"></div>

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

    function authHeaders(){
        var t = localStorage.getItem("token");
        return t ? { "Authorization": "Bearer " + t } : {};
    }
    function $(id){ return document.getElementById(id); }
    function setText(id, v){ var el=$(id); if(el) el.textContent = v; }
    function ensureToken(){ if(!localStorage.getItem("token")) window.location.replace("/"); }

    function apiGet(path){ return fetch(API + path, { headers: Object.assign({ "Content-Type":"application/json" }, authHeaders()) }).then(r=>r.ok?r.json():r.json().then(d=>{throw new Error(d.error||r.statusText)})); }
    function apiPost(path, body){ return fetch(API + path, { method:"POST", headers: Object.assign({ "Content-Type":"application/json" }, authHeaders()), body: JSON.stringify(body||{}) }).then(r=>r.ok?r.json():r.json().then(d=>{throw new Error(d.error||r.statusText)})); }

    function cGet(path){ return fetch(API_COMMENTS + path, { headers: {"Content-Type":"application/json"} }).then(r=>r.ok?r.json():r.json().then(d=>{throw new Error(d.error||r.statusText)})); }
    function cPost(path, body){ return fetch(API_COMMENTS + path, { method:"POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(body||{}) }).then(r=>r.ok?r.json():r.json().then(d=>{throw new Error(d.error||r.statusText)})); }

    function fmtDate(d){ try{ return new Date(d).toLocaleString(); } catch(_){ return d || "—"; } }

    function datasetIdFromPath(){
        var parts = location.pathname.split("/");
        return parts[2] || "";
    }

    function statusPillHtml(s){
        const st = (s || "pending").toLowerCase();
        const label = st==="submitted"?"Submitted":st==="approved"?"Approved":st==="declined"?"Declined":"Pending submission";
        return '<span class="pill '+st+'">'+label+'</span>';
    }
    function setStatusPill(s){
        $("dsStatusPill").innerHTML = statusPillHtml(s);
        $("btnSubmit").disabled = ["submitted","approved","declined"].includes((s||"").toLowerCase());
    }

    // ---- Comentarios ----
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
            const replies = childrenOf(c.id);            // <-- declare ONCE
            const hasReplies = replies && replies.length > 0;

            // Regular users: hide deleted comments that have no replies
            if (c.deleted && !isAdmin && !hasReplies) return null;

            const div = document.createElement("div");
            div.className = "comment-item";
            div.style.marginLeft = depth ? Math.min(depth,3)*16 + "px" : "0";

            const isOwn = c.idAutor === currentUserId;

            let bodyHTML = "";
            if (c.deleted) {
            if (isAdmin) {
                bodyHTML = '<div class="comment-body"><span class="muted">[Deleted]</span> ' +
                        (c.texto || "") + '</div>';
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

            // Caja para comentarios de respuesta
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

            // Acciones de un comentario
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

                $("commentStatus").textContent = "Posting reply…";
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
                $("commentStatus").textContent = "";
                })
                .catch(err => $("commentStatus").textContent = err.message);

                e.stopPropagation(); return;
            }

            if (act === "delete") {
                $("commentStatus").textContent = "Deleting…";
                cDelete("/posts/" + encodeURIComponent(postId) + "/comments/" + encodeURIComponent(c.id))
                .then(() => cGet("/posts/" + encodeURIComponent(postId) + "/comments"))
                .then(data => {
                    renderComments(data.comentarios || [], currentUserId, isAdmin, postId);
                    $("commentStatus").textContent = "";
                })
                .catch(err => $("commentStatus").textContent = err.message);

                e.stopPropagation(); return;
            }
            });

            // Comentarios de respuesta
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
                    if (node) wrap.appendChild(node); // guard against hidden deleted leafs
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
        $("commentStatus").textContent = "Loading comments…";
        cGet("/posts/" + encodeURIComponent(postId) + "/comments")
            .then(data => {
            renderComments(data.comentarios || [], currentUserId, isAdmin, postId);
            $("commentStatus").textContent = "";
            })
            .catch(e => { $("commentStatus").textContent = e.message; });
    }

    function postComment(postId, texto, idAutor){
        $("commentStatus").textContent = "Posting…";
        return cPost("/posts/" + encodeURIComponent(postId) + "/comments", { texto, idAutor })
        .then(c => { $("commentStatus").textContent = "Posted ✔"; return c; })
        .catch(e => { $("commentStatus").textContent = e.message; throw e; });
    }

    function render(ds){
        $("dsAvatar").src = ds.datasetAvatarUrl || "https://api.dicebear.com/8.x/shapes/svg?seed=" + encodeURIComponent(ds.name || "dataset");
        setText("dsName", ds.name || "—");
        setText("dsDates", "Created " + fmtDate(ds.createdAt) + " • Last update " + fmtDate(ds.updatedAt));

        var o = ds.owner || {};
        $("ownerAvatar").src = o.avatarUrl || "https://api.dicebear.com/8.x/initials/svg?seed=" + encodeURIComponent(o.fullName || o.username || "Owner");
        setText("ownerName", o.fullName || "—");
        setText("ownerUsername", o.username ? "@" + o.username : "@user");

        setText("dsDesc", ds.description || "—");
        setStatusPill(ds.status);

        // Simple downloads UI (static for now; use ds.downloads if present)
        var downloads = ds.downloads != null ? ds.downloads : 0;
        $("downloadsLink").textContent = downloads + (downloads === 1 ? " download" : " downloads");
        $("downloadsLink").addEventListener("click", function(e){
        e.preventDefault();
        // future page; for now just a placeholder
        alert("This will show the list of users who downloaded this dataset.");
        // e.g., window.location.href = "/datasets/" + encodeURIComponent(ds.datasetId || ds._id) + "/downloads";
        });

        // Archivos
        var fileList = $("fileList"); fileList.innerHTML = "";
        if (ds.files && ds.files.length){
        ds.files.forEach(function(f){
            var chip = document.createElement("div");
            chip.className = "chip";
            chip.innerHTML = '<span class="muted" style="font-size:.85rem">' + (f.type || 'file') + '</span>' +
                            '<span class="name" title="'+ (f.name || '') +'">' + (f.name || 'unnamed') + '</span>';
            fileList.appendChild(chip);
        });
        } else {
        fileList.innerHTML = '<span class="muted">No files yet</span>';
        }

        // Videos
        var videoGrid = $("videoGrid"); videoGrid.innerHTML = "";
        if (ds.videos && ds.videos.length){
        ds.videos.forEach(function(v){
            var wrap = document.createElement("div");
            wrap.className = "video-wrap";
            wrap.innerHTML = '<video controls></video>';
            videoGrid.appendChild(wrap);
        });
        } else {
        videoGrid.innerHTML = '<span class="muted">No videos yet</span>';
        }

        // Botones
        $("btnDownload").addEventListener("click", function(){
        // wire this later
        alert("Download will be implemented later.");
        });

        $("btnEdit").addEventListener("click", function () {
            const id = ds.datasetId || ds.id || ds._id;
            if (!id) { alert("Missing dataset id"); return; }
            window.location.href = "/datasets/" + encodeURIComponent(id) + "/edit";
        });

        $("btnSubmit").addEventListener("click", function(){
        setText("status", "Submitting…");
        apiPost("/api/datasets/" + encodeURIComponent(ds.datasetId || ds.id) + "/submit")
            .then(function(resp){
            setText("status", "Submitted ✔");
            setStatusPill(resp.status || "submitted");
            })
            .catch(function(e){ setText("status", e.message) });
        });

        $("btnDelete").disabled = false;
        $("btnDelete").addEventListener("click", function(){
        if (!confirm("Delete this dataset? This cannot be undone.")) return;
        setText("status", "Deleting…");
        const toDelete = ds.datasetId || ds.id;
        fetch(API + "/api/datasets/" + encodeURIComponent(toDelete), {
            method: "DELETE",
            headers: Object.assign({ "Content-Type":"application/json" }, authHeaders())
        })
        .then(r => r.ok ? r.json() : r.json().then(d=>{throw new Error(d.error||r.statusText)}))
        .then(() => { setText("status", "Deleted ✔"); window.location.href = "/profile"; })
        .catch(e => setText("status", e.message));
        });

        // Comentarios
        const postId = ds.datasetId || ds._id;

        // Info del usuario
        apiGet("/me").then(me => {
            const authorId = me.username || me._id || me.id || "anon";
            const isAdmin  = me.role === "admin";

            loadComments(postId, authorId, isAdmin);

            $("btnPostComment").addEventListener("click", function(){
                const texto = ($("commentInput").value || "").trim();
                if (!texto){ $("commentStatus").textContent = "Write something first."; return; }
                postComment(postId, texto, authorId).then(()=>{
                $("commentInput").value = "";
                return cGet("/posts/" + encodeURIComponent(postId) + "/comments");
                }).then(data => renderComments(data.comentarios || [], authorId, isAdmin, postId))
                .catch(()=>{});
            });
            }).catch(() => {
            loadComments(postId, "anon", false);
        });
      }

      // Correr todo
      ensureToken();
      const id = datasetIdFromPath();
      if (!id){ setText("status", "Missing dataset id in URL"); return; }
      setText("status", "Loading…");
      apiGet("/api/datasets/" + encodeURIComponent(id))
        .then(ds => { render(ds); setText("status", ""); })
        .catch(e => setText("status", e.message || "Failed to load"));
    })();
    </script>
    </body>
    </html>
  `;
};

export default datasetView;
