const profileEditPage = () => {
  return `
  <!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Edit Profile</title>
      <style>
        :root{
          --bg:#0b0d10; --panel:#12161c; --muted:#9fb0c8;
          --line:#2a3340; --text:#e7eef7; --accent:#5aa9ff;
          --danger:#ff7b7b; --success:#8ef7a1;
        }
        *{box-sizing:border-box}
        body{margin:0; font-family:system-ui,arial,segoe ui; background:var(--bg); color:var(--text)}
        a,button,input{font:inherit}
        .btn, .input{
          padding:10px 12px; border-radius:10px; border:1px solid var(--line);
          background:#0f1217; color:var(--text)
        }
        .btn{cursor:pointer; display:inline-flex; align-items:center; gap:8px; text-decoration:none}
        .btn.primary{background:#0f141c}
        .btn[disabled]{opacity:.5; cursor:not-allowed}
        .muted{color:var(--muted)}
        .ok{color:var(--success)} .err{color:var(--danger)}

        /* Header simple */
        .topbar{
          position:sticky; top:0; z-index:10; backdrop-filter:saturate(1.2) blur(4px);
          display:flex; gap:12px; align-items:center; justify-content:space-between;
          padding:12px 18px; border-bottom:1px solid #0e1218; background:rgba(11,13,16,.6)
        }
        .brand{display:flex; align-items:center; gap:10px; font-weight:600}
        .brand .logo{width:28px; height:28px; border-radius:50%; background:#000; display:inline-block;background-image: url(https://cdn-icons-png.flaticon.com/512/18495/18495588.png);background-size: contain;}        .top-actions{display:flex; gap:10px; align-items:center}
        .top-actions{display:flex; gap:10px; align-items:center}

        /* Layout de edición a pantalla completa */
        .wrap{
          max-width:880px; margin:24px auto; padding:0 16px;
        }
        .card{
          background:var(--panel); border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,.3);
          border:1px solid var(--line);
        }
        .header{
          padding:16px; border-bottom:1px solid var(--line);
          display:flex; align-items:center; justify-content:space-between; gap:12px;
        }
        .content{padding:16px}
        .footer{
          padding:16px; border-top:1px solid var(--line); display:flex; gap:8px; justify-content:flex-end;
        }
        .form{display:grid; gap:14px}
        .field{display:grid; gap:6px}
        .field label{font-size:.9rem; color:var(--muted)}
        .row{display:flex; gap:14px; flex-wrap:wrap}
        .col{flex:1 1 280px}
        .avatar{
          width:96px; height:96px; border-radius:16px; background:#0f141a; object-fit:cover; display:block
        }
        .help{font-size:.85rem; color:var(--muted)}
        .status{min-height:1.2em}
      </style>
    </head>
    <body>
      <header class="topbar">
        <div class="brand">
          <span class="logo"></span>
          <span>Site Name</span>
        </div>
        <div class="top-actions">
          <a class="btn" href="/profile">← Back to profile</a>
          <button id="btnBackLogin" class="btn" title="Log out">Log Out</button>
        </div>
      </header>

      <main class="wrap">
        <section class="card">
          <div class="header">
            <h2 style="margin:0">Edit profile</h2>
            <span class="muted status" id="status">Loading…</span>
          </div>

          <div class="content">
            <div class="row" style="align-items:center">
              <img id="avatarPreview" class="avatar" alt="avatar preview" src="">
              <div class="help">Change the avatar url to preview.</div>
            </div>

            <div class="form" style="margin-top:12px">
              <div class="row">
                <div class="field col">
                  <label for="fullNameInput">Full name</label>
                  <input id="fullNameInput" class="input" placeholder="Jane Doe" maxlength="120" />
                </div>
                <div class="field col">
                  <label for="dobInput">Birth date</label>
                  <input id="dobInput" class="input" type="date" />
                </div>
              </div>

              <div class="field">
                <label for="avatarUrlInput">Avatar URL</label>
                <input id="avatarUrlInput" class="input" placeholder="https://..." inputmode="url" />
                <div class="help">Use a public URL. Leave empty to use initials.</div>
              </div>

              <div class="field">
                <label for="usernameReadonly">Username (read-only)</label>
                <input id="usernameReadonly" class="input" disabled />
              </div>

              <div id="formError" class="err" style="display:none"></div>
              <div id="formOk" class="ok" style="display:none"></div>
            </div>
          </div>

          <div class="footer">
            <a class="btn" href="/profile">Cancel</a>
            <button id="btnSave" class="btn primary">Save changes</button>
          </div>
        </section>
      </main>

      <script>
        (function(){
          var API = "http://localhost:3000";
          var me = null;

          function $(id){ return document.getElementById(id); }
          function authHeaders(){
            var t = localStorage.getItem("token");
            return t ? { "Authorization": "Bearer " + t } : {};
          }
          function ensureTokenOrRedirect(){
            if(!localStorage.getItem("token")){
              window.location.replace("/");
            }
          }
          function setStatus(msg){ var s = $("status"); if(s) s.textContent = msg || ""; }

          function apiRequest(method, path, body){
            return fetch(API + path, {
              method: method,
              headers: Object.assign({ "Content-Type":"application/json" }, authHeaders()),
              body: body ? JSON.stringify(body) : undefined
            }).then(function(res){
              if (res.status === 204) return {};
              if (!res.ok){
                return res.json().catch(function(){ return {}; }).then(function(data){
                  throw new Error(data.error || (res.status + " " + res.statusText));
                });
              }
              return res.json().catch(function(){ return {}; });
            });
          }
          function apiGet(path){ return apiRequest("GET", path); }

          async function updateMe(data){
            const candidates = [
              { m:"PATCH", p:"/me" },
              { m:"PUT",   p:"/me" },
              { m:"PATCH", p:"/users/me" },
              { m:"PUT",   p:"/users/me" }
            ];
            const uid = me && (me.id || me._id || me.userId);
            if (uid){
              candidates.push({ m:"PATCH", p:"/users/" + uid });
              candidates.push({ m:"PUT",   p:"/users/" + uid });
            }
            let last404 = null;
            for (const c of candidates){
              try { return await apiRequest(c.m, c.p, data); }
              catch(e){
                if ((e.message||"").startsWith("404")) { last404 = e; continue; }
                throw e;
              }
            }
            throw last404 || new Error("Update endpoint not found.");
          }

          function fmtInputDate(s){
            if(!s) return "";
            var d = new Date(s);
            if (isNaN(d.getTime())) return "";
            return d.toISOString().split("T")[0];
          }

          function seedAvatar(){
            var seed = ($("fullNameInput").value || $("usernameReadonly").value || "User").trim() || "User";
            return "https://api.dicebear.com/8.x/initials/svg?seed=" + encodeURIComponent(seed);
          }

          function fillForm(u){
            me = u || {};
            $("fullNameInput").value = u.fullName || "";
            $("dobInput").value = fmtInputDate(u.dob);
            $("avatarUrlInput").value = u.avatarUrl || "";
            $("usernameReadonly").value = u.username || "";

            $("avatarPreview").src = u.avatarUrl || seedAvatar();

            // Live preview
            $("avatarUrlInput").addEventListener("input", function(){
              var v = this.value.trim();
              $("avatarPreview").src = v && /^https?:\\/\\//i.test(v) ? v : seedAvatar();
            });
            $("fullNameInput").addEventListener("input", function(){
              if (!$("avatarUrlInput").value.trim()){
                $("avatarPreview").src = seedAvatar();
              }
            });
          }

          function hideMsgs(){ $("formError").style.display="none"; $("formOk").style.display="none"; }
          function showErr(m){ var e=$("formError"); e.textContent=m; e.style.display="block"; $("formOk").style.display="none"; }
          function showOk(m){ var e=$("formOk"); e.textContent=m; e.style.display="block"; $("formError").style.display="none"; }

          function validate(){
            var name = $("fullNameInput").value.trim();
            var dob  = $("dobInput").value;
            var url  = $("avatarUrlInput").value.trim();

            if (!name) return { ok:false, error:"Name can't be empty!" };
            if (url && !/^https?:\\/\\//i.test(url)) return { ok:false, error:"Avatar must be a public URL!" };
            if (dob){
              var d = new Date(dob);
              if (isNaN(d.getTime())) return { ok:false, error:"Date of Birth not valid!" };
              if (d > new Date()) return { ok:false, error:"Date of birth cannot be in the future" };
            }
            return { ok:true, data:{ fullName:name, dob: dob || null, avatarUrl: url || null } };
          }

          // Events
          $("btnSave").addEventListener("click", async function(){
            hideMsgs();
            var v = validate();
            if (!v.ok){ showErr(v.error); return; }

            $("btnSave").disabled = true;
            $("btnSave").textContent = "Saving…";
            setStatus("Saving…");

            try{
              const updated = await updateMe(v.data);
              showOk("Profile updated successfully!");
              setTimeout(function(){ window.location.href = "/profile"; }, 600);
            }catch(e){
              showErr(e.message || "Cannot update profile.");
              setStatus("");
            }finally{
              $("btnSave").disabled = false;
              $("btnSave").textContent = "Save changes";
            }
          });

          $("btnBackLogin").addEventListener("click", function(){
            localStorage.removeItem("token");
            window.location.href = "/";
          });

          // Boot
          ensureTokenOrRedirect();
          setStatus("Loading…");
          apiGet("/me").then(function(u){
            fillForm(u || {});
            setStatus("");
          }).catch(function(e){
            setStatus("");
            showErr(e.message || "Could not load profile.");
          });
        })();
      </script>
    </body>
  </html>
  `;
};

export default profileEditPage;
