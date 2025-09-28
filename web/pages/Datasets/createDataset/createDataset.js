const createDataset = () => {
  return `
  <!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Create Dataset</title>
      <style>
        :root{ --bg:#0b0d10; --panel:#12161c; --muted:#9fb0c8; --line:#2a3340; --text:#e7eef7; --accent:#5aa9ff }
        *{ box-sizing:border-box }
        body{ margin:0; font-family:system-ui,arial,segoe ui; background:var(--bg); color:var(--text) }
        a,button,input,textarea{ font:inherit }
        .btn,.input,textarea{
          padding:10px 12px; border-radius:10px; border:1px solid var(--line);
          background:#0f1217; color:var(--text)
        }
        .btn{ cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:8px }
        .btn.primary{ background:#0f141c }
        .btn.ghost{ background:transparent }
        .btn.sm{ padding:8px 10px; font-size:.9rem }
        .card{ background:var(--panel); border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,.3) }
        .muted{ color:var(--muted) }
        .topbar{
          position:sticky; top:0; z-index:20; backdrop-filter:saturate(1.2) blur(4px);
          display:flex; gap:12px; align-items:center; justify-content:space-between;
          padding:12px 18px; border-bottom:1px solid #0e1218; background:rgba(11,13,16,.6)
        }
        .brand{display:flex; align-items:center; gap:10px; font-weight:600}
        .brand .logo{width:28px; height:28px; border-radius:50%; background:#1a2230; display:inline-block}

        .page{ max-width:1100px; margin:24px auto; padding:0 16px; display:grid; gap:18px; grid-template-columns:340px 1fr }
        @media (max-width: 900px){ .page{ grid-template-columns:1fr } }

        .sidebar{ padding:14px }
        .row{ display:flex; gap:10px; align-items:center; justify-content:space-between }
        .grid{ display:grid; gap:10px }
        .divider{ height:1px; background:#0e1218; margin:10px 0 }

        /* Layout de la página */
        .panel{ padding:18px }
        label{ font-size:.95rem; margin-bottom:4px; display:block; color:#c9d6e5 }
        .field{ display:grid; gap:6px }
        .two{ display:grid; grid-template-columns:1fr 1fr; gap:12px }
        textarea{ min-height:110px; resize:vertical }
        .thumb{
          width:72px; height:72px; border-radius:12px; background:#121820; border:1px solid var(--line);
          display:flex; align-items:center; justify-content:center; overflow:hidden
        }
        .pill{ font-size:.8rem; padding:2px 8px; border-radius:999px; border:1px solid var(--line); color:var(--muted) }

        /* partes para escoger archivos y videos */
        .file-area, .video-area{
            height: 190px;
            overflow: auto;
            border: 1px solid var(--line);
            border-radius: 10px;
            padding: 10px;
            background: #0f1217;
        }
        .chip-list{ display:flex; flex-wrap:wrap; gap:8px }
            .chip-item{
            display:flex; align-items:center; gap:8px;
            padding:6px 10px; border:1px solid var(--line);
            border-radius:10px; background:#0f1217; max-width:100%;
        }
        .chip-item .name{
            display:inline-block;
            max-width: min(40vw, 280px);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .video-grid{
            display:grid;
            grid-template-columns:repeat(auto-fill, minmax(180px, 1fr));
            gap:10px;
        }
        .video-wrap{ position:relative; border:1px solid var(--line); border-radius:10px; overflow:hidden; background:#0f1217 }
        .video-wrap button{
            position:absolute; top:6px; right:6px;
            border:1px solid var(--line); background:rgba(0,0,0,.5);
            color:#fff; border-radius:8px; padding:2px 6px; cursor:pointer
        }
        /* Secciones del usuario */
        .owner { display:grid; gap:12px }
        .owner-header{
        display:flex; align-items:center; gap:12px;
        }
        .owner-avatar{
        width:72px; height:72px; border-radius:12px;
        object-fit:cover; background:#121820; border:1px solid var(--line);
        flex:0 0 72px;
        }
        .owner-text{ min-width:0; display:grid; gap:2px }
        .owner-name{
        font-weight:600; line-height:1.2;
        white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .owner-username{
        color:var(--muted); font-size:.95rem;
        white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .owner-label{ color:#c9d6e5; font-size:.9rem; opacity:.9 }
        .sidebar{ align-self: start; }
      </style>
    </head>
    <body>
      <header class="topbar">
        <div class="brand">
          <span class="logo"></span>
          <span>Create Dataset</span>
        </div>
        <div class="row">
          <button id="btnProfile" class="btn icon" title="Profile">🏠</button>
        </div>
      </header>

      <main class="page">
        <!-- Parte izquierda -->
        <aside class="card sidebar grid">
            <div class="owner">
                <div class="owner-label">Owner</div>
                <input type="hidden" id="datasetId" />

                <div class="owner-header">
                <img id="ownerAvatar" class="owner-avatar" alt="Owner avatar" />
                <div class="owner-text">
                    <div id="ownerName" class="owner-name">—</div>
                    <div id="ownerUsername" class="owner-username">@user</div>
                </div>
                </div>

                <div class="field">
                    <label for="dsAvatar">Dataset avatar URL</label>
                    <input id="dsAvatar" class="input" placeholder="https://…/image.png" />
                    <div class="thumb">
                        <img id="dsAvatarPreview" alt="Dataset avatar preview"
                            style="width:92px;height:92px;object-fit:cover;border-radius:12px" />
                    </div>
                </div>
        </aside>

        <!-- Parte derecha -->
        <section class="card panel grid">
          <div class="row" style="margin-bottom:6px">
            <h3 style="margin:0">New Dataset</h3>
            <div class="status muted" id="status"></div>
          </div>

          <div class="field">
            <label for="dsName">Name *</label>
            <input id="dsName" class="input" placeholder="Title of Dataset" />
          </div>

          <div class="field">
            <label for="dsDesc">Description *</label>
            <textarea id="dsDesc" class="input" placeholder="Short description…"></textarea>
          </div>

          <div class="two">
            <div class="field">
                <label>Files (multiple)</label>
                <input id="fileInput" type="file" multiple />
                <div class="file-area">
                    <div id="fileChips" class="chip-list"></div>
                </div>
                </div>

                <div class="field">
                <label>Videos (multiple)</label>
                <input id="videoInput" type="file" accept="video/*" multiple />
                <div class="video-area">
                    <div id="videoGrid" class="video-grid"></div>
                </div>
                </div>
          </div>

          <div class="row" style="justify-content:flex-end; gap:10px">
            <button id="btnCancel" class="btn ghost">Cancel</button>
            <button id="btnSave" class="btn primary">Save dataset</button>
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
          function $(id){ return document.getElementById(id) }
          function setText(id, v){ var el=$(id); if(el) el.textContent=v }
          function ensureToken(){ if(!localStorage.getItem("token")) window.location.replace("/") }

          function apiGet(path){
            return fetch(API + path, { headers: Object.assign({ "Content-Type":"application/json" }, authHeaders()) })
              .then(function(r){ return r.ok ? r.json() : r.json().then(d=>{throw new Error(d.error||r.statusText)}) })
          }
          function apiPost(path, body){
            return fetch(API + path, {
              method:"POST",
              headers: Object.assign({ "Content-Type":"application/json" }, authHeaders()),
              body: JSON.stringify(body)
            }).then(function(r){ return r.ok ? r.json() : r.json().then(d=>{throw new Error(d.error||r.statusText)}) })
          }

          // Info del usuario
          function loadOwner(){
            return apiGet("/me").then(function(me){
              var avatar = me.avatarUrl || "https://api.dicebear.com/8.x/initials/svg?seed=" + encodeURIComponent(me.fullName||me.username||"User");
              $("ownerAvatar").src = avatar;
              setText("ownerName", me.fullName || "—");
              setText("ownerUsername", me.username ? "@"+me.username : "—");
              return me;
            })
          }

          // ID del dataset
          function genId(){
            return "ds_" + Math.random().toString(36).slice(2,10);
          }

          function dedupeByNameSize(list){
            const map = new Map(list.map(f => [f.name + ":" + f.size, f]));
            return Array.from(map.values());
          }

          // Interfaz de los archivos y videos
          var files = [];
          var videos = [];
          function extOf(f){
            const n = f.name || "";
            const dot = n.lastIndexOf(".");
            if (dot > 0) return n.slice(dot+1).toUpperCase();
            return (f.type?.split("/").pop() || "FILE").toUpperCase();
          }

            function renderFileChips(){
            var box = $("fileChips"); box.innerHTML = "";
            if(files.length === 0){ box.innerHTML = '<span class="muted">No files selected</span>'; return }
            files.forEach(function(f, i){
                var chip = document.createElement("div");
                chip.className = "chip-item";
                chip.innerHTML =
                '<span class="pill">'+ extOf(f) +'</span>' +
                '<span class="name" title="'+ f.name +'">'+ f.name +'</span>' +
                '<button title="remove">×</button>';
                chip.querySelector("button").addEventListener("click", function(){
                files.splice(i,1); renderFileChips();
                });
                box.appendChild(chip);
            });
            }
          function renderVideoGrid(){
            var box = $("videoGrid"); box.innerHTML = "";
            if(videos.length === 0){ box.innerHTML = '<span class="muted">No videos selected</span>'; return }
            videos.forEach(function(f, i){
              var wrap = document.createElement("div");
              wrap.className = "video-wrap";
              var url = URL.createObjectURL(f);
              wrap.innerHTML = '<video src="'+url+'" controls style="width:100%; height:160px; object-fit:cover"></video><button title="remove" data-i="'+i+'">×</button>';
              wrap.querySelector("button").addEventListener("click", function(){
                URL.revokeObjectURL(url);
                videos.splice(i,1); renderVideoGrid()
              });
              box.appendChild(wrap);
            })
          }

          $("fileInput").addEventListener("change", function(e){
            const selected = Array.from(e.target.files || []);
            files = dedupeByNameSize(files.concat(selected));
            renderFileChips();
            e.target.value = ""; // allow re-choosing the same file later
          });

          $("videoInput").addEventListener("change", function(e){
            const selected = Array.from(e.target.files || []);
            videos = dedupeByNameSize(videos.concat(selected));
            renderVideoGrid();
            e.target.value = "";
          });
          $("dsAvatar").addEventListener("input", function(e){
            var url = e.target.value.trim();
            $("dsAvatarPreview").src = url || "";
          });
          
          // Guardar
          function setStatus(msg){ setText("status", msg) }
          $("btnSave").addEventListener("click", function(){
            var name = $("dsName").value.trim();
            var desc = $("dsDesc").value.trim();
            var avatar = $("dsAvatar").value.trim() || null;
            if(!name || !desc){ setStatus("Please fill required fields."); return }

            var payload = {
              datasetId: $("datasetId").value || genId(),
              name: name,
              description: desc,
              datasetAvatarUrl: avatar
              // TODO: Falta poder guardar los archivos y videos
            };

            setStatus("Saving…");
            apiPost("/datasets", payload)
              .then(function(saved){
                setStatus("Saved ✔");
                window.location.href = "/profile";
              })
              .catch(function(e){ setStatus(e.message) });
          });

          $("btnCancel").addEventListener("click", function(){ window.location.href = "/profile" });
          $("btnProfile").addEventListener("click", function(){ window.location.href = "/profile" });

          // Correr todo
          ensureToken();
          setText("datasetId", genId());
          loadOwner().catch(function(e){ setStatus(e.message) });
          renderFileChips();
          renderVideoGrid();
        })();
      </script>
    </body>
  </html>
  `;
};

export default createDataset;
