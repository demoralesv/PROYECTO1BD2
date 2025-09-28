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
        .btn{
        padding:10px 12px; border-radius:10px; border:1px solid var(--line);
        background:#0f1217; color:var(--text); cursor:pointer; display:inline-flex; align-items:center; gap:8px; text-decoration:none
        }
        .btn.primary{ background:#0f141c }
        .btn.danger{ border-color:#4b1f24; background:#1a0d10; color:#ffb3b3 }
        .btn[disabled]{ opacity:.6; cursor:not-allowed }

        .card{ background:var(--panel); border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,.3) }
        .muted{ color:var(--muted) }
        .topbar{
        position:sticky; top:0; z-index:20; backdrop-filter:saturate(1.2) blur(4px);
        display:flex; gap:12px; align-items:center; justify-content:space-between;
        padding:12px 18px; border-bottom:1px solid #0e1218; background:rgba(11,13,16,.6)
        }
        .brand{display:flex; align-items:center; gap:10px; font-weight:600}
        .logo{ width:28px; height:28px; border-radius:50%; background:#1a2230; display:inline-block }

        .page{ max-width:1100px; margin:24px auto; padding:0 16px; display:grid; gap:18px; grid-template-columns:340px 1fr }
        @media (max-width: 900px){ .page{ grid-template-columns:1fr } }

        .sidebar{ padding:16px; display:grid; gap:14px }
        .divider{ height:1px; background:#0e1218; margin:6px 0 }

        /* Parte de arriba */
        .hero{ padding:18px; display:grid; gap:14px }
        .title-row{ display:flex; align-items:center; gap:12px }
        .ds-avatar{
        width:64px; height:64px; border-radius:12px; object-fit:cover; background:#121820; border:1px solid var(--line)
        }
        .hero h1{ margin:0; font-size:1.4rem }

        /* usuario */
        .owner{ display:flex; align-items:center; gap:10px }
        .owner img{
        width:40px; height:40px; border-radius:10px; object-fit:cover; background:#121820; border:1px solid var(--line)
        }

        /* Panel de control */
        .panel{ padding:18px }
        .section-title{ margin:0 0 8px; font-size:1.05rem }
        .box{ border:1px solid var(--line); border-radius:12px; padding:12px; background:#0f1217 }

        /* archivos y videos */
        .lists{ display:grid; grid-template-columns:1fr 1fr; gap:12px }
        @media (max-width: 900px){ .lists{ grid-template-columns:1fr } }
        .chip-list{ display:flex; flex-wrap:wrap; gap:8px }
        .chip{
        display:flex; align-items:center; gap:8px; padding:6px 10px;
        border:1px solid var(--line); border-radius:10px; background:#0f1217; max-width:100%
        }
        .chip .name{ white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:280px }
        .video-grid{ display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:10px }
        .video-wrap{ position:relative; border:1px solid var(--line); border-radius:10px; overflow:hidden; background:#0f1217; height:160px }
        .video-wrap video{ width:100%; height:100%; object-fit:cover }

        /* Parte de abajo */
        .footer-actions{ display:flex; gap:10px; justify-content:flex-end; margin-top:10px }
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
        <!-- Información en la izquierda -->
        <aside class="card sidebar">
        <div class="title-row">
            <img id="dsAvatar" class="ds-avatar" alt="dataset avatar" />
            <div>
            <h1 id="dsName">—</h1>
            <div class="muted" id="dsDates">—</div>
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

        <!-- Información en la derecha -->
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
        </div>
        </section>
    </main>

    <script>
    (function(){
        var API = "http://localhost:3000";

        function authHeaders(){
        var t = localStorage.getItem("token");
        return t ? { "Authorization": "Bearer " + t } : {};
        }
        function $(id){ return document.getElementById(id); }
        function setText(id, v){ var el=$(id); if(el) el.textContent = v; }
        function ensureToken(){ if(!localStorage.getItem("token")) window.location.replace("/"); }

        function apiGet(path){
        return fetch(API + path, { headers: Object.assign({ "Content-Type":"application/json" }, authHeaders()) })
            .then(function(r){ return r.ok ? r.json() : r.json().then(function(d){throw new Error(d.error||r.statusText)}) });
        }

        function fmtDate(d){
        try{ return new Date(d).toLocaleString(); } catch(_){ return d || "—"; }
        }

        function datasetIdFromPath(){
        // URL like /datasets/abc123
        var parts = location.pathname.split("/");
        return parts[2] || "";
        }

        function render(ds){
        // Left quick info
        $("dsAvatar").src = ds.datasetAvatarUrl || "https://api.dicebear.com/8.x/shapes/svg?seed=" + encodeURIComponent(ds.name || "dataset");
        setText("dsName", ds.name || "—");
        setText("dsDates", "Created " + fmtDate(ds.createdAt) + " • Last update " + fmtDate(ds.updatedAt));

        var o = ds.owner || {};
        $("ownerAvatar").src = o.avatarUrl || "https://api.dicebear.com/8.x/initials/svg?seed=" + encodeURIComponent(o.fullName || o.username || "Owner");
        setText("ownerName", o.fullName || "—");
        setText("ownerUsername", o.username ? "@" + o.username : "@user");

        // Descripción
        setText("dsDesc", ds.description || "—");

        // Archivos TODO: Mostrarlos cuando se guarden
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

        // Videos TODO: Mostrarlos cuando se guarden
        var videoGrid = $("videoGrid"); videoGrid.innerHTML = "";
        if (ds.videos && ds.videos.length){
            ds.videos.forEach(function(v){
            var wrap = document.createElement("div");
            wrap.className = "video-wrap";
            // if you had URLs, you could show previews:
            wrap.innerHTML = '<video controls></video>';
            videoGrid.appendChild(wrap);
            });
        } else {
            videoGrid.innerHTML = '<span class="muted">No videos yet</span>';
        }

        // Botones
        $("btnEdit").addEventListener("click", function(){
            // Navigate to your edit page (when you build it)
            // e.g., window.location.href = "/datasets/" + encodeURIComponent(ds.datasetId) + "/edit";
            alert("Edit dataset (todo)");
        });

        $("btnSubmit").addEventListener("click", function(){
            alert("Submit for review (todo)");
        });

        $("btnDelete").addEventListener("click", function(){
            alert("Delete (todo)");
        });
        }

        // Inicio
        ensureToken();
        var id = datasetIdFromPath();
        if (!id){ setText("status", "Missing dataset id in URL"); return; }

        setText("status", "Loading…");
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
