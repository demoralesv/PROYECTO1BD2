const searchPage = () => {
  return `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Search</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root{ --bg:#0b0d10; --panel:#12161c; --muted:#9fb0c8; --line:#2a3340; --text:#e7eef7; --accent:#5aa9ff; }
    *{box-sizing:border-box}
    body{margin:0; font-family:system-ui,arial,segoe ui; background:var(--bg); color:var(--text)}
    a,button,input{font:inherit}
    .btn,.input{ padding:10px 12px; border-radius:10px; border:1px solid var(--line); background:#0f1217; color:var(--text) }
    .btn{cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:8px}
    .btn.icon{padding:8px 10px; border-radius:999px}
    .chip{padding:2px 8px; border:1px solid var(--line); border-radius:999px; font-size:.8rem; color:var(--muted)}
    .card{background:var(--panel); border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,.3)}
    .muted{color:var(--muted)}
    .topbar{ position:sticky; top:0; z-index:20; backdrop-filter:saturate(1.2) blur(4px);
      display:flex; gap:12px; align-items:center; justify-content:space-between;
      padding:12px 18px; border-bottom:1px solid #0e1218; background:rgba(11,13,16,.6) }
    .brand{display:flex; align-items:center; gap:10px; font-weight:600}
    .brand .logo{width:28px; height:28px; border-radius:50%; background:#1a2230; display:inline-block}
    .top-actions{display:flex; gap:10px; align-items:center}
    .search-wrap{flex:1; display:flex; gap:8px; align-items:center; max-width:720px; margin:0 12px}
    .search-wrap input{flex:1}
    .page{ min-height:calc(100vh - 60px); padding:32px; display:flex; justify-content:center }
    .panel{ padding:24px; width:100%; max-width:960px }
    .avatar.small{ width:32px; height:32px; border-radius:50%; display:block; object-fit:cover; }
    
    /* Opciones de búsqueda */
    .subtabs{ display:flex; gap:8px; align-items:center; border-bottom:1px solid var(--line); margin-bottom:16px }
    .tab{ padding:10px 12px; border:1px solid var(--line); border-bottom:none; border-radius:10px 10px 0 0; cursor:pointer; color:var(--muted); background:#0f1217 }
    .tab.active{ color:var(--text); background:#121822 }
    
    /* Tabla */
    .table{ width:100%; border-collapse:separate; border-spacing:0; overflow:hidden; border:1px solid var(--line); border-radius:12px; background:#0f1217 }
    .table thead th{ text-align:left; font-weight:600; padding:12px; border-bottom:1px solid var(--line) }
    .table tbody td{ padding:12px; border-top:1px solid #0e1218 }
    .table tbody tr:first-child td{ border-top:none }
    .col-name{ width:60% } .col-mid{ width:20% } .col-actions{ width:20%; text-align:right }
    .empty-row td{ text-align:center; color:var(--muted); font-style:italic }
    
    /* Nombre de usuarios o datasets */
    .pill{ display:inline-block; padding:2px 8px; border:1px solid var(--line); border-radius:999px; font-size:.75rem; color:var(--muted) }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="brand"><span class="logo"></span>DataShare</div>
    <div class="search-wrap">
      <input id="q" class="input" type="text" placeholder="Search…" />
      <button id="go" class="btn icon" title="Search"><span>🔍</span></button>
    </div>
    <div class="top-actions">
      <a href="/datasets/new" class="btn">Upload Dataset</a>
      <a href="/profile" class="btn icon" title="Profile"><img id="avatarTopbar" class="avatar small" alt="avatar" src="" /></a>
    </div>
  </div>

  <div class="page">
    <main class="panel card">
      <div style="display:flex; align-items:baseline; justify-content:space-between; gap:10px; margin-bottom:10px">
        <h3 id="title">Search results</h3>
        <span id="status" class="muted"></span>
      </div>

      <div class="subtabs">
        <button class="tab active" data-tab="all">All</button>
        <button class="tab" data-tab="people">People</button>
        <button class="tab" data-tab="datasets">Datasets</button>
      </div>

      <table class="table">
        <thead id="thead">
          <!-- will switch columns -->
        </thead>
        <tbody id="tbody">
          <tr class="empty-row"><td>Loading…</td></tr>
        </tbody>
      </table>
    </main>
  </div>

<script>
(function(){
  var API = "http://localhost:3000";

  function $(id){ return document.getElementById(id); }
  function setText(id, txt){ var el=$(id); if(el) el.textContent = txt; }
  function authHeaders(){
    var t = localStorage.getItem("token");
    return t ? { "Authorization":"Bearer " + t } : {};
  }
  function apiGet(path){
    return fetch(API + path, { headers: Object.assign({ "Content-Type":"application/json" }, authHeaders()) })
      .then(function(res){
        if(!res.ok){
          return res.json().catch(function(){return {};})
            .then(function(data){ throw new Error(data.error || (res.status+" "+res.statusText)); });
        }
        return res.json();
      });
  }
  function avatarUrl(p){
    return (p && p.avatarUrl) ? p.avatarUrl
      : "https://api.dicebear.com/8.x/initials/svg?seed=" + encodeURIComponent((p && (p.fullName||p.username)) || "User");
  }

  // Leer parámetros
  var params = new URLSearchParams(location.search);
  var query = params.get("q") || "";
  $("q").value = query;

  // Buscar lo que se escriba en la caja
  $("go").addEventListener("click", function(){
    var val = $("q").value.trim();
    location.href = "/search?q=" + encodeURIComponent(val);
  });
  $("q").addEventListener("keydown", function(e){
    if(e.key === "Enter") $("go").click();
  });

  // tabs
  var currentTab = "all";
  Array.from(document.querySelectorAll(".tab")).forEach(function(btn){
    btn.addEventListener("click", function(){
      Array.from(document.querySelectorAll(".tab")).forEach(function(b){ b.classList.remove("active"); });
      btn.classList.add("active");
      currentTab = btn.dataset.tab;
      load();
    });
  });

  function renderHead(kind){
    var thead = $("thead");
    if(kind === "people"){
      thead.innerHTML = '<tr><th class="col-name">User</th><th class="col-mid">Username</th><th class="col-actions"></th></tr>';
    } else if(kind === "datasets"){
      thead.innerHTML = '<tr><th class="col-name">Dataset</th><th class="col-mid">Downloads</th><th class="col-actions"></th></tr>';
    } else {
      thead.innerHTML = '<tr><th class="col-name">Result</th><th class="col-mid">Type</th><th class="col-actions"></th></tr>';
    }
  }

  function renderEmpty(msg){
    var tbody = $("tbody");
    tbody.innerHTML = '';
    var tr = document.createElement("tr");
    tr.className = "empty-row";
    tr.innerHTML = '<td colspan="3">'+ msg +'</td>';
    tbody.appendChild(tr);
  }

  function renderPeople(users){
    renderHead("people");
    var tbody = $("tbody"); tbody.innerHTML = '';
    if(!users || users.length === 0) return renderEmpty("No users found");
    users.forEach(function(u){
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td class="col-name">'+
          '<div style="display:flex; gap:10px; align-items:center">'+
            '<img class="avatar small" src="'+ avatarUrl(u) +'" alt="avatar" />'+
            '<div><div style="font-weight:600">'+ (u.fullName || "Unnamed") +'</div>'+
            '<div class="muted" style="font-size:.85rem">'+ (u.bio ? u.bio.substring(0,80) : "") +'</div></div>'+
          '</div>'+
        '</td>'+
        '<td class="col-mid">'+ (u.username ? '@'+u.username : '—') +'</td>'+
        '<td class="col-actions"><a class="btn" href="/u/'+ encodeURIComponent(u.username || u._id) +'">View profile</a></td>';
      tbody.appendChild(tr);
    });
  }

  function renderDatasets(datasets){
    renderHead("datasets");
    var tbody = $("tbody"); tbody.innerHTML = '';
    if(!datasets || datasets.length === 0) return renderEmpty("No datasets found");
    datasets.forEach(function(ds){
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td class="col-name">'+
          '<div style="display:flex; gap:10px; align-items:center">'+
            '<div class="pill">DS</div>'+
            '<div>'+
              '<div style="font-weight:600">'+ (ds.name || "Untitled dataset") +'</div>'+
              '<div class="muted" style="font-size:.85rem">by @'+ ((ds.owner && ds.owner.username) || ds.ownerUsername || "unknown") +'</div>'+
            '</div>'+
          '</div>'+
        '</td>'+
        '<td class="col-mid">'+ (ds.downloads != null ? ds.downloads : 0) +'</td>'+
        '<td class="col-actions"><a class="btn" href="/datasets/'+ encodeURIComponent(ds.datasetId || ds._id) +'">Open</a></td>';
      tbody.appendChild(tr);
    });
  }

  function renderAll(users, datasets){
    renderHead("all");
    var tbody = $("tbody"); tbody.innerHTML = '';
    var any = false;

    (users || []).forEach(function(u){
      any = true;
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td class="col-name">'+
          '<div style="display:flex; gap:10px; align-items:center">'+
            '<img class="avatar small" src="'+ avatarUrl(u) +'" alt="avatar" />'+
            '<div><div style="font-weight:600">'+ (u.fullName || "Unnamed") +'</div>'+
            '<div class="muted" style="font-size:.85rem">'+ (u.username ? '@'+u.username : '—') +'</div></div>'+
          '</div>'+
        '</td>'+
        '<td class="col-mid"><span class="pill">User</span></td>'+
        '<td class="col-actions"><a class="btn" href="/u/'+ encodeURIComponent(u.username || u._id) +'">View profile</a></td>';
      tbody.appendChild(tr);
    });

    (datasets || []).forEach(function(ds){
      any = true;
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td class="col-name">'+
          '<div style="display:flex; gap:10px; align-items:center">'+
            '<div class="pill">DS</div>'+
            '<div>'+
              '<div style="font-weight:600">'+ (ds.name || "Untitled dataset") +'</div>'+
              '<div class="muted" style="font-size:.85rem">by @'+ ((ds.owner && ds.owner.username) || ds.ownerUsername || "unknown") +'</div>'+
            '</div>'+
          '</div>'+
        '</td>'+
        '<td class="col-mid"><span class="pill">Dataset</span></td>'+
        '<td class="col-actions"><a class="btn" href="/datasets/'+ encodeURIComponent(ds.datasetId || ds._id) +'">Open</a></td>';
      tbody.appendChild(tr);
    });

    if(!any) renderEmpty('No results for "'+ (query || '') +'"');
  }

  function load(){
    setText("title", 'Results for "' + (query || '') + '"');
    setText("status", "Loading…");

    var endpoint;
    if(currentTab === "people"){
      endpoint = "/api/search/users?q=" + encodeURIComponent(query);
    } else if(currentTab === "datasets"){
      endpoint = "/api/search/datasets?q=" + encodeURIComponent(query);
    } else {
      endpoint = "/api/search/all?q=" + encodeURIComponent(query);
    }

    apiGet(endpoint)
      .then(function(data){
        setText("status", "");
        if(currentTab === "people") return renderPeople(data.items || data.users || []);
        if(currentTab === "datasets") return renderDatasets(data.items || data.datasets || []);
        return renderAll(data.users || [], data.datasets || []);
      })
      .catch(function(err){
        setText("status", err.message);
        renderEmpty("Failed to load results");
      });
  }

  // Cargar avatar del usuario
  fetch(API + "/me", { headers: authHeaders() }).then(r=>r.json()).then(function(me){
    var topbar = $("avatarTopbar");
    if(topbar){
      var src = (me && me.avatarUrl) ? me.avatarUrl
        : "https://api.dicebear.com/8.x/initials/svg?seed=" + encodeURIComponent((me && (me.fullName||me.username)) || "User");
      topbar.src = src;
    }
  }).catch(()=>{});

  load();
})();
</script>
</body>
</html>
  `;
};

export default searchPage;
