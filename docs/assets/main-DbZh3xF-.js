(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const l of a.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function e(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(i){if(i.ep)return;i.ep=!0;const a=e(i);fetch(i.href,a)}})();const G="samildanach_state",f={project:{title:"Untitled Setting",author:"",version:"1.0.0",description:"",genre:"",system:""},session:{activePanel:null,activeEntryId:null},cache:{},_subscribers:[],init(){const s=localStorage.getItem(G);if(s)try{const t=JSON.parse(s);t.project&&Object.assign(this.project,t.project),t.session&&Object.assign(this.session,t.session)}catch(t){console.warn("Failed to restore state:",t)}},save(){const s={project:this.project,session:this.session};localStorage.setItem(G,JSON.stringify(s))},updateProject(s){Object.assign(this.project,s),this.save(),this._notify("project",this.project)},updateSession(s){Object.assign(this.session,s),this.save(),this._notify("session",this.session)},subscribe(s,t){const e={key:s,callback:t};return this._subscribers.push(e),()=>{const n=this._subscribers.indexOf(e);n>=0&&this._subscribers.splice(n,1)}},_notify(s,t){this._subscribers.filter(e=>e.key===s).forEach(e=>e.callback(t))},exportState(){return{project:{...this.project},session:{...this.session}}},importState(s){s.project&&Object.assign(this.project,s.project),s.session&&Object.assign(this.session,s.session),this.save(),this._notify("project",this.project),this._notify("session",this.session)}},I={panels:{},activePanelId:null,init:function(){f.init(),this.renderSidebar(),this.bindEvents();const s=localStorage.getItem("theme")||"dark";document.documentElement.setAttribute("data-theme",s),f.session.activePanel&&this.panels[f.session.activePanel]&&this.switchPanel(f.session.activePanel)},registerPanel:function(s,t){this.panels[s]=t,this.renderSidebar()},switchPanel:function(s){if(!this.panels[s])return;this.activePanelId=s,f.updateSession({activePanel:s}),document.querySelectorAll(".nav-item").forEach(n=>{n.classList.toggle("active",n.dataset.id===s)});const t=document.getElementById("main-view");t.innerHTML="";const e=document.createElement("div");e.className="panel-container",this.panels[s].render(e,f),t.appendChild(e)},renderSidebar:function(){const s=document.getElementById("nav-list");s&&(s.innerHTML="",Object.keys(this.panels).forEach(t=>{const e=this.panels[t],n=document.createElement("div");n.className="nav-item",n.innerHTML=e.icon||"📦",n.title=e.label||t,n.dataset.id=t,n.onclick=()=>this.switchPanel(t),t===this.activePanelId&&n.classList.add("active"),s.appendChild(n)}))},bindEvents:function(){const s=document.getElementById("theme-toggle");s&&(s.onclick=()=>{const t=document.documentElement,n=t.getAttribute("data-theme")==="dark"?"light":"dark";t.setAttribute("data-theme",n),localStorage.setItem("theme",n)})}},R={generateId:(s="id")=>typeof crypto<"u"&&crypto.randomUUID?`${s}_${crypto.randomUUID().split("-")[0]}`:`${s}_${Math.random().toString(36).substring(2,9)}`,escapeHtml:s=>{const t=document.createElement("div");return t.textContent=s,t.innerHTML},debounce:(s,t=300)=>{let e;return(...n)=>{clearTimeout(e),e=setTimeout(()=>s(...n),t)}},deepClone:s=>JSON.parse(JSON.stringify(s)),formatDate:s=>{const t=new Date(s);return t.toLocaleDateString()+" "+t.toLocaleTimeString()},truncate:(s,t=50)=>!s||s.length<=t?s:s.substring(0,t-3)+"..."},Z="samildanach_vault",tt=1,j="items",q="registry",O="vault_registry";let T=null;function J(){return{id:O,lastUpdatedAt:new Date().toISOString(),universes:[],allTags:[],blocks:{},itemCounts:{actor:0,lorebook:0,script:0,location:0,event:0,pair:0}}}const k={init:function(){return new Promise((s,t)=>{if(T){s(T);return}const e=indexedDB.open(Z,tt);e.onerror=n=>{console.error("[VaultDB] Failed to open database:",n.target.error),t(n.target.error)},e.onsuccess=n=>{T=n.target.result,console.log("[VaultDB] Database opened successfully"),s(T)},e.onupgradeneeded=n=>{const i=n.target.result;if(!i.objectStoreNames.contains(j)){const a=i.createObjectStore(j,{keyPath:"id"});a.createIndex("type","type",{unique:!1}),a.createIndex("universe","universe",{unique:!1}),a.createIndex("updatedAt","updatedAt",{unique:!1}),console.log("[VaultDB] Items store created")}i.objectStoreNames.contains(q)||(i.createObjectStore(q,{keyPath:"id"}),console.log("[VaultDB] Registry store created"))}})},getRegistry:function(){return new Promise((s,t)=>{if(!T){t(new Error("VaultDB not initialized"));return}const i=T.transaction(q,"readonly").objectStore(q).get(O);i.onsuccess=()=>{i.result?s(i.result):k.updateRegistry(J()).then(s).catch(t)},i.onerror=a=>t(a.target.error)})},updateRegistry:function(s){return new Promise((t,e)=>{if(!T){e(new Error("VaultDB not initialized"));return}const i=T.transaction(q,"readwrite").objectStore(q),a=i.get(O);a.onsuccess=()=>{const r={...a.result||J(),...s,id:O,lastUpdatedAt:new Date().toISOString()},o=i.put(r);o.onsuccess=()=>t(r),o.onerror=d=>e(d.target.error)},a.onerror=l=>e(l.target.error)})},list:function(s={}){return new Promise((t,e)=>{if(!T){e(new Error("VaultDB not initialized"));return}const i=T.transaction(j,"readonly").objectStore(j);let a;s.type?a=i.index("type").openCursor(IDBKeyRange.only(s.type)):s.universe?a=i.index("universe").openCursor(IDBKeyRange.only(s.universe)):a=i.openCursor();const l=[];a.onsuccess=r=>{const o=r.target.result;if(o){const d=o.value;let c=!0;s.type&&d.type!==s.type&&(c=!1),s.universe&&d.universe!==s.universe&&(c=!1),s.tags&&s.tags.length>0&&(s.tags.every(v=>{var x;return(x=d.tags)==null?void 0:x.includes(v)})||(c=!1)),c&&l.push(d),o.continue()}else l.sort((d,c)=>new Date(c.updatedAt).getTime()-new Date(d.updatedAt).getTime()),t(l)},a.onerror=r=>e(r.target.error)})},addItem:function(s,t,e={}){return new Promise((n,i)=>{if(!T){console.error("[VaultDB]AddItem: DB not initialized"),i(new Error("VaultDB not initialized"));return}const a=new Date().toISOString();let l;try{l=R&&R.generateId?R.generateId("vault"):`vault_${crypto.randomUUID()}`}catch(u){console.error("[VaultDB] ID Gen Failed:",u),l="vault_"+Date.now()}const r={id:l,type:s,version:1,universe:e.universe||"",tags:e.tags||[],createdAt:a,updatedAt:a,data:t};console.log("[VaultDB] Adding Item:",r);const c=T.transaction(j,"readwrite").objectStore(j).add(r);c.onsuccess=()=>{console.log("[VaultDB] Add Success"),n(r)},c.onerror=u=>{console.error("[VaultDB] Add Failed:",u.target.error),i(u.target.error)}})},updateItem:function(s){return new Promise((t,e)=>{if(!T){e(new Error("VaultDB not initialized"));return}s.updatedAt=new Date().toISOString();const a=T.transaction(j,"readwrite").objectStore(j).put(s);a.onsuccess=()=>t(s),a.onerror=l=>e(l.target.error)})}},V={person:{id:"person",label:"Person",icon:"👤",color:"#6366f1",fields:[{key:"role",label:"Role",type:"text"},{key:"affiliation",label:"Affiliation",type:"text"},{key:"motivation",label:"Motivation",type:"text"},{key:"appearance",label:"Appearance",type:"textarea"}]},location:{id:"location",label:"Location",icon:"📍",color:"#22c55e",fields:[{key:"region",label:"Region",type:"text"},{key:"climate",label:"Climate",type:"text"},{key:"pointsOfInterest",label:"Points of Interest",type:"textarea"}]},faction:{id:"faction",label:"Faction",icon:"🏛️",color:"#f59e0b",fields:[{key:"goals",label:"Goals",type:"textarea"},{key:"allies",label:"Allies",type:"text"},{key:"enemies",label:"Enemies",type:"text"}]},concept:{id:"concept",label:"Concept",icon:"💡",color:"#8b5cf6",fields:[{key:"domain",label:"Domain",type:"text"},{key:"principles",label:"Core Principles",type:"textarea"}]},event:{id:"event",label:"Event",icon:"📜",color:"#ef4444",fields:[{key:"era",label:"Era/Date",type:"text"},{key:"participants",label:"Participants",type:"text"},{key:"outcome",label:"Outcome",type:"textarea"}]},item:{id:"item",label:"Item",icon:"🎁",color:"#14b8a6",fields:[{key:"origin",label:"Origin",type:"text"},{key:"properties",label:"Properties",type:"textarea"}]}},D=s=>V[s]||V.item,P=()=>Object.values(V),U={id:"project",label:"Project",icon:"🏠",render:async(s,t)=>{try{await k.init()}catch(r){s.innerHTML=`<div class="text-muted">Vault Error: ${r.message}</div>`;return}const e=await k.list(),n={};P().forEach(r=>{n[r.id]=e.filter(o=>o.type===r.id).length});const i=e.reduce((r,o)=>{var d;return r+(((d=o.data.relationships)==null?void 0:d.length)||0)},0);s.innerHTML=`
            <div class="project-layout">
                <div class="project-content">
                    
                    <!-- Header -->
                    <div class="project-header">
                        <div class="project-icon">📖</div>
                        <input id="proj-title" type="text" value="${f.project.title}" 
                            placeholder="Setting Title" class="project-title">
                        <div class="project-author">
                            <input id="proj-author" type="text" value="${f.project.author}" 
                                placeholder="Author Name">
                        </div>
                    </div>

                    <!-- Stats Cards -->
                    <div class="stats-grid">
                        ${P().map(r=>`
                            <div class="stat-card" style="border-left-color: ${r.color};">
                                <div class="stat-icon">${r.icon}</div>
                                <div class="stat-value">${n[r.id]||0}</div>
                                <div class="stat-label">${r.label}s</div>
                            </div>
                        `).join("")}
                        <div class="stat-card">
                            <div class="stat-icon">🔗</div>
                            <div class="stat-value">${i}</div>
                            <div class="stat-label">Relationships</div>
                        </div>
                    </div>

                    <!-- Project Details -->
                    <div class="project-details">
                        <h3>Project Details</h3>
                        
                        <div class="details-grid">
                            <div class="detail-field">
                                <label class="label">Version</label>
                                <input id="proj-version" type="text" value="${f.project.version}" class="input">
                            </div>
                            <div class="detail-field">
                                <label class="label">Genre</label>
                                <input id="proj-genre" type="text" value="${f.project.genre}" 
                                    placeholder="Fantasy, Sci-Fi, Horror..." class="input">
                            </div>
                        </div>
                        
                        <div class="detail-field">
                            <label class="label">Compatible Game System</label>
                            <input id="proj-system" type="text" value="${f.project.system}" 
                                placeholder="D&D 5e, Pathfinder 2e, Fate Core..." class="input">
                        </div>

                        <div class="detail-field" style="margin-top: 16px;">
                            <label class="label">Description</label>
                            <textarea id="proj-description" rows="4" 
                                placeholder="Describe your setting..." class="textarea">${f.project.description}</textarea>
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
        `;const a=()=>{f.updateProject({title:s.querySelector("#proj-title").value,author:s.querySelector("#proj-author").value,version:s.querySelector("#proj-version").value,genre:s.querySelector("#proj-genre").value,system:s.querySelector("#proj-system").value,description:s.querySelector("#proj-description").value})};s.querySelectorAll("input, textarea").forEach(r=>{r.oninput=a}),s.querySelector("#btn-export").onclick=async()=>{const r={meta:f.project,entries:e,exportedAt:new Date().toISOString(),version:"1.0"},o=new Blob([JSON.stringify(r,null,2)],{type:"application/json"}),d=URL.createObjectURL(o),c=document.createElement("a");c.href=d,c.download=`${f.project.title.replace(/[^a-z0-9]/gi,"_")}_setting.json`,c.click(),URL.revokeObjectURL(d)};const l=s.querySelector("#import-file");s.querySelector("#btn-import").onclick=()=>l.click(),l.onchange=async r=>{var d;const o=r.target.files[0];if(o)try{const c=await o.text(),u=JSON.parse(c);if(u.meta&&f.updateProject(u.meta),u.entries&&Array.isArray(u.entries))for(const v of u.entries)await k.addItem(v.type,v.data);alert(`Imported ${((d=u.entries)==null?void 0:d.length)||0} entries!`),location.reload()}catch(c){alert("Import failed: "+c.message)}}}},Y={parse(s){const t=s.trim().match(/^(\d+)?d(\d+)([+-]\d+)?$/i);return t?{count:parseInt(t[1])||1,sides:parseInt(t[2]),modifier:parseInt(t[3])||0}:null},rollOne(s){return Math.floor(Math.random()*s)+1},rollMany(s,t){const e=[];for(let n=0;n<s;n++)e.push(this.rollOne(t));return e},roll(s){const t=this.parse(s);if(!t)return{error:"Invalid format. Use NdX or NdX+Y (e.g., 2d6+3)"};const e=this.rollMany(t.count,t.sides),n=e.reduce((a,l)=>a+l,0),i=n+t.modifier;return{expression:s,rolls:e,subtotal:n,modifier:t.modifier,total:i}},format(s){if(s.error)return s.error;let t=`[${s.rolls.join(", ")}]`;return s.modifier!==0&&(t+=` ${s.modifier>0?"+":""}${s.modifier}`),t+=` = ${s.total}`,t},stats(s){const t=this.parse(s);if(!t)return null;const e=t.count+t.modifier,n=t.count*t.sides+t.modifier,i=(e+n)/2;return{min:e,max:n,average:i.toFixed(1)}}},F={runDiceSimulation(s,t=1e3){const e=[],n={};for(let m=0;m<t;m++){const y=Y.roll(s);if(y.error)return{error:y.error};e.push(y.total),n[y.total]=(n[y.total]||0)+1}const i=[...e].sort((m,y)=>m-y),l=e.reduce((m,y)=>m+y,0)/t,o=e.map(m=>Math.pow(m-l,2)).reduce((m,y)=>m+y,0)/t,d=Math.sqrt(o);let c=null,u=0;for(const[m,y]of Object.entries(n))y>u&&(u=y,c=parseInt(m));const v=t%2===0?(i[t/2-1]+i[t/2])/2:i[Math.floor(t/2)],x=i[Math.floor(t*.25)],C=i[Math.floor(t*.75)];return{expression:s,iterations:t,results:e,distribution:n,stats:{min:i[0],max:i[i.length-1],mean:l.toFixed(2),median:v,mode:c,stdDev:d.toFixed(2),p25:x,p75:C}}},getHistogramData(s){if(s.error)return[];const{distribution:t,iterations:e,stats:n}=s,i=[];for(let a=n.min;a<=n.max;a++){const l=t[a]||0;i.push({value:a,count:l,percentage:(l/e*100).toFixed(1)})}return i},compare(s,t,e=1e3){const n=this.runDiceSimulation(s,e),i=this.runDiceSimulation(t,e);if(n.error||i.error)return{error:n.error||i.error};let a=0,l=0,r=0;for(let o=0;o<e;o++)n.results[o]>i.results[o]?a++:i.results[o]>n.results[o]?l++:r++;return{expr1:{expression:s,stats:n.stats},expr2:{expression:t,stats:i.stats},comparison:{wins1:a,wins2:l,ties:r,win1Pct:(a/e*100).toFixed(1),win2Pct:(l/e*100).toFixed(1),tiePct:(r/e*100).toFixed(1)}}}},X={id:"laboratory",label:"Laboratory",icon:"🧪",render:(s,t)=>{s.innerHTML=`
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
        `;const e=s.querySelector("#lab-expr"),n=s.querySelector("#lab-roll"),i=s.querySelector("#lab-result"),a=s.querySelector("#lab-stats");e.oninput=()=>{const m=Y.stats(e.value);m?a.innerText=`Range: ${m.min}–${m.max} | Average: ${m.average}`:a.innerText=""},e.oninput(),n.onclick=()=>{const m=e.value.trim();if(!m)return;const y=Y.roll(m);y.error?i.innerHTML=`<span style="color:var(--status-error);">${y.error}</span>`:i.innerHTML=`
                    <div><strong>Rolls:</strong> [${y.rolls.join(", ")}]</div>
                    ${y.modifier!==0?`<div><strong>Modifier:</strong> ${y.modifier>0?"+":""}${y.modifier}</div>`:""}
                    <div class="roll-total"><strong>Total:</strong> ${y.total}</div>
                `},e.onkeydown=m=>{m.key==="Enter"&&n.onclick()};const l=s.querySelector("#sim-expr"),r=s.querySelector("#sim-iterations"),o=s.querySelector("#sim-run"),d=s.querySelector("#sim-results"),c=s.querySelector("#histogram");o.onclick=()=>{const m=l.value.trim(),y=parseInt(r.value);m&&(o.disabled=!0,o.innerText="Running...",setTimeout(()=>{const w=F.runDiceSimulation(m,y);if(o.disabled=!1,o.innerText="Run",w.error){d.style.display="none",alert(w.error);return}d.style.display="block",s.querySelector("#stat-min").innerText=w.stats.min,s.querySelector("#stat-max").innerText=w.stats.max,s.querySelector("#stat-mean").innerText=w.stats.mean,s.querySelector("#stat-median").innerText=w.stats.median,s.querySelector("#stat-mode").innerText=w.stats.mode,s.querySelector("#stat-stddev").innerText=w.stats.stdDev;const p=F.getHistogramData(w),g=Math.max(...p.map(h=>h.count));c.innerHTML=p.map(h=>`
                    <div class="hist-bar-container">
                        <div class="hist-bar" style="height: ${h.count/g*100}%;" title="${h.value}: ${h.count} (${h.percentage}%)"></div>
                        <span class="hist-label">${h.value}</span>
                    </div>
                `).join("")},10))};const u=s.querySelector("#cmp-expr1"),v=s.querySelector("#cmp-expr2"),x=s.querySelector("#cmp-run"),C=s.querySelector("#cmp-results");x.onclick=()=>{const m=u.value.trim(),y=v.value.trim();if(!m||!y)return;const w=F.compare(m,y,1e3);if(w.error){C.style.display="none",alert(w.error);return}C.style.display="block",C.innerHTML=`
                <div class="compare-stat">
                    <strong>${m}</strong> wins <span class="highlight">${w.comparison.win1Pct}%</span> of the time
                    <small>(avg: ${w.expr1.stats.mean})</small>
                </div>
                <div class="compare-stat">
                    <strong>${y}</strong> wins <span class="highlight">${w.comparison.win2Pct}%</span> of the time
                    <small>(avg: ${w.expr2.stats.mean})</small>
                </div>
                <div class="compare-stat tie">
                    Ties: ${w.comparison.tiePct}%
                </div>
            `}}};class A{constructor(t={}){this.title=t.title||"Modal",this.content=t.content||"",this.actions=t.actions||[],this.onClose=t.onClose||null,this.element=null}show(){this.element=document.createElement("div"),this.element.className="modal-overlay",this.element.innerHTML=`
            <div class="modal-content">
                <h3 class="modal-title">${this.title}</h3>
                <div class="modal-body"></div>
                <div class="modal-actions"></div>
            </div>
        `;const t=this.element.querySelector(".modal-body");typeof this.content=="string"?t.innerHTML=this.content:this.content instanceof HTMLElement&&t.appendChild(this.content);const e=this.element.querySelector(".modal-actions");this.actions.forEach(n=>{const i=document.createElement("button");i.className=n.className||"btn btn-secondary",i.innerText=n.label,i.onclick=()=>{n.onClick&&n.onClick(this)},e.appendChild(i)}),this.element.onclick=n=>{n.target===this.element&&this.close()},document.body.appendChild(this.element)}close(){this.element&&(this.element.remove(),this.element=null),this.onClose&&this.onClose()}getBody(){var t;return(t=this.element)==null?void 0:t.querySelector(".modal-body")}static confirm(t,e){return new Promise(n=>{const i=new A({title:t,content:`<p>${e}</p>`,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:()=>{i.close(),n(!1)}},{label:"Confirm",className:"btn btn-primary",onClick:()=>{i.close(),n(!0)}}]});i.show()})}static alert(t,e){return new Promise(n=>{const i=new A({title:t,content:`<p>${e}</p>`,actions:[{label:"OK",className:"btn btn-primary",onClick:()=>{i.close(),n()}}]});i.show()})}}class et{constructor(t,e={}){this.container=t,this.items=[],this.activeCategory=null,this.activeItemId=null,this.onSelect=e.onSelect||null,this.onCreate=e.onCreate||null}setItems(t){this.items=t,this.render()}setActiveItem(t){this.activeItemId=t,this.renderList()}render(){this.container.innerHTML=`
            <div id="category-tabs" class="library-tabs"></div>
            <div class="library-search-bar">
                <input id="lib-search" type="text" placeholder="Search..." class="input">
                <button id="lib-add-btn" class="btn btn-primary">+</button>
            </div>
            <div id="lib-list" class="library-list"></div>
        `,this.tabsEl=this.container.querySelector("#category-tabs"),this.searchInput=this.container.querySelector("#lib-search"),this.listEl=this.container.querySelector("#lib-list"),this.addBtn=this.container.querySelector("#lib-add-btn"),this.renderTabs(),this.renderList(),this.searchInput.oninput=()=>this.renderList(),this.addBtn.onclick=()=>{this.onCreate&&this.onCreate()}}renderTabs(){this.tabsEl.innerHTML="";const t=document.createElement("button");t.innerText="All",t.className="tab"+(this.activeCategory===null?" active":""),t.onclick=()=>{this.activeCategory=null,this.renderTabs(),this.renderList()},this.tabsEl.appendChild(t),P().forEach(e=>{const n=document.createElement("button");n.innerText=`${e.icon} ${e.label}`,n.className="tab"+(this.activeCategory===e.id?" active":""),this.activeCategory===e.id&&(n.style.background=e.color,n.style.borderColor=e.color),n.onclick=()=>{this.activeCategory=e.id,this.renderTabs(),this.renderList()},this.tabsEl.appendChild(n)})}renderList(){var i;if(!this.listEl)return;this.listEl.innerHTML="";const t=((i=this.searchInput)==null?void 0:i.value.toLowerCase())||"",e=this.activeCategory,n=this.items.filter(a=>{const l=(a.data.name||"").toLowerCase().includes(t),r=e?a.type===e:!0;return l&&r});if(n.length===0){this.listEl.innerHTML='<div class="library-list-empty">No entries found.</div>';return}n.forEach(a=>{const l=D(a.type),r=this.activeItemId===a.id,o=document.createElement("div");o.className="list-item"+(r?" active":""),o.innerHTML=`
                <span>${l.icon}</span>
                <span class="flex-1" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${a.data.name||"Untitled"}</span>
            `,o.onclick=()=>{this.onSelect&&this.onSelect(a)},this.listEl.appendChild(o)})}}class st{constructor(t,e="",n={}){this.container=t,this.value=e,this.onChange=null,this.onLinkClick=n.onLinkClick||null,this.getEntries=n.getEntries||(()=>[])}render(){this.container.innerHTML=`
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
        `,this.editor=this.container.querySelector(".rte-content"),this.autocomplete=this.container.querySelector(".rte-autocomplete"),this.bindEvents()}renderWithLinks(t){return t.replace(/\[\[([^\]]+)\]\]/g,(e,n)=>`<span class="wiki-link" data-link="${n}">[[${n}]]</span>`)}extractRawText(t){const e=document.createElement("div");return e.innerHTML=t,e.querySelectorAll(".wiki-link").forEach(n=>{n.replaceWith(`[[${n.dataset.link}]]`)}),e.innerHTML}bindEvents(){this.container.querySelectorAll("button[data-cmd]").forEach(t=>{t.onclick=e=>{e.preventDefault();const n=t.dataset.cmd;n==="link"?this.insertLinkPlaceholder():n==="h2"||n==="h3"?document.execCommand("formatBlock",!1,n):document.execCommand(n,!1,null),this.editor.focus()}}),this.editor.oninput=()=>{this.checkForAutocomplete(),this.value=this.extractRawText(this.editor.innerHTML),this.onChange&&this.onChange(this.value)},this.editor.onclick=t=>{if(t.target.classList.contains("wiki-link")){const e=t.target.dataset.link;this.onLinkClick&&this.onLinkClick(e)}},this.editor.onkeydown=t=>{if(this.autocomplete.style.display!=="none")if(t.key==="ArrowDown"||t.key==="ArrowUp")t.preventDefault(),this.navigateAutocomplete(t.key==="ArrowDown"?1:-1);else if(t.key==="Enter"||t.key==="Tab"){const e=this.autocomplete.querySelector(".selected");e&&(t.preventDefault(),this.selectAutocompleteItem(e.dataset.name))}else t.key==="Escape"&&this.hideAutocomplete()},this.editor.onblur=()=>{setTimeout(()=>this.hideAutocomplete(),150)}}insertLinkPlaceholder(){document.execCommand("insertText",!1,"[[]]");const t=window.getSelection();if(t.rangeCount){const e=t.getRangeAt(0);e.setStart(e.startContainer,e.startOffset-2),e.collapse(!0),t.removeAllRanges(),t.addRange(e)}}checkForAutocomplete(){const t=window.getSelection();if(!t.rangeCount)return;const e=t.getRangeAt(0),n=e.startContainer;if(n.nodeType!==Node.TEXT_NODE)return;const a=n.textContent.substring(0,e.startOffset).match(/\[\[([^\]]*?)$/);if(a){const l=a[1].toLowerCase(),r=this.getEntries().filter(o=>(o.data.name||"").toLowerCase().includes(l)).slice(0,8);r.length>0?this.showAutocomplete(r):this.hideAutocomplete()}else this.hideAutocomplete()}showAutocomplete(t){this.autocomplete.innerHTML="",t.forEach((e,n)=>{const i=document.createElement("div");i.dataset.name=e.data.name,i.className="rte-autocomplete-item"+(n===0?" selected":""),i.innerText=e.data.name||"Untitled",i.onmousedown=a=>{a.preventDefault(),this.selectAutocompleteItem(e.data.name)},this.autocomplete.appendChild(i)}),this.autocomplete.style.display="block",this.autocomplete.style.left="16px",this.autocomplete.style.bottom="16px"}hideAutocomplete(){this.autocomplete.style.display="none"}navigateAutocomplete(t){var a,l;const e=Array.from(this.autocomplete.children),n=e.findIndex(r=>r.classList.contains("selected"));(a=e[n])==null||a.classList.remove("selected");const i=Math.max(0,Math.min(e.length-1,n+t));(l=e[i])==null||l.classList.add("selected")}selectAutocompleteItem(t){const e=window.getSelection();if(!e.rangeCount)return;const n=e.getRangeAt(0),i=n.startContainer;if(i.nodeType!==Node.TEXT_NODE)return;const a=i.textContent,l=a.substring(0,n.startOffset);if(l.match(/\[\[([^\]]*?)$/)){const o=l.lastIndexOf("[["),d=a.substring(n.startOffset),c=d.indexOf("]]"),u=c>=0?d.substring(c+2):d,v=document.createElement("span");v.className="wiki-link",v.dataset.link=t,v.innerText=`[[${t}]]`;const x=document.createTextNode(a.substring(0,o)),C=document.createTextNode(" "+u),m=i.parentNode;m.insertBefore(x,i),m.insertBefore(v,i),m.insertBefore(C,i),m.removeChild(i);const y=document.createRange();y.setStartAfter(v),y.collapse(!0),e.removeAllRanges(),e.addRange(y)}this.hideAutocomplete(),this.value=this.extractRawText(this.editor.innerHTML),this.onChange&&this.onChange(this.value)}getValue(){return this.extractRawText(this.editor.innerHTML)}setValue(t){this.value=t,this.editor&&(this.editor.innerHTML=this.renderWithLinks(t))}}class nt{constructor(t,e={}){this.container=t,this.item=null,this.onSave=e.onSave||null,this.onNameChange=e.onNameChange||null,this.onLinkClick=e.onLinkClick||null,this.getEntries=e.getEntries||(()=>[]),this.editorInstance=null}setItem(t){this.item=t,t?this.render():this.showEmpty()}showEmpty(){this.container.innerHTML=`
            <div class="empty-state">
                <h2>Select an entry</h2>
                <p>Or create a new one to start building your world.</p>
            </div>
        `}render(){if(!this.item)return this.showEmpty();const t=D(this.item.type);this.container.innerHTML=`
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
        `;const e=this.container.querySelector("#asset-title"),n=this.container.querySelector("#metadata-fields"),i=this.container.querySelector("#asset-rte-mount");this.container.querySelector("#save-status"),t.fields.forEach(r=>{const o=document.createElement("div");o.className="metadata-field";const d=document.createElement("label");d.innerText=r.label,d.className="label";let c;r.type==="textarea"?(c=document.createElement("textarea"),c.rows=2,c.className="textarea"):(c=document.createElement("input"),c.type="text",c.className="input"),c.value=this.item.data[r.key]||"",c.oninput=()=>{this.item.data[r.key]=c.value,this.save()},o.appendChild(d),o.appendChild(c),n.appendChild(o)});const a=new st(i,this.item.data.description||"",{getEntries:this.getEntries,onLinkClick:this.onLinkClick});a.render(),this.editorInstance=a,a.onChange=r=>{this.item.data.description=r,this.save()};let l=null;e.oninput=()=>{this.item.data.name=e.value,this.save(),clearTimeout(l),l=setTimeout(()=>{this.onNameChange&&this.onNameChange(this.item)},300)}}async save(){const t=this.container.querySelector("#save-status");t&&(t.innerText="Saving..."),this.onSave&&await this.onSave(this.item),t&&(t.innerText="Saved")}}const _={member_of:{id:"member_of",label:"Member of",icon:"👥",inverse:"has_member",description:"This entry is a member of the target."},has_member:{id:"has_member",label:"Has Member",icon:"👤",inverse:"member_of",description:"The target is a member of this entry."},located_in:{id:"located_in",label:"Located in",icon:"📍",inverse:"contains",description:"This entry is located within the target."},contains:{id:"contains",label:"Contains",icon:"🗺️",inverse:"located_in",description:"This entry contains the target."},ally_of:{id:"ally_of",label:"Ally of",icon:"🤝",inverse:"ally_of",description:"This entry is allied with the target."},enemy_of:{id:"enemy_of",label:"Enemy of",icon:"⚔️",inverse:"enemy_of",description:"This entry is an enemy of the target."},parent_of:{id:"parent_of",label:"Parent of",icon:"👨‍👧",inverse:"child_of",description:"This entry is the parent of the target."},child_of:{id:"child_of",label:"Child of",icon:"👶",inverse:"parent_of",description:"This entry is the child of the target."},related_to:{id:"related_to",label:"Related to",icon:"🔗",inverse:"related_to",description:"Generic relationship."},created_by:{id:"created_by",label:"Created by",icon:"🛠️",inverse:"creator_of",description:"This entry was created by the target."},creator_of:{id:"creator_of",label:"Creator of",icon:"✨",inverse:"created_by",description:"This entry created the target."}},B=s=>_[s]||_.related_to,it=()=>Object.values(_);class at{constructor(t,e={}){this.container=t,this.item=null,this.allItems=[],this.onSave=e.onSave||null,this.onNavigate=e.onNavigate||null}setItem(t,e){this.item=t,this.allItems=e,t&&this.render()}render(){this.item&&(this.item.data.relationships||(this.item.data.relationships=[]),this.container.innerHTML=`
            <div class="relationships-header">
                <div class="label">Relationships</div>
                <button id="add-relationship-btn" class="btn btn-primary" style="padding:4px 10px; font-size:11px;">+ Add</button>
            </div>
            <div id="relationships-list" class="relationships-list"></div>
            <div id="back-references" class="back-references"></div>
        `,this.renderRelationships(),this.container.querySelector("#add-relationship-btn").onclick=()=>this.showAddModal())}renderRelationships(){const t=this.container.querySelector("#relationships-list"),e=this.container.querySelector("#back-references");t.innerHTML="",this.item.data.relationships.length===0?t.innerHTML='<div class="text-muted text-sm">No relationships defined.</div>':(this.item.data.relationships.forEach((i,a)=>{const l=B(i.type),r=this.allItems.find(u=>u.id===i.targetId),o=r?r.data.name||"Untitled":"(Deleted)",d=r?D(r.type):{icon:"❓"},c=document.createElement("div");c.className="relationship-row",c.innerHTML=`
                    <span>${l.icon}</span>
                    <span class="relationship-type">${l.label}</span>
                    <span class="relationship-target" data-id="${i.targetId}">${d.icon} ${o}</span>
                    <button class="relationship-delete" data-idx="${a}">×</button>
                `,t.appendChild(c)}),t.querySelectorAll(".relationship-target").forEach(i=>{i.onclick=()=>{const a=this.allItems.find(l=>l.id===i.dataset.id);a&&this.onNavigate&&this.onNavigate(a)}}),t.querySelectorAll(".relationship-delete").forEach(i=>{i.onclick=()=>{this.item.data.relationships.splice(parseInt(i.dataset.idx),1),this.onSave&&this.onSave(this.item),this.renderRelationships()}}));const n=this.allItems.filter(i=>{var a;return i.id!==this.item.id&&((a=i.data.relationships)==null?void 0:a.some(l=>l.targetId===this.item.id))});e.innerHTML="",n.length===0?e.innerHTML='<div class="text-muted text-xs">No incoming references.</div>':(e.innerHTML='<div class="back-ref-label">Referenced by:</div>',n.forEach(i=>{const a=D(i.type);i.data.relationships.filter(r=>r.targetId===this.item.id).forEach(r=>{const o=B(r.type),d=_[o.inverse],c=document.createElement("div");c.className="back-ref-item",c.innerHTML=`<span>${a.icon}</span> ${i.data.name||"Untitled"} <span class="text-muted">(${(d==null?void 0:d.label)||o.label})</span>`,c.onclick=()=>{this.onNavigate&&this.onNavigate(i)},e.appendChild(c)})}))}showAddModal(){const t=document.createElement("div");t.className="flex flex-col gap-md",t.innerHTML=`
            <div>
                <label class="label">Type</label>
                <select id="rel-type-select" class="input" style="width:100%; margin-top:4px;"></select>
            </div>
            <div>
                <label class="label">Target Entry</label>
                <select id="rel-target-select" class="input" style="width:100%; margin-top:4px;"></select>
            </div>
        `,new A({title:"Add Relationship",content:t,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:a=>a.close()},{label:"Add",className:"btn btn-primary",onClick:a=>{const l=t.querySelector("#rel-type-select"),r=t.querySelector("#rel-target-select"),o=l.value,d=r.value;o&&d&&(this.item.data.relationships.push({type:o,targetId:d}),this.onSave&&this.onSave(this.item),this.renderRelationships()),a.close()}}]}).show();const n=t.querySelector("#rel-type-select"),i=t.querySelector("#rel-target-select");it().forEach(a=>{const l=document.createElement("option");l.value=a.id,l.innerText=`${a.icon} ${a.label}`,n.appendChild(l)}),this.allItems.filter(a=>a.id!==this.item.id).forEach(a=>{const l=D(a.type),r=document.createElement("option");r.value=a.id,r.innerText=`${l.icon} ${a.data.name||"Untitled"}`,i.appendChild(r)})}}const b={id:"library",label:"Library",icon:"📚",entryList:null,entryEditor:null,relationshipManager:null,allItems:[],activeItem:null,render:async(s,t)=>{try{await k.init()}catch(a){s.innerHTML=`<div class="text-muted">Vault Error: ${a.message}</div>`;return}s.innerHTML=`
            <div class="library-layout">
                <div id="lib-sidebar" class="library-sidebar"></div>
                <div id="lib-main" class="library-main">
                    <div id="lib-editor-area"></div>
                    <div id="lib-relationships-area" class="relationships-section" style="display:none;"></div>
                </div>
            </div>
        `;const e=s.querySelector("#lib-sidebar"),n=s.querySelector("#lib-editor-area"),i=s.querySelector("#lib-relationships-area");if(b.allItems=await k.list(),b.entryList=new et(e,{onSelect:a=>b.selectItem(a,n,i),onCreate:()=>b.showCreateModal()}),b.entryList.setItems(b.allItems),b.entryEditor=new nt(n,{onSave:async a=>{await k.updateItem(a)},onNameChange:a=>{b.entryList.setItems(b.allItems)},onLinkClick:a=>{const l=b.allItems.find(r=>(r.data.name||"").toLowerCase()===a.toLowerCase());l&&b.selectItem(l,n,i)},getEntries:()=>b.allItems}),b.entryEditor.showEmpty(),b.relationshipManager=new at(i,{onSave:async a=>{await k.updateItem(a)},onNavigate:a=>{b.selectItem(a,n,i)}}),f.session.activeEntryId){const a=b.allItems.find(l=>l.id===f.session.activeEntryId);a&&b.selectItem(a,n,i)}},selectItem(s,t,e){b.activeItem=s,b.entryList.setActiveItem(s.id),b.entryEditor.setItem(s),e.style.display="block",b.relationshipManager.setItem(s,b.allItems),f.updateSession({activeEntryId:s.id})},showCreateModal(){const s=document.createElement("div");s.className="grid-3",P().forEach(e=>{const n=document.createElement("button");n.className="btn btn-secondary",n.style.cssText="flex-direction:column; padding:12px;",n.innerHTML=`<span style="font-size:20px;">${e.icon}</span><span class="text-xs">${e.label}</span>`,n.onclick=async()=>{t.close();const i=await k.addItem(e.id,{name:`New ${e.label}`,description:""});b.allItems.push(i),b.entryList.setItems(b.allItems);const a=document.querySelector("#lib-editor-area"),l=document.querySelector("#lib-relationships-area");b.selectItem(i,a,l)},s.appendChild(n)});const t=new A({title:"Create New Entry",content:s,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:e=>e.close()}]});t.show()}};class ot{constructor(t,e,n){this.container=t,this.nodeLayer=e,this.svgLayer=n,this.nodes=[],this.links=[],this.transform={x:0,y:0,scale:1},this.isDragging=!1,this.lastMouse={x:0,y:0},this.onDataChange=null}init(){this.container.onmousedown=t=>{(t.button===1||t.button===0&&t.altKey)&&(this.isDragging=!0,this.lastMouse={x:t.clientX,y:t.clientY},this.container.style.cursor="grabbing",t.preventDefault())},window.onmousemove=t=>{if(this.isDragging){const e=t.clientX-this.lastMouse.x,n=t.clientY-this.lastMouse.y;this.transform.x+=e,this.transform.y+=n,this.lastMouse={x:t.clientX,y:t.clientY},this.updateTransform()}},window.onmouseup=t=>{this.isDragging=!1,this.container.style.cursor="default"},this.container.onwheel=t=>{t.preventDefault();const e=t.deltaY>0?.9:1.1;this.transform.scale*=e,this.transform.scale=Math.min(Math.max(.2,this.transform.scale),2),this.updateTransform()}}exportData(){return{nodes:this.nodes,links:this.links,transform:this.transform}}importData(t){t&&(this.nodes=[],this.nodeLayer.innerHTML="",t.transform&&(this.transform=t.transform,this.updateTransform()),t.nodes&&t.nodes.forEach(e=>this.addNode(e,!0)),this.links=t.links||[],this.updateLinks())}notifyChange(){this.onDataChange&&this.onDataChange(this.exportData())}updateTransform(){this.nodeLayer.style.transform=`translate(${this.transform.x}px, ${this.transform.y}px) scale(${this.transform.scale})`,this.updateLinks()}resetView(){this.transform={x:0,y:0,scale:1},this.updateTransform()}addNode(t,e=!1){this.nodes.push(t);const n=this.renderNodeElement(t);this.nodeLayer.appendChild(n),e||this.notifyChange()}renderNodeElement(t){const e=document.createElement("div");e.className="node"+(t.type?` ${t.type}`:""),e.id=t.id,e.style.left=t.x+"px",e.style.top=t.y+"px";let n=(t.inputs||[]).map(u=>`
            <div class="socket-row">
                <div class="socket input" title="${u}"></div>
                <span>${u}</span>
            </div>
        `).join(""),i=(t.outputs||[]).map(u=>`
            <div class="socket-row" style="justify-content: flex-end;">
                <span>${u}</span>
                <div class="socket output" title="${u}"></div>
            </div>
        `).join("");e.innerHTML=`
            <div class="node-header">${t.title}</div>
            <div class="node-body">
                ${n}
                <!-- Body content could go here -->
                ${i}
            </div>
        `;const a=e.querySelector(".node-header");let l=!1,r={x:0,y:0},o={x:t.x,y:t.y};a.onmousedown=u=>{u.button===0&&(l=!0,r={x:u.clientX,y:u.clientY},o={x:t.x,y:t.y},e.classList.add("selected"),u.stopPropagation())};const d=u=>{if(l){const v=(u.clientX-r.x)/this.transform.scale,x=(u.clientY-r.y)/this.transform.scale;t.x=o.x+v,t.y=o.y+x,e.style.left=t.x+"px",e.style.top=t.y+"px",this.updateLinks()}},c=()=>{l&&(l=!1,e.classList.remove("selected"),this.notifyChange())};return window.addEventListener("mousemove",d),window.addEventListener("mouseup",c),e}updateLinks(){if(this.svgLayer.innerHTML="",this.nodes.length>=2){const t=this.nodes[0],e=this.nodes[1],n=(t.x+200)*this.transform.scale+this.transform.x,i=(t.y+40)*this.transform.scale+this.transform.y,a=e.x*this.transform.scale+this.transform.x,l=(e.y+40)*this.transform.scale+this.transform.y,r=document.createElementNS("http://www.w3.org/2000/svg","path"),o=n+50*this.transform.scale,d=a-50*this.transform.scale,c=`M ${n} ${i} C ${o} ${i}, ${d} ${l}, ${a} ${l}`;r.setAttribute("d",c),r.setAttribute("class","connection-line"),this.svgLayer.appendChild(r)}}}const z={event:{id:"event",label:"Event",icon:"⚡",color:"#4ade80",description:'Triggers like "On Combat Start", "On Turn Begin"',templates:[{title:"On Start",outputs:["next"]},{title:"On Turn Begin",outputs:["next"]},{title:"On Attack",inputs:["attacker","target"],outputs:["next"]},{title:"On Damage",inputs:["target","amount"],outputs:["next"]}]},condition:{id:"condition",label:"Condition",icon:"❓",color:"#facc15",description:"If/else branching logic",templates:[{title:"If Greater Than",inputs:["a","b"],outputs:["true","false"]},{title:"If Equal",inputs:["a","b"],outputs:["true","false"]},{title:"If Has Tag",inputs:["target","tag"],outputs:["true","false"]},{title:"Compare Roll",inputs:["roll","dc"],outputs:["success","failure"]}]},action:{id:"action",label:"Action",icon:"🎲",color:"#60a5fa",description:"Roll dice, modify values, apply effects",templates:[{title:"Roll Dice",inputs:["expression"],outputs:["result","next"]},{title:"Add Value",inputs:["a","b"],outputs:["result"]},{title:"Apply Damage",inputs:["target","amount"],outputs:["next"]},{title:"Set Variable",inputs:["name","value"],outputs:["next"]}]},reference:{id:"reference",label:"Reference",icon:"📚",color:"#c084fc",description:"Link to Library entries (items, abilities, characters)",templates:[]}};class rt{constructor(t={}){this.onSelect=t.onSelect||null}async show(){const t=document.createElement("div");t.className="node-picker";const e=document.createElement("div");e.className="library-tabs",e.style.marginBottom="16px";const n=document.createElement("div");n.className="node-picker-panels";const i=async l=>{e.querySelectorAll(".tab").forEach(o=>{o.classList.toggle("active",o.dataset.type===l)}),n.innerHTML="";const r=z[l];if(l==="reference"){await k.init();const o=await k.list();if(o.length===0){n.innerHTML='<div class="text-muted">No Library entries. Create entries in the Library first.</div>';return}const d=document.createElement("div");d.className="grid-2",d.style.gap="8px",o.forEach(c=>{const u=D(c.type),v=document.createElement("button");v.className="btn btn-secondary",v.style.cssText="justify-content:flex-start; padding:8px 12px; text-align:left;",v.innerHTML=`<span style="margin-right:8px;">${u.icon}</span> ${c.data.name||"Untitled"}`,v.onclick=()=>{this.onSelect&&this.onSelect({type:"reference",title:`📚 ${c.data.name||"Untitled"}`,entryId:c.id,entryType:c.type,inputs:["in"],outputs:["out","data"]}),a.close()},d.appendChild(v)}),n.appendChild(d)}else{const o=document.createElement("div");o.className="grid-2",o.style.gap="8px",r.templates.forEach(d=>{const c=document.createElement("button");c.className="btn btn-secondary",c.style.cssText="justify-content:flex-start; padding:8px 12px;",c.innerHTML=`<span style="margin-right:8px;">${r.icon}</span> ${d.title}`,c.onclick=()=>{this.onSelect&&this.onSelect({type:l,title:d.title,inputs:d.inputs||[],outputs:d.outputs||[]}),a.close()},o.appendChild(c)}),n.appendChild(o)}};Object.values(z).forEach(l=>{const r=document.createElement("button");r.className="tab",r.dataset.type=l.id,r.innerHTML=`${l.icon} ${l.label}`,r.onclick=()=>i(l.id),e.appendChild(r)}),t.appendChild(e),t.appendChild(n);const a=new A({title:"Add Node",content:t,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:l=>l.close()}]});a.show(),await i("event")}}const W={id:"architect",label:"Architect",icon:"📐",render:(s,t)=>{s.style.padding="0",s.innerHTML=`
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
        `;const e=s.querySelector("#arch-workspace"),n=s.querySelector("#arch-nodes"),i=s.querySelector("#arch-svg"),a=new ot(e,n,i);a.init();const l=new rt({onSelect:c=>{a.addNode({id:R.generateId("node"),x:100+Math.random()*100,y:100+Math.random()*100,type:c.type,title:c.title,inputs:c.inputs||[],outputs:c.outputs||[],entryId:c.entryId||null,entryType:c.entryType||null})}});s.querySelector("#btn-add-node").onclick=()=>{l.show()},s.querySelector("#btn-reset-view").onclick=()=>{a.resetView()},s.querySelector("#btn-clear-all").onclick=()=>{confirm("Clear all nodes?")&&(a.nodes=[],a.links=[],n.innerHTML="",i.innerHTML="",a.notifyChange())};const r="samildanach_architect_layout";a.onDataChange=c=>{localStorage.setItem(r,JSON.stringify(c))};const o=localStorage.getItem(r);if(o)try{const c=JSON.parse(o);a.importData(c)}catch(c){console.error("Failed to load architect layout:",c),d()}else d();function d(){a.nodes.length===0&&(a.addNode({id:"start",x:50,y:50,type:"event",title:"On Attack",inputs:["attacker","target"],outputs:["next"]}),a.addNode({id:"d20",x:300,y:100,type:"action",title:"Roll Dice",inputs:["expression"],outputs:["result","next"]}),a.addNode({id:"check",x:550,y:50,type:"condition",title:"Compare Roll",inputs:["roll","dc"],outputs:["success","failure"]}))}}},K={id:"graph",label:"Graph",icon:"🕸️",render:async(s,t)=>{try{await k.init()}catch(p){s.innerHTML=`<div class="text-muted">Vault Error: ${p.message}</div>`;return}s.style.padding="0",s.innerHTML=`
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
        `;const e=s.querySelector("#graph-container"),n=s.querySelector("#graph-canvas"),i=n.getContext("2d"),a=()=>{n.width=e.clientWidth,n.height=e.clientHeight};a(),window.addEventListener("resize",a);const l=await k.list(),r=l.map((p,g)=>{const h=D(p.type),S=g/l.length*Math.PI*2,E=Math.min(n.width,n.height)*.3;return{id:p.id,item:p,label:p.data.name||"Untitled",icon:h.icon,color:h.color,x:n.width/2+Math.cos(S)*E,y:n.height/2+Math.sin(S)*E,vx:0,vy:0}}),o=Object.fromEntries(r.map(p=>[p.id,p])),d=[];l.forEach(p=>{(p.data.relationships||[]).forEach(g=>{if(o[g.targetId]){const h=B(g.type);d.push({from:p.id,to:g.targetId,label:h.label,color:h.icon})}})});let c={x:0,y:0,scale:1},u=!1,v={x:0,y:0},x=null;const C=()=>{i.clearRect(0,0,n.width,n.height),i.save(),i.translate(c.x,c.y),i.scale(c.scale,c.scale),i.lineWidth=2,d.forEach(p=>{const g=o[p.from],h=o[p.to];g&&h&&(i.strokeStyle="rgba(100, 116, 139, 0.5)",i.beginPath(),i.moveTo(g.x,g.y),i.lineTo(h.x,h.y),i.stroke())}),r.forEach(p=>{i.fillStyle=p.color||"#6366f1",i.beginPath(),i.arc(p.x,p.y,24,0,Math.PI*2),i.fill(),i.font="16px sans-serif",i.textAlign="center",i.textBaseline="middle",i.fillStyle="#fff",i.fillText(p.icon,p.x,p.y),i.font="11px sans-serif",i.fillStyle="var(--text-primary)",i.fillText(p.label,p.x,p.y+36)}),i.restore()},m=()=>{const p=n.width/2,g=n.height/2;r.forEach(h=>{r.forEach(S=>{if(h.id===S.id)return;const E=h.x-S.x,M=h.y-S.y,$=Math.sqrt(E*E+M*M)||1,N=5e3/($*$);h.vx+=E/$*N,h.vy+=M/$*N}),h.vx+=(p-h.x)*.001,h.vy+=(g-h.y)*.001}),d.forEach(h=>{const S=o[h.from],E=o[h.to];if(S&&E){const M=E.x-S.x,$=E.y-S.y,N=Math.sqrt(M*M+$*$)||1,H=(N-150)*.01;S.vx+=M/N*H,S.vy+=$/N*H,E.vx-=M/N*H,E.vy-=$/N*H}}),r.forEach(h=>{x!==h&&(h.x+=h.vx*.1,h.y+=h.vy*.1),h.vx*=.9,h.vy*=.9}),C(),requestAnimationFrame(m)};m();const y=p=>({x:(p.offsetX-c.x)/c.scale,y:(p.offsetY-c.y)/c.scale}),w=(p,g)=>r.find(h=>{const S=h.x-p,E=h.y-g;return Math.sqrt(S*S+E*E)<24});n.onmousedown=p=>{const g=y(p),h=w(g.x,g.y);h?x=h:(u=!0,v={x:p.clientX,y:p.clientY})},n.onmousemove=p=>{if(x){const g=y(p);x.x=g.x,x.y=g.y}else u&&(c.x+=p.clientX-v.x,c.y+=p.clientY-v.y,v={x:p.clientX,y:p.clientY})},n.onmouseup=()=>{x=null,u=!1},n.onwheel=p=>{p.preventDefault();const g=p.deltaY>0?.9:1.1;c.scale*=g,c.scale=Math.min(Math.max(.3,c.scale),3)},s.querySelector("#graph-reset").onclick=()=>{c={x:0,y:0,scale:1}},s.querySelector("#graph-relayout").onclick=()=>{r.forEach((p,g)=>{const h=g/r.length*Math.PI*2,S=Math.min(n.width,n.height)*.3;p.x=n.width/2+Math.cos(h)*S,p.y=n.height/2+Math.sin(h)*S,p.vx=0,p.vy=0})}}},L={async toJSON(){await k.init();const s=await k.list();return{meta:{...f.project},entries:s,exportedAt:new Date().toISOString(),version:"1.0",format:"samildanach-json"}},async toMarkdown(s={}){var a;const{includeRelationships:t=!0}=s;await k.init();const e=await k.list();let n="";n+=`# ${f.project.title||"Untitled Setting"}

`,f.project.author&&(n+=`**Author:** ${f.project.author}

`),f.project.version&&(n+=`**Version:** ${f.project.version}

`),f.project.genre&&(n+=`**Genre:** ${f.project.genre}

`),f.project.system&&(n+=`**System:** ${f.project.system}

`),f.project.description&&(n+=`---

${f.project.description}

`),n+=`---

`;const i=P();for(const l of i){const r=e.filter(o=>o.type===l.id);if(r.length!==0){n+=`## ${l.icon} ${l.label}s

`;for(const o of r){n+=`### ${o.data.name||"Untitled"}

`;for(const d of l.fields){const c=o.data[d.key];c&&(n+=`**${d.label}:** ${c}

`)}if(o.data.description){const d=this._stripHtml(o.data.description);n+=`${d}

`}if(t&&((a=o.data.relationships)==null?void 0:a.length)>0){n+=`**Relationships:**
`;for(const d of o.data.relationships){const c=B(d.type),u=e.find(x=>x.id===d.targetId),v=(u==null?void 0:u.data.name)||"(Unknown)";n+=`- ${c.icon} ${c.label}: ${v}
`}n+=`
`}n+=`---

`}}}return n+=`
---
*Exported from Samildánach on ${new Date().toLocaleDateString()}*
`,n},async toHTML(){let t=(await this.toMarkdown()).replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^# (.+)$/gm,"<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/^- (.+)$/gm,"<li>$1</li>").replace(/(<li>.*<\/li>\n)+/g,"<ul>$&</ul>").replace(/^---$/gm,"<hr>").replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br>");return`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${f.project.title||"Samildánach Export"}</title>
    <style>
        :root {
            --bg: #1a1a2e;
            --text: #e0e0e0;
            --accent: #7c3aed;
            --border: #333;
        }
        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: var(--bg);
            color: var(--text);
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.6;
        }
        h1 { color: var(--accent); border-bottom: 2px solid var(--accent); padding-bottom: 10px; }
        h2 { color: var(--accent); margin-top: 40px; }
        h3 { margin-top: 30px; }
        hr { border: none; border-top: 1px solid var(--border); margin: 20px 0; }
        ul { padding-left: 20px; }
        li { margin: 4px 0; }
        strong { color: #fff; }
        @media print {
            body { background: white; color: black; }
            h1, h2, h3, strong { color: black; }
        }
    </style>
</head>
<body>
    <p>${t}</p>
</body>
</html>`},async printToPDF(){const s=await this.toHTML(),t=window.open("","_blank");t.document.write(s),t.document.close(),t.focus(),setTimeout(()=>t.print(),250)},download(s,t,e="text/plain"){const n=new Blob([s],{type:e}),i=URL.createObjectURL(n),a=document.createElement("a");a.href=i,a.download=t,a.click(),URL.revokeObjectURL(i)},_stripHtml(s){const t=document.createElement("div");return t.innerHTML=s,t.querySelectorAll(".wiki-link").forEach(e=>{e.replaceWith(e.dataset.link||e.textContent)}),t.textContent||t.innerText||""}},Q={id:"export",label:"Export",icon:"📤",render:(s,t)=>{s.innerHTML=`
            <div class="export-layout">
                <div class="export-content">
                    <h1 class="export-title">Export Project</h1>
                    <p class="export-description">
                        Export your world-building data in various formats.
                    </p>

                    <!-- Format Selection -->
                    <div class="export-section">
                        <h2 class="section-title">Format</h2>
                        <div class="format-grid">
                            <button class="format-btn active" data-format="json">
                                <span class="format-icon">📦</span>
                                <span class="format-name">JSON</span>
                                <span class="format-desc">Complete data backup</span>
                            </button>
                            <button class="format-btn" data-format="markdown">
                                <span class="format-icon">📝</span>
                                <span class="format-name">Markdown</span>
                                <span class="format-desc">Human-readable text</span>
                            </button>
                            <button class="format-btn" data-format="html">
                                <span class="format-icon">🌐</span>
                                <span class="format-name">HTML</span>
                                <span class="format-desc">Styled web page</span>
                            </button>
                            <button class="format-btn" data-format="pdf">
                                <span class="format-icon">📄</span>
                                <span class="format-name">PDF</span>
                                <span class="format-desc">Print-ready document</span>
                            </button>
                        </div>
                    </div>

                    <!-- Preview -->
                    <div class="export-section">
                        <h2 class="section-title">Preview</h2>
                        <div id="export-preview" class="export-preview">
                            <div class="preview-loading">Select a format above</div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="export-actions">
                        <button id="btn-export" class="btn btn-primary btn-lg">Download</button>
                    </div>
                </div>
            </div>
        `;let e="json";const n=s.querySelector("#export-preview"),i=s.querySelector("#btn-export"),a=s.querySelectorAll(".format-btn");a.forEach(o=>{o.onclick=async()=>{a.forEach(d=>d.classList.remove("active")),o.classList.add("active"),e=o.dataset.format,await l()}});async function l(){n.innerHTML='<div class="preview-loading">Generating preview...</div>';try{let o="";switch(e){case"json":const d=await L.toJSON();o=`<pre class="preview-code">${JSON.stringify(d,null,2).substring(0,2e3)}${JSON.stringify(d,null,2).length>2e3?`
...`:""}</pre>`;break;case"markdown":const c=await L.toMarkdown();o=`<pre class="preview-code">${r(c.substring(0,2e3))}${c.length>2e3?`
...`:""}</pre>`;break;case"html":o=`<div class="preview-note">Full HTML document will be downloaded.</div><pre class="preview-code">${r((await L.toHTML()).substring(0,1500))}...</pre>`;break;case"pdf":o=`<div class="preview-note">PDF will open in a print dialog.<br>Use "Save as PDF" in your browser's print options.</div>`;break}n.innerHTML=o}catch(o){n.innerHTML=`<div class="preview-error">Error: ${o.message}</div>`}}i.onclick=async()=>{i.disabled=!0,i.innerText="Exporting...";try{const o=(f.project.title||"samildanach").toLowerCase().replace(/\s+/g,"-");switch(e){case"json":const d=await L.toJSON();L.download(JSON.stringify(d,null,2),`${o}.json`,"application/json");break;case"markdown":const c=await L.toMarkdown();L.download(c,`${o}.md`,"text/markdown");break;case"html":const u=await L.toHTML();L.download(u,`${o}.html`,"text/html");break;case"pdf":await L.printToPDF();break}}catch(o){alert("Export failed: "+o.message)}i.disabled=!1,i.innerText="Download"},l();function r(o){const d=document.createElement("div");return d.textContent=o,d.innerHTML}}};async function lt(){console.log(`%c Samildánach v${f.project.version} `,"background: #222; color: #bada55"),I.registerPanel(U.id,U),I.registerPanel(b.id,b),I.registerPanel(K.id,K),I.registerPanel(W.id,W),I.registerPanel(X.id,X),I.registerPanel(Q.id,Q),I.init(),I.activePanelId||I.switchPanel(U.id)}window.addEventListener("DOMContentLoaded",lt);
