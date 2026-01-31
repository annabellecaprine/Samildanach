(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function t(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(n){if(n.ep)return;n.ep=!0;const a=t(n);fetch(n.href,a)}})();const U="samildanach_state",f={project:{title:"Untitled Setting",author:"",version:"1.0.0",description:"",genre:"",system:""},session:{activePanel:null,activeEntryId:null},cache:{},_subscribers:[],init(){const s=localStorage.getItem(U);if(s)try{const e=JSON.parse(s);e.project&&Object.assign(this.project,e.project),e.session&&Object.assign(this.session,e.session)}catch(e){console.warn("Failed to restore state:",e)}},save(){const s={project:this.project,session:this.session};localStorage.setItem(U,JSON.stringify(s))},updateProject(s){Object.assign(this.project,s),this.save(),this._notify("project",this.project)},updateSession(s){Object.assign(this.session,s),this.save(),this._notify("session",this.session)},subscribe(s,e){const t={key:s,callback:e};return this._subscribers.push(t),()=>{const i=this._subscribers.indexOf(t);i>=0&&this._subscribers.splice(i,1)}},_notify(s,e){this._subscribers.filter(t=>t.key===s).forEach(t=>t.callback(e))},exportState(){return{project:{...this.project},session:{...this.session}}},importState(s){s.project&&Object.assign(this.project,s.project),s.session&&Object.assign(this.session,s.session),this.save(),this._notify("project",this.project),this._notify("session",this.session)}},T={panels:{},activePanelId:null,init:function(){f.init(),this.renderSidebar(),this.bindEvents();const s=localStorage.getItem("theme")||"dark";document.documentElement.setAttribute("data-theme",s),f.session.activePanel&&this.panels[f.session.activePanel]&&this.switchPanel(f.session.activePanel)},registerPanel:function(s,e){this.panels[s]=e,this.renderSidebar()},switchPanel:function(s){if(!this.panels[s])return;this.activePanelId=s,f.updateSession({activePanel:s}),document.querySelectorAll(".nav-item").forEach(i=>{i.classList.toggle("active",i.dataset.id===s)});const e=document.getElementById("main-view");e.innerHTML="";const t=document.createElement("div");t.className="panel-container",this.panels[s].render(t,f),e.appendChild(t)},renderSidebar:function(){const s=document.getElementById("nav-list");s&&(s.innerHTML="",Object.keys(this.panels).forEach(e=>{const t=this.panels[e],i=document.createElement("div");i.className="nav-item",i.innerHTML=t.icon||"📦",i.title=t.label||e,i.dataset.id=e,i.onclick=()=>this.switchPanel(e),e===this.activePanelId&&i.classList.add("active"),s.appendChild(i)}))},bindEvents:function(){const s=document.getElementById("theme-toggle");s&&(s.onclick=()=>{const e=document.documentElement,i=e.getAttribute("data-theme")==="dark"?"light":"dark";e.setAttribute("data-theme",i),localStorage.setItem("theme",i)})}},j={generateId:(s="id")=>typeof crypto<"u"&&crypto.randomUUID?`${s}_${crypto.randomUUID().split("-")[0]}`:`${s}_${Math.random().toString(36).substring(2,9)}`,escapeHtml:s=>{const e=document.createElement("div");return e.textContent=s,e.innerHTML},debounce:(s,e=300)=>{let t;return(...i)=>{clearTimeout(t),t=setTimeout(()=>s(...i),e)}},deepClone:s=>JSON.parse(JSON.stringify(s)),formatDate:s=>{const e=new Date(s);return e.toLocaleDateString()+" "+e.toLocaleTimeString()},truncate:(s,e=50)=>!s||s.length<=e?s:s.substring(0,e-3)+"..."},K="samildanach_vault",W=1,C="items",$="registry",q="vault_registry";let x=null;function Y(){return{id:q,lastUpdatedAt:new Date().toISOString(),universes:[],allTags:[],blocks:{},itemCounts:{actor:0,lorebook:0,script:0,location:0,event:0,pair:0}}}const w={init:function(){return new Promise((s,e)=>{if(x){s(x);return}const t=indexedDB.open(K,W);t.onerror=i=>{console.error("[VaultDB] Failed to open database:",i.target.error),e(i.target.error)},t.onsuccess=i=>{x=i.target.result,console.log("[VaultDB] Database opened successfully"),s(x)},t.onupgradeneeded=i=>{const n=i.target.result;if(!n.objectStoreNames.contains(C)){const a=n.createObjectStore(C,{keyPath:"id"});a.createIndex("type","type",{unique:!1}),a.createIndex("universe","universe",{unique:!1}),a.createIndex("updatedAt","updatedAt",{unique:!1}),console.log("[VaultDB] Items store created")}n.objectStoreNames.contains($)||(n.createObjectStore($,{keyPath:"id"}),console.log("[VaultDB] Registry store created"))}})},getRegistry:function(){return new Promise((s,e)=>{if(!x){e(new Error("VaultDB not initialized"));return}const n=x.transaction($,"readonly").objectStore($).get(q);n.onsuccess=()=>{n.result?s(n.result):w.updateRegistry(Y()).then(s).catch(e)},n.onerror=a=>e(a.target.error)})},updateRegistry:function(s){return new Promise((e,t)=>{if(!x){t(new Error("VaultDB not initialized"));return}const n=x.transaction($,"readwrite").objectStore($),a=n.get(q);a.onsuccess=()=>{const o={...a.result||Y(),...s,id:q,lastUpdatedAt:new Date().toISOString()},c=n.put(o);c.onsuccess=()=>e(o),c.onerror=h=>t(h.target.error)},a.onerror=r=>t(r.target.error)})},list:function(s={}){return new Promise((e,t)=>{if(!x){t(new Error("VaultDB not initialized"));return}const n=x.transaction(C,"readonly").objectStore(C);let a;s.type?a=n.index("type").openCursor(IDBKeyRange.only(s.type)):s.universe?a=n.index("universe").openCursor(IDBKeyRange.only(s.universe)):a=n.openCursor();const r=[];a.onsuccess=o=>{const c=o.target.result;if(c){const h=c.value;let l=!0;s.type&&h.type!==s.type&&(l=!1),s.universe&&h.universe!==s.universe&&(l=!1),s.tags&&s.tags.length>0&&(s.tags.every(b=>{var S;return(S=h.tags)==null?void 0:S.includes(b)})||(l=!1)),l&&r.push(h),c.continue()}else r.sort((h,l)=>new Date(l.updatedAt).getTime()-new Date(h.updatedAt).getTime()),e(r)},a.onerror=o=>t(o.target.error)})},addItem:function(s,e,t={}){return new Promise((i,n)=>{if(!x){console.error("[VaultDB]AddItem: DB not initialized"),n(new Error("VaultDB not initialized"));return}const a=new Date().toISOString();let r;try{r=j&&j.generateId?j.generateId("vault"):`vault_${crypto.randomUUID()}`}catch(p){console.error("[VaultDB] ID Gen Failed:",p),r="vault_"+Date.now()}const o={id:r,type:s,version:1,universe:t.universe||"",tags:t.tags||[],createdAt:a,updatedAt:a,data:e};console.log("[VaultDB] Adding Item:",o);const l=x.transaction(C,"readwrite").objectStore(C).add(o);l.onsuccess=()=>{console.log("[VaultDB] Add Success"),i(o)},l.onerror=p=>{console.error("[VaultDB] Add Failed:",p.target.error),n(p.target.error)}})},updateItem:function(s){return new Promise((e,t)=>{if(!x){t(new Error("VaultDB not initialized"));return}s.updatedAt=new Date().toISOString();const a=x.transaction(C,"readwrite").objectStore(C).put(s);a.onsuccess=()=>e(s),a.onerror=r=>t(r.target.error)})}},O={person:{id:"person",label:"Person",icon:"👤",color:"#6366f1",fields:[{key:"role",label:"Role",type:"text"},{key:"affiliation",label:"Affiliation",type:"text"},{key:"motivation",label:"Motivation",type:"text"},{key:"appearance",label:"Appearance",type:"textarea"}]},location:{id:"location",label:"Location",icon:"📍",color:"#22c55e",fields:[{key:"region",label:"Region",type:"text"},{key:"climate",label:"Climate",type:"text"},{key:"pointsOfInterest",label:"Points of Interest",type:"textarea"}]},faction:{id:"faction",label:"Faction",icon:"🏛️",color:"#f59e0b",fields:[{key:"goals",label:"Goals",type:"textarea"},{key:"allies",label:"Allies",type:"text"},{key:"enemies",label:"Enemies",type:"text"}]},concept:{id:"concept",label:"Concept",icon:"💡",color:"#8b5cf6",fields:[{key:"domain",label:"Domain",type:"text"},{key:"principles",label:"Core Principles",type:"textarea"}]},event:{id:"event",label:"Event",icon:"📜",color:"#ef4444",fields:[{key:"era",label:"Era/Date",type:"text"},{key:"participants",label:"Participants",type:"text"},{key:"outcome",label:"Outcome",type:"textarea"}]},item:{id:"item",label:"Item",icon:"🎁",color:"#14b8a6",fields:[{key:"origin",label:"Origin",type:"text"},{key:"properties",label:"Properties",type:"textarea"}]}},N=s=>O[s]||O.item,P=()=>Object.values(O),H={id:"project",label:"Project",icon:"🏠",render:async(s,e)=>{try{await w.init()}catch(o){s.innerHTML=`<div class="text-muted">Vault Error: ${o.message}</div>`;return}const t=await w.list(),i={};P().forEach(o=>{i[o.id]=t.filter(c=>c.type===o.id).length});const n=t.reduce((o,c)=>{var h;return o+(((h=c.data.relationships)==null?void 0:h.length)||0)},0);s.innerHTML=`
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
                        ${P().map(o=>`
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
        `;const a=()=>{f.updateProject({title:s.querySelector("#proj-title").value,author:s.querySelector("#proj-author").value,version:s.querySelector("#proj-version").value,genre:s.querySelector("#proj-genre").value,system:s.querySelector("#proj-system").value,description:s.querySelector("#proj-description").value})};s.querySelectorAll("input, textarea").forEach(o=>{o.oninput=a}),s.querySelector("#btn-export").onclick=async()=>{const o={meta:f.project,entries:t,exportedAt:new Date().toISOString(),version:"1.0"},c=new Blob([JSON.stringify(o,null,2)],{type:"application/json"}),h=URL.createObjectURL(c),l=document.createElement("a");l.href=h,l.download=`${f.project.title.replace(/[^a-z0-9]/gi,"_")}_setting.json`,l.click(),URL.revokeObjectURL(h)};const r=s.querySelector("#import-file");s.querySelector("#btn-import").onclick=()=>r.click(),r.onchange=async o=>{var h;const c=o.target.files[0];if(c)try{const l=await c.text(),p=JSON.parse(l);if(p.meta&&f.updateProject(p.meta),p.entries&&Array.isArray(p.entries))for(const b of p.entries)await w.addItem(b.type,b.data);alert(`Imported ${((h=p.entries)==null?void 0:h.length)||0} entries!`),location.reload()}catch(l){alert("Import failed: "+l.message)}}}},F={parse(s){const e=s.trim().match(/^(\d+)?d(\d+)([+-]\d+)?$/i);return e?{count:parseInt(e[1])||1,sides:parseInt(e[2]),modifier:parseInt(e[3])||0}:null},rollOne(s){return Math.floor(Math.random()*s)+1},rollMany(s,e){const t=[];for(let i=0;i<s;i++)t.push(this.rollOne(e));return t},roll(s){const e=this.parse(s);if(!e)return{error:"Invalid format. Use NdX or NdX+Y (e.g., 2d6+3)"};const t=this.rollMany(e.count,e.sides),i=t.reduce((a,r)=>a+r,0),n=i+e.modifier;return{expression:s,rolls:t,subtotal:i,modifier:e.modifier,total:n}},format(s){if(s.error)return s.error;let e=`[${s.rolls.join(", ")}]`;return s.modifier!==0&&(e+=` ${s.modifier>0?"+":""}${s.modifier}`),e+=` = ${s.total}`,e},stats(s){const e=this.parse(s);if(!e)return null;const t=e.count+e.modifier,i=e.count*e.sides+e.modifier,n=(t+i)/2;return{min:t,max:i,average:n.toFixed(1)}}},X={id:"laboratory",label:"Laboratory",icon:"🧪",render:(s,e)=>{s.innerHTML=`
            <div class="laboratory-layout">
                <div class="laboratory-content">
                    <h1 class="laboratory-title">Laboratory</h1>
                    <p class="laboratory-description">
                        Test dice expressions and game mechanics here.
                    </p>
                    
                    <div class="dice-roller">
                        <label class="label" style="display:block; margin-bottom:8px;">Dice Expression</label>
                        <div class="dice-expression-row">
                            <input id="lab-expr" type="text" placeholder="e.g. 2d6+3" class="input flex-1">
                            <button id="lab-roll" class="btn btn-primary">Roll</button>
                        </div>
                        <div id="lab-stats" class="text-muted text-sm" style="margin-top:8px;"></div>
                        <div id="lab-result" class="dice-result">
                            Enter an expression and click Roll.
                        </div>
                    </div>
                </div>
            </div>
        `;const t=s.querySelector("#lab-expr"),i=s.querySelector("#lab-roll"),n=s.querySelector("#lab-result"),a=s.querySelector("#lab-stats");t.oninput=()=>{const r=F.stats(t.value);r?a.innerText=`Range: ${r.min}–${r.max} | Average: ${r.average}`:a.innerText=""},i.onclick=()=>{const r=t.value.trim();if(!r)return;const o=F.roll(r);o.error?n.innerHTML=`<span style="color:var(--status-error);">${o.error}</span>`:n.innerHTML=`
                    <div><strong>Rolls:</strong> [${o.rolls.join(", ")}]</div>
                    <div><strong>Subtotal:</strong> ${o.subtotal}</div>
                    ${o.modifier!==0?`<div><strong>Modifier:</strong> ${o.modifier>0?"+":""}${o.modifier}</div>`:""}
                    <div style="font-size:20px; margin-top:8px;"><strong>Total:</strong> ${o.total}</div>
                `},t.onkeydown=r=>{r.key==="Enter"&&i.onclick()}}};class A{constructor(e={}){this.title=e.title||"Modal",this.content=e.content||"",this.actions=e.actions||[],this.onClose=e.onClose||null,this.element=null}show(){this.element=document.createElement("div"),this.element.className="modal-overlay",this.element.innerHTML=`
            <div class="modal-content">
                <h3 class="modal-title">${this.title}</h3>
                <div class="modal-body"></div>
                <div class="modal-actions"></div>
            </div>
        `;const e=this.element.querySelector(".modal-body");typeof this.content=="string"?e.innerHTML=this.content:this.content instanceof HTMLElement&&e.appendChild(this.content);const t=this.element.querySelector(".modal-actions");this.actions.forEach(i=>{const n=document.createElement("button");n.className=i.className||"btn btn-secondary",n.innerText=i.label,n.onclick=()=>{i.onClick&&i.onClick(this)},t.appendChild(n)}),this.element.onclick=i=>{i.target===this.element&&this.close()},document.body.appendChild(this.element)}close(){this.element&&(this.element.remove(),this.element=null),this.onClose&&this.onClose()}getBody(){var e;return(e=this.element)==null?void 0:e.querySelector(".modal-body")}static confirm(e,t){return new Promise(i=>{const n=new A({title:e,content:`<p>${t}</p>`,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:()=>{n.close(),i(!1)}},{label:"Confirm",className:"btn btn-primary",onClick:()=>{n.close(),i(!0)}}]});n.show()})}static alert(e,t){return new Promise(i=>{const n=new A({title:e,content:`<p>${t}</p>`,actions:[{label:"OK",className:"btn btn-primary",onClick:()=>{n.close(),i()}}]});n.show()})}}class Q{constructor(e,t={}){this.container=e,this.items=[],this.activeCategory=null,this.activeItemId=null,this.onSelect=t.onSelect||null,this.onCreate=t.onCreate||null}setItems(e){this.items=e,this.render()}setActiveItem(e){this.activeItemId=e,this.renderList()}render(){this.container.innerHTML=`
            <div id="category-tabs" class="library-tabs"></div>
            <div class="library-search-bar">
                <input id="lib-search" type="text" placeholder="Search..." class="input">
                <button id="lib-add-btn" class="btn btn-primary">+</button>
            </div>
            <div id="lib-list" class="library-list"></div>
        `,this.tabsEl=this.container.querySelector("#category-tabs"),this.searchInput=this.container.querySelector("#lib-search"),this.listEl=this.container.querySelector("#lib-list"),this.addBtn=this.container.querySelector("#lib-add-btn"),this.renderTabs(),this.renderList(),this.searchInput.oninput=()=>this.renderList(),this.addBtn.onclick=()=>{this.onCreate&&this.onCreate()}}renderTabs(){this.tabsEl.innerHTML="";const e=document.createElement("button");e.innerText="All",e.className="tab"+(this.activeCategory===null?" active":""),e.onclick=()=>{this.activeCategory=null,this.renderTabs(),this.renderList()},this.tabsEl.appendChild(e),P().forEach(t=>{const i=document.createElement("button");i.innerText=`${t.icon} ${t.label}`,i.className="tab"+(this.activeCategory===t.id?" active":""),this.activeCategory===t.id&&(i.style.background=t.color,i.style.borderColor=t.color),i.onclick=()=>{this.activeCategory=t.id,this.renderTabs(),this.renderList()},this.tabsEl.appendChild(i)})}renderList(){var n;if(!this.listEl)return;this.listEl.innerHTML="";const e=((n=this.searchInput)==null?void 0:n.value.toLowerCase())||"",t=this.activeCategory,i=this.items.filter(a=>{const r=(a.data.name||"").toLowerCase().includes(e),o=t?a.type===t:!0;return r&&o});if(i.length===0){this.listEl.innerHTML='<div class="library-list-empty">No entries found.</div>';return}i.forEach(a=>{const r=N(a.type),o=this.activeItemId===a.id,c=document.createElement("div");c.className="list-item"+(o?" active":""),c.innerHTML=`
                <span>${r.icon}</span>
                <span class="flex-1" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${a.data.name||"Untitled"}</span>
            `,c.onclick=()=>{this.onSelect&&this.onSelect(a)},this.listEl.appendChild(c)})}}class Z{constructor(e,t="",i={}){this.container=e,this.value=t,this.onChange=null,this.onLinkClick=i.onLinkClick||null,this.getEntries=i.getEntries||(()=>[])}render(){this.container.innerHTML=`
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
        `,this.editor=this.container.querySelector(".rte-content"),this.autocomplete=this.container.querySelector(".rte-autocomplete"),this.bindEvents()}renderWithLinks(e){return e.replace(/\[\[([^\]]+)\]\]/g,(t,i)=>`<span class="wiki-link" data-link="${i}">[[${i}]]</span>`)}extractRawText(e){const t=document.createElement("div");return t.innerHTML=e,t.querySelectorAll(".wiki-link").forEach(i=>{i.replaceWith(`[[${i.dataset.link}]]`)}),t.innerHTML}bindEvents(){this.container.querySelectorAll("button[data-cmd]").forEach(e=>{e.onclick=t=>{t.preventDefault();const i=e.dataset.cmd;i==="link"?this.insertLinkPlaceholder():i==="h2"||i==="h3"?document.execCommand("formatBlock",!1,i):document.execCommand(i,!1,null),this.editor.focus()}}),this.editor.oninput=()=>{this.checkForAutocomplete(),this.value=this.extractRawText(this.editor.innerHTML),this.onChange&&this.onChange(this.value)},this.editor.onclick=e=>{if(e.target.classList.contains("wiki-link")){const t=e.target.dataset.link;this.onLinkClick&&this.onLinkClick(t)}},this.editor.onkeydown=e=>{if(this.autocomplete.style.display!=="none")if(e.key==="ArrowDown"||e.key==="ArrowUp")e.preventDefault(),this.navigateAutocomplete(e.key==="ArrowDown"?1:-1);else if(e.key==="Enter"||e.key==="Tab"){const t=this.autocomplete.querySelector(".selected");t&&(e.preventDefault(),this.selectAutocompleteItem(t.dataset.name))}else e.key==="Escape"&&this.hideAutocomplete()},this.editor.onblur=()=>{setTimeout(()=>this.hideAutocomplete(),150)}}insertLinkPlaceholder(){document.execCommand("insertText",!1,"[[]]");const e=window.getSelection();if(e.rangeCount){const t=e.getRangeAt(0);t.setStart(t.startContainer,t.startOffset-2),t.collapse(!0),e.removeAllRanges(),e.addRange(t)}}checkForAutocomplete(){const e=window.getSelection();if(!e.rangeCount)return;const t=e.getRangeAt(0),i=t.startContainer;if(i.nodeType!==Node.TEXT_NODE)return;const a=i.textContent.substring(0,t.startOffset).match(/\[\[([^\]]*?)$/);if(a){const r=a[1].toLowerCase(),o=this.getEntries().filter(c=>(c.data.name||"").toLowerCase().includes(r)).slice(0,8);o.length>0?this.showAutocomplete(o):this.hideAutocomplete()}else this.hideAutocomplete()}showAutocomplete(e){this.autocomplete.innerHTML="",e.forEach((t,i)=>{const n=document.createElement("div");n.dataset.name=t.data.name,n.className="rte-autocomplete-item"+(i===0?" selected":""),n.innerText=t.data.name||"Untitled",n.onmousedown=a=>{a.preventDefault(),this.selectAutocompleteItem(t.data.name)},this.autocomplete.appendChild(n)}),this.autocomplete.style.display="block",this.autocomplete.style.left="16px",this.autocomplete.style.bottom="16px"}hideAutocomplete(){this.autocomplete.style.display="none"}navigateAutocomplete(e){var a,r;const t=Array.from(this.autocomplete.children),i=t.findIndex(o=>o.classList.contains("selected"));(a=t[i])==null||a.classList.remove("selected");const n=Math.max(0,Math.min(t.length-1,i+e));(r=t[n])==null||r.classList.add("selected")}selectAutocompleteItem(e){const t=window.getSelection();if(!t.rangeCount)return;const i=t.getRangeAt(0),n=i.startContainer;if(n.nodeType!==Node.TEXT_NODE)return;const a=n.textContent,r=a.substring(0,i.startOffset);if(r.match(/\[\[([^\]]*?)$/)){const c=r.lastIndexOf("[["),h=a.substring(i.startOffset),l=h.indexOf("]]"),p=l>=0?h.substring(l+2):h,b=document.createElement("span");b.className="wiki-link",b.dataset.link=e,b.innerText=`[[${e}]]`;const S=document.createTextNode(a.substring(0,c)),_=document.createTextNode(" "+p),L=n.parentNode;L.insertBefore(S,n),L.insertBefore(b,n),L.insertBefore(_,n),L.removeChild(n);const M=document.createRange();M.setStartAfter(b),M.collapse(!0),t.removeAllRanges(),t.addRange(M)}this.hideAutocomplete(),this.value=this.extractRawText(this.editor.innerHTML),this.onChange&&this.onChange(this.value)}getValue(){return this.extractRawText(this.editor.innerHTML)}setValue(e){this.value=e,this.editor&&(this.editor.innerHTML=this.renderWithLinks(e))}}class ee{constructor(e,t={}){this.container=e,this.item=null,this.onSave=t.onSave||null,this.onNameChange=t.onNameChange||null,this.onLinkClick=t.onLinkClick||null,this.getEntries=t.getEntries||(()=>[]),this.editorInstance=null}setItem(e){this.item=e,e?this.render():this.showEmpty()}showEmpty(){this.container.innerHTML=`
            <div class="empty-state">
                <h2>Select an entry</h2>
                <p>Or create a new one to start building your world.</p>
            </div>
        `}render(){if(!this.item)return this.showEmpty();const e=N(this.item.type);this.container.innerHTML=`
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
        `;const t=this.container.querySelector("#asset-title"),i=this.container.querySelector("#metadata-fields"),n=this.container.querySelector("#asset-rte-mount");this.container.querySelector("#save-status"),e.fields.forEach(o=>{const c=document.createElement("div");c.className="metadata-field";const h=document.createElement("label");h.innerText=o.label,h.className="label";let l;o.type==="textarea"?(l=document.createElement("textarea"),l.rows=2,l.className="textarea"):(l=document.createElement("input"),l.type="text",l.className="input"),l.value=this.item.data[o.key]||"",l.oninput=()=>{this.item.data[o.key]=l.value,this.save()},c.appendChild(h),c.appendChild(l),i.appendChild(c)});const a=new Z(n,this.item.data.description||"",{getEntries:this.getEntries,onLinkClick:this.onLinkClick});a.render(),this.editorInstance=a,a.onChange=o=>{this.item.data.description=o,this.save()};let r=null;t.oninput=()=>{this.item.data.name=t.value,this.save(),clearTimeout(r),r=setTimeout(()=>{this.onNameChange&&this.onNameChange(this.item)},300)}}async save(){const e=this.container.querySelector("#save-status");e&&(e.innerText="Saving..."),this.onSave&&await this.onSave(this.item),e&&(e.innerText="Saved")}}const R={member_of:{id:"member_of",label:"Member of",icon:"👥",inverse:"has_member",description:"This entry is a member of the target."},has_member:{id:"has_member",label:"Has Member",icon:"👤",inverse:"member_of",description:"The target is a member of this entry."},located_in:{id:"located_in",label:"Located in",icon:"📍",inverse:"contains",description:"This entry is located within the target."},contains:{id:"contains",label:"Contains",icon:"🗺️",inverse:"located_in",description:"This entry contains the target."},ally_of:{id:"ally_of",label:"Ally of",icon:"🤝",inverse:"ally_of",description:"This entry is allied with the target."},enemy_of:{id:"enemy_of",label:"Enemy of",icon:"⚔️",inverse:"enemy_of",description:"This entry is an enemy of the target."},parent_of:{id:"parent_of",label:"Parent of",icon:"👨‍👧",inverse:"child_of",description:"This entry is the parent of the target."},child_of:{id:"child_of",label:"Child of",icon:"👶",inverse:"parent_of",description:"This entry is the child of the target."},related_to:{id:"related_to",label:"Related to",icon:"🔗",inverse:"related_to",description:"Generic relationship."},created_by:{id:"created_by",label:"Created by",icon:"🛠️",inverse:"creator_of",description:"This entry was created by the target."},creator_of:{id:"creator_of",label:"Creator of",icon:"✨",inverse:"created_by",description:"This entry created the target."}},B=s=>R[s]||R.related_to,te=()=>Object.values(R);class se{constructor(e,t={}){this.container=e,this.item=null,this.allItems=[],this.onSave=t.onSave||null,this.onNavigate=t.onNavigate||null}setItem(e,t){this.item=e,this.allItems=t,e&&this.render()}render(){this.item&&(this.item.data.relationships||(this.item.data.relationships=[]),this.container.innerHTML=`
            <div class="relationships-header">
                <div class="label">Relationships</div>
                <button id="add-relationship-btn" class="btn btn-primary" style="padding:4px 10px; font-size:11px;">+ Add</button>
            </div>
            <div id="relationships-list" class="relationships-list"></div>
            <div id="back-references" class="back-references"></div>
        `,this.renderRelationships(),this.container.querySelector("#add-relationship-btn").onclick=()=>this.showAddModal())}renderRelationships(){const e=this.container.querySelector("#relationships-list"),t=this.container.querySelector("#back-references");e.innerHTML="",this.item.data.relationships.length===0?e.innerHTML='<div class="text-muted text-sm">No relationships defined.</div>':(this.item.data.relationships.forEach((n,a)=>{const r=B(n.type),o=this.allItems.find(p=>p.id===n.targetId),c=o?o.data.name||"Untitled":"(Deleted)",h=o?N(o.type):{icon:"❓"},l=document.createElement("div");l.className="relationship-row",l.innerHTML=`
                    <span>${r.icon}</span>
                    <span class="relationship-type">${r.label}</span>
                    <span class="relationship-target" data-id="${n.targetId}">${h.icon} ${c}</span>
                    <button class="relationship-delete" data-idx="${a}">×</button>
                `,e.appendChild(l)}),e.querySelectorAll(".relationship-target").forEach(n=>{n.onclick=()=>{const a=this.allItems.find(r=>r.id===n.dataset.id);a&&this.onNavigate&&this.onNavigate(a)}}),e.querySelectorAll(".relationship-delete").forEach(n=>{n.onclick=()=>{this.item.data.relationships.splice(parseInt(n.dataset.idx),1),this.onSave&&this.onSave(this.item),this.renderRelationships()}}));const i=this.allItems.filter(n=>{var a;return n.id!==this.item.id&&((a=n.data.relationships)==null?void 0:a.some(r=>r.targetId===this.item.id))});t.innerHTML="",i.length===0?t.innerHTML='<div class="text-muted text-xs">No incoming references.</div>':(t.innerHTML='<div class="back-ref-label">Referenced by:</div>',i.forEach(n=>{const a=N(n.type);n.data.relationships.filter(o=>o.targetId===this.item.id).forEach(o=>{const c=B(o.type),h=R[c.inverse],l=document.createElement("div");l.className="back-ref-item",l.innerHTML=`<span>${a.icon}</span> ${n.data.name||"Untitled"} <span class="text-muted">(${(h==null?void 0:h.label)||c.label})</span>`,l.onclick=()=>{this.onNavigate&&this.onNavigate(n)},t.appendChild(l)})}))}showAddModal(){const e=document.createElement("div");e.className="flex flex-col gap-md",e.innerHTML=`
            <div>
                <label class="label">Type</label>
                <select id="rel-type-select" class="input" style="width:100%; margin-top:4px;"></select>
            </div>
            <div>
                <label class="label">Target Entry</label>
                <select id="rel-target-select" class="input" style="width:100%; margin-top:4px;"></select>
            </div>
        `,new A({title:"Add Relationship",content:e,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:a=>a.close()},{label:"Add",className:"btn btn-primary",onClick:a=>{const r=e.querySelector("#rel-type-select"),o=e.querySelector("#rel-target-select"),c=r.value,h=o.value;c&&h&&(this.item.data.relationships.push({type:c,targetId:h}),this.onSave&&this.onSave(this.item),this.renderRelationships()),a.close()}}]}).show();const i=e.querySelector("#rel-type-select"),n=e.querySelector("#rel-target-select");te().forEach(a=>{const r=document.createElement("option");r.value=a.id,r.innerText=`${a.icon} ${a.label}`,i.appendChild(r)}),this.allItems.filter(a=>a.id!==this.item.id).forEach(a=>{const r=N(a.type),o=document.createElement("option");o.value=a.id,o.innerText=`${r.icon} ${a.data.name||"Untitled"}`,n.appendChild(o)})}}const m={id:"library",label:"Library",icon:"📚",entryList:null,entryEditor:null,relationshipManager:null,allItems:[],activeItem:null,render:async(s,e)=>{try{await w.init()}catch(a){s.innerHTML=`<div class="text-muted">Vault Error: ${a.message}</div>`;return}s.innerHTML=`
            <div class="library-layout">
                <div id="lib-sidebar" class="library-sidebar"></div>
                <div id="lib-main" class="library-main">
                    <div id="lib-editor-area"></div>
                    <div id="lib-relationships-area" class="relationships-section" style="display:none;"></div>
                </div>
            </div>
        `;const t=s.querySelector("#lib-sidebar"),i=s.querySelector("#lib-editor-area"),n=s.querySelector("#lib-relationships-area");if(m.allItems=await w.list(),m.entryList=new Q(t,{onSelect:a=>m.selectItem(a,i,n),onCreate:()=>m.showCreateModal()}),m.entryList.setItems(m.allItems),m.entryEditor=new ee(i,{onSave:async a=>{await w.updateItem(a)},onNameChange:a=>{m.entryList.setItems(m.allItems)},onLinkClick:a=>{const r=m.allItems.find(o=>(o.data.name||"").toLowerCase()===a.toLowerCase());r&&m.selectItem(r,i,n)},getEntries:()=>m.allItems}),m.entryEditor.showEmpty(),m.relationshipManager=new se(n,{onSave:async a=>{await w.updateItem(a)},onNavigate:a=>{m.selectItem(a,i,n)}}),f.session.activeEntryId){const a=m.allItems.find(r=>r.id===f.session.activeEntryId);a&&m.selectItem(a,i,n)}},selectItem(s,e,t){m.activeItem=s,m.entryList.setActiveItem(s.id),m.entryEditor.setItem(s),t.style.display="block",m.relationshipManager.setItem(s,m.allItems),f.updateSession({activeEntryId:s.id})},showCreateModal(){const s=document.createElement("div");s.className="grid-3",P().forEach(t=>{const i=document.createElement("button");i.className="btn btn-secondary",i.style.cssText="flex-direction:column; padding:12px;",i.innerHTML=`<span style="font-size:20px;">${t.icon}</span><span class="text-xs">${t.label}</span>`,i.onclick=async()=>{e.close();const n=await w.addItem(t.id,{name:`New ${t.label}`,description:""});m.allItems.push(n),m.entryList.setItems(m.allItems);const a=document.querySelector("#lib-editor-area"),r=document.querySelector("#lib-relationships-area");m.selectItem(n,a,r)},s.appendChild(i)});const e=new A({title:"Create New Entry",content:s,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:t=>t.close()}]});e.show()}};class ie{constructor(e,t,i){this.container=e,this.nodeLayer=t,this.svgLayer=i,this.nodes=[],this.links=[],this.transform={x:0,y:0,scale:1},this.isDragging=!1,this.lastMouse={x:0,y:0},this.onDataChange=null}init(){this.container.onmousedown=e=>{(e.button===1||e.button===0&&e.altKey)&&(this.isDragging=!0,this.lastMouse={x:e.clientX,y:e.clientY},this.container.style.cursor="grabbing",e.preventDefault())},window.onmousemove=e=>{if(this.isDragging){const t=e.clientX-this.lastMouse.x,i=e.clientY-this.lastMouse.y;this.transform.x+=t,this.transform.y+=i,this.lastMouse={x:e.clientX,y:e.clientY},this.updateTransform()}},window.onmouseup=e=>{this.isDragging=!1,this.container.style.cursor="default"},this.container.onwheel=e=>{e.preventDefault();const t=e.deltaY>0?.9:1.1;this.transform.scale*=t,this.transform.scale=Math.min(Math.max(.2,this.transform.scale),2),this.updateTransform()}}exportData(){return{nodes:this.nodes,links:this.links,transform:this.transform}}importData(e){e&&(this.nodes=[],this.nodeLayer.innerHTML="",e.transform&&(this.transform=e.transform,this.updateTransform()),e.nodes&&e.nodes.forEach(t=>this.addNode(t,!0)),this.links=e.links||[],this.updateLinks())}notifyChange(){this.onDataChange&&this.onDataChange(this.exportData())}updateTransform(){this.nodeLayer.style.transform=`translate(${this.transform.x}px, ${this.transform.y}px) scale(${this.transform.scale})`,this.updateLinks()}resetView(){this.transform={x:0,y:0,scale:1},this.updateTransform()}addNode(e,t=!1){this.nodes.push(e);const i=this.renderNodeElement(e);this.nodeLayer.appendChild(i),t||this.notifyChange()}renderNodeElement(e){const t=document.createElement("div");t.className="node",t.id=e.id,t.style.left=e.x+"px",t.style.top=e.y+"px";let i=(e.inputs||[]).map(p=>`
            <div class="socket-row">
                <div class="socket input" title="${p}"></div>
                <span>${p}</span>
            </div>
        `).join(""),n=(e.outputs||[]).map(p=>`
            <div class="socket-row" style="justify-content: flex-end;">
                <span>${p}</span>
                <div class="socket output" title="${p}"></div>
            </div>
        `).join("");t.innerHTML=`
            <div class="node-header">${e.title}</div>
            <div class="node-body">
                ${i}
                <!-- Body content could go here -->
                ${n}
            </div>
        `;const a=t.querySelector(".node-header");let r=!1,o={x:0,y:0},c={x:e.x,y:e.y};a.onmousedown=p=>{p.button===0&&(r=!0,o={x:p.clientX,y:p.clientY},c={x:e.x,y:e.y},t.classList.add("selected"),p.stopPropagation())};const h=p=>{if(r){const b=(p.clientX-o.x)/this.transform.scale,S=(p.clientY-o.y)/this.transform.scale;e.x=c.x+b,e.y=c.y+S,t.style.left=e.x+"px",t.style.top=e.y+"px",this.updateLinks()}},l=()=>{r&&(r=!1,t.classList.remove("selected"),this.notifyChange())};return window.addEventListener("mousemove",h),window.addEventListener("mouseup",l),t}updateLinks(){if(this.svgLayer.innerHTML="",this.nodes.length>=2){const e=this.nodes[0],t=this.nodes[1],i=(e.x+200)*this.transform.scale+this.transform.x,n=(e.y+40)*this.transform.scale+this.transform.y,a=t.x*this.transform.scale+this.transform.x,r=(t.y+40)*this.transform.scale+this.transform.y,o=document.createElementNS("http://www.w3.org/2000/svg","path"),c=i+50*this.transform.scale,h=a-50*this.transform.scale,l=`M ${i} ${n} C ${c} ${n}, ${h} ${r}, ${a} ${r}`;o.setAttribute("d",l),o.setAttribute("class","connection-line"),this.svgLayer.appendChild(o)}}}const V=document.createElement("link");V.rel="stylesheet";V.href="./panels/architect/architect.css";document.head.appendChild(V);const z={id:"architect",label:"Architect",icon:"📐",render:(s,e)=>{s.style.padding="0",s.innerHTML=`
            <div class="architect-workspace" id="arch-workspace">
                <div class="connection-layer" id="arch-connections">
                    <svg width="100%" height="100%" id="arch-svg"></svg>
                </div>
                <div class="node-layer" id="arch-nodes">
                    <!-- Nodes injected here -->
                </div>
                
                <div class="architect-toolbar">
                    <button class="btn-primary" id="btn-add-node">+ Add Logic</button>
                    <button class="btn-secondary" id="btn-reset-view">Center</button>
                    <div style="width:1px; background:var(--border-subtle); margin:0 4px;"></div>
                    <span style="font-size:12px; color:var(--text-muted); align-self:center;">Pan: Middle Click / Space+Drag</span>
                </div>
            </div>
        `;const t=s.querySelector("#arch-workspace"),i=s.querySelector("#arch-nodes"),n=s.querySelector("#arch-svg"),a=new ie(t,i,n);a.init(),s.querySelector("#btn-add-node").onclick=()=>{a.addNode({id:j.generateId("node"),x:100+Math.random()*50,y:100+Math.random()*50,title:"Logic Block",inputs:["in"],outputs:["out","true","false"]})},s.querySelector("#btn-reset-view").onclick=()=>{a.resetView()};const r="samildanach_architect_layout";a.onDataChange=h=>{localStorage.setItem(r,JSON.stringify(h))};const o=localStorage.getItem(r);if(o)try{const h=JSON.parse(o);a.importData(h)}catch(h){console.error("Failed to load architect layout:",h),c()}else c();function c(){a.nodes.length===0&&(a.addNode({id:"start",x:50,y:50,title:"Event: Start",outputs:["next"]}),a.addNode({id:"d20",x:300,y:100,title:"Action: Roll D20",inputs:["prev"],outputs:["next","value"]}))}}},G={id:"graph",label:"Graph",icon:"🕸️",render:async(s,e)=>{try{await w.init()}catch(d){s.innerHTML=`<div class="text-muted">Vault Error: ${d.message}</div>`;return}s.style.padding="0",s.innerHTML=`
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
        `;const t=s.querySelector("#graph-container"),i=s.querySelector("#graph-canvas"),n=i.getContext("2d"),a=()=>{i.width=t.clientWidth,i.height=t.clientHeight};a(),window.addEventListener("resize",a);const r=await w.list(),o=r.map((d,y)=>{const u=N(d.type),v=y/r.length*Math.PI*2,g=Math.min(i.width,i.height)*.3;return{id:d.id,item:d,label:d.data.name||"Untitled",icon:u.icon,color:u.color,x:i.width/2+Math.cos(v)*g,y:i.height/2+Math.sin(v)*g,vx:0,vy:0}}),c=Object.fromEntries(o.map(d=>[d.id,d])),h=[];r.forEach(d=>{(d.data.relationships||[]).forEach(y=>{if(c[y.targetId]){const u=B(y.type);h.push({from:d.id,to:y.targetId,label:u.label,color:u.icon})}})});let l={x:0,y:0,scale:1},p=!1,b={x:0,y:0},S=null;const _=()=>{n.clearRect(0,0,i.width,i.height),n.save(),n.translate(l.x,l.y),n.scale(l.scale,l.scale),n.lineWidth=2,h.forEach(d=>{const y=c[d.from],u=c[d.to];y&&u&&(n.strokeStyle="rgba(100, 116, 139, 0.5)",n.beginPath(),n.moveTo(y.x,y.y),n.lineTo(u.x,u.y),n.stroke())}),o.forEach(d=>{n.fillStyle=d.color||"#6366f1",n.beginPath(),n.arc(d.x,d.y,24,0,Math.PI*2),n.fill(),n.font="16px sans-serif",n.textAlign="center",n.textBaseline="middle",n.fillStyle="#fff",n.fillText(d.icon,d.x,d.y),n.font="11px sans-serif",n.fillStyle="var(--text-primary)",n.fillText(d.label,d.x,d.y+36)}),n.restore()},L=()=>{const d=i.width/2,y=i.height/2;o.forEach(u=>{o.forEach(v=>{if(u.id===v.id)return;const g=u.x-v.x,k=u.y-v.y,E=Math.sqrt(g*g+k*k)||1,I=5e3/(E*E);u.vx+=g/E*I,u.vy+=k/E*I}),u.vx+=(d-u.x)*.001,u.vy+=(y-u.y)*.001}),h.forEach(u=>{const v=c[u.from],g=c[u.to];if(v&&g){const k=g.x-v.x,E=g.y-v.y,I=Math.sqrt(k*k+E*E)||1,D=(I-150)*.01;v.vx+=k/I*D,v.vy+=E/I*D,g.vx-=k/I*D,g.vy-=E/I*D}}),o.forEach(u=>{S!==u&&(u.x+=u.vx*.1,u.y+=u.vy*.1),u.vx*=.9,u.vy*=.9}),_(),requestAnimationFrame(L)};L();const M=d=>({x:(d.offsetX-l.x)/l.scale,y:(d.offsetY-l.y)/l.scale}),J=(d,y)=>o.find(u=>{const v=u.x-d,g=u.y-y;return Math.sqrt(v*v+g*g)<24});i.onmousedown=d=>{const y=M(d),u=J(y.x,y.y);u?S=u:(p=!0,b={x:d.clientX,y:d.clientY})},i.onmousemove=d=>{if(S){const y=M(d);S.x=y.x,S.y=y.y}else p&&(l.x+=d.clientX-b.x,l.y+=d.clientY-b.y,b={x:d.clientX,y:d.clientY})},i.onmouseup=()=>{S=null,p=!1},i.onwheel=d=>{d.preventDefault();const y=d.deltaY>0?.9:1.1;l.scale*=y,l.scale=Math.min(Math.max(.3,l.scale),3)},s.querySelector("#graph-reset").onclick=()=>{l={x:0,y:0,scale:1}},s.querySelector("#graph-relayout").onclick=()=>{o.forEach((d,y)=>{const u=y/o.length*Math.PI*2,v=Math.min(i.width,i.height)*.3;d.x=i.width/2+Math.cos(u)*v,d.y=i.height/2+Math.sin(u)*v,d.vx=0,d.vy=0})}}};async function ne(){console.log(`%c Samildánach v${f.project.version} `,"background: #222; color: #bada55"),T.registerPanel(H.id,H),T.registerPanel(m.id,m),T.registerPanel(G.id,G),T.registerPanel(z.id,z),T.registerPanel(X.id,X),T.init(),T.activePanelId||T.switchPanel(H.id)}window.addEventListener("DOMContentLoaded",ne);
