const makeAdmins = () => `
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Panel Admin</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body{font-family:system-ui,arial; background:#0b0d10; color:#e7eef7; margin:0; padding:24px}
    .wrap{max-width:900px; margin:auto}
    table{width:100%; border-collapse:collapse}
    th,td{padding:10px; border-bottom:1px solid #2a3340}
    button{padding:6px 12px; border-radius:8px; border:1px solid #2a3340; background:#0f1217; color:#e7eef7; cursor:pointer}
    .badge{padding:4px 8px; border-radius:8px; font-size:.85rem}
    .admin{background:#14331c; color:#8ef7a1}
    .user{background:#331414; color:#ff7b7b}
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
<div class="topbar">
            <div class="brand">
                    <span class="logo"></span>
                    Admin Panel
            </div>
            <div class="top-actions">
                    <a href="/admin"><button class="btn icon" title="Back">
                            <span>Go Back</span>
                    </button></a>
            </div>
    </div>
  <div class="wrap">
    <h2>User Management</h2>
    <div id="msg"></div>
    <table id="tbl">
      <thead>
        <tr>
          <th>Username</th>
          <th>Name</th>
          <th>Role</th>
          <th>Create</th>
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
      el.style.color = ok ? "#8ef7a1" : "#ff7b7b";
    }

    async function loadUsers(){
      try{
        const res = await fetch(\`\${API}/admin/users\`, {
          headers: { "Authorization": \`Bearer \${token}\` }
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error || "Error fetching users");
        render(data);
      }catch(e){ msg(e.message); }
    }

    function render(users){
      const tb = document.getElementById("tbody");
      tb.innerHTML = "";
      for(const u of users){
        const tr = document.createElement("tr");
        const roleClass = u.role === "admin" ? "admin" : "user";
        tr.innerHTML = \`
          <td>\${u.username}</td>
          <td>\${u.fullname}</td>
          <td><span class="badge \${roleClass}">\${u.role}</span></td>
          <td>\${new Date(u.createdAt).toLocaleString()}</td>
          <td>\${
            u.role === "admin"
            ? "<button data-id='"+u._id+"' class='demote'>Remove admin</button>"
            : "<button data-id='"+u._id+"' class='promote'>Make admin</button>"
          }</td>
        \`;
        tb.appendChild(tr);
      }

      document.querySelectorAll(".promote").forEach(btn =>
        btn.addEventListener("click", () => changeRole(btn.dataset.id, "promote"))
      );
      document.querySelectorAll(".demote").forEach(btn =>
        btn.addEventListener("click", () => changeRole(btn.dataset.id, "demote"))
      );
    }

    async function changeRole(id, action){
      try{
        const res = await fetch(\`\${API}/admin/users/\${id}/\${action}\`, {
          method: "PUT",
          headers: {
            "Authorization": \`Bearer \${token}\`,
            "Content-Type": "application/json"
          }
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error || "Error updating user");
        msg(data.msg, true);
        loadUsers();
      }catch(e){ msg(e.message); }
    }

    if(token) loadUsers(); else msg("Login required");
  </script>
</body>
</html>
`;

export default makeAdmins;
