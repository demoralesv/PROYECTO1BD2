const login = () => {
  return `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>Login</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body{font-family:system-ui,arial,segui ui; background:#0b0d10; color:#e7eef7; display:grid; place-items:center; min-height:100vh}
        .card{background:#12161c; padding:24px; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,.3); width:320px}
        .grid{display:grid; gap:12px}
        input,button,a{padding:10px 12px; border-radius:10px; border:1px solid #2a3340; background:#0f1217; color:#e7eef7; text-decoration:none; text-align:center}
        button,a{cursor:pointer}
        .muted{opacity:.8; font-size:.9rem}
        .row{display:flex; gap:8px; justify-content:space-between; align-items:left}
        small{color:#9fb0c8}
        .ok{color:#8ef7a1}
        .err{color:#ff7b7b}
      </style>
    </head>
    <body>
      <div class="card grid">
        <h2>Login</h2>
        <input id="li_username" placeholder="Username" />
        <input id="li_password" type="password" placeholder="Password" />
        <button onclick="login()">Log In</button>
        <div class="row">
          <small id="li_msg" class="muted"></small>
          <a href="/signup">Sign up</a>
        </div>
        <small id="token" class="muted"></small>
      </div>
      
      <script>
        const API = "http://localhost:3000";

        function setMsg(id, msg, ok=false){
          const el = document.getElementById(id);
          el.textContent = msg;
          el.className = ok ? "ok" : "err";
        }

        async function login(){
          const payload = {
            username: document.getElementById("li_username").value.trim(),
            password: document.getElementById("li_password").value
          };
          try{
            const res = await fetch(\`\${API}/auth/login\`, {
              method:"POST",
              headers: {"Content-Type":"application/json"},
              body: JSON.stringify(payload)
            });
            const data = await res.json();
            if(!res.ok) throw new Error(data.error || "Login failed");
            setMsg("li_msg", "Login OK ✔", true);
            localStorage.setItem("token", data.token);
            document.getElementById("token").textContent = \`JWT: \${data.token.slice(0,32)}...\`;
            
            localStorage.setItem("token", data.token);
            window.location.href = "/home";

          }catch(e){
            setMsg("li_msg", e.message);
          }
        }
      </script>
    </body>
  </html>
  `;
};

export default login;
