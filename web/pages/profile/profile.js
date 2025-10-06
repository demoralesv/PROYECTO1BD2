const profile = () => {
  return `
  <!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Profile</title>
      <style>
        :root{
          --bg:#0b0d10; --panel:#12161c; --muted:#9fb0c8;
          --line:#2a3340; --text:#e7eef7; --accent:#5aa9ff;
        }
        *{box-sizing:border-box}
        body{margin:0; font-family:system-ui,arial,segoe ui; background:var(--bg); color:var(--text)}
        a,button,input{font:inherit}
        .btn, .input{
          padding:10px 12px; border-radius:10px; border:1px solid var(--line);
          background:#0f1217; color:var(--text)
        }
        .btn{cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:8px}
        .btn.primary{background:#0f141c}
        .btn.icon{padding:8px 10px; border-radius:999px}
        .btn[disabled]{opacity:.5; cursor:not-allowed}
        .chip{padding:2px 8px; border:1px solid var(--line); border-radius:999px; font-size:.8rem; color:var(--muted)}
        .card{background:var(--panel); border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,.3)}
        .muted{color:var(--muted)}
        .ok{color:#8ef7a1} .err{color:#ff7b7b}

        /* Layout de la página */
        .topbar{
          position:sticky; top:0; z-index:20; backdrop-filter:saturate(1.2) blur(4px);
          display:flex; gap:12px; align-items:center; justify-content:space-between;
          padding:12px 18px; border-bottom:1px solid #0e1218; background:rgba(11,13,16,.6)
        }
        .brand{display:flex; align-items:center; gap:10px; font-weight:600}
        .brand .logo{width:28px; height:28px; border-radius:50%; background:#1a2230; display:inline-block}
        .top-actions{display:flex; gap:10px; align-items:center}
        .search-wrap{flex:1; display:flex; gap:8px; align-items:center; max-width:720px; margin:0 12px}
        .search-wrap input{flex:1}

        .page{
          max-width:1200px; margin:24px auto; padding:0 16px;
          display:grid; grid-template-columns:320px 1fr; gap:18px;
          align-items: start;
        }
        @media (max-width: 900px){
          .page{grid-template-columns:1fr}
        }
        .pill{
          display:inline-block;
          padding:2px 8px;
          border-radius:999px;
          font-size:.8rem;
          border:1px solid var(--line);
          white-space: nowrap;
          line-height: 1.2;
        }
        .pill.pending   { background: #0f141c; color: var(--text); border-color: var(--line); }      /* interface look */
        .pill.submitted { background: #3b2f0a; color: #f2c94c; border-color: #5a4a14; }              /* yellow-ish */
        .pill.approved  { background: #0f1a14; color: #27ae60; border-color: #1d6a3e; }              /* green */
        .pill.declined  { background: #1a0f10; color: #eb5757; border-color: #6a1f22; } 
        
        /* Ventana del perfil */
        .profile{padding:18px}
        .avatar{
          width:96px; height:96px; border-radius:16px; background:#0f141a; object-fit:cover; display:block
        }
        .profile h2{margin:12px 0 4px}
        .grid{display:grid; gap:8px}
        .row{display:flex; gap:8px; align-items:center; justify-content:space-between}
        .kv{display:grid; grid-template-columns:110px 1fr; gap:6px; align-items:center}
        .divider{height:1px; background:#0e1218; margin:10px 0}

        /* Tabla que contiene los datasets */
        .panel{padding:18px}
        .panel h3{margin:0 0 8px}

        .table{
          width:100%; border-collapse:separate; border-spacing:0; overflow:hidden;
          border:1px solid var(--line); border-radius:12px; background:#0f1217;
        }
        .table thead th{
          text-align:left; font-weight:600; padding:12px; border-bottom:1px solid var(--line);
        }
        .table tbody td{
          padding:12px; border-top:1px solid #0e1218;
        }
        .table tbody tr:first-child td{ border-top:none }
        .col-name   { width: 58%; }
        .col-status { width: 22%; }
        .col-votes  { width: 8%;  }
        .col-actions{ width: 12%; text-align:right; }
        .empty-row td{
          text-align:center; color:var(--muted); font-style:italic;
        }
      </style>
    </head>
    <body>
      <header class="topbar">
        <div class="brand">
          <span class="logo"></span>
          <span>Profile</span>
        </div>

        <div class="search-wrap">
          <input id="q" class="input" placeholder="Search people or datasets…" />
          <button id="btnSearch" class="btn">🔍</button>
        </div>

        <div class="top-actions">
          <a id="btnMessages" class="btn">Messages</a>
          <button id="btnHome" class="btn icon" title="Home">🏠</button>
          <button id="btnBackLogin" class="btn" title="Log out">Log Out</button>
        </div>
      </header>

      <main class="page">
        <aside class="card profile grid" id="profileCard">
          <div class="row">
            <img id="avatar" class="avatar" alt="avatar" src="" />
            <div class="grid" style="flex:1">
              <h2 id="fullName">—</h2>
              <span class="muted" id="username">@user</span>
              <span class="chip" id="dob">DOB—</span>
              <span class="chip" id="role">role</span>
            </div>
          </div>
          <div class="divider"></div>
          <div class="kv">
            <span class="muted">Datasets</span><span id="statFiles">0</span>
            <a href=/followers style="text-decoration:none"> <span class="muted">Followers </span></a> <span id="statFollowers">0</span>
            <a href=/following style="text-decoration:none"><span class="muted">Following</span></a> <span id="statFollowing">0</span>
          </div>
          <div class="divider"></div>
          <button id="btnEdit" class="btn">Edit Profile</button>
        </aside>

        <section class="card panel">
          <div class="row" style="margin-bottom:10px">
            <h3>My Datasets</h3>
            <div class="row" style="gap:8px; align-items:center">
              <span class="muted" id="status"></span>
              <button id="btnAddDataset" class="btn primary sm">Add dataset</button>
            </div>
          </div>

          <!-- Tabla de Datasets -->
          <table class="table" aria-label="My files">
            <thead>
              <tr>
                <th class="col-name">Dataset name</th>
                <th style="width:20%">Status</th>
                <th class="col-votes">Votes</th>
                <th class="col-actions">Action</th>
              </tr>
            </thead>
            <tbody id="filesBody">
              <tr class="empty-row">
                <td colspan="4">No datasets yet</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
      <script>
        (function () {
          var API = "http://localhost:3000";

          // Funciones de ayuda
          function $(id){ return document.getElementById(id); }
          function setText(id, text){ var el = $(id); if (el) el.textContent = text; }
          function authHeaders(){
            var t = localStorage.getItem("token");
            return t ? { "Authorization": "Bearer " + t } : {};
          }
          function ensureTokenOrRedirect(){
            if (!localStorage.getItem("token")) {
              window.location.replace("/");
            }
          }
          function apiGet(path){
            return fetch(API + path, {
              headers: Object.assign({ "Content-Type":"application/json" }, authHeaders())
            }).then(function(res){
              if (!res.ok) {
                return res.json().catch(function(){return {};})
                  .then(function(data){ throw new Error(data.error || (res.status + " " + res.statusText)); });
              }
              return res.json();
            });
          }
          function fmtDateISO(s){
            if (!s) return "—";
            var d = new Date(s);
            return d.toISOString().split("T")[0];
          }

          // Renders para la interfaz
          function renderProfile(p){
            var avatar = (p && p.avatarUrl)
              ? p.avatarUrl
              : "https://api.dicebear.com/8.x/initials/svg?seed=" + encodeURIComponent((p && (p.fullName || p.username)) || "User");
            $("avatar").src = avatar;
            setText("fullName", (p && p.fullName) || "—");
            setText("username", p && p.username ? "@" + p.username : "—");
            setText("dob", "Birth date: " + (p && p.dob ? fmtDateISO(p.dob) : "—"));
            setText("role", "Role: " + (p && p.role ? p.role : "user"));
          }

          function pillHtml(s){
            var st = (s||'pending').toLowerCase();
            var label = st==='submitted'?'Submitted':st==='approved'?'Approved':st==='declined'?'Declined':'Pending submission';
            return '<span class="pill '+st+'">'+label+'</span>';
          }

          function renderDatasets(items){
            var tbody = $("filesBody");
            tbody.innerHTML = "";

            if (!items || items.length === 0) {
              var trEmpty = document.createElement("tr");
              trEmpty.className = "empty-row";
              trEmpty.innerHTML = '<td colspan="4">No datasets yet</td>';
              tbody.appendChild(trEmpty);
              return;
            }

            items.forEach(function(ds){
              var tr = document.createElement("tr");
              tr.innerHTML =
                '<td class="col-name">' +
                  '<div style="display:flex; gap:10px; align-items:center">' +
                    '<div class="file-icon"></div>' +
                    '<div>' +
                      '<div style="font-weight:600">' + (ds.name || "Untitled dataset") + '</div>' +
                      '<div class="muted" style="font-size:.85rem">' +
                        new Date(ds.updatedAt || Date.now()).toLocaleString() +
                      '</div>' +
                    '</div>' +
                  '</div>' +
                '</td>' +
                '<td class="col-status">' + pillHtml(ds.status) + '</td>' +
                '<td class="col-votes">' + (ds.votes != null ? ds.votes : 0) + '</td>' +
                '<td class="col-actions">' +
                  '<button class="btn sm" data-id="' + (ds.datasetId || ds.id) + '" data-action="view">View</button>' +
                '</td>';
              tbody.appendChild(tr);
            });

            // Botones para ver los datasets
            Array.prototype.forEach.call(
              tbody.querySelectorAll('button[data-action="view"]'),
              function(btn){
                btn.addEventListener("click", function(){
                  var id = btn.getAttribute("data-id");
                  window.location.href = "/datasets/" + encodeURIComponent(id);
                });
              }
            );
          }
          function num(x){
            if (x == null) return 0;
            if (typeof x === "number") return x;
            if (typeof x.toNumber === "function") return x.toNumber(); // neo4j-int
            if (typeof x.low === "number") return x.low;               // neo4j {low,high}
            if (typeof x.count === "number") return x.count;           // {count:n}
            const n = Number(x);
            return Number.isFinite(n) ? n : 0;
          }
          // Cargar todo
          function loadAll(){
            setText("status", "Loading…");
            Promise.all([
              apiGet("/me"),
              apiGet("/datasets?mine=true")
            ])
            .then(function(arr){
              var me = arr[0];
              var ds = arr[1];
              renderProfile(me);
              renderDatasets((ds && ds.items) || []);
              setText("statFiles", (ds && (ds.total != null ? ds.total : (ds.items ? ds.items.length : 0))) || 0);
              setText("status", "");
              setText("statFollowers", num(me && me.stats && me.stats.followers));
              setText("statFollowing", num(me && me.stats && me.stats.following));
            })
            .catch(function(err){
              setText("status", err.message);
              renderDatasets([]);
            });
          }

          // Botones en la barra de arriba
          $("btnAddDataset").addEventListener("click", function(){
            window.location.href = "/datasets/new";
          });
          $("btnMessages").addEventListener("click", function(){
            window.location.href = "/chat";
          });
          $("btnEdit").addEventListener("click", function(){
            window.location.href = "/profile/edit";
          });
          $("btnHome").addEventListener("click", function(){
            window.location.href = "/home";
          });
           
          var btnSearch = $("btnSearch");
          var inputQ = $("q");

          if (btnSearch && inputQ) {
            btnSearch.addEventListener("click", function () {
              var q = (inputQ.value || "").trim();
              if (q) location.href = "/search?q=" + encodeURIComponent(q);
              else location.href = "/search";
            });

            inputQ.addEventListener("keydown", function (e) {
              if (e.key === "Enter") btnSearch.click();
            });
          }

          $("btnBackLogin").addEventListener("click", function(){
            localStorage.removeItem("token");
            window.location.href = "/";
          });

          // Iniciar
          ensureTokenOrRedirect();
          loadAll();
        })();
        </script>
    </body>
  </html>
  `;
};

export default profile;
