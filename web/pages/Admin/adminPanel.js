const adminPanel = () => {
return `
    <!doctype html>
    <html lang="en">
    <head>
        <meta charset="utf-8" />
        <title>Admin Panel</title>
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
                padding:18px 32px; /* Increased padding for bigger buttons */
                border-radius:10px; border:1px solid var(--line);
                background:#0f1217; color:var(--text); font-size:1.2rem; /* Larger font */
            }
            .btn{cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:12px}
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
                max-width:960px;
            }

            /* Center buttons */
            .admin-btns{
                display:flex;
                flex-direction:column;
                gap:28px;
                align-items:center;
                justify-content:center;
                margin:48px 0;
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
                    Admin Panel
            </div>
            <div class="top-actions">
                    <a href="/profile"><button class="btn icon" title="Back">
                            <span>Go Back</span>
                    </button></a>
            </div>
    </div>
    <div class="page">
            <div class="panel card">
                    <h2>Admin Functions</h2>
                    <div class="admin-btns">
                            <a href="/manageUsers"><button class="btn primary" >
                                    <span>👑</span>
                                    Make People Admin
                            </button></a>
                            <a href="/manageDatasets"><button class="btn primary" >
                                    <span>✅</span>
                                    Approve Datasets
                            </button></a>
                    </div>
                    <div class="muted" style="margin-top:18px;">
                            Use the buttons above to manage users and datasets.
                    </div>
            </div>
    </div>
`;
};

export default adminPanel;