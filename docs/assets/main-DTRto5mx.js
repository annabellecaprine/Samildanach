(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function s(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(i){if(i.ep)return;i.ep=!0;const a=s(i);fetch(i.href,a)}})();const ue="samildanach_state",x={project:{title:"Untitled Setting",author:"",version:"1.0.0",description:"",genre:"",system:""},session:{activePanel:null,activeEntryId:null},cache:{},_subscribers:[],init(){const t=localStorage.getItem(ue);if(t)try{const e=JSON.parse(t);e.project&&Object.assign(this.project,e.project),e.session&&Object.assign(this.session,e.session)}catch(e){console.warn("Failed to restore state:",e)}},save(){const t={project:this.project,session:this.session};localStorage.setItem(ue,JSON.stringify(t))},updateProject(t){Object.assign(this.project,t),this.save(),this._notify("project",this.project)},updateSession(t){Object.assign(this.session,t),this.save(),this._notify("session",this.session)},subscribe(t,e){const s={key:t,callback:e};return this._subscribers.push(s),()=>{const n=this._subscribers.indexOf(s);n>=0&&this._subscribers.splice(n,1)}},_notify(t,e){this._subscribers.filter(s=>s.key===t).forEach(s=>s.callback(e))},exportState(){return{project:{...this.project},session:{...this.session}}},importState(t){t.project&&Object.assign(this.project,t.project),t.session&&Object.assign(this.session,t.session),this.save(),this._notify("project",this.project),this._notify("session",this.session)}},N={panels:{},activePanelId:null,init:function(){x.init(),this.renderSidebar(),this.bindEvents();const t=localStorage.getItem("theme")||"dark";document.documentElement.setAttribute("data-theme",t),x.session.activePanel&&this.panels[x.session.activePanel]&&this.switchPanel(x.session.activePanel)},registerPanel:function(t,e){this.panels[t]=e,this.renderSidebar()},switchPanel:function(t){if(!this.panels[t])return;this.activePanelId=t,x.updateSession({activePanel:t}),document.querySelectorAll(".nav-item").forEach(n=>{n.classList.toggle("active",n.dataset.id===t)});const e=document.getElementById("main-view");e.innerHTML="";const s=document.createElement("div");s.className="panel-container",this.panels[t].render(s,x),e.appendChild(s)},renderSidebar:function(){const t=document.getElementById("nav-list");t&&(t.innerHTML="",Object.keys(this.panels).forEach(e=>{const s=this.panels[e],n=document.createElement("div");n.className="nav-item",n.innerHTML=s.icon||"📦",n.title=s.label||e,n.dataset.id=e,n.onclick=()=>this.switchPanel(e),e===this.activePanelId&&n.classList.add("active"),t.appendChild(n)}))},bindEvents:function(){const t=document.getElementById("theme-toggle");t&&(t.onclick=()=>{const e=document.documentElement,n=e.getAttribute("data-theme")==="dark"?"light":"dark";e.setAttribute("data-theme",n),localStorage.setItem("theme",n)})}},G={generateId:(t="id")=>typeof crypto<"u"&&crypto.randomUUID?`${t}_${crypto.randomUUID().split("-")[0]}`:`${t}_${Math.random().toString(36).substring(2,9)}`,escapeHtml:t=>{const e=document.createElement("div");return e.textContent=t,e.innerHTML},debounce:(t,e=300)=>{let s;return(...n)=>{clearTimeout(s),s=setTimeout(()=>t(...n),e)}},deepClone:t=>JSON.parse(JSON.stringify(t)),formatDate:t=>{const e=new Date(t);return e.toLocaleDateString()+" "+e.toLocaleTimeString()},truncate:(t,e=50)=>!t||t.length<=e?t:t.substring(0,e-3)+"..."},X=G.generateId,Ee="samildanach_vault",Te=1,R="items",F="registry",W="vault_registry";let $=null;function me(){return{id:W,lastUpdatedAt:new Date().toISOString(),universes:[],allTags:[],blocks:{},itemCounts:{actor:0,lorebook:0,script:0,location:0,event:0,pair:0}}}const T={init:function(){return new Promise((t,e)=>{if($){t($);return}const s=indexedDB.open(Ee,Te);s.onerror=n=>{console.error("[VaultDB] Failed to open database:",n.target.error),e(n.target.error)},s.onsuccess=n=>{$=n.target.result,console.log("[VaultDB] Database opened successfully"),t($)},s.onupgradeneeded=n=>{const i=n.target.result;if(!i.objectStoreNames.contains(R)){const a=i.createObjectStore(R,{keyPath:"id"});a.createIndex("type","type",{unique:!1}),a.createIndex("universe","universe",{unique:!1}),a.createIndex("updatedAt","updatedAt",{unique:!1}),console.log("[VaultDB] Items store created")}i.objectStoreNames.contains(F)||(i.createObjectStore(F,{keyPath:"id"}),console.log("[VaultDB] Registry store created"))}})},getRegistry:function(){return new Promise((t,e)=>{if(!$){e(new Error("VaultDB not initialized"));return}const i=$.transaction(F,"readonly").objectStore(F).get(W);i.onsuccess=()=>{i.result?t(i.result):T.updateRegistry(me()).then(t).catch(e)},i.onerror=a=>e(a.target.error)})},updateRegistry:function(t){return new Promise((e,s)=>{if(!$){s(new Error("VaultDB not initialized"));return}const i=$.transaction(F,"readwrite").objectStore(F),a=i.get(W);a.onsuccess=()=>{const o={...a.result||me(),...t,id:W,lastUpdatedAt:new Date().toISOString()},l=i.put(o);l.onsuccess=()=>e(o),l.onerror=p=>s(p.target.error)},a.onerror=r=>s(r.target.error)})},list:function(t={}){return new Promise((e,s)=>{if(!$){s(new Error("VaultDB not initialized"));return}const i=$.transaction(R,"readonly").objectStore(R);let a;t.type?a=i.index("type").openCursor(IDBKeyRange.only(t.type)):t.universe?a=i.index("universe").openCursor(IDBKeyRange.only(t.universe)):a=i.openCursor();const r=[];a.onsuccess=o=>{const l=o.target.result;if(l){const p=l.value;let d=!0;t.type&&p.type!==t.type&&(d=!1),t.universe&&p.universe!==t.universe&&(d=!1),t.tags&&t.tags.length>0&&(t.tags.every(y=>{var S;return(S=p.tags)==null?void 0:S.includes(y)})||(d=!1)),d&&r.push(p),l.continue()}else r.sort((p,d)=>new Date(d.updatedAt).getTime()-new Date(p.updatedAt).getTime()),e(r)},a.onerror=o=>s(o.target.error)})},addItem:function(t,e,s={}){return new Promise((n,i)=>{if(!$){console.error("[VaultDB]AddItem: DB not initialized"),i(new Error("VaultDB not initialized"));return}const a=new Date().toISOString();let r;try{r=G&&G.generateId?G.generateId("vault"):`vault_${crypto.randomUUID()}`}catch(v){console.error("[VaultDB] ID Gen Failed:",v),r="vault_"+Date.now()}const o={id:r,type:t,version:1,universe:s.universe||"",tags:s.tags||[],createdAt:a,updatedAt:a,data:e};console.log("[VaultDB] Adding Item:",o);const d=$.transaction(R,"readwrite").objectStore(R).add(o);d.onsuccess=()=>{console.log("[VaultDB] Add Success"),n(o)},d.onerror=v=>{console.error("[VaultDB] Add Failed:",v.target.error),i(v.target.error)}})},updateItem:function(t){return new Promise((e,s)=>{if(!$){s(new Error("VaultDB not initialized"));return}t.updatedAt=new Date().toISOString();const a=$.transaction(R,"readwrite").objectStore(R).put(t);a.onsuccess=()=>e(t),a.onerror=r=>s(r.target.error)})}},oe={person:{id:"person",label:"Person",icon:"👤",color:"#6366f1",fields:[{key:"role",label:"Role",type:"text"},{key:"affiliation",label:"Affiliation",type:"text"},{key:"motivation",label:"Motivation",type:"text"},{key:"appearance",label:"Appearance",type:"textarea"}]},location:{id:"location",label:"Location",icon:"📍",color:"#22c55e",fields:[{key:"region",label:"Region",type:"text"},{key:"climate",label:"Climate",type:"text"},{key:"pointsOfInterest",label:"Points of Interest",type:"textarea"}]},faction:{id:"faction",label:"Faction",icon:"🏛️",color:"#f59e0b",fields:[{key:"goals",label:"Goals",type:"textarea"},{key:"allies",label:"Allies",type:"text"},{key:"enemies",label:"Enemies",type:"text"}]},concept:{id:"concept",label:"Concept",icon:"💡",color:"#8b5cf6",fields:[{key:"domain",label:"Domain",type:"text"},{key:"principles",label:"Core Principles",type:"textarea"}]},event:{id:"event",label:"Event",icon:"📜",color:"#ef4444",fields:[{key:"era",label:"Era/Date",type:"text"},{key:"participants",label:"Participants",type:"text"},{key:"outcome",label:"Outcome",type:"textarea"}]},item:{id:"item",label:"Item",icon:"🎁",color:"#14b8a6",fields:[{key:"origin",label:"Origin",type:"text"},{key:"properties",label:"Properties",type:"textarea"}]}},U=t=>oe[t]||oe.item,V=()=>Object.values(oe),se={id:"project",label:"Project",icon:"🏠",render:async(t,e)=>{try{await T.init()}catch(o){t.innerHTML=`<div class="text-muted">Vault Error: ${o.message}</div>`;return}const s=await T.list(),n={};V().forEach(o=>{n[o.id]=s.filter(l=>l.type===o.id).length});const i=s.reduce((o,l)=>{var p;return o+(((p=l.data.relationships)==null?void 0:p.length)||0)},0);t.innerHTML=`
            <div class="project-layout">
                <div class="project-content">
                    
                    <!-- Header -->
                    <div class="project-header">
                        <div class="project-icon">📖</div>
                        <input id="proj-title" type="text" value="${x.project.title}" 
                            placeholder="Setting Title" class="project-title">
                        <div class="project-author">
                            <input id="proj-author" type="text" value="${x.project.author}" 
                                placeholder="Author Name">
                        </div>
                    </div>

                    <!-- Stats Cards -->
                    <div class="stats-grid">
                        ${V().map(o=>`
                            <div class="stat-card" style="border-left-color: ${o.color};">
                                <div class="stat-icon">${o.icon}</div>
                                <div class="stat-value">${n[o.id]||0}</div>
                                <div class="stat-label">${o.label}s</div>
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
                                <input id="proj-version" type="text" value="${x.project.version}" class="input">
                            </div>
                            <div class="detail-field">
                                <label class="label">Genre</label>
                                <input id="proj-genre" type="text" value="${x.project.genre}" 
                                    placeholder="Fantasy, Sci-Fi, Horror..." class="input">
                            </div>
                        </div>
                        
                        <div class="detail-field">
                            <label class="label">Compatible Game System</label>
                            <input id="proj-system" type="text" value="${x.project.system}" 
                                placeholder="D&D 5e, Pathfinder 2e, Fate Core..." class="input">
                        </div>

                        <div class="detail-field" style="margin-top: 16px;">
                            <label class="label">Description</label>
                            <textarea id="proj-description" rows="4" 
                                placeholder="Describe your setting..." class="textarea">${x.project.description}</textarea>
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
        `;const a=()=>{x.updateProject({title:t.querySelector("#proj-title").value,author:t.querySelector("#proj-author").value,version:t.querySelector("#proj-version").value,genre:t.querySelector("#proj-genre").value,system:t.querySelector("#proj-system").value,description:t.querySelector("#proj-description").value})};t.querySelectorAll("input, textarea").forEach(o=>{o.oninput=a}),t.querySelector("#btn-export").onclick=async()=>{const o={meta:x.project,entries:s,exportedAt:new Date().toISOString(),version:"1.0"},l=new Blob([JSON.stringify(o,null,2)],{type:"application/json"}),p=URL.createObjectURL(l),d=document.createElement("a");d.href=p,d.download=`${x.project.title.replace(/[^a-z0-9]/gi,"_")}_setting.json`,d.click(),URL.revokeObjectURL(p)};const r=t.querySelector("#import-file");t.querySelector("#btn-import").onclick=()=>r.click(),r.onchange=async o=>{var p;const l=o.target.files[0];if(l)try{const d=await l.text(),v=JSON.parse(d);if(v.meta&&x.updateProject(v.meta),v.entries&&Array.isArray(v.entries))for(const y of v.entries)await T.addItem(y.type,y.data);alert(`Imported ${((p=v.entries)==null?void 0:p.length)||0} entries!`),location.reload()}catch(d){alert("Import failed: "+d.message)}}}},re={parse(t){const e=t.trim().match(/^(\d+)?d(\d+)([+-]\d+)?$/i);return e?{count:parseInt(e[1])||1,sides:parseInt(e[2]),modifier:parseInt(e[3])||0}:null},rollOne(t){return Math.floor(Math.random()*t)+1},rollMany(t,e){const s=[];for(let n=0;n<t;n++)s.push(this.rollOne(e));return s},roll(t){const e=this.parse(t);if(!e)return{error:"Invalid format. Use NdX or NdX+Y (e.g., 2d6+3)"};const s=this.rollMany(e.count,e.sides),n=s.reduce((a,r)=>a+r,0),i=n+e.modifier;return{expression:t,rolls:s,subtotal:n,modifier:e.modifier,total:i}},format(t){if(t.error)return t.error;let e=`[${t.rolls.join(", ")}]`;return t.modifier!==0&&(e+=` ${t.modifier>0?"+":""}${t.modifier}`),e+=` = ${t.total}`,e},stats(t){const e=this.parse(t);if(!e)return null;const s=e.count+e.modifier,n=e.count*e.sides+e.modifier,i=(s+n)/2;return{min:s,max:n,average:i.toFixed(1)}}},ne={runDiceSimulation(t,e=1e3){const s=[],n={};for(let c=0;c<e;c++){const u=re.roll(t);if(u.error)return{error:u.error};s.push(u.total),n[u.total]=(n[u.total]||0)+1}const i=[...s].sort((c,u)=>c-u),r=s.reduce((c,u)=>c+u,0)/e,l=s.map(c=>Math.pow(c-r,2)).reduce((c,u)=>c+u,0)/e,p=Math.sqrt(l);let d=null,v=0;for(const[c,u]of Object.entries(n))u>v&&(v=u,d=parseInt(c));const y=e%2===0?(i[e/2-1]+i[e/2])/2:i[Math.floor(e/2)],S=i[Math.floor(e*.25)],m=i[Math.floor(e*.75)];return{expression:t,iterations:e,results:s,distribution:n,stats:{min:i[0],max:i[i.length-1],mean:r.toFixed(2),median:y,mode:d,stdDev:p.toFixed(2),p25:S,p75:m}}},getHistogramData(t){if(t.error)return[];const{distribution:e,iterations:s,stats:n}=t,i=[];for(let a=n.min;a<=n.max;a++){const r=e[a]||0;i.push({value:a,count:r,percentage:(r/s*100).toFixed(1)})}return i},compare(t,e,s=1e3){const n=this.runDiceSimulation(t,s),i=this.runDiceSimulation(e,s);if(n.error||i.error)return{error:n.error||i.error};let a=0,r=0,o=0;for(let l=0;l<s;l++)n.results[l]>i.results[l]?a++:i.results[l]>n.results[l]?r++:o++;return{expr1:{expression:t,stats:n.stats},expr2:{expression:e,stats:i.stats},comparison:{wins1:a,wins2:r,ties:o,win1Pct:(a/s*100).toFixed(1),win2Pct:(r/s*100).toFixed(1),tiePct:(o/s*100).toFixed(1)}}}},he={id:"laboratory",label:"Laboratory",icon:"🧪",render:(t,e)=>{t.innerHTML=`
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
        `;const s=t.querySelector("#lab-expr"),n=t.querySelector("#lab-roll"),i=t.querySelector("#lab-result"),a=t.querySelector("#lab-stats");s.oninput=()=>{const c=re.stats(s.value);c?a.innerText=`Range: ${c.min}–${c.max} | Average: ${c.average}`:a.innerText=""},s.oninput(),n.onclick=()=>{const c=s.value.trim();if(!c)return;const u=re.roll(c);u.error?i.innerHTML=`<span style="color:var(--status-error);">${u.error}</span>`:i.innerHTML=`
                    <div><strong>Rolls:</strong> [${u.rolls.join(", ")}]</div>
                    ${u.modifier!==0?`<div><strong>Modifier:</strong> ${u.modifier>0?"+":""}${u.modifier}</div>`:""}
                    <div class="roll-total"><strong>Total:</strong> ${u.total}</div>
                `},s.onkeydown=c=>{c.key==="Enter"&&n.onclick()};const r=t.querySelector("#sim-expr"),o=t.querySelector("#sim-iterations"),l=t.querySelector("#sim-run"),p=t.querySelector("#sim-results"),d=t.querySelector("#histogram");l.onclick=()=>{const c=r.value.trim(),u=parseInt(o.value);c&&(l.disabled=!0,l.innerText="Running...",setTimeout(()=>{const f=ne.runDiceSimulation(c,u);if(l.disabled=!1,l.innerText="Run",f.error){p.style.display="none",alert(f.error);return}p.style.display="block",t.querySelector("#stat-min").innerText=f.stats.min,t.querySelector("#stat-max").innerText=f.stats.max,t.querySelector("#stat-mean").innerText=f.stats.mean,t.querySelector("#stat-median").innerText=f.stats.median,t.querySelector("#stat-mode").innerText=f.stats.mode,t.querySelector("#stat-stddev").innerText=f.stats.stdDev;const h=ne.getHistogramData(f),g=Math.max(...h.map(b=>b.count));d.innerHTML=h.map(b=>`
                    <div class="hist-bar-container">
                        <div class="hist-bar" style="height: ${b.count/g*100}%;" title="${b.value}: ${b.count} (${b.percentage}%)"></div>
                        <span class="hist-label">${b.value}</span>
                    </div>
                `).join("")},10))};const v=t.querySelector("#cmp-expr1"),y=t.querySelector("#cmp-expr2"),S=t.querySelector("#cmp-run"),m=t.querySelector("#cmp-results");S.onclick=()=>{const c=v.value.trim(),u=y.value.trim();if(!c||!u)return;const f=ne.compare(c,u,1e3);if(f.error){m.style.display="none",alert(f.error);return}m.style.display="block",m.innerHTML=`
                <div class="compare-stat">
                    <strong>${c}</strong> wins <span class="highlight">${f.comparison.win1Pct}%</span> of the time
                    <small>(avg: ${f.expr1.stats.mean})</small>
                </div>
                <div class="compare-stat">
                    <strong>${u}</strong> wins <span class="highlight">${f.comparison.win2Pct}%</span> of the time
                    <small>(avg: ${f.expr2.stats.mean})</small>
                </div>
                <div class="compare-stat tie">
                    Ties: ${f.comparison.tiePct}%
                </div>
            `}}};class Y{constructor(e={}){this.title=e.title||"Modal",this.content=e.content||"",this.actions=e.actions||[],this.onClose=e.onClose||null,this.element=null}show(){this.element=document.createElement("div"),this.element.className="modal-overlay",this.element.innerHTML=`
            <div class="modal-content">
                <h3 class="modal-title">${this.title}</h3>
                <div class="modal-body"></div>
                <div class="modal-actions"></div>
            </div>
        `;const e=this.element.querySelector(".modal-body");typeof this.content=="string"?e.innerHTML=this.content:this.content instanceof HTMLElement&&e.appendChild(this.content);const s=this.element.querySelector(".modal-actions");this.actions.forEach(n=>{const i=document.createElement("button");i.className=n.className||"btn btn-secondary",i.innerText=n.label,i.onclick=()=>{n.onClick&&n.onClick(this)},s.appendChild(i)}),this.element.onclick=n=>{n.target===this.element&&this.close()},document.body.appendChild(this.element)}close(){this.element&&(this.element.remove(),this.element=null),this.onClose&&this.onClose()}getBody(){var e;return(e=this.element)==null?void 0:e.querySelector(".modal-body")}static confirm(e,s){return new Promise(n=>{const i=new Y({title:e,content:`<p>${s}</p>`,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:()=>{i.close(),n(!1)}},{label:"Confirm",className:"btn btn-primary",onClick:()=>{i.close(),n(!0)}}]});i.show()})}static alert(e,s){return new Promise(n=>{const i=new Y({title:e,content:`<p>${s}</p>`,actions:[{label:"OK",className:"btn btn-primary",onClick:()=>{i.close(),n()}}]});i.show()})}}class Ce{constructor(e,s={}){this.container=e,this.items=[],this.activeCategory=null,this.activeItemId=null,this.onSelect=s.onSelect||null,this.onCreate=s.onCreate||null}setItems(e){this.items=e,this.render()}setActiveItem(e){this.activeItemId=e,this.renderList()}render(){this.container.innerHTML=`
            <div id="category-tabs" class="library-tabs"></div>
            <div class="library-search-bar">
                <input id="lib-search" type="text" placeholder="Search..." class="input">
                <button id="lib-add-btn" class="btn btn-primary">+</button>
            </div>
            <div id="lib-list" class="library-list"></div>
        `,this.tabsEl=this.container.querySelector("#category-tabs"),this.searchInput=this.container.querySelector("#lib-search"),this.listEl=this.container.querySelector("#lib-list"),this.addBtn=this.container.querySelector("#lib-add-btn"),this.renderTabs(),this.renderList(),this.searchInput.oninput=()=>this.renderList(),this.addBtn.onclick=()=>{this.onCreate&&this.onCreate()}}renderTabs(){this.tabsEl.innerHTML="";const e=document.createElement("button");e.innerText="All",e.className="tab"+(this.activeCategory===null?" active":""),e.onclick=()=>{this.activeCategory=null,this.renderTabs(),this.renderList()},this.tabsEl.appendChild(e),V().forEach(s=>{const n=document.createElement("button");n.innerText=`${s.icon} ${s.label}`,n.className="tab"+(this.activeCategory===s.id?" active":""),this.activeCategory===s.id&&(n.style.background=s.color,n.style.borderColor=s.color),n.onclick=()=>{this.activeCategory=s.id,this.renderTabs(),this.renderList()},this.tabsEl.appendChild(n)})}renderList(){var i;if(!this.listEl)return;this.listEl.innerHTML="";const e=((i=this.searchInput)==null?void 0:i.value.toLowerCase())||"",s=this.activeCategory,n=this.items.filter(a=>{const r=(a.data.name||"").toLowerCase().includes(e),o=s?a.type===s:!0;return r&&o});if(n.length===0){this.listEl.innerHTML='<div class="library-list-empty">No entries found.</div>';return}n.forEach(a=>{const r=U(a.type),o=this.activeItemId===a.id,l=document.createElement("div");l.className="list-item"+(o?" active":""),l.innerHTML=`
                <span>${r.icon}</span>
                <span class="flex-1" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${a.data.name||"Untitled"}</span>
            `,l.onclick=()=>{this.onSelect&&this.onSelect(a)},this.listEl.appendChild(l)})}}class $e{constructor(e,s="",n={}){this.container=e,this.value=s,this.onChange=null,this.onLinkClick=n.onLinkClick||null,this.getEntries=n.getEntries||(()=>[])}render(){this.container.innerHTML=`
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
        `,this.editor=this.container.querySelector(".rte-content"),this.autocomplete=this.container.querySelector(".rte-autocomplete"),this.bindEvents()}renderWithLinks(e){return e.replace(/\[\[([^\]]+)\]\]/g,(s,n)=>`<span class="wiki-link" data-link="${n}">[[${n}]]</span>`)}extractRawText(e){const s=document.createElement("div");return s.innerHTML=e,s.querySelectorAll(".wiki-link").forEach(n=>{n.replaceWith(`[[${n.dataset.link}]]`)}),s.innerHTML}bindEvents(){this.container.querySelectorAll("button[data-cmd]").forEach(e=>{e.onclick=s=>{s.preventDefault();const n=e.dataset.cmd;n==="link"?this.insertLinkPlaceholder():n==="h2"||n==="h3"?document.execCommand("formatBlock",!1,n):document.execCommand(n,!1,null),this.editor.focus()}}),this.editor.oninput=()=>{this.checkForAutocomplete(),this.value=this.extractRawText(this.editor.innerHTML),this.onChange&&this.onChange(this.value)},this.editor.onclick=e=>{if(e.target.classList.contains("wiki-link")){const s=e.target.dataset.link;this.onLinkClick&&this.onLinkClick(s)}},this.editor.onkeydown=e=>{if(this.autocomplete.style.display!=="none")if(e.key==="ArrowDown"||e.key==="ArrowUp")e.preventDefault(),this.navigateAutocomplete(e.key==="ArrowDown"?1:-1);else if(e.key==="Enter"||e.key==="Tab"){const s=this.autocomplete.querySelector(".selected");s&&(e.preventDefault(),this.selectAutocompleteItem(s.dataset.name))}else e.key==="Escape"&&this.hideAutocomplete()},this.editor.onblur=()=>{setTimeout(()=>this.hideAutocomplete(),150)}}insertLinkPlaceholder(){document.execCommand("insertText",!1,"[[]]");const e=window.getSelection();if(e.rangeCount){const s=e.getRangeAt(0);s.setStart(s.startContainer,s.startOffset-2),s.collapse(!0),e.removeAllRanges(),e.addRange(s)}}checkForAutocomplete(){const e=window.getSelection();if(!e.rangeCount)return;const s=e.getRangeAt(0),n=s.startContainer;if(n.nodeType!==Node.TEXT_NODE)return;const a=n.textContent.substring(0,s.startOffset).match(/\[\[([^\]]*?)$/);if(a){const r=a[1].toLowerCase(),o=this.getEntries().filter(l=>(l.data.name||"").toLowerCase().includes(r)).slice(0,8);o.length>0?this.showAutocomplete(o):this.hideAutocomplete()}else this.hideAutocomplete()}showAutocomplete(e){this.autocomplete.innerHTML="",e.forEach((s,n)=>{const i=document.createElement("div");i.dataset.name=s.data.name,i.className="rte-autocomplete-item"+(n===0?" selected":""),i.innerText=s.data.name||"Untitled",i.onmousedown=a=>{a.preventDefault(),this.selectAutocompleteItem(s.data.name)},this.autocomplete.appendChild(i)}),this.autocomplete.style.display="block",this.autocomplete.style.left="16px",this.autocomplete.style.bottom="16px"}hideAutocomplete(){this.autocomplete.style.display="none"}navigateAutocomplete(e){var a,r;const s=Array.from(this.autocomplete.children),n=s.findIndex(o=>o.classList.contains("selected"));(a=s[n])==null||a.classList.remove("selected");const i=Math.max(0,Math.min(s.length-1,n+e));(r=s[i])==null||r.classList.add("selected")}selectAutocompleteItem(e){const s=window.getSelection();if(!s.rangeCount)return;const n=s.getRangeAt(0),i=n.startContainer;if(i.nodeType!==Node.TEXT_NODE)return;const a=i.textContent,r=a.substring(0,n.startOffset);if(r.match(/\[\[([^\]]*?)$/)){const l=r.lastIndexOf("[["),p=a.substring(n.startOffset),d=p.indexOf("]]"),v=d>=0?p.substring(d+2):p,y=document.createElement("span");y.className="wiki-link",y.dataset.link=e,y.innerText=`[[${e}]]`;const S=document.createTextNode(a.substring(0,l)),m=document.createTextNode(" "+v),c=i.parentNode;c.insertBefore(S,i),c.insertBefore(y,i),c.insertBefore(m,i),c.removeChild(i);const u=document.createRange();u.setStartAfter(y),u.collapse(!0),s.removeAllRanges(),s.addRange(u)}this.hideAutocomplete(),this.value=this.extractRawText(this.editor.innerHTML),this.onChange&&this.onChange(this.value)}getValue(){return this.extractRawText(this.editor.innerHTML)}setValue(e){this.value=e,this.editor&&(this.editor.innerHTML=this.renderWithLinks(e))}}class Le{constructor(e,s={}){this.container=e,this.item=null,this.onSave=s.onSave||null,this.onNameChange=s.onNameChange||null,this.onLinkClick=s.onLinkClick||null,this.getEntries=s.getEntries||(()=>[]),this.editorInstance=null}setItem(e){this.item=e,e?this.render():this.showEmpty()}showEmpty(){this.container.innerHTML=`
            <div class="empty-state">
                <h2>Select an entry</h2>
                <p>Or create a new one to start building your world.</p>
            </div>
        `}render(){if(!this.item)return this.showEmpty();const e=U(this.item.type);this.container.innerHTML=`
            <div class="library-editor active">
                <div class="entry-header">
                    <span id="entry-icon" class="entry-icon">${e.icon}</span>
                    <input id="asset-title" type="text" placeholder="Entry Name" 
                        value="${this.item.data.name||""}" class="input-title entry-title">
                    <span id="entry-category-badge" class="badge" 
                        style="background:${e.color}; color:#fff;">${e.label}</span>
                </div>
                
                <div id="metadata-fields" class="metadata-grid"></div>
                
                <div class="description-label">Description</div>
                <div id="asset-rte-mount" class="description-editor"></div>
                
                <div id="save-status" class="save-status">Saved</div>
            </div>
        `;const s=this.container.querySelector("#asset-title"),n=this.container.querySelector("#metadata-fields"),i=this.container.querySelector("#asset-rte-mount");this.container.querySelector("#save-status"),e.fields.forEach(o=>{const l=document.createElement("div");l.className="metadata-field";const p=document.createElement("label");p.innerText=o.label,p.className="label";let d;o.type==="textarea"?(d=document.createElement("textarea"),d.rows=2,d.className="textarea"):(d=document.createElement("input"),d.type="text",d.className="input"),d.value=this.item.data[o.key]||"",d.oninput=()=>{this.item.data[o.key]=d.value,this.save()},l.appendChild(p),l.appendChild(d),n.appendChild(l)});const a=new $e(i,this.item.data.description||"",{getEntries:this.getEntries,onLinkClick:this.onLinkClick});a.render(),this.editorInstance=a,a.onChange=o=>{this.item.data.description=o,this.save()};let r=null;s.oninput=()=>{this.item.data.name=s.value,this.save(),clearTimeout(r),r=setTimeout(()=>{this.onNameChange&&this.onNameChange(this.item)},300)}}async save(){const e=this.container.querySelector("#save-status");e&&(e.innerText="Saving..."),this.onSave&&await this.onSave(this.item),e&&(e.innerText="Saved")}}const z={member_of:{id:"member_of",label:"Member of",icon:"👥",inverse:"has_member",description:"This entry is a member of the target."},has_member:{id:"has_member",label:"Has Member",icon:"👤",inverse:"member_of",description:"The target is a member of this entry."},located_in:{id:"located_in",label:"Located in",icon:"📍",inverse:"contains",description:"This entry is located within the target."},contains:{id:"contains",label:"Contains",icon:"🗺️",inverse:"located_in",description:"This entry contains the target."},ally_of:{id:"ally_of",label:"Ally of",icon:"🤝",inverse:"ally_of",description:"This entry is allied with the target."},enemy_of:{id:"enemy_of",label:"Enemy of",icon:"⚔️",inverse:"enemy_of",description:"This entry is an enemy of the target."},parent_of:{id:"parent_of",label:"Parent of",icon:"👨‍👧",inverse:"child_of",description:"This entry is the parent of the target."},child_of:{id:"child_of",label:"Child of",icon:"👶",inverse:"parent_of",description:"This entry is the child of the target."},related_to:{id:"related_to",label:"Related to",icon:"🔗",inverse:"related_to",description:"Generic relationship."},created_by:{id:"created_by",label:"Created by",icon:"🛠️",inverse:"creator_of",description:"This entry was created by the target."},creator_of:{id:"creator_of",label:"Creator of",icon:"✨",inverse:"created_by",description:"This entry created the target."}},Q=t=>z[t]||z.related_to,Ie=()=>Object.values(z);class Me{constructor(e,s={}){this.container=e,this.item=null,this.allItems=[],this.onSave=s.onSave||null,this.onNavigate=s.onNavigate||null}setItem(e,s){this.item=e,this.allItems=s,e&&this.render()}render(){this.item&&(this.item.data.relationships||(this.item.data.relationships=[]),this.container.innerHTML=`
            <div class="relationships-header">
                <div class="label">Relationships</div>
                <button id="add-relationship-btn" class="btn btn-primary" style="padding:4px 10px; font-size:11px;">+ Add</button>
            </div>
            <div id="relationships-list" class="relationships-list"></div>
            <div id="back-references" class="back-references"></div>
        `,this.renderRelationships(),this.container.querySelector("#add-relationship-btn").onclick=()=>this.showAddModal())}renderRelationships(){const e=this.container.querySelector("#relationships-list"),s=this.container.querySelector("#back-references");e.innerHTML="",this.item.data.relationships.length===0?e.innerHTML='<div class="text-muted text-sm">No relationships defined.</div>':(this.item.data.relationships.forEach((i,a)=>{const r=Q(i.type),o=this.allItems.find(v=>v.id===i.targetId),l=o?o.data.name||"Untitled":"(Deleted)",p=o?U(o.type):{icon:"❓"},d=document.createElement("div");d.className="relationship-row",d.innerHTML=`
                    <span>${r.icon}</span>
                    <span class="relationship-type">${r.label}</span>
                    <span class="relationship-target" data-id="${i.targetId}">${p.icon} ${l}</span>
                    <button class="relationship-delete" data-idx="${a}">×</button>
                `,e.appendChild(d)}),e.querySelectorAll(".relationship-target").forEach(i=>{i.onclick=()=>{const a=this.allItems.find(r=>r.id===i.dataset.id);a&&this.onNavigate&&this.onNavigate(a)}}),e.querySelectorAll(".relationship-delete").forEach(i=>{i.onclick=()=>{this.item.data.relationships.splice(parseInt(i.dataset.idx),1),this.onSave&&this.onSave(this.item),this.renderRelationships()}}));const n=this.allItems.filter(i=>{var a;return i.id!==this.item.id&&((a=i.data.relationships)==null?void 0:a.some(r=>r.targetId===this.item.id))});s.innerHTML="",n.length===0?s.innerHTML='<div class="text-muted text-xs">No incoming references.</div>':(s.innerHTML='<div class="back-ref-label">Referenced by:</div>',n.forEach(i=>{const a=U(i.type);i.data.relationships.filter(o=>o.targetId===this.item.id).forEach(o=>{const l=Q(o.type),p=z[l.inverse],d=document.createElement("div");d.className="back-ref-item",d.innerHTML=`<span>${a.icon}</span> ${i.data.name||"Untitled"} <span class="text-muted">(${(p==null?void 0:p.label)||l.label})</span>`,d.onclick=()=>{this.onNavigate&&this.onNavigate(i)},s.appendChild(d)})}))}showAddModal(){const e=document.createElement("div");e.className="flex flex-col gap-md",e.innerHTML=`
            <div>
                <label class="label">Type</label>
                <select id="rel-type-select" class="input" style="width:100%; margin-top:4px;"></select>
            </div>
            <div>
                <label class="label">Target Entry</label>
                <select id="rel-target-select" class="input" style="width:100%; margin-top:4px;"></select>
            </div>
        `,new Y({title:"Add Relationship",content:e,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:a=>a.close()},{label:"Add",className:"btn btn-primary",onClick:a=>{const r=e.querySelector("#rel-type-select"),o=e.querySelector("#rel-target-select"),l=r.value,p=o.value;l&&p&&(this.item.data.relationships.push({type:l,targetId:p}),this.onSave&&this.onSave(this.item),this.renderRelationships()),a.close()}}]}).show();const n=e.querySelector("#rel-type-select"),i=e.querySelector("#rel-target-select");Ie().forEach(a=>{const r=document.createElement("option");r.value=a.id,r.innerText=`${a.icon} ${a.label}`,n.appendChild(r)}),this.allItems.filter(a=>a.id!==this.item.id).forEach(a=>{const r=U(a.type),o=document.createElement("option");o.value=a.id,o.innerText=`${r.icon} ${a.data.name||"Untitled"}`,i.appendChild(o)})}}const w={id:"library",label:"Library",icon:"📚",entryList:null,entryEditor:null,relationshipManager:null,allItems:[],activeItem:null,render:async(t,e)=>{try{await T.init()}catch(a){t.innerHTML=`<div class="text-muted">Vault Error: ${a.message}</div>`;return}t.innerHTML=`
            <div class="library-layout">
                <div id="lib-sidebar" class="library-sidebar"></div>
                <div id="lib-main" class="library-main">
                    <div id="lib-editor-area"></div>
                    <div id="lib-relationships-area" class="relationships-section" style="display:none;"></div>
                </div>
            </div>
        `;const s=t.querySelector("#lib-sidebar"),n=t.querySelector("#lib-editor-area"),i=t.querySelector("#lib-relationships-area");if(w.allItems=await T.list(),w.entryList=new Ce(s,{onSelect:a=>w.selectItem(a,n,i),onCreate:()=>w.showCreateModal()}),w.entryList.setItems(w.allItems),w.entryEditor=new Le(n,{onSave:async a=>{await T.updateItem(a)},onNameChange:a=>{w.entryList.setItems(w.allItems)},onLinkClick:a=>{const r=w.allItems.find(o=>(o.data.name||"").toLowerCase()===a.toLowerCase());r&&w.selectItem(r,n,i)},getEntries:()=>w.allItems}),w.entryEditor.showEmpty(),w.relationshipManager=new Me(i,{onSave:async a=>{await T.updateItem(a)},onNavigate:a=>{w.selectItem(a,n,i)}}),x.session.activeEntryId){const a=w.allItems.find(r=>r.id===x.session.activeEntryId);a&&w.selectItem(a,n,i)}},selectItem(t,e,s){w.activeItem=t,w.entryList.setActiveItem(t.id),w.entryEditor.setItem(t),s.style.display="block",w.relationshipManager.setItem(t,w.allItems),x.updateSession({activeEntryId:t.id})},showCreateModal(){const t=document.createElement("div");t.className="grid-3",V().forEach(s=>{const n=document.createElement("button");n.className="btn btn-secondary",n.style.cssText="flex-direction:column; padding:12px;",n.innerHTML=`<span style="font-size:20px;">${s.icon}</span><span class="text-xs">${s.label}</span>`,n.onclick=async()=>{e.close();const i=await T.addItem(s.id,{name:`New ${s.label}`,description:""});w.allItems.push(i),w.entryList.setItems(w.allItems);const a=document.querySelector("#lib-editor-area"),r=document.querySelector("#lib-relationships-area");w.selectItem(i,a,r)},t.appendChild(n)});const e=new Y({title:"Create New Entry",content:t,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:s=>s.close()}]});e.show()}};class qe{constructor(e,s,n){this.container=e,this.nodeLayer=s,this.svgLayer=n,this.nodes=[],this.links=[],this.transform={x:0,y:0,scale:1},this.isDragging=!1,this.lastMouse={x:0,y:0},this.onDataChange=null}init(){this.container.onmousedown=e=>{(e.button===1||e.button===0&&e.altKey)&&(this.isDragging=!0,this.lastMouse={x:e.clientX,y:e.clientY},this.container.style.cursor="grabbing",e.preventDefault())},window.onmousemove=e=>{if(this.isDragging){const s=e.clientX-this.lastMouse.x,n=e.clientY-this.lastMouse.y;this.transform.x+=s,this.transform.y+=n,this.lastMouse={x:e.clientX,y:e.clientY},this.updateTransform()}},window.onmouseup=e=>{this.isDragging=!1,this.container.style.cursor="default"},this.container.onwheel=e=>{e.preventDefault();const s=e.deltaY>0?.9:1.1;this.transform.scale*=s,this.transform.scale=Math.min(Math.max(.2,this.transform.scale),2),this.updateTransform()}}exportData(){return{nodes:this.nodes,links:this.links,transform:this.transform}}importData(e){e&&(this.nodes=[],this.nodeLayer.innerHTML="",e.transform&&(this.transform=e.transform,this.updateTransform()),e.nodes&&e.nodes.forEach(s=>this.addNode(s,!0)),this.links=e.links||[],this.updateLinks())}notifyChange(){this.onDataChange&&this.onDataChange(this.exportData())}updateTransform(){this.nodeLayer.style.transform=`translate(${this.transform.x}px, ${this.transform.y}px) scale(${this.transform.scale})`,this.updateLinks()}resetView(){this.transform={x:0,y:0,scale:1},this.updateTransform()}addNode(e,s=!1){this.nodes.push(e);const n=this.renderNodeElement(e);this.nodeLayer.appendChild(n),s||this.notifyChange()}renderNodeElement(e){const s=document.createElement("div");s.className="node"+(e.type?` ${e.type}`:""),s.id=e.id,s.style.left=e.x+"px",s.style.top=e.y+"px";let n=(e.inputs||[]).map(v=>`
            <div class="socket-row">
                <div class="socket input" title="${v}"></div>
                <span>${v}</span>
            </div>
        `).join(""),i=(e.outputs||[]).map(v=>`
            <div class="socket-row" style="justify-content: flex-end;">
                <span>${v}</span>
                <div class="socket output" title="${v}"></div>
            </div>
        `).join("");s.innerHTML=`
            <div class="node-header">${e.title}</div>
            <div class="node-body">
                ${n}
                <!-- Body content could go here -->
                ${i}
            </div>
        `;const a=s.querySelector(".node-header");let r=!1,o={x:0,y:0},l={x:e.x,y:e.y};a.onmousedown=v=>{v.button===0&&(r=!0,o={x:v.clientX,y:v.clientY},l={x:e.x,y:e.y},s.classList.add("selected"),v.stopPropagation())};const p=v=>{if(r){const y=(v.clientX-o.x)/this.transform.scale,S=(v.clientY-o.y)/this.transform.scale;e.x=l.x+y,e.y=l.y+S,s.style.left=e.x+"px",s.style.top=e.y+"px",this.updateLinks()}},d=()=>{r&&(r=!1,s.classList.remove("selected"),this.notifyChange())};return window.addEventListener("mousemove",p),window.addEventListener("mouseup",d),s}updateLinks(){if(this.svgLayer.innerHTML="",this.nodes.length>=2){const e=this.nodes[0],s=this.nodes[1],n=(e.x+200)*this.transform.scale+this.transform.x,i=(e.y+40)*this.transform.scale+this.transform.y,a=s.x*this.transform.scale+this.transform.x,r=(s.y+40)*this.transform.scale+this.transform.y,o=document.createElementNS("http://www.w3.org/2000/svg","path"),l=n+50*this.transform.scale,p=a-50*this.transform.scale,d=`M ${n} ${i} C ${l} ${i}, ${p} ${r}, ${a} ${r}`;o.setAttribute("d",d),o.setAttribute("class","connection-line"),this.svgLayer.appendChild(o)}}}const ve={event:{id:"event",label:"Event",icon:"⚡",color:"#4ade80",description:'Triggers like "On Combat Start", "On Turn Begin"',templates:[{title:"On Start",outputs:["next"]},{title:"On Turn Begin",outputs:["next"]},{title:"On Attack",inputs:["attacker","target"],outputs:["next"]},{title:"On Damage",inputs:["target","amount"],outputs:["next"]}]},condition:{id:"condition",label:"Condition",icon:"❓",color:"#facc15",description:"If/else branching logic",templates:[{title:"If Greater Than",inputs:["a","b"],outputs:["true","false"]},{title:"If Equal",inputs:["a","b"],outputs:["true","false"]},{title:"If Has Tag",inputs:["target","tag"],outputs:["true","false"]},{title:"Compare Roll",inputs:["roll","dc"],outputs:["success","failure"]}]},action:{id:"action",label:"Action",icon:"🎲",color:"#60a5fa",description:"Roll dice, modify values, apply effects",templates:[{title:"Roll Dice",inputs:["expression"],outputs:["result","next"]},{title:"Add Value",inputs:["a","b"],outputs:["result"]},{title:"Apply Damage",inputs:["target","amount"],outputs:["next"]},{title:"Set Variable",inputs:["name","value"],outputs:["next"]}]},reference:{id:"reference",label:"Reference",icon:"📚",color:"#c084fc",description:"Link to Library entries (items, abilities, characters)",templates:[]}};class Ae{constructor(e={}){this.onSelect=e.onSelect||null}async show(){const e=document.createElement("div");e.className="node-picker";const s=document.createElement("div");s.className="library-tabs",s.style.marginBottom="16px";const n=document.createElement("div");n.className="node-picker-panels";const i=async r=>{s.querySelectorAll(".tab").forEach(l=>{l.classList.toggle("active",l.dataset.type===r)}),n.innerHTML="";const o=ve[r];if(r==="reference"){await T.init();const l=await T.list();if(l.length===0){n.innerHTML='<div class="text-muted">No Library entries. Create entries in the Library first.</div>';return}const p=document.createElement("div");p.className="grid-2",p.style.gap="8px",l.forEach(d=>{const v=U(d.type),y=document.createElement("button");y.className="btn btn-secondary",y.style.cssText="justify-content:flex-start; padding:8px 12px; text-align:left;",y.innerHTML=`<span style="margin-right:8px;">${v.icon}</span> ${d.data.name||"Untitled"}`,y.onclick=()=>{this.onSelect&&this.onSelect({type:"reference",title:`📚 ${d.data.name||"Untitled"}`,entryId:d.id,entryType:d.type,inputs:["in"],outputs:["out","data"]}),a.close()},p.appendChild(y)}),n.appendChild(p)}else{const l=document.createElement("div");l.className="grid-2",l.style.gap="8px",o.templates.forEach(p=>{const d=document.createElement("button");d.className="btn btn-secondary",d.style.cssText="justify-content:flex-start; padding:8px 12px;",d.innerHTML=`<span style="margin-right:8px;">${o.icon}</span> ${p.title}`,d.onclick=()=>{this.onSelect&&this.onSelect({type:r,title:p.title,inputs:p.inputs||[],outputs:p.outputs||[]}),a.close()},l.appendChild(d)}),n.appendChild(l)}};Object.values(ve).forEach(r=>{const o=document.createElement("button");o.className="tab",o.dataset.type=r.id,o.innerHTML=`${r.icon} ${r.label}`,o.onclick=()=>i(r.id),s.appendChild(o)}),e.appendChild(s),e.appendChild(n);const a=new Y({title:"Add Node",content:e,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:r=>r.close()}]});a.show(),await i("event")}}const be={id:"architect",label:"Architect",icon:"📐",render:(t,e)=>{t.style.padding="0",t.innerHTML=`
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
        `;const s=t.querySelector("#arch-workspace"),n=t.querySelector("#arch-nodes"),i=t.querySelector("#arch-svg"),a=new qe(s,n,i);a.init();const r=new Ae({onSelect:d=>{a.addNode({id:G.generateId("node"),x:100+Math.random()*100,y:100+Math.random()*100,type:d.type,title:d.title,inputs:d.inputs||[],outputs:d.outputs||[],entryId:d.entryId||null,entryType:d.entryType||null})}});t.querySelector("#btn-add-node").onclick=()=>{r.show()},t.querySelector("#btn-reset-view").onclick=()=>{a.resetView()},t.querySelector("#btn-clear-all").onclick=()=>{confirm("Clear all nodes?")&&(a.nodes=[],a.links=[],n.innerHTML="",i.innerHTML="",a.notifyChange())};const o="samildanach_architect_layout";a.onDataChange=d=>{localStorage.setItem(o,JSON.stringify(d))};const l=localStorage.getItem(o);if(l)try{const d=JSON.parse(l);a.importData(d)}catch(d){console.error("Failed to load architect layout:",d),p()}else p();function p(){a.nodes.length===0&&(a.addNode({id:"start",x:50,y:50,type:"event",title:"On Attack",inputs:["attacker","target"],outputs:["next"]}),a.addNode({id:"d20",x:300,y:100,type:"action",title:"Roll Dice",inputs:["expression"],outputs:["result","next"]}),a.addNode({id:"check",x:550,y:50,type:"condition",title:"Compare Roll",inputs:["roll","dc"],outputs:["success","failure"]}))}}},fe={id:"graph",label:"Graph",icon:"🕸️",render:async(t,e)=>{try{await T.init()}catch(h){t.innerHTML=`<div class="text-muted">Vault Error: ${h.message}</div>`;return}t.style.padding="0",t.innerHTML=`
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
        `;const s=t.querySelector("#graph-container"),n=t.querySelector("#graph-canvas"),i=n.getContext("2d"),a=()=>{n.width=s.clientWidth,n.height=s.clientHeight};a(),window.addEventListener("resize",a);const r=await T.list(),o=r.map((h,g)=>{const b=U(h.type),k=g/r.length*Math.PI*2,E=Math.min(n.width,n.height)*.3;return{id:h.id,item:h,label:h.data.name||"Untitled",icon:b.icon,color:b.color,x:n.width/2+Math.cos(k)*E,y:n.height/2+Math.sin(k)*E,vx:0,vy:0}}),l=Object.fromEntries(o.map(h=>[h.id,h])),p=[];r.forEach(h=>{(h.data.relationships||[]).forEach(g=>{if(l[g.targetId]){const b=Q(g.type);p.push({from:h.id,to:g.targetId,label:b.label,color:b.icon})}})});let d={x:0,y:0,scale:1},v=!1,y={x:0,y:0},S=null;const m=()=>{i.clearRect(0,0,n.width,n.height),i.save(),i.translate(d.x,d.y),i.scale(d.scale,d.scale),i.lineWidth=2,p.forEach(h=>{const g=l[h.from],b=l[h.to];g&&b&&(i.strokeStyle="rgba(100, 116, 139, 0.5)",i.beginPath(),i.moveTo(g.x,g.y),i.lineTo(b.x,b.y),i.stroke())}),o.forEach(h=>{i.fillStyle=h.color||"#6366f1",i.beginPath(),i.arc(h.x,h.y,24,0,Math.PI*2),i.fill(),i.font="16px sans-serif",i.textAlign="center",i.textBaseline="middle",i.fillStyle="#fff",i.fillText(h.icon,h.x,h.y),i.font="11px sans-serif",i.fillStyle="var(--text-primary)",i.fillText(h.label,h.x,h.y+36)}),i.restore()},c=()=>{const h=n.width/2,g=n.height/2;o.forEach(b=>{o.forEach(k=>{if(b.id===k.id)return;const E=b.x-k.x,q=b.y-k.y,I=Math.sqrt(E*E+q*q)||1,A=5e3/(I*I);b.vx+=E/I*A,b.vy+=q/I*A}),b.vx+=(h-b.x)*.001,b.vy+=(g-b.y)*.001}),p.forEach(b=>{const k=l[b.from],E=l[b.to];if(k&&E){const q=E.x-k.x,I=E.y-k.y,A=Math.sqrt(q*q+I*I)||1,_=(A-150)*.01;k.vx+=q/A*_,k.vy+=I/A*_,E.vx-=q/A*_,E.vy-=I/A*_}}),o.forEach(b=>{S!==b&&(b.x+=b.vx*.1,b.y+=b.vy*.1),b.vx*=.9,b.vy*=.9}),m(),requestAnimationFrame(c)};c();const u=h=>({x:(h.offsetX-d.x)/d.scale,y:(h.offsetY-d.y)/d.scale}),f=(h,g)=>o.find(b=>{const k=b.x-h,E=b.y-g;return Math.sqrt(k*k+E*E)<24});n.onmousedown=h=>{const g=u(h),b=f(g.x,g.y);b?S=b:(v=!0,y={x:h.clientX,y:h.clientY})},n.onmousemove=h=>{if(S){const g=u(h);S.x=g.x,S.y=g.y}else v&&(d.x+=h.clientX-y.x,d.y+=h.clientY-y.y,y={x:h.clientX,y:h.clientY})},n.onmouseup=()=>{S=null,v=!1},n.onwheel=h=>{h.preventDefault();const g=h.deltaY>0?.9:1.1;d.scale*=g,d.scale=Math.min(Math.max(.3,d.scale),3)},t.querySelector("#graph-reset").onclick=()=>{d={x:0,y:0,scale:1}},t.querySelector("#graph-relayout").onclick=()=>{o.forEach((h,g)=>{const b=g/o.length*Math.PI*2,k=Math.min(n.width,n.height)*.3;h.x=n.width/2+Math.cos(b)*k,h.y=n.height/2+Math.sin(b)*k,h.vx=0,h.vy=0})}}},P={async toJSON(){await T.init();const t=await T.list();return{meta:{...x.project},entries:t,exportedAt:new Date().toISOString(),version:"1.0",format:"samildanach-json"}},async toMarkdown(t={}){var a;const{includeRelationships:e=!0}=t;await T.init();const s=await T.list();let n="";n+=`# ${x.project.title||"Untitled Setting"}

`,x.project.author&&(n+=`**Author:** ${x.project.author}

`),x.project.version&&(n+=`**Version:** ${x.project.version}

`),x.project.genre&&(n+=`**Genre:** ${x.project.genre}

`),x.project.system&&(n+=`**System:** ${x.project.system}

`),x.project.description&&(n+=`---

${x.project.description}

`),n+=`---

`;const i=V();for(const r of i){const o=s.filter(l=>l.type===r.id);if(o.length!==0){n+=`## ${r.icon} ${r.label}s

`;for(const l of o){n+=`### ${l.data.name||"Untitled"}

`;for(const p of r.fields){const d=l.data[p.key];d&&(n+=`**${p.label}:** ${d}

`)}if(l.data.description){const p=this._stripHtml(l.data.description);n+=`${p}

`}if(e&&((a=l.data.relationships)==null?void 0:a.length)>0){n+=`**Relationships:**
`;for(const p of l.data.relationships){const d=Q(p.type),v=s.find(S=>S.id===p.targetId),y=(v==null?void 0:v.data.name)||"(Unknown)";n+=`- ${d.icon} ${d.label}: ${y}
`}n+=`
`}n+=`---

`}}}return n+=`
---
*Exported from Samildánach on ${new Date().toLocaleDateString()}*
`,n},async toHTML(){let e=(await this.toMarkdown()).replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^# (.+)$/gm,"<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/^- (.+)$/gm,"<li>$1</li>").replace(/(<li>.*<\/li>\n)+/g,"<ul>$&</ul>").replace(/^---$/gm,"<hr>").replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br>");return`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${x.project.title||"Samildánach Export"}</title>
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
    <p>${e}</p>
</body>
</html>`},async printToPDF(){const t=await this.toHTML(),e=window.open("","_blank");e.document.write(t),e.document.close(),e.focus(),setTimeout(()=>e.print(),250)},download(t,e,s="text/plain"){const n=new Blob([t],{type:s}),i=URL.createObjectURL(n),a=document.createElement("a");a.href=i,a.download=e,a.click(),URL.revokeObjectURL(i)},_stripHtml(t){const e=document.createElement("div");return e.innerHTML=t,e.querySelectorAll(".wiki-link").forEach(s=>{s.replaceWith(s.dataset.link||s.textContent)}),e.textContent||e.innerText||""}},ye={id:"export",label:"Export",icon:"📤",render:(t,e)=>{t.innerHTML=`
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
        `;let s="json";const n=t.querySelector("#export-preview"),i=t.querySelector("#btn-export"),a=t.querySelectorAll(".format-btn");a.forEach(l=>{l.onclick=async()=>{a.forEach(p=>p.classList.remove("active")),l.classList.add("active"),s=l.dataset.format,await r()}});async function r(){n.innerHTML='<div class="preview-loading">Generating preview...</div>';try{let l="";switch(s){case"json":const p=await P.toJSON();l=`<pre class="preview-code">${JSON.stringify(p,null,2).substring(0,2e3)}${JSON.stringify(p,null,2).length>2e3?`
...`:""}</pre>`;break;case"markdown":const d=await P.toMarkdown();l=`<pre class="preview-code">${o(d.substring(0,2e3))}${d.length>2e3?`
...`:""}</pre>`;break;case"html":l=`<div class="preview-note">Full HTML document will be downloaded.</div><pre class="preview-code">${o((await P.toHTML()).substring(0,1500))}...</pre>`;break;case"pdf":l=`<div class="preview-note">PDF will open in a print dialog.<br>Use "Save as PDF" in your browser's print options.</div>`;break}n.innerHTML=l}catch(l){n.innerHTML=`<div class="preview-error">Error: ${l.message}</div>`}}i.onclick=async()=>{i.disabled=!0,i.innerText="Exporting...";try{const l=(x.project.title||"samildanach").toLowerCase().replace(/\s+/g,"-");switch(s){case"json":const p=await P.toJSON();P.download(JSON.stringify(p,null,2),`${l}.json`,"application/json");break;case"markdown":const d=await P.toMarkdown();P.download(d,`${l}.md`,"text/markdown");break;case"html":const v=await P.toHTML();P.download(v,`${l}.html`,"text/html");break;case"pdf":await P.printToPDF();break}}catch(l){alert("Export failed: "+l.message)}i.disabled=!1,i.innerText="Download"},r();function o(l){const p=document.createElement("div");return p.textContent=l,p.innerHTML}}},ie="samildanach_llm_configs",K="samildanach_active_config_id",j={getConfigs(){return JSON.parse(localStorage.getItem(ie)||"[]")},saveConfig(t){const e=this.getConfigs(),s=e.findIndex(n=>n.id===t.id);s>=0?e[s]=t:e.push(t),localStorage.setItem(ie,JSON.stringify(e))},deleteConfig(t){const e=this.getConfigs().filter(s=>s.id!==t);localStorage.setItem(ie,JSON.stringify(e)),localStorage.getItem(K)===t&&localStorage.removeItem(K)},getActiveConfig(){const t=this.getConfigs(),e=localStorage.getItem(K);return t.find(s=>s.id===e)||t[0]||null},setActiveConfig(t){localStorage.setItem(K,t)},async generate(t,e,s={}){var p,d,v,y,S,m,c,u,f,h,g,b,k,E,q,I,A,_;const i={...this.getActiveConfig()||{},...s},a=i.provider||"gemini",r=i.model||"gemini-1.5-flash",o=i.apiKey||"",l=i.maxTokens||4096;if(!o&&a!=="kobold")throw new Error(`Missing API Key for ${a}. Please configure in Settings.`);if(a==="gemini"){const O=`https://generativelanguage.googleapis.com/v1beta/models/${r}:generateContent?key=${o}`,L={contents:e.map(M=>({role:M.role==="user"?"user":"model",parts:[{text:M.content}]})),generationConfig:{temperature:.9,maxOutputTokens:l}};t&&(L.systemInstruction={parts:[{text:t}]});const C=await fetch(O,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(L)});if(!C.ok){const M=await C.json();throw new Error(((p=M.error)==null?void 0:p.message)||C.statusText)}return((m=(S=(y=(v=(d=(await C.json()).candidates)==null?void 0:d[0])==null?void 0:v.content)==null?void 0:y.parts)==null?void 0:S[0])==null?void 0:m.text)||"(No response)"}if(["openai","openrouter","chutes","custom"].includes(a)){let O="https://api.openai.com/v1/chat/completions";a==="openrouter"&&(O="https://openrouter.ai/api/v1/chat/completions"),a==="chutes"&&(O="https://llm.chutes.ai/v1/chat/completions"),a==="custom"&&(O=`${(i.baseUrl||"https://api.example.com/v1").replace(/\/$/,"")}/chat/completions`);const B=[{role:"system",content:t},...e.map(H=>({role:H.role==="model"?"assistant":H.role,content:H.content}))],L={"Content-Type":"application/json",Authorization:`Bearer ${o}`};a==="openrouter"&&(L["HTTP-Referer"]="https://samildanach.app",L["X-Title"]="Samildánach");let C=l,D=0;const M=1;for(;D<=M;){const H=await fetch(O,{method:"POST",headers:L,body:JSON.stringify({model:r,messages:B,temperature:.9,max_tokens:C})});if(!H.ok){const pe=((c=(await H.json()).error)==null?void 0:c.message)||H.statusText,ee=pe.match(/maximum context length is (\d+) tokens.*requested about (\d+) tokens.*\((\d+) in the messages/);if(ee&&D<M){const we=parseInt(ee[1]),ke=parseInt(ee[3]),te=we-ke-200;if(te>0){console.warn(`[LLM] Context limit exceeded. Auto-scaling max_tokens from ${C} to ${te}.`),C=te,D++;continue}}throw new Error(pe)}const ce=await H.json();let Z=((h=(f=(u=ce.choices)==null?void 0:u[0])==null?void 0:f.message)==null?void 0:h.content)||"";const de=(k=(b=(g=ce.choices)==null?void 0:g[0])==null?void 0:b.message)==null?void 0:k.reasoning_content;return de&&(Z=`<think>${de}</think>
${Z}`),Z||"(No response)"}}if(a==="anthropic"){const O="https://api.anthropic.com/v1/messages",B=e.map(D=>({role:D.role==="model"?"assistant":"user",content:D.content})),L=await fetch(O,{method:"POST",headers:{"x-api-key":o,"anthropic-version":"2023-06-01","content-type":"application/json","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:r,max_tokens:l,system:t,messages:B,temperature:.9})});if(!L.ok){const D=await L.json();throw new Error(((E=D.error)==null?void 0:E.message)||L.statusText)}return((I=(q=(await L.json()).content)==null?void 0:q[0])==null?void 0:I.text)||"(No response)"}if(a==="kobold"){const B=`${(i.baseUrl||"http://localhost:5001").replace(/\/$/,"")}/api/v1/generate`,L=`${t}

${e.map(M=>`${M.role==="user"?"User":"Assistant"}: ${M.content}`).join(`
`)}`,C=await fetch(B,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:L,max_context_length:4096,max_length:l>2048?2048:l,temperature:.9})});if(!C.ok){const M=await C.text();throw new Error(`Kobold Error: ${M||C.statusText}`)}return((_=(A=(await C.json()).results)==null?void 0:A[0])==null?void 0:_.text)||"(No response)"}throw new Error(`Unknown provider: ${a}`)},async testConfig(t){try{return await this.generate("You are a test assistant.",[{role:"user",content:'Say "Hello" in one word.'}],t),!0}catch(e){throw e}}},ae=[{id:"gemini",label:"Google Gemini",models:["gemini-1.5-flash","gemini-1.5-pro","gemini-2.0-flash"]},{id:"openai",label:"OpenAI",models:["gpt-4o","gpt-4o-mini","gpt-4-turbo","gpt-3.5-turbo"]},{id:"openrouter",label:"OpenRouter",models:["anthropic/claude-3.5-sonnet","google/gemini-pro-1.5","meta-llama/llama-3.1-405b-instruct"]},{id:"anthropic",label:"Anthropic",models:["claude-3-5-sonnet-20241022","claude-3-opus-20240229","claude-3-haiku-20240307"]},{id:"chutes",label:"Chutes AI",models:["deepseek-ai/DeepSeek-V3","deepseek-ai/DeepSeek-R1"]},{id:"kobold",label:"Kobold AI (Local)",models:["local"],baseUrl:"http://localhost:5001"},{id:"custom",label:"Custom Endpoint",models:["custom"]}],ge="samildanach_scribe_state",xe=[{id:"brainstorm",label:"💡 Brainstorm",desc:"Generate ideas and explore concepts"},{id:"expand",label:"📝 Expand",desc:"Develop and detail existing entries"},{id:"critique",label:"🔍 Critique",desc:"Get feedback and suggestions"}],Se={brainstorm:[{label:"Character concept",prompt:"Help me brainstorm a character who..."},{label:"Location idea",prompt:"I need a unique location for..."},{label:"Faction conflict",prompt:"Create tension between factions by..."},{label:"Plot hook",prompt:"Generate a compelling plot hook involving..."}],expand:[{label:"Add history",prompt:"Expand the backstory and history of..."},{label:"Describe appearance",prompt:"Describe in vivid detail how this looks:"},{label:"Add relationships",prompt:"How might this connect to other elements in my world?"},{label:"Cultural details",prompt:"What customs, traditions, or beliefs would exist here?"}],critique:[{label:"Check consistency",prompt:"Review this for internal consistency:"},{label:"Strengthen concept",prompt:"How can I make this more unique or compelling?"},{label:"Find gaps",prompt:"What questions or gaps exist in this concept?"},{label:"Balance check",prompt:"Is this balanced for gameplay? What adjustments?"}]},le={id:"scribe",label:"Scribe",icon:"✍️",render:async t=>{let e=JSON.parse(localStorage.getItem(ge)||"{}");e.mode||(e.mode="brainstorm"),e.history||(e.history=[]),e.selectedEntries||(e.selectedEntries=[]),e.sessions||(e.sessions={});const s=()=>localStorage.setItem(ge,JSON.stringify(e));await T.init();const n=await T.list(),i=V();t.innerHTML=`
            <div class="scribe-layout">
                <!-- Left: Context Panel -->
                <div class="scribe-sidebar">
                    <div class="sidebar-header">
                        <strong>✍️ The Scribe</strong>
                    </div>

                    <!-- Mode Selection -->
                    <div class="sidebar-section">
                        <div class="section-label">Mode</div>
                        <div class="mode-buttons">
                            ${xe.map(m=>`
                                <button class="mode-btn ${e.mode===m.id?"active":""}" data-mode="${m.id}" title="${m.desc}">
                                    ${m.label}
                                </button>
                            `).join("")}
                        </div>
                    </div>

                    <!-- Library Context -->
                    <div class="sidebar-section flex-1">
                        <div class="section-label">Library Context</div>
                        <div class="entry-list">
                            ${i.map(m=>{const c=n.filter(u=>u.type===m.id);return c.length===0?"":`
                                    <div class="entry-category">
                                        <div class="category-label">${m.icon} ${m.label}</div>
                                        ${c.map(u=>`
                                            <label class="entry-checkbox">
                                                <input type="checkbox" 
                                                    value="${u.id}" 
                                                    ${e.selectedEntries.includes(u.id)?"checked":""}>
                                                <span>${u.data.name||"Untitled"}</span>
                                            </label>
                                        `).join("")}
                                    </div>
                                `}).join("")}
                            ${n.length===0?'<div class="empty-hint">No Library entries yet</div>':""}
                        </div>
                    </div>

                    <!-- Session Controls -->
                    <div class="sidebar-footer">
                        <select id="session-select" class="input text-sm">
                            <option value="">-- Sessions --</option>
                            ${Object.keys(e.sessions).map(m=>`<option value="${m}">${m}</option>`).join("")}
                        </select>
                        <button id="btn-save-session" class="btn btn-ghost btn-sm" title="Save Session">💾</button>
                        <button id="btn-load-session" class="btn btn-ghost btn-sm" title="Load Session">📂</button>
                    </div>
                </div>

                <!-- Right: Chat Panel -->
                <div class="scribe-main">
                    <div id="chat-log" class="chat-log"></div>

                    <div class="chat-footer">
                        <div class="chat-controls">
                            <select id="template-select" class="input text-sm">
                                <option value="">📝 Templates...</option>
                            </select>
                            <div class="flex-1"></div>
                            <button id="btn-clear" class="btn btn-ghost btn-sm">🗑️ Clear</button>
                        </div>
                        <div class="chat-input-row">
                            <textarea id="chat-input" class="input" rows="3" placeholder="Ask The Scribe for help with your world..."></textarea>
                            <button id="btn-send" class="btn btn-primary">Send</button>
                        </div>
                    </div>
                </div>
            </div>
        `;const a=t.querySelector("#chat-log"),r=t.querySelector("#chat-input"),o=t.querySelector("#btn-send"),l=t.querySelector("#template-select"),p=t.querySelector("#session-select");function d(){const m=Se[e.mode]||[];l.innerHTML='<option value="">📝 Templates...</option>'+m.map((c,u)=>`<option value="${u}">${c.label}</option>`).join("")}d(),l.onchange=()=>{const m=parseInt(l.value);if(!isNaN(m)){const c=Se[e.mode]||[];c[m]&&(r.value=c[m].prompt,r.focus())}l.value=""},t.querySelectorAll(".mode-btn").forEach(m=>{m.onclick=()=>{e.mode=m.dataset.mode,t.querySelectorAll(".mode-btn").forEach(c=>c.classList.remove("active")),m.classList.add("active"),d(),s()}}),t.querySelectorAll(".entry-checkbox input").forEach(m=>{m.onchange=()=>{const c=m.value;m.checked?e.selectedEntries.includes(c)||e.selectedEntries.push(c):e.selectedEntries=e.selectedEntries.filter(u=>u!==c),s()}});function v(){if(e.history.length===0){a.innerHTML=`
                    <div class="chat-empty">
                        <div class="empty-icon">✍️</div>
                        <div class="empty-title">The Scribe</div>
                        <div class="empty-hint">Your AI world-building assistant. Select Library entries for context, then ask for help.</div>
                    </div>
                `;return}a.innerHTML=e.history.map(m=>`
                <div class="chat-bubble ${m.role}">
                    <div class="bubble-content">${m.content.replace(/\n/g,"<br>")}</div>
                    <div class="bubble-meta">
                        <span>${m.role==="user"?"You":"✍️ Scribe"}</span>
                        <button class="btn-copy" data-content="${encodeURIComponent(m.content)}" title="Copy">📋</button>
                    </div>
                </div>
            `).join(""),a.querySelectorAll(".btn-copy").forEach(m=>{m.onclick=()=>{navigator.clipboard.writeText(decodeURIComponent(m.dataset.content))}}),a.scrollTop=a.scrollHeight}v();function y(){xe.find(c=>c.id===e.mode);let m="You are The Scribe, an expert world-building assistant for tabletop RPG settings. ";if(e.mode==="brainstorm"?m+="Help the user generate creative ideas, explore concepts, and brainstorm possibilities. Be imaginative and offer multiple options.":e.mode==="expand"?m+="Help the user develop and expand existing ideas with rich detail. Add depth, history, and connections.":e.mode==="critique"&&(m+="Provide constructive feedback on the user's ideas. Identify strengths, weaknesses, inconsistencies, and suggest improvements."),e.selectedEntries.length>0){const c=e.selectedEntries.map(u=>n.find(f=>f.id===u)).filter(Boolean);c.length>0&&(m+=`

[WORLD CONTEXT - The user has selected these entries from their world Bible:]
`,c.forEach(u=>{const f=i.find(h=>h.id===u.type);if(m+=`
[${(f==null?void 0:f.label)||u.type}] ${u.data.name||"Untitled"}`,u.data.description){const h=u.data.description.replace(/<[^>]+>/g,"").substring(0,300);m+=`: ${h}`}f!=null&&f.fields&&f.fields.forEach(h=>{u.data[h.key]&&(m+=` | ${h.label}: ${u.data[h.key]}`)}),u.data.relationships&&u.data.relationships.length>0&&(m+=`
  Relationships:`,u.data.relationships.forEach(h=>{const g=n.find(E=>E.id===h.targetId),b=(g==null?void 0:g.data.name)||"(Unknown)",k=h.type||"related to";m+=`
    - ${k}: ${b}`,h.notes&&(m+=` (${h.notes})`)}))}),m+=`
[END CONTEXT]`)}return m}async function S(){const m=r.value.trim();if(!m)return;const c={id:X(),role:"user",content:m,timestamp:new Date().toISOString()};e.history.push(c),r.value="",v(),s(),o.disabled=!0,o.textContent="Thinking...";try{if(!j.getActiveConfig())throw new Error("No API configuration. Go to Settings to add one.");const f=y(),g=e.history.map(E=>({role:E.role==="user"?"user":"model",content:E.content})).slice(-20),b=await j.generate(f,g),k={id:X(),role:"model",content:b,timestamp:new Date().toISOString()};e.history.push(k),s(),v()}catch(u){console.error("[Scribe]",u),e.history.push({id:X(),role:"model",content:`[Error: ${u.message}]`,timestamp:new Date().toISOString()}),v()}finally{o.disabled=!1,o.textContent="Send"}}o.onclick=S,r.onkeydown=m=>{m.key==="Enter"&&!m.shiftKey&&(m.preventDefault(),S())},t.querySelector("#btn-clear").onclick=()=>{confirm("Clear all messages?")&&(e.history=[],s(),v())},t.querySelector("#btn-save-session").onclick=()=>{const m=prompt("Session name:",`Session ${Object.keys(e.sessions).length+1}`);m&&(e.sessions[m]={history:[...e.history],mode:e.mode,selectedEntries:[...e.selectedEntries],savedAt:new Date().toISOString()},s(),p.innerHTML='<option value="">-- Sessions --</option>'+Object.keys(e.sessions).map(c=>`<option value="${c}">${c}</option>`).join(""))},t.querySelector("#btn-load-session").onclick=()=>{const m=p.value;if(!m||!e.sessions[m])return;const c=e.sessions[m];e.history=[...c.history],e.mode=c.mode,e.selectedEntries=[...c.selectedEntries],s(),le.render(t)}}},J={id:"settings",label:"Settings",icon:"⚙️",render:(t,e)=>{const s=j.getConfigs(),n=j.getActiveConfig();t.innerHTML=`
            <div class="settings-layout">
                <div class="settings-content">
                    <h1 class="settings-title">⚙️ Settings</h1>

                    <!-- API Configurations -->
                    <div class="settings-section">
                        <div class="section-header">
                            <h2 class="section-title">API Configurations</h2>
                            <button id="btn-add-config" class="btn btn-primary btn-sm">+ Add</button>
                        </div>

                        <div id="configs-list" class="configs-list">
                            ${s.length===0?`
                                <div class="empty-state">
                                    <div class="empty-icon">🔑</div>
                                    <div class="empty-text">No API configurations yet</div>
                                    <div class="empty-hint">Add a configuration to enable AI features</div>
                                </div>
                            `:s.map(c=>{var u;return`
                                <div class="config-card ${c.id===(n==null?void 0:n.id)?"active":""}" data-id="${c.id}">
                                    <div class="config-info">
                                        <div class="config-name">${c.name||"Unnamed"}</div>
                                        <div class="config-provider">${((u=ae.find(f=>f.id===c.provider))==null?void 0:u.label)||c.provider} • ${c.model}</div>
                                    </div>
                                    <div class="config-actions">
                                        <button class="btn btn-ghost btn-sm btn-activate" title="Set Active">✓</button>
                                        <button class="btn btn-ghost btn-sm btn-edit" title="Edit">✏️</button>
                                        <button class="btn btn-ghost btn-sm btn-delete" title="Delete">🗑️</button>
                                    </div>
                                </div>
                            `}).join("")}
                        </div>
                    </div>

                    <!-- Editor Modal (hidden) -->
                    <div id="config-editor" class="config-editor" style="display:none;">
                        <div class="editor-content">
                            <h3 class="editor-title">Configuration</h3>
                            
                            <div class="field-group">
                                <label class="field-label">Name</label>
                                <input type="text" id="cfg-name" class="input" placeholder="My API Key">
                            </div>

                            <div class="field-group">
                                <label class="field-label">Provider</label>
                                <select id="cfg-provider" class="input">
                                    ${ae.map(c=>`<option value="${c.id}">${c.label}</option>`).join("")}
                                </select>
                            </div>

                            <div class="field-group">
                                <label class="field-label">Model</label>
                                <select id="cfg-model" class="input"></select>
                            </div>

                            <div class="field-group" id="field-apikey">
                                <label class="field-label">API Key</label>
                                <input type="password" id="cfg-apikey" class="input" placeholder="sk-...">
                            </div>

                            <div class="field-group" id="field-baseurl" style="display:none;">
                                <label class="field-label">Base URL</label>
                                <input type="text" id="cfg-baseurl" class="input" placeholder="https://api.example.com/v1">
                            </div>

                            <div class="editor-actions">
                                <button id="btn-test-config" class="btn btn-secondary">Test Connection</button>
                                <div class="flex-1"></div>
                                <button id="btn-cancel-config" class="btn btn-ghost">Cancel</button>
                                <button id="btn-save-config" class="btn btn-primary">Save</button>
                            </div>

                            <div id="test-result" class="test-result"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;const i=t.querySelector("#configs-list"),a=t.querySelector("#config-editor"),r=t.querySelector("#cfg-provider"),o=t.querySelector("#cfg-model"),l=t.querySelector("#field-baseurl"),p=t.querySelector("#field-apikey"),d=t.querySelector("#test-result");let v=null;function y(){const c=r.value,u=ae.find(f=>f.id===c);o.innerHTML=u.models.map(f=>`<option value="${f}">${f}</option>`).join(""),l.style.display=["kobold","custom"].includes(c)?"block":"none",p.style.display=c==="kobold"?"none":"block"}r.onchange=y,y();function S(c=null){var u;v=(c==null?void 0:c.id)||null,t.querySelector("#cfg-name").value=(c==null?void 0:c.name)||"",r.value=(c==null?void 0:c.provider)||"gemini",y(),o.value=(c==null?void 0:c.model)||((u=o.options[0])==null?void 0:u.value)||"",t.querySelector("#cfg-apikey").value=(c==null?void 0:c.apiKey)||"",t.querySelector("#cfg-baseurl").value=(c==null?void 0:c.baseUrl)||"",d.innerHTML="",a.style.display="flex"}function m(){a.style.display="none",v=null}t.querySelector("#btn-add-config").onclick=()=>S(),t.querySelector("#btn-cancel-config").onclick=m,t.querySelector("#btn-save-config").onclick=()=>{const c={id:v||X(),name:t.querySelector("#cfg-name").value||"Unnamed",provider:r.value,model:o.value,apiKey:t.querySelector("#cfg-apikey").value,baseUrl:t.querySelector("#cfg-baseurl").value};j.saveConfig(c),j.getConfigs().length===1&&j.setActiveConfig(c.id),m(),J.render(t,e)},t.querySelector("#btn-test-config").onclick=async()=>{const c=t.querySelector("#btn-test-config");c.disabled=!0,c.textContent="Testing...",d.innerHTML='<span class="test-pending">Connecting...</span>';const u={provider:r.value,model:o.value,apiKey:t.querySelector("#cfg-apikey").value,baseUrl:t.querySelector("#cfg-baseurl").value};try{await j.testConfig(u),d.innerHTML='<span class="test-success">✓ Connection successful!</span>'}catch(f){d.innerHTML=`<span class="test-error">✗ ${f.message}</span>`}c.disabled=!1,c.textContent="Test Connection"},i.querySelectorAll(".config-card").forEach(c=>{const u=c.dataset.id;c.querySelector(".btn-activate").onclick=()=>{j.setActiveConfig(u),J.render(t,e)},c.querySelector(".btn-edit").onclick=()=>{const f=j.getConfigs().find(h=>h.id===u);S(f)},c.querySelector(".btn-delete").onclick=()=>{confirm("Delete this configuration?")&&(j.deleteConfig(u),J.render(t,e))}})}};async function Ne(){console.log(`%c Samildánach v${x.project.version} `,"background: #222; color: #bada55"),N.registerPanel(se.id,se),N.registerPanel(w.id,w),N.registerPanel(fe.id,fe),N.registerPanel(be.id,be),N.registerPanel(he.id,he),N.registerPanel(ye.id,ye),N.registerPanel(le.id,le),N.registerPanel(J.id,J),N.init(),N.activePanelId||N.switchPanel(se.id)}window.addEventListener("DOMContentLoaded",Ne);
