const approveDS = () => {
  return `
  <!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Admin - Datasets</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body{font-family:system-ui,arial; background:#0b0d10; color:#e7eef7; margin:0; padding:24px}
    .wrap{max-width:1100px; margin:auto}
    table{width:100%; border-collapse:collapse}
    th,td{padding:10px; border-bottom:1px solid #2a3340; vertical-align:top}
    .row{display:flex; gap:8px; justify-content:space-between; align-items:center; margin-bottom:12px}
    input,select,button{padding:8px 10px; border-radius:8px; border:1px solid #2a3340; background:#0f1217; color:#e7eef7}
    button{cursor:pointer}
    .approve{background:green; margin:3px;margin-left:10px}
    .decline{background:#960018; margin:3px;margin-left:10px}
    .badge{padding:4px 8px; border-radius:8px; font-size:.8rem}
    .pending{background:#F29339; margin:3px}
    .submitted{background:#F7CB73; color:#000; margin:3px}
    .approved{background:#077E8C; margin:3px}
    .declined{background:#D9512C; margin:3px}
    .muted{color:#9fb0c8; margin:3px}
    .avatar{width:28px; height:28px; border-radius:6px; vertical-align:middle; margin-right:6px}
    .nowrap{white-space:nowrap}
    .desc{max-width:420px}
    .btn.icon{padding:8px 10px; border-radius:999px}
    .btn, .input{
                padding:18px 32px; /* Increased padding for bigger buttons */
                border-radius:10px; border:1px solid var(--line);
                background:#0f1217;  font-size:1.2rem; /* Larger font */
            }
    /* Topbar */
            .topbar{
                position:sticky; top:0; z-index:20; backdrop-filter:saturate(1.2) blur(4px);
                display:flex; gap:12px; align-items:center; justify-content:space-between;
                padding:12px 18px; border-bottom:1px solid #0e1218; background:rgba(11,13,16,.6)
            }
            .brand{display:flex; align-items:center; gap:10px; font-weight:600}
        .brand .logo{width:28px; height:28px; border-radius:50%; background:#000; display:inline-block;background-image: url(https://cdn-icons-png.flaticon.com/512/18495/18495588.png);background-size: contain;}        .top-actions{display:flex; gap:10px; align-items:center}
            .top-actions{display:flex; gap:10px; align-items:center}
            .search-wrap{flex:1; display:flex; gap:8px; align-items:center; max-width:720px; margin:0 12px}
            .search-wrap input{flex:1}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="topbar">
            <div class="brand">
                    <span class="logo"></span>
                    Dataset Panel
            </div>
            <div class="top-actions">
                    <a href="/admin"><button class="btn icon" title="Back">
                            <span>Go Back</span>
                    </button></a>
            </div>
    </div>

    <div class="row">
      <div class="muted" id="msg">Loading...</div>
      <div>
        <label class="muted">Status:</label>
        <select id="status">
          <option value="submitted">submitted</option>
          <option value="approved">approved</option>
          <option value="declined">declined</option>
        </select>
        <button id="btnReload">Update</button>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Dataset</th>
          <th>Owner</th>
          <th>Status</th>
          <th>Created</th>
          <th>Description</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody id="tbody"></tbody>
    </table>
  </div>

  <script>
    const API = "";
    const token = localStorage.getItem("token");

    function msg(t, ok=false){
      const el = document.getElementById("msg");
      el.textContent = t;
      el.style.color = ok ? "#8ef7a1" : "#9fb0c8";
    }

    function badge(cls, text){ return '<span class="badge '+cls+'">'+text+'</span>'; }

    async function loadDatasets(){
      const sel = document.getElementById("status").value;
      const q = sel ? ('?status=' + encodeURIComponent(sel)) : '';
      try{
        const res = await fetch(\`\${API}/admin/datasets/all\${q}\`, {
          headers: { "Authorization": \`Bearer \${token}\` }
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error || "Error loading datasets");
        renderDatasets(data);
        msg(\`Loaded \${data.length} datasets\`, true);
      }catch(e){ msg(e.message); }
    }

    function renderDatasets(items){
      const tb = document.getElementById("tbody");
      tb.innerHTML = "";
      for(const d of items){
        const statusClass = d.status;
        const owner = d.owner ? d.owner.username : "(No owner)";
        const avatar = d.datasetAvatarUrl || "";
        const tr = document.createElement("tr");
        tr.innerHTML = \`
          <td class="nowrap">
            \${avatar ? '<img class="avatar" src="'+avatar+'" />' : ''}<strong>\${d.name}</strong><br>
            <span class="muted">ID: \${d.datasetId}</span>
          </td>
          <td>\${owner}</td>
          <td>\${badge(statusClass, d.status)}</td>
          <td class="nowrap">\${new Date(d.createdAt).toLocaleString()}</td>
          <td class="desc">\${d.description}</td>
          <td>
            \${d.status !== 'approved' ? '<button class="approve" data-id="'+d._id+'">Approve</button>' : ''}
            \${d.status !== 'declined' ? '<button class="decline" data-id="'+d._id+'">Decline  </button>' : ''}
          </td>
        \`;
        tb.appendChild(tr);
      }
      document.querySelectorAll("button.approve").forEach(b => b.onclick = () => approve(b.dataset.id));
      document.querySelectorAll("button.decline").forEach(b => b.onclick = () => decline(b.dataset.id));
    }

    async function approve(id){
      try{
        const res = await fetch(\`\${API}/admin/datasets/\${id}/approve\`, {
          method: "PUT",
          headers: { "Authorization": \`Bearer \${token}\`, "Content-Type": "application/json" }
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error || "Cannot approve");
        msg(data.msg, true);
        loadDatasets();
      }catch(e){ msg(e.message); }
    }

    async function decline(id){
      try{
        const res = await fetch(\`\${API}/admin/datasets/\${id}/decline\`, {
          method: "PUT",
          headers: { "Authorization": \`Bearer \${token}\`, "Content-Type": "application/json" }
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error || "Cannot decline");
        msg(data.msg, true);
        loadDatasets();
      }catch(e){ msg(e.message); }
    }

    document.getElementById("btnReload").onclick = loadDatasets;
    document.getElementById("status").onchange = loadDatasets;

    if(!token) msg("Only Admins can access this page");
    else loadDatasets();
  </script>
</body>
</html>
`;
};

export default approveDS;