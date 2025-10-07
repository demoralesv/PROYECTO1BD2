const downloadsPage = () => {
  return `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Downloads</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root{ --bg:#0b0d10; --panel:#12161c; --muted:#9fb0c8; --line:#2a3340; --text:#e7eef7; --accent:#5aa9ff; }
      *{box-sizing:border-box}
      body{margin:0; font-family:system-ui,arial,segoe ui; background:var(--bg); color:var(--text)}
      a,button,input{font:inherit}
      .btn,.input{ padding:10px 12px; border-radius:10px; border:1px solid var(--line); background:#0f1217; color:var(--text) }
      .btn{cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:8px}
      .btn.icon{padding:8px 10px; border-radius:999px}
      .card{background:var(--panel); border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,.3)}
      .muted{color:var(--muted)}
      .topbar{ position:sticky; top:0; z-index:20; backdrop-filter:saturate(1.2) blur(4px);
        display:flex; gap:12px; align-items:center; justify-content:space-between;
        padding:12px 18px; border-bottom:1px solid var(--line); background:rgba(11,13,16,.6) }
      .brand{display:flex; align-items:center; gap:10px; font-weight:600}
      .brand .logo{width:28px; height:28px; border-radius:50%; background:#1a2230; display:inline-block}
      .top-actions{display:flex; gap:10px; align-items:center}
      .page{ min-height:calc(100vh - 60px); padding:32px; display:flex; justify-content:center }
      .panel{ padding:24px; width:100%; max-width:960px }
      .avatar.small{ width:32px; height:32px; border-radius:50%; display:block; object-fit:cover; }

      .stats{ display:flex; gap:16px; align-items:center; margin-bottom:12px }
      .pill{ padding:4px 8px; border:1px solid var(--line); border-radius:999px; font-size:.8rem; color:var(--muted) }

      .table{ width:100%; border-collapse:separate; border-spacing:0; overflow:hidden; border:1px solid var(--line); border-radius:12px; background:#0f1217 }
      .table thead th{ text-align:left; font-weight:600; padding:12px; border-bottom:1px solid var(--line) }
      .table tbody td{ padding:12px; border-top:1px solid #0e1218 }
      .table tbody tr:first-child td{ border-top:none }
      .col-user{ width:45% } .col-username{ width:20%; white-space:nowrap }
      .col-count{ width:15%; white-space:nowrap } .col-last{ width:20%; white-space:nowrap }
      .empty-row td{ text-align:center; color:var(--muted); font-style:italic }
    </style>
  </head>
  <body>
    <div class="topbar">
      <div class="brand"><span class="logo"></span>DataShare</div>
      <div class="top-actions">
        <a id="backBtn" href="/profile" class="btn">← Back</a>
        <a href="/datasets/new" class="btn">Upload Dataset</a>
      </div>
    </div>

    <div class="page">
      <main class="panel card">
        <div style="display:flex; align-items:baseline; justify-content:space-between; gap:10px; margin-bottom:10px">
          <h3 id="title">Downloads</h3>
          <span id="status" class="muted"></span>
        </div>

        <div class="stats">
          <span id="sumUnique" class="pill">— unique users</span>
          <span id="sumTotal"  class="pill">— total downloads</span>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th class="col-user">User</th>
              <th class="col-username">Username</th>
              <th class="col-count">Times</th>
              <th class="col-last">Last download</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="tbody">
            <tr class="empty-row"><td colspan="5">Loading…</td></tr>
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
    function fmtTime(ms){
      if (!ms && ms !== 0) return "—";
      try { return new Date(Number(ms)).toLocaleString(); } catch(_) { return "—"; }
    }
    function displayName(u){
      return (u && (u.fullName || u.fullname)) || "Unnamed";
    }
    function avatarUrl(p){
      var name = (p && (p.fullName || p.fullname || p.username)) || "User";
      return (p && p.avatarUrl)
        ? p.avatarUrl
        : "https://api.dicebear.com/8.x/initials/svg?seed=" + encodeURIComponent(name);
    }
    function datasetIdFromPath(){
      var parts = location.pathname.split("/");
      // expects /datasets/:id/downloads
      return parts[2] || "";
    }

    // back button: same-site safe back
    (function setupBack(){
      var btn = $("backBtn"); if(!btn) return;
      var FALLBACK = "/profile";
      try{
        var ref = document.referrer;
        if(ref){
          var u = new URL(ref, location.href);
          btn.href = (u.origin===location.origin) ? u.href : FALLBACK;
        } else btn.href = FALLBACK;
      } catch(_){ btn.href = FALLBACK; }
      btn.addEventListener("click", function(e){
        if(history.length > 1){ e.preventDefault(); history.back(); }
      });
    })();

    var dsId = datasetIdFromPath();
    if(!dsId){ setText("status", "Missing dataset id"); throw new Error("missing id"); }

    // Title from dataset
    apiGet("/api/datasets/" + encodeURIComponent(dsId))
      .then(function(ds){
        setText("title", 'Downloads · ' + (ds.name || 'Dataset'));
      })
      .catch(function(){ /* non-fatal */ });

    // Load table
    function load(page){
      setText("status", "Loading…");
      var p = Math.max(0, ((page ?? 1) - 1)); // convert 1-based UI to 0-based API
      apiGet("/api/datasets/" + encodeURIComponent(dsId) + "/downloads?page=" + p + "&size=50")
        .then(function(data){
          setText("status", "");
          var tbody = $("tbody");
          tbody.innerHTML = "";

          // Totals
          var uniq = (data && data.totals && data.totals.uniqueDownloaders) || 0;
          var total = (data && data.totals && data.totals.totalDownloads) || 0;
          setText("sumUnique", uniq + " unique users");
          setText("sumTotal", total + " total downloads");

          var items = (data && data.items) || [];
          if(!items.length){
            var tr = document.createElement("tr");
            tr.className = "empty-row";
            tr.innerHTML = '<td colspan="5">No downloads yet</td>';
            tbody.appendChild(tr);
            return;
          }

          items.forEach(function(row){
            var tr = document.createElement("tr");
            tr.innerHTML =
              '<td class="col-user">'+
                '<div style="display:flex; gap:10px; align-items:center">'+
                  '<img class="avatar small" src="'+ avatarUrl(row) +'" alt="avatar" />'+
                  '<div style="font-weight:600">' + displayName(row) + '</div>'+
                '</div>'+
              '</td>'+
              '<td class="col-username">'+ (row.username ? '@'+row.username : '—') +'</td>'+
              '<td class="col-count">'+ (row.count || 0) +'</td>'+
              '<td class="col-last">'+ fmtTime(row.lastAt) +'</td>'+
              '<td style="text-align:right">'+
                (row.username
                  ? '<a class="btn" href="/profile/'+ encodeURIComponent(row.username) +'">View profile</a>'
                  : '<a class="btn" href="/profile/'+ encodeURIComponent(row.userId) +'">View profile</a>') +
              '</td>';
            tbody.appendChild(tr);
          });
        })
        .catch(function(err){
          setText("status", err.message || "Failed to load");
          var tbody = $("tbody"); tbody.innerHTML = "";
          var tr = document.createElement("tr");
          tr.className = "empty-row";
          tr.innerHTML = '<td colspan="5">Failed to load downloaders</td>';
          tbody.appendChild(tr);
        });
    }

    load(1);
  })();
  </script>
  </body>
  </html>
  `;
};

export default downloadsPage;
