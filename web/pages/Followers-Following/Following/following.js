const following = () => {
  return `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Following</title>
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
        .brand .logo{width:28px; height:28px; border-radius:50%; background:#000; display:inline-block;background-image: url(https://cdn-icons-png.flaticon.com/512/18495/18495588.png);background-size: contain;}        .top-actions{display:flex; gap:10px; align-items:center}
    .top-actions{display:flex; gap:10px; align-items:center}

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
      max-width:960px;
    }

    /* Avatars */
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
    .col-username{width:20%}
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
      Following
    </div>
    <div class="top-actions">
      <a href="/profile" class="btn">Go back</a>
      <a href="/home" class="btn">Home</a>
    </div>
  </div>

  <div class="page">
    <div class="panel card">
      <div style="display:flex; align-items:baseline; justify-content:space-between; gap:10px; margin-bottom:10px">
        <h3>Your following</h3>
        <span id="status" class="muted"></span>
      </div>
      <table class="table" aria-label="Following">
        <thead>
          <tr>
            <th class="col-name">Name</th>
            <th class="col-username">Username</th>
            <th class="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody id="followingBody">
          <tr class="empty-row">
            <td colspan="3">Loading…</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <script>
    (function(){
      var API = "http://localhost:3000"; 

      // ===== Helpers
      function $(id){ return document.getElementById(id); }
      function setText(id, text){ var el=$(id); if(el) el.textContent=text; }
      function authHeaders(){
        var t = localStorage.getItem("token");
        return t ? { "Authorization": "Bearer " + t } : {};
      }
      function ensureTokenOrRedirect(){
        if(!localStorage.getItem("token")) window.location.replace("/");
      }
      function apiRequest(method, path, body){
        return fetch(API + path, {
          method: method,
          headers: Object.assign({ "Content-Type":"application/json" }, authHeaders()),
          body: body ? JSON.stringify(body) : undefined
        }).then(function(res){
          if(res.status === 204) return {};
          if(!res.ok){
            return res.json().catch(function(){return {};})
              .then(function(data){ throw new Error(data.error || (res.status + " " + res.statusText)); });
          }
          return res.json().catch(function(){return {};});
        });
      }
      function apiGet(path){ return apiRequest("GET", path); }
      function apiDelete(path){ return apiRequest("DELETE", path); }

      function initialsAvatar(seed){
        var s = encodeURIComponent((seed || "User").trim() || "User");
        return "https://api.dicebear.com/8.x/initials/svg?seed=" + s;
      }

      function normalizeUser(u){
        if(!u || typeof u !== "object") return { id:null, fullName:"—", username:"", avatarUrl:initialsAvatar("User") };
        var id = u.id || u._id || u.userId || null;
        var fullName = (u.fullName || u.name || "").trim();
        var username = (u.username || "").trim();
        var avatarUrl = (u.avatarUrl && String(u.avatarUrl).trim()) || initialsAvatar(fullName || username || "User");
        return { id, fullName: fullName || (username ? "@"+username : "—"), username, avatarUrl };
      }

        // Fetch following: try multiple GET routes
      async function fetchFollowing(){
        var candidates = [
          "/me/following",
          "/following?of=me",
          "/following"
        ];
        let last404 = null;
        for (const p of candidates){
          try {
            const res = await apiGet(p);
            const list = (res && (res.items || res.data || res)) || [];
            return Array.isArray(list) ? list : [];
          } catch(e){
            if ((e.message||"").startsWith("404")) { last404 = e; continue; }
            throw e;
          }
        }
        throw last404 || new Error("following endpoint not found.");
      }

      // Remove following: try DELETE routes
      async function removeFollowingById(userId){
        if(!userId) throw new Error("Missing following id.");
        const routes = [
          "/me/following/" + encodeURIComponent(userId),
          "/following/" + encodeURIComponent(userId),
        ];
        let last404 = null;
        for (const r of routes){
          try { await apiDelete(r); return true; }
          catch(e){
            if ((e.message||"").startsWith("404")) { last404 = e; continue; }
            throw e;
          }
        }
        throw last404 || new Error("Remove following endpoint not found.");
      }

      function renderFollowing(rawItems){
        var tbody = $("followingBody");
        if(!tbody) return;
        tbody.innerHTML = "";

        
        var items = rawItems.map(function(it){
          var u = it && (it.following || it.user || it.owner || it.account || it);
          var normalized = normalizeUser(u);
          return { rowId: (it.id || it._id || normalized.id), user: normalized };
        });

        if (items.length === 0){
          var tr = document.createElement("tr");
          tr.className = "empty-row";
          tr.innerHTML = '<td colspan="3">No following yet</td>';
          tbody.appendChild(tr);
          return;
        }

        items.forEach(function(it){
          var u = it.user;
          var tr = document.createElement("tr");
          tr.innerHTML =
            '<td>' +
              '<div style="display:flex;align-items:center;gap:10px;">' +
                '<img src="'+ u.avatarUrl +'" class="avatar small" alt="User"/>' +
                '<span>'+ (u.fullName || "—") +'</span>' +
              '</div>' +
            '</td>' +
            '<td>' + (u.username ? "@"+u.username : "—") + '</td>' +
            '<td class="col-actions">' +
              '<button class="btn icon" title="Remove following" data-action="remove" data-id="'+ (u.id || it.rowId || "") +'">&#10006;</button>' +
            '</td>';
          tbody.appendChild(tr);
        });

       
        tbody.addEventListener("click", async function(ev){
          var btn = ev.target.closest('button[data-action="remove"]');
          if(!btn) return;
          var id = btn.getAttribute("data-id");
          if(!id){
            alert("Cannot remove: missing following id.");
            return;
          }
          btn.disabled = true;
          try{
            await removeFollowingById(id);
        
            var row = btn.closest("tr");
            if (row && row.parentNode) row.parentNode.removeChild(row);
            // If table becomes empty, show empty row
            if (!tbody.querySelector("tr")) {
              var tr = document.createElement("tr");
              tr.className = "empty-row";
              tr.innerHTML = '<td colspan="3">No following yet</td>';
              tbody.appendChild(tr);
            }
          }catch(e){
            alert(e.message || "Unable to remove following.");
            btn.disabled = false;
          }
        }, { once: true });
      }

      async function boot(){
        ensureTokenOrRedirect();
        setText("status", "Loading…");
        try{
          const list = await fetchFollowing();
          renderFollowing(list);
          setText("status", "");
        }catch(e){
          setText("status", e.message);
          renderFollowing([]);
        }
      }

      boot();
    })();
  </script>
</body>
</html>
  `;
};

export default following;
