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
        .brand .logo{width:28px; height:28px; border-radius:50%; background:#000; display:inline-block;background-image: url(https://cdn-icons-png.flaticon.com/512/18495/18495588.png);background-size: contain;}        .top-actions{display:flex; gap:10px; align-items:center}

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

        /* Partes para escoger archivos y videos */
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
        .status.error{ color:#ff6b6b }
      </style>
    </head>
    <body>
      <header class="topbar">
        <div class="brand">
          <span class="logo"></span>
          <span>Create Dataset</span>
        </div>
        <div class="row">
          <button id="btnHome" class="btn icon" title="Home">🏠</button>
        </div>
      </header>

      <main class="page">
        <!-- Parte izquierda -->
        <aside class="card sidebar grid">
            <div class="owner">
                <div class="owner-label">Owner</div>

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
                            style="width:72px;height:72px;object-fit:cover;border-radius:12px" />
                    </div>
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
            <!-- Archivos -->
            <div class="field">
              <label>Files (multiple) <span class="muted">(at least one)</span></label>
              <input id="fileInput" type="file" multiple />
              <div class="row muted" style="font-size:.9rem">
                <div>Files selected: <span id="fileCount">0</span></div>
                <div>Total: <span id="fileTotal">0 B</span></div>
              </div>
              <div class="file-area">
                <div id="fileChips" class="chip-list"></div>
              </div>
            </div>

            <!-- Videos -->
            <div class="field">
              <label>Videos (multiple) <span class="muted">(optional)</span></label>
              <input id="videoInput" type="file" accept="video/*" multiple />
              <div class="row muted" style="font-size:.9rem">
                <div>Videos selected: <span id="videoCount">0</span></div>
                <div>Total: <span id="videoTotal">0 B</span></div>
              </div>
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
          const MAX_TOTAL_BYTES = 15 * 1024 * 1024;

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

          function validHttpUrl(s){
            return /^https?:\/\//i.test((s || "").trim());
          }

          function seedDsAvatar(){
            var name = ( $("dsName").value || "" ).trim() || "Dataset";
            return "https://api.dicebear.com/8.x/initials/svg?seed=" + encodeURIComponent(name);
          }

          function refreshDsAvatarPreview() {
            const input = ( $("dsAvatar").value || "" ).trim();
            const src = validHttpUrl(input) ? input : seedDsAvatar();
            const img = $("dsAvatarPreview");
            if (!img) return;
            img.src = src;
          }

          function formatBytes(n){
            if (!n) return "0 B";
            const u = ["B","KB","MB","GB","TB"];
            const i = Math.floor(Math.log(n)/Math.log(1024));
            return (n/Math.pow(1024, i)).toFixed(i ? 1 : 0) + " " + u[i];
          }
          function setStatus(msg, isErr){
            const s = $("status");
            s.textContent = msg;
            s.className = "status muted" + (isErr ? " error" : "");
          }
          
          const VIDEO_EXT = new Set([".mp4",".mov",".m4v",".mkv",".webm",".avi",".wmv",".flv",".mpeg",".mpg",".3gp",".ts"]);
          function isVideoByExt(name){
            const dot = name.lastIndexOf(".");
            if (dot < 0) return false;
            return VIDEO_EXT.has(name.slice(dot).toLowerCase());
          }
          function isVideoByMime(f){
            return (f.type || "").startsWith("video/");
          }

          // Cantidad de archivos y videos inicial
          var files = [];
          var videos = [];

          function updateTotals(){
            const fileBytes = files.reduce((a,f)=>a+(f.size||0),0);
            const vidBytes  = videos.reduce((a,f)=>a+(f.size||0),0);
            setText("fileCount", String(files.length));
            setText("videoCount", String(videos.length));
            setText("fileTotal", formatBytes(fileBytes));
            setText("videoTotal", formatBytes(vidBytes));
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

          function dedupeByNameSize(list){
            const map = new Map(list.map(f => [f.name + ":" + f.size, f]));
            return Array.from(map.values());
          }
          
          // Interfaz de los archivos y videos
          function extOf(f){
            const n = f.name || "";
            const dot = n.lastIndexOf(".");
            if (dot > 0) return n.slice(dot+1).toUpperCase();
            return (f.type?.split("/").pop() || "FILE").toUpperCase();
          }

          function totalSelectedBytes() {
            return files.reduce((a,f)=>a+(f.size||0),0) +
                  videos.reduce((a,f)=>a+(f.size||0),0);
          }

          function guardTotalOrWarn() {
            const total = totalSelectedBytes();
            if (total > MAX_TOTAL_BYTES) {
              setStatus(
                "Total selected exceeds 15 MB (" + formatBytes(total) + "). Please remove some files/videos.",
                true
              );
              return false;
            }
            return true;
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
                files.splice(i,1); renderFileChips(); updateTotals();
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
              wrap.innerHTML =
                '<video src="'+url+'" controls style="width:100%; height:160px; object-fit:cover"></video>' +
                '<button title="remove" data-i="'+i+'">×</button>';
              wrap.querySelector("button").addEventListener("click", function(){
                URL.revokeObjectURL(url);
                videos.splice(i,1); renderVideoGrid(); updateTotals();
              });
              box.appendChild(wrap);
            })
          }

          $("fileInput").addEventListener("change", function(e){
            let selected = Array.from(e.target.files || []);
            selected = selected.filter(f => !isVideoByMime(f) && !isVideoByExt(f.name));
            files = dedupeByNameSize(files.concat(selected));
            renderFileChips(); updateTotals();

            if (!guardTotalOrWarn()) {
              files = files.slice(0, files.length - selected.length);
              renderFileChips(); updateTotals();
            }
            e.target.value = "";
          });

          $("videoInput").addEventListener("change", function(e){
            let selected = Array.from(e.target.files || []);
            selected = selected.filter(f => isVideoByMime(f) || isVideoByExt(f.name));
            videos = dedupeByNameSize(videos.concat(selected));
            renderVideoGrid(); updateTotals();

            if (!guardTotalOrWarn()) {
              videos = videos.slice(0, videos.length - selected.length);
              renderVideoGrid(); updateTotals();
            }
            e.target.value = "";
          });

          $("dsAvatar").addEventListener("input", refreshDsAvatarPreview);

          $("dsName").addEventListener("input", refreshDsAvatarPreview);

          $("dsAvatarPreview").addEventListener("error", function(){
            this.src = seedDsAvatar();
          });
          
          function postJSON(path, body){
            return fetch(API + path, {
              method: "POST",
              headers: Object.assign({ "Content-Type":"application/json" }, authHeaders()),
              body: JSON.stringify(body)
            }).then(r => r.ok ? r.json() : r.json().then(d=>{ throw new Error(d.error||r.statusText) }));
          }
          function postForm(path, form){
            return fetch(API + path, {
              method: "POST",
              headers: authHeaders(),
              body: form
            }).then(r => r.ok ? r.json() : r.json().then(d=>{ throw new Error(d.error||r.statusText) }));
          }
  
          // Guardar
          function setStatus(msg){ setText("status", msg) }
          $("btnSave").addEventListener("click", async function(){
            if (!guardTotalOrWarn()) return;
            try{
              setStatus("");
              const name = $("dsName").value.trim();
              const desc = $("dsDesc").value.trim();
              const urlInput = ($("dsAvatar").value || "").trim();
              const avatar = validHttpUrl(urlInput) ? urlInput : seedDsAvatar();

              // Se ocupa al menos un archivo
              if (!name || !desc){ setStatus("Please fill required fields.", true); return }
              if (files.length === 0){ setStatus("Please add at least one file (not video).", true); return }

              setStatus("Saving dataset…");

              // Se crea el dataset en Mongo
              const saved = await postJSON("/datasets", { name, description: desc, datasetAvatarUrl: avatar });

              // Se guardan los archivos y videos en Cassandra
              setStatus("Uploading assets…");
              const form = new FormData();
              files.forEach(f => form.append("files", f, f.name));
              videos.forEach(v => form.append("videos", v, v.name));
              await postForm("/datasets/" + encodeURIComponent(saved._id) + "/assets", form);

              setStatus("Saved ✔");
              window.location.href = "/profile";
            }catch(e){
              setStatus(e.message || String(e), true);
            }
          });

          $("btnCancel").addEventListener("click", function(){ window.location.href = "/profile" });
          $("btnHome").addEventListener("click", function(){ window.location.href = "/home" });

          // Correr todo
          ensureToken();
          loadOwner().catch(function(e){ setStatus(e.message) });
          refreshDsAvatarPreview();
          renderFileChips();
          renderVideoGrid();
        })();
      </script>
    </body>
  </html>
  `;
};

export default createDataset;
