const home = () => {
  return `
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>Home</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
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

        /* Topbar */
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

        /* Centered page panel */
        .page{
          min-height:calc(100vh - 60px);
          display:flex;
          align-items:center;
          justify-content:center;
          padding:32px;
        }
        .panel{
          padding:32px;
          width:100%;
          max-width:960px; /* bigger card */
        }

        /* Profile avatars */
        .avatar{
          width:96px; height:96px; border-radius:16px; background:#0f141a; object-fit:cover; display:block;
        }
        .avatar.small{
          width:32px; height:32px; border-radius:50%; display:block; object-fit:cover;
        }

        /* Table */
        .panel h3{margin:0 0 6px}
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
      <div class="topbar">
        <div class="brand">
          <span class="logo"></span>
          DataShare
        </div>

        <div class="search-wrap">
          <input id="q" class="input" type="text" placeholder="Search datasets..." />
          <button id="btnSearch" class="btn icon" title="Search"><span>🔍</span></button>
        </div>

        <div class="top-actions">
          <a href="/datasets/new" class="btn primary">Upload Dataset</a>
          <a href="/profile" class="btn icon" title="Profile">
            <img id="avatarTopbar" class="avatar small" alt="avatar" src="" />
          </a>
        </div>
      </div>

      <div class="page">
        <main class="panel card">
          <div style="display:flex; align-items:baseline; justify-content:space-between; gap:10px; margin-bottom:10px">
            <h3>Latest Datasets</h3>
            <span id="status" class="muted"></span>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th class="col-name">Name</th>
                <th class="col-votes">Votes</th>
                <th class="col-actions"></th>
              </tr>
            </thead>
            <tbody id="filesBody">
              <tr class="empty-row">
                <td colspan="3">Loading…</td>
              </tr>
            </tbody>
          </table>
        </main>
      </div>

      <script>
        (function () {
          var API = "http://localhost:3000";

          // helpers
          function $(id){ return document.getElementById(id); }
          function setText(id, text){ var el = $(id); if (el) el.textContent = text; }
          function authHeaders(){
            var t = localStorage.getItem("token");
            return t ? { "Authorization": "Bearer " + t } : {};
          }
          function ensureTokenOrRedirect(){
            if (!localStorage.getItem("token")) window.location.replace("/");
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
            return isNaN(d.getTime()) ? "—" : d.toISOString().split("T")[0];
          }

          function renderProfile(p){
            var avatar = (p && p.avatarUrl)
              ? p.avatarUrl
              : "https://api.dicebear.com/8.x/initials/svg?seed=" +
                encodeURIComponent((p && (p.fullName || p.username)) || "User");

           
            var big = $("avatar");
            if (big) big.src = avatar;

            var topbar = $("avatarTopbar");
            if (topbar) topbar.src = avatar;

            var setIf = function(id, txt){ var el=$(id); if(el) el.textContent = txt; };
            setIf("fullName", (p && p.fullName) || "—");
            setIf("username", p && p.username ? "@" + p.username : "—");
            setIf("dob", "Birth date: " + (p && p.dob ? fmtDateISO(p.dob) : "—"));
            setIf("role", "Role: " + (p && p.role ? p.role : "user"));
          }

          function renderDatasets(items){
            var tbody = $("filesBody");
            if (!tbody) return; // safety
            tbody.innerHTML = "";

            if (!items || items.length === 0) {
              var trEmpty = document.createElement("tr");
              trEmpty.className = "empty-row";
              trEmpty.innerHTML = '<td colspan="3">No datasets yet</td>';
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
                        (new Date(ds.updatedAt || Date.now())).toLocaleString() +
                      '</div>' +
                    '</div>' +
                  '</div>' +
                '</td>' +
                '<td class="col-votes">' + (ds.votes != null ? ds.votes : 0) + '</td>' +
                '<td class="col-actions">' +
                  '<a class="btn sm" href="/datasets/' + encodeURIComponent(ds.datasetId || ds.id) + '">View</a>' +
                '</td>';
              tbody.appendChild(tr);
            });
          }

          function loadAll(){
            setText("status", "Loading…");
            Promise.all([
              apiGet("/me"),
              apiGet("/datasetsApproved?status=submitted") // cambiar aqui para ver datasets aprobados
            ])
            .then(function(arr){
              var me = arr[0];
              var ds = arr[1];
              renderProfile(me);
              renderDatasets((ds && ds.items) || []);
              setText("status", "");
            })
            .catch(function(err){
              setText("status", err.message);
              renderDatasets([]);
            });
          }

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

          // boot
          ensureTokenOrRedirect();
          loadAll();
        })();
      </script>
    </body>
    </html>
  `;
};

export default home;
