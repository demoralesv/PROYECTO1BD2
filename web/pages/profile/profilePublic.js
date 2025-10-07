const profilePublic = () => {
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

        .profile{padding:18px}
        .avatar{
          width:96px; height:96px; border-radius:16px; background:#0f141a; object-fit:cover; display:block
        }
        .profile h2{margin:12px 0 4px}
        .grid{display:grid; gap:8px}
        .row{display:flex; gap:8px; align-items:center; justify-content:space-between}
        .kv{display:grid; grid-template-columns:110px 1fr; gap:6px; align-items:center}
        .divider{height:1px; background:#0e1218; margin:10px 0}

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
        .col-name   { width: 50%; }
        .col-status { width: 22%; }
        .col-votes  { width: 20%; white-space: nowrap; }
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
          <button id="btnHome" class="btn icon" title="Home">🏠</button>
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
            <span class="muted">Datasets</span><span id="statFiles">0</span>
            <a href="/followers" style="text-decoration:none"><span class="muted">Followers</span></a> <span id="statFollowers">0</span>
            <a href="/following" style="text-decoration:none"><span class="muted">Following</span></a> <span id="statFollowing">0</span>
          </div>
          <div class="divider"></div>
          <div class="row" id="ownActions" style="display:none; gap:8px">
            <button id="btnEdit" class="btn">Edit Profile</button>
            <button id="btnAddDatasetSide" class="btn">Add dataset</button>
          </div>
          <div class="row" id="otherActions" style="display:none; gap:8px">
            <button id="btnFollow" class="btn primary">Follow</button>
            <button id="btnUnfollow" class="btn" style="display:none">Unfollow</button>
            <button id="btnMessage" class="btn">Message</button>
          </div>
        </aside>

        <section class="card panel">
          <div class="row" style="margin-bottom:10px">
            <h3 id="datasetsTitle">User Datasets</h3>
            <div class="row" style="gap:8px; align-items:center">
              <span class="muted" id="status"></span>
              <button id="btnAddDataset" class="btn primary sm">Add dataset</button>
            </div>
          </div>

          <table class="table" aria-label="User files">
            <thead>
              <tr>
                <th class="col-name">Dataset name</th>
                <th style="width:20%">Status</th>
                <th class="col-votes">Avg rating</th>
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

          // Helpers
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
          function apiRequest(method, path, body){
            return fetch(API + path, {
              method: method,
              headers: Object.assign({ "Content-Type":"application/json" }, authHeaders()),
              body: body ? JSON.stringify(body) : undefined
            }).then(function(res){
              if (res.status === 204) return {};
              if (!res.ok) {
                return res.json().catch(function(){return {};})
                  .then(function(data){ throw new Error(data.error || (res.status + " " + res.statusText)); });
              }
              return res.json().catch(function(){return {};});
            });
          }
          function apiGet(path){ return apiRequest("GET", path); }
          function apiPost(path, body){ return apiRequest("POST", path, body); }
          function apiDelete(path){ return apiRequest("DELETE", path); }
          function fmtDateISO(s){
            if (!s) return "—";
            var d = new Date(s);
            return isNaN(d.getTime()) ? "—" : d.toISOString().split("T")[0];
          }
          function initialsAvatar(seed){
            var s = encodeURIComponent((seed || "User").trim() || "User");
            return "https://api.dicebear.com/8.x/initials/svg?seed=" + s;
          }

         
          function getTargetUsername(){
            var u = new URL(window.location.href);
            var q = u.searchParams.get("u");
            if (q) return q.trim();

            var path = u.pathname.replace(/\\/+$/, "");
            var m = path.match(/^\\/(?:u|profile)\\/([^\\/]+)$/i);
            if (m && m[1]) return decodeURIComponent(m[1]);

            // fallback: no username provided
            return null;
          }

          // Fetch current user (me) and a user by username
          function fetchMe(){
            return apiGet("/me");
          }
          async function fetchUserByUsername(username){
            var candidates = [
              "/users/" + encodeURIComponent(username),
              "/user/" + encodeURIComponent(username),
              "/profiles/" + encodeURIComponent(username),
              "/users?username=" + encodeURIComponent(username)
            ];
            for (const p of candidates){
              try {
                var r = await apiGet(p);
                if (r && r.user) return r.user;
                if (Array.isArray(r)) return r[0] || null;
                return r || null;
              } catch(e){
                if ((e.message||"").startsWith("404")) continue;
                throw e;
              }
            }
            throw new Error("User not found");
          }

          // Datasets of a user by username
          async function fetchUserDatasets(username){
            var candidates = [
              "/datasets?owner=" + encodeURIComponent(username)+
    "&status=" + encodeURIComponent("approved"),
              "/datasets?user=" + encodeURIComponent(username)+
    "&status=" + encodeURIComponent("approved"),
              "/datasets?username=" + encodeURIComponent(username)+
    "&status=" + encodeURIComponent("approved")
            ];
            for (const p of candidates){
              try {
                var r = await apiGet(p);
                return (r && (r.items || r.data || r)) || [];
              } catch(e){
                if ((e.message||"").startsWith("404")) continue;
                throw e;
              }
            }
            return [];
          }

          // Follow / Unfollow
          async function follow(username){
            var routes = [
              "/following/" + encodeURIComponent(username),
              "/me/following/" + encodeURIComponent(username)
            ];
            for (const p of routes){
              try { await apiPost(p, {}); return true; }
              catch(e){ if ((e.message||"").startsWith("404")) continue; throw e; }
            }
            throw new Error("Follow endpoint not found");
          }
          async function unfollow(username){
            var routes = [
              "/following/" + encodeURIComponent(username),
              "/me/following/" + encodeURIComponent(username)
            ];
            for (const p of routes){
              try { await apiDelete(p); return true; }
              catch(e){ if ((e.message||"").startsWith("404")) continue; throw e; }
            }
            throw new Error("Unfollow endpoint not found");
          }

          // Render
          function renderProfile(p){
            var avatar = (p && p.avatarUrl)
              ? p.avatarUrl
              : initialsAvatar((p && (p.fullName || p.username)) || "User");
            var fullName = (p && (p.fullName || p.fullname)) || "—";
            var username = (p && p.username) || "";
            var dob = (p && p.dob) ? fmtDateISO(p.dob) : "—";
            

            var img = $("avatar"); if (img) img.src = avatar;
            setText("fullName", fullName);
            setText("username", username ? "@"+username : "—");
            setText("dob", "Birth date: " + dob);
            
          }

          function pillHtml(s){
            var st = (s||'pending').toLowerCase();
            var label = st==='submitted'?'Submitted':st==='approved'?'Approved':st==='declined'?'Declined':'Pending submission';
            return '<span class="pill '+st+'">'+label+'</span>';
          }

          function renderDatasets(items){
            var tbody = $("filesBody");
            if (!tbody) return;
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
              const avg = Number.isFinite(ds.ratingAvg) ? Number(ds.ratingAvg) : 0;
              const cnt = num(ds.ratingCount);
              const ratingCell = cnt ? avg.toFixed(1) + " (" + cnt + ")" : "—";
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
                '<td class="col-votes">' + ratingCell + '</td>' +
                '<td class="col-actions">' +
                  '<button class="btn sm" data-id="' + (ds.datasetId || ds.id || ds._id || "") + '" data-action="view">View</button>' +
                '</td>';
              tbody.appendChild(tr);
            });

            Array.prototype.forEach.call(
              tbody.querySelectorAll('button[data-action="view"]'),
              function(btn){
                btn.addEventListener("click", function(){
                  var id = btn.getAttribute("data-id");
                  if (id) window.location.href = "/datasets/" + encodeURIComponent(id);
                });
              }
            );
          }

          function setOwnMode(isOwn){
            $("ownActions").style.display = isOwn ? "flex" : "none";
            $("btnAddDataset").style.display = isOwn ? "inline-flex" : "none";
            $("otherActions").style.display = isOwn ? "none" : "flex";
            $("datasetsTitle").textContent = isOwn ? "My Datasets" : "User Datasets";
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
          // Boot
          async function loadAll(){
            setText("status", "Loading…");
            try{
              const me = await fetchMe();                  
              const target = getTargetUsername();
              const isOwn = !target || (target === me.username);
              let viewed = null;

              if (isOwn){
                viewed = me;
              } else {
                viewed = await fetchUserByUsername(target);
              }

              renderProfile(viewed);
              setOwnMode(isOwn);

              
              setText("statFollowers", num(viewed && viewed.stats && viewed.stats.followers));
              setText("statFollowing", num(viewed && viewed.stats && viewed.stats.following));

              // datasets del dueño
              const ownerUsername = viewed.username || target || "";
              const ds = isOwn
                ? await apiGet("/datasets?mine=true")
                : await fetchUserDatasets(ownerUsername);
              const items = (ds && (ds.items || ds.data || ds)) || [];
              renderDatasets(items);
              setText("statFiles", items.length || 0);
              setText("status", "");
              
              // follow/unfollow state
              if (!isOwn){
                $("btnFollow").style.display = "inline-flex";
                $("btnUnfollow").style.display = "none";

                $("btnFollow").onclick = async function(){
                  $("btnFollow").disabled = true;
                  try { await follow(ownerUsername);
                    $("btnFollow").style.display = "none";
                    $("btnUnfollow").style.display = "inline-flex";
                  } catch(e){ alert(e.message || "Cannot follow"); }
                  $("btnFollow").disabled = false;
                };
                $("btnUnfollow").onclick = async function(){
                  $("btnUnfollow").disabled = true;
                  try { await unfollow(ownerUsername);
                    $("btnUnfollow").style.display = "none";
                    $("btnFollow").style.display = "inline-flex";
                  } catch(e){ alert(e.message || "Cannot unfollow"); }
                  $("btnUnfollow").disabled = false;
                };
                $("btnMessage").onclick = function(){
                  window.location.href = "/messages.html?to=" + encodeURIComponent(ownerUsername);
                };
              } else {
                // acciones propias
                var goNew = function(){ window.location.href = "/datasets/new"; };
                $("btnAddDataset").onclick = goNew;
                $("btnAddDatasetSide").onclick = goNew;
                $("btnEdit").onclick = function(){ window.location.href = "/profile/edit"; };
              }
            }catch(e){
              setText("status", e.message || "Failed to load profile");
              renderDatasets([]);
            }
          }

          // Topbar
          $("btnHome").addEventListener("click", function(){ window.location.href = "/home"; });
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

          ensureTokenOrRedirect();
          loadAll();
        })();
      </script>
    </body>
  </html>
  `;
};
export default profilePublic;
