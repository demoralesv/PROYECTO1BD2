const profile = () => {
  return `
  <!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>App • Dashboard</title>
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
        }
        @media (max-width: 900px){
          .page{grid-template-columns:1fr}
        }

        // Ventana del perfil
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
        .col-name{width:60%}
        .col-votes{width:20%}
        .col-actions{width:20%; text-align:right}
        .empty-row td{
          text-align:center; color:var(--muted); font-style:italic;
        }
      </style>
    </head>
    <body>
      <header class="topbar">
        <div class="brand">
          <span class="logo"></span>
          <span>Site Name</span>
        </div>

        <div class="search-wrap">
          <input id="q" class="input" placeholder="Search people or datasets…" />
          <button id="btnSearch" class="btn">Search</button>
        </div>

        <div class="top-actions">
          <a id="btnMessages" class="btn">Messages</a>
          <button id="btnMyProfile" class="btn icon" title="My profile">🏠</button>
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
            </div>
          </div>
          <div class="divider"></div>
          <div class="kv">
            <span class="muted">Files</span><span id="statFiles">0</span>
            <span class="muted">Followers</span><span id="statFollowers">0</span>
            <span class="muted">Following</span><span id="statFollowing">0</span>
          </div>
          <div class="divider"></div>
          <button id="btnEdit" class="btn">Edit Profile</button>
        </aside>

        <section class="card panel">
          <div class="row" style="margin-bottom:10px">
            <h3>My Datasets</h3>
            <span class="muted" id="status"></span>
          </div>

          <!-- Purely visual table: no data management yet -->
          <table class="table" aria-label="My files">
            <thead>
              <tr>
                <th class="col-name">Dataset name</th>
                <th class="col-votes">Votes</th>
                <th class="col-actions">Action</th>
              </tr>
            </thead>
            <tbody id="filesBody">
              <tr class="empty-row">
                <td colspan="3">No datasets yet</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>

      <script>
        (function(){
          var API = "http://localhost:3000";

          function authHeaders(){
            var t = localStorage.getItem("token");
            return t ? { "Authorization": "Bearer " + t } : {};
          }

          function ensureTokenOrRedirect(){
            if(!localStorage.getItem("token")){
              window.location.replace("/");
            }
          }

          function setText(id, text){
            var el = document.getElementById(id);
            if(el) el.textContent = text;
          }
          function $(id){ return document.getElementById(id); }

          function apiGet(path){
            return fetch(API + path, { headers: Object.assign({ "Content-Type":"application/json" }, authHeaders()) })
              .then(function(res){
                if(!res.ok){
                  return res.json().catch(function(){ return {}; }).then(function(data){
                    throw new Error(data.error || (res.status + " " + res.statusText));
                  });
                }
                return res.json();
              });
          }

          function fmtDate(s) {
            if (!s) return "—";
            const d = new Date(s);
            return d.toISOString().split("T")[0];
           }

          function renderProfile(p){
            var avatar = p && p.avatarUrl ? p.avatarUrl
              : "https://api.dicebear.com/8.x/initials/svg?seed=" + encodeURIComponent((p && (p.fullName || p.username)) || "User");
            $("avatar").src = avatar;
            setText("fullName", (p && p.fullName) || "—");
            setText("username", p && p.username ? "@"+p.username : "—");
            setText("dob", "Birth date: " + (p && p.dob ? fmtDate(p.dob) : "—"));
            setText("statFiles", 0);
            setText("statFollowers", 0);
            setText("statFollowing", 0);
          }

          function loadAll(){
            setText("status", "Loading…");
            // Only fetch the profile for now
            apiGet("/me")
              .then(function(me){
                renderProfile(me);
                setText("status", "");
              })
              .catch(function(e){
                setText("status", e.message);
              });
          }

          // Mostrar barra de arriba
          $("btnMessages").addEventListener("click", function(){
            window.location.href = "/messages.html";
          });
          $("btnMyProfile").addEventListener("click", function(){
            loadAll();
          });
          $("btnSearch").addEventListener("click", function(){
            // intentionally no-op for now
          });
          $("btnBackLogin").addEventListener("click", function(){
            window.location.href = "/";
          });

          ensureTokenOrRedirect();
          loadAll();
        })();
      </script>
    </body>
  </html>
  `;
};

export default profile;
