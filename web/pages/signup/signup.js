const signup = () => {
  return `
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Sign Up</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body{font-family:system-ui,arial,segui ui; background:#0b0d10; color:#e7eef7; display:grid; place-items:center; min-height:100vh}
      .card{background:#12161c; padding:24px; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,.3); width:320px}
      .grid{display:grid; gap:12px}
      input,button{padding:10px 12px; border-radius:10px; border:1px solid #2a3340; background:#0f1217; color:#e7eef7}
      button{cursor:pointer}
      .muted{opacity:.8; font-size:.9rem}
      .row{display:flex; gap:8px; justify-content:space-between; align-items:center}
      .ok{color:#8ef7a1}
      .err{color:#ff7b7b}
    </style>
  </head>
  <body>
    <div class="card grid">
      <h2>Sign Up</h2>
      <input id="su_username" placeholder="Username" />
      <input id="su_fullname" placeholder="Full Name" />
      <input id="su_birth" type="date" />
      <input id="su_avatar" placeholder="URL avatar (optional)" />
      <input id="su_password" type="password" placeholder="Password" />
      <button onclick="handleSignup()">Create Account</button>
      <a href="/"><button type="button">Cancel</button></a>
      <small id="su_msg" class="muted"></small>
    </div>

    <script>
      const API = "http://localhost:3000";

      function setMsg(id, msg, ok=false){
        const el = document.getElementById(id);
        el.textContent = msg;
        el.className = ok ? "ok" : "err";
      }

      async function handleSignup() {
        const payload = {
          username: document.getElementById("su_username").value.trim(),
          fullname: document.getElementById("su_fullname").value.trim(),
          birthDate: document.getElementById("su_birth").value || null,
          avatarUrl: document.getElementById("su_avatar").value.trim() || null,
          password: document.getElementById("su_password").value
        };
        try {
          const res = await fetch(\`\${API}/auth/signup\`, {
            method:"POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if(!res.ok) throw new Error(data.error || "Signup failed");
          setMsg("su_msg", "Account Created ✔", true);
          setTimeout(() => {
            window.location.href = "/";
          }, 1200);
          
          
        } catch(e) {
          setMsg("su_msg", e.message);
        }
      }
    </script>
  </body>
</html>
  `;
}

export default signup;
