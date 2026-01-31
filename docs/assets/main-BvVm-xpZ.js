(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function e(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(n){if(n.ep)return;n.ep=!0;const a=e(n);fetch(n.href,a)}})();const Y="samildanach_state",g={project:{title:"Untitled Setting",author:"",version:"1.0.0",description:"",genre:"",system:""},session:{activePanel:null,activeEntryId:null},cache:{},_subscribers:[],init(){const s=localStorage.getItem(Y);if(s)try{const t=JSON.parse(s);t.project&&Object.assign(this.project,t.project),t.session&&Object.assign(this.session,t.session)}catch(t){console.warn("Failed to restore state:",t)}},save(){const s={project:this.project,session:this.session};localStorage.setItem(Y,JSON.stringify(s))},updateProject(s){Object.assign(this.project,s),this.save(),this._notify("project",this.project)},updateSession(s){Object.assign(this.session,s),this.save(),this._notify("session",this.session)},subscribe(s,t){const e={key:s,callback:t};return this._subscribers.push(e),()=>{const i=this._subscribers.indexOf(e);i>=0&&this._subscribers.splice(i,1)}},_notify(s,t){this._subscribers.filter(e=>e.key===s).forEach(e=>e.callback(t))},exportState(){return{project:{...this.project},session:{...this.session}}},importState(s){s.project&&Object.assign(this.project,s.project),s.session&&Object.assign(this.session,s.session),this.save(),this._notify("project",this.project),this._notify("session",this.session)}},$={panels:{},activePanelId:null,init:function(){g.init(),this.renderSidebar(),this.bindEvents();const s=localStorage.getItem("theme")||"dark";document.documentElement.setAttribute("data-theme",s),g.session.activePanel&&this.panels[g.session.activePanel]&&this.switchPanel(g.session.activePanel)},registerPanel:function(s,t){this.panels[s]=t,this.renderSidebar()},switchPanel:function(s){if(!this.panels[s])return;this.activePanelId=s,g.updateSession({activePanel:s}),document.querySelectorAll(".nav-item").forEach(i=>{i.classList.toggle("active",i.dataset.id===s)});const t=document.getElementById("main-view");t.innerHTML="";const e=document.createElement("div");e.className="panel-container",this.panels[s].render(e,g),t.appendChild(e)},renderSidebar:function(){const s=document.getElementById("nav-list");s&&(s.innerHTML="",Object.keys(this.panels).forEach(t=>{const e=this.panels[t],i=document.createElement("div");i.className="nav-item",i.innerHTML=e.icon||"📦",i.title=e.label||t,i.dataset.id=t,i.onclick=()=>this.switchPanel(t),t===this.activePanelId&&i.classList.add("active"),s.appendChild(i)}))},bindEvents:function(){const s=document.getElementById("theme-toggle");s&&(s.onclick=()=>{const t=document.documentElement,i=t.getAttribute("data-theme")==="dark"?"light":"dark";t.setAttribute("data-theme",i),localStorage.setItem("theme",i)})}},P={generateId:(s="id")=>typeof crypto<"u"&&crypto.randomUUID?`${s}_${crypto.randomUUID().split("-")[0]}`:`${s}_${Math.random().toString(36).substring(2,9)}`,escapeHtml:s=>{const t=document.createElement("div");return t.textContent=s,t.innerHTML},debounce:(s,t=300)=>{let e;return(...i)=>{clearTimeout(e),e=setTimeout(()=>s(...i),t)}},deepClone:s=>JSON.parse(JSON.stringify(s)),formatDate:s=>{const t=new Date(s);return t.toLocaleDateString()+" "+t.toLocaleTimeString()},truncate:(s,t=50)=>!s||s.length<=t?s:s.substring(0,t-3)+"..."},W="samildanach_vault",Q=1,N="items",A="registry",R="vault_registry";let k=null;function G(){return{id:R,lastUpdatedAt:new Date().toISOString(),universes:[],allTags:[],blocks:{},itemCounts:{actor:0,lorebook:0,script:0,location:0,event:0,pair:0}}}const T={init:function(){return new Promise((s,t)=>{if(k){s(k);return}const e=indexedDB.open(W,Q);e.onerror=i=>{console.error("[VaultDB] Failed to open database:",i.target.error),t(i.target.error)},e.onsuccess=i=>{k=i.target.result,console.log("[VaultDB] Database opened successfully"),s(k)},e.onupgradeneeded=i=>{const n=i.target.result;if(!n.objectStoreNames.contains(N)){const a=n.createObjectStore(N,{keyPath:"id"});a.createIndex("type","type",{unique:!1}),a.createIndex("universe","universe",{unique:!1}),a.createIndex("updatedAt","updatedAt",{unique:!1}),console.log("[VaultDB] Items store created")}n.objectStoreNames.contains(A)||(n.createObjectStore(A,{keyPath:"id"}),console.log("[VaultDB] Registry store created"))}})},getRegistry:function(){return new Promise((s,t)=>{if(!k){t(new Error("VaultDB not initialized"));return}const n=k.transaction(A,"readonly").objectStore(A).get(R);n.onsuccess=()=>{n.result?s(n.result):T.updateRegistry(G()).then(s).catch(t)},n.onerror=a=>t(a.target.error)})},updateRegistry:function(s){return new Promise((t,e)=>{if(!k){e(new Error("VaultDB not initialized"));return}const n=k.transaction(A,"readwrite").objectStore(A),a=n.get(R);a.onsuccess=()=>{const o={...a.result||G(),...s,id:R,lastUpdatedAt:new Date().toISOString()},c=n.put(o);c.onsuccess=()=>t(o),c.onerror=d=>e(d.target.error)},a.onerror=r=>e(r.target.error)})},list:function(s={}){return new Promise((t,e)=>{if(!k){e(new Error("VaultDB not initialized"));return}const n=k.transaction(N,"readonly").objectStore(N);let a;s.type?a=n.index("type").openCursor(IDBKeyRange.only(s.type)):s.universe?a=n.index("universe").openCursor(IDBKeyRange.only(s.universe)):a=n.openCursor();const r=[];a.onsuccess=o=>{const c=o.target.result;if(c){const d=c.value;let l=!0;s.type&&d.type!==s.type&&(l=!1),s.universe&&d.universe!==s.universe&&(l=!1),s.tags&&s.tags.length>0&&(s.tags.every(f=>{var w;return(w=d.tags)==null?void 0:w.includes(f)})||(l=!1)),l&&r.push(d),c.continue()}else r.sort((d,l)=>new Date(l.updatedAt).getTime()-new Date(d.updatedAt).getTime()),t(r)},a.onerror=o=>e(o.target.error)})},addItem:function(s,t,e={}){return new Promise((i,n)=>{if(!k){console.error("[VaultDB]AddItem: DB not initialized"),n(new Error("VaultDB not initialized"));return}const a=new Date().toISOString();let r;try{r=P&&P.generateId?P.generateId("vault"):`vault_${crypto.randomUUID()}`}catch(h){console.error("[VaultDB] ID Gen Failed:",h),r="vault_"+Date.now()}const o={id:r,type:s,version:1,universe:e.universe||"",tags:e.tags||[],createdAt:a,updatedAt:a,data:t};console.log("[VaultDB] Adding Item:",o);const l=k.transaction(N,"readwrite").objectStore(N).add(o);l.onsuccess=()=>{console.log("[VaultDB] Add Success"),i(o)},l.onerror=h=>{console.error("[VaultDB] Add Failed:",h.target.error),n(h.target.error)}})},updateItem:function(s){return new Promise((t,e)=>{if(!k){e(new Error("VaultDB not initialized"));return}s.updatedAt=new Date().toISOString();const a=k.transaction(N,"readwrite").objectStore(N).put(s);a.onsuccess=()=>t(s),a.onerror=r=>e(r.target.error)})}},V={person:{id:"person",label:"Person",icon:"👤",color:"#6366f1",fields:[{key:"role",label:"Role",type:"text"},{key:"affiliation",label:"Affiliation",type:"text"},{key:"motivation",label:"Motivation",type:"text"},{key:"appearance",label:"Appearance",type:"textarea"}]},location:{id:"location",label:"Location",icon:"📍",color:"#22c55e",fields:[{key:"region",label:"Region",type:"text"},{key:"climate",label:"Climate",type:"text"},{key:"pointsOfInterest",label:"Points of Interest",type:"textarea"}]},faction:{id:"faction",label:"Faction",icon:"🏛️",color:"#f59e0b",fields:[{key:"goals",label:"Goals",type:"textarea"},{key:"allies",label:"Allies",type:"text"},{key:"enemies",label:"Enemies",type:"text"}]},concept:{id:"concept",label:"Concept",icon:"💡",color:"#8b5cf6",fields:[{key:"domain",label:"Domain",type:"text"},{key:"principles",label:"Core Principles",type:"textarea"}]},event:{id:"event",label:"Event",icon:"📜",color:"#ef4444",fields:[{key:"era",label:"Era/Date",type:"text"},{key:"participants",label:"Participants",type:"text"},{key:"outcome",label:"Outcome",type:"textarea"}]},item:{id:"item",label:"Item",icon:"🎁",color:"#14b8a6",fields:[{key:"origin",label:"Origin",type:"text"},{key:"properties",label:"Properties",type:"textarea"}]}},q=s=>V[s]||V.item,H=()=>Object.values(V),_={id:"project",label:"Project",icon:"🏠",render:async(s,t)=>{try{await T.init()}catch(o){s.innerHTML=`<div class="text-muted">Vault Error: ${o.message}</div>`;return}const e=await T.list(),i={};H().forEach(o=>{i[o.id]=e.filter(c=>c.type===o.id).length});const n=e.reduce((o,c)=>{var d;return o+(((d=c.data.relationships)==null?void 0:d.length)||0)},0);s.innerHTML=`
            <div class="project-layout">
                <div class="project-content">
                    
                    <!-- Header -->
                    <div class="project-header">
                        <div class="project-icon">📖</div>
                        <input id="proj-title" type="text" value="${g.project.title}" 
                            placeholder="Setting Title" class="project-title">
                        <div class="project-author">
                            <input id="proj-author" type="text" value="${g.project.author}" 
                                placeholder="Author Name">
                        </div>
                    </div>

                    <!-- Stats Cards -->
                    <div class="stats-grid">
                        ${H().map(o=>`
                            <div class="stat-card" style="border-left-color: ${o.color};">
                                <div class="stat-icon">${o.icon}</div>
                                <div class="stat-value">${i[o.id]||0}</div>
                                <div class="stat-label">${o.label}s</div>
                            </div>
                        `).join("")}
                        <div class="stat-card">
                            <div class="stat-icon">🔗</div>
                            <div class="stat-value">${n}</div>
                            <div class="stat-label">Relationships</div>
                        </div>
                    </div>

                    <!-- Project Details -->
                    <div class="project-details">
                        <h3>Project Details</h3>
                        
                        <div class="details-grid">
                            <div class="detail-field">
                                <label class="label">Version</label>
                                <input id="proj-version" type="text" value="${g.project.version}" class="input">
                            </div>
                            <div class="detail-field">
                                <label class="label">Genre</label>
                                <input id="proj-genre" type="text" value="${g.project.genre}" 
                                    placeholder="Fantasy, Sci-Fi, Horror..." class="input">
                            </div>
                        </div>
                        
                        <div class="detail-field">
                            <label class="label">Compatible Game System</label>
                            <input id="proj-system" type="text" value="${g.project.system}" 
                                placeholder="D&D 5e, Pathfinder 2e, Fate Core..." class="input">
                        </div>

                        <div class="detail-field" style="margin-top: 16px;">
                            <label class="label">Description</label>
                            <textarea id="proj-description" rows="4" 
                                placeholder="Describe your setting..." class="textarea">${g.project.description}</textarea>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="quick-actions">
                        <button id="btn-export" class="action-btn">📤 Export Setting</button>
                        <button id="btn-import" class="action-btn">📥 Import Setting</button>
                    </div>
                    <input type="file" id="import-file" accept=".json" style="display:none;">
                </div>
            </div>
        `;const a=()=>{g.updateProject({title:s.querySelector("#proj-title").value,author:s.querySelector("#proj-author").value,version:s.querySelector("#proj-version").value,genre:s.querySelector("#proj-genre").value,system:s.querySelector("#proj-system").value,description:s.querySelector("#proj-description").value})};s.querySelectorAll("input, textarea").forEach(o=>{o.oninput=a}),s.querySelector("#btn-export").onclick=async()=>{const o={meta:g.project,entries:e,exportedAt:new Date().toISOString(),version:"1.0"},c=new Blob([JSON.stringify(o,null,2)],{type:"application/json"}),d=URL.createObjectURL(c),l=document.createElement("a");l.href=d,l.download=`${g.project.title.replace(/[^a-z0-9]/gi,"_")}_setting.json`,l.click(),URL.revokeObjectURL(d)};const r=s.querySelector("#import-file");s.querySelector("#btn-import").onclick=()=>r.click(),r.onchange=async o=>{var d;const c=o.target.files[0];if(c)try{const l=await c.text(),h=JSON.parse(l);if(h.meta&&g.updateProject(h.meta),h.entries&&Array.isArray(h.entries))for(const f of h.entries)await T.addItem(f.type,f.data);alert(`Imported ${((d=h.entries)==null?void 0:d.length)||0} entries!`),location.reload()}catch(l){alert("Import failed: "+l.message)}}}},U={parse(s){const t=s.trim().match(/^(\d+)?d(\d+)([+-]\d+)?$/i);return t?{count:parseInt(t[1])||1,sides:parseInt(t[2]),modifier:parseInt(t[3])||0}:null},rollOne(s){return Math.floor(Math.random()*s)+1},rollMany(s,t){const e=[];for(let i=0;i<s;i++)e.push(this.rollOne(t));return e},roll(s){const t=this.parse(s);if(!t)return{error:"Invalid format. Use NdX or NdX+Y (e.g., 2d6+3)"};const e=this.rollMany(t.count,t.sides),i=e.reduce((a,r)=>a+r,0),n=i+t.modifier;return{expression:s,rolls:e,subtotal:i,modifier:t.modifier,total:n}},format(s){if(s.error)return s.error;let t=`[${s.rolls.join(", ")}]`;return s.modifier!==0&&(t+=` ${s.modifier>0?"+":""}${s.modifier}`),t+=` = ${s.total}`,t},stats(s){const t=this.parse(s);if(!t)return null;const e=t.count+t.modifier,i=t.count*t.sides+t.modifier,n=(e+i)/2;return{min:e,max:i,average:n.toFixed(1)}}},B={runDiceSimulation(s,t=1e3){const e=[],i={};for(let m=0;m<t;m++){const y=U.roll(s);if(y.error)return{error:y.error};e.push(y.total),i[y.total]=(i[y.total]||0)+1}const n=[...e].sort((m,y)=>m-y),r=e.reduce((m,y)=>m+y,0)/t,c=e.map(m=>Math.pow(m-r,2)).reduce((m,y)=>m+y,0)/t,d=Math.sqrt(c);let l=null,h=0;for(const[m,y]of Object.entries(i))y>h&&(h=y,l=parseInt(m));const f=t%2===0?(n[t/2-1]+n[t/2])/2:n[Math.floor(t/2)],w=n[Math.floor(t*.25)],C=n[Math.floor(t*.75)];return{expression:s,iterations:t,results:e,distribution:i,stats:{min:n[0],max:n[n.length-1],mean:r.toFixed(2),median:f,mode:l,stdDev:d.toFixed(2),p25:w,p75:C}}},getHistogramData(s){if(s.error)return[];const{distribution:t,iterations:e,stats:i}=s,n=[];for(let a=i.min;a<=i.max;a++){const r=t[a]||0;n.push({value:a,count:r,percentage:(r/e*100).toFixed(1)})}return n},compare(s,t,e=1e3){const i=this.runDiceSimulation(s,e),n=this.runDiceSimulation(t,e);if(i.error||n.error)return{error:i.error||n.error};let a=0,r=0,o=0;for(let c=0;c<e;c++)i.results[c]>n.results[c]?a++:n.results[c]>i.results[c]?r++:o++;return{expr1:{expression:s,stats:i.stats},expr2:{expression:t,stats:n.stats},comparison:{wins1:a,wins2:r,ties:o,win1Pct:(a/e*100).toFixed(1),win2Pct:(r/e*100).toFixed(1),tiePct:(o/e*100).toFixed(1)}}}},X={id:"laboratory",label:"Laboratory",icon:"🧪",render:(s,t)=>{s.innerHTML=`
            <div class="laboratory-layout">
                <div class="laboratory-content">
                    <h1 class="laboratory-title">Laboratory</h1>
                    <p class="laboratory-description">
                        Test dice expressions and run probability simulations.
                    </p>
                    
                    <!-- Quick Roll -->
                    <div class="dice-roller">
                        <label class="label">Quick Roll</label>
                        <div class="dice-expression-row">
                            <input id="lab-expr" type="text" placeholder="e.g. 2d6+3" class="input flex-1" value="2d6">
                            <button id="lab-roll" class="btn btn-primary">Roll</button>
                        </div>
                        <div id="lab-stats" class="text-muted text-sm" style="margin-top:8px;"></div>
                        <div id="lab-result" class="dice-result">
                            Enter an expression and click Roll.
                        </div>
                    </div>

                    <!-- Simulation -->
                    <div class="simulation-section">
                        <h2 class="section-title">Probability Simulation</h2>
                        <div class="simulation-controls">
                            <div class="flex gap-sm">
                                <input id="sim-expr" type="text" placeholder="e.g. 3d6" class="input flex-1" value="2d6">
                                <select id="sim-iterations" class="input">
                                    <option value="100">100 rolls</option>
                                    <option value="1000" selected>1,000 rolls</option>
                                    <option value="10000">10,000 rolls</option>
                                </select>
                                <button id="sim-run" class="btn btn-primary">Run</button>
                            </div>
                        </div>
                        
                        <div id="sim-results" class="simulation-results" style="display:none;">
                            <div class="stats-row">
                                <div class="stat-box"><span id="stat-min">-</span><small>Min</small></div>
                                <div class="stat-box"><span id="stat-max">-</span><small>Max</small></div>
                                <div class="stat-box"><span id="stat-mean">-</span><small>Mean</small></div>
                                <div class="stat-box"><span id="stat-median">-</span><small>Median</small></div>
                                <div class="stat-box"><span id="stat-mode">-</span><small>Mode</small></div>
                                <div class="stat-box"><span id="stat-stddev">-</span><small>Std Dev</small></div>
                            </div>
                            <div id="histogram" class="histogram"></div>
                        </div>
                    </div>

                    <!-- Compare -->
                    <div class="compare-section">
                        <h2 class="section-title">Compare Expressions</h2>
                        <div class="compare-inputs">
                            <input id="cmp-expr1" type="text" placeholder="Expression 1" class="input" value="1d20">
                            <span class="text-muted">vs</span>
                            <input id="cmp-expr2" type="text" placeholder="Expression 2" class="input" value="2d10">
                            <button id="cmp-run" class="btn btn-secondary">Compare</button>
                        </div>
                        <div id="cmp-results" class="compare-results" style="display:none;"></div>
                    </div>
                </div>
            </div>
        `;const e=s.querySelector("#lab-expr"),i=s.querySelector("#lab-roll"),n=s.querySelector("#lab-result"),a=s.querySelector("#lab-stats");e.oninput=()=>{const m=U.stats(e.value);m?a.innerText=`Range: ${m.min}–${m.max} | Average: ${m.average}`:a.innerText=""},e.oninput(),i.onclick=()=>{const m=e.value.trim();if(!m)return;const y=U.roll(m);y.error?n.innerHTML=`<span style="color:var(--status-error);">${y.error}</span>`:n.innerHTML=`
                    <div><strong>Rolls:</strong> [${y.rolls.join(", ")}]</div>
                    ${y.modifier!==0?`<div><strong>Modifier:</strong> ${y.modifier>0?"+":""}${y.modifier}</div>`:""}
                    <div class="roll-total"><strong>Total:</strong> ${y.total}</div>
                `},e.onkeydown=m=>{m.key==="Enter"&&i.onclick()};const r=s.querySelector("#sim-expr"),o=s.querySelector("#sim-iterations"),c=s.querySelector("#sim-run"),d=s.querySelector("#sim-results"),l=s.querySelector("#histogram");c.onclick=()=>{const m=r.value.trim(),y=parseInt(o.value);m&&(c.disabled=!0,c.innerText="Running...",setTimeout(()=>{const x=B.runDiceSimulation(m,y);if(c.disabled=!1,c.innerText="Run",x.error){d.style.display="none",alert(x.error);return}d.style.display="block",s.querySelector("#stat-min").innerText=x.stats.min,s.querySelector("#stat-max").innerText=x.stats.max,s.querySelector("#stat-mean").innerText=x.stats.mean,s.querySelector("#stat-median").innerText=x.stats.median,s.querySelector("#stat-mode").innerText=x.stats.mode,s.querySelector("#stat-stddev").innerText=x.stats.stdDev;const u=B.getHistogramData(x),b=Math.max(...u.map(p=>p.count));l.innerHTML=u.map(p=>`
                    <div class="hist-bar-container">
                        <div class="hist-bar" style="height: ${p.count/b*100}%;" title="${p.value}: ${p.count} (${p.percentage}%)"></div>
                        <span class="hist-label">${p.value}</span>
                    </div>
                `).join("")},10))};const h=s.querySelector("#cmp-expr1"),f=s.querySelector("#cmp-expr2"),w=s.querySelector("#cmp-run"),C=s.querySelector("#cmp-results");w.onclick=()=>{const m=h.value.trim(),y=f.value.trim();if(!m||!y)return;const x=B.compare(m,y,1e3);if(x.error){C.style.display="none",alert(x.error);return}C.style.display="block",C.innerHTML=`
                <div class="compare-stat">
                    <strong>${m}</strong> wins <span class="highlight">${x.comparison.win1Pct}%</span> of the time
                    <small>(avg: ${x.expr1.stats.mean})</small>
                </div>
                <div class="compare-stat">
                    <strong>${y}</strong> wins <span class="highlight">${x.comparison.win2Pct}%</span> of the time
                    <small>(avg: ${x.expr2.stats.mean})</small>
                </div>
                <div class="compare-stat tie">
                    Ties: ${x.comparison.tiePct}%
                </div>
            `}}};class D{constructor(t={}){this.title=t.title||"Modal",this.content=t.content||"",this.actions=t.actions||[],this.onClose=t.onClose||null,this.element=null}show(){this.element=document.createElement("div"),this.element.className="modal-overlay",this.element.innerHTML=`
            <div class="modal-content">
                <h3 class="modal-title">${this.title}</h3>
                <div class="modal-body"></div>
                <div class="modal-actions"></div>
            </div>
        `;const t=this.element.querySelector(".modal-body");typeof this.content=="string"?t.innerHTML=this.content:this.content instanceof HTMLElement&&t.appendChild(this.content);const e=this.element.querySelector(".modal-actions");this.actions.forEach(i=>{const n=document.createElement("button");n.className=i.className||"btn btn-secondary",n.innerText=i.label,n.onclick=()=>{i.onClick&&i.onClick(this)},e.appendChild(n)}),this.element.onclick=i=>{i.target===this.element&&this.close()},document.body.appendChild(this.element)}close(){this.element&&(this.element.remove(),this.element=null),this.onClose&&this.onClose()}getBody(){var t;return(t=this.element)==null?void 0:t.querySelector(".modal-body")}static confirm(t,e){return new Promise(i=>{const n=new D({title:t,content:`<p>${e}</p>`,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:()=>{n.close(),i(!1)}},{label:"Confirm",className:"btn btn-primary",onClick:()=>{n.close(),i(!0)}}]});n.show()})}static alert(t,e){return new Promise(i=>{const n=new D({title:t,content:`<p>${e}</p>`,actions:[{label:"OK",className:"btn btn-primary",onClick:()=>{n.close(),i()}}]});n.show()})}}class Z{constructor(t,e={}){this.container=t,this.items=[],this.activeCategory=null,this.activeItemId=null,this.onSelect=e.onSelect||null,this.onCreate=e.onCreate||null}setItems(t){this.items=t,this.render()}setActiveItem(t){this.activeItemId=t,this.renderList()}render(){this.container.innerHTML=`
            <div id="category-tabs" class="library-tabs"></div>
            <div class="library-search-bar">
                <input id="lib-search" type="text" placeholder="Search..." class="input">
                <button id="lib-add-btn" class="btn btn-primary">+</button>
            </div>
            <div id="lib-list" class="library-list"></div>
        `,this.tabsEl=this.container.querySelector("#category-tabs"),this.searchInput=this.container.querySelector("#lib-search"),this.listEl=this.container.querySelector("#lib-list"),this.addBtn=this.container.querySelector("#lib-add-btn"),this.renderTabs(),this.renderList(),this.searchInput.oninput=()=>this.renderList(),this.addBtn.onclick=()=>{this.onCreate&&this.onCreate()}}renderTabs(){this.tabsEl.innerHTML="";const t=document.createElement("button");t.innerText="All",t.className="tab"+(this.activeCategory===null?" active":""),t.onclick=()=>{this.activeCategory=null,this.renderTabs(),this.renderList()},this.tabsEl.appendChild(t),H().forEach(e=>{const i=document.createElement("button");i.innerText=`${e.icon} ${e.label}`,i.className="tab"+(this.activeCategory===e.id?" active":""),this.activeCategory===e.id&&(i.style.background=e.color,i.style.borderColor=e.color),i.onclick=()=>{this.activeCategory=e.id,this.renderTabs(),this.renderList()},this.tabsEl.appendChild(i)})}renderList(){var n;if(!this.listEl)return;this.listEl.innerHTML="";const t=((n=this.searchInput)==null?void 0:n.value.toLowerCase())||"",e=this.activeCategory,i=this.items.filter(a=>{const r=(a.data.name||"").toLowerCase().includes(t),o=e?a.type===e:!0;return r&&o});if(i.length===0){this.listEl.innerHTML='<div class="library-list-empty">No entries found.</div>';return}i.forEach(a=>{const r=q(a.type),o=this.activeItemId===a.id,c=document.createElement("div");c.className="list-item"+(o?" active":""),c.innerHTML=`
                <span>${r.icon}</span>
                <span class="flex-1" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${a.data.name||"Untitled"}</span>
            `,c.onclick=()=>{this.onSelect&&this.onSelect(a)},this.listEl.appendChild(c)})}}class tt{constructor(t,e="",i={}){this.container=t,this.value=e,this.onChange=null,this.onLinkClick=i.onLinkClick||null,this.getEntries=i.getEntries||(()=>[])}render(){this.container.innerHTML=`
            <div class="rte-wrapper">
                <!-- Toolbar -->
                <div class="rte-toolbar">
                    <button data-cmd="bold" title="Bold" class="rte-btn rte-btn-bold">B</button>
                    <button data-cmd="italic" title="Italic" class="rte-btn rte-btn-italic">I</button>
                    <div class="rte-divider"></div>
                    <button data-cmd="h2" title="Header" class="rte-btn">H2</button>
                    <button data-cmd="h3" title="Subheader" class="rte-btn">H3</button>
                    <div class="rte-divider"></div>
                    <button data-cmd="insertUnorderedList" title="Bullet List" class="rte-btn">• List</button>
                    <div class="rte-divider"></div>
                    <button data-cmd="link" title="Insert Link [[]]" class="rte-btn">🔗</button>
                </div>

                <!-- Editable Area -->
                <div class="rte-content" contenteditable="true">
                    ${this.renderWithLinks(this.value)}
                </div>

                <!-- Autocomplete Dropdown -->
                <div class="rte-autocomplete"></div>
            </div>
        `,this.editor=this.container.querySelector(".rte-content"),this.autocomplete=this.container.querySelector(".rte-autocomplete"),this.bindEvents()}renderWithLinks(t){return t.replace(/\[\[([^\]]+)\]\]/g,(e,i)=>`<span class="wiki-link" data-link="${i}">[[${i}]]</span>`)}extractRawText(t){const e=document.createElement("div");return e.innerHTML=t,e.querySelectorAll(".wiki-link").forEach(i=>{i.replaceWith(`[[${i.dataset.link}]]`)}),e.innerHTML}bindEvents(){this.container.querySelectorAll("button[data-cmd]").forEach(t=>{t.onclick=e=>{e.preventDefault();const i=t.dataset.cmd;i==="link"?this.insertLinkPlaceholder():i==="h2"||i==="h3"?document.execCommand("formatBlock",!1,i):document.execCommand(i,!1,null),this.editor.focus()}}),this.editor.oninput=()=>{this.checkForAutocomplete(),this.value=this.extractRawText(this.editor.innerHTML),this.onChange&&this.onChange(this.value)},this.editor.onclick=t=>{if(t.target.classList.contains("wiki-link")){const e=t.target.dataset.link;this.onLinkClick&&this.onLinkClick(e)}},this.editor.onkeydown=t=>{if(this.autocomplete.style.display!=="none")if(t.key==="ArrowDown"||t.key==="ArrowUp")t.preventDefault(),this.navigateAutocomplete(t.key==="ArrowDown"?1:-1);else if(t.key==="Enter"||t.key==="Tab"){const e=this.autocomplete.querySelector(".selected");e&&(t.preventDefault(),this.selectAutocompleteItem(e.dataset.name))}else t.key==="Escape"&&this.hideAutocomplete()},this.editor.onblur=()=>{setTimeout(()=>this.hideAutocomplete(),150)}}insertLinkPlaceholder(){document.execCommand("insertText",!1,"[[]]");const t=window.getSelection();if(t.rangeCount){const e=t.getRangeAt(0);e.setStart(e.startContainer,e.startOffset-2),e.collapse(!0),t.removeAllRanges(),t.addRange(e)}}checkForAutocomplete(){const t=window.getSelection();if(!t.rangeCount)return;const e=t.getRangeAt(0),i=e.startContainer;if(i.nodeType!==Node.TEXT_NODE)return;const a=i.textContent.substring(0,e.startOffset).match(/\[\[([^\]]*?)$/);if(a){const r=a[1].toLowerCase(),o=this.getEntries().filter(c=>(c.data.name||"").toLowerCase().includes(r)).slice(0,8);o.length>0?this.showAutocomplete(o):this.hideAutocomplete()}else this.hideAutocomplete()}showAutocomplete(t){this.autocomplete.innerHTML="",t.forEach((e,i)=>{const n=document.createElement("div");n.dataset.name=e.data.name,n.className="rte-autocomplete-item"+(i===0?" selected":""),n.innerText=e.data.name||"Untitled",n.onmousedown=a=>{a.preventDefault(),this.selectAutocompleteItem(e.data.name)},this.autocomplete.appendChild(n)}),this.autocomplete.style.display="block",this.autocomplete.style.left="16px",this.autocomplete.style.bottom="16px"}hideAutocomplete(){this.autocomplete.style.display="none"}navigateAutocomplete(t){var a,r;const e=Array.from(this.autocomplete.children),i=e.findIndex(o=>o.classList.contains("selected"));(a=e[i])==null||a.classList.remove("selected");const n=Math.max(0,Math.min(e.length-1,i+t));(r=e[n])==null||r.classList.add("selected")}selectAutocompleteItem(t){const e=window.getSelection();if(!e.rangeCount)return;const i=e.getRangeAt(0),n=i.startContainer;if(n.nodeType!==Node.TEXT_NODE)return;const a=n.textContent,r=a.substring(0,i.startOffset);if(r.match(/\[\[([^\]]*?)$/)){const c=r.lastIndexOf("[["),d=a.substring(i.startOffset),l=d.indexOf("]]"),h=l>=0?d.substring(l+2):d,f=document.createElement("span");f.className="wiki-link",f.dataset.link=t,f.innerText=`[[${t}]]`;const w=document.createTextNode(a.substring(0,c)),C=document.createTextNode(" "+h),m=n.parentNode;m.insertBefore(w,n),m.insertBefore(f,n),m.insertBefore(C,n),m.removeChild(n);const y=document.createRange();y.setStartAfter(f),y.collapse(!0),e.removeAllRanges(),e.addRange(y)}this.hideAutocomplete(),this.value=this.extractRawText(this.editor.innerHTML),this.onChange&&this.onChange(this.value)}getValue(){return this.extractRawText(this.editor.innerHTML)}setValue(t){this.value=t,this.editor&&(this.editor.innerHTML=this.renderWithLinks(t))}}class et{constructor(t,e={}){this.container=t,this.item=null,this.onSave=e.onSave||null,this.onNameChange=e.onNameChange||null,this.onLinkClick=e.onLinkClick||null,this.getEntries=e.getEntries||(()=>[]),this.editorInstance=null}setItem(t){this.item=t,t?this.render():this.showEmpty()}showEmpty(){this.container.innerHTML=`
            <div class="empty-state">
                <h2>Select an entry</h2>
                <p>Or create a new one to start building your world.</p>
            </div>
        `}render(){if(!this.item)return this.showEmpty();const t=q(this.item.type);this.container.innerHTML=`
            <div class="library-editor active">
                <div class="entry-header">
                    <span id="entry-icon" class="entry-icon">${t.icon}</span>
                    <input id="asset-title" type="text" placeholder="Entry Name" 
                        value="${this.item.data.name||""}" class="input-title entry-title">
                    <span id="entry-category-badge" class="badge" 
                        style="background:${t.color}; color:#fff;">${t.label}</span>
                </div>
                
                <div id="metadata-fields" class="metadata-grid"></div>
                
                <div class="description-label">Description</div>
                <div id="asset-rte-mount" class="description-editor"></div>
                
                <div id="save-status" class="save-status">Saved</div>
            </div>
        `;const e=this.container.querySelector("#asset-title"),i=this.container.querySelector("#metadata-fields"),n=this.container.querySelector("#asset-rte-mount");this.container.querySelector("#save-status"),t.fields.forEach(o=>{const c=document.createElement("div");c.className="metadata-field";const d=document.createElement("label");d.innerText=o.label,d.className="label";let l;o.type==="textarea"?(l=document.createElement("textarea"),l.rows=2,l.className="textarea"):(l=document.createElement("input"),l.type="text",l.className="input"),l.value=this.item.data[o.key]||"",l.oninput=()=>{this.item.data[o.key]=l.value,this.save()},c.appendChild(d),c.appendChild(l),i.appendChild(c)});const a=new tt(n,this.item.data.description||"",{getEntries:this.getEntries,onLinkClick:this.onLinkClick});a.render(),this.editorInstance=a,a.onChange=o=>{this.item.data.description=o,this.save()};let r=null;e.oninput=()=>{this.item.data.name=e.value,this.save(),clearTimeout(r),r=setTimeout(()=>{this.onNameChange&&this.onNameChange(this.item)},300)}}async save(){const t=this.container.querySelector("#save-status");t&&(t.innerText="Saving..."),this.onSave&&await this.onSave(this.item),t&&(t.innerText="Saved")}}const O={member_of:{id:"member_of",label:"Member of",icon:"👥",inverse:"has_member",description:"This entry is a member of the target."},has_member:{id:"has_member",label:"Has Member",icon:"👤",inverse:"member_of",description:"The target is a member of this entry."},located_in:{id:"located_in",label:"Located in",icon:"📍",inverse:"contains",description:"This entry is located within the target."},contains:{id:"contains",label:"Contains",icon:"🗺️",inverse:"located_in",description:"This entry contains the target."},ally_of:{id:"ally_of",label:"Ally of",icon:"🤝",inverse:"ally_of",description:"This entry is allied with the target."},enemy_of:{id:"enemy_of",label:"Enemy of",icon:"⚔️",inverse:"enemy_of",description:"This entry is an enemy of the target."},parent_of:{id:"parent_of",label:"Parent of",icon:"👨‍👧",inverse:"child_of",description:"This entry is the parent of the target."},child_of:{id:"child_of",label:"Child of",icon:"👶",inverse:"parent_of",description:"This entry is the child of the target."},related_to:{id:"related_to",label:"Related to",icon:"🔗",inverse:"related_to",description:"Generic relationship."},created_by:{id:"created_by",label:"Created by",icon:"🛠️",inverse:"creator_of",description:"This entry was created by the target."},creator_of:{id:"creator_of",label:"Creator of",icon:"✨",inverse:"created_by",description:"This entry created the target."}},F=s=>O[s]||O.related_to,st=()=>Object.values(O);class it{constructor(t,e={}){this.container=t,this.item=null,this.allItems=[],this.onSave=e.onSave||null,this.onNavigate=e.onNavigate||null}setItem(t,e){this.item=t,this.allItems=e,t&&this.render()}render(){this.item&&(this.item.data.relationships||(this.item.data.relationships=[]),this.container.innerHTML=`
            <div class="relationships-header">
                <div class="label">Relationships</div>
                <button id="add-relationship-btn" class="btn btn-primary" style="padding:4px 10px; font-size:11px;">+ Add</button>
            </div>
            <div id="relationships-list" class="relationships-list"></div>
            <div id="back-references" class="back-references"></div>
        `,this.renderRelationships(),this.container.querySelector("#add-relationship-btn").onclick=()=>this.showAddModal())}renderRelationships(){const t=this.container.querySelector("#relationships-list"),e=this.container.querySelector("#back-references");t.innerHTML="",this.item.data.relationships.length===0?t.innerHTML='<div class="text-muted text-sm">No relationships defined.</div>':(this.item.data.relationships.forEach((n,a)=>{const r=F(n.type),o=this.allItems.find(h=>h.id===n.targetId),c=o?o.data.name||"Untitled":"(Deleted)",d=o?q(o.type):{icon:"❓"},l=document.createElement("div");l.className="relationship-row",l.innerHTML=`
                    <span>${r.icon}</span>
                    <span class="relationship-type">${r.label}</span>
                    <span class="relationship-target" data-id="${n.targetId}">${d.icon} ${c}</span>
                    <button class="relationship-delete" data-idx="${a}">×</button>
                `,t.appendChild(l)}),t.querySelectorAll(".relationship-target").forEach(n=>{n.onclick=()=>{const a=this.allItems.find(r=>r.id===n.dataset.id);a&&this.onNavigate&&this.onNavigate(a)}}),t.querySelectorAll(".relationship-delete").forEach(n=>{n.onclick=()=>{this.item.data.relationships.splice(parseInt(n.dataset.idx),1),this.onSave&&this.onSave(this.item),this.renderRelationships()}}));const i=this.allItems.filter(n=>{var a;return n.id!==this.item.id&&((a=n.data.relationships)==null?void 0:a.some(r=>r.targetId===this.item.id))});e.innerHTML="",i.length===0?e.innerHTML='<div class="text-muted text-xs">No incoming references.</div>':(e.innerHTML='<div class="back-ref-label">Referenced by:</div>',i.forEach(n=>{const a=q(n.type);n.data.relationships.filter(o=>o.targetId===this.item.id).forEach(o=>{const c=F(o.type),d=O[c.inverse],l=document.createElement("div");l.className="back-ref-item",l.innerHTML=`<span>${a.icon}</span> ${n.data.name||"Untitled"} <span class="text-muted">(${(d==null?void 0:d.label)||c.label})</span>`,l.onclick=()=>{this.onNavigate&&this.onNavigate(n)},e.appendChild(l)})}))}showAddModal(){const t=document.createElement("div");t.className="flex flex-col gap-md",t.innerHTML=`
            <div>
                <label class="label">Type</label>
                <select id="rel-type-select" class="input" style="width:100%; margin-top:4px;"></select>
            </div>
            <div>
                <label class="label">Target Entry</label>
                <select id="rel-target-select" class="input" style="width:100%; margin-top:4px;"></select>
            </div>
        `,new D({title:"Add Relationship",content:t,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:a=>a.close()},{label:"Add",className:"btn btn-primary",onClick:a=>{const r=t.querySelector("#rel-type-select"),o=t.querySelector("#rel-target-select"),c=r.value,d=o.value;c&&d&&(this.item.data.relationships.push({type:c,targetId:d}),this.onSave&&this.onSave(this.item),this.renderRelationships()),a.close()}}]}).show();const i=t.querySelector("#rel-type-select"),n=t.querySelector("#rel-target-select");st().forEach(a=>{const r=document.createElement("option");r.value=a.id,r.innerText=`${a.icon} ${a.label}`,i.appendChild(r)}),this.allItems.filter(a=>a.id!==this.item.id).forEach(a=>{const r=q(a.type),o=document.createElement("option");o.value=a.id,o.innerText=`${r.icon} ${a.data.name||"Untitled"}`,n.appendChild(o)})}}const v={id:"library",label:"Library",icon:"📚",entryList:null,entryEditor:null,relationshipManager:null,allItems:[],activeItem:null,render:async(s,t)=>{try{await T.init()}catch(a){s.innerHTML=`<div class="text-muted">Vault Error: ${a.message}</div>`;return}s.innerHTML=`
            <div class="library-layout">
                <div id="lib-sidebar" class="library-sidebar"></div>
                <div id="lib-main" class="library-main">
                    <div id="lib-editor-area"></div>
                    <div id="lib-relationships-area" class="relationships-section" style="display:none;"></div>
                </div>
            </div>
        `;const e=s.querySelector("#lib-sidebar"),i=s.querySelector("#lib-editor-area"),n=s.querySelector("#lib-relationships-area");if(v.allItems=await T.list(),v.entryList=new Z(e,{onSelect:a=>v.selectItem(a,i,n),onCreate:()=>v.showCreateModal()}),v.entryList.setItems(v.allItems),v.entryEditor=new et(i,{onSave:async a=>{await T.updateItem(a)},onNameChange:a=>{v.entryList.setItems(v.allItems)},onLinkClick:a=>{const r=v.allItems.find(o=>(o.data.name||"").toLowerCase()===a.toLowerCase());r&&v.selectItem(r,i,n)},getEntries:()=>v.allItems}),v.entryEditor.showEmpty(),v.relationshipManager=new it(n,{onSave:async a=>{await T.updateItem(a)},onNavigate:a=>{v.selectItem(a,i,n)}}),g.session.activeEntryId){const a=v.allItems.find(r=>r.id===g.session.activeEntryId);a&&v.selectItem(a,i,n)}},selectItem(s,t,e){v.activeItem=s,v.entryList.setActiveItem(s.id),v.entryEditor.setItem(s),e.style.display="block",v.relationshipManager.setItem(s,v.allItems),g.updateSession({activeEntryId:s.id})},showCreateModal(){const s=document.createElement("div");s.className="grid-3",H().forEach(e=>{const i=document.createElement("button");i.className="btn btn-secondary",i.style.cssText="flex-direction:column; padding:12px;",i.innerHTML=`<span style="font-size:20px;">${e.icon}</span><span class="text-xs">${e.label}</span>`,i.onclick=async()=>{t.close();const n=await T.addItem(e.id,{name:`New ${e.label}`,description:""});v.allItems.push(n),v.entryList.setItems(v.allItems);const a=document.querySelector("#lib-editor-area"),r=document.querySelector("#lib-relationships-area");v.selectItem(n,a,r)},s.appendChild(i)});const t=new D({title:"Create New Entry",content:s,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:e=>e.close()}]});t.show()}};class nt{constructor(t,e,i){this.container=t,this.nodeLayer=e,this.svgLayer=i,this.nodes=[],this.links=[],this.transform={x:0,y:0,scale:1},this.isDragging=!1,this.lastMouse={x:0,y:0},this.onDataChange=null}init(){this.container.onmousedown=t=>{(t.button===1||t.button===0&&t.altKey)&&(this.isDragging=!0,this.lastMouse={x:t.clientX,y:t.clientY},this.container.style.cursor="grabbing",t.preventDefault())},window.onmousemove=t=>{if(this.isDragging){const e=t.clientX-this.lastMouse.x,i=t.clientY-this.lastMouse.y;this.transform.x+=e,this.transform.y+=i,this.lastMouse={x:t.clientX,y:t.clientY},this.updateTransform()}},window.onmouseup=t=>{this.isDragging=!1,this.container.style.cursor="default"},this.container.onwheel=t=>{t.preventDefault();const e=t.deltaY>0?.9:1.1;this.transform.scale*=e,this.transform.scale=Math.min(Math.max(.2,this.transform.scale),2),this.updateTransform()}}exportData(){return{nodes:this.nodes,links:this.links,transform:this.transform}}importData(t){t&&(this.nodes=[],this.nodeLayer.innerHTML="",t.transform&&(this.transform=t.transform,this.updateTransform()),t.nodes&&t.nodes.forEach(e=>this.addNode(e,!0)),this.links=t.links||[],this.updateLinks())}notifyChange(){this.onDataChange&&this.onDataChange(this.exportData())}updateTransform(){this.nodeLayer.style.transform=`translate(${this.transform.x}px, ${this.transform.y}px) scale(${this.transform.scale})`,this.updateLinks()}resetView(){this.transform={x:0,y:0,scale:1},this.updateTransform()}addNode(t,e=!1){this.nodes.push(t);const i=this.renderNodeElement(t);this.nodeLayer.appendChild(i),e||this.notifyChange()}renderNodeElement(t){const e=document.createElement("div");e.className="node"+(t.type?` ${t.type}`:""),e.id=t.id,e.style.left=t.x+"px",e.style.top=t.y+"px";let i=(t.inputs||[]).map(h=>`
            <div class="socket-row">
                <div class="socket input" title="${h}"></div>
                <span>${h}</span>
            </div>
        `).join(""),n=(t.outputs||[]).map(h=>`
            <div class="socket-row" style="justify-content: flex-end;">
                <span>${h}</span>
                <div class="socket output" title="${h}"></div>
            </div>
        `).join("");e.innerHTML=`
            <div class="node-header">${t.title}</div>
            <div class="node-body">
                ${i}
                <!-- Body content could go here -->
                ${n}
            </div>
        `;const a=e.querySelector(".node-header");let r=!1,o={x:0,y:0},c={x:t.x,y:t.y};a.onmousedown=h=>{h.button===0&&(r=!0,o={x:h.clientX,y:h.clientY},c={x:t.x,y:t.y},e.classList.add("selected"),h.stopPropagation())};const d=h=>{if(r){const f=(h.clientX-o.x)/this.transform.scale,w=(h.clientY-o.y)/this.transform.scale;t.x=c.x+f,t.y=c.y+w,e.style.left=t.x+"px",e.style.top=t.y+"px",this.updateLinks()}},l=()=>{r&&(r=!1,e.classList.remove("selected"),this.notifyChange())};return window.addEventListener("mousemove",d),window.addEventListener("mouseup",l),e}updateLinks(){if(this.svgLayer.innerHTML="",this.nodes.length>=2){const t=this.nodes[0],e=this.nodes[1],i=(t.x+200)*this.transform.scale+this.transform.x,n=(t.y+40)*this.transform.scale+this.transform.y,a=e.x*this.transform.scale+this.transform.x,r=(e.y+40)*this.transform.scale+this.transform.y,o=document.createElementNS("http://www.w3.org/2000/svg","path"),c=i+50*this.transform.scale,d=a-50*this.transform.scale,l=`M ${i} ${n} C ${c} ${n}, ${d} ${r}, ${a} ${r}`;o.setAttribute("d",l),o.setAttribute("class","connection-line"),this.svgLayer.appendChild(o)}}}const z={event:{id:"event",label:"Event",icon:"⚡",color:"#4ade80",description:'Triggers like "On Combat Start", "On Turn Begin"',templates:[{title:"On Start",outputs:["next"]},{title:"On Turn Begin",outputs:["next"]},{title:"On Attack",inputs:["attacker","target"],outputs:["next"]},{title:"On Damage",inputs:["target","amount"],outputs:["next"]}]},condition:{id:"condition",label:"Condition",icon:"❓",color:"#facc15",description:"If/else branching logic",templates:[{title:"If Greater Than",inputs:["a","b"],outputs:["true","false"]},{title:"If Equal",inputs:["a","b"],outputs:["true","false"]},{title:"If Has Tag",inputs:["target","tag"],outputs:["true","false"]},{title:"Compare Roll",inputs:["roll","dc"],outputs:["success","failure"]}]},action:{id:"action",label:"Action",icon:"🎲",color:"#60a5fa",description:"Roll dice, modify values, apply effects",templates:[{title:"Roll Dice",inputs:["expression"],outputs:["result","next"]},{title:"Add Value",inputs:["a","b"],outputs:["result"]},{title:"Apply Damage",inputs:["target","amount"],outputs:["next"]},{title:"Set Variable",inputs:["name","value"],outputs:["next"]}]},reference:{id:"reference",label:"Reference",icon:"📚",color:"#c084fc",description:"Link to Library entries (items, abilities, characters)",templates:[]}};class at{constructor(t={}){this.onSelect=t.onSelect||null}async show(){const t=document.createElement("div");t.className="node-picker";const e=document.createElement("div");e.className="library-tabs",e.style.marginBottom="16px";const i=document.createElement("div");i.className="node-picker-panels";const n=async r=>{e.querySelectorAll(".tab").forEach(c=>{c.classList.toggle("active",c.dataset.type===r)}),i.innerHTML="";const o=z[r];if(r==="reference"){await T.init();const c=await T.list();if(c.length===0){i.innerHTML='<div class="text-muted">No Library entries. Create entries in the Library first.</div>';return}const d=document.createElement("div");d.className="grid-2",d.style.gap="8px",c.forEach(l=>{const h=q(l.type),f=document.createElement("button");f.className="btn btn-secondary",f.style.cssText="justify-content:flex-start; padding:8px 12px; text-align:left;",f.innerHTML=`<span style="margin-right:8px;">${h.icon}</span> ${l.data.name||"Untitled"}`,f.onclick=()=>{this.onSelect&&this.onSelect({type:"reference",title:`📚 ${l.data.name||"Untitled"}`,entryId:l.id,entryType:l.type,inputs:["in"],outputs:["out","data"]}),a.close()},d.appendChild(f)}),i.appendChild(d)}else{const c=document.createElement("div");c.className="grid-2",c.style.gap="8px",o.templates.forEach(d=>{const l=document.createElement("button");l.className="btn btn-secondary",l.style.cssText="justify-content:flex-start; padding:8px 12px;",l.innerHTML=`<span style="margin-right:8px;">${o.icon}</span> ${d.title}`,l.onclick=()=>{this.onSelect&&this.onSelect({type:r,title:d.title,inputs:d.inputs||[],outputs:d.outputs||[]}),a.close()},c.appendChild(l)}),i.appendChild(c)}};Object.values(z).forEach(r=>{const o=document.createElement("button");o.className="tab",o.dataset.type=r.id,o.innerHTML=`${r.icon} ${r.label}`,o.onclick=()=>n(r.id),e.appendChild(o)}),t.appendChild(e),t.appendChild(i);const a=new D({title:"Add Node",content:t,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:r=>r.close()}]});a.show(),await n("event")}}const J={id:"architect",label:"Architect",icon:"📐",render:(s,t)=>{s.style.padding="0",s.innerHTML=`
            <div class="architect-workspace" id="arch-workspace">
                <div class="connection-layer" id="arch-connections">
                    <svg width="100%" height="100%" id="arch-svg"></svg>
                </div>
                <div class="node-layer" id="arch-nodes"></div>
                
                <div class="architect-toolbar">
                    <button class="btn btn-primary" id="btn-add-node">+ Add Node</button>
                    <button class="btn btn-secondary" id="btn-reset-view">Center</button>
                    <button class="btn btn-secondary" id="btn-clear-all">Clear</button>
                    <div class="toolbar-divider"></div>
                    <span class="toolbar-hint">Pan: Middle Click / Alt+Drag</span>
                </div>
            </div>
        `;const e=s.querySelector("#arch-workspace"),i=s.querySelector("#arch-nodes"),n=s.querySelector("#arch-svg"),a=new nt(e,i,n);a.init();const r=new at({onSelect:l=>{a.addNode({id:P.generateId("node"),x:100+Math.random()*100,y:100+Math.random()*100,type:l.type,title:l.title,inputs:l.inputs||[],outputs:l.outputs||[],entryId:l.entryId||null,entryType:l.entryType||null})}});s.querySelector("#btn-add-node").onclick=()=>{r.show()},s.querySelector("#btn-reset-view").onclick=()=>{a.resetView()},s.querySelector("#btn-clear-all").onclick=()=>{confirm("Clear all nodes?")&&(a.nodes=[],a.links=[],i.innerHTML="",n.innerHTML="",a.notifyChange())};const o="samildanach_architect_layout";a.onDataChange=l=>{localStorage.setItem(o,JSON.stringify(l))};const c=localStorage.getItem(o);if(c)try{const l=JSON.parse(c);a.importData(l)}catch(l){console.error("Failed to load architect layout:",l),d()}else d();function d(){a.nodes.length===0&&(a.addNode({id:"start",x:50,y:50,type:"event",title:"On Attack",inputs:["attacker","target"],outputs:["next"]}),a.addNode({id:"d20",x:300,y:100,type:"action",title:"Roll Dice",inputs:["expression"],outputs:["result","next"]}),a.addNode({id:"check",x:550,y:50,type:"condition",title:"Compare Roll",inputs:["roll","dc"],outputs:["success","failure"]}))}}},K={id:"graph",label:"Graph",icon:"🕸️",render:async(s,t)=>{try{await T.init()}catch(u){s.innerHTML=`<div class="text-muted">Vault Error: ${u.message}</div>`;return}s.style.padding="0",s.innerHTML=`
            <div class="graph-layout">
                <!-- Toolbar -->
                <div class="graph-toolbar">
                    <span class="graph-toolbar-icon">🕸️</span>
                    <span class="graph-toolbar-title">World Graph</span>
                    <span class="toolbar-spacer"></span>
                    <button id="graph-reset" class="btn btn-secondary">Reset View</button>
                    <button id="graph-relayout" class="btn btn-primary">Re-layout</button>
                </div>
                
                <!-- Canvas -->
                <div id="graph-container" class="graph-container">
                    <canvas id="graph-canvas" class="graph-canvas"></canvas>
                    <div id="graph-nodes" class="graph-nodes"></div>
                </div>
            </div>
        `;const e=s.querySelector("#graph-container"),i=s.querySelector("#graph-canvas"),n=i.getContext("2d"),a=()=>{i.width=e.clientWidth,i.height=e.clientHeight};a(),window.addEventListener("resize",a);const r=await T.list(),o=r.map((u,b)=>{const p=q(u.type),S=b/r.length*Math.PI*2,E=Math.min(i.width,i.height)*.3;return{id:u.id,item:u,label:u.data.name||"Untitled",icon:p.icon,color:p.color,x:i.width/2+Math.cos(S)*E,y:i.height/2+Math.sin(S)*E,vx:0,vy:0}}),c=Object.fromEntries(o.map(u=>[u.id,u])),d=[];r.forEach(u=>{(u.data.relationships||[]).forEach(b=>{if(c[b.targetId]){const p=F(b.type);d.push({from:u.id,to:b.targetId,label:p.label,color:p.icon})}})});let l={x:0,y:0,scale:1},h=!1,f={x:0,y:0},w=null;const C=()=>{n.clearRect(0,0,i.width,i.height),n.save(),n.translate(l.x,l.y),n.scale(l.scale,l.scale),n.lineWidth=2,d.forEach(u=>{const b=c[u.from],p=c[u.to];b&&p&&(n.strokeStyle="rgba(100, 116, 139, 0.5)",n.beginPath(),n.moveTo(b.x,b.y),n.lineTo(p.x,p.y),n.stroke())}),o.forEach(u=>{n.fillStyle=u.color||"#6366f1",n.beginPath(),n.arc(u.x,u.y,24,0,Math.PI*2),n.fill(),n.font="16px sans-serif",n.textAlign="center",n.textBaseline="middle",n.fillStyle="#fff",n.fillText(u.icon,u.x,u.y),n.font="11px sans-serif",n.fillStyle="var(--text-primary)",n.fillText(u.label,u.x,u.y+36)}),n.restore()},m=()=>{const u=i.width/2,b=i.height/2;o.forEach(p=>{o.forEach(S=>{if(p.id===S.id)return;const E=p.x-S.x,L=p.y-S.y,I=Math.sqrt(E*E+L*L)||1,M=5e3/(I*I);p.vx+=E/I*M,p.vy+=L/I*M}),p.vx+=(u-p.x)*.001,p.vy+=(b-p.y)*.001}),d.forEach(p=>{const S=c[p.from],E=c[p.to];if(S&&E){const L=E.x-S.x,I=E.y-S.y,M=Math.sqrt(L*L+I*I)||1,j=(M-150)*.01;S.vx+=L/M*j,S.vy+=I/M*j,E.vx-=L/M*j,E.vy-=I/M*j}}),o.forEach(p=>{w!==p&&(p.x+=p.vx*.1,p.y+=p.vy*.1),p.vx*=.9,p.vy*=.9}),C(),requestAnimationFrame(m)};m();const y=u=>({x:(u.offsetX-l.x)/l.scale,y:(u.offsetY-l.y)/l.scale}),x=(u,b)=>o.find(p=>{const S=p.x-u,E=p.y-b;return Math.sqrt(S*S+E*E)<24});i.onmousedown=u=>{const b=y(u),p=x(b.x,b.y);p?w=p:(h=!0,f={x:u.clientX,y:u.clientY})},i.onmousemove=u=>{if(w){const b=y(u);w.x=b.x,w.y=b.y}else h&&(l.x+=u.clientX-f.x,l.y+=u.clientY-f.y,f={x:u.clientX,y:u.clientY})},i.onmouseup=()=>{w=null,h=!1},i.onwheel=u=>{u.preventDefault();const b=u.deltaY>0?.9:1.1;l.scale*=b,l.scale=Math.min(Math.max(.3,l.scale),3)},s.querySelector("#graph-reset").onclick=()=>{l={x:0,y:0,scale:1}},s.querySelector("#graph-relayout").onclick=()=>{o.forEach((u,b)=>{const p=b/o.length*Math.PI*2,S=Math.min(i.width,i.height)*.3;u.x=i.width/2+Math.cos(p)*S,u.y=i.height/2+Math.sin(p)*S,u.vx=0,u.vy=0})}}};async function ot(){console.log(`%c Samildánach v${g.project.version} `,"background: #222; color: #bada55"),$.registerPanel(_.id,_),$.registerPanel(v.id,v),$.registerPanel(K.id,K),$.registerPanel(J.id,J),$.registerPanel(X.id,X),$.init(),$.activePanelId||$.switchPanel(_.id)}window.addEventListener("DOMContentLoaded",ot);
