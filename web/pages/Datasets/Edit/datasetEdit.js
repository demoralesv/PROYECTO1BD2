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
      .video-card{ border:1px solid var(--line); border-radius:10px; overflow:hidden; background:#0f1217; display:grid; gap:8px; padding:8px }
      .video-card .thumb{ width:100%; height:120px; background:#12161c; border-radius:8px; display:grid; place-items:center; font-size:.9rem; color:var(--muted) }

      /* Escoger archivos y videos */
      .file-area, .video-area{ height:190px; overflow:auto; border:1px solid var(--line); border-radius:10px; padding:10px; background:#0f1217 }
      .chip-list{ display:flex; flex-wrap:wrap; gap:8px }
      .chip-item{ display:flex; align-items:center; gap:8px; padding:6px 10px; border:1px solid var(--line); border-radius:10px; background:#0f1217; max-width:100% }
      .chip-item .name{ display:inline-block; max-width:min(40vw,280px); white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
      .pill{ font-size:.8rem; padding:2px 8px; border-radius:999px; border:1px solid var(--line); color:var(--muted) }

      .footer-actions{ display:flex; gap:10px; justify-content:flex-end; margin-top:10px }
      .help{ font-size:.9rem; color:var(--muted) }
      .status{ min-height:20px; color:var(--muted) }
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
      <!-- Panel izquierdo -->
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

      <!-- Editor del dataset -->
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
            <!-- existing uploaded files (removable) -->
            <div id="filesList" style="display:grid; gap:8px">
              <span class="muted">No files yet</span>
            </div>
            <div class="row">
              <label class="muted">Add more files (multiple)</label>
              <input id="fileInput" type="file" multiple />
            </div>
            <div class="file-area">
              <div id="fileChips" class="chip-list"></div>
            </div>
            <div id="fileStatus" class="status"></div>
          </div>

          <h3 class="section-title" style="margin-top:18px">Videos</h3>
          <div class="box" style="display:grid; gap:10px">
            <div id="videoGridExisting" class="video-grid"><span class="muted">No videos yet</span></div>
            <div class="row">
              <label class="muted">Add more videos (multiple)</label>
              <input id="videoInput" type="file" accept="video/*" multiple />
            </div>
            <div class="video-area">
              <div id="videoGridNew" class="video-grid"></div>
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

      // Ayudan a obtener info del usuario y dataset
      function authHeaders(){
        var t = localStorage.getItem("token");
        return t ? { "Authorization": "Bearer " + t } : {};
      }
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
          .then(r=> r.ok ? r.json() : r.text().then(t=>{throw new Error(t||r.statusText)}));
      }
      function apiDelete(path){
        return fetch(API + path, { method:"DELETE", headers: authHeaders() })
          .then(r=> r.ok ? (r.status===204?{}:r.json()) : r.json().then(d=>{throw new Error(d.error||r.statusText)}));
      }

      function $(id){ return document.getElementById(id); }
      function setText(id,v){ var el=$(id); if(el) el.textContent=v; }
      function ensureToken(){ if(!localStorage.getItem("token")) window.location.replace("/"); }
      function fmtDate(d){ try{ return new Date(d).toLocaleString(); } catch(_){ return d||"—"; } }
      function idFromPath(){ var p=location.pathname.split("/"); return p[2]||""; }
      function fileId(f){ return f._id || f.id || f.fileId || f.name; }
      function videoId(v){ return v._id || v.id || v.videoId || v.url; }
      function humanSize(n){
        if (n<1024) return n+" B";
        if (n<1024*1024) return (n/1024).toFixed(1)+" KB";
        if (n<1024*1024*1024) return (n/1024/1024).toFixed(1)+" MB";
        return (n/1024/1024/1024).toFixed(1)+" GB";
      }
      function extOfName(name){ const dot=name.lastIndexOf("."); return dot>0? name.slice(dot+1).toUpperCase() : "FILE"; }
      function initialsAvatar(seed){ return "https://api.dicebear.com/8.x/initials/svg?seed=" + encodeURIComponent(seed||"Dataset"); }

      // Estado de las casillas
      var DS = null;
      var DATASET_ID = "";
      var uploading = { files:false, videos:false };

      // Mostrar en la página
      function renderBasics(ds){
        const effective = (ds.datasetAvatarUrl && ds.datasetAvatarUrl.trim()) || "";
        $("dsAvatar").src = effective || initialsAvatar(ds.name || "Dataset");
        $("dsAvatar").onerror = function(){ this.onerror=null; this.src = initialsAvatar($("nameInput").value || ds.name || "Dataset"); };

        $("dsNamePreview").textContent = ds.name || "—";
        setText("dsDates", "Created " + fmtDate(ds.createdAt) + " • Last update " + fmtDate(ds.updatedAt));

        $("nameInput").value = ds.name || "";
        $("descInput").value = ds.description || "";
        $("avatarInput").value = effective;
      }

      function fileLabel(f){
        const name = f.name || "unnamed";
        const t = f.type || extOfName(name);
        const size = f.size!=null ? (" • " + humanSize(f.size)) : "";
        return '<span class="muted" style="font-size:.85rem">'+t+'</span> <span class="name" title="'+name+'">'+name+'</span><span class="muted">'+size+'</span>';
      }

      function renderFiles(ds){
        const list = $("filesList");
        list.innerHTML = "";
        if (!ds.files || !ds.files.length){
          list.innerHTML = '<span class="muted">No files yet</span>';
          return;
        }
        ds.files.forEach(f=>{
          const row = document.createElement("div");
          row.className = "file-row";
          row.innerHTML =
            '<div>'+fileLabel(f)+'</div>' +
            '<div style="display:flex; gap:8px">' +
              (f.url ? '<a class="btn sm" href="'+f.url+'" target="_blank">Open</a>' : '') +
              '<button class="btn sm danger" data-del="'+fileId(f)+'">Remove</button>' +
            '</div>';
          row.querySelector("[data-del]").addEventListener("click", ()=>{
            setText("fileStatus","Removing…");
            apiDelete('/api/datasets/'+encodeURIComponent(DATASET_ID)+'/files/'+encodeURIComponent(fileId(f)))
              .then(resp=>{
                if (resp.dataset) DS = resp.dataset;
                else if (resp.files) DS.files = resp.files;
                else return apiGet('/api/datasets/'+encodeURIComponent(DATASET_ID)).then(x=>{ DS=x; });
              })
              .then(()=>{ renderFiles(DS); setText("fileStatus","Removed ✔"); setTimeout(()=>setText("fileStatus",""),1200); })
              .catch(e=> setText("fileStatus", e.message));
          });
          list.appendChild(row);
        });
      }

      function renderVideosExisting(ds){
        const grid = $("videoGridExisting");
        grid.innerHTML = "";
        if (!ds.videos || !ds.videos.length){
          grid.innerHTML = '<span class="muted">No videos yet</span>';
          return;
        }
        ds.videos.forEach(v=>{
          const card = document.createElement("div");
          card.className = "video-card";
          const label = v.title || v.name || v.url || "Video";
          const thumbHtml = v.thumbUrl
            ? '<img class="thumb" src="'+v.thumbUrl+'" alt="thumb" />'
            : '<div class="thumb">No preview</div>';
          card.innerHTML =
            thumbHtml +
            '<div class="muted" title="'+label+'" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis">'+label+'</div>' +
            '<div style="display:flex; gap:8px">' +
              (v.url ? '<a class="btn sm" href="'+v.url+'" target="_blank">Open</a>' : '') +
              '<button class="btn sm danger" data-vdel="'+videoId(v)+'">Remove</button>' +
            '</div>';
          card.querySelector("[data-vdel]").addEventListener("click", ()=>{
            setText("videoStatus","Removing…");
            apiDelete('/api/datasets/'+encodeURIComponent(DATASET_ID)+'/videos/'+encodeURIComponent(videoId(v)))
              .then(resp=>{
                if (resp.dataset) DS = resp.dataset;
                else if (resp.videos) DS.videos = resp.videos;
                else return apiGet('/api/datasets/'+encodeURIComponent(DATASET_ID)).then(x=>{ DS=x; });
              })
              .then(()=>{ renderVideosExisting(DS); setText("videoStatus","Removed ✔"); setTimeout(()=>setText("videoStatus",""),1200); })
              .catch(e=> setText("videoStatus", e.message));
          });
          grid.appendChild(card);
        });
      }

      // Eventos en la página
      function wireBasics(){
        $("nameInput").addEventListener("input", e=>{
          $("dsNamePreview").textContent = e.target.value || "—";
          // if avatar URL is empty, keep initials in sync with new name
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
          const name = ($("nameInput").value||"").trim();
          const description = ($("descInput").value||"").trim();
          const avatarUrl = ($("avatarInput").value||"").trim();
          const datasetAvatarUrl = avatarUrl || initialsAvatar(name || "Dataset"); // persist initials-based URL if empty
          setText("saveStatus","Saving…");
          apiPut('/api/datasets/'+encodeURIComponent(DATASET_ID), { name, description, datasetAvatarUrl })
            .then(resp=>{
              setText("saveStatus","Saved ✔ (status: "+(resp.status||"pending")+")");
              setTimeout(()=>{ window.location.href = '/datasets/'+encodeURIComponent(DATASET_ID); }, 600);
            })
            .catch(e=> setText("saveStatus", e.message));
        });

        $("btnCancel").addEventListener("click", ()=>{ window.location.href = '/datasets/'+encodeURIComponent(DATASET_ID); });
        $("backBtn").addEventListener("click",  ()=>{ window.location.href = '/datasets/'+encodeURIComponent(DATASET_ID); });
      }

      // Agregar más archivos
      function renderFileChips(staged){
        const box = $("fileChips"); box.innerHTML = "";
        if (!staged.length){ box.innerHTML = '<span class="muted">No files selected</span>'; return; }
        staged.forEach((f,i)=>{
          const chip = document.createElement("div");
          chip.className = "chip-item";
          const ext = extOfName(f.name||"");
          chip.innerHTML = '<span class="pill">'+ext+'</span><span class="name" title="'+f.name+'">'+f.name+'</span><button title="remove">×</button>';
          chip.querySelector("button").addEventListener("click", ()=>{
            staged.splice(i,1); renderFileChips(staged);
          });
          box.appendChild(chip);
        });
      }
      function wireAddFiles(){
        const staged = [];
        renderFileChips(staged);

        $("fileInput").addEventListener("change", e=>{
          const files = Array.from(e.target.files||[]);
          if (!files.length) return;
          setText("fileStatus","Uploading "+files.length+" file(s)…");
          // stage for UI, but also upload immediately
          staged.push(...files);
          renderFileChips(staged);

          const fd = new FormData();
          files.forEach(f=> fd.append("files", f));
          apiUpload('/api/datasets/'+encodeURIComponent(DATASET_ID)+'/files', fd)
            .then(resp=>{
              if (resp.dataset) DS = resp.dataset;
              else if (resp.files) DS.files = resp.files;
              else return apiGet('/api/datasets/'+encodeURIComponent(DATASET_ID)).then(x=>{ DS=x; });
            })
            .then(()=>{
              renderFiles(DS);
              setText("fileStatus","Uploaded ✔");
              // clear staged list (they’re now server-side)
              staged.length = 0; renderFileChips(staged);
              setTimeout(()=>setText("fileStatus",""),1200);
            })
            .catch(e=> setText("fileStatus", e.message))
            .finally(()=>{ e.target.value=""; });
        });
      }

      // Agregar más videos
      function renderVideoGridNew(staged){
        const box = $("videoGridNew"); box.innerHTML = "";
        if (!staged.length){ box.innerHTML = '<span class="muted">No videos selected</span>'; return; }
        staged.forEach((f,i)=>{
          const wrap = document.createElement("div");
          wrap.className = "video-card";
          const url = URL.createObjectURL(f);
          wrap.innerHTML = '<video src="'+url+'" controls style="width:100%; height:160px; object-fit:cover"></video><button class="btn sm danger" data-i="'+i+'">Remove</button>';
          wrap.querySelector("button").addEventListener("click", ()=>{
            URL.revokeObjectURL(url);
            staged.splice(i,1); renderVideoGridNew(staged);
          });
          box.appendChild(wrap);
        });
      }
      function wireAddVideos(){
        const staged = [];
        renderVideoGridNew(staged);

        $("videoInput").addEventListener("change", e=>{
          const vids = Array.from(e.target.files||[]);
          if (!vids.length) return;
          setText("videoStatus","Uploading "+vids.length+" video(s)…");
          staged.push(...vids);
          renderVideoGridNew(staged);

          const fd = new FormData();
          vids.forEach(v=> fd.append("videos", v));
          // NOTE: expects a multipart endpoint for videos
          apiUpload('/api/datasets/'+encodeURIComponent(DATASET_ID)+'/videos', fd)
            .then(resp=>{
              if (resp.dataset) DS = resp.dataset;
              else if (resp.videos) DS.videos = resp.videos;
              else return apiGet('/api/datasets/'+encodeURIComponent(DATASET_ID)).then(x=>{ DS=x; });
            })
            .then(()=>{
              renderVideosExisting(DS);
              setText("videoStatus","Uploaded ✔");
              staged.length = 0; renderVideoGridNew(staged);
              setTimeout(()=>setText("videoStatus",""),1200);
            })
            .catch(e=> setText("videoStatus", e.message))
            .finally(()=>{ e.target.value=""; });
        });
      }

      // Correr todo
      ensureToken();
      DATASET_ID = idFromPath();
      if (!DATASET_ID){ alert("Missing dataset id in URL"); return; }
      setText("saveStatus","Loading…");
      $("backBtn").href = "/datasets/" + encodeURIComponent(DATASET_ID);
      $("btnCancel").href = "/datasets/" + encodeURIComponent(DATASET_ID);

      apiGet('/api/datasets/'+encodeURIComponent(DATASET_ID))
        .then(ds=>{
          DS = ds;
          renderBasics(ds);
          renderFiles(ds);
          renderVideosExisting(ds);
          wireBasics();
          wireAddFiles();
          wireAddVideos();
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
