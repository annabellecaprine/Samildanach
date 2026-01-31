(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function s(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(i){if(i.ep)return;i.ep=!0;const o=s(i);fetch(i.href,o)}})();const we="samildanach_state",x={project:{title:"Untitled Setting",author:"",version:"1.0.0",description:"",genre:"",system:""},session:{activePanel:null,activeEntryId:null},cache:{},_subscribers:[],init(){const t=localStorage.getItem(we);if(t)try{const e=JSON.parse(t);e.project&&Object.assign(this.project,e.project),e.session&&Object.assign(this.session,e.session)}catch(e){console.warn("Failed to restore state:",e)}},save(){const t={project:this.project,session:this.session};localStorage.setItem(we,JSON.stringify(t))},updateProject(t){Object.assign(this.project,t),this.save(),this._notify("project",this.project)},updateSession(t){Object.assign(this.session,t),this.save(),this._notify("session",this.session)},subscribe(t,e){const s={key:t,callback:e};return this._subscribers.push(s),()=>{const n=this._subscribers.indexOf(s);n>=0&&this._subscribers.splice(n,1)}},_notify(t,e){this._subscribers.filter(s=>s.key===t).forEach(s=>s.callback(e))},exportState(){return{project:{...this.project},session:{...this.session}}},importState(t){t.project&&Object.assign(this.project,t.project),t.session&&Object.assign(this.session,t.session),this.save(),this._notify("project",this.project),this._notify("session",this.session)}},C={panels:{},activePanelId:null,init:function(){x.init(),this.renderSidebar(),this.bindEvents();const t=localStorage.getItem("theme")||"dark";document.documentElement.setAttribute("data-theme",t),x.session.activePanel&&this.panels[x.session.activePanel]&&this.switchPanel(x.session.activePanel)},registerPanel:function(t,e){this.panels[t]=e,this.renderSidebar()},switchPanel:function(t){if(!this.panels[t])return;this.activePanelId=t,x.updateSession({activePanel:t}),document.querySelectorAll(".nav-item").forEach(n=>{n.classList.toggle("active",n.dataset.id===t)});const e=document.getElementById("main-view");e.innerHTML="";const s=document.createElement("div");s.className="panel-container",this.panels[t].render(s,x),e.appendChild(s)},renderSidebar:function(){const t=document.getElementById("nav-list");t&&(t.innerHTML="",Object.keys(this.panels).forEach(e=>{const s=this.panels[e];if(e==="divider"||s.divider){const i=document.createElement("div");i.className="nav-divider",t.appendChild(i);return}const n=document.createElement("div");n.className="nav-item",n.innerHTML=s.icon||"📦",n.title=s.label||e,n.dataset.id=e,n.onclick=()=>this.switchPanel(e),e===this.activePanelId&&n.classList.add("active"),t.appendChild(n)}))},bindEvents:function(){const t=document.getElementById("theme-toggle");t&&(t.onclick=()=>{const e=document.documentElement,n=e.getAttribute("data-theme")==="dark"?"light":"dark";e.setAttribute("data-theme",n),localStorage.setItem("theme",n)})}},O={generateId:(t="id")=>typeof crypto<"u"&&crypto.randomUUID?`${t}_${crypto.randomUUID().split("-")[0]}`:`${t}_${Math.random().toString(36).substring(2,9)}`,escapeHtml:t=>{const e=document.createElement("div");return e.textContent=t,e.innerHTML},debounce:(t,e=300)=>{let s;return(...n)=>{clearTimeout(s),s=setTimeout(()=>t(...n),e)}},deepClone:t=>JSON.parse(JSON.stringify(t)),formatDate:t=>{const e=new Date(t);return e.toLocaleDateString()+" "+e.toLocaleTimeString()},truncate:(t,e=50)=>!t||t.length<=e?t:t.substring(0,e-3)+"..."},ne=O.generateId,Re="samildanach_vault",Pe=1,W="items",Q="registry",ie="vault_registry";let L=null;function Se(){return{id:ie,lastUpdatedAt:new Date().toISOString(),universes:[],allTags:[],blocks:{},itemCounts:{actor:0,lorebook:0,script:0,location:0,event:0,pair:0}}}const $={init:function(){return new Promise((t,e)=>{if(L){t(L);return}const s=indexedDB.open(Re,Pe);s.onerror=n=>{console.error("[VaultDB] Failed to open database:",n.target.error),e(n.target.error)},s.onsuccess=n=>{L=n.target.result,console.log("[VaultDB] Database opened successfully"),t(L)},s.onupgradeneeded=n=>{const i=n.target.result;if(!i.objectStoreNames.contains(W)){const o=i.createObjectStore(W,{keyPath:"id"});o.createIndex("type","type",{unique:!1}),o.createIndex("universe","universe",{unique:!1}),o.createIndex("updatedAt","updatedAt",{unique:!1}),console.log("[VaultDB] Items store created")}i.objectStoreNames.contains(Q)||(i.createObjectStore(Q,{keyPath:"id"}),console.log("[VaultDB] Registry store created"))}})},getRegistry:function(){return new Promise((t,e)=>{if(!L){e(new Error("VaultDB not initialized"));return}const i=L.transaction(Q,"readonly").objectStore(Q).get(ie);i.onsuccess=()=>{i.result?t(i.result):$.updateRegistry(Se()).then(t).catch(e)},i.onerror=o=>e(o.target.error)})},updateRegistry:function(t){return new Promise((e,s)=>{if(!L){s(new Error("VaultDB not initialized"));return}const i=L.transaction(Q,"readwrite").objectStore(Q),o=i.get(ie);o.onsuccess=()=>{const c={...o.result||Se(),...t,id:ie,lastUpdatedAt:new Date().toISOString()},r=i.put(c);r.onsuccess=()=>e(c),r.onerror=m=>s(m.target.error)},o.onerror=a=>s(a.target.error)})},list:function(t={}){return new Promise((e,s)=>{if(!L){s(new Error("VaultDB not initialized"));return}const i=L.transaction(W,"readonly").objectStore(W);let o;t.type?o=i.index("type").openCursor(IDBKeyRange.only(t.type)):t.universe?o=i.index("universe").openCursor(IDBKeyRange.only(t.universe)):o=i.openCursor();const a=[];o.onsuccess=c=>{const r=c.target.result;if(r){const m=r.value;let l=!0;t.type&&m.type!==t.type&&(l=!1),t.universe&&m.universe!==t.universe&&(l=!1),t.tags&&t.tags.length>0&&(t.tags.every(y=>{var w;return(w=m.tags)==null?void 0:w.includes(y)})||(l=!1)),l&&a.push(m),r.continue()}else a.sort((m,l)=>new Date(l.updatedAt).getTime()-new Date(m.updatedAt).getTime()),e(a)},o.onerror=c=>s(c.target.error)})},addItem:function(t,e,s={}){return new Promise((n,i)=>{if(!L){console.error("[VaultDB]AddItem: DB not initialized"),i(new Error("VaultDB not initialized"));return}const o=new Date().toISOString();let a;try{a=O&&O.generateId?O.generateId("vault"):`vault_${crypto.randomUUID()}`}catch(p){console.error("[VaultDB] ID Gen Failed:",p),a="vault_"+Date.now()}const c={id:a,type:t,version:1,universe:s.universe||"",tags:s.tags||[],createdAt:o,updatedAt:o,data:e};console.log("[VaultDB] Adding Item:",c);const l=L.transaction(W,"readwrite").objectStore(W).add(c);l.onsuccess=()=>{console.log("[VaultDB] Add Success"),n(c)},l.onerror=p=>{console.error("[VaultDB] Add Failed:",p.target.error),i(p.target.error)}})},updateItem:function(t){return new Promise((e,s)=>{if(!L){s(new Error("VaultDB not initialized"));return}t.updatedAt=new Date().toISOString();const o=L.transaction(W,"readwrite").objectStore(W).put(t);o.onsuccess=()=>e(t),o.onerror=a=>s(a.target.error)})}},fe={person:{id:"person",label:"Person",icon:"👤",color:"#6366f1",fields:[{key:"role",label:"Role",type:"text"},{key:"affiliation",label:"Affiliation",type:"text"},{key:"motivation",label:"Motivation",type:"text"},{key:"appearance",label:"Appearance",type:"textarea"}]},location:{id:"location",label:"Location",icon:"📍",color:"#22c55e",fields:[{key:"region",label:"Region",type:"text"},{key:"climate",label:"Climate",type:"text"},{key:"pointsOfInterest",label:"Points of Interest",type:"textarea"}]},faction:{id:"faction",label:"Faction",icon:"🏛️",color:"#f59e0b",fields:[{key:"goals",label:"Goals",type:"textarea"},{key:"allies",label:"Allies",type:"text"},{key:"enemies",label:"Enemies",type:"text"}]},concept:{id:"concept",label:"Concept",icon:"💡",color:"#8b5cf6",fields:[{key:"domain",label:"Domain",type:"text"},{key:"principles",label:"Core Principles",type:"textarea"}]},event:{id:"event",label:"Event",icon:"📜",color:"#ef4444",fields:[{key:"era",label:"Era/Date",type:"text"},{key:"participants",label:"Participants",type:"text"},{key:"outcome",label:"Outcome",type:"textarea"}]},item:{id:"item",label:"Item",icon:"🎁",color:"#14b8a6",fields:[{key:"origin",label:"Origin",type:"text"},{key:"properties",label:"Properties",type:"textarea"}]}},K=t=>fe[t]||fe.item,Z=()=>Object.values(fe),de={id:"project",label:"Project",icon:"🏠",render:async(t,e)=>{try{await $.init()}catch(c){t.innerHTML=`<div class="text-muted">Vault Error: ${c.message}</div>`;return}const s=await $.list(),n={};Z().forEach(c=>{n[c.id]=s.filter(r=>r.type===c.id).length});const i=s.reduce((c,r)=>{var m;return c+(((m=r.data.relationships)==null?void 0:m.length)||0)},0);t.innerHTML=`
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
                        ${Z().map(c=>`
                            <div class="stat-card" style="border-left-color: ${c.color};">
                                <div class="stat-icon">${c.icon}</div>
                                <div class="stat-value">${n[c.id]||0}</div>
                                <div class="stat-label">${c.label}s</div>
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
        `;const o=()=>{x.updateProject({title:t.querySelector("#proj-title").value,author:t.querySelector("#proj-author").value,version:t.querySelector("#proj-version").value,genre:t.querySelector("#proj-genre").value,system:t.querySelector("#proj-system").value,description:t.querySelector("#proj-description").value})};t.querySelectorAll("input, textarea").forEach(c=>{c.oninput=o}),t.querySelector("#btn-export").onclick=async()=>{const c={meta:x.project,entries:s,exportedAt:new Date().toISOString(),version:"1.0"},r=new Blob([JSON.stringify(c,null,2)],{type:"application/json"}),m=URL.createObjectURL(r),l=document.createElement("a");l.href=m,l.download=`${x.project.title.replace(/[^a-z0-9]/gi,"_")}_setting.json`,l.click(),URL.revokeObjectURL(m)};const a=t.querySelector("#import-file");t.querySelector("#btn-import").onclick=()=>a.click(),a.onchange=async c=>{var m;const r=c.target.files[0];if(r)try{const l=await r.text(),p=JSON.parse(l);if(p.meta&&x.updateProject(p.meta),p.entries&&Array.isArray(p.entries))for(const y of p.entries)await $.addItem(y.type,y.data);alert(`Imported ${((m=p.entries)==null?void 0:m.length)||0} entries!`),location.reload()}catch(l){alert("Import failed: "+l.message)}}}};class ee{constructor(e={}){this.title=e.title||"Modal",this.content=e.content||"",this.actions=e.actions||[],this.onClose=e.onClose||null,this.element=null}show(){this.element=document.createElement("div"),this.element.className="modal-overlay",this.element.innerHTML=`
            <div class="modal-content">
                <h3 class="modal-title">${this.title}</h3>
                <div class="modal-body"></div>
                <div class="modal-actions"></div>
            </div>
        `;const e=this.element.querySelector(".modal-body");typeof this.content=="string"?e.innerHTML=this.content:this.content instanceof HTMLElement&&e.appendChild(this.content);const s=this.element.querySelector(".modal-actions");this.actions.forEach(n=>{const i=document.createElement("button");i.className=n.className||"btn btn-secondary",i.innerText=n.label,i.onclick=()=>{n.onClick&&n.onClick(this)},s.appendChild(i)}),this.element.onclick=n=>{n.target===this.element&&this.close()},document.body.appendChild(this.element)}close(){this.element&&(this.element.remove(),this.element=null),this.onClose&&this.onClose()}getBody(){var e;return(e=this.element)==null?void 0:e.querySelector(".modal-body")}static confirm(e,s){return new Promise(n=>{const i=new ee({title:e,content:`<p>${s}</p>`,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:()=>{i.close(),n(!1)}},{label:"Confirm",className:"btn btn-primary",onClick:()=>{i.close(),n(!0)}}]});i.show()})}static alert(e,s){return new Promise(n=>{const i=new ee({title:e,content:`<p>${s}</p>`,actions:[{label:"OK",className:"btn btn-primary",onClick:()=>{i.close(),n()}}]});i.show()})}}class je{constructor(e,s={}){this.container=e,this.items=[],this.activeCategory=null,this.activeItemId=null,this.onSelect=s.onSelect||null,this.onCreate=s.onCreate||null}setItems(e){this.items=e,this.render()}setActiveItem(e){this.activeItemId=e,this.renderList()}render(){this.container.innerHTML=`
            <div id="category-tabs" class="library-tabs"></div>
            <div class="library-search-bar">
                <input id="lib-search" type="text" placeholder="Search..." class="input">
                <button id="lib-add-btn" class="btn btn-primary">+</button>
            </div>
            <div id="lib-list" class="library-list"></div>
        `,this.tabsEl=this.container.querySelector("#category-tabs"),this.searchInput=this.container.querySelector("#lib-search"),this.listEl=this.container.querySelector("#lib-list"),this.addBtn=this.container.querySelector("#lib-add-btn"),this.renderTabs(),this.renderList(),this.searchInput.oninput=()=>this.renderList(),this.addBtn.onclick=()=>{this.onCreate&&this.onCreate()}}renderTabs(){this.tabsEl.innerHTML="";const e=document.createElement("button");e.innerText="All",e.className="tab"+(this.activeCategory===null?" active":""),e.onclick=()=>{this.activeCategory=null,this.renderTabs(),this.renderList()},this.tabsEl.appendChild(e),Z().forEach(s=>{const n=document.createElement("button");n.innerText=`${s.icon} ${s.label}`,n.className="tab"+(this.activeCategory===s.id?" active":""),this.activeCategory===s.id&&(n.style.background=s.color,n.style.borderColor=s.color),n.onclick=()=>{this.activeCategory=s.id,this.renderTabs(),this.renderList()},this.tabsEl.appendChild(n)})}renderList(){var i;if(!this.listEl)return;this.listEl.innerHTML="";const e=((i=this.searchInput)==null?void 0:i.value.toLowerCase())||"",s=this.activeCategory,n=this.items.filter(o=>{const a=(o.data.name||"").toLowerCase().includes(e),c=s?o.type===s:!0;return a&&c});if(n.length===0){this.listEl.innerHTML='<div class="library-list-empty">No entries found.</div>';return}n.forEach(o=>{const a=K(o.type),c=this.activeItemId===o.id,r=document.createElement("div");r.className="list-item"+(c?" active":""),r.innerHTML=`
                <span>${a.icon}</span>
                <span class="flex-1" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${o.data.name||"Untitled"}</span>
            `,r.onclick=()=>{this.onSelect&&this.onSelect(o)},this.listEl.appendChild(r)})}}class De{constructor(e,s="",n={}){this.container=e,this.value=s,this.onChange=null,this.onLinkClick=n.onLinkClick||null,this.getEntries=n.getEntries||(()=>[])}render(){this.container.innerHTML=`
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
        `,this.editor=this.container.querySelector(".rte-content"),this.autocomplete=this.container.querySelector(".rte-autocomplete"),this.bindEvents()}renderWithLinks(e){return e.replace(/\[\[([^\]]+)\]\]/g,(s,n)=>`<span class="wiki-link" data-link="${n}">[[${n}]]</span>`)}extractRawText(e){const s=document.createElement("div");return s.innerHTML=e,s.querySelectorAll(".wiki-link").forEach(n=>{n.replaceWith(`[[${n.dataset.link}]]`)}),s.innerHTML}bindEvents(){this.container.querySelectorAll("button[data-cmd]").forEach(e=>{e.onclick=s=>{s.preventDefault();const n=e.dataset.cmd;n==="link"?this.insertLinkPlaceholder():n==="h2"||n==="h3"?document.execCommand("formatBlock",!1,n):document.execCommand(n,!1,null),this.editor.focus()}}),this.editor.oninput=()=>{this.checkForAutocomplete(),this.value=this.extractRawText(this.editor.innerHTML),this.onChange&&this.onChange(this.value)},this.editor.onclick=e=>{if(e.target.classList.contains("wiki-link")){const s=e.target.dataset.link;this.onLinkClick&&this.onLinkClick(s)}},this.editor.onkeydown=e=>{if(this.autocomplete.style.display!=="none")if(e.key==="ArrowDown"||e.key==="ArrowUp")e.preventDefault(),this.navigateAutocomplete(e.key==="ArrowDown"?1:-1);else if(e.key==="Enter"||e.key==="Tab"){const s=this.autocomplete.querySelector(".selected");s&&(e.preventDefault(),this.selectAutocompleteItem(s.dataset.name))}else e.key==="Escape"&&this.hideAutocomplete()},this.editor.onblur=()=>{setTimeout(()=>this.hideAutocomplete(),150)}}insertLinkPlaceholder(){document.execCommand("insertText",!1,"[[]]");const e=window.getSelection();if(e.rangeCount){const s=e.getRangeAt(0);s.setStart(s.startContainer,s.startOffset-2),s.collapse(!0),e.removeAllRanges(),e.addRange(s)}}checkForAutocomplete(){const e=window.getSelection();if(!e.rangeCount)return;const s=e.getRangeAt(0),n=s.startContainer;if(n.nodeType!==Node.TEXT_NODE)return;const o=n.textContent.substring(0,s.startOffset).match(/\[\[([^\]]*?)$/);if(o){const a=o[1].toLowerCase(),c=this.getEntries().filter(r=>(r.data.name||"").toLowerCase().includes(a)).slice(0,8);c.length>0?this.showAutocomplete(c):this.hideAutocomplete()}else this.hideAutocomplete()}showAutocomplete(e){this.autocomplete.innerHTML="",e.forEach((s,n)=>{const i=document.createElement("div");i.dataset.name=s.data.name,i.className="rte-autocomplete-item"+(n===0?" selected":""),i.innerText=s.data.name||"Untitled",i.onmousedown=o=>{o.preventDefault(),this.selectAutocompleteItem(s.data.name)},this.autocomplete.appendChild(i)}),this.autocomplete.style.display="block",this.autocomplete.style.left="16px",this.autocomplete.style.bottom="16px"}hideAutocomplete(){this.autocomplete.style.display="none"}navigateAutocomplete(e){var o,a;const s=Array.from(this.autocomplete.children),n=s.findIndex(c=>c.classList.contains("selected"));(o=s[n])==null||o.classList.remove("selected");const i=Math.max(0,Math.min(s.length-1,n+e));(a=s[i])==null||a.classList.add("selected")}selectAutocompleteItem(e){const s=window.getSelection();if(!s.rangeCount)return;const n=s.getRangeAt(0),i=n.startContainer;if(i.nodeType!==Node.TEXT_NODE)return;const o=i.textContent,a=o.substring(0,n.startOffset);if(a.match(/\[\[([^\]]*?)$/)){const r=a.lastIndexOf("[["),m=o.substring(n.startOffset),l=m.indexOf("]]"),p=l>=0?m.substring(l+2):m,y=document.createElement("span");y.className="wiki-link",y.dataset.link=e,y.innerText=`[[${e}]]`;const w=document.createTextNode(o.substring(0,r)),h=document.createTextNode(" "+p),u=i.parentNode;u.insertBefore(w,i),u.insertBefore(y,i),u.insertBefore(h,i),u.removeChild(i);const d=document.createRange();d.setStartAfter(y),d.collapse(!0),s.removeAllRanges(),s.addRange(d)}this.hideAutocomplete(),this.value=this.extractRawText(this.editor.innerHTML),this.onChange&&this.onChange(this.value)}getValue(){return this.extractRawText(this.editor.innerHTML)}setValue(e){this.value=e,this.editor&&(this.editor.innerHTML=this.renderWithLinks(e))}}class Oe{constructor(e,s={}){this.container=e,this.item=null,this.onSave=s.onSave||null,this.onNameChange=s.onNameChange||null,this.onLinkClick=s.onLinkClick||null,this.getEntries=s.getEntries||(()=>[]),this.editorInstance=null}setItem(e){this.item=e,e?this.render():this.showEmpty()}showEmpty(){this.container.innerHTML=`
            <div class="empty-state">
                <h2>Select an entry</h2>
                <p>Or create a new one to start building your world.</p>
            </div>
        `}render(){if(!this.item)return this.showEmpty();const e=K(this.item.type);this.container.innerHTML=`
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
        `;const s=this.container.querySelector("#asset-title"),n=this.container.querySelector("#metadata-fields"),i=this.container.querySelector("#asset-rte-mount");this.container.querySelector("#save-status"),e.fields.forEach(c=>{const r=document.createElement("div");r.className="metadata-field";const m=document.createElement("label");m.innerText=c.label,m.className="label";let l;c.type==="textarea"?(l=document.createElement("textarea"),l.rows=2,l.className="textarea"):(l=document.createElement("input"),l.type="text",l.className="input"),l.value=this.item.data[c.key]||"",l.oninput=()=>{this.item.data[c.key]=l.value,this.save()},r.appendChild(m),r.appendChild(l),n.appendChild(r)});const o=new De(i,this.item.data.description||"",{getEntries:this.getEntries,onLinkClick:this.onLinkClick});o.render(),this.editorInstance=o,o.onChange=c=>{this.item.data.description=c,this.save()};let a=null;s.oninput=()=>{this.item.data.name=s.value,this.save(),clearTimeout(a),a=setTimeout(()=>{this.onNameChange&&this.onNameChange(this.item)},300)}}async save(){const e=this.container.querySelector("#save-status");e&&(e.innerText="Saving..."),this.onSave&&await this.onSave(this.item),e&&(e.innerText="Saved")}}const oe={member_of:{id:"member_of",label:"Member of",icon:"👥",inverse:"has_member",description:"This entry is a member of the target."},has_member:{id:"has_member",label:"Has Member",icon:"👤",inverse:"member_of",description:"The target is a member of this entry."},located_in:{id:"located_in",label:"Located in",icon:"📍",inverse:"contains",description:"This entry is located within the target."},contains:{id:"contains",label:"Contains",icon:"🗺️",inverse:"located_in",description:"This entry contains the target."},ally_of:{id:"ally_of",label:"Ally of",icon:"🤝",inverse:"ally_of",description:"This entry is allied with the target."},enemy_of:{id:"enemy_of",label:"Enemy of",icon:"⚔️",inverse:"enemy_of",description:"This entry is an enemy of the target."},parent_of:{id:"parent_of",label:"Parent of",icon:"👨‍👧",inverse:"child_of",description:"This entry is the parent of the target."},child_of:{id:"child_of",label:"Child of",icon:"👶",inverse:"parent_of",description:"This entry is the child of the target."},related_to:{id:"related_to",label:"Related to",icon:"🔗",inverse:"related_to",description:"Generic relationship."},created_by:{id:"created_by",label:"Created by",icon:"🛠️",inverse:"creator_of",description:"This entry was created by the target."},creator_of:{id:"creator_of",label:"Creator of",icon:"✨",inverse:"created_by",description:"This entry created the target."}},ae=t=>oe[t]||oe.related_to,_e=()=>Object.values(oe);class He{constructor(e,s={}){this.container=e,this.item=null,this.allItems=[],this.onSave=s.onSave||null,this.onNavigate=s.onNavigate||null}setItem(e,s){this.item=e,this.allItems=s,e&&this.render()}render(){this.item&&(this.item.data.relationships||(this.item.data.relationships=[]),this.container.innerHTML=`
            <div class="relationships-header">
                <div class="label">Relationships</div>
                <button id="add-relationship-btn" class="btn btn-primary" style="padding:4px 10px; font-size:11px;">+ Add</button>
            </div>
            <div id="relationships-list" class="relationships-list"></div>
            <div id="back-references" class="back-references"></div>
        `,this.renderRelationships(),this.container.querySelector("#add-relationship-btn").onclick=()=>this.showAddModal())}renderRelationships(){const e=this.container.querySelector("#relationships-list"),s=this.container.querySelector("#back-references");e.innerHTML="",this.item.data.relationships.length===0?e.innerHTML='<div class="text-muted text-sm">No relationships defined.</div>':(this.item.data.relationships.forEach((i,o)=>{const a=ae(i.type),c=this.allItems.find(p=>p.id===i.targetId),r=c?c.data.name||"Untitled":"(Deleted)",m=c?K(c.type):{icon:"❓"},l=document.createElement("div");l.className="relationship-row",l.innerHTML=`
                    <span>${a.icon}</span>
                    <span class="relationship-type">${a.label}</span>
                    <span class="relationship-target" data-id="${i.targetId}">${m.icon} ${r}</span>
                    <button class="relationship-delete" data-idx="${o}">×</button>
                `,e.appendChild(l)}),e.querySelectorAll(".relationship-target").forEach(i=>{i.onclick=()=>{const o=this.allItems.find(a=>a.id===i.dataset.id);o&&this.onNavigate&&this.onNavigate(o)}}),e.querySelectorAll(".relationship-delete").forEach(i=>{i.onclick=()=>{this.item.data.relationships.splice(parseInt(i.dataset.idx),1),this.onSave&&this.onSave(this.item),this.renderRelationships()}}));const n=this.allItems.filter(i=>{var o;return i.id!==this.item.id&&((o=i.data.relationships)==null?void 0:o.some(a=>a.targetId===this.item.id))});s.innerHTML="",n.length===0?s.innerHTML='<div class="text-muted text-xs">No incoming references.</div>':(s.innerHTML='<div class="back-ref-label">Referenced by:</div>',n.forEach(i=>{const o=K(i.type);i.data.relationships.filter(c=>c.targetId===this.item.id).forEach(c=>{const r=ae(c.type),m=oe[r.inverse],l=document.createElement("div");l.className="back-ref-item",l.innerHTML=`<span>${o.icon}</span> ${i.data.name||"Untitled"} <span class="text-muted">(${(m==null?void 0:m.label)||r.label})</span>`,l.onclick=()=>{this.onNavigate&&this.onNavigate(i)},s.appendChild(l)})}))}showAddModal(){const e=document.createElement("div");e.className="flex flex-col gap-md",e.innerHTML=`
            <div>
                <label class="label">Type</label>
                <select id="rel-type-select" class="input" style="width:100%; margin-top:4px;"></select>
            </div>
            <div>
                <label class="label">Target Entry</label>
                <select id="rel-target-select" class="input" style="width:100%; margin-top:4px;"></select>
            </div>
        `,new ee({title:"Add Relationship",content:e,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:o=>o.close()},{label:"Add",className:"btn btn-primary",onClick:o=>{const a=e.querySelector("#rel-type-select"),c=e.querySelector("#rel-target-select"),r=a.value,m=c.value;r&&m&&(this.item.data.relationships.push({type:r,targetId:m}),this.onSave&&this.onSave(this.item),this.renderRelationships()),o.close()}}]}).show();const n=e.querySelector("#rel-type-select"),i=e.querySelector("#rel-target-select");_e().forEach(o=>{const a=document.createElement("option");a.value=o.id,a.innerText=`${o.icon} ${o.label}`,n.appendChild(a)}),this.allItems.filter(o=>o.id!==this.item.id).forEach(o=>{const a=K(o.type),c=document.createElement("option");c.value=o.id,c.innerText=`${a.icon} ${o.data.name||"Untitled"}`,i.appendChild(c)})}}const S={id:"library",label:"Library",icon:"📚",entryList:null,entryEditor:null,relationshipManager:null,allItems:[],activeItem:null,render:async(t,e)=>{try{await $.init()}catch(o){t.innerHTML=`<div class="text-muted">Vault Error: ${o.message}</div>`;return}t.innerHTML=`
            <div class="library-layout">
                <div id="lib-sidebar" class="library-sidebar"></div>
                <div id="lib-main" class="library-main">
                    <div id="lib-editor-area"></div>
                    <div id="lib-relationships-area" class="relationships-section" style="display:none;"></div>
                </div>
            </div>
        `;const s=t.querySelector("#lib-sidebar"),n=t.querySelector("#lib-editor-area"),i=t.querySelector("#lib-relationships-area");if(S.allItems=await $.list(),S.entryList=new je(s,{onSelect:o=>S.selectItem(o,n,i),onCreate:()=>S.showCreateModal()}),S.entryList.setItems(S.allItems),S.entryEditor=new Oe(n,{onSave:async o=>{await $.updateItem(o)},onNameChange:o=>{S.entryList.setItems(S.allItems)},onLinkClick:o=>{const a=S.allItems.find(c=>(c.data.name||"").toLowerCase()===o.toLowerCase());a&&S.selectItem(a,n,i)},getEntries:()=>S.allItems}),S.entryEditor.showEmpty(),S.relationshipManager=new He(i,{onSave:async o=>{await $.updateItem(o)},onNavigate:o=>{S.selectItem(o,n,i)}}),x.session.activeEntryId){const o=S.allItems.find(a=>a.id===x.session.activeEntryId);o&&S.selectItem(o,n,i)}},selectItem(t,e,s){S.activeItem=t,S.entryList.setActiveItem(t.id),S.entryEditor.setItem(t),s.style.display="block",S.relationshipManager.setItem(t,S.allItems),x.updateSession({activeEntryId:t.id})},showCreateModal(){const t=document.createElement("div");t.className="grid-3",Z().forEach(s=>{const n=document.createElement("button");n.className="btn btn-secondary",n.style.cssText="flex-direction:column; padding:12px;",n.innerHTML=`<span style="font-size:20px;">${s.icon}</span><span class="text-xs">${s.label}</span>`,n.onclick=async()=>{e.close();const i=await $.addItem(s.id,{name:`New ${s.label}`,description:""});S.allItems.push(i),S.entryList.setItems(S.allItems);const o=document.querySelector("#lib-editor-area"),a=document.querySelector("#lib-relationships-area");S.selectItem(i,o,a)},t.appendChild(n)});const e=new ee({title:"Create New Entry",content:t,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:s=>s.close()}]});e.show()}},Be="samildanach_rules",Fe=1,P="rules";let T=null;const Y={init:function(){return new Promise((t,e)=>{if(T){t(T);return}const s=indexedDB.open(Be,Fe);s.onerror=n=>{console.error("[RulesDB] Failed to open database:",n.target.error),e(n.target.error)},s.onsuccess=n=>{T=n.target.result,console.log("[RulesDB] Database opened successfully"),t(T)},s.onupgradeneeded=n=>{const i=n.target.result;if(!i.objectStoreNames.contains(P)){const o=i.createObjectStore(P,{keyPath:"id"});o.createIndex("type","type",{unique:!1}),o.createIndex("updatedAt","updatedAt",{unique:!1}),console.log("[RulesDB] Rules store created")}}})},list:function(t={}){return new Promise((e,s)=>{if(!T){s(new Error("RulesDB not initialized"));return}const i=T.transaction(P,"readonly").objectStore(P);let o;t.type?o=i.index("type").openCursor(IDBKeyRange.only(t.type)):o=i.openCursor();const a=[];o.onsuccess=c=>{const r=c.target.result;r?(a.push(r.value),r.continue()):(a.sort((m,l)=>new Date(l.updatedAt).getTime()-new Date(m.updatedAt).getTime()),e(a))},o.onerror=c=>s(c.target.error)})},get:function(t){return new Promise((e,s)=>{if(!T){s(new Error("RulesDB not initialized"));return}const o=T.transaction(P,"readonly").objectStore(P).get(t);o.onsuccess=()=>e(o.result||null),o.onerror=a=>s(a.target.error)})},add:function(t,e){return new Promise((s,n)=>{if(!T){n(new Error("RulesDB not initialized"));return}const i=new Date().toISOString();let o;try{o=O&&O.generateId?O.generateId("rule"):`rule_${crypto.randomUUID().split("-")[0]}`}catch{o="rule_"+Date.now()}const a={id:o,type:t,createdAt:i,updatedAt:i,data:e},m=T.transaction(P,"readwrite").objectStore(P).add(a);m.onsuccess=()=>{console.log("[RulesDB] Added rule:",o),s(a)},m.onerror=l=>{console.error("[RulesDB] Add failed:",l.target.error),n(l.target.error)}})},update:function(t){return new Promise((e,s)=>{if(!T){s(new Error("RulesDB not initialized"));return}t.updatedAt=new Date().toISOString();const o=T.transaction(P,"readwrite").objectStore(P).put(t);o.onsuccess=()=>e(t),o.onerror=a=>s(a.target.error)})},delete:function(t){return new Promise((e,s)=>{if(!T){s(new Error("RulesDB not initialized"));return}const o=T.transaction(P,"readwrite").objectStore(P).delete(t);o.onsuccess=()=>{console.log("[RulesDB] Deleted rule:",t),e()},o.onerror=a=>s(a.target.error)})},exportAll:function(){return this.list()},importAll:function(t){return new Promise(async(e,s)=>{if(!T){s(new Error("RulesDB not initialized"));return}let n=0;for(const i of t)try{const o={...i,id:O.generateId("rule"),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};await this.add(o.type,o.data),n++}catch(o){console.warn("[RulesDB] Import skip:",o)}e(n)})}},qe=[{id:"item",label:"Item",icon:"⚔️",color:"#f59e0b",description:"Weapons, armor, consumables, and equipment",fields:[{key:"type",label:"Type",placeholder:"weapon, armor, consumable, tool..."},{key:"rarity",label:"Rarity",placeholder:"common, uncommon, rare, legendary..."},{key:"damage",label:"Damage/Effect",placeholder:"1d8 slashing, +2 AC..."},{key:"properties",label:"Properties",placeholder:"versatile, finesse, two-handed..."},{key:"value",label:"Value",placeholder:"50 gold, priceless..."},{key:"weight",label:"Weight",placeholder:"3 lbs, light..."}]},{id:"spell",label:"Spell",icon:"✨",color:"#8b5cf6",description:"Magic spells and mystical abilities",fields:[{key:"level",label:"Level",placeholder:"Cantrip, 1st, 2nd..."},{key:"school",label:"School",placeholder:"Evocation, Necromancy..."},{key:"castTime",label:"Cast Time",placeholder:"1 action, bonus action, ritual..."},{key:"range",label:"Range",placeholder:"60 feet, touch, self..."},{key:"duration",label:"Duration",placeholder:"Instantaneous, 1 minute, concentration..."},{key:"damage",label:"Effect/Damage",placeholder:"3d6 fire, heals 2d8+3..."},{key:"components",label:"Components",placeholder:"V, S, M (a bat guano)..."}]},{id:"ability",label:"Ability",icon:"💪",color:"#ef4444",description:"Class features, racial traits, and special abilities",fields:[{key:"source",label:"Source",placeholder:"Fighter 3, Elf racial, feat..."},{key:"usage",label:"Usage",placeholder:"At will, 1/short rest, 3/long rest..."},{key:"action",label:"Action Cost",placeholder:"Action, bonus action, reaction..."},{key:"effect",label:"Effect",placeholder:"Add 1d6 to attack, advantage on saves..."},{key:"prerequisite",label:"Prerequisite",placeholder:"STR 13, proficiency in..."}]},{id:"condition",label:"Condition",icon:"🔥",color:"#06b6d4",description:"Status effects, buffs, debuffs, and environmental conditions",fields:[{key:"type",label:"Type",placeholder:"debuff, buff, environmental..."},{key:"effect",label:"Effect",placeholder:"Disadvantage on attacks, -2 AC..."},{key:"duration",label:"Duration",placeholder:"1 round, until cured, permanent..."},{key:"removal",label:"Removal",placeholder:"Lesser restoration, DC 15 CON save..."},{key:"stacking",label:"Stacking",placeholder:"Does not stack, stacks to 3..."}]},{id:"rule",label:"Rule",icon:"📜",color:"#22c55e",description:"Custom game rules, house rules, and mechanics",fields:[{key:"category",label:"Category",placeholder:"Combat, exploration, social, rest..."},{key:"trigger",label:"Trigger",placeholder:"When attacking, on critical hit..."},{key:"resolution",label:"Resolution",placeholder:"Roll contested Athletics, DC = 10 + CR..."},{key:"consequences",label:"Consequences",placeholder:"On success... On failure..."}]}];function Ue(){return qe}function Me(t){return qe.find(e=>e.id===t)}const M={id:"grimoire",label:"Grimoire",icon:"📖",_state:{activeCategory:"item",selectedRuleId:null,searchQuery:""},render:async t=>{var m;await Y.init();let e=await Y.list();const s=Ue();let n=M._state.activeCategory||((m=s[0])==null?void 0:m.id)||"item",i=M._state.selectedRuleId,o=i?e.find(l=>l.id===i):null,a=M._state.searchQuery||"",c=null;async function r(){var w,h,u;e=await Y.list(),o=i?e.find(d=>d.id===i):null;const l=Me(n);let p=e.filter(d=>d.type===n);if(a){const d=a.toLowerCase();p=p.filter(b=>(b.data.name||"").toLowerCase().includes(d)||(b.data.description||"").toLowerCase().includes(d)||Object.values(b.data).some(f=>typeof f=="string"&&f.toLowerCase().includes(d)))}t.innerHTML=`
                <div class="grimoire-layout">
                    <!-- Left: Categories + List -->
                    <div class="grimoire-sidebar">
                        <div class="sidebar-header">
                            <strong>📖 Grimoire</strong>
                        </div>

                        <!-- Category Tabs -->
                        <div class="category-tabs">
                            ${s.map(d=>`
                                <button class="cat-tab ${d.id===n?"active":""}" 
                                        data-cat="${d.id}" 
                                        style="--cat-color: ${d.color}"
                                        title="${d.description}">
                                    ${d.icon}
                                </button>
                            `).join("")}
                        </div>

                        <!-- Search -->
                        <div style="padding: 0 8px 8px 8px;">
                            <input type="text" id="grimoire-search" class="input input-sm" 
                                   style="width: 100%;" 
                                   placeholder="Search ${(l==null?void 0:l.label)||"rules"}..." 
                                   value="${a}">
                        </div>

                        <!-- Rule List -->
                        <div class="rule-list">
                            ${p.length===0?`
                                <div class="empty-state">
                                    <div class="empty-icon">${a?"🔍":(l==null?void 0:l.icon)||"📖"}</div>
                                    <div class="empty-text">${a?"No matches":`No ${(l==null?void 0:l.label)||"rules"} yet`}</div>
                                </div>
                            `:p.map(d=>`
                                <div class="rule-item ${(o==null?void 0:o.id)===d.id?"selected":""}" data-id="${d.id}">
                                    <div class="rule-icon" style="color: ${l==null?void 0:l.color}">${l==null?void 0:l.icon}</div>
                                    <div class="rule-info">
                                        <div class="rule-name">${d.data.name||"Untitled"}</div>
                                        <div class="rule-meta">${d.data.type||d.data.level||""}</div>
                                    </div>
                                </div>
                            `).join("")}
                        </div>

                        <div class="sidebar-footer">
                            <button id="btn-add-rule" class="btn btn-primary btn-sm">+ Add ${(l==null?void 0:l.label)||"Rule"}</button>
                        </div>
                    </div>

                    <!-- Right: Editor -->
                    <div class="grimoire-main">
                        ${o?`
                            <div class="rule-editor">
                                <div class="editor-header">
                                    <input type="text" id="rule-name" class="input input-lg" 
                                           value="${o.data.name||""}" 
                                           placeholder="${(l==null?void 0:l.label)||"Rule"} Name">
                                    <button id="btn-delete-rule" class="btn btn-ghost btn-sm" title="Delete">🗑️</button>
                                </div>

                                <div class="editor-fields">
                                    ${((l==null?void 0:l.fields)||[]).map(d=>`
                                        <div class="field-group">
                                            <label class="field-label">${d.label}</label>
                                            <input type="text" 
                                                   class="input field-input" 
                                                   data-field="${d.key}"
                                                   value="${o.data[d.key]||""}"
                                                   placeholder="${d.placeholder||""}">
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
                                <div class="empty-text">Select or create a ${(l==null?void 0:l.label)||"rule"}</div>
                            </div>
                        `}
                    </div>
                </div>
            `,t.querySelectorAll(".cat-tab").forEach(d=>{d.onclick=()=>{n=d.dataset.cat,i=null,o=null,a="",M._state.activeCategory=n,M._state.selectedRuleId=null,M._state.searchQuery="",r()}});const y=t.querySelector("#grimoire-search");if(y&&(y.oninput=d=>{a=d.target.value,M._state.searchQuery=a,r().then(()=>{const b=t.querySelector("#grimoire-search");b&&(b.focus(),b.setSelectionRange(b.value.length,b.value.length))})}),t.querySelectorAll(".rule-item").forEach(d=>{d.onclick=()=>{i=d.dataset.id,o=e.find(b=>b.id===i),M._state.selectedRuleId=i,r()}}),(w=t.querySelector("#btn-add-rule"))==null||w.addEventListener("click",async()=>{const d=await Y.add(n,{name:`New ${(l==null?void 0:l.label)||"Rule"}`,description:""});console.log("[Grimoire] Created rule:",d.id),i=d.id,M._state.selectedRuleId=i,a="",M._state.searchQuery="",r()}),(h=t.querySelector("#btn-delete-rule"))==null||h.addEventListener("click",async()=>{o&&confirm(`Delete "${o.data.name||"this rule"}"?`)&&(await Y.delete(o.id),console.log("[Grimoire] Deleted rule:",o.id),i=null,o=null,M._state.selectedRuleId=null,r())}),(u=t.querySelector("#btn-save-rule"))==null||u.addEventListener("click",async()=>{var f;if(!o)return;const b={name:((f=t.querySelector("#rule-name"))==null?void 0:f.value)||""};t.querySelectorAll(".field-input").forEach(g=>{b[g.dataset.field]=g.value}),c&&(b.description=c.getValue()),o.data=b,await Y.update(o),console.log("[Grimoire] Saved rule:",o.id,b),r()}),o){const d=t.querySelector("#description-editor");d&&(c=new De(d,o.data.description||""),c.render())}}await r()}},ke={id:"graph",label:"Graph",icon:"🕸️",render:async(t,e)=>{try{await $.init()}catch(f){t.innerHTML=`<div class="text-muted">Vault Error: ${f.message}</div>`;return}t.style.padding="0",t.innerHTML=`
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
        `;const s=t.querySelector("#graph-container"),n=t.querySelector("#graph-canvas"),i=n.getContext("2d"),o=()=>{n.width=s.clientWidth,n.height=s.clientHeight};o(),window.addEventListener("resize",o);const a=await $.list(),c=a.map((f,g)=>{const v=K(f.type),k=g/a.length*Math.PI*2,E=Math.min(n.width,n.height)*.3;return{id:f.id,item:f,label:f.data.name||"Untitled",icon:v.icon,color:v.color,x:n.width/2+Math.cos(k)*E,y:n.height/2+Math.sin(k)*E,vx:0,vy:0}}),r=Object.fromEntries(c.map(f=>[f.id,f])),m=[];a.forEach(f=>{(f.data.relationships||[]).forEach(g=>{if(r[g.targetId]){const v=ae(g.type);m.push({from:f.id,to:g.targetId,label:v.label,color:v.icon})}})});let l={x:0,y:0,scale:1},p=!1,y={x:0,y:0},w=null;const h=()=>{i.clearRect(0,0,n.width,n.height),i.save(),i.translate(l.x,l.y),i.scale(l.scale,l.scale),i.lineWidth=2,m.forEach(f=>{const g=r[f.from],v=r[f.to];g&&v&&(i.strokeStyle="rgba(100, 116, 139, 0.5)",i.beginPath(),i.moveTo(g.x,g.y),i.lineTo(v.x,v.y),i.stroke())}),c.forEach(f=>{i.fillStyle=f.color||"#6366f1",i.beginPath(),i.arc(f.x,f.y,24,0,Math.PI*2),i.fill(),i.font="16px sans-serif",i.textAlign="center",i.textBaseline="middle",i.fillStyle="#fff",i.fillText(f.icon,f.x,f.y),i.font="11px sans-serif",i.fillStyle="var(--text-primary)",i.fillText(f.label,f.x,f.y+36)}),i.restore()},u=()=>{const f=n.width/2,g=n.height/2;c.forEach(v=>{c.forEach(k=>{if(v.id===k.id)return;const E=v.x-k.x,_=v.y-k.y,N=Math.sqrt(E*E+_*_)||1,H=5e3/(N*N);v.vx+=E/N*H,v.vy+=_/N*H}),v.vx+=(f-v.x)*.001,v.vy+=(g-v.y)*.001}),m.forEach(v=>{const k=r[v.from],E=r[v.to];if(k&&E){const _=E.x-k.x,N=E.y-k.y,H=Math.sqrt(_*_+N*N)||1,z=(H-150)*.01;k.vx+=_/H*z,k.vy+=N/H*z,E.vx-=_/H*z,E.vy-=N/H*z}}),c.forEach(v=>{w!==v&&(v.x+=v.vx*.1,v.y+=v.vy*.1),v.vx*=.9,v.vy*=.9}),h(),requestAnimationFrame(u)};u();const d=f=>({x:(f.offsetX-l.x)/l.scale,y:(f.offsetY-l.y)/l.scale}),b=(f,g)=>c.find(v=>{const k=v.x-f,E=v.y-g;return Math.sqrt(k*k+E*E)<24});n.onmousedown=f=>{const g=d(f),v=b(g.x,g.y);v?w=v:(p=!0,y={x:f.clientX,y:f.clientY})},n.onmousemove=f=>{if(w){const g=d(f);w.x=g.x,w.y=g.y}else p&&(l.x+=f.clientX-y.x,l.y+=f.clientY-y.y,y={x:f.clientX,y:f.clientY})},n.onmouseup=()=>{w=null,p=!1},n.onwheel=f=>{f.preventDefault();const g=f.deltaY>0?.9:1.1;l.scale*=g,l.scale=Math.min(Math.max(.3,l.scale),3)},t.querySelector("#graph-reset").onclick=()=>{l={x:0,y:0,scale:1}},t.querySelector("#graph-relayout").onclick=()=>{c.forEach((f,g)=>{const v=g/c.length*Math.PI*2,k=Math.min(n.width,n.height)*.3;f.x=n.width/2+Math.cos(v)*k,f.y=n.height/2+Math.sin(v)*k,f.vx=0,f.vy=0})}}};class Ve{constructor(e,s,n){this.container=e,this.nodeLayer=s,this.svgLayer=n,this.nodes=[],this.links=[],this.transform={x:0,y:0,scale:1},this.isDragging=!1,this.lastMouse={x:0,y:0},this.isWiring=!1,this.wireFrom=null,this.wireLine=null,this.selectedLink=null,this.onDataChange=null}init(){this.container.onmousedown=e=>{(e.button===1||e.button===0&&e.altKey)&&(this.isDragging=!0,this.lastMouse={x:e.clientX,y:e.clientY},this.container.style.cursor="grabbing",e.preventDefault())},this.container.onmousemove=e=>{if(this.isDragging){const s=e.clientX-this.lastMouse.x,n=e.clientY-this.lastMouse.y;this.transform.x+=s,this.transform.y+=n,this.lastMouse={x:e.clientX,y:e.clientY},this.updateTransform()}if(this.isWiring&&this.wireLine){const s=this.container.getBoundingClientRect(),n=e.clientX-s.left,i=e.clientY-s.top;this.updateWirePreview(n,i)}},this.container.onmouseup=e=>{this.isDragging=!1,this.container.style.cursor="default",this.isWiring&&this.cancelWiring()},this.container.onwheel=e=>{e.preventDefault();const s=e.deltaY>0?.9:1.1;this.transform.scale*=s,this.transform.scale=Math.min(Math.max(.2,this.transform.scale),2),this.updateTransform()},window.addEventListener("keydown",e=>{e.key==="Delete"&&this.selectedLink&&(this.deleteLink(this.selectedLink),this.selectedLink=null)})}exportData(){return{nodes:this.nodes,links:this.links,transform:this.transform}}importData(e){e&&(this.nodes=[],this.links=[],this.nodeLayer.innerHTML="",e.transform&&(this.transform=e.transform,this.updateTransform()),e.nodes&&e.nodes.forEach(s=>this.addNode(s,!0)),this.links=e.links||[],this.updateLinks())}notifyChange(){this.onDataChange&&this.onDataChange(this.exportData())}updateTransform(){this.nodeLayer.style.transform=`translate(${this.transform.x}px, ${this.transform.y}px) scale(${this.transform.scale})`,this.updateLinks()}resetView(){this.transform={x:0,y:0,scale:1},this.updateTransform()}addNode(e,s=!1){this.nodes.push(e);const n=this.renderNodeElement(e);this.nodeLayer.appendChild(n),s||this.notifyChange()}renderNodeElement(e){const s=document.createElement("div");s.className="node"+(e.type?` ${e.type}`:""),s.id=e.id,s.style.left=e.x+"px",s.style.top=e.y+"px";let n=(e.inputs||[]).map(p=>`
            <div class="socket-row">
                <div class="socket input" 
                     data-node-id="${e.id}" 
                     data-socket-type="input" 
                     data-socket-name="${p}" 
                     title="${p}"></div>
                <span>${p}</span>
            </div>
        `).join(""),i=(e.outputs||[]).map(p=>`
            <div class="socket-row" style="justify-content: flex-end;">
                <span>${p}</span>
                <div class="socket output" 
                     data-node-id="${e.id}" 
                     data-socket-type="output" 
                     data-socket-name="${p}" 
                     title="${p}"></div>
            </div>
        `).join("");s.innerHTML=`
            <div class="node-header">${e.title}</div>
            <div class="node-body">
                ${n}
                ${i}
            </div>
        `;const o=s.querySelector(".node-header");let a=!1,c={x:0,y:0},r={x:e.x,y:e.y};o.onmousedown=p=>{p.button===0&&(a=!0,c={x:p.clientX,y:p.clientY},r={x:e.x,y:e.y},s.classList.add("selected"),p.stopPropagation())};const m=p=>{if(a){const y=(p.clientX-c.x)/this.transform.scale,w=(p.clientY-c.y)/this.transform.scale;e.x=r.x+y,e.y=r.y+w,s.style.left=e.x+"px",s.style.top=e.y+"px",this.updateLinks()}},l=()=>{a&&(a=!1,s.classList.remove("selected"),this.notifyChange())};return window.addEventListener("mousemove",m),window.addEventListener("mouseup",l),s.querySelectorAll(".socket").forEach(p=>{p.onmousedown=y=>{y.stopPropagation(),this.startWiring(p)},p.onmouseup=y=>{y.stopPropagation(),this.isWiring&&this.completeWiring(p)}}),s}startWiring(e){const s=e.dataset.nodeId,n=e.dataset.socketType,i=e.dataset.socketName;this.isWiring=!0,this.wireFrom={nodeId:s,socket:i,type:n,element:e},this.wireLine=document.createElementNS("http://www.w3.org/2000/svg","path"),this.wireLine.setAttribute("class","connection-line wiring"),this.svgLayer.appendChild(this.wireLine),e.classList.add("wiring")}updateWirePreview(e,s){if(!this.wireFrom||!this.wireLine)return;const n=this.getSocketPosition(this.wireFrom.element),i=n.x,o=n.y,a=e,c=s,r=this.wireFrom.type==="output"?i+50:i-50,m=this.wireFrom.type==="output"?a-50:a+50,l=`M ${i} ${o} C ${r} ${o}, ${m} ${c}, ${a} ${c}`;this.wireLine.setAttribute("d",l)}completeWiring(e){if(!this.wireFrom)return;const s=e.dataset.nodeId,n=e.dataset.socketType,i=e.dataset.socketName;if(this.wireFrom.type===n){console.log("[Canvas] Cannot connect same socket types"),this.cancelWiring();return}if(this.wireFrom.nodeId===s){console.log("[Canvas] Cannot connect node to itself"),this.cancelWiring();return}let o,a;if(this.wireFrom.type==="output"?(o={nodeId:this.wireFrom.nodeId,socket:this.wireFrom.socket},a={nodeId:s,socket:i}):(o={nodeId:s,socket:i},a={nodeId:this.wireFrom.nodeId,socket:this.wireFrom.socket}),!this.links.some(r=>r.from.nodeId===o.nodeId&&r.from.socket===o.socket&&r.to.nodeId===a.nodeId&&r.to.socket===a.socket)){const r={id:"link_"+Date.now(),from:o,to:a};this.links.push(r),console.log("[Canvas] Created link:",r),this.notifyChange()}this.cancelWiring(),this.updateLinks()}cancelWiring(){var e;this.wireLine&&(this.wireLine.remove(),this.wireLine=null),(e=this.wireFrom)!=null&&e.element&&this.wireFrom.element.classList.remove("wiring"),this.isWiring=!1,this.wireFrom=null}getSocketPosition(e){const s=this.container.getBoundingClientRect(),n=e.getBoundingClientRect();return{x:n.left+n.width/2-s.left,y:n.top+n.height/2-s.top}}deleteLink(e){const s=this.links.findIndex(n=>n.id===e);s>=0&&(this.links.splice(s,1),this.updateLinks(),this.notifyChange())}updateLinks(){this.svgLayer.innerHTML="",this.links.forEach(e=>{const s=this.nodeLayer.querySelector(`#${e.from.nodeId}`),n=this.nodeLayer.querySelector(`#${e.to.nodeId}`);if(!s||!n)return;const i=s.querySelector(`.socket.output[data-socket-name="${e.from.socket}"]`),o=n.querySelector(`.socket.input[data-socket-name="${e.to.socket}"]`);if(!i||!o)return;const a=this.getSocketPosition(i),c=this.getSocketPosition(o),r=document.createElementNS("http://www.w3.org/2000/svg","path"),m=a.x+50,l=c.x-50,p=`M ${a.x} ${a.y} C ${m} ${a.y}, ${l} ${c.y}, ${c.x} ${c.y}`;r.setAttribute("d",p),r.setAttribute("class","connection-line"+(e.id===this.selectedLink?" selected":"")),r.dataset.linkId=e.id,r.onclick=y=>{y.stopPropagation(),this.selectedLink=e.id,this.updateLinks()},this.svgLayer.appendChild(r)})}}const Ge="samildanach_flows",We=1,j="flows";let D=null;const A={init:function(){return new Promise((t,e)=>{if(D){t(D);return}const s=indexedDB.open(Ge,We);s.onerror=n=>{console.error("[FlowsDB] Failed to open database:",n.target.error),e(n.target.error)},s.onsuccess=n=>{D=n.target.result,console.log("[FlowsDB] Database opened successfully"),t(D)},s.onupgradeneeded=n=>{const i=n.target.result;i.objectStoreNames.contains(j)||(i.createObjectStore(j,{keyPath:"id"}).createIndex("updatedAt","updatedAt",{unique:!1}),console.log("[FlowsDB] Flows store created"))}})},list:function(){return new Promise((t,e)=>{if(!D){e(new Error("FlowsDB not initialized"));return}const i=D.transaction(j,"readonly").objectStore(j).openCursor(),o=[];i.onsuccess=a=>{const c=a.target.result;c?(o.push(c.value),c.continue()):(o.sort((r,m)=>new Date(m.updatedAt).getTime()-new Date(r.updatedAt).getTime()),t(o))},i.onerror=a=>e(a.target.error)})},get:function(t){return new Promise((e,s)=>{if(!D){s(new Error("FlowsDB not initialized"));return}const o=D.transaction(j,"readonly").objectStore(j).get(t);o.onsuccess=()=>e(o.result||null),o.onerror=a=>s(a.target.error)})},create:function(t){return new Promise((e,s)=>{if(!D){s(new Error("FlowsDB not initialized"));return}const n=new Date().toISOString();let i;try{i=O&&O.generateId?O.generateId("flow"):`flow_${crypto.randomUUID().split("-")[0]}`}catch{i="flow_"+Date.now()}const o={id:i,name:t||"Untitled Flow",description:"",createdAt:n,updatedAt:n,version:1,nodes:[],links:[],transform:{x:0,y:0,scale:1},exposedInputs:[],exposedOutputs:[]},r=D.transaction(j,"readwrite").objectStore(j).add(o);r.onsuccess=()=>{console.log("[FlowsDB] Created flow:",i,t),e(o)},r.onerror=m=>{console.error("[FlowsDB] Create failed:",m.target.error),s(m.target.error)}})},update:function(t){return new Promise((e,s)=>{if(!D){s(new Error("FlowsDB not initialized"));return}t.updatedAt=new Date().toISOString(),t.version=(t.version||0)+1,t.exposedInputs=this.computeExposedInputs(t),t.exposedOutputs=this.computeExposedOutputs(t);const o=D.transaction(j,"readwrite").objectStore(j).put(t);o.onsuccess=()=>{console.log("[FlowsDB] Updated flow:",t.id,"v"+t.version),e(t)},o.onerror=a=>s(a.target.error)})},delete:function(t){return new Promise((e,s)=>{if(!D){s(new Error("FlowsDB not initialized"));return}const o=D.transaction(j,"readwrite").objectStore(j).delete(t);o.onsuccess=()=>{console.log("[FlowsDB] Deleted flow:",t),e()},o.onerror=a=>s(a.target.error)})},computeExposedInputs:function(t){const e=[],s=new Set;return(t.links||[]).forEach(n=>{s.add(`${n.to.nodeId}:${n.to.socket}`)}),(t.nodes||[]).forEach(n=>{(n.inputs||[]).forEach(i=>{const o=`${n.id}:${i}`;s.has(o)||e.push({nodeId:n.id,socket:i,label:`${n.title}.${i}`})})}),e},computeExposedOutputs:function(t){const e=[],s=new Set;return(t.links||[]).forEach(n=>{s.add(`${n.from.nodeId}:${n.from.socket}`)}),(t.nodes||[]).forEach(n=>{(n.outputs||[]).forEach(i=>{const o=`${n.id}:${i}`;s.has(o)||e.push({nodeId:n.id,socket:i,label:`${n.title}.${i}`})})}),e}},Ee={event:{id:"event",label:"Event",icon:"⚡",color:"#4ade80",description:'Triggers like "On Combat Start", "On Turn Begin"',templates:[{title:"On Start",outputs:["next"]},{title:"On Turn Begin",outputs:["next"]},{title:"On Attack",inputs:["attacker","target"],outputs:["next"]},{title:"On Damage",inputs:["target","amount"],outputs:["next"]}]},condition:{id:"condition",label:"Condition",icon:"❓",color:"#facc15",description:"If/else branching logic",templates:[{title:"If Greater Than",inputs:["a","b"],outputs:["true","false"]},{title:"If Equal",inputs:["a","b"],outputs:["true","false"]},{title:"If Has Tag",inputs:["target","tag"],outputs:["true","false"]},{title:"Compare Roll",inputs:["roll","dc"],outputs:["success","failure"]}]},action:{id:"action",label:"Action",icon:"🎲",color:"#60a5fa",description:"Roll dice, modify values, apply effects",templates:[{title:"Roll Dice",inputs:["expression"],outputs:["result","next"]},{title:"Add Value",inputs:["a","b"],outputs:["result"]},{title:"Apply Damage",inputs:["target","amount"],outputs:["next"]},{title:"Set Variable",inputs:["name","value"],outputs:["next"]}]},reference:{id:"reference",label:"Library",icon:"📚",color:"#c084fc",description:"Link to Library entries (lore, characters, locations)",templates:[]},rules:{id:"rules",label:"Rules",icon:"📖",color:"#f59e0b",description:"Link to Grimoire entries (items, spells, abilities)",templates:[]},compound:{id:"compound",label:"Flows",icon:"📦",color:"#06b6d4",description:"Reuse entire flows as single nodes",templates:[]}};class Ye{constructor(e={}){this.onSelect=e.onSelect||null}async show(){const e=document.createElement("div");e.className="node-picker";const s=document.createElement("div");s.className="library-tabs",s.style.marginBottom="16px";const n=document.createElement("div");n.className="node-picker-panels";const i=async a=>{s.querySelectorAll(".tab").forEach(r=>{r.classList.toggle("active",r.dataset.type===a)}),n.innerHTML="";const c=Ee[a];if(a==="reference"){await $.init();const r=await $.list();if(r.length===0){n.innerHTML='<div class="text-muted">No Library entries. Create entries in the Library first.</div>';return}const m=document.createElement("div");m.className="grid-2",m.style.gap="8px",r.forEach(l=>{const p=K(l.type),y=document.createElement("button");y.className="btn btn-secondary",y.style.cssText="justify-content:flex-start; padding:8px 12px; text-align:left;",y.innerHTML=`<span style="margin-right:8px;">${(p==null?void 0:p.icon)||"📄"}</span> ${l.data.name||"Untitled"}`,y.onclick=()=>{this.onSelect&&this.onSelect({type:"reference",title:`📚 ${l.data.name||"Untitled"}`,entryId:l.id,entryType:l.type,inputs:["in"],outputs:["out","data"]}),o.close()},m.appendChild(y)}),n.appendChild(m)}else if(a==="rules"){await Y.init();const r=await Y.list();if(r.length===0){n.innerHTML='<div class="text-muted">No Grimoire entries. Create rules in the Grimoire first.</div>';return}const m=document.createElement("div");m.className="grid-2",m.style.gap="8px",r.forEach(l=>{const p=Me(l.type),y=document.createElement("button");y.className="btn btn-secondary",y.style.cssText="justify-content:flex-start; padding:8px 12px; text-align:left;",y.innerHTML=`<span style="margin-right:8px;">${(p==null?void 0:p.icon)||"📖"}</span> ${l.data.name||"Untitled"}`,y.onclick=()=>{this.onSelect&&this.onSelect({type:"rules",title:`📖 ${l.data.name||"Untitled"}`,ruleId:l.id,ruleType:l.type,inputs:["in"],outputs:["out","effect"]}),o.close()},m.appendChild(y)}),n.appendChild(m)}else if(a==="compound"){await A.init();const r=await A.list();if(r.length===0){n.innerHTML='<div class="text-muted">No saved flows found. Create a flow first.</div>';return}const m=document.createElement("div");m.className="grid-2",m.style.gap="8px",r.forEach(l=>{const p=document.createElement("button");p.className="btn btn-secondary",p.style.cssText="justify-content:flex-start; padding:8px 12px; text-align:left;",p.innerHTML=`<span style="margin-right:8px;">📦</span> ${l.name}`,p.onclick=()=>{this.onSelect&&this.onSelect({type:"compound",title:`📦 ${l.name}`,flowId:l.id,inputs:(l.exposedInputs||[]).map(y=>y.label||y.socket),outputs:(l.exposedOutputs||[]).map(y=>y.label||y.socket)}),o.close()},m.appendChild(p)}),n.appendChild(m)}else{const r=document.createElement("div");r.className="grid-2",r.style.gap="8px",c.templates.forEach(m=>{const l=document.createElement("button");l.className="btn btn-secondary",l.style.cssText="justify-content:flex-start; padding:8px 12px;",l.innerHTML=`<span style="margin-right:8px;">${c.icon}</span> ${m.title}`,l.onclick=()=>{this.onSelect&&this.onSelect({type:a,title:m.title,inputs:m.inputs||[],outputs:m.outputs||[]}),o.close()},r.appendChild(l)}),n.appendChild(r)}};Object.values(Ee).forEach(a=>{const c=document.createElement("button");c.className="tab",c.dataset.type=a.id,c.innerHTML=`${a.icon} ${a.label}`,c.onclick=()=>i(a.id),s.appendChild(c)}),e.appendChild(s),e.appendChild(n);const o=new ee({title:"Add Node",content:e,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:a=>a.close()}]});o.show(),await i("event")}}const J={id:"architect",label:"Architect",icon:"📐",_state:{activeFlowId:null},render:async(t,e)=>{t.style.padding="0",await A.init();let s=await A.list(),n=J._state.activeFlowId;(!n||!s.find(c=>c.id===n))&&(s.length===0&&(s=[await A.create("Main Flow")]),n=s[0].id,J._state.activeFlowId=n);let i=await A.get(n),o=null;async function a(){s=await A.list(),i=await A.get(n),t.innerHTML=`
                <div class="architect-workspace" id="arch-workspace">
                    <div class="connection-layer" id="arch-connections">
                        <svg width="100%" height="100%" id="arch-svg"></svg>
                    </div>
                    <div class="node-layer" id="arch-nodes"></div>
                    
                    <div class="architect-toolbar">
                        <div class="toolbar-group">
                            <select id="flow-selector" class="input input-sm">
                                ${s.map(p=>`
                                    <option value="${p.id}" ${p.id===n?"selected":""}>
                                        ${p.name}
                                    </option>
                                `).join("")}
                            </select>
                            <button class="btn btn-ghost btn-sm" id="btn-new-flow" title="New Flow">📂+</button>
                            <button class="btn btn-ghost btn-sm" id="btn-rename-flow" title="Rename">✏️</button>
                            <button class="btn btn-ghost btn-sm" id="btn-delete-flow" title="Delete Flow">🗑️</button>
                        </div>
                        <div class="toolbar-divider"></div>
                        <button class="btn btn-primary btn-sm" id="btn-add-node">+ Add Node</button>
                        <button class="btn btn-secondary btn-sm" id="btn-reset-view">Center</button>
                        <button class="btn btn-secondary btn-sm" id="btn-clear-all">Clear</button>
                        <div class="toolbar-spacer"></div>
                        <span class="toolbar-hint">Drag sockets to connect • Middle-click to pan</span>
                    </div>
                </div>
            `;const c=t.querySelector("#arch-workspace"),r=t.querySelector("#arch-nodes"),m=t.querySelector("#arch-svg");o=new Ve(c,r,m),o.init(),i&&o.importData({nodes:i.nodes||[],links:i.links||[],transform:i.transform||{x:0,y:0,scale:1}}),o.onDataChange=async p=>{i&&(i.nodes=p.nodes,i.links=p.links,i.transform=p.transform,await A.update(i))},t.querySelector("#flow-selector").onchange=async p=>{n=p.target.value,J._state.activeFlowId=n,a()},t.querySelector("#btn-new-flow").onclick=async()=>{const p=prompt("Flow name:","New Flow");if(!p)return;n=(await A.create(p)).id,J._state.activeFlowId=n,a()},t.querySelector("#btn-rename-flow").onclick=async()=>{if(!i)return;const p=prompt("Rename flow:",i.name);p&&(i.name=p,await A.update(i),a())},t.querySelector("#btn-delete-flow").onclick=async()=>{var p;if(i){if(s.length<=1){alert("Cannot delete the last flow.");return}confirm(`Delete "${i.name}"?`)&&(await A.delete(i.id),s=await A.list(),n=(p=s[0])==null?void 0:p.id,J._state.activeFlowId=n,a())}};const l=new Ye({onSelect:p=>{o.addNode({id:O.generateId("node"),x:100+Math.random()*100,y:100+Math.random()*100,type:p.type,title:p.title,inputs:p.inputs||[],outputs:p.outputs||[],entryId:p.entryId||null,entryType:p.entryType||null,ruleId:p.ruleId||null,ruleType:p.ruleType||null,flowId:p.flowId||null})}});t.querySelector("#btn-add-node").onclick=()=>{l.show()},t.querySelector("#btn-reset-view").onclick=()=>{o.resetView()},t.querySelector("#btn-clear-all").onclick=async()=>{confirm("Clear all nodes in this flow?")&&(o.nodes=[],o.links=[],r.innerHTML="",m.innerHTML="",o.notifyChange())}}await a()}},be={parse(t){const e=t.trim().match(/^(\d+)?d(\d+)([+-]\d+)?$/i);return e?{count:parseInt(e[1])||1,sides:parseInt(e[2]),modifier:parseInt(e[3])||0}:null},rollOne(t){return Math.floor(Math.random()*t)+1},rollMany(t,e){const s=[];for(let n=0;n<t;n++)s.push(this.rollOne(e));return s},roll(t){const e=this.parse(t);if(!e)return{error:"Invalid format. Use NdX or NdX+Y (e.g., 2d6+3)"};const s=this.rollMany(e.count,e.sides),n=s.reduce((o,a)=>o+a,0),i=n+e.modifier;return{expression:t,rolls:s,subtotal:n,modifier:e.modifier,total:i}},format(t){if(t.error)return t.error;let e=`[${t.rolls.join(", ")}]`;return t.modifier!==0&&(e+=` ${t.modifier>0?"+":""}${t.modifier}`),e+=` = ${t.total}`,e},stats(t){const e=this.parse(t);if(!e)return null;const s=e.count+e.modifier,n=e.count*e.sides+e.modifier,i=(s+n)/2;return{min:s,max:n,average:i.toFixed(1)}}},ue={runDiceSimulation(t,e=1e3){const s=[],n={};for(let u=0;u<e;u++){const d=be.roll(t);if(d.error)return{error:d.error};s.push(d.total),n[d.total]=(n[d.total]||0)+1}const i=[...s].sort((u,d)=>u-d),a=s.reduce((u,d)=>u+d,0)/e,r=s.map(u=>Math.pow(u-a,2)).reduce((u,d)=>u+d,0)/e,m=Math.sqrt(r);let l=null,p=0;for(const[u,d]of Object.entries(n))d>p&&(p=d,l=parseInt(u));const y=e%2===0?(i[e/2-1]+i[e/2])/2:i[Math.floor(e/2)],w=i[Math.floor(e*.25)],h=i[Math.floor(e*.75)];return{expression:t,iterations:e,results:s,distribution:n,stats:{min:i[0],max:i[i.length-1],mean:a.toFixed(2),median:y,mode:l,stdDev:m.toFixed(2),p25:w,p75:h}}},getHistogramData(t){if(t.error)return[];const{distribution:e,iterations:s,stats:n}=t,i=[];for(let o=n.min;o<=n.max;o++){const a=e[o]||0;i.push({value:o,count:a,percentage:(a/s*100).toFixed(1)})}return i},compare(t,e,s=1e3){const n=this.runDiceSimulation(t,s),i=this.runDiceSimulation(e,s);if(n.error||i.error)return{error:n.error||i.error};let o=0,a=0,c=0;for(let r=0;r<s;r++)n.results[r]>i.results[r]?o++:i.results[r]>n.results[r]?a++:c++;return{expr1:{expression:t,stats:n.stats},expr2:{expression:e,stats:i.stats},comparison:{wins1:o,wins2:a,ties:c,win1Pct:(o/s*100).toFixed(1),win2Pct:(a/s*100).toFixed(1),tiePct:(c/s*100).toFixed(1)}}}},$e={id:"laboratory",label:"Laboratory",icon:"🧪",render:(t,e)=>{t.innerHTML=`
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
        `;const s=t.querySelector("#lab-expr"),n=t.querySelector("#lab-roll"),i=t.querySelector("#lab-result"),o=t.querySelector("#lab-stats");s.oninput=()=>{const u=be.stats(s.value);u?o.innerText=`Range: ${u.min}–${u.max} | Average: ${u.average}`:o.innerText=""},s.oninput(),n.onclick=()=>{const u=s.value.trim();if(!u)return;const d=be.roll(u);d.error?i.innerHTML=`<span style="color:var(--status-error);">${d.error}</span>`:i.innerHTML=`
                    <div><strong>Rolls:</strong> [${d.rolls.join(", ")}]</div>
                    ${d.modifier!==0?`<div><strong>Modifier:</strong> ${d.modifier>0?"+":""}${d.modifier}</div>`:""}
                    <div class="roll-total"><strong>Total:</strong> ${d.total}</div>
                `},s.onkeydown=u=>{u.key==="Enter"&&n.onclick()};const a=t.querySelector("#sim-expr"),c=t.querySelector("#sim-iterations"),r=t.querySelector("#sim-run"),m=t.querySelector("#sim-results"),l=t.querySelector("#histogram");r.onclick=()=>{const u=a.value.trim(),d=parseInt(c.value);u&&(r.disabled=!0,r.innerText="Running...",setTimeout(()=>{const b=ue.runDiceSimulation(u,d);if(r.disabled=!1,r.innerText="Run",b.error){m.style.display="none",alert(b.error);return}m.style.display="block",t.querySelector("#stat-min").innerText=b.stats.min,t.querySelector("#stat-max").innerText=b.stats.max,t.querySelector("#stat-mean").innerText=b.stats.mean,t.querySelector("#stat-median").innerText=b.stats.median,t.querySelector("#stat-mode").innerText=b.stats.mode,t.querySelector("#stat-stddev").innerText=b.stats.stdDev;const f=ue.getHistogramData(b),g=Math.max(...f.map(v=>v.count));l.innerHTML=f.map(v=>`
                    <div class="hist-bar-container">
                        <div class="hist-bar" style="height: ${v.count/g*100}%;" title="${v.value}: ${v.count} (${v.percentage}%)"></div>
                        <span class="hist-label">${v.value}</span>
                    </div>
                `).join("")},10))};const p=t.querySelector("#cmp-expr1"),y=t.querySelector("#cmp-expr2"),w=t.querySelector("#cmp-run"),h=t.querySelector("#cmp-results");w.onclick=()=>{const u=p.value.trim(),d=y.value.trim();if(!u||!d)return;const b=ue.compare(u,d,1e3);if(b.error){h.style.display="none",alert(b.error);return}h.style.display="block",h.innerHTML=`
                <div class="compare-stat">
                    <strong>${u}</strong> wins <span class="highlight">${b.comparison.win1Pct}%</span> of the time
                    <small>(avg: ${b.expr1.stats.mean})</small>
                </div>
                <div class="compare-stat">
                    <strong>${d}</strong> wins <span class="highlight">${b.comparison.win2Pct}%</span> of the time
                    <small>(avg: ${b.expr2.stats.mean})</small>
                </div>
                <div class="compare-stat tie">
                    Ties: ${b.comparison.tiePct}%
                </div>
            `}}},pe="samildanach_llm_configs",se="samildanach_active_config_id",B={getConfigs(){return JSON.parse(localStorage.getItem(pe)||"[]")},saveConfig(t){const e=this.getConfigs(),s=e.findIndex(n=>n.id===t.id);s>=0?e[s]=t:e.push(t),localStorage.setItem(pe,JSON.stringify(e))},deleteConfig(t){const e=this.getConfigs().filter(s=>s.id!==t);localStorage.setItem(pe,JSON.stringify(e)),localStorage.getItem(se)===t&&localStorage.removeItem(se)},getActiveConfig(){const t=this.getConfigs(),e=localStorage.getItem(se);return t.find(s=>s.id===e)||t[0]||null},setActiveConfig(t){localStorage.setItem(se,t)},async generate(t,e,s={}){var m,l,p,y,w,h,u,d,b,f,g,v,k,E,_,N,H,z;const i={...this.getActiveConfig()||{},...s},o=i.provider||"gemini",a=i.model||"gemini-1.5-flash",c=i.apiKey||"",r=i.maxTokens||4096;if(!c&&o!=="kobold")throw new Error(`Missing API Key for ${o}. Please configure in Settings.`);if(o==="gemini"){const V=`https://generativelanguage.googleapis.com/v1beta/models/${a}:generateContent?key=${c}`,q={contents:e.map(R=>({role:R.role==="user"?"user":"model",parts:[{text:R.content}]})),generationConfig:{temperature:.9,maxOutputTokens:r}};t&&(q.systemInstruction={parts:[{text:t}]});const I=await fetch(V,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(q)});if(!I.ok){const R=await I.json();throw new Error(((m=R.error)==null?void 0:m.message)||I.statusText)}return((h=(w=(y=(p=(l=(await I.json()).candidates)==null?void 0:l[0])==null?void 0:p.content)==null?void 0:y.parts)==null?void 0:w[0])==null?void 0:h.text)||"(No response)"}if(["openai","openrouter","chutes","custom"].includes(o)){let V="https://api.openai.com/v1/chat/completions";o==="openrouter"&&(V="https://openrouter.ai/api/v1/chat/completions"),o==="chutes"&&(V="https://llm.chutes.ai/v1/chat/completions"),o==="custom"&&(V=`${(i.baseUrl||"https://api.example.com/v1").replace(/\/$/,"")}/chat/completions`);const X=[{role:"system",content:t},...e.map(G=>({role:G.role==="model"?"assistant":G.role,content:G.content}))],q={"Content-Type":"application/json",Authorization:`Bearer ${c}`};o==="openrouter"&&(q["HTTP-Referer"]="https://samildanach.app",q["X-Title"]="Samildánach");let I=r,F=0;const R=1;for(;F<=R;){const G=await fetch(V,{method:"POST",headers:q,body:JSON.stringify({model:a,messages:X,temperature:.9,max_tokens:I})});if(!G.ok){const xe=((u=(await G.json()).error)==null?void 0:u.message)||G.statusText,le=xe.match(/maximum context length is (\d+) tokens.*requested about (\d+) tokens.*\((\d+) in the messages/);if(le&&F<R){const Ae=parseInt(le[1]),Ne=parseInt(le[3]),ce=Ae-Ne-200;if(ce>0){console.warn(`[LLM] Context limit exceeded. Auto-scaling max_tokens from ${I} to ${ce}.`),I=ce,F++;continue}}throw new Error(xe)}const ve=await G.json();let re=((f=(b=(d=ve.choices)==null?void 0:d[0])==null?void 0:b.message)==null?void 0:f.content)||"";const ge=(k=(v=(g=ve.choices)==null?void 0:g[0])==null?void 0:v.message)==null?void 0:k.reasoning_content;return ge&&(re=`<think>${ge}</think>
${re}`),re||"(No response)"}}if(o==="anthropic"){const V="https://api.anthropic.com/v1/messages",X=e.map(F=>({role:F.role==="model"?"assistant":"user",content:F.content})),q=await fetch(V,{method:"POST",headers:{"x-api-key":c,"anthropic-version":"2023-06-01","content-type":"application/json","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:a,max_tokens:r,system:t,messages:X,temperature:.9})});if(!q.ok){const F=await q.json();throw new Error(((E=F.error)==null?void 0:E.message)||q.statusText)}return((N=(_=(await q.json()).content)==null?void 0:_[0])==null?void 0:N.text)||"(No response)"}if(o==="kobold"){const X=`${(i.baseUrl||"http://localhost:5001").replace(/\/$/,"")}/api/v1/generate`,q=`${t}

${e.map(R=>`${R.role==="user"?"User":"Assistant"}: ${R.content}`).join(`
`)}`,I=await fetch(X,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:q,max_context_length:4096,max_length:r>2048?2048:r,temperature:.9})});if(!I.ok){const R=await I.text();throw new Error(`Kobold Error: ${R||I.statusText}`)}return((z=(H=(await I.json()).results)==null?void 0:H[0])==null?void 0:z.text)||"(No response)"}throw new Error(`Unknown provider: ${o}`)},async testConfig(t){try{return await this.generate("You are a test assistant.",[{role:"user",content:'Say "Hello" in one word.'}],t),!0}catch(e){throw e}}},me=[{id:"gemini",label:"Google Gemini",models:["gemini-1.5-flash","gemini-1.5-pro","gemini-2.0-flash"]},{id:"openai",label:"OpenAI",models:["gpt-4o","gpt-4o-mini","gpt-4-turbo","gpt-3.5-turbo"]},{id:"openrouter",label:"OpenRouter",models:["anthropic/claude-3.5-sonnet","google/gemini-pro-1.5","meta-llama/llama-3.1-405b-instruct"]},{id:"anthropic",label:"Anthropic",models:["claude-3-5-sonnet-20241022","claude-3-opus-20240229","claude-3-haiku-20240307"]},{id:"chutes",label:"Chutes AI",models:["deepseek-ai/DeepSeek-V3","deepseek-ai/DeepSeek-R1"]},{id:"kobold",label:"Kobold AI (Local)",models:["local"],baseUrl:"http://localhost:5001"},{id:"custom",label:"Custom Endpoint",models:["custom"]}],Ce="samildanach_scribe_state",Te=[{id:"brainstorm",label:"💡 Brainstorm",desc:"Generate ideas and explore concepts"},{id:"expand",label:"📝 Expand",desc:"Develop and detail existing entries"},{id:"critique",label:"🔍 Critique",desc:"Get feedback and suggestions"}],Ie={brainstorm:[{label:"Character concept",prompt:"Help me brainstorm a character who..."},{label:"Location idea",prompt:"I need a unique location for..."},{label:"Faction conflict",prompt:"Create tension between factions by..."},{label:"Plot hook",prompt:"Generate a compelling plot hook involving..."}],expand:[{label:"Add history",prompt:"Expand the backstory and history of..."},{label:"Describe appearance",prompt:"Describe in vivid detail how this looks:"},{label:"Add relationships",prompt:"How might this connect to other elements in my world?"},{label:"Cultural details",prompt:"What customs, traditions, or beliefs would exist here?"}],critique:[{label:"Check consistency",prompt:"Review this for internal consistency:"},{label:"Strengthen concept",prompt:"How can I make this more unique or compelling?"},{label:"Find gaps",prompt:"What questions or gaps exist in this concept?"},{label:"Balance check",prompt:"Is this balanced for gameplay? What adjustments?"}]},ye={id:"scribe",label:"Scribe",icon:"✍️",render:async t=>{let e=JSON.parse(localStorage.getItem(Ce)||"{}");e.mode||(e.mode="brainstorm"),e.history||(e.history=[]),e.selectedEntries||(e.selectedEntries=[]),e.sessions||(e.sessions={});const s=()=>localStorage.setItem(Ce,JSON.stringify(e));await $.init();const n=await $.list(),i=Z();t.innerHTML=`
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
                            ${Te.map(h=>`
                                <button class="mode-btn ${e.mode===h.id?"active":""}" data-mode="${h.id}" title="${h.desc}">
                                    ${h.label}
                                </button>
                            `).join("")}
                        </div>
                    </div>

                    <!-- Library Context -->
                    <div class="sidebar-section flex-1">
                        <div class="section-label">Library Context</div>
                        <div class="entry-list">
                            ${i.map(h=>{const u=n.filter(d=>d.type===h.id);return u.length===0?"":`
                                    <div class="entry-category">
                                        <div class="category-label">${h.icon} ${h.label}</div>
                                        ${u.map(d=>`
                                            <label class="entry-checkbox">
                                                <input type="checkbox" 
                                                    value="${d.id}" 
                                                    ${e.selectedEntries.includes(d.id)?"checked":""}>
                                                <span>${d.data.name||"Untitled"}</span>
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
                            ${Object.keys(e.sessions).map(h=>`<option value="${h}">${h}</option>`).join("")}
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
        `;const o=t.querySelector("#chat-log"),a=t.querySelector("#chat-input"),c=t.querySelector("#btn-send"),r=t.querySelector("#template-select"),m=t.querySelector("#session-select");function l(){const h=Ie[e.mode]||[];r.innerHTML='<option value="">📝 Templates...</option>'+h.map((u,d)=>`<option value="${d}">${u.label}</option>`).join("")}l(),r.onchange=()=>{const h=parseInt(r.value);if(!isNaN(h)){const u=Ie[e.mode]||[];u[h]&&(a.value=u[h].prompt,a.focus())}r.value=""},t.querySelectorAll(".mode-btn").forEach(h=>{h.onclick=()=>{e.mode=h.dataset.mode,t.querySelectorAll(".mode-btn").forEach(u=>u.classList.remove("active")),h.classList.add("active"),l(),s()}}),t.querySelectorAll(".entry-checkbox input").forEach(h=>{h.onchange=()=>{const u=h.value;h.checked?e.selectedEntries.includes(u)||e.selectedEntries.push(u):e.selectedEntries=e.selectedEntries.filter(d=>d!==u),s()}});function p(){if(e.history.length===0){o.innerHTML=`
                    <div class="chat-empty">
                        <div class="empty-icon">✍️</div>
                        <div class="empty-title">The Scribe</div>
                        <div class="empty-hint">Your AI world-building assistant. Select Library entries for context, then ask for help.</div>
                    </div>
                `;return}o.innerHTML=e.history.map(h=>`
                <div class="chat-bubble ${h.role}">
                    <div class="bubble-content">${h.content.replace(/\n/g,"<br>")}</div>
                    <div class="bubble-meta">
                        <span>${h.role==="user"?"You":"✍️ Scribe"}</span>
                        <button class="btn-copy" data-content="${encodeURIComponent(h.content)}" title="Copy">📋</button>
                    </div>
                </div>
            `).join(""),o.querySelectorAll(".btn-copy").forEach(h=>{h.onclick=()=>{navigator.clipboard.writeText(decodeURIComponent(h.dataset.content))}}),o.scrollTop=o.scrollHeight}p();function y(){Te.find(u=>u.id===e.mode);let h="You are The Scribe, an expert world-building assistant for tabletop RPG settings. ";if(e.mode==="brainstorm"?h+="Help the user generate creative ideas, explore concepts, and brainstorm possibilities. Be imaginative and offer multiple options.":e.mode==="expand"?h+="Help the user develop and expand existing ideas with rich detail. Add depth, history, and connections.":e.mode==="critique"&&(h+="Provide constructive feedback on the user's ideas. Identify strengths, weaknesses, inconsistencies, and suggest improvements."),e.selectedEntries.length>0){const u=e.selectedEntries.map(d=>n.find(b=>b.id===d)).filter(Boolean);u.length>0&&(h+=`

[WORLD CONTEXT - The user has selected these entries from their world Bible:]
`,u.forEach(d=>{const b=i.find(f=>f.id===d.type);if(h+=`
[${(b==null?void 0:b.label)||d.type}] ${d.data.name||"Untitled"}`,d.data.description){const f=d.data.description.replace(/<[^>]+>/g,"").substring(0,300);h+=`: ${f}`}b!=null&&b.fields&&b.fields.forEach(f=>{d.data[f.key]&&(h+=` | ${f.label}: ${d.data[f.key]}`)}),d.data.relationships&&d.data.relationships.length>0&&(h+=`
  Relationships:`,d.data.relationships.forEach(f=>{const g=n.find(E=>E.id===f.targetId),v=(g==null?void 0:g.data.name)||"(Unknown)",k=f.type||"related to";h+=`
    - ${k}: ${v}`,f.notes&&(h+=` (${f.notes})`)}))}),h+=`
[END CONTEXT]`)}return h}async function w(){const h=a.value.trim();if(!h)return;const u={id:ne(),role:"user",content:h,timestamp:new Date().toISOString()};e.history.push(u),a.value="",p(),s(),c.disabled=!0,c.textContent="Thinking...";try{if(!B.getActiveConfig())throw new Error("No API configuration. Go to Settings to add one.");const b=y(),g=e.history.map(E=>({role:E.role==="user"?"user":"model",content:E.content})).slice(-20),v=await B.generate(b,g),k={id:ne(),role:"model",content:v,timestamp:new Date().toISOString()};e.history.push(k),s(),p()}catch(d){console.error("[Scribe]",d),e.history.push({id:ne(),role:"model",content:`[Error: ${d.message}]`,timestamp:new Date().toISOString()}),p()}finally{c.disabled=!1,c.textContent="Send"}}c.onclick=w,a.onkeydown=h=>{h.key==="Enter"&&!h.shiftKey&&(h.preventDefault(),w())},t.querySelector("#btn-clear").onclick=()=>{confirm("Clear all messages?")&&(e.history=[],s(),p())},t.querySelector("#btn-save-session").onclick=()=>{const h=prompt("Session name:",`Session ${Object.keys(e.sessions).length+1}`);h&&(e.sessions[h]={history:[...e.history],mode:e.mode,selectedEntries:[...e.selectedEntries],savedAt:new Date().toISOString()},s(),m.innerHTML='<option value="">-- Sessions --</option>'+Object.keys(e.sessions).map(u=>`<option value="${u}">${u}</option>`).join(""))},t.querySelector("#btn-load-session").onclick=()=>{const h=m.value;if(!h||!e.sessions[h])return;const u=e.sessions[h];e.history=[...u.history],e.mode=u.mode,e.selectedEntries=[...u.selectedEntries],s(),ye.render(t)}}},U={async toJSON(){await $.init();const t=await $.list();return{meta:{...x.project},entries:t,exportedAt:new Date().toISOString(),version:"1.0",format:"samildanach-json"}},async toMarkdown(t={}){var o;const{includeRelationships:e=!0}=t;await $.init();const s=await $.list();let n="";n+=`# ${x.project.title||"Untitled Setting"}

`,x.project.author&&(n+=`**Author:** ${x.project.author}

`),x.project.version&&(n+=`**Version:** ${x.project.version}

`),x.project.genre&&(n+=`**Genre:** ${x.project.genre}

`),x.project.system&&(n+=`**System:** ${x.project.system}

`),x.project.description&&(n+=`---

${x.project.description}

`),n+=`---

`;const i=Z();for(const a of i){const c=s.filter(r=>r.type===a.id);if(c.length!==0){n+=`## ${a.icon} ${a.label}s

`;for(const r of c){n+=`### ${r.data.name||"Untitled"}

`;for(const m of a.fields){const l=r.data[m.key];l&&(n+=`**${m.label}:** ${l}

`)}if(r.data.description){const m=this._stripHtml(r.data.description);n+=`${m}

`}if(e&&((o=r.data.relationships)==null?void 0:o.length)>0){n+=`**Relationships:**
`;for(const m of r.data.relationships){const l=ae(m.type),p=s.find(w=>w.id===m.targetId),y=(p==null?void 0:p.data.name)||"(Unknown)";n+=`- ${l.icon} ${l.label}: ${y}
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
</html>`},async printToPDF(){const t=await this.toHTML(),e=window.open("","_blank");e.document.write(t),e.document.close(),e.focus(),setTimeout(()=>e.print(),250)},download(t,e,s="text/plain"){const n=new Blob([t],{type:s}),i=URL.createObjectURL(n),o=document.createElement("a");o.href=i,o.download=e,o.click(),URL.revokeObjectURL(i)},_stripHtml(t){const e=document.createElement("div");return e.innerHTML=t,e.querySelectorAll(".wiki-link").forEach(s=>{s.replaceWith(s.dataset.link||s.textContent)}),e.textContent||e.innerText||""}},Le={id:"export",label:"Export",icon:"📤",render:(t,e)=>{t.innerHTML=`
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
        `;let s="json";const n=t.querySelector("#export-preview"),i=t.querySelector("#btn-export"),o=t.querySelectorAll(".format-btn");o.forEach(r=>{r.onclick=async()=>{o.forEach(m=>m.classList.remove("active")),r.classList.add("active"),s=r.dataset.format,await a()}});async function a(){n.innerHTML='<div class="preview-loading">Generating preview...</div>';try{let r="";switch(s){case"json":const m=await U.toJSON();r=`<pre class="preview-code">${JSON.stringify(m,null,2).substring(0,2e3)}${JSON.stringify(m,null,2).length>2e3?`
...`:""}</pre>`;break;case"markdown":const l=await U.toMarkdown();r=`<pre class="preview-code">${c(l.substring(0,2e3))}${l.length>2e3?`
...`:""}</pre>`;break;case"html":r=`<div class="preview-note">Full HTML document will be downloaded.</div><pre class="preview-code">${c((await U.toHTML()).substring(0,1500))}...</pre>`;break;case"pdf":r=`<div class="preview-note">PDF will open in a print dialog.<br>Use "Save as PDF" in your browser's print options.</div>`;break}n.innerHTML=r}catch(r){n.innerHTML=`<div class="preview-error">Error: ${r.message}</div>`}}i.onclick=async()=>{i.disabled=!0,i.innerText="Exporting...";try{const r=(x.project.title||"samildanach").toLowerCase().replace(/\s+/g,"-");switch(s){case"json":const m=await U.toJSON();U.download(JSON.stringify(m,null,2),`${r}.json`,"application/json");break;case"markdown":const l=await U.toMarkdown();U.download(l,`${r}.md`,"text/markdown");break;case"html":const p=await U.toHTML();U.download(p,`${r}.html`,"text/html");break;case"pdf":await U.printToPDF();break}}catch(r){alert("Export failed: "+r.message)}i.disabled=!1,i.innerText="Download"},a();function c(r){const m=document.createElement("div");return m.textContent=r,m.innerHTML}}},te={id:"settings",label:"Settings",icon:"⚙️",render:(t,e)=>{const s=B.getConfigs(),n=B.getActiveConfig();t.innerHTML=`
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
                            `:s.map(u=>{var d;return`
                                <div class="config-card ${u.id===(n==null?void 0:n.id)?"active":""}" data-id="${u.id}">
                                    <div class="config-info">
                                        <div class="config-name">${u.name||"Unnamed"}</div>
                                        <div class="config-provider">${((d=me.find(b=>b.id===u.provider))==null?void 0:d.label)||u.provider} • ${u.model}</div>
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
                                    ${me.map(u=>`<option value="${u.id}">${u.label}</option>`).join("")}
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
        `;const i=t.querySelector("#configs-list"),o=t.querySelector("#config-editor"),a=t.querySelector("#cfg-provider"),c=t.querySelector("#cfg-model"),r=t.querySelector("#field-baseurl"),m=t.querySelector("#field-apikey"),l=t.querySelector("#test-result");let p=null;function y(){const u=a.value,d=me.find(b=>b.id===u);c.innerHTML=d.models.map(b=>`<option value="${b}">${b}</option>`).join(""),r.style.display=["kobold","custom"].includes(u)?"block":"none",m.style.display=u==="kobold"?"none":"block"}a.onchange=y,y();function w(u=null){var d;p=(u==null?void 0:u.id)||null,t.querySelector("#cfg-name").value=(u==null?void 0:u.name)||"",a.value=(u==null?void 0:u.provider)||"gemini",y(),c.value=(u==null?void 0:u.model)||((d=c.options[0])==null?void 0:d.value)||"",t.querySelector("#cfg-apikey").value=(u==null?void 0:u.apiKey)||"",t.querySelector("#cfg-baseurl").value=(u==null?void 0:u.baseUrl)||"",l.innerHTML="",o.style.display="flex"}function h(){o.style.display="none",p=null}t.querySelector("#btn-add-config").onclick=()=>w(),t.querySelector("#btn-cancel-config").onclick=h,t.querySelector("#btn-save-config").onclick=()=>{const u={id:p||ne(),name:t.querySelector("#cfg-name").value||"Unnamed",provider:a.value,model:c.value,apiKey:t.querySelector("#cfg-apikey").value,baseUrl:t.querySelector("#cfg-baseurl").value};B.saveConfig(u),B.getConfigs().length===1&&B.setActiveConfig(u.id),h(),te.render(t,e)},t.querySelector("#btn-test-config").onclick=async()=>{const u=t.querySelector("#btn-test-config");u.disabled=!0,u.textContent="Testing...",l.innerHTML='<span class="test-pending">Connecting...</span>';const d={provider:a.value,model:c.value,apiKey:t.querySelector("#cfg-apikey").value,baseUrl:t.querySelector("#cfg-baseurl").value};try{await B.testConfig(d),l.innerHTML='<span class="test-success">✓ Connection successful!</span>'}catch(b){l.innerHTML=`<span class="test-error">✗ ${b.message}</span>`}u.disabled=!1,u.textContent="Test Connection"},i.querySelectorAll(".config-card").forEach(u=>{const d=u.dataset.id;u.querySelector(".btn-activate").onclick=()=>{B.setActiveConfig(d),te.render(t,e)},u.querySelector(".btn-edit").onclick=()=>{const b=B.getConfigs().find(f=>f.id===d);w(b)},u.querySelector(".btn-delete").onclick=()=>{confirm("Delete this configuration?")&&(B.deleteConfig(d),te.render(t,e))}})}},he={divider:!0};async function ze(){console.log(`%c Samildánach v${x.project.version} `,"background: #222; color: #bada55"),C.registerPanel(de.id,de),C.registerPanel(S.id,S),C.registerPanel(M.id,M),C.registerPanel("divider1",he),C.registerPanel(ke.id,ke),C.registerPanel(J.id,J),C.registerPanel($e.id,$e),C.registerPanel("divider2",he),C.registerPanel(ye.id,ye),C.registerPanel("divider3",he),C.registerPanel(Le.id,Le),C.registerPanel(te.id,te),C.init(),C.activePanelId||C.switchPanel(de.id)}window.addEventListener("DOMContentLoaded",ze);
