const datasetEdit = () => {
  return `
  <!doctype html>
  <html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Dataset • Edit</title>
    <style>
      :root{ --bg:#0b0d10; --panel:#12161c; --muted:#9fb0c8; --line:#2a3340; --text:#e7eef7; --accent:#5aa9ff }
      *{ box-sizing:border-box }
      body{ margin:0; font-family:system-ui,arial,segoe ui; background:var(--bg); color:var(--text) }
      a,button,input,textarea{ font:inherit }
      .btn{ padding:10px 12px; border-radius:10px; border:1px solid var(--line); background:#0f1217; color:var(--text); cursor:pointer; display:inline-flex; align-items:center; gap:8px; text-decoration:none }
      .btn.primary{ background:#0f141c }
      .btn.danger{ border-color:#4b1f24; background:#1a0d10; color:#ffb3b3 }
      .btn[disabled]{ opacity:.6; cursor:not-allowed }
      .btn.sm{ padding:6px 8px; font-size:.85rem }
      .card{ background:var(--panel); border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,.3) }
      .muted{ color:var(--muted) }
      .topbar{ position:sticky; top:0; z-index:20; backdrop-filter:saturate(1.2) blur(4px); display:flex; gap:12px; align-items:center; justify-content:space-between; padding:12px 18px; border-bottom:1px solid #0e1218; background:rgba(11,13,16,.6) }
      .brand{display:flex; align-items:center; gap:10px; font-weight:600}
      .logo{ width:28px; height:28px; border-radius:50%; background:#1a2230; display:inline-block }

      .page{ max-width:1100px; margin:24px auto; padding:0 16px; display:grid; gap:18px; grid-template-columns:340px 1fr }
      @media (max-width: 900px){ .page{ grid-template-columns:1fr } }

      .sidebar{ padding:16px; display:grid; gap:14px; align-self:start; position:sticky; top:72px }
      .divider{ height:1px; background:#0e1218; margin:6px 0 }

      .hero{ padding:18px; display:grid; gap:14px }
      .title-row{ display:flex; gap:12px; align-items:flex-start }
      .title-col{ display:grid; gap:6px }
      .ds-avatar{ width:72px; height:72px; border-radius:12px; object-fit:cover; border:1px solid var(--line); background:#121820 }
      .hero h1{ margin:0; font-size:1.4rem }

      .panel{ padding:18px }
      .section-title{ margin:0 0 8px; font-size:1.05rem }
      .input, textarea.input{ width:100%; padding:10px 12px; border-radius:10px; border:1px solid var(--line); background:#0f1217; color:var(--text) }
      textarea.input{ min-height:110px; resize:vertical }
      .row{ display:grid; gap:8px; margin-bottom:12px }
      .two-col{ display:grid; grid-template-columns:1fr 1fr; gap:12px }
      @media (max-width: 900px){ .two-col{ grid-template-columns:1fr } }

      .box{ border:1px solid var(--line); border-radius:12px; padding:12px; background:#0f1217 }
      .file-row{ display:flex; align-items:center; justify-content:space-between; padding:8px; border:1px solid var(--line); border-radius:10px; background:#0f1217 }
      .video-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:10px }
      .video-card{ position:relative; border:1px solid var(--line); border-radius:10px; overflow:hidden; background:#0f1217 }
      .video-card video{ width:100%; height:160px; object-fit:cover }
      .video-card .bar{ display:flex; justify-content:space-between; align-items:center; padding:6px 8px }

      /* Escoger archivos y videos */
      .file-area, .video-area{ max-height:190px; overflow:auto; border:1px solid var(--line); border-radius:10px; padding:10px; background:#0f1217 }
      .chip-list{ display:flex; flex-wrap:wrap; gap:8px }
      .chip-item{ display:flex; align-items:center; gap:8px; padding:6px 10px; border:1px solid var(--line); border-radius:10px; background:#0f1217; max-width:100% }
      .chip-item .name{ display:inline-block; max-width:min(40vw,280px); white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
      .pill{ font-size:.8rem; padding:2px 8px; border-radius:999px; border:1px solid var(--line); color:var(--muted) }

      .footer-actions{ display:flex; gap:10px; justify-content:flex-end; margin-top:10px }
      .help{ font-size:.9rem; color:var(--muted) }
      .status{ min-height:20px; color:var(--muted) }
      .counter{ display:flex; gap:10px; font-size:.9rem; color:var(--muted) }
      .counter b{ color:var(--text) }
    </style>
  </head>
  <body>
    <header class="topbar">
      <div class="brand"><span class="logo"></span><span>Edit dataset</span></div>
      <div style="display:flex; gap:8px">
        <a id="backBtn" class="btn">← Back to detail</a>
      </div>
    </header>

    <main class="page">
      <!-- Parte izquierda -->
      <aside class="card sidebar">
        <div class="title-row">
          <img id="dsAvatar" class="ds-avatar" alt="dataset avatar" />
          <div class="title-col" style="flex:1">
            <h1 id="dsNamePreview">—</h1>
            <div class="muted" id="dsDates">—</div>
          </div>
        </div>
        <div class="divider"></div>
        <div>
          <div class="muted" style="margin-bottom:6px">Avatar URL</div>
          <input id="avatarInput" class="input" placeholder="https://..." />
          <div class="help">Leave empty to use initials.</div>
        </div>
      </aside>

      <!-- Parte derecha -->
      <section class="card">
        <div class="hero">
          <div class="two-col">
            <div class="row">
              <label class="muted">Name</label>
              <input id="nameInput" class="input" placeholder="Dataset name" />
            </div>
            <div class="row">
              <label class="muted">Short description</label>
              <textarea id="descInput" class="input" placeholder="Brief description…"></textarea>
            </div>
          </div>
        </div>

        <div class="panel">
          <h3 class="section-title">Files</h3>
          <div class="box" style="display:grid; gap:10px">
            <div class="counter">
              <span>Existing: <b id="filesExistingCount">0</b></span>
              <span>Total size: <b id="filesExistingBytes">0 B</b></span>
              <span>New (staged): <b id="filesStagedCount">0</b></span>
              <span>New size: <b id="filesStagedBytes">0 B</b></span>
            </div>
            <div id="filesList" style="display:grid; gap:8px">
              <span class="muted">No files yet</span>
            </div>
            <div class="row">
              <label class="muted">Add more files (multiple)</label>
              <input id="fileInput" type="file" multiple />
            </div>
            <div class="file-area">
              <div id="fileChips" class="chip-list"><span class="muted">No files selected</span></div>
            </div>
            <div id="fileStatus" class="status"></div>
          </div>

          <h3 class="section-title" style="margin-top:18px">Videos</h3>
          <div class="box" style="display:grid; gap:10px">
            <div class="counter">
              <span>Existing: <b id="videosExistingCount">0</b></span>
              <span>Total size: <b id="videosExistingBytes">0 B</b></span>
              <span>New (staged): <b id="videosStagedCount">0</b></span>
              <span>New size: <b id="videosStagedBytes">0 B</b></span>
            </div>
            <div id="videoGridExisting" class="video-grid"><span class="muted">No videos yet</span></div>
            <div class="row">
              <label class="muted">Add more videos (multiple)</label>
              <input id="videoInput" type="file" accept="video/*" multiple />
            </div>
            <div class="video-area">
              <div id="videoGridNew" class="video-grid"><span class="muted">No videos selected</span></div>
            </div>
            <div id="videoStatus" class="status"></div>
          </div>

          <div class="footer-actions">
            <button id="btnSave" class="btn primary">Save changes</button>
            <a id="btnCancel" class="btn">Cancel</a>
          </div>
          <div id="saveStatus" class="status"></div>
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
      function $(id){ return document.getElementById(id); }
      function setText(id,v){ var el=$(id); if(el) el.textContent=v; }
      function ensureToken(){ if(!localStorage.getItem("token")) window.location.replace("/"); }
      function fmtDate(d){ try{ return new Date(d).toLocaleString(); } catch(_){ return d||"—"; } }
      function idFromPath(){ var p=location.pathname.split("/"); return p[2]||""; }
      function initialsAvatar(seed){ return "https://api.dicebear.com/8.x/initials/svg?seed=" + encodeURIComponent(seed||"Dataset"); }
      function humanSize(n){ if(!n) return "0 B"; const u=["B","KB","MB","GB","TB"]; const i=Math.floor(Math.log(n)/Math.log(1024)); return (n/Math.pow(1024,i)).toFixed(i?1:0)+" "+u[i]; }
      function extOfName(name){ const dot=name.lastIndexOf("."); return dot>0? name.slice(dot+1).toUpperCase() : "FILE"; }

        const VIDEO_EXT = new Set([
          ".mp4",".mov",".m4v",".mkv",".webm",".avi",".wmv",".flv",".mpeg",".mpg",".3gp",".ts"
        ]);
        function isVideoByExt(name){
          const dot = (name || "").lastIndexOf(".");
          if (dot < 0) return false;
          return VIDEO_EXT.has(name.slice(dot).toLowerCase());
        }
        function isVideoByMime(file){
          return (file.type || "").startsWith("video/");
        }

      const endpoints = {
        // Datos del dataset
        getDataset: id => "/api/datasets/" + encodeURIComponent(id),
        putMeta:    id => "/api/datasets/" + encodeURIComponent(id),

        // Datos de los archivos y videos
        getAssets:     id => "/api/datasets/" + encodeURIComponent(id) + "/assets",
        uploadAssets:  id => "/datasets/" + encodeURIComponent(id) + "/assets",

        // Para borrar los archivos y videos
        delAssetApi:   (id, assetId) => "/api/datasets/" + encodeURIComponent(id) + "/assets/" + encodeURIComponent(assetId),
        delAssetNoApi: (id, assetId) => "/datasets/"  + encodeURIComponent(id) + "/assets/" + encodeURIComponent(assetId),

        delFileApi:    (id, fileId)  => "/api/datasets/" + encodeURIComponent(id) + "/files/"  + encodeURIComponent(fileId),
        delVideoApi:   (id, vidId)   => "/api/datasets/" + encodeURIComponent(id) + "/videos/" + encodeURIComponent(vidId),
      };

      function apiGet(path){
        return fetch(API + path, { headers: Object.assign({ "Content-Type":"application/json" }, authHeaders()) })
          .then(r=>r.ok?r.json():r.json().then(d=>{throw new Error(d.error||r.statusText)}));
      }
      function apiPut(path, body){
        return fetch(API + path, { method:"PUT", headers: Object.assign({ "Content-Type":"application/json" }, authHeaders()), body: JSON.stringify(body||{}) })
          .then(r=>r.ok?r.json():r.json().then(d=>{throw new Error(d.error||r.statusText)}));
      }
      function apiUpload(path, formData){
        return fetch(API + path, { method:"POST", headers: authHeaders(), body: formData })
          .then(async r=>{
            if (r.ok) return r.json();
            const t = await r.text().catch(()=>r.statusText);
            throw new Error(t||r.statusText);
          });
      }
      function apiDelete(path){
        return fetch(API + path, { method:"DELETE", headers: authHeaders() })
          .then(async r=>{
            if (r.status===204) return {};
            if (r.ok) return r.json();
            const t = await r.text().catch(()=>r.statusText);
            throw new Error(t||r.statusText);
          });
      }

      // Estado del dataset
      let DATASET_ID = "";
      let DS = null;
      let existing = { files: [], videos: [] };
      let staged  = { files: [], videos: [] };

      // Contadores
      function refreshCounters(){
        const fBytesExisting = existing.files.reduce((a,f)=>a+(f.bytes||0),0);
        const vBytesExisting = existing.videos.reduce((a,f)=>a+(f.bytes||0),0);
        const fBytesStaged   = staged.files.reduce((a,f)=>a+(f.size||0),0);
        const vBytesStaged   = staged.videos.reduce((a,f)=>a+(f.size||0),0);

        setText("filesExistingCount", String(existing.files.length));
        setText("filesExistingBytes", humanSize(fBytesExisting));
        setText("filesStagedCount",   String(staged.files.length));
        setText("filesStagedBytes",   humanSize(fBytesStaged));

        setText("videosExistingCount", String(existing.videos.length));
        setText("videosExistingBytes", humanSize(vBytesExisting));
        setText("videosStagedCount",   String(staged.videos.length));
        setText("videosStagedBytes",   humanSize(vBytesStaged));
      }
      function guardNewUploadsTotalOrWarn(kind){
        const sum = [...staged.files, ...staged.videos].reduce((a,f)=>a+(f.size||0),0);
        if (sum > MAX_TOTAL_BYTES){
          const msg = "Total newly selected exceeds 15 MB ("+humanSize(sum)+"). Please remove some "+(kind||"items")+".";
          if (kind==="files") setText("fileStatus", msg); else setText("videoStatus", msg);
          return false;
        }
        if (kind==="files") setText("fileStatus",""); else setText("videoStatus","");
        return true;
      }

      // Mostrar objetos en la pantalla
      function renderBasics(ds){
        const avatarEff = (ds.datasetAvatarUrl||"").trim();
        $("dsAvatar").src = avatarEff || initialsAvatar(ds.name||"Dataset");
        $("dsAvatar").onerror = function(){ this.onerror=null; this.src = initialsAvatar($("nameInput").value || ds.name || "Dataset"); };

        $("dsNamePreview").textContent = ds.name || "—";
        setText("dsDates", "Created " + fmtDate(ds.createdAt) + " • Last update " + fmtDate(ds.updatedAt));

        $("nameInput").value   = ds.name || "";
        $("descInput").value   = ds.description || "";
        $("avatarInput").value = avatarEff;
      }

      // Interfaz para archivos y videos que ya existen
      function fileLabel(f){
        const name = f.name || "unnamed";
        const t = (f.type || "").toUpperCase() || extOfName(name);
        return '<span class="muted" style="font-size:.85rem">'+t+'</span> '+
               '<span class="name" title="'+name+'">'+name+'</span> '+
               '<span class="muted">· '+humanSize(f.bytes||0)+'</span>';
      }
      function renderExistingFiles(){
        const list = $("filesList");
        list.innerHTML = "";
        if (!existing.files.length){
          list.innerHTML = '<span class="muted">No files yet</span>';
        } else {
          existing.files.forEach(f=>{
            const row = document.createElement("div");
            row.className = "file-row";
            row.innerHTML =
              '<div>'+fileLabel(f)+'</div>'+
              '<div style="display:flex; gap:8px">'+
                '<button class="btn sm danger" data-del>× Remove</button>'+
              '</div>';
            row.querySelector("[data-del]").addEventListener("click", ()=>deleteAsset(f, "file"));
            list.appendChild(row);
          });
        }
        refreshCounters();
      }
      function renderExistingVideos(){
        const grid = $("videoGridExisting");
        grid.innerHTML = "";
        if (!existing.videos.length){
          grid.innerHTML = '<span class="muted">No videos yet</span>';
        } else {
          existing.videos.forEach(v=>{
            const card = document.createElement("div");
            card.className = "video-card";
            const video = document.createElement("video");
            video.controls = true;
            card.appendChild(video);
            const bar = document.createElement("div");
            bar.className = "bar";
            bar.innerHTML = '<span class="muted" title="'+(v.name||"Video")+'" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:60%">'+(v.name||"Video")+'</span><button class="btn sm danger">× Remove</button>';
            card.appendChild(bar);
            bar.querySelector("button").addEventListener("click", ()=>deleteAsset(v, "video"));
            grid.appendChild(card);

            const assetPath = endpoints.getAssets(DATASET_ID)+"/"+encodeURIComponent(v.assetId);
            fetch(API+assetPath, { headers: authHeaders() })
              .then(r=> r.ok ? r.blob() : Promise.reject(new Error("Failed to load video")))
              .then(b=>{ video.src = URL.createObjectURL(b); });
          });
        }
        refreshCounters();
      }

      // Borrar archivos y videos
      function deleteAsset(asset, kind){
        const assetId =
          asset.assetId || asset.fileId || asset.videoId || asset._id || asset.id || asset.name;
        const statusEl = (kind === "video") ? "videoStatus" : "fileStatus";
        if (!assetId) { setText(statusEl, "Missing asset id"); return; }

        setText(statusEl, "Removing…");

        const tries = [
          endpoints.delAssetApi(DATASET_ID, assetId),
          endpoints.delAssetNoApi(DATASET_ID, assetId),
          kind === "video"
            ? endpoints.delVideoApi(DATASET_ID, assetId)
            : endpoints.delFileApi(DATASET_ID, assetId)
        ];

        (function attempt(i){
          if (i >= tries.length) {
            setText(statusEl, "Failed to remove (no matching endpoint)"); return;
          }
          apiDelete(tries[i])
            .then(() => Promise.all([reloadAssets(), apiGet(endpoints.getDataset(DATASET_ID))]))
            .then(([_, dsFresh]) => {
              DS = Object.assign({}, DS, dsFresh);
              setText("dsDates", "Created " + fmtDate(DS.createdAt) + " • Last update " + fmtDate(DS.updatedAt));
              setText(statusEl, "Removed ✔");
              setTimeout(() => setText(statusEl, ""), 1200);
            })
            .catch(() => attempt(i+1));
        })(0);
      }

      function renderStagedFiles(){
        const box = $("fileChips"); 
        box.innerHTML = "";
        if (!staged.files.length){
          box.innerHTML = '<span class="muted">No files selected</span>';
          refreshCounters();
          return;
        }
        staged.files.forEach((f,i)=>{
          const chip = document.createElement("div");
          chip.className = "chip-item";
          chip.innerHTML =
            '<span class="pill">'+extOfName(f.name||"")+'</span>' +
            '<span class="name" title="'+f.name+'">'+f.name+'</span>' +
            '<button title="remove">×</button>';
          chip.querySelector("button").addEventListener("click", ()=>{
            staged.files.splice(i,1);
            renderStagedFiles();
            refreshCounters();
          });
          box.appendChild(chip);
        });
        refreshCounters();
      }

      function renderStagedVideos(){
        const box = $("videoGridNew"); box.innerHTML = "";
        if (!staged.videos.length){ box.innerHTML = '<span class="muted">No videos selected</span>'; refreshCounters(); return; }
        staged.videos.forEach((v,i)=>{
          const card = document.createElement("div");
          card.className = "video-card";
          const url = URL.createObjectURL(v);
          card.innerHTML = '<video src="'+url+'" controls></video><div class="bar"><span class="muted" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:60%">'+(v.name||"Video")+'</span><button class="btn sm danger">×</button></div>';
          card.querySelector("button").addEventListener("click", ()=>{
            URL.revokeObjectURL(url);
            staged.videos.splice(i,1); renderStagedVideos(); refreshCounters();
          });
          box.appendChild(card);
        });
        refreshCounters();
      }

      // Para cargar los archivos y videos
      function uploadStaged(kind){
        const list = staged[kind];
        if (!list.length) return Promise.resolve();

        const fd = new FormData();
        if (kind === "files") list.forEach(f => fd.append("files", f, f.name));
        else                  list.forEach(v => fd.append("videos", v, v.name));

        const statusEl = (kind === "files") ? "fileStatus" : "videoStatus";
        setText(statusEl, "Uploading " + list.length + " " + kind + "…");

        return apiUpload(endpoints.uploadAssets(DATASET_ID), fd)
          .then(() => reloadAssets())
          .then(() => {
            setText(statusEl, "Uploaded ✔");
            if (kind === "files"){ staged.files.length = 0; renderStagedFiles(); }
            else                 { staged.videos.length = 0; renderStagedVideos(); }
            setTimeout(() => setText(statusEl, ""), 1200);
          })
          .catch(e => { setText(statusEl, e.message || "Upload failed"); throw e; });
      }

      // Cargar los archivos y videos
      function reloadAssets(){
        return apiGet(endpoints.getAssets(DATASET_ID))
          .then(list=>{
            existing.files  = Array.isArray(list.files)  ? list.files  : [];
            existing.videos = Array.isArray(list.videos) ? list.videos : [];
            renderExistingFiles();
            renderExistingVideos();
          })
          .catch(()=>{
            existing.files  = Array.isArray(DS?.files)  ? DS.files.map(x=>({ ...x, assetId: x.assetId||x.fileId||x._id||x.id||x.name })) : [];
            existing.videos = Array.isArray(DS?.videos) ? DS.videos.map(x=>({ ...x, assetId: x.assetId||x.videoId||x._id||x.id||x.name })) : [];
            renderExistingFiles();
            renderExistingVideos();
          });
      }

      // Ver lista y guardar cambios
      function wireBasics(){
        $("nameInput").addEventListener("input", e=>{
          $("dsNamePreview").textContent = e.target.value || "—";
          if (!($("avatarInput").value||"").trim()){
            $("dsAvatar").src = initialsAvatar(e.target.value || "Dataset");
          }
        });
        $("avatarInput").addEventListener("input", e=>{
          const url = (e.target.value||"").trim();
          $("dsAvatar").src = url || initialsAvatar($("nameInput").value || "Dataset");
        });
        $("dsAvatar").addEventListener("error", function(){
          this.onerror=null; this.src = initialsAvatar($("nameInput").value || "Dataset");
        });

        $("btnSave").addEventListener("click", ()=>{
          // Para guardar se ocupa tener al menos un archivo
          if ((existing.files.length + staged.files.length) === 0){
            setText("saveStatus", "You must have at least one file (not video) before saving.");
            return;
          }

          const name = ($("nameInput").value||"").trim();
          const description = ($("descInput").value||"").trim();
          const avatarUrl = ($("avatarInput").value||"").trim();
          const datasetAvatarUrl = avatarUrl || initialsAvatar(name || "Dataset");

          setText("saveStatus","Saving…");

          // Si hay cambios, se guardan
          const maybeUpload = () => {
            if (!staged.files.length && !staged.videos.length) return Promise.resolve();
            const fd = new FormData();
            staged.files.forEach(f => fd.append("files",  f, f.name));
            staged.videos.forEach(v => fd.append("videos", v, v.name));
            return apiUpload(endpoints.uploadAssets(DATASET_ID), fd)
              .then(() => { staged.files.length=0; staged.videos.length=0; renderStagedFiles(); renderStagedVideos(); return reloadAssets(); });
          };

          // Guardar los datos
          maybeUpload()
          .then(() => apiPut(endpoints.putMeta(DATASET_ID), { name, description, datasetAvatarUrl }))
          .then(() => apiGet(endpoints.getDataset(DATASET_ID)))
          .then(dsFresh => {
            DS = { ...DS, ...dsFresh };
            setText("dsDates", "Created " + fmtDate(DS.createdAt) + " • Last update " + fmtDate(DS.updatedAt));
            setText("saveStatus", "Saved ✔" + (DS.status ? " (status: " + DS.status + ")" : ""));
            setTimeout(gotoDetailReplace, 300);
          })
          .catch(e => setText("saveStatus", e.message || "Failed to save"));
        });

        function gotoDetailReplace() {
          const url = '/datasets/' + encodeURIComponent(DATASET_ID);
          location.replace(url);
        }

        ["btnCancel","backBtn"].forEach(id=>{
          const el = document.getElementById(id);
          if (!el) return;
          el.addEventListener('click', (e)=>{
            e.preventDefault();
            gotoDetailReplace();
          });
        });
      }

      function wireAdders(){
        $("fileInput").addEventListener("change", e=>{
          let picked = Array.from(e.target.files || []);
          if (!picked.length) return;

          // Archivos
          picked = picked.filter(f => !isVideoByMime(f) && !isVideoByExt(f.name));
          if (!picked.length){ setText("fileStatus","No valid non-video files selected."); e.target.value=""; return; }

          staged.files.push(...picked);
          renderStagedFiles();
          if (!guardNewUploadsTotalOrWarn("files")){
            staged.files.splice(-picked.length, picked.length);
            renderStagedFiles();
          }
          e.target.value = "";
        });

        $("videoInput").addEventListener("change", e=>{
          let picked = Array.from(e.target.files || []);
          if (!picked.length) return;

          // Videos
          picked = picked.filter(f => isVideoByMime(f) || isVideoByExt(f.name));
          if (!picked.length){ setText("videoStatus","No valid videos selected."); e.target.value=""; return; }

          staged.videos.push(...picked);
          renderStagedVideos();
          if (!guardNewUploadsTotalOrWarn("videos")){
            staged.videos.splice(-picked.length, picked.length);
            renderStagedVideos();
          }
          e.target.value = "";
        });
      }

      // Correr todo
      ensureToken();
      DATASET_ID = idFromPath();
      if (!DATASET_ID){ alert("Missing dataset id in URL"); return; }
      setText("saveStatus","Loading…");
      $("backBtn").href = "/datasets/" + encodeURIComponent(DATASET_ID);
      $("btnCancel").href = "/datasets/" + encodeURIComponent(DATASET_ID);

      apiGet(endpoints.getDataset(DATASET_ID))
        .then(ds=>{
          DS = ds;
          renderBasics(ds);
          return reloadAssets();
        })
        .then(()=>{
          wireBasics();
          wireAdders();
          setText("saveStatus","");
        })
        .catch(e=> setText("saveStatus", e.message||"Failed to load"));
    })();
    </script>
  </body>
  </html>
  `;
};

export default datasetEdit;
