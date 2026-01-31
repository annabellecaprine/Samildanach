(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function s(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(i){if(i.ep)return;i.ep=!0;const a=s(i);fetch(i.href,a)}})();const be="samildanach_state",S={project:{title:"Untitled Setting",author:"",version:"1.0.0",description:"",genre:"",system:""},session:{activePanel:null,activeEntryId:null},cache:{},_subscribers:[],init(){const t=localStorage.getItem(be);if(t)try{const e=JSON.parse(t);e.project&&Object.assign(this.project,e.project),e.session&&Object.assign(this.session,e.session)}catch(e){console.warn("Failed to restore state:",e)}},save(){const t={project:this.project,session:this.session};localStorage.setItem(be,JSON.stringify(t))},updateProject(t){Object.assign(this.project,t),this.save(),this._notify("project",this.project)},updateSession(t){Object.assign(this.session,t),this.save(),this._notify("session",this.session)},subscribe(t,e){const s={key:t,callback:e};return this._subscribers.push(s),()=>{const n=this._subscribers.indexOf(s);n>=0&&this._subscribers.splice(n,1)}},_notify(t,e){this._subscribers.filter(s=>s.key===t).forEach(s=>s.callback(e))},exportState(){return{project:{...this.project},session:{...this.session}}},importState(t){t.project&&Object.assign(this.project,t.project),t.session&&Object.assign(this.session,t.session),this.save(),this._notify("project",this.project),this._notify("session",this.session)}},q={panels:{},activePanelId:null,init:function(){S.init(),this.renderSidebar(),this.bindEvents();const t=localStorage.getItem("theme")||"dark";document.documentElement.setAttribute("data-theme",t),S.session.activePanel&&this.panels[S.session.activePanel]&&this.switchPanel(S.session.activePanel)},registerPanel:function(t,e){this.panels[t]=e,this.renderSidebar()},switchPanel:function(t){if(!this.panels[t])return;this.activePanelId=t,S.updateSession({activePanel:t}),document.querySelectorAll(".nav-item").forEach(n=>{n.classList.toggle("active",n.dataset.id===t)});const e=document.getElementById("main-view");e.innerHTML="";const s=document.createElement("div");s.className="panel-container",this.panels[t].render(s,S),e.appendChild(s)},renderSidebar:function(){const t=document.getElementById("nav-list");t&&(t.innerHTML="",Object.keys(this.panels).forEach(e=>{const s=this.panels[e],n=document.createElement("div");n.className="nav-item",n.innerHTML=s.icon||"📦",n.title=s.label||e,n.dataset.id=e,n.onclick=()=>this.switchPanel(e),e===this.activePanelId&&n.classList.add("active"),t.appendChild(n)}))},bindEvents:function(){const t=document.getElementById("theme-toggle");t&&(t.onclick=()=>{const e=document.documentElement,n=e.getAttribute("data-theme")==="dark"?"light":"dark";e.setAttribute("data-theme",n),localStorage.setItem("theme",n)})}},B={generateId:(t="id")=>typeof crypto<"u"&&crypto.randomUUID?`${t}_${crypto.randomUUID().split("-")[0]}`:`${t}_${Math.random().toString(36).substring(2,9)}`,escapeHtml:t=>{const e=document.createElement("div");return e.textContent=t,e.innerHTML},debounce:(t,e=300)=>{let s;return(...n)=>{clearTimeout(s),s=setTimeout(()=>t(...n),e)}},deepClone:t=>JSON.parse(JSON.stringify(t)),formatDate:t=>{const e=new Date(t);return e.toLocaleDateString()+" "+e.toLocaleTimeString()},truncate:(t,e=50)=>!t||t.length<=e?t:t.substring(0,e-3)+"..."},Q=B.generateId,Ae="samildanach_vault",qe=1,U="items",J="registry",Z="vault_registry";let I=null;function fe(){return{id:Z,lastUpdatedAt:new Date().toISOString(),universes:[],allTags:[],blocks:{},itemCounts:{actor:0,lorebook:0,script:0,location:0,event:0,pair:0}}}const T={init:function(){return new Promise((t,e)=>{if(I){t(I);return}const s=indexedDB.open(Ae,qe);s.onerror=n=>{console.error("[VaultDB] Failed to open database:",n.target.error),e(n.target.error)},s.onsuccess=n=>{I=n.target.result,console.log("[VaultDB] Database opened successfully"),t(I)},s.onupgradeneeded=n=>{const i=n.target.result;if(!i.objectStoreNames.contains(U)){const a=i.createObjectStore(U,{keyPath:"id"});a.createIndex("type","type",{unique:!1}),a.createIndex("universe","universe",{unique:!1}),a.createIndex("updatedAt","updatedAt",{unique:!1}),console.log("[VaultDB] Items store created")}i.objectStoreNames.contains(J)||(i.createObjectStore(J,{keyPath:"id"}),console.log("[VaultDB] Registry store created"))}})},getRegistry:function(){return new Promise((t,e)=>{if(!I){e(new Error("VaultDB not initialized"));return}const i=I.transaction(J,"readonly").objectStore(J).get(Z);i.onsuccess=()=>{i.result?t(i.result):T.updateRegistry(fe()).then(t).catch(e)},i.onerror=a=>e(a.target.error)})},updateRegistry:function(t){return new Promise((e,s)=>{if(!I){s(new Error("VaultDB not initialized"));return}const i=I.transaction(J,"readwrite").objectStore(J),a=i.get(Z);a.onsuccess=()=>{const r={...a.result||fe(),...t,id:Z,lastUpdatedAt:new Date().toISOString()},l=i.put(r);l.onsuccess=()=>e(r),l.onerror=d=>s(d.target.error)},a.onerror=o=>s(o.target.error)})},list:function(t={}){return new Promise((e,s)=>{if(!I){s(new Error("VaultDB not initialized"));return}const i=I.transaction(U,"readonly").objectStore(U);let a;t.type?a=i.index("type").openCursor(IDBKeyRange.only(t.type)):t.universe?a=i.index("universe").openCursor(IDBKeyRange.only(t.universe)):a=i.openCursor();const o=[];a.onsuccess=r=>{const l=r.target.result;if(l){const d=l.value;let c=!0;t.type&&d.type!==t.type&&(c=!1),t.universe&&d.universe!==t.universe&&(c=!1),t.tags&&t.tags.length>0&&(t.tags.every(g=>{var f;return(f=d.tags)==null?void 0:f.includes(g)})||(c=!1)),c&&o.push(d),l.continue()}else o.sort((d,c)=>new Date(c.updatedAt).getTime()-new Date(d.updatedAt).getTime()),e(o)},a.onerror=r=>s(r.target.error)})},addItem:function(t,e,s={}){return new Promise((n,i)=>{if(!I){console.error("[VaultDB]AddItem: DB not initialized"),i(new Error("VaultDB not initialized"));return}const a=new Date().toISOString();let o;try{o=B&&B.generateId?B.generateId("vault"):`vault_${crypto.randomUUID()}`}catch(b){console.error("[VaultDB] ID Gen Failed:",b),o="vault_"+Date.now()}const r={id:o,type:t,version:1,universe:s.universe||"",tags:s.tags||[],createdAt:a,updatedAt:a,data:e};console.log("[VaultDB] Adding Item:",r);const c=I.transaction(U,"readwrite").objectStore(U).add(r);c.onsuccess=()=>{console.log("[VaultDB] Add Success"),n(r)},c.onerror=b=>{console.error("[VaultDB] Add Failed:",b.target.error),i(b.target.error)}})},updateItem:function(t){return new Promise((e,s)=>{if(!I){s(new Error("VaultDB not initialized"));return}t.updatedAt=new Date().toISOString();const a=I.transaction(U,"readwrite").objectStore(U).put(t);a.onsuccess=()=>e(t),a.onerror=o=>s(o.target.error)})}},ce={person:{id:"person",label:"Person",icon:"👤",color:"#6366f1",fields:[{key:"role",label:"Role",type:"text"},{key:"affiliation",label:"Affiliation",type:"text"},{key:"motivation",label:"Motivation",type:"text"},{key:"appearance",label:"Appearance",type:"textarea"}]},location:{id:"location",label:"Location",icon:"📍",color:"#22c55e",fields:[{key:"region",label:"Region",type:"text"},{key:"climate",label:"Climate",type:"text"},{key:"pointsOfInterest",label:"Points of Interest",type:"textarea"}]},faction:{id:"faction",label:"Faction",icon:"🏛️",color:"#f59e0b",fields:[{key:"goals",label:"Goals",type:"textarea"},{key:"allies",label:"Allies",type:"text"},{key:"enemies",label:"Enemies",type:"text"}]},concept:{id:"concept",label:"Concept",icon:"💡",color:"#8b5cf6",fields:[{key:"domain",label:"Domain",type:"text"},{key:"principles",label:"Core Principles",type:"textarea"}]},event:{id:"event",label:"Event",icon:"📜",color:"#ef4444",fields:[{key:"era",label:"Era/Date",type:"text"},{key:"participants",label:"Participants",type:"text"},{key:"outcome",label:"Outcome",type:"textarea"}]},item:{id:"item",label:"Item",icon:"🎁",color:"#14b8a6",fields:[{key:"origin",label:"Origin",type:"text"},{key:"properties",label:"Properties",type:"textarea"}]}},G=t=>ce[t]||ce.item,K=()=>Object.values(ce),ae={id:"project",label:"Project",icon:"🏠",render:async(t,e)=>{try{await T.init()}catch(r){t.innerHTML=`<div class="text-muted">Vault Error: ${r.message}</div>`;return}const s=await T.list(),n={};K().forEach(r=>{n[r.id]=s.filter(l=>l.type===r.id).length});const i=s.reduce((r,l)=>{var d;return r+(((d=l.data.relationships)==null?void 0:d.length)||0)},0);t.innerHTML=`
            <div class="project-layout">
                <div class="project-content">
                    
                    <!-- Header -->
                    <div class="project-header">
                        <div class="project-icon">📖</div>
                        <input id="proj-title" type="text" value="${S.project.title}" 
                            placeholder="Setting Title" class="project-title">
                        <div class="project-author">
                            <input id="proj-author" type="text" value="${S.project.author}" 
                                placeholder="Author Name">
                        </div>
                    </div>

                    <!-- Stats Cards -->
                    <div class="stats-grid">
                        ${K().map(r=>`
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
                                <input id="proj-version" type="text" value="${S.project.version}" class="input">
                            </div>
                            <div class="detail-field">
                                <label class="label">Genre</label>
                                <input id="proj-genre" type="text" value="${S.project.genre}" 
                                    placeholder="Fantasy, Sci-Fi, Horror..." class="input">
                            </div>
                        </div>
                        
                        <div class="detail-field">
                            <label class="label">Compatible Game System</label>
                            <input id="proj-system" type="text" value="${S.project.system}" 
                                placeholder="D&D 5e, Pathfinder 2e, Fate Core..." class="input">
                        </div>

                        <div class="detail-field" style="margin-top: 16px;">
                            <label class="label">Description</label>
                            <textarea id="proj-description" rows="4" 
                                placeholder="Describe your setting..." class="textarea">${S.project.description}</textarea>
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
        `;const a=()=>{S.updateProject({title:t.querySelector("#proj-title").value,author:t.querySelector("#proj-author").value,version:t.querySelector("#proj-version").value,genre:t.querySelector("#proj-genre").value,system:t.querySelector("#proj-system").value,description:t.querySelector("#proj-description").value})};t.querySelectorAll("input, textarea").forEach(r=>{r.oninput=a}),t.querySelector("#btn-export").onclick=async()=>{const r={meta:S.project,entries:s,exportedAt:new Date().toISOString(),version:"1.0"},l=new Blob([JSON.stringify(r,null,2)],{type:"application/json"}),d=URL.createObjectURL(l),c=document.createElement("a");c.href=d,c.download=`${S.project.title.replace(/[^a-z0-9]/gi,"_")}_setting.json`,c.click(),URL.revokeObjectURL(d)};const o=t.querySelector("#import-file");t.querySelector("#btn-import").onclick=()=>o.click(),o.onchange=async r=>{var d;const l=r.target.files[0];if(l)try{const c=await l.text(),b=JSON.parse(c);if(b.meta&&S.updateProject(b.meta),b.entries&&Array.isArray(b.entries))for(const g of b.entries)await T.addItem(g.type,g.data);alert(`Imported ${((d=b.entries)==null?void 0:d.length)||0} entries!`),location.reload()}catch(c){alert("Import failed: "+c.message)}}}},de={parse(t){const e=t.trim().match(/^(\d+)?d(\d+)([+-]\d+)?$/i);return e?{count:parseInt(e[1])||1,sides:parseInt(e[2]),modifier:parseInt(e[3])||0}:null},rollOne(t){return Math.floor(Math.random()*t)+1},rollMany(t,e){const s=[];for(let n=0;n<t;n++)s.push(this.rollOne(e));return s},roll(t){const e=this.parse(t);if(!e)return{error:"Invalid format. Use NdX or NdX+Y (e.g., 2d6+3)"};const s=this.rollMany(e.count,e.sides),n=s.reduce((a,o)=>a+o,0),i=n+e.modifier;return{expression:t,rolls:s,subtotal:n,modifier:e.modifier,total:i}},format(t){if(t.error)return t.error;let e=`[${t.rolls.join(", ")}]`;return t.modifier!==0&&(e+=` ${t.modifier>0?"+":""}${t.modifier}`),e+=` = ${t.total}`,e},stats(t){const e=this.parse(t);if(!e)return null;const s=e.count+e.modifier,n=e.count*e.sides+e.modifier,i=(s+n)/2;return{min:s,max:n,average:i.toFixed(1)}}},oe={runDiceSimulation(t,e=1e3){const s=[],n={};for(let p=0;p<e;p++){const m=de.roll(t);if(m.error)return{error:m.error};s.push(m.total),n[m.total]=(n[m.total]||0)+1}const i=[...s].sort((p,m)=>p-m),o=s.reduce((p,m)=>p+m,0)/e,l=s.map(p=>Math.pow(p-o,2)).reduce((p,m)=>p+m,0)/e,d=Math.sqrt(l);let c=null,b=0;for(const[p,m]of Object.entries(n))m>b&&(b=m,c=parseInt(p));const g=e%2===0?(i[e/2-1]+i[e/2])/2:i[Math.floor(e/2)],f=i[Math.floor(e*.25)],u=i[Math.floor(e*.75)];return{expression:t,iterations:e,results:s,distribution:n,stats:{min:i[0],max:i[i.length-1],mean:o.toFixed(2),median:g,mode:c,stdDev:d.toFixed(2),p25:f,p75:u}}},getHistogramData(t){if(t.error)return[];const{distribution:e,iterations:s,stats:n}=t,i=[];for(let a=n.min;a<=n.max;a++){const o=e[a]||0;i.push({value:a,count:o,percentage:(o/s*100).toFixed(1)})}return i},compare(t,e,s=1e3){const n=this.runDiceSimulation(t,s),i=this.runDiceSimulation(e,s);if(n.error||i.error)return{error:n.error||i.error};let a=0,o=0,r=0;for(let l=0;l<s;l++)n.results[l]>i.results[l]?a++:i.results[l]>n.results[l]?o++:r++;return{expr1:{expression:t,stats:n.stats},expr2:{expression:e,stats:i.stats},comparison:{wins1:a,wins2:o,ties:r,win1Pct:(a/s*100).toFixed(1),win2Pct:(o/s*100).toFixed(1),tiePct:(r/s*100).toFixed(1)}}}},ve={id:"laboratory",label:"Laboratory",icon:"🧪",render:(t,e)=>{t.innerHTML=`
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
        `;const s=t.querySelector("#lab-expr"),n=t.querySelector("#lab-roll"),i=t.querySelector("#lab-result"),a=t.querySelector("#lab-stats");s.oninput=()=>{const p=de.stats(s.value);p?a.innerText=`Range: ${p.min}–${p.max} | Average: ${p.average}`:a.innerText=""},s.oninput(),n.onclick=()=>{const p=s.value.trim();if(!p)return;const m=de.roll(p);m.error?i.innerHTML=`<span style="color:var(--status-error);">${m.error}</span>`:i.innerHTML=`
                    <div><strong>Rolls:</strong> [${m.rolls.join(", ")}]</div>
                    ${m.modifier!==0?`<div><strong>Modifier:</strong> ${m.modifier>0?"+":""}${m.modifier}</div>`:""}
                    <div class="roll-total"><strong>Total:</strong> ${m.total}</div>
                `},s.onkeydown=p=>{p.key==="Enter"&&n.onclick()};const o=t.querySelector("#sim-expr"),r=t.querySelector("#sim-iterations"),l=t.querySelector("#sim-run"),d=t.querySelector("#sim-results"),c=t.querySelector("#histogram");l.onclick=()=>{const p=o.value.trim(),m=parseInt(r.value);p&&(l.disabled=!0,l.innerText="Running...",setTimeout(()=>{const y=oe.runDiceSimulation(p,m);if(l.disabled=!1,l.innerText="Run",y.error){d.style.display="none",alert(y.error);return}d.style.display="block",t.querySelector("#stat-min").innerText=y.stats.min,t.querySelector("#stat-max").innerText=y.stats.max,t.querySelector("#stat-mean").innerText=y.stats.mean,t.querySelector("#stat-median").innerText=y.stats.median,t.querySelector("#stat-mode").innerText=y.stats.mode,t.querySelector("#stat-stddev").innerText=y.stats.stdDev;const h=oe.getHistogramData(y),x=Math.max(...h.map(v=>v.count));c.innerHTML=h.map(v=>`
                    <div class="hist-bar-container">
                        <div class="hist-bar" style="height: ${v.count/x*100}%;" title="${v.value}: ${v.count} (${v.percentage}%)"></div>
                        <span class="hist-label">${v.value}</span>
                    </div>
                `).join("")},10))};const b=t.querySelector("#cmp-expr1"),g=t.querySelector("#cmp-expr2"),f=t.querySelector("#cmp-run"),u=t.querySelector("#cmp-results");f.onclick=()=>{const p=b.value.trim(),m=g.value.trim();if(!p||!m)return;const y=oe.compare(p,m,1e3);if(y.error){u.style.display="none",alert(y.error);return}u.style.display="block",u.innerHTML=`
                <div class="compare-stat">
                    <strong>${p}</strong> wins <span class="highlight">${y.comparison.win1Pct}%</span> of the time
                    <small>(avg: ${y.expr1.stats.mean})</small>
                </div>
                <div class="compare-stat">
                    <strong>${m}</strong> wins <span class="highlight">${y.comparison.win2Pct}%</span> of the time
                    <small>(avg: ${y.expr2.stats.mean})</small>
                </div>
                <div class="compare-stat tie">
                    Ties: ${y.comparison.tiePct}%
                </div>
            `}}};class z{constructor(e={}){this.title=e.title||"Modal",this.content=e.content||"",this.actions=e.actions||[],this.onClose=e.onClose||null,this.element=null}show(){this.element=document.createElement("div"),this.element.className="modal-overlay",this.element.innerHTML=`
            <div class="modal-content">
                <h3 class="modal-title">${this.title}</h3>
                <div class="modal-body"></div>
                <div class="modal-actions"></div>
            </div>
        `;const e=this.element.querySelector(".modal-body");typeof this.content=="string"?e.innerHTML=this.content:this.content instanceof HTMLElement&&e.appendChild(this.content);const s=this.element.querySelector(".modal-actions");this.actions.forEach(n=>{const i=document.createElement("button");i.className=n.className||"btn btn-secondary",i.innerText=n.label,i.onclick=()=>{n.onClick&&n.onClick(this)},s.appendChild(i)}),this.element.onclick=n=>{n.target===this.element&&this.close()},document.body.appendChild(this.element)}close(){this.element&&(this.element.remove(),this.element=null),this.onClose&&this.onClose()}getBody(){var e;return(e=this.element)==null?void 0:e.querySelector(".modal-body")}static confirm(e,s){return new Promise(n=>{const i=new z({title:e,content:`<p>${s}</p>`,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:()=>{i.close(),n(!1)}},{label:"Confirm",className:"btn btn-primary",onClick:()=>{i.close(),n(!0)}}]});i.show()})}static alert(e,s){return new Promise(n=>{const i=new z({title:e,content:`<p>${s}</p>`,actions:[{label:"OK",className:"btn btn-primary",onClick:()=>{i.close(),n()}}]});i.show()})}}class De{constructor(e,s={}){this.container=e,this.items=[],this.activeCategory=null,this.activeItemId=null,this.onSelect=s.onSelect||null,this.onCreate=s.onCreate||null}setItems(e){this.items=e,this.render()}setActiveItem(e){this.activeItemId=e,this.renderList()}render(){this.container.innerHTML=`
            <div id="category-tabs" class="library-tabs"></div>
            <div class="library-search-bar">
                <input id="lib-search" type="text" placeholder="Search..." class="input">
                <button id="lib-add-btn" class="btn btn-primary">+</button>
            </div>
            <div id="lib-list" class="library-list"></div>
        `,this.tabsEl=this.container.querySelector("#category-tabs"),this.searchInput=this.container.querySelector("#lib-search"),this.listEl=this.container.querySelector("#lib-list"),this.addBtn=this.container.querySelector("#lib-add-btn"),this.renderTabs(),this.renderList(),this.searchInput.oninput=()=>this.renderList(),this.addBtn.onclick=()=>{this.onCreate&&this.onCreate()}}renderTabs(){this.tabsEl.innerHTML="";const e=document.createElement("button");e.innerText="All",e.className="tab"+(this.activeCategory===null?" active":""),e.onclick=()=>{this.activeCategory=null,this.renderTabs(),this.renderList()},this.tabsEl.appendChild(e),K().forEach(s=>{const n=document.createElement("button");n.innerText=`${s.icon} ${s.label}`,n.className="tab"+(this.activeCategory===s.id?" active":""),this.activeCategory===s.id&&(n.style.background=s.color,n.style.borderColor=s.color),n.onclick=()=>{this.activeCategory=s.id,this.renderTabs(),this.renderList()},this.tabsEl.appendChild(n)})}renderList(){var i;if(!this.listEl)return;this.listEl.innerHTML="";const e=((i=this.searchInput)==null?void 0:i.value.toLowerCase())||"",s=this.activeCategory,n=this.items.filter(a=>{const o=(a.data.name||"").toLowerCase().includes(e),r=s?a.type===s:!0;return o&&r});if(n.length===0){this.listEl.innerHTML='<div class="library-list-empty">No entries found.</div>';return}n.forEach(a=>{const o=G(a.type),r=this.activeItemId===a.id,l=document.createElement("div");l.className="list-item"+(r?" active":""),l.innerHTML=`
                <span>${o.icon}</span>
                <span class="flex-1" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${a.data.name||"Untitled"}</span>
            `,l.onclick=()=>{this.onSelect&&this.onSelect(a)},this.listEl.appendChild(l)})}}class Ce{constructor(e,s="",n={}){this.container=e,this.value=s,this.onChange=null,this.onLinkClick=n.onLinkClick||null,this.getEntries=n.getEntries||(()=>[])}render(){this.container.innerHTML=`
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
        `,this.editor=this.container.querySelector(".rte-content"),this.autocomplete=this.container.querySelector(".rte-autocomplete"),this.bindEvents()}renderWithLinks(e){return e.replace(/\[\[([^\]]+)\]\]/g,(s,n)=>`<span class="wiki-link" data-link="${n}">[[${n}]]</span>`)}extractRawText(e){const s=document.createElement("div");return s.innerHTML=e,s.querySelectorAll(".wiki-link").forEach(n=>{n.replaceWith(`[[${n.dataset.link}]]`)}),s.innerHTML}bindEvents(){this.container.querySelectorAll("button[data-cmd]").forEach(e=>{e.onclick=s=>{s.preventDefault();const n=e.dataset.cmd;n==="link"?this.insertLinkPlaceholder():n==="h2"||n==="h3"?document.execCommand("formatBlock",!1,n):document.execCommand(n,!1,null),this.editor.focus()}}),this.editor.oninput=()=>{this.checkForAutocomplete(),this.value=this.extractRawText(this.editor.innerHTML),this.onChange&&this.onChange(this.value)},this.editor.onclick=e=>{if(e.target.classList.contains("wiki-link")){const s=e.target.dataset.link;this.onLinkClick&&this.onLinkClick(s)}},this.editor.onkeydown=e=>{if(this.autocomplete.style.display!=="none")if(e.key==="ArrowDown"||e.key==="ArrowUp")e.preventDefault(),this.navigateAutocomplete(e.key==="ArrowDown"?1:-1);else if(e.key==="Enter"||e.key==="Tab"){const s=this.autocomplete.querySelector(".selected");s&&(e.preventDefault(),this.selectAutocompleteItem(s.dataset.name))}else e.key==="Escape"&&this.hideAutocomplete()},this.editor.onblur=()=>{setTimeout(()=>this.hideAutocomplete(),150)}}insertLinkPlaceholder(){document.execCommand("insertText",!1,"[[]]");const e=window.getSelection();if(e.rangeCount){const s=e.getRangeAt(0);s.setStart(s.startContainer,s.startOffset-2),s.collapse(!0),e.removeAllRanges(),e.addRange(s)}}checkForAutocomplete(){const e=window.getSelection();if(!e.rangeCount)return;const s=e.getRangeAt(0),n=s.startContainer;if(n.nodeType!==Node.TEXT_NODE)return;const a=n.textContent.substring(0,s.startOffset).match(/\[\[([^\]]*?)$/);if(a){const o=a[1].toLowerCase(),r=this.getEntries().filter(l=>(l.data.name||"").toLowerCase().includes(o)).slice(0,8);r.length>0?this.showAutocomplete(r):this.hideAutocomplete()}else this.hideAutocomplete()}showAutocomplete(e){this.autocomplete.innerHTML="",e.forEach((s,n)=>{const i=document.createElement("div");i.dataset.name=s.data.name,i.className="rte-autocomplete-item"+(n===0?" selected":""),i.innerText=s.data.name||"Untitled",i.onmousedown=a=>{a.preventDefault(),this.selectAutocompleteItem(s.data.name)},this.autocomplete.appendChild(i)}),this.autocomplete.style.display="block",this.autocomplete.style.left="16px",this.autocomplete.style.bottom="16px"}hideAutocomplete(){this.autocomplete.style.display="none"}navigateAutocomplete(e){var a,o;const s=Array.from(this.autocomplete.children),n=s.findIndex(r=>r.classList.contains("selected"));(a=s[n])==null||a.classList.remove("selected");const i=Math.max(0,Math.min(s.length-1,n+e));(o=s[i])==null||o.classList.add("selected")}selectAutocompleteItem(e){const s=window.getSelection();if(!s.rangeCount)return;const n=s.getRangeAt(0),i=n.startContainer;if(i.nodeType!==Node.TEXT_NODE)return;const a=i.textContent,o=a.substring(0,n.startOffset);if(o.match(/\[\[([^\]]*?)$/)){const l=o.lastIndexOf("[["),d=a.substring(n.startOffset),c=d.indexOf("]]"),b=c>=0?d.substring(c+2):d,g=document.createElement("span");g.className="wiki-link",g.dataset.link=e,g.innerText=`[[${e}]]`;const f=document.createTextNode(a.substring(0,l)),u=document.createTextNode(" "+b),p=i.parentNode;p.insertBefore(f,i),p.insertBefore(g,i),p.insertBefore(u,i),p.removeChild(i);const m=document.createRange();m.setStartAfter(g),m.collapse(!0),s.removeAllRanges(),s.addRange(m)}this.hideAutocomplete(),this.value=this.extractRawText(this.editor.innerHTML),this.onChange&&this.onChange(this.value)}getValue(){return this.extractRawText(this.editor.innerHTML)}setValue(e){this.value=e,this.editor&&(this.editor.innerHTML=this.renderWithLinks(e))}}class Ne{constructor(e,s={}){this.container=e,this.item=null,this.onSave=s.onSave||null,this.onNameChange=s.onNameChange||null,this.onLinkClick=s.onLinkClick||null,this.getEntries=s.getEntries||(()=>[]),this.editorInstance=null}setItem(e){this.item=e,e?this.render():this.showEmpty()}showEmpty(){this.container.innerHTML=`
            <div class="empty-state">
                <h2>Select an entry</h2>
                <p>Or create a new one to start building your world.</p>
            </div>
        `}render(){if(!this.item)return this.showEmpty();const e=G(this.item.type);this.container.innerHTML=`
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
        `;const s=this.container.querySelector("#asset-title"),n=this.container.querySelector("#metadata-fields"),i=this.container.querySelector("#asset-rte-mount");this.container.querySelector("#save-status"),e.fields.forEach(r=>{const l=document.createElement("div");l.className="metadata-field";const d=document.createElement("label");d.innerText=r.label,d.className="label";let c;r.type==="textarea"?(c=document.createElement("textarea"),c.rows=2,c.className="textarea"):(c=document.createElement("input"),c.type="text",c.className="input"),c.value=this.item.data[r.key]||"",c.oninput=()=>{this.item.data[r.key]=c.value,this.save()},l.appendChild(d),l.appendChild(c),n.appendChild(l)});const a=new Ce(i,this.item.data.description||"",{getEntries:this.getEntries,onLinkClick:this.onLinkClick});a.render(),this.editorInstance=a,a.onChange=r=>{this.item.data.description=r,this.save()};let o=null;s.oninput=()=>{this.item.data.name=s.value,this.save(),clearTimeout(o),o=setTimeout(()=>{this.onNameChange&&this.onNameChange(this.item)},300)}}async save(){const e=this.container.querySelector("#save-status");e&&(e.innerText="Saving..."),this.onSave&&await this.onSave(this.item),e&&(e.innerText="Saved")}}const ee={member_of:{id:"member_of",label:"Member of",icon:"👥",inverse:"has_member",description:"This entry is a member of the target."},has_member:{id:"has_member",label:"Has Member",icon:"👤",inverse:"member_of",description:"The target is a member of this entry."},located_in:{id:"located_in",label:"Located in",icon:"📍",inverse:"contains",description:"This entry is located within the target."},contains:{id:"contains",label:"Contains",icon:"🗺️",inverse:"located_in",description:"This entry contains the target."},ally_of:{id:"ally_of",label:"Ally of",icon:"🤝",inverse:"ally_of",description:"This entry is allied with the target."},enemy_of:{id:"enemy_of",label:"Enemy of",icon:"⚔️",inverse:"enemy_of",description:"This entry is an enemy of the target."},parent_of:{id:"parent_of",label:"Parent of",icon:"👨‍👧",inverse:"child_of",description:"This entry is the parent of the target."},child_of:{id:"child_of",label:"Child of",icon:"👶",inverse:"parent_of",description:"This entry is the child of the target."},related_to:{id:"related_to",label:"Related to",icon:"🔗",inverse:"related_to",description:"Generic relationship."},created_by:{id:"created_by",label:"Created by",icon:"🛠️",inverse:"creator_of",description:"This entry was created by the target."},creator_of:{id:"creator_of",label:"Creator of",icon:"✨",inverse:"created_by",description:"This entry created the target."}},te=t=>ee[t]||ee.related_to,je=()=>Object.values(ee);class Re{constructor(e,s={}){this.container=e,this.item=null,this.allItems=[],this.onSave=s.onSave||null,this.onNavigate=s.onNavigate||null}setItem(e,s){this.item=e,this.allItems=s,e&&this.render()}render(){this.item&&(this.item.data.relationships||(this.item.data.relationships=[]),this.container.innerHTML=`
            <div class="relationships-header">
                <div class="label">Relationships</div>
                <button id="add-relationship-btn" class="btn btn-primary" style="padding:4px 10px; font-size:11px;">+ Add</button>
            </div>
            <div id="relationships-list" class="relationships-list"></div>
            <div id="back-references" class="back-references"></div>
        `,this.renderRelationships(),this.container.querySelector("#add-relationship-btn").onclick=()=>this.showAddModal())}renderRelationships(){const e=this.container.querySelector("#relationships-list"),s=this.container.querySelector("#back-references");e.innerHTML="",this.item.data.relationships.length===0?e.innerHTML='<div class="text-muted text-sm">No relationships defined.</div>':(this.item.data.relationships.forEach((i,a)=>{const o=te(i.type),r=this.allItems.find(b=>b.id===i.targetId),l=r?r.data.name||"Untitled":"(Deleted)",d=r?G(r.type):{icon:"❓"},c=document.createElement("div");c.className="relationship-row",c.innerHTML=`
                    <span>${o.icon}</span>
                    <span class="relationship-type">${o.label}</span>
                    <span class="relationship-target" data-id="${i.targetId}">${d.icon} ${l}</span>
                    <button class="relationship-delete" data-idx="${a}">×</button>
                `,e.appendChild(c)}),e.querySelectorAll(".relationship-target").forEach(i=>{i.onclick=()=>{const a=this.allItems.find(o=>o.id===i.dataset.id);a&&this.onNavigate&&this.onNavigate(a)}}),e.querySelectorAll(".relationship-delete").forEach(i=>{i.onclick=()=>{this.item.data.relationships.splice(parseInt(i.dataset.idx),1),this.onSave&&this.onSave(this.item),this.renderRelationships()}}));const n=this.allItems.filter(i=>{var a;return i.id!==this.item.id&&((a=i.data.relationships)==null?void 0:a.some(o=>o.targetId===this.item.id))});s.innerHTML="",n.length===0?s.innerHTML='<div class="text-muted text-xs">No incoming references.</div>':(s.innerHTML='<div class="back-ref-label">Referenced by:</div>',n.forEach(i=>{const a=G(i.type);i.data.relationships.filter(r=>r.targetId===this.item.id).forEach(r=>{const l=te(r.type),d=ee[l.inverse],c=document.createElement("div");c.className="back-ref-item",c.innerHTML=`<span>${a.icon}</span> ${i.data.name||"Untitled"} <span class="text-muted">(${(d==null?void 0:d.label)||l.label})</span>`,c.onclick=()=>{this.onNavigate&&this.onNavigate(i)},s.appendChild(c)})}))}showAddModal(){const e=document.createElement("div");e.className="flex flex-col gap-md",e.innerHTML=`
            <div>
                <label class="label">Type</label>
                <select id="rel-type-select" class="input" style="width:100%; margin-top:4px;"></select>
            </div>
            <div>
                <label class="label">Target Entry</label>
                <select id="rel-target-select" class="input" style="width:100%; margin-top:4px;"></select>
            </div>
        `,new z({title:"Add Relationship",content:e,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:a=>a.close()},{label:"Add",className:"btn btn-primary",onClick:a=>{const o=e.querySelector("#rel-type-select"),r=e.querySelector("#rel-target-select"),l=o.value,d=r.value;l&&d&&(this.item.data.relationships.push({type:l,targetId:d}),this.onSave&&this.onSave(this.item),this.renderRelationships()),a.close()}}]}).show();const n=e.querySelector("#rel-type-select"),i=e.querySelector("#rel-target-select");je().forEach(a=>{const o=document.createElement("option");o.value=a.id,o.innerText=`${a.icon} ${a.label}`,n.appendChild(o)}),this.allItems.filter(a=>a.id!==this.item.id).forEach(a=>{const o=G(a.type),r=document.createElement("option");r.value=a.id,r.innerText=`${o.icon} ${a.data.name||"Untitled"}`,i.appendChild(r)})}}const w={id:"library",label:"Library",icon:"📚",entryList:null,entryEditor:null,relationshipManager:null,allItems:[],activeItem:null,render:async(t,e)=>{try{await T.init()}catch(a){t.innerHTML=`<div class="text-muted">Vault Error: ${a.message}</div>`;return}t.innerHTML=`
            <div class="library-layout">
                <div id="lib-sidebar" class="library-sidebar"></div>
                <div id="lib-main" class="library-main">
                    <div id="lib-editor-area"></div>
                    <div id="lib-relationships-area" class="relationships-section" style="display:none;"></div>
                </div>
            </div>
        `;const s=t.querySelector("#lib-sidebar"),n=t.querySelector("#lib-editor-area"),i=t.querySelector("#lib-relationships-area");if(w.allItems=await T.list(),w.entryList=new De(s,{onSelect:a=>w.selectItem(a,n,i),onCreate:()=>w.showCreateModal()}),w.entryList.setItems(w.allItems),w.entryEditor=new Ne(n,{onSave:async a=>{await T.updateItem(a)},onNameChange:a=>{w.entryList.setItems(w.allItems)},onLinkClick:a=>{const o=w.allItems.find(r=>(r.data.name||"").toLowerCase()===a.toLowerCase());o&&w.selectItem(o,n,i)},getEntries:()=>w.allItems}),w.entryEditor.showEmpty(),w.relationshipManager=new Re(i,{onSave:async a=>{await T.updateItem(a)},onNavigate:a=>{w.selectItem(a,n,i)}}),S.session.activeEntryId){const a=w.allItems.find(o=>o.id===S.session.activeEntryId);a&&w.selectItem(a,n,i)}},selectItem(t,e,s){w.activeItem=t,w.entryList.setActiveItem(t.id),w.entryEditor.setItem(t),s.style.display="block",w.relationshipManager.setItem(t,w.allItems),S.updateSession({activeEntryId:t.id})},showCreateModal(){const t=document.createElement("div");t.className="grid-3",K().forEach(s=>{const n=document.createElement("button");n.className="btn btn-secondary",n.style.cssText="flex-direction:column; padding:12px;",n.innerHTML=`<span style="font-size:20px;">${s.icon}</span><span class="text-xs">${s.label}</span>`,n.onclick=async()=>{e.close();const i=await T.addItem(s.id,{name:`New ${s.label}`,description:""});w.allItems.push(i),w.entryList.setItems(w.allItems);const a=document.querySelector("#lib-editor-area"),o=document.querySelector("#lib-relationships-area");w.selectItem(i,a,o)},t.appendChild(n)});const e=new z({title:"Create New Entry",content:t,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:s=>s.close()}]});e.show()}};class Pe{constructor(e,s,n){this.container=e,this.nodeLayer=s,this.svgLayer=n,this.nodes=[],this.links=[],this.transform={x:0,y:0,scale:1},this.isDragging=!1,this.lastMouse={x:0,y:0},this.onDataChange=null}init(){this.container.onmousedown=e=>{(e.button===1||e.button===0&&e.altKey)&&(this.isDragging=!0,this.lastMouse={x:e.clientX,y:e.clientY},this.container.style.cursor="grabbing",e.preventDefault())},window.onmousemove=e=>{if(this.isDragging){const s=e.clientX-this.lastMouse.x,n=e.clientY-this.lastMouse.y;this.transform.x+=s,this.transform.y+=n,this.lastMouse={x:e.clientX,y:e.clientY},this.updateTransform()}},window.onmouseup=e=>{this.isDragging=!1,this.container.style.cursor="default"},this.container.onwheel=e=>{e.preventDefault();const s=e.deltaY>0?.9:1.1;this.transform.scale*=s,this.transform.scale=Math.min(Math.max(.2,this.transform.scale),2),this.updateTransform()}}exportData(){return{nodes:this.nodes,links:this.links,transform:this.transform}}importData(e){e&&(this.nodes=[],this.nodeLayer.innerHTML="",e.transform&&(this.transform=e.transform,this.updateTransform()),e.nodes&&e.nodes.forEach(s=>this.addNode(s,!0)),this.links=e.links||[],this.updateLinks())}notifyChange(){this.onDataChange&&this.onDataChange(this.exportData())}updateTransform(){this.nodeLayer.style.transform=`translate(${this.transform.x}px, ${this.transform.y}px) scale(${this.transform.scale})`,this.updateLinks()}resetView(){this.transform={x:0,y:0,scale:1},this.updateTransform()}addNode(e,s=!1){this.nodes.push(e);const n=this.renderNodeElement(e);this.nodeLayer.appendChild(n),s||this.notifyChange()}renderNodeElement(e){const s=document.createElement("div");s.className="node"+(e.type?` ${e.type}`:""),s.id=e.id,s.style.left=e.x+"px",s.style.top=e.y+"px";let n=(e.inputs||[]).map(b=>`
            <div class="socket-row">
                <div class="socket input" title="${b}"></div>
                <span>${b}</span>
            </div>
        `).join(""),i=(e.outputs||[]).map(b=>`
            <div class="socket-row" style="justify-content: flex-end;">
                <span>${b}</span>
                <div class="socket output" title="${b}"></div>
            </div>
        `).join("");s.innerHTML=`
            <div class="node-header">${e.title}</div>
            <div class="node-body">
                ${n}
                <!-- Body content could go here -->
                ${i}
            </div>
        `;const a=s.querySelector(".node-header");let o=!1,r={x:0,y:0},l={x:e.x,y:e.y};a.onmousedown=b=>{b.button===0&&(o=!0,r={x:b.clientX,y:b.clientY},l={x:e.x,y:e.y},s.classList.add("selected"),b.stopPropagation())};const d=b=>{if(o){const g=(b.clientX-r.x)/this.transform.scale,f=(b.clientY-r.y)/this.transform.scale;e.x=l.x+g,e.y=l.y+f,s.style.left=e.x+"px",s.style.top=e.y+"px",this.updateLinks()}},c=()=>{o&&(o=!1,s.classList.remove("selected"),this.notifyChange())};return window.addEventListener("mousemove",d),window.addEventListener("mouseup",c),s}updateLinks(){if(this.svgLayer.innerHTML="",this.nodes.length>=2){const e=this.nodes[0],s=this.nodes[1],n=(e.x+200)*this.transform.scale+this.transform.x,i=(e.y+40)*this.transform.scale+this.transform.y,a=s.x*this.transform.scale+this.transform.x,o=(s.y+40)*this.transform.scale+this.transform.y,r=document.createElementNS("http://www.w3.org/2000/svg","path"),l=n+50*this.transform.scale,d=a-50*this.transform.scale,c=`M ${n} ${i} C ${l} ${i}, ${d} ${o}, ${a} ${o}`;r.setAttribute("d",c),r.setAttribute("class","connection-line"),this.svgLayer.appendChild(r)}}}const Oe="samildanach_rules",He=1,D="rules";let C=null;const V={init:function(){return new Promise((t,e)=>{if(C){t(C);return}const s=indexedDB.open(Oe,He);s.onerror=n=>{console.error("[RulesDB] Failed to open database:",n.target.error),e(n.target.error)},s.onsuccess=n=>{C=n.target.result,console.log("[RulesDB] Database opened successfully"),t(C)},s.onupgradeneeded=n=>{const i=n.target.result;if(!i.objectStoreNames.contains(D)){const a=i.createObjectStore(D,{keyPath:"id"});a.createIndex("type","type",{unique:!1}),a.createIndex("updatedAt","updatedAt",{unique:!1}),console.log("[RulesDB] Rules store created")}}})},list:function(t={}){return new Promise((e,s)=>{if(!C){s(new Error("RulesDB not initialized"));return}const i=C.transaction(D,"readonly").objectStore(D);let a;t.type?a=i.index("type").openCursor(IDBKeyRange.only(t.type)):a=i.openCursor();const o=[];a.onsuccess=r=>{const l=r.target.result;l?(o.push(l.value),l.continue()):(o.sort((d,c)=>new Date(c.updatedAt).getTime()-new Date(d.updatedAt).getTime()),e(o))},a.onerror=r=>s(r.target.error)})},get:function(t){return new Promise((e,s)=>{if(!C){s(new Error("RulesDB not initialized"));return}const a=C.transaction(D,"readonly").objectStore(D).get(t);a.onsuccess=()=>e(a.result||null),a.onerror=o=>s(o.target.error)})},add:function(t,e){return new Promise((s,n)=>{if(!C){n(new Error("RulesDB not initialized"));return}const i=new Date().toISOString();let a;try{a=B&&B.generateId?B.generateId("rule"):`rule_${crypto.randomUUID().split("-")[0]}`}catch{a="rule_"+Date.now()}const o={id:a,type:t,createdAt:i,updatedAt:i,data:e},d=C.transaction(D,"readwrite").objectStore(D).add(o);d.onsuccess=()=>{console.log("[RulesDB] Added rule:",a),s(o)},d.onerror=c=>{console.error("[RulesDB] Add failed:",c.target.error),n(c.target.error)}})},update:function(t){return new Promise((e,s)=>{if(!C){s(new Error("RulesDB not initialized"));return}t.updatedAt=new Date().toISOString();const a=C.transaction(D,"readwrite").objectStore(D).put(t);a.onsuccess=()=>e(t),a.onerror=o=>s(o.target.error)})},delete:function(t){return new Promise((e,s)=>{if(!C){s(new Error("RulesDB not initialized"));return}const a=C.transaction(D,"readwrite").objectStore(D).delete(t);a.onsuccess=()=>{console.log("[RulesDB] Deleted rule:",t),e()},a.onerror=o=>s(o.target.error)})},exportAll:function(){return this.list()},importAll:function(t){return new Promise(async(e,s)=>{if(!C){s(new Error("RulesDB not initialized"));return}let n=0;for(const i of t)try{const a={...i,id:B.generateId("rule"),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};await this.add(a.type,a.data),n++}catch(a){console.warn("[RulesDB] Import skip:",a)}e(n)})}},$e=[{id:"item",label:"Item",icon:"⚔️",color:"#f59e0b",description:"Weapons, armor, consumables, and equipment",fields:[{key:"type",label:"Type",placeholder:"weapon, armor, consumable, tool..."},{key:"rarity",label:"Rarity",placeholder:"common, uncommon, rare, legendary..."},{key:"damage",label:"Damage/Effect",placeholder:"1d8 slashing, +2 AC..."},{key:"properties",label:"Properties",placeholder:"versatile, finesse, two-handed..."},{key:"value",label:"Value",placeholder:"50 gold, priceless..."},{key:"weight",label:"Weight",placeholder:"3 lbs, light..."}]},{id:"spell",label:"Spell",icon:"✨",color:"#8b5cf6",description:"Magic spells and mystical abilities",fields:[{key:"level",label:"Level",placeholder:"Cantrip, 1st, 2nd..."},{key:"school",label:"School",placeholder:"Evocation, Necromancy..."},{key:"castTime",label:"Cast Time",placeholder:"1 action, bonus action, ritual..."},{key:"range",label:"Range",placeholder:"60 feet, touch, self..."},{key:"duration",label:"Duration",placeholder:"Instantaneous, 1 minute, concentration..."},{key:"damage",label:"Effect/Damage",placeholder:"3d6 fire, heals 2d8+3..."},{key:"components",label:"Components",placeholder:"V, S, M (a bat guano)..."}]},{id:"ability",label:"Ability",icon:"💪",color:"#ef4444",description:"Class features, racial traits, and special abilities",fields:[{key:"source",label:"Source",placeholder:"Fighter 3, Elf racial, feat..."},{key:"usage",label:"Usage",placeholder:"At will, 1/short rest, 3/long rest..."},{key:"action",label:"Action Cost",placeholder:"Action, bonus action, reaction..."},{key:"effect",label:"Effect",placeholder:"Add 1d6 to attack, advantage on saves..."},{key:"prerequisite",label:"Prerequisite",placeholder:"STR 13, proficiency in..."}]},{id:"condition",label:"Condition",icon:"🔥",color:"#06b6d4",description:"Status effects, buffs, debuffs, and environmental conditions",fields:[{key:"type",label:"Type",placeholder:"debuff, buff, environmental..."},{key:"effect",label:"Effect",placeholder:"Disadvantage on attacks, -2 AC..."},{key:"duration",label:"Duration",placeholder:"1 round, until cured, permanent..."},{key:"removal",label:"Removal",placeholder:"Lesser restoration, DC 15 CON save..."},{key:"stacking",label:"Stacking",placeholder:"Does not stack, stacks to 3..."}]},{id:"rule",label:"Rule",icon:"📜",color:"#22c55e",description:"Custom game rules, house rules, and mechanics",fields:[{key:"category",label:"Category",placeholder:"Combat, exploration, social, rest..."},{key:"trigger",label:"Trigger",placeholder:"When attacking, on critical hit..."},{key:"resolution",label:"Resolution",placeholder:"Roll contested Athletics, DC = 10 + CR..."},{key:"consequences",label:"Consequences",placeholder:"On success... On failure..."}]}];function _e(){return $e}function Ie(t){return $e.find(e=>e.id===t)}const ye={event:{id:"event",label:"Event",icon:"⚡",color:"#4ade80",description:'Triggers like "On Combat Start", "On Turn Begin"',templates:[{title:"On Start",outputs:["next"]},{title:"On Turn Begin",outputs:["next"]},{title:"On Attack",inputs:["attacker","target"],outputs:["next"]},{title:"On Damage",inputs:["target","amount"],outputs:["next"]}]},condition:{id:"condition",label:"Condition",icon:"❓",color:"#facc15",description:"If/else branching logic",templates:[{title:"If Greater Than",inputs:["a","b"],outputs:["true","false"]},{title:"If Equal",inputs:["a","b"],outputs:["true","false"]},{title:"If Has Tag",inputs:["target","tag"],outputs:["true","false"]},{title:"Compare Roll",inputs:["roll","dc"],outputs:["success","failure"]}]},action:{id:"action",label:"Action",icon:"🎲",color:"#60a5fa",description:"Roll dice, modify values, apply effects",templates:[{title:"Roll Dice",inputs:["expression"],outputs:["result","next"]},{title:"Add Value",inputs:["a","b"],outputs:["result"]},{title:"Apply Damage",inputs:["target","amount"],outputs:["next"]},{title:"Set Variable",inputs:["name","value"],outputs:["next"]}]},reference:{id:"reference",label:"Library",icon:"📚",color:"#c084fc",description:"Link to Library entries (lore, characters, locations)",templates:[]},rules:{id:"rules",label:"Rules",icon:"📖",color:"#f59e0b",description:"Link to Grimoire entries (items, spells, abilities)",templates:[]}};class Be{constructor(e={}){this.onSelect=e.onSelect||null}async show(){const e=document.createElement("div");e.className="node-picker";const s=document.createElement("div");s.className="library-tabs",s.style.marginBottom="16px";const n=document.createElement("div");n.className="node-picker-panels";const i=async o=>{s.querySelectorAll(".tab").forEach(l=>{l.classList.toggle("active",l.dataset.type===o)}),n.innerHTML="";const r=ye[o];if(o==="reference"){await T.init();const l=await T.list();if(l.length===0){n.innerHTML='<div class="text-muted">No Library entries. Create entries in the Library first.</div>';return}const d=document.createElement("div");d.className="grid-2",d.style.gap="8px",l.forEach(c=>{const b=G(c.type),g=document.createElement("button");g.className="btn btn-secondary",g.style.cssText="justify-content:flex-start; padding:8px 12px; text-align:left;",g.innerHTML=`<span style="margin-right:8px;">${(b==null?void 0:b.icon)||"📄"}</span> ${c.data.name||"Untitled"}`,g.onclick=()=>{this.onSelect&&this.onSelect({type:"reference",title:`📚 ${c.data.name||"Untitled"}`,entryId:c.id,entryType:c.type,inputs:["in"],outputs:["out","data"]}),a.close()},d.appendChild(g)}),n.appendChild(d)}else if(o==="rules"){await V.init();const l=await V.list();if(l.length===0){n.innerHTML='<div class="text-muted">No Grimoire entries. Create rules in the Grimoire first.</div>';return}const d=document.createElement("div");d.className="grid-2",d.style.gap="8px",l.forEach(c=>{const b=Ie(c.type),g=document.createElement("button");g.className="btn btn-secondary",g.style.cssText="justify-content:flex-start; padding:8px 12px; text-align:left;",g.innerHTML=`<span style="margin-right:8px;">${(b==null?void 0:b.icon)||"📖"}</span> ${c.data.name||"Untitled"}`,g.onclick=()=>{this.onSelect&&this.onSelect({type:"rules",title:`📖 ${c.data.name||"Untitled"}`,ruleId:c.id,ruleType:c.type,inputs:["in"],outputs:["out","effect"]}),a.close()},d.appendChild(g)}),n.appendChild(d)}else{const l=document.createElement("div");l.className="grid-2",l.style.gap="8px",r.templates.forEach(d=>{const c=document.createElement("button");c.className="btn btn-secondary",c.style.cssText="justify-content:flex-start; padding:8px 12px;",c.innerHTML=`<span style="margin-right:8px;">${r.icon}</span> ${d.title}`,c.onclick=()=>{this.onSelect&&this.onSelect({type:o,title:d.title,inputs:d.inputs||[],outputs:d.outputs||[]}),a.close()},l.appendChild(c)}),n.appendChild(l)}};Object.values(ye).forEach(o=>{const r=document.createElement("button");r.className="tab",r.dataset.type=o.id,r.innerHTML=`${o.icon} ${o.label}`,r.onclick=()=>i(o.id),s.appendChild(r)}),e.appendChild(s),e.appendChild(n);const a=new z({title:"Add Node",content:e,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:o=>o.close()}]});a.show(),await i("event")}}const ge={id:"architect",label:"Architect",icon:"📐",render:(t,e)=>{t.style.padding="0",t.innerHTML=`
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
        `;const s=t.querySelector("#arch-workspace"),n=t.querySelector("#arch-nodes"),i=t.querySelector("#arch-svg"),a=new Pe(s,n,i);a.init();const o=new Be({onSelect:c=>{a.addNode({id:B.generateId("node"),x:100+Math.random()*100,y:100+Math.random()*100,type:c.type,title:c.title,inputs:c.inputs||[],outputs:c.outputs||[],entryId:c.entryId||null,entryType:c.entryType||null})}});t.querySelector("#btn-add-node").onclick=()=>{o.show()},t.querySelector("#btn-reset-view").onclick=()=>{a.resetView()},t.querySelector("#btn-clear-all").onclick=()=>{confirm("Clear all nodes?")&&(a.nodes=[],a.links=[],n.innerHTML="",i.innerHTML="",a.notifyChange())};const r="samildanach_architect_layout";a.onDataChange=c=>{localStorage.setItem(r,JSON.stringify(c))};const l=localStorage.getItem(r);if(l)try{const c=JSON.parse(l);a.importData(c)}catch(c){console.error("Failed to load architect layout:",c),d()}else d();function d(){a.nodes.length===0&&(a.addNode({id:"start",x:50,y:50,type:"event",title:"On Attack",inputs:["attacker","target"],outputs:["next"]}),a.addNode({id:"d20",x:300,y:100,type:"action",title:"Roll Dice",inputs:["expression"],outputs:["result","next"]}),a.addNode({id:"check",x:550,y:50,type:"condition",title:"Compare Roll",inputs:["roll","dc"],outputs:["success","failure"]}))}}},xe={id:"graph",label:"Graph",icon:"🕸️",render:async(t,e)=>{try{await T.init()}catch(h){t.innerHTML=`<div class="text-muted">Vault Error: ${h.message}</div>`;return}t.style.padding="0",t.innerHTML=`
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
        `;const s=t.querySelector("#graph-container"),n=t.querySelector("#graph-canvas"),i=n.getContext("2d"),a=()=>{n.width=s.clientWidth,n.height=s.clientHeight};a(),window.addEventListener("resize",a);const o=await T.list(),r=o.map((h,x)=>{const v=G(h.type),k=x/o.length*Math.PI*2,E=Math.min(n.width,n.height)*.3;return{id:h.id,item:h,label:h.data.name||"Untitled",icon:v.icon,color:v.color,x:n.width/2+Math.cos(k)*E,y:n.height/2+Math.sin(k)*E,vx:0,vy:0}}),l=Object.fromEntries(r.map(h=>[h.id,h])),d=[];o.forEach(h=>{(h.data.relationships||[]).forEach(x=>{if(l[x.targetId]){const v=te(x.type);d.push({from:h.id,to:x.targetId,label:v.label,color:v.icon})}})});let c={x:0,y:0,scale:1},b=!1,g={x:0,y:0},f=null;const u=()=>{i.clearRect(0,0,n.width,n.height),i.save(),i.translate(c.x,c.y),i.scale(c.scale,c.scale),i.lineWidth=2,d.forEach(h=>{const x=l[h.from],v=l[h.to];x&&v&&(i.strokeStyle="rgba(100, 116, 139, 0.5)",i.beginPath(),i.moveTo(x.x,x.y),i.lineTo(v.x,v.y),i.stroke())}),r.forEach(h=>{i.fillStyle=h.color||"#6366f1",i.beginPath(),i.arc(h.x,h.y,24,0,Math.PI*2),i.fill(),i.font="16px sans-serif",i.textAlign="center",i.textBaseline="middle",i.fillStyle="#fff",i.fillText(h.icon,h.x,h.y),i.font="11px sans-serif",i.fillStyle="var(--text-primary)",i.fillText(h.label,h.x,h.y+36)}),i.restore()},p=()=>{const h=n.width/2,x=n.height/2;r.forEach(v=>{r.forEach(k=>{if(v.id===k.id)return;const E=v.x-k.x,N=v.y-k.y,M=Math.sqrt(E*E+N*N)||1,j=5e3/(M*M);v.vx+=E/M*j,v.vy+=N/M*j}),v.vx+=(h-v.x)*.001,v.vy+=(x-v.y)*.001}),d.forEach(v=>{const k=l[v.from],E=l[v.to];if(k&&E){const N=E.x-k.x,M=E.y-k.y,j=Math.sqrt(N*N+M*M)||1,F=(j-150)*.01;k.vx+=N/j*F,k.vy+=M/j*F,E.vx-=N/j*F,E.vy-=M/j*F}}),r.forEach(v=>{f!==v&&(v.x+=v.vx*.1,v.y+=v.vy*.1),v.vx*=.9,v.vy*=.9}),u(),requestAnimationFrame(p)};p();const m=h=>({x:(h.offsetX-c.x)/c.scale,y:(h.offsetY-c.y)/c.scale}),y=(h,x)=>r.find(v=>{const k=v.x-h,E=v.y-x;return Math.sqrt(k*k+E*E)<24});n.onmousedown=h=>{const x=m(h),v=y(x.x,x.y);v?f=v:(b=!0,g={x:h.clientX,y:h.clientY})},n.onmousemove=h=>{if(f){const x=m(h);f.x=x.x,f.y=x.y}else b&&(c.x+=h.clientX-g.x,c.y+=h.clientY-g.y,g={x:h.clientX,y:h.clientY})},n.onmouseup=()=>{f=null,b=!1},n.onwheel=h=>{h.preventDefault();const x=h.deltaY>0?.9:1.1;c.scale*=x,c.scale=Math.min(Math.max(.3,c.scale),3)},t.querySelector("#graph-reset").onclick=()=>{c={x:0,y:0,scale:1}},t.querySelector("#graph-relayout").onclick=()=>{r.forEach((h,x)=>{const v=x/r.length*Math.PI*2,k=Math.min(n.width,n.height)*.3;h.x=n.width/2+Math.cos(v)*k,h.y=n.height/2+Math.sin(v)*k,h.vx=0,h.vy=0})}}},O={async toJSON(){await T.init();const t=await T.list();return{meta:{...S.project},entries:t,exportedAt:new Date().toISOString(),version:"1.0",format:"samildanach-json"}},async toMarkdown(t={}){var a;const{includeRelationships:e=!0}=t;await T.init();const s=await T.list();let n="";n+=`# ${S.project.title||"Untitled Setting"}

`,S.project.author&&(n+=`**Author:** ${S.project.author}

`),S.project.version&&(n+=`**Version:** ${S.project.version}

`),S.project.genre&&(n+=`**Genre:** ${S.project.genre}

`),S.project.system&&(n+=`**System:** ${S.project.system}

`),S.project.description&&(n+=`---

${S.project.description}

`),n+=`---

`;const i=K();for(const o of i){const r=s.filter(l=>l.type===o.id);if(r.length!==0){n+=`## ${o.icon} ${o.label}s

`;for(const l of r){n+=`### ${l.data.name||"Untitled"}

`;for(const d of o.fields){const c=l.data[d.key];c&&(n+=`**${d.label}:** ${c}

`)}if(l.data.description){const d=this._stripHtml(l.data.description);n+=`${d}

`}if(e&&((a=l.data.relationships)==null?void 0:a.length)>0){n+=`**Relationships:**
`;for(const d of l.data.relationships){const c=te(d.type),b=s.find(f=>f.id===d.targetId),g=(b==null?void 0:b.data.name)||"(Unknown)";n+=`- ${c.icon} ${c.label}: ${g}
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
    <title>${S.project.title||"Samildánach Export"}</title>
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
</html>`},async printToPDF(){const t=await this.toHTML(),e=window.open("","_blank");e.document.write(t),e.document.close(),e.focus(),setTimeout(()=>e.print(),250)},download(t,e,s="text/plain"){const n=new Blob([t],{type:s}),i=URL.createObjectURL(n),a=document.createElement("a");a.href=i,a.download=e,a.click(),URL.revokeObjectURL(i)},_stripHtml(t){const e=document.createElement("div");return e.innerHTML=t,e.querySelectorAll(".wiki-link").forEach(s=>{s.replaceWith(s.dataset.link||s.textContent)}),e.textContent||e.innerText||""}},Se={id:"export",label:"Export",icon:"📤",render:(t,e)=>{t.innerHTML=`
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
        `;let s="json";const n=t.querySelector("#export-preview"),i=t.querySelector("#btn-export"),a=t.querySelectorAll(".format-btn");a.forEach(l=>{l.onclick=async()=>{a.forEach(d=>d.classList.remove("active")),l.classList.add("active"),s=l.dataset.format,await o()}});async function o(){n.innerHTML='<div class="preview-loading">Generating preview...</div>';try{let l="";switch(s){case"json":const d=await O.toJSON();l=`<pre class="preview-code">${JSON.stringify(d,null,2).substring(0,2e3)}${JSON.stringify(d,null,2).length>2e3?`
...`:""}</pre>`;break;case"markdown":const c=await O.toMarkdown();l=`<pre class="preview-code">${r(c.substring(0,2e3))}${c.length>2e3?`
...`:""}</pre>`;break;case"html":l=`<div class="preview-note">Full HTML document will be downloaded.</div><pre class="preview-code">${r((await O.toHTML()).substring(0,1500))}...</pre>`;break;case"pdf":l=`<div class="preview-note">PDF will open in a print dialog.<br>Use "Save as PDF" in your browser's print options.</div>`;break}n.innerHTML=l}catch(l){n.innerHTML=`<div class="preview-error">Error: ${l.message}</div>`}}i.onclick=async()=>{i.disabled=!0,i.innerText="Exporting...";try{const l=(S.project.title||"samildanach").toLowerCase().replace(/\s+/g,"-");switch(s){case"json":const d=await O.toJSON();O.download(JSON.stringify(d,null,2),`${l}.json`,"application/json");break;case"markdown":const c=await O.toMarkdown();O.download(c,`${l}.md`,"text/markdown");break;case"html":const b=await O.toHTML();O.download(b,`${l}.html`,"text/html");break;case"pdf":await O.printToPDF();break}}catch(l){alert("Export failed: "+l.message)}i.disabled=!1,i.innerText="Download"},o();function r(l){const d=document.createElement("div");return d.textContent=l,d.innerHTML}}},re="samildanach_llm_configs",W="samildanach_active_config_id",R={getConfigs(){return JSON.parse(localStorage.getItem(re)||"[]")},saveConfig(t){const e=this.getConfigs(),s=e.findIndex(n=>n.id===t.id);s>=0?e[s]=t:e.push(t),localStorage.setItem(re,JSON.stringify(e))},deleteConfig(t){const e=this.getConfigs().filter(s=>s.id!==t);localStorage.setItem(re,JSON.stringify(e)),localStorage.getItem(W)===t&&localStorage.removeItem(W)},getActiveConfig(){const t=this.getConfigs(),e=localStorage.getItem(W);return t.find(s=>s.id===e)||t[0]||null},setActiveConfig(t){localStorage.setItem(W,t)},async generate(t,e,s={}){var d,c,b,g,f,u,p,m,y,h,x,v,k,E,N,M,j,F;const i={...this.getActiveConfig()||{},...s},a=i.provider||"gemini",o=i.model||"gemini-1.5-flash",r=i.apiKey||"",l=i.maxTokens||4096;if(!r&&a!=="kobold")throw new Error(`Missing API Key for ${a}. Please configure in Settings.`);if(a==="gemini"){const H=`https://generativelanguage.googleapis.com/v1beta/models/${o}:generateContent?key=${r}`,L={contents:e.map(A=>({role:A.role==="user"?"user":"model",parts:[{text:A.content}]})),generationConfig:{temperature:.9,maxOutputTokens:l}};t&&(L.systemInstruction={parts:[{text:t}]});const $=await fetch(H,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(L)});if(!$.ok){const A=await $.json();throw new Error(((d=A.error)==null?void 0:d.message)||$.statusText)}return((u=(f=(g=(b=(c=(await $.json()).candidates)==null?void 0:c[0])==null?void 0:b.content)==null?void 0:g.parts)==null?void 0:f[0])==null?void 0:u.text)||"(No response)"}if(["openai","openrouter","chutes","custom"].includes(a)){let H="https://api.openai.com/v1/chat/completions";a==="openrouter"&&(H="https://openrouter.ai/api/v1/chat/completions"),a==="chutes"&&(H="https://llm.chutes.ai/v1/chat/completions"),a==="custom"&&(H=`${(i.baseUrl||"https://api.example.com/v1").replace(/\/$/,"")}/chat/completions`);const Y=[{role:"system",content:t},...e.map(_=>({role:_.role==="model"?"assistant":_.role,content:_.content}))],L={"Content-Type":"application/json",Authorization:`Bearer ${r}`};a==="openrouter"&&(L["HTTP-Referer"]="https://samildanach.app",L["X-Title"]="Samildánach");let $=l,P=0;const A=1;for(;P<=A;){const _=await fetch(H,{method:"POST",headers:L,body:JSON.stringify({model:o,messages:Y,temperature:.9,max_tokens:$})});if(!_.ok){const he=((p=(await _.json()).error)==null?void 0:p.message)||_.statusText,ne=he.match(/maximum context length is (\d+) tokens.*requested about (\d+) tokens.*\((\d+) in the messages/);if(ne&&P<A){const Le=parseInt(ne[1]),Me=parseInt(ne[3]),ie=Le-Me-200;if(ie>0){console.warn(`[LLM] Context limit exceeded. Auto-scaling max_tokens from ${$} to ${ie}.`),$=ie,P++;continue}}throw new Error(he)}const ue=await _.json();let se=((h=(y=(m=ue.choices)==null?void 0:m[0])==null?void 0:y.message)==null?void 0:h.content)||"";const me=(k=(v=(x=ue.choices)==null?void 0:x[0])==null?void 0:v.message)==null?void 0:k.reasoning_content;return me&&(se=`<think>${me}</think>
${se}`),se||"(No response)"}}if(a==="anthropic"){const H="https://api.anthropic.com/v1/messages",Y=e.map(P=>({role:P.role==="model"?"assistant":"user",content:P.content})),L=await fetch(H,{method:"POST",headers:{"x-api-key":r,"anthropic-version":"2023-06-01","content-type":"application/json","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:o,max_tokens:l,system:t,messages:Y,temperature:.9})});if(!L.ok){const P=await L.json();throw new Error(((E=P.error)==null?void 0:E.message)||L.statusText)}return((M=(N=(await L.json()).content)==null?void 0:N[0])==null?void 0:M.text)||"(No response)"}if(a==="kobold"){const Y=`${(i.baseUrl||"http://localhost:5001").replace(/\/$/,"")}/api/v1/generate`,L=`${t}

${e.map(A=>`${A.role==="user"?"User":"Assistant"}: ${A.content}`).join(`
`)}`,$=await fetch(Y,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:L,max_context_length:4096,max_length:l>2048?2048:l,temperature:.9})});if(!$.ok){const A=await $.text();throw new Error(`Kobold Error: ${A||$.statusText}`)}return((F=(j=(await $.json()).results)==null?void 0:j[0])==null?void 0:F.text)||"(No response)"}throw new Error(`Unknown provider: ${a}`)},async testConfig(t){try{return await this.generate("You are a test assistant.",[{role:"user",content:'Say "Hello" in one word.'}],t),!0}catch(e){throw e}}},le=[{id:"gemini",label:"Google Gemini",models:["gemini-1.5-flash","gemini-1.5-pro","gemini-2.0-flash"]},{id:"openai",label:"OpenAI",models:["gpt-4o","gpt-4o-mini","gpt-4-turbo","gpt-3.5-turbo"]},{id:"openrouter",label:"OpenRouter",models:["anthropic/claude-3.5-sonnet","google/gemini-pro-1.5","meta-llama/llama-3.1-405b-instruct"]},{id:"anthropic",label:"Anthropic",models:["claude-3-5-sonnet-20241022","claude-3-opus-20240229","claude-3-haiku-20240307"]},{id:"chutes",label:"Chutes AI",models:["deepseek-ai/DeepSeek-V3","deepseek-ai/DeepSeek-R1"]},{id:"kobold",label:"Kobold AI (Local)",models:["local"],baseUrl:"http://localhost:5001"},{id:"custom",label:"Custom Endpoint",models:["custom"]}],we="samildanach_scribe_state",ke=[{id:"brainstorm",label:"💡 Brainstorm",desc:"Generate ideas and explore concepts"},{id:"expand",label:"📝 Expand",desc:"Develop and detail existing entries"},{id:"critique",label:"🔍 Critique",desc:"Get feedback and suggestions"}],Ee={brainstorm:[{label:"Character concept",prompt:"Help me brainstorm a character who..."},{label:"Location idea",prompt:"I need a unique location for..."},{label:"Faction conflict",prompt:"Create tension between factions by..."},{label:"Plot hook",prompt:"Generate a compelling plot hook involving..."}],expand:[{label:"Add history",prompt:"Expand the backstory and history of..."},{label:"Describe appearance",prompt:"Describe in vivid detail how this looks:"},{label:"Add relationships",prompt:"How might this connect to other elements in my world?"},{label:"Cultural details",prompt:"What customs, traditions, or beliefs would exist here?"}],critique:[{label:"Check consistency",prompt:"Review this for internal consistency:"},{label:"Strengthen concept",prompt:"How can I make this more unique or compelling?"},{label:"Find gaps",prompt:"What questions or gaps exist in this concept?"},{label:"Balance check",prompt:"Is this balanced for gameplay? What adjustments?"}]},pe={id:"scribe",label:"Scribe",icon:"✍️",render:async t=>{let e=JSON.parse(localStorage.getItem(we)||"{}");e.mode||(e.mode="brainstorm"),e.history||(e.history=[]),e.selectedEntries||(e.selectedEntries=[]),e.sessions||(e.sessions={});const s=()=>localStorage.setItem(we,JSON.stringify(e));await T.init();const n=await T.list(),i=K();t.innerHTML=`
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
                            ${ke.map(u=>`
                                <button class="mode-btn ${e.mode===u.id?"active":""}" data-mode="${u.id}" title="${u.desc}">
                                    ${u.label}
                                </button>
                            `).join("")}
                        </div>
                    </div>

                    <!-- Library Context -->
                    <div class="sidebar-section flex-1">
                        <div class="section-label">Library Context</div>
                        <div class="entry-list">
                            ${i.map(u=>{const p=n.filter(m=>m.type===u.id);return p.length===0?"":`
                                    <div class="entry-category">
                                        <div class="category-label">${u.icon} ${u.label}</div>
                                        ${p.map(m=>`
                                            <label class="entry-checkbox">
                                                <input type="checkbox" 
                                                    value="${m.id}" 
                                                    ${e.selectedEntries.includes(m.id)?"checked":""}>
                                                <span>${m.data.name||"Untitled"}</span>
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
                            ${Object.keys(e.sessions).map(u=>`<option value="${u}">${u}</option>`).join("")}
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
        `;const a=t.querySelector("#chat-log"),o=t.querySelector("#chat-input"),r=t.querySelector("#btn-send"),l=t.querySelector("#template-select"),d=t.querySelector("#session-select");function c(){const u=Ee[e.mode]||[];l.innerHTML='<option value="">📝 Templates...</option>'+u.map((p,m)=>`<option value="${m}">${p.label}</option>`).join("")}c(),l.onchange=()=>{const u=parseInt(l.value);if(!isNaN(u)){const p=Ee[e.mode]||[];p[u]&&(o.value=p[u].prompt,o.focus())}l.value=""},t.querySelectorAll(".mode-btn").forEach(u=>{u.onclick=()=>{e.mode=u.dataset.mode,t.querySelectorAll(".mode-btn").forEach(p=>p.classList.remove("active")),u.classList.add("active"),c(),s()}}),t.querySelectorAll(".entry-checkbox input").forEach(u=>{u.onchange=()=>{const p=u.value;u.checked?e.selectedEntries.includes(p)||e.selectedEntries.push(p):e.selectedEntries=e.selectedEntries.filter(m=>m!==p),s()}});function b(){if(e.history.length===0){a.innerHTML=`
                    <div class="chat-empty">
                        <div class="empty-icon">✍️</div>
                        <div class="empty-title">The Scribe</div>
                        <div class="empty-hint">Your AI world-building assistant. Select Library entries for context, then ask for help.</div>
                    </div>
                `;return}a.innerHTML=e.history.map(u=>`
                <div class="chat-bubble ${u.role}">
                    <div class="bubble-content">${u.content.replace(/\n/g,"<br>")}</div>
                    <div class="bubble-meta">
                        <span>${u.role==="user"?"You":"✍️ Scribe"}</span>
                        <button class="btn-copy" data-content="${encodeURIComponent(u.content)}" title="Copy">📋</button>
                    </div>
                </div>
            `).join(""),a.querySelectorAll(".btn-copy").forEach(u=>{u.onclick=()=>{navigator.clipboard.writeText(decodeURIComponent(u.dataset.content))}}),a.scrollTop=a.scrollHeight}b();function g(){ke.find(p=>p.id===e.mode);let u="You are The Scribe, an expert world-building assistant for tabletop RPG settings. ";if(e.mode==="brainstorm"?u+="Help the user generate creative ideas, explore concepts, and brainstorm possibilities. Be imaginative and offer multiple options.":e.mode==="expand"?u+="Help the user develop and expand existing ideas with rich detail. Add depth, history, and connections.":e.mode==="critique"&&(u+="Provide constructive feedback on the user's ideas. Identify strengths, weaknesses, inconsistencies, and suggest improvements."),e.selectedEntries.length>0){const p=e.selectedEntries.map(m=>n.find(y=>y.id===m)).filter(Boolean);p.length>0&&(u+=`

[WORLD CONTEXT - The user has selected these entries from their world Bible:]
`,p.forEach(m=>{const y=i.find(h=>h.id===m.type);if(u+=`
[${(y==null?void 0:y.label)||m.type}] ${m.data.name||"Untitled"}`,m.data.description){const h=m.data.description.replace(/<[^>]+>/g,"").substring(0,300);u+=`: ${h}`}y!=null&&y.fields&&y.fields.forEach(h=>{m.data[h.key]&&(u+=` | ${h.label}: ${m.data[h.key]}`)}),m.data.relationships&&m.data.relationships.length>0&&(u+=`
  Relationships:`,m.data.relationships.forEach(h=>{const x=n.find(E=>E.id===h.targetId),v=(x==null?void 0:x.data.name)||"(Unknown)",k=h.type||"related to";u+=`
    - ${k}: ${v}`,h.notes&&(u+=` (${h.notes})`)}))}),u+=`
[END CONTEXT]`)}return u}async function f(){const u=o.value.trim();if(!u)return;const p={id:Q(),role:"user",content:u,timestamp:new Date().toISOString()};e.history.push(p),o.value="",b(),s(),r.disabled=!0,r.textContent="Thinking...";try{if(!R.getActiveConfig())throw new Error("No API configuration. Go to Settings to add one.");const y=g(),x=e.history.map(E=>({role:E.role==="user"?"user":"model",content:E.content})).slice(-20),v=await R.generate(y,x),k={id:Q(),role:"model",content:v,timestamp:new Date().toISOString()};e.history.push(k),s(),b()}catch(m){console.error("[Scribe]",m),e.history.push({id:Q(),role:"model",content:`[Error: ${m.message}]`,timestamp:new Date().toISOString()}),b()}finally{r.disabled=!1,r.textContent="Send"}}r.onclick=f,o.onkeydown=u=>{u.key==="Enter"&&!u.shiftKey&&(u.preventDefault(),f())},t.querySelector("#btn-clear").onclick=()=>{confirm("Clear all messages?")&&(e.history=[],s(),b())},t.querySelector("#btn-save-session").onclick=()=>{const u=prompt("Session name:",`Session ${Object.keys(e.sessions).length+1}`);u&&(e.sessions[u]={history:[...e.history],mode:e.mode,selectedEntries:[...e.selectedEntries],savedAt:new Date().toISOString()},s(),d.innerHTML='<option value="">-- Sessions --</option>'+Object.keys(e.sessions).map(p=>`<option value="${p}">${p}</option>`).join(""))},t.querySelector("#btn-load-session").onclick=()=>{const u=d.value;if(!u||!e.sessions[u])return;const p=e.sessions[u];e.history=[...p.history],e.mode=p.mode,e.selectedEntries=[...p.selectedEntries],s(),pe.render(t)}}},X={id:"settings",label:"Settings",icon:"⚙️",render:(t,e)=>{const s=R.getConfigs(),n=R.getActiveConfig();t.innerHTML=`
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
                            `:s.map(p=>{var m;return`
                                <div class="config-card ${p.id===(n==null?void 0:n.id)?"active":""}" data-id="${p.id}">
                                    <div class="config-info">
                                        <div class="config-name">${p.name||"Unnamed"}</div>
                                        <div class="config-provider">${((m=le.find(y=>y.id===p.provider))==null?void 0:m.label)||p.provider} • ${p.model}</div>
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
                                    ${le.map(p=>`<option value="${p.id}">${p.label}</option>`).join("")}
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
        `;const i=t.querySelector("#configs-list"),a=t.querySelector("#config-editor"),o=t.querySelector("#cfg-provider"),r=t.querySelector("#cfg-model"),l=t.querySelector("#field-baseurl"),d=t.querySelector("#field-apikey"),c=t.querySelector("#test-result");let b=null;function g(){const p=o.value,m=le.find(y=>y.id===p);r.innerHTML=m.models.map(y=>`<option value="${y}">${y}</option>`).join(""),l.style.display=["kobold","custom"].includes(p)?"block":"none",d.style.display=p==="kobold"?"none":"block"}o.onchange=g,g();function f(p=null){var m;b=(p==null?void 0:p.id)||null,t.querySelector("#cfg-name").value=(p==null?void 0:p.name)||"",o.value=(p==null?void 0:p.provider)||"gemini",g(),r.value=(p==null?void 0:p.model)||((m=r.options[0])==null?void 0:m.value)||"",t.querySelector("#cfg-apikey").value=(p==null?void 0:p.apiKey)||"",t.querySelector("#cfg-baseurl").value=(p==null?void 0:p.baseUrl)||"",c.innerHTML="",a.style.display="flex"}function u(){a.style.display="none",b=null}t.querySelector("#btn-add-config").onclick=()=>f(),t.querySelector("#btn-cancel-config").onclick=u,t.querySelector("#btn-save-config").onclick=()=>{const p={id:b||Q(),name:t.querySelector("#cfg-name").value||"Unnamed",provider:o.value,model:r.value,apiKey:t.querySelector("#cfg-apikey").value,baseUrl:t.querySelector("#cfg-baseurl").value};R.saveConfig(p),R.getConfigs().length===1&&R.setActiveConfig(p.id),u(),X.render(t,e)},t.querySelector("#btn-test-config").onclick=async()=>{const p=t.querySelector("#btn-test-config");p.disabled=!0,p.textContent="Testing...",c.innerHTML='<span class="test-pending">Connecting...</span>';const m={provider:o.value,model:r.value,apiKey:t.querySelector("#cfg-apikey").value,baseUrl:t.querySelector("#cfg-baseurl").value};try{await R.testConfig(m),c.innerHTML='<span class="test-success">✓ Connection successful!</span>'}catch(y){c.innerHTML=`<span class="test-error">✗ ${y.message}</span>`}p.disabled=!1,p.textContent="Test Connection"},i.querySelectorAll(".config-card").forEach(p=>{const m=p.dataset.id;p.querySelector(".btn-activate").onclick=()=>{R.setActiveConfig(m),X.render(t,e)},p.querySelector(".btn-edit").onclick=()=>{const y=R.getConfigs().find(h=>h.id===m);f(y)},p.querySelector(".btn-delete").onclick=()=>{confirm("Delete this configuration?")&&(R.deleteConfig(m),X.render(t,e))}})}},Te={id:"grimoire",label:"Grimoire",icon:"📖",render:async t=>{var r;await V.init();const e=await V.list(),s=_e();let n=((r=s[0])==null?void 0:r.id)||"item",i=null,a=null;function o(){var c,b,g;const l=e.filter(f=>f.type===n),d=Ie(n);if(t.innerHTML=`
                <div class="grimoire-layout">
                    <!-- Left: Categories + List -->
                    <div class="grimoire-sidebar">
                        <div class="sidebar-header">
                            <strong>📖 Grimoire</strong>
                        </div>

                        <!-- Category Tabs -->
                        <div class="category-tabs">
                            ${s.map(f=>`
                                <button class="cat-tab ${f.id===n?"active":""}" 
                                        data-cat="${f.id}" 
                                        style="--cat-color: ${f.color}"
                                        title="${f.description}">
                                    ${f.icon}
                                </button>
                            `).join("")}
                        </div>

                        <!-- Rule List -->
                        <div class="rule-list">
                            ${l.length===0?`
                                <div class="empty-state">
                                    <div class="empty-icon">${(d==null?void 0:d.icon)||"📖"}</div>
                                    <div class="empty-text">No ${(d==null?void 0:d.label)||"rules"} yet</div>
                                </div>
                            `:l.map(f=>`
                                <div class="rule-item ${(i==null?void 0:i.id)===f.id?"selected":""}" data-id="${f.id}">
                                    <div class="rule-icon" style="color: ${d==null?void 0:d.color}">${d==null?void 0:d.icon}</div>
                                    <div class="rule-info">
                                        <div class="rule-name">${f.data.name||"Untitled"}</div>
                                        <div class="rule-meta">${f.data.type||f.data.level||""}</div>
                                    </div>
                                </div>
                            `).join("")}
                        </div>

                        <div class="sidebar-footer">
                            <button id="btn-add-rule" class="btn btn-primary btn-sm">+ Add ${(d==null?void 0:d.label)||"Rule"}</button>
                        </div>
                    </div>

                    <!-- Right: Editor -->
                    <div class="grimoire-main">
                        ${i?`
                            <div class="rule-editor">
                                <div class="editor-header">
                                    <input type="text" id="rule-name" class="input input-lg" 
                                           value="${i.data.name||""}" 
                                           placeholder="${(d==null?void 0:d.label)||"Rule"} Name">
                                    <button id="btn-delete-rule" class="btn btn-ghost btn-sm" title="Delete">🗑️</button>
                                </div>

                                <div class="editor-fields">
                                    ${((d==null?void 0:d.fields)||[]).map(f=>`
                                        <div class="field-group">
                                            <label class="field-label">${f.label}</label>
                                            <input type="text" 
                                                   class="input field-input" 
                                                   data-field="${f.key}"
                                                   value="${i.data[f.key]||""}"
                                                   placeholder="${f.placeholder||""}">
                                        </div>
                                    `).join("")}
                                </div>

                                <div class="editor-description">
                                    <label class="field-label">Description</label>
                                    <div id="description-editor"></div>
                                </div>

                                <div class="editor-footer">
                                    <button id="btn-save-rule" class="btn btn-primary">Save</button>
                                </div>
                            </div>
                        `:`
                            <div class="editor-empty">
                                <div class="empty-icon">📖</div>
                                <div class="empty-text">Select or create a ${(d==null?void 0:d.label)||"rule"}</div>
                            </div>
                        `}
                    </div>
                </div>
            `,t.querySelectorAll(".cat-tab").forEach(f=>{f.onclick=()=>{n=f.dataset.cat,i=null,o()}}),t.querySelectorAll(".rule-item").forEach(f=>{f.onclick=()=>{const u=f.dataset.id;i=e.find(p=>p.id===u),o()}}),(c=t.querySelector("#btn-add-rule"))==null||c.addEventListener("click",async()=>{const f=await V.add(n,{name:`New ${(d==null?void 0:d.label)||"Rule"}`,description:""});e.push(f),i=f,o()}),(b=t.querySelector("#btn-delete-rule"))==null||b.addEventListener("click",async()=>{if(!i||!confirm(`Delete "${i.data.name||"this rule"}"?`))return;await V.delete(i.id);const f=e.findIndex(u=>u.id===i.id);f>=0&&e.splice(f,1),i=null,o()}),(g=t.querySelector("#btn-save-rule"))==null||g.addEventListener("click",async()=>{var m;if(!i)return;const u={name:((m=t.querySelector("#rule-name"))==null?void 0:m.value)||""};t.querySelectorAll(".field-input").forEach(y=>{u[y.dataset.field]=y.value}),a&&(u.description=a.getValue()),i.data=u,await V.update(i);const p=e.findIndex(y=>y.id===i.id);p>=0&&(e[p]=i),o()}),i){const f=t.querySelector("#description-editor");f&&(a=new Ce(f,i.data.description||""),a.render())}}o()}};async function Ue(){console.log(`%c Samildánach v${S.project.version} `,"background: #222; color: #bada55"),q.registerPanel(ae.id,ae),q.registerPanel(w.id,w),q.registerPanel(xe.id,xe),q.registerPanel(ge.id,ge),q.registerPanel(ve.id,ve),q.registerPanel(Se.id,Se),q.registerPanel(pe.id,pe),q.registerPanel(X.id,X),q.registerPanel(Te.id,Te),q.init(),q.activePanelId||q.switchPanel(ae.id)}window.addEventListener("DOMContentLoaded",Ue);
