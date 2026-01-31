(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function s(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerPolicy&&(n.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?n.credentials="include":a.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(a){if(a.ep)return;a.ep=!0;const n=s(a);fetch(a.href,n)}})();const ve="samildanach_state",x={project:{title:"Untitled Setting",author:"",version:"1.0.0",description:"",genre:"",system:""},session:{activePanel:null,activeEntryId:null},cache:{},_subscribers:[],init(){const t=localStorage.getItem(ve);if(t)try{const e=JSON.parse(t);e.project&&Object.assign(this.project,e.project),e.session&&Object.assign(this.session,e.session)}catch(e){console.warn("Failed to restore state:",e)}},save(){const t={project:this.project,session:this.session};localStorage.setItem(ve,JSON.stringify(t))},updateProject(t){Object.assign(this.project,t),this.save(),this._notify("project",this.project)},updateSession(t){Object.assign(this.session,t),this.save(),this._notify("session",this.session)},subscribe(t,e){const s={key:t,callback:e};return this._subscribers.push(s),()=>{const i=this._subscribers.indexOf(s);i>=0&&this._subscribers.splice(i,1)}},_notify(t,e){this._subscribers.filter(s=>s.key===t).forEach(s=>s.callback(e))},exportState(){return{project:{...this.project},session:{...this.session}}},importState(t){t.project&&Object.assign(this.project,t.project),t.session&&Object.assign(this.session,t.session),this.save(),this._notify("project",this.project),this._notify("session",this.session)}},C={panels:{},activePanelId:null,init:function(){x.init(),this.renderSidebar(),this.bindEvents();const t=localStorage.getItem("theme")||"dark";document.documentElement.setAttribute("data-theme",t),x.session.activePanel&&this.panels[x.session.activePanel]&&this.switchPanel(x.session.activePanel)},registerPanel:function(t,e){this.panels[t]=e,this.renderSidebar()},switchPanel:function(t){if(!this.panels[t])return;this.activePanelId=t,x.updateSession({activePanel:t}),document.querySelectorAll(".nav-item").forEach(i=>{i.classList.toggle("active",i.dataset.id===t)});const e=document.getElementById("main-view");e.innerHTML="";const s=document.createElement("div");s.className="panel-container",this.panels[t].render(s,x),e.appendChild(s)},renderSidebar:function(){const t=document.getElementById("nav-list");t&&(t.innerHTML="",Object.keys(this.panels).forEach(e=>{const s=this.panels[e];if(e==="divider"||s.divider){const a=document.createElement("div");a.className="nav-divider",t.appendChild(a);return}const i=document.createElement("div");i.className="nav-item",i.innerHTML=s.icon||"📦",i.title=s.label||e,i.dataset.id=e,i.onclick=()=>this.switchPanel(e),e===this.activePanelId&&i.classList.add("active"),t.appendChild(i)}))},bindEvents:function(){const t=document.getElementById("theme-toggle");t&&(t.onclick=()=>{const e=document.documentElement,i=e.getAttribute("data-theme")==="dark"?"light":"dark";e.setAttribute("data-theme",i),localStorage.setItem("theme",i)})}},U={generateId:(t="id")=>typeof crypto<"u"&&crypto.randomUUID?`${t}_${crypto.randomUUID().split("-")[0]}`:`${t}_${Math.random().toString(36).substring(2,9)}`,escapeHtml:t=>{const e=document.createElement("div");return e.textContent=t,e.innerHTML},debounce:(t,e=300)=>{let s;return(...i)=>{clearTimeout(s),s=setTimeout(()=>t(...i),e)}},deepClone:t=>JSON.parse(JSON.stringify(t)),formatDate:t=>{const e=new Date(t);return e.toLocaleDateString()+" "+e.toLocaleTimeString()},truncate:(t,e=50)=>!t||t.length<=e?t:t.substring(0,e-3)+"..."},Z=U.generateId,qe="samildanach_vault",De=1,F="items",K="registry",ee="vault_registry";let L=null;function ye(){return{id:ee,lastUpdatedAt:new Date().toISOString(),universes:[],allTags:[],blocks:{},itemCounts:{actor:0,lorebook:0,script:0,location:0,event:0,pair:0}}}const T={init:function(){return new Promise((t,e)=>{if(L){t(L);return}const s=indexedDB.open(qe,De);s.onerror=i=>{console.error("[VaultDB] Failed to open database:",i.target.error),e(i.target.error)},s.onsuccess=i=>{L=i.target.result,console.log("[VaultDB] Database opened successfully"),t(L)},s.onupgradeneeded=i=>{const a=i.target.result;if(!a.objectStoreNames.contains(F)){const n=a.createObjectStore(F,{keyPath:"id"});n.createIndex("type","type",{unique:!1}),n.createIndex("universe","universe",{unique:!1}),n.createIndex("updatedAt","updatedAt",{unique:!1}),console.log("[VaultDB] Items store created")}a.objectStoreNames.contains(K)||(a.createObjectStore(K,{keyPath:"id"}),console.log("[VaultDB] Registry store created"))}})},getRegistry:function(){return new Promise((t,e)=>{if(!L){e(new Error("VaultDB not initialized"));return}const a=L.transaction(K,"readonly").objectStore(K).get(ee);a.onsuccess=()=>{a.result?t(a.result):T.updateRegistry(ye()).then(t).catch(e)},a.onerror=n=>e(n.target.error)})},updateRegistry:function(t){return new Promise((e,s)=>{if(!L){s(new Error("VaultDB not initialized"));return}const a=L.transaction(K,"readwrite").objectStore(K),n=a.get(ee);n.onsuccess=()=>{const l={...n.result||ye(),...t,id:ee,lastUpdatedAt:new Date().toISOString()},c=a.put(l);c.onsuccess=()=>e(l),c.onerror=p=>s(p.target.error)},n.onerror=r=>s(r.target.error)})},list:function(t={}){return new Promise((e,s)=>{if(!L){s(new Error("VaultDB not initialized"));return}const a=L.transaction(F,"readonly").objectStore(F);let n;t.type?n=a.index("type").openCursor(IDBKeyRange.only(t.type)):t.universe?n=a.index("universe").openCursor(IDBKeyRange.only(t.universe)):n=a.openCursor();const r=[];n.onsuccess=l=>{const c=l.target.result;if(c){const p=c.value;let o=!0;t.type&&p.type!==t.type&&(o=!1),t.universe&&p.universe!==t.universe&&(o=!1),t.tags&&t.tags.length>0&&(t.tags.every(y=>{var S;return(S=p.tags)==null?void 0:S.includes(y)})||(o=!1)),o&&r.push(p),c.continue()}else r.sort((p,o)=>new Date(o.updatedAt).getTime()-new Date(p.updatedAt).getTime()),e(r)},n.onerror=l=>s(l.target.error)})},addItem:function(t,e,s={}){return new Promise((i,a)=>{if(!L){console.error("[VaultDB]AddItem: DB not initialized"),a(new Error("VaultDB not initialized"));return}const n=new Date().toISOString();let r;try{r=U&&U.generateId?U.generateId("vault"):`vault_${crypto.randomUUID()}`}catch(b){console.error("[VaultDB] ID Gen Failed:",b),r="vault_"+Date.now()}const l={id:r,type:t,version:1,universe:s.universe||"",tags:s.tags||[],createdAt:n,updatedAt:n,data:e};console.log("[VaultDB] Adding Item:",l);const o=L.transaction(F,"readwrite").objectStore(F).add(l);o.onsuccess=()=>{console.log("[VaultDB] Add Success"),i(l)},o.onerror=b=>{console.error("[VaultDB] Add Failed:",b.target.error),a(b.target.error)}})},updateItem:function(t){return new Promise((e,s)=>{if(!L){s(new Error("VaultDB not initialized"));return}t.updatedAt=new Date().toISOString();const n=L.transaction(F,"readwrite").objectStore(F).put(t);n.onsuccess=()=>e(t),n.onerror=r=>s(r.target.error)})}},ue={person:{id:"person",label:"Person",icon:"👤",color:"#6366f1",fields:[{key:"role",label:"Role",type:"text"},{key:"affiliation",label:"Affiliation",type:"text"},{key:"motivation",label:"Motivation",type:"text"},{key:"appearance",label:"Appearance",type:"textarea"}]},location:{id:"location",label:"Location",icon:"📍",color:"#22c55e",fields:[{key:"region",label:"Region",type:"text"},{key:"climate",label:"Climate",type:"text"},{key:"pointsOfInterest",label:"Points of Interest",type:"textarea"}]},faction:{id:"faction",label:"Faction",icon:"🏛️",color:"#f59e0b",fields:[{key:"goals",label:"Goals",type:"textarea"},{key:"allies",label:"Allies",type:"text"},{key:"enemies",label:"Enemies",type:"text"}]},concept:{id:"concept",label:"Concept",icon:"💡",color:"#8b5cf6",fields:[{key:"domain",label:"Domain",type:"text"},{key:"principles",label:"Core Principles",type:"textarea"}]},event:{id:"event",label:"Event",icon:"📜",color:"#ef4444",fields:[{key:"era",label:"Era/Date",type:"text"},{key:"participants",label:"Participants",type:"text"},{key:"outcome",label:"Outcome",type:"textarea"}]},item:{id:"item",label:"Item",icon:"🎁",color:"#14b8a6",fields:[{key:"origin",label:"Origin",type:"text"},{key:"properties",label:"Properties",type:"textarea"}]}},Y=t=>ue[t]||ue.item,z=()=>Object.values(ue),oe={id:"project",label:"Project",icon:"🏠",render:async(t,e)=>{try{await T.init()}catch(l){t.innerHTML=`<div class="text-muted">Vault Error: ${l.message}</div>`;return}const s=await T.list(),i={};z().forEach(l=>{i[l.id]=s.filter(c=>c.type===l.id).length});const a=s.reduce((l,c)=>{var p;return l+(((p=c.data.relationships)==null?void 0:p.length)||0)},0);t.innerHTML=`
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
                        ${z().map(l=>`
                            <div class="stat-card" style="border-left-color: ${l.color};">
                                <div class="stat-icon">${l.icon}</div>
                                <div class="stat-value">${i[l.id]||0}</div>
                                <div class="stat-label">${l.label}s</div>
                            </div>
                        `).join("")}
                        <div class="stat-card">
                            <div class="stat-icon">🔗</div>
                            <div class="stat-value">${a}</div>
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
        `;const n=()=>{x.updateProject({title:t.querySelector("#proj-title").value,author:t.querySelector("#proj-author").value,version:t.querySelector("#proj-version").value,genre:t.querySelector("#proj-genre").value,system:t.querySelector("#proj-system").value,description:t.querySelector("#proj-description").value})};t.querySelectorAll("input, textarea").forEach(l=>{l.oninput=n}),t.querySelector("#btn-export").onclick=async()=>{const l={meta:x.project,entries:s,exportedAt:new Date().toISOString(),version:"1.0"},c=new Blob([JSON.stringify(l,null,2)],{type:"application/json"}),p=URL.createObjectURL(c),o=document.createElement("a");o.href=p,o.download=`${x.project.title.replace(/[^a-z0-9]/gi,"_")}_setting.json`,o.click(),URL.revokeObjectURL(p)};const r=t.querySelector("#import-file");t.querySelector("#btn-import").onclick=()=>r.click(),r.onchange=async l=>{var p;const c=l.target.files[0];if(c)try{const o=await c.text(),b=JSON.parse(o);if(b.meta&&x.updateProject(b.meta),b.entries&&Array.isArray(b.entries))for(const y of b.entries)await T.addItem(y.type,y.data);alert(`Imported ${((p=b.entries)==null?void 0:p.length)||0} entries!`),location.reload()}catch(o){alert("Import failed: "+o.message)}}}};class X{constructor(e={}){this.title=e.title||"Modal",this.content=e.content||"",this.actions=e.actions||[],this.onClose=e.onClose||null,this.element=null}show(){this.element=document.createElement("div"),this.element.className="modal-overlay",this.element.innerHTML=`
            <div class="modal-content">
                <h3 class="modal-title">${this.title}</h3>
                <div class="modal-body"></div>
                <div class="modal-actions"></div>
            </div>
        `;const e=this.element.querySelector(".modal-body");typeof this.content=="string"?e.innerHTML=this.content:this.content instanceof HTMLElement&&e.appendChild(this.content);const s=this.element.querySelector(".modal-actions");this.actions.forEach(i=>{const a=document.createElement("button");a.className=i.className||"btn btn-secondary",a.innerText=i.label,a.onclick=()=>{i.onClick&&i.onClick(this)},s.appendChild(a)}),this.element.onclick=i=>{i.target===this.element&&this.close()},document.body.appendChild(this.element)}close(){this.element&&(this.element.remove(),this.element=null),this.onClose&&this.onClose()}getBody(){var e;return(e=this.element)==null?void 0:e.querySelector(".modal-body")}static confirm(e,s){return new Promise(i=>{const a=new X({title:e,content:`<p>${s}</p>`,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:()=>{a.close(),i(!1)}},{label:"Confirm",className:"btn btn-primary",onClick:()=>{a.close(),i(!0)}}]});a.show()})}static alert(e,s){return new Promise(i=>{const a=new X({title:e,content:`<p>${s}</p>`,actions:[{label:"OK",className:"btn btn-primary",onClick:()=>{a.close(),i()}}]});a.show()})}}class Ne{constructor(e,s={}){this.container=e,this.items=[],this.activeCategory=null,this.activeItemId=null,this.onSelect=s.onSelect||null,this.onCreate=s.onCreate||null}setItems(e){this.items=e,this.render()}setActiveItem(e){this.activeItemId=e,this.renderList()}render(){this.container.innerHTML=`
            <div id="category-tabs" class="library-tabs"></div>
            <div class="library-search-bar">
                <input id="lib-search" type="text" placeholder="Search..." class="input">
                <button id="lib-add-btn" class="btn btn-primary">+</button>
            </div>
            <div id="lib-list" class="library-list"></div>
        `,this.tabsEl=this.container.querySelector("#category-tabs"),this.searchInput=this.container.querySelector("#lib-search"),this.listEl=this.container.querySelector("#lib-list"),this.addBtn=this.container.querySelector("#lib-add-btn"),this.renderTabs(),this.renderList(),this.searchInput.oninput=()=>this.renderList(),this.addBtn.onclick=()=>{this.onCreate&&this.onCreate()}}renderTabs(){this.tabsEl.innerHTML="";const e=document.createElement("button");e.innerText="All",e.className="tab"+(this.activeCategory===null?" active":""),e.onclick=()=>{this.activeCategory=null,this.renderTabs(),this.renderList()},this.tabsEl.appendChild(e),z().forEach(s=>{const i=document.createElement("button");i.innerText=`${s.icon} ${s.label}`,i.className="tab"+(this.activeCategory===s.id?" active":""),this.activeCategory===s.id&&(i.style.background=s.color,i.style.borderColor=s.color),i.onclick=()=>{this.activeCategory=s.id,this.renderTabs(),this.renderList()},this.tabsEl.appendChild(i)})}renderList(){var a;if(!this.listEl)return;this.listEl.innerHTML="";const e=((a=this.searchInput)==null?void 0:a.value.toLowerCase())||"",s=this.activeCategory,i=this.items.filter(n=>{const r=(n.data.name||"").toLowerCase().includes(e),l=s?n.type===s:!0;return r&&l});if(i.length===0){this.listEl.innerHTML='<div class="library-list-empty">No entries found.</div>';return}i.forEach(n=>{const r=Y(n.type),l=this.activeItemId===n.id,c=document.createElement("div");c.className="list-item"+(l?" active":""),c.innerHTML=`
                <span>${r.icon}</span>
                <span class="flex-1" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${n.data.name||"Untitled"}</span>
            `,c.onclick=()=>{this.onSelect&&this.onSelect(n)},this.listEl.appendChild(c)})}}class $e{constructor(e,s="",i={}){this.container=e,this.value=s,this.onChange=null,this.onLinkClick=i.onLinkClick||null,this.getEntries=i.getEntries||(()=>[])}render(){this.container.innerHTML=`
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
        `,this.editor=this.container.querySelector(".rte-content"),this.autocomplete=this.container.querySelector(".rte-autocomplete"),this.bindEvents()}renderWithLinks(e){return e.replace(/\[\[([^\]]+)\]\]/g,(s,i)=>`<span class="wiki-link" data-link="${i}">[[${i}]]</span>`)}extractRawText(e){const s=document.createElement("div");return s.innerHTML=e,s.querySelectorAll(".wiki-link").forEach(i=>{i.replaceWith(`[[${i.dataset.link}]]`)}),s.innerHTML}bindEvents(){this.container.querySelectorAll("button[data-cmd]").forEach(e=>{e.onclick=s=>{s.preventDefault();const i=e.dataset.cmd;i==="link"?this.insertLinkPlaceholder():i==="h2"||i==="h3"?document.execCommand("formatBlock",!1,i):document.execCommand(i,!1,null),this.editor.focus()}}),this.editor.oninput=()=>{this.checkForAutocomplete(),this.value=this.extractRawText(this.editor.innerHTML),this.onChange&&this.onChange(this.value)},this.editor.onclick=e=>{if(e.target.classList.contains("wiki-link")){const s=e.target.dataset.link;this.onLinkClick&&this.onLinkClick(s)}},this.editor.onkeydown=e=>{if(this.autocomplete.style.display!=="none")if(e.key==="ArrowDown"||e.key==="ArrowUp")e.preventDefault(),this.navigateAutocomplete(e.key==="ArrowDown"?1:-1);else if(e.key==="Enter"||e.key==="Tab"){const s=this.autocomplete.querySelector(".selected");s&&(e.preventDefault(),this.selectAutocompleteItem(s.dataset.name))}else e.key==="Escape"&&this.hideAutocomplete()},this.editor.onblur=()=>{setTimeout(()=>this.hideAutocomplete(),150)}}insertLinkPlaceholder(){document.execCommand("insertText",!1,"[[]]");const e=window.getSelection();if(e.rangeCount){const s=e.getRangeAt(0);s.setStart(s.startContainer,s.startOffset-2),s.collapse(!0),e.removeAllRanges(),e.addRange(s)}}checkForAutocomplete(){const e=window.getSelection();if(!e.rangeCount)return;const s=e.getRangeAt(0),i=s.startContainer;if(i.nodeType!==Node.TEXT_NODE)return;const n=i.textContent.substring(0,s.startOffset).match(/\[\[([^\]]*?)$/);if(n){const r=n[1].toLowerCase(),l=this.getEntries().filter(c=>(c.data.name||"").toLowerCase().includes(r)).slice(0,8);l.length>0?this.showAutocomplete(l):this.hideAutocomplete()}else this.hideAutocomplete()}showAutocomplete(e){this.autocomplete.innerHTML="",e.forEach((s,i)=>{const a=document.createElement("div");a.dataset.name=s.data.name,a.className="rte-autocomplete-item"+(i===0?" selected":""),a.innerText=s.data.name||"Untitled",a.onmousedown=n=>{n.preventDefault(),this.selectAutocompleteItem(s.data.name)},this.autocomplete.appendChild(a)}),this.autocomplete.style.display="block",this.autocomplete.style.left="16px",this.autocomplete.style.bottom="16px"}hideAutocomplete(){this.autocomplete.style.display="none"}navigateAutocomplete(e){var n,r;const s=Array.from(this.autocomplete.children),i=s.findIndex(l=>l.classList.contains("selected"));(n=s[i])==null||n.classList.remove("selected");const a=Math.max(0,Math.min(s.length-1,i+e));(r=s[a])==null||r.classList.add("selected")}selectAutocompleteItem(e){const s=window.getSelection();if(!s.rangeCount)return;const i=s.getRangeAt(0),a=i.startContainer;if(a.nodeType!==Node.TEXT_NODE)return;const n=a.textContent,r=n.substring(0,i.startOffset);if(r.match(/\[\[([^\]]*?)$/)){const c=r.lastIndexOf("[["),p=n.substring(i.startOffset),o=p.indexOf("]]"),b=o>=0?p.substring(o+2):p,y=document.createElement("span");y.className="wiki-link",y.dataset.link=e,y.innerText=`[[${e}]]`;const S=document.createTextNode(n.substring(0,c)),u=document.createTextNode(" "+b),d=a.parentNode;d.insertBefore(S,a),d.insertBefore(y,a),d.insertBefore(u,a),d.removeChild(a);const m=document.createRange();m.setStartAfter(y),m.collapse(!0),s.removeAllRanges(),s.addRange(m)}this.hideAutocomplete(),this.value=this.extractRawText(this.editor.innerHTML),this.onChange&&this.onChange(this.value)}getValue(){return this.extractRawText(this.editor.innerHTML)}setValue(e){this.value=e,this.editor&&(this.editor.innerHTML=this.renderWithLinks(e))}}class Re{constructor(e,s={}){this.container=e,this.item=null,this.onSave=s.onSave||null,this.onNameChange=s.onNameChange||null,this.onLinkClick=s.onLinkClick||null,this.getEntries=s.getEntries||(()=>[]),this.editorInstance=null}setItem(e){this.item=e,e?this.render():this.showEmpty()}showEmpty(){this.container.innerHTML=`
            <div class="empty-state">
                <h2>Select an entry</h2>
                <p>Or create a new one to start building your world.</p>
            </div>
        `}render(){if(!this.item)return this.showEmpty();const e=Y(this.item.type);this.container.innerHTML=`
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
        `;const s=this.container.querySelector("#asset-title"),i=this.container.querySelector("#metadata-fields"),a=this.container.querySelector("#asset-rte-mount");this.container.querySelector("#save-status"),e.fields.forEach(l=>{const c=document.createElement("div");c.className="metadata-field";const p=document.createElement("label");p.innerText=l.label,p.className="label";let o;l.type==="textarea"?(o=document.createElement("textarea"),o.rows=2,o.className="textarea"):(o=document.createElement("input"),o.type="text",o.className="input"),o.value=this.item.data[l.key]||"",o.oninput=()=>{this.item.data[l.key]=o.value,this.save()},c.appendChild(p),c.appendChild(o),i.appendChild(c)});const n=new $e(a,this.item.data.description||"",{getEntries:this.getEntries,onLinkClick:this.onLinkClick});n.render(),this.editorInstance=n,n.onChange=l=>{this.item.data.description=l,this.save()};let r=null;s.oninput=()=>{this.item.data.name=s.value,this.save(),clearTimeout(r),r=setTimeout(()=>{this.onNameChange&&this.onNameChange(this.item)},300)}}async save(){const e=this.container.querySelector("#save-status");e&&(e.innerText="Saving..."),this.onSave&&await this.onSave(this.item),e&&(e.innerText="Saved")}}const te={member_of:{id:"member_of",label:"Member of",icon:"👥",inverse:"has_member",description:"This entry is a member of the target."},has_member:{id:"has_member",label:"Has Member",icon:"👤",inverse:"member_of",description:"The target is a member of this entry."},located_in:{id:"located_in",label:"Located in",icon:"📍",inverse:"contains",description:"This entry is located within the target."},contains:{id:"contains",label:"Contains",icon:"🗺️",inverse:"located_in",description:"This entry contains the target."},ally_of:{id:"ally_of",label:"Ally of",icon:"🤝",inverse:"ally_of",description:"This entry is allied with the target."},enemy_of:{id:"enemy_of",label:"Enemy of",icon:"⚔️",inverse:"enemy_of",description:"This entry is an enemy of the target."},parent_of:{id:"parent_of",label:"Parent of",icon:"👨‍👧",inverse:"child_of",description:"This entry is the parent of the target."},child_of:{id:"child_of",label:"Child of",icon:"👶",inverse:"parent_of",description:"This entry is the child of the target."},related_to:{id:"related_to",label:"Related to",icon:"🔗",inverse:"related_to",description:"Generic relationship."},created_by:{id:"created_by",label:"Created by",icon:"🛠️",inverse:"creator_of",description:"This entry was created by the target."},creator_of:{id:"creator_of",label:"Creator of",icon:"✨",inverse:"created_by",description:"This entry created the target."}},se=t=>te[t]||te.related_to,je=()=>Object.values(te);class Pe{constructor(e,s={}){this.container=e,this.item=null,this.allItems=[],this.onSave=s.onSave||null,this.onNavigate=s.onNavigate||null}setItem(e,s){this.item=e,this.allItems=s,e&&this.render()}render(){this.item&&(this.item.data.relationships||(this.item.data.relationships=[]),this.container.innerHTML=`
            <div class="relationships-header">
                <div class="label">Relationships</div>
                <button id="add-relationship-btn" class="btn btn-primary" style="padding:4px 10px; font-size:11px;">+ Add</button>
            </div>
            <div id="relationships-list" class="relationships-list"></div>
            <div id="back-references" class="back-references"></div>
        `,this.renderRelationships(),this.container.querySelector("#add-relationship-btn").onclick=()=>this.showAddModal())}renderRelationships(){const e=this.container.querySelector("#relationships-list"),s=this.container.querySelector("#back-references");e.innerHTML="",this.item.data.relationships.length===0?e.innerHTML='<div class="text-muted text-sm">No relationships defined.</div>':(this.item.data.relationships.forEach((a,n)=>{const r=se(a.type),l=this.allItems.find(b=>b.id===a.targetId),c=l?l.data.name||"Untitled":"(Deleted)",p=l?Y(l.type):{icon:"❓"},o=document.createElement("div");o.className="relationship-row",o.innerHTML=`
                    <span>${r.icon}</span>
                    <span class="relationship-type">${r.label}</span>
                    <span class="relationship-target" data-id="${a.targetId}">${p.icon} ${c}</span>
                    <button class="relationship-delete" data-idx="${n}">×</button>
                `,e.appendChild(o)}),e.querySelectorAll(".relationship-target").forEach(a=>{a.onclick=()=>{const n=this.allItems.find(r=>r.id===a.dataset.id);n&&this.onNavigate&&this.onNavigate(n)}}),e.querySelectorAll(".relationship-delete").forEach(a=>{a.onclick=()=>{this.item.data.relationships.splice(parseInt(a.dataset.idx),1),this.onSave&&this.onSave(this.item),this.renderRelationships()}}));const i=this.allItems.filter(a=>{var n;return a.id!==this.item.id&&((n=a.data.relationships)==null?void 0:n.some(r=>r.targetId===this.item.id))});s.innerHTML="",i.length===0?s.innerHTML='<div class="text-muted text-xs">No incoming references.</div>':(s.innerHTML='<div class="back-ref-label">Referenced by:</div>',i.forEach(a=>{const n=Y(a.type);a.data.relationships.filter(l=>l.targetId===this.item.id).forEach(l=>{const c=se(l.type),p=te[c.inverse],o=document.createElement("div");o.className="back-ref-item",o.innerHTML=`<span>${n.icon}</span> ${a.data.name||"Untitled"} <span class="text-muted">(${(p==null?void 0:p.label)||c.label})</span>`,o.onclick=()=>{this.onNavigate&&this.onNavigate(a)},s.appendChild(o)})}))}showAddModal(){const e=document.createElement("div");e.className="flex flex-col gap-md",e.innerHTML=`
            <div>
                <label class="label">Type</label>
                <select id="rel-type-select" class="input" style="width:100%; margin-top:4px;"></select>
            </div>
            <div>
                <label class="label">Target Entry</label>
                <select id="rel-target-select" class="input" style="width:100%; margin-top:4px;"></select>
            </div>
        `,new X({title:"Add Relationship",content:e,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:n=>n.close()},{label:"Add",className:"btn btn-primary",onClick:n=>{const r=e.querySelector("#rel-type-select"),l=e.querySelector("#rel-target-select"),c=r.value,p=l.value;c&&p&&(this.item.data.relationships.push({type:c,targetId:p}),this.onSave&&this.onSave(this.item),this.renderRelationships()),n.close()}}]}).show();const i=e.querySelector("#rel-type-select"),a=e.querySelector("#rel-target-select");je().forEach(n=>{const r=document.createElement("option");r.value=n.id,r.innerText=`${n.icon} ${n.label}`,i.appendChild(r)}),this.allItems.filter(n=>n.id!==this.item.id).forEach(n=>{const r=Y(n.type),l=document.createElement("option");l.value=n.id,l.innerText=`${r.icon} ${n.data.name||"Untitled"}`,a.appendChild(l)})}}const w={id:"library",label:"Library",icon:"📚",entryList:null,entryEditor:null,relationshipManager:null,allItems:[],activeItem:null,render:async(t,e)=>{try{await T.init()}catch(n){t.innerHTML=`<div class="text-muted">Vault Error: ${n.message}</div>`;return}t.innerHTML=`
            <div class="library-layout">
                <div id="lib-sidebar" class="library-sidebar"></div>
                <div id="lib-main" class="library-main">
                    <div id="lib-editor-area"></div>
                    <div id="lib-relationships-area" class="relationships-section" style="display:none;"></div>
                </div>
            </div>
        `;const s=t.querySelector("#lib-sidebar"),i=t.querySelector("#lib-editor-area"),a=t.querySelector("#lib-relationships-area");if(w.allItems=await T.list(),w.entryList=new Ne(s,{onSelect:n=>w.selectItem(n,i,a),onCreate:()=>w.showCreateModal()}),w.entryList.setItems(w.allItems),w.entryEditor=new Re(i,{onSave:async n=>{await T.updateItem(n)},onNameChange:n=>{w.entryList.setItems(w.allItems)},onLinkClick:n=>{const r=w.allItems.find(l=>(l.data.name||"").toLowerCase()===n.toLowerCase());r&&w.selectItem(r,i,a)},getEntries:()=>w.allItems}),w.entryEditor.showEmpty(),w.relationshipManager=new Pe(a,{onSave:async n=>{await T.updateItem(n)},onNavigate:n=>{w.selectItem(n,i,a)}}),x.session.activeEntryId){const n=w.allItems.find(r=>r.id===x.session.activeEntryId);n&&w.selectItem(n,i,a)}},selectItem(t,e,s){w.activeItem=t,w.entryList.setActiveItem(t.id),w.entryEditor.setItem(t),s.style.display="block",w.relationshipManager.setItem(t,w.allItems),x.updateSession({activeEntryId:t.id})},showCreateModal(){const t=document.createElement("div");t.className="grid-3",z().forEach(s=>{const i=document.createElement("button");i.className="btn btn-secondary",i.style.cssText="flex-direction:column; padding:12px;",i.innerHTML=`<span style="font-size:20px;">${s.icon}</span><span class="text-xs">${s.label}</span>`,i.onclick=async()=>{e.close();const a=await T.addItem(s.id,{name:`New ${s.label}`,description:""});w.allItems.push(a),w.entryList.setItems(w.allItems);const n=document.querySelector("#lib-editor-area"),r=document.querySelector("#lib-relationships-area");w.selectItem(a,n,r)},t.appendChild(i)});const e=new X({title:"Create New Entry",content:t,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:s=>s.close()}]});e.show()}},Oe="samildanach_rules",He=1,D="rules";let $=null;const G={init:function(){return new Promise((t,e)=>{if($){t($);return}const s=indexedDB.open(Oe,He);s.onerror=i=>{console.error("[RulesDB] Failed to open database:",i.target.error),e(i.target.error)},s.onsuccess=i=>{$=i.target.result,console.log("[RulesDB] Database opened successfully"),t($)},s.onupgradeneeded=i=>{const a=i.target.result;if(!a.objectStoreNames.contains(D)){const n=a.createObjectStore(D,{keyPath:"id"});n.createIndex("type","type",{unique:!1}),n.createIndex("updatedAt","updatedAt",{unique:!1}),console.log("[RulesDB] Rules store created")}}})},list:function(t={}){return new Promise((e,s)=>{if(!$){s(new Error("RulesDB not initialized"));return}const a=$.transaction(D,"readonly").objectStore(D);let n;t.type?n=a.index("type").openCursor(IDBKeyRange.only(t.type)):n=a.openCursor();const r=[];n.onsuccess=l=>{const c=l.target.result;c?(r.push(c.value),c.continue()):(r.sort((p,o)=>new Date(o.updatedAt).getTime()-new Date(p.updatedAt).getTime()),e(r))},n.onerror=l=>s(l.target.error)})},get:function(t){return new Promise((e,s)=>{if(!$){s(new Error("RulesDB not initialized"));return}const n=$.transaction(D,"readonly").objectStore(D).get(t);n.onsuccess=()=>e(n.result||null),n.onerror=r=>s(r.target.error)})},add:function(t,e){return new Promise((s,i)=>{if(!$){i(new Error("RulesDB not initialized"));return}const a=new Date().toISOString();let n;try{n=U&&U.generateId?U.generateId("rule"):`rule_${crypto.randomUUID().split("-")[0]}`}catch{n="rule_"+Date.now()}const r={id:n,type:t,createdAt:a,updatedAt:a,data:e},p=$.transaction(D,"readwrite").objectStore(D).add(r);p.onsuccess=()=>{console.log("[RulesDB] Added rule:",n),s(r)},p.onerror=o=>{console.error("[RulesDB] Add failed:",o.target.error),i(o.target.error)}})},update:function(t){return new Promise((e,s)=>{if(!$){s(new Error("RulesDB not initialized"));return}t.updatedAt=new Date().toISOString();const n=$.transaction(D,"readwrite").objectStore(D).put(t);n.onsuccess=()=>e(t),n.onerror=r=>s(r.target.error)})},delete:function(t){return new Promise((e,s)=>{if(!$){s(new Error("RulesDB not initialized"));return}const n=$.transaction(D,"readwrite").objectStore(D).delete(t);n.onsuccess=()=>{console.log("[RulesDB] Deleted rule:",t),e()},n.onerror=r=>s(r.target.error)})},exportAll:function(){return this.list()},importAll:function(t){return new Promise(async(e,s)=>{if(!$){s(new Error("RulesDB not initialized"));return}let i=0;for(const a of t)try{const n={...a,id:U.generateId("rule"),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};await this.add(n.type,n.data),i++}catch(n){console.warn("[RulesDB] Import skip:",n)}e(i)})}},Ie=[{id:"item",label:"Item",icon:"⚔️",color:"#f59e0b",description:"Weapons, armor, consumables, and equipment",fields:[{key:"type",label:"Type",placeholder:"weapon, armor, consumable, tool..."},{key:"rarity",label:"Rarity",placeholder:"common, uncommon, rare, legendary..."},{key:"damage",label:"Damage/Effect",placeholder:"1d8 slashing, +2 AC..."},{key:"properties",label:"Properties",placeholder:"versatile, finesse, two-handed..."},{key:"value",label:"Value",placeholder:"50 gold, priceless..."},{key:"weight",label:"Weight",placeholder:"3 lbs, light..."}]},{id:"spell",label:"Spell",icon:"✨",color:"#8b5cf6",description:"Magic spells and mystical abilities",fields:[{key:"level",label:"Level",placeholder:"Cantrip, 1st, 2nd..."},{key:"school",label:"School",placeholder:"Evocation, Necromancy..."},{key:"castTime",label:"Cast Time",placeholder:"1 action, bonus action, ritual..."},{key:"range",label:"Range",placeholder:"60 feet, touch, self..."},{key:"duration",label:"Duration",placeholder:"Instantaneous, 1 minute, concentration..."},{key:"damage",label:"Effect/Damage",placeholder:"3d6 fire, heals 2d8+3..."},{key:"components",label:"Components",placeholder:"V, S, M (a bat guano)..."}]},{id:"ability",label:"Ability",icon:"💪",color:"#ef4444",description:"Class features, racial traits, and special abilities",fields:[{key:"source",label:"Source",placeholder:"Fighter 3, Elf racial, feat..."},{key:"usage",label:"Usage",placeholder:"At will, 1/short rest, 3/long rest..."},{key:"action",label:"Action Cost",placeholder:"Action, bonus action, reaction..."},{key:"effect",label:"Effect",placeholder:"Add 1d6 to attack, advantage on saves..."},{key:"prerequisite",label:"Prerequisite",placeholder:"STR 13, proficiency in..."}]},{id:"condition",label:"Condition",icon:"🔥",color:"#06b6d4",description:"Status effects, buffs, debuffs, and environmental conditions",fields:[{key:"type",label:"Type",placeholder:"debuff, buff, environmental..."},{key:"effect",label:"Effect",placeholder:"Disadvantage on attacks, -2 AC..."},{key:"duration",label:"Duration",placeholder:"1 round, until cured, permanent..."},{key:"removal",label:"Removal",placeholder:"Lesser restoration, DC 15 CON save..."},{key:"stacking",label:"Stacking",placeholder:"Does not stack, stacks to 3..."}]},{id:"rule",label:"Rule",icon:"📜",color:"#22c55e",description:"Custom game rules, house rules, and mechanics",fields:[{key:"category",label:"Category",placeholder:"Combat, exploration, social, rest..."},{key:"trigger",label:"Trigger",placeholder:"When attacking, on critical hit..."},{key:"resolution",label:"Resolution",placeholder:"Roll contested Athletics, DC = 10 + CR..."},{key:"consequences",label:"Consequences",placeholder:"On success... On failure..."}]}];function _e(){return Ie}function Le(t){return Ie.find(e=>e.id===t)}const B={id:"grimoire",label:"Grimoire",icon:"📖",_state:{activeCategory:"item",selectedRuleId:null},render:async t=>{var c;await G.init();let e=await G.list();const s=_e();let i=B._state.activeCategory||((c=s[0])==null?void 0:c.id)||"item",a=B._state.selectedRuleId,n=a?e.find(p=>p.id===a):null,r=null;async function l(){var b,y,S;e=await G.list(),n=a?e.find(u=>u.id===a):null;const p=e.filter(u=>u.type===i),o=Le(i);if(t.innerHTML=`
                <div class="grimoire-layout">
                    <!-- Left: Categories + List -->
                    <div class="grimoire-sidebar">
                        <div class="sidebar-header">
                            <strong>📖 Grimoire</strong>
                        </div>

                        <!-- Category Tabs -->
                        <div class="category-tabs">
                            ${s.map(u=>`
                                <button class="cat-tab ${u.id===i?"active":""}" 
                                        data-cat="${u.id}" 
                                        style="--cat-color: ${u.color}"
                                        title="${u.description}">
                                    ${u.icon}
                                </button>
                            `).join("")}
                        </div>

                        <!-- Rule List -->
                        <div class="rule-list">
                            ${p.length===0?`
                                <div class="empty-state">
                                    <div class="empty-icon">${(o==null?void 0:o.icon)||"📖"}</div>
                                    <div class="empty-text">No ${(o==null?void 0:o.label)||"rules"} yet</div>
                                </div>
                            `:p.map(u=>`
                                <div class="rule-item ${(n==null?void 0:n.id)===u.id?"selected":""}" data-id="${u.id}">
                                    <div class="rule-icon" style="color: ${o==null?void 0:o.color}">${o==null?void 0:o.icon}</div>
                                    <div class="rule-info">
                                        <div class="rule-name">${u.data.name||"Untitled"}</div>
                                        <div class="rule-meta">${u.data.type||u.data.level||""}</div>
                                    </div>
                                </div>
                            `).join("")}
                        </div>

                        <div class="sidebar-footer">
                            <button id="btn-add-rule" class="btn btn-primary btn-sm">+ Add ${(o==null?void 0:o.label)||"Rule"}</button>
                        </div>
                    </div>

                    <!-- Right: Editor -->
                    <div class="grimoire-main">
                        ${n?`
                            <div class="rule-editor">
                                <div class="editor-header">
                                    <input type="text" id="rule-name" class="input input-lg" 
                                           value="${n.data.name||""}" 
                                           placeholder="${(o==null?void 0:o.label)||"Rule"} Name">
                                    <button id="btn-delete-rule" class="btn btn-ghost btn-sm" title="Delete">🗑️</button>
                                </div>

                                <div class="editor-fields">
                                    ${((o==null?void 0:o.fields)||[]).map(u=>`
                                        <div class="field-group">
                                            <label class="field-label">${u.label}</label>
                                            <input type="text" 
                                                   class="input field-input" 
                                                   data-field="${u.key}"
                                                   value="${n.data[u.key]||""}"
                                                   placeholder="${u.placeholder||""}">
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
                                <div class="empty-text">Select or create a ${(o==null?void 0:o.label)||"rule"}</div>
                            </div>
                        `}
                    </div>
                </div>
            `,t.querySelectorAll(".cat-tab").forEach(u=>{u.onclick=()=>{i=u.dataset.cat,a=null,n=null,B._state.activeCategory=i,B._state.selectedRuleId=null,l()}}),t.querySelectorAll(".rule-item").forEach(u=>{u.onclick=()=>{a=u.dataset.id,n=e.find(d=>d.id===a),B._state.selectedRuleId=a,l()}}),(b=t.querySelector("#btn-add-rule"))==null||b.addEventListener("click",async()=>{const u=await G.add(i,{name:`New ${(o==null?void 0:o.label)||"Rule"}`,description:""});console.log("[Grimoire] Created rule:",u.id),a=u.id,B._state.selectedRuleId=a,l()}),(y=t.querySelector("#btn-delete-rule"))==null||y.addEventListener("click",async()=>{n&&confirm(`Delete "${n.data.name||"this rule"}"?`)&&(await G.delete(n.id),console.log("[Grimoire] Deleted rule:",n.id),a=null,n=null,B._state.selectedRuleId=null,l())}),(S=t.querySelector("#btn-save-rule"))==null||S.addEventListener("click",async()=>{var m;if(!n)return;const d={name:((m=t.querySelector("#rule-name"))==null?void 0:m.value)||""};t.querySelectorAll(".field-input").forEach(v=>{d[v.dataset.field]=v.value}),r&&(d.description=r.getValue()),n.data=d,await G.update(n),console.log("[Grimoire] Saved rule:",n.id,d),l()}),n){const u=t.querySelector("#description-editor");u&&(r=new $e(u,n.data.description||""),r.render())}}await l()}},ge={id:"graph",label:"Graph",icon:"🕸️",render:async(t,e)=>{try{await T.init()}catch(h){t.innerHTML=`<div class="text-muted">Vault Error: ${h.message}</div>`;return}t.style.padding="0",t.innerHTML=`
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
        `;const s=t.querySelector("#graph-container"),i=t.querySelector("#graph-canvas"),a=i.getContext("2d"),n=()=>{i.width=s.clientWidth,i.height=s.clientHeight};n(),window.addEventListener("resize",n);const r=await T.list(),l=r.map((h,g)=>{const f=Y(h.type),k=g/r.length*Math.PI*2,E=Math.min(i.width,i.height)*.3;return{id:h.id,item:h,label:h.data.name||"Untitled",icon:f.icon,color:f.color,x:i.width/2+Math.cos(k)*E,y:i.height/2+Math.sin(k)*E,vx:0,vy:0}}),c=Object.fromEntries(l.map(h=>[h.id,h])),p=[];r.forEach(h=>{(h.data.relationships||[]).forEach(g=>{if(c[g.targetId]){const f=se(g.type);p.push({from:h.id,to:g.targetId,label:f.label,color:f.icon})}})});let o={x:0,y:0,scale:1},b=!1,y={x:0,y:0},S=null;const u=()=>{a.clearRect(0,0,i.width,i.height),a.save(),a.translate(o.x,o.y),a.scale(o.scale,o.scale),a.lineWidth=2,p.forEach(h=>{const g=c[h.from],f=c[h.to];g&&f&&(a.strokeStyle="rgba(100, 116, 139, 0.5)",a.beginPath(),a.moveTo(g.x,g.y),a.lineTo(f.x,f.y),a.stroke())}),l.forEach(h=>{a.fillStyle=h.color||"#6366f1",a.beginPath(),a.arc(h.x,h.y,24,0,Math.PI*2),a.fill(),a.font="16px sans-serif",a.textAlign="center",a.textBaseline="middle",a.fillStyle="#fff",a.fillText(h.icon,h.x,h.y),a.font="11px sans-serif",a.fillStyle="var(--text-primary)",a.fillText(h.label,h.x,h.y+36)}),a.restore()},d=()=>{const h=i.width/2,g=i.height/2;l.forEach(f=>{l.forEach(k=>{if(f.id===k.id)return;const E=f.x-k.x,N=f.y-k.y,A=Math.sqrt(E*E+N*N)||1,R=5e3/(A*A);f.vx+=E/A*R,f.vy+=N/A*R}),f.vx+=(h-f.x)*.001,f.vy+=(g-f.y)*.001}),p.forEach(f=>{const k=c[f.from],E=c[f.to];if(k&&E){const N=E.x-k.x,A=E.y-k.y,R=Math.sqrt(N*N+A*A)||1,V=(R-150)*.01;k.vx+=N/R*V,k.vy+=A/R*V,E.vx-=N/R*V,E.vy-=A/R*V}}),l.forEach(f=>{S!==f&&(f.x+=f.vx*.1,f.y+=f.vy*.1),f.vx*=.9,f.vy*=.9}),u(),requestAnimationFrame(d)};d();const m=h=>({x:(h.offsetX-o.x)/o.scale,y:(h.offsetY-o.y)/o.scale}),v=(h,g)=>l.find(f=>{const k=f.x-h,E=f.y-g;return Math.sqrt(k*k+E*E)<24});i.onmousedown=h=>{const g=m(h),f=v(g.x,g.y);f?S=f:(b=!0,y={x:h.clientX,y:h.clientY})},i.onmousemove=h=>{if(S){const g=m(h);S.x=g.x,S.y=g.y}else b&&(o.x+=h.clientX-y.x,o.y+=h.clientY-y.y,y={x:h.clientX,y:h.clientY})},i.onmouseup=()=>{S=null,b=!1},i.onwheel=h=>{h.preventDefault();const g=h.deltaY>0?.9:1.1;o.scale*=g,o.scale=Math.min(Math.max(.3,o.scale),3)},t.querySelector("#graph-reset").onclick=()=>{o={x:0,y:0,scale:1}},t.querySelector("#graph-relayout").onclick=()=>{l.forEach((h,g)=>{const f=g/l.length*Math.PI*2,k=Math.min(i.width,i.height)*.3;h.x=i.width/2+Math.cos(f)*k,h.y=i.height/2+Math.sin(f)*k,h.vx=0,h.vy=0})}}};class Be{constructor(e,s,i){this.container=e,this.nodeLayer=s,this.svgLayer=i,this.nodes=[],this.links=[],this.transform={x:0,y:0,scale:1},this.isDragging=!1,this.lastMouse={x:0,y:0},this.onDataChange=null}init(){this.container.onmousedown=e=>{(e.button===1||e.button===0&&e.altKey)&&(this.isDragging=!0,this.lastMouse={x:e.clientX,y:e.clientY},this.container.style.cursor="grabbing",e.preventDefault())},window.onmousemove=e=>{if(this.isDragging){const s=e.clientX-this.lastMouse.x,i=e.clientY-this.lastMouse.y;this.transform.x+=s,this.transform.y+=i,this.lastMouse={x:e.clientX,y:e.clientY},this.updateTransform()}},window.onmouseup=e=>{this.isDragging=!1,this.container.style.cursor="default"},this.container.onwheel=e=>{e.preventDefault();const s=e.deltaY>0?.9:1.1;this.transform.scale*=s,this.transform.scale=Math.min(Math.max(.2,this.transform.scale),2),this.updateTransform()}}exportData(){return{nodes:this.nodes,links:this.links,transform:this.transform}}importData(e){e&&(this.nodes=[],this.nodeLayer.innerHTML="",e.transform&&(this.transform=e.transform,this.updateTransform()),e.nodes&&e.nodes.forEach(s=>this.addNode(s,!0)),this.links=e.links||[],this.updateLinks())}notifyChange(){this.onDataChange&&this.onDataChange(this.exportData())}updateTransform(){this.nodeLayer.style.transform=`translate(${this.transform.x}px, ${this.transform.y}px) scale(${this.transform.scale})`,this.updateLinks()}resetView(){this.transform={x:0,y:0,scale:1},this.updateTransform()}addNode(e,s=!1){this.nodes.push(e);const i=this.renderNodeElement(e);this.nodeLayer.appendChild(i),s||this.notifyChange()}renderNodeElement(e){const s=document.createElement("div");s.className="node"+(e.type?` ${e.type}`:""),s.id=e.id,s.style.left=e.x+"px",s.style.top=e.y+"px";let i=(e.inputs||[]).map(b=>`
            <div class="socket-row">
                <div class="socket input" title="${b}"></div>
                <span>${b}</span>
            </div>
        `).join(""),a=(e.outputs||[]).map(b=>`
            <div class="socket-row" style="justify-content: flex-end;">
                <span>${b}</span>
                <div class="socket output" title="${b}"></div>
            </div>
        `).join("");s.innerHTML=`
            <div class="node-header">${e.title}</div>
            <div class="node-body">
                ${i}
                <!-- Body content could go here -->
                ${a}
            </div>
        `;const n=s.querySelector(".node-header");let r=!1,l={x:0,y:0},c={x:e.x,y:e.y};n.onmousedown=b=>{b.button===0&&(r=!0,l={x:b.clientX,y:b.clientY},c={x:e.x,y:e.y},s.classList.add("selected"),b.stopPropagation())};const p=b=>{if(r){const y=(b.clientX-l.x)/this.transform.scale,S=(b.clientY-l.y)/this.transform.scale;e.x=c.x+y,e.y=c.y+S,s.style.left=e.x+"px",s.style.top=e.y+"px",this.updateLinks()}},o=()=>{r&&(r=!1,s.classList.remove("selected"),this.notifyChange())};return window.addEventListener("mousemove",p),window.addEventListener("mouseup",o),s}updateLinks(){if(this.svgLayer.innerHTML="",this.nodes.length>=2){const e=this.nodes[0],s=this.nodes[1],i=(e.x+200)*this.transform.scale+this.transform.x,a=(e.y+40)*this.transform.scale+this.transform.y,n=s.x*this.transform.scale+this.transform.x,r=(s.y+40)*this.transform.scale+this.transform.y,l=document.createElementNS("http://www.w3.org/2000/svg","path"),c=i+50*this.transform.scale,p=n-50*this.transform.scale,o=`M ${i} ${a} C ${c} ${a}, ${p} ${r}, ${n} ${r}`;l.setAttribute("d",o),l.setAttribute("class","connection-line"),this.svgLayer.appendChild(l)}}}const xe={event:{id:"event",label:"Event",icon:"⚡",color:"#4ade80",description:'Triggers like "On Combat Start", "On Turn Begin"',templates:[{title:"On Start",outputs:["next"]},{title:"On Turn Begin",outputs:["next"]},{title:"On Attack",inputs:["attacker","target"],outputs:["next"]},{title:"On Damage",inputs:["target","amount"],outputs:["next"]}]},condition:{id:"condition",label:"Condition",icon:"❓",color:"#facc15",description:"If/else branching logic",templates:[{title:"If Greater Than",inputs:["a","b"],outputs:["true","false"]},{title:"If Equal",inputs:["a","b"],outputs:["true","false"]},{title:"If Has Tag",inputs:["target","tag"],outputs:["true","false"]},{title:"Compare Roll",inputs:["roll","dc"],outputs:["success","failure"]}]},action:{id:"action",label:"Action",icon:"🎲",color:"#60a5fa",description:"Roll dice, modify values, apply effects",templates:[{title:"Roll Dice",inputs:["expression"],outputs:["result","next"]},{title:"Add Value",inputs:["a","b"],outputs:["result"]},{title:"Apply Damage",inputs:["target","amount"],outputs:["next"]},{title:"Set Variable",inputs:["name","value"],outputs:["next"]}]},reference:{id:"reference",label:"Library",icon:"📚",color:"#c084fc",description:"Link to Library entries (lore, characters, locations)",templates:[]},rules:{id:"rules",label:"Rules",icon:"📖",color:"#f59e0b",description:"Link to Grimoire entries (items, spells, abilities)",templates:[]}};class Ue{constructor(e={}){this.onSelect=e.onSelect||null}async show(){const e=document.createElement("div");e.className="node-picker";const s=document.createElement("div");s.className="library-tabs",s.style.marginBottom="16px";const i=document.createElement("div");i.className="node-picker-panels";const a=async r=>{s.querySelectorAll(".tab").forEach(c=>{c.classList.toggle("active",c.dataset.type===r)}),i.innerHTML="";const l=xe[r];if(r==="reference"){await T.init();const c=await T.list();if(c.length===0){i.innerHTML='<div class="text-muted">No Library entries. Create entries in the Library first.</div>';return}const p=document.createElement("div");p.className="grid-2",p.style.gap="8px",c.forEach(o=>{const b=Y(o.type),y=document.createElement("button");y.className="btn btn-secondary",y.style.cssText="justify-content:flex-start; padding:8px 12px; text-align:left;",y.innerHTML=`<span style="margin-right:8px;">${(b==null?void 0:b.icon)||"📄"}</span> ${o.data.name||"Untitled"}`,y.onclick=()=>{this.onSelect&&this.onSelect({type:"reference",title:`📚 ${o.data.name||"Untitled"}`,entryId:o.id,entryType:o.type,inputs:["in"],outputs:["out","data"]}),n.close()},p.appendChild(y)}),i.appendChild(p)}else if(r==="rules"){await G.init();const c=await G.list();if(c.length===0){i.innerHTML='<div class="text-muted">No Grimoire entries. Create rules in the Grimoire first.</div>';return}const p=document.createElement("div");p.className="grid-2",p.style.gap="8px",c.forEach(o=>{const b=Le(o.type),y=document.createElement("button");y.className="btn btn-secondary",y.style.cssText="justify-content:flex-start; padding:8px 12px; text-align:left;",y.innerHTML=`<span style="margin-right:8px;">${(b==null?void 0:b.icon)||"📖"}</span> ${o.data.name||"Untitled"}`,y.onclick=()=>{this.onSelect&&this.onSelect({type:"rules",title:`📖 ${o.data.name||"Untitled"}`,ruleId:o.id,ruleType:o.type,inputs:["in"],outputs:["out","effect"]}),n.close()},p.appendChild(y)}),i.appendChild(p)}else{const c=document.createElement("div");c.className="grid-2",c.style.gap="8px",l.templates.forEach(p=>{const o=document.createElement("button");o.className="btn btn-secondary",o.style.cssText="justify-content:flex-start; padding:8px 12px;",o.innerHTML=`<span style="margin-right:8px;">${l.icon}</span> ${p.title}`,o.onclick=()=>{this.onSelect&&this.onSelect({type:r,title:p.title,inputs:p.inputs||[],outputs:p.outputs||[]}),n.close()},c.appendChild(o)}),i.appendChild(c)}};Object.values(xe).forEach(r=>{const l=document.createElement("button");l.className="tab",l.dataset.type=r.id,l.innerHTML=`${r.icon} ${r.label}`,l.onclick=()=>a(r.id),s.appendChild(l)}),e.appendChild(s),e.appendChild(i);const n=new X({title:"Add Node",content:e,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:r=>r.close()}]});n.show(),await a("event")}}const Se={id:"architect",label:"Architect",icon:"📐",render:(t,e)=>{t.style.padding="0",t.innerHTML=`
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
        `;const s=t.querySelector("#arch-workspace"),i=t.querySelector("#arch-nodes"),a=t.querySelector("#arch-svg"),n=new Be(s,i,a);n.init();const r=new Ue({onSelect:o=>{n.addNode({id:U.generateId("node"),x:100+Math.random()*100,y:100+Math.random()*100,type:o.type,title:o.title,inputs:o.inputs||[],outputs:o.outputs||[],entryId:o.entryId||null,entryType:o.entryType||null})}});t.querySelector("#btn-add-node").onclick=()=>{r.show()},t.querySelector("#btn-reset-view").onclick=()=>{n.resetView()},t.querySelector("#btn-clear-all").onclick=()=>{confirm("Clear all nodes?")&&(n.nodes=[],n.links=[],i.innerHTML="",a.innerHTML="",n.notifyChange())};const l="samildanach_architect_layout";n.onDataChange=o=>{localStorage.setItem(l,JSON.stringify(o))};const c=localStorage.getItem(l);if(c)try{const o=JSON.parse(c);n.importData(o)}catch(o){console.error("Failed to load architect layout:",o),p()}else p();function p(){n.nodes.length===0&&(n.addNode({id:"start",x:50,y:50,type:"event",title:"On Attack",inputs:["attacker","target"],outputs:["next"]}),n.addNode({id:"d20",x:300,y:100,type:"action",title:"Roll Dice",inputs:["expression"],outputs:["result","next"]}),n.addNode({id:"check",x:550,y:50,type:"condition",title:"Compare Roll",inputs:["roll","dc"],outputs:["success","failure"]}))}}},pe={parse(t){const e=t.trim().match(/^(\d+)?d(\d+)([+-]\d+)?$/i);return e?{count:parseInt(e[1])||1,sides:parseInt(e[2]),modifier:parseInt(e[3])||0}:null},rollOne(t){return Math.floor(Math.random()*t)+1},rollMany(t,e){const s=[];for(let i=0;i<t;i++)s.push(this.rollOne(e));return s},roll(t){const e=this.parse(t);if(!e)return{error:"Invalid format. Use NdX or NdX+Y (e.g., 2d6+3)"};const s=this.rollMany(e.count,e.sides),i=s.reduce((n,r)=>n+r,0),a=i+e.modifier;return{expression:t,rolls:s,subtotal:i,modifier:e.modifier,total:a}},format(t){if(t.error)return t.error;let e=`[${t.rolls.join(", ")}]`;return t.modifier!==0&&(e+=` ${t.modifier>0?"+":""}${t.modifier}`),e+=` = ${t.total}`,e},stats(t){const e=this.parse(t);if(!e)return null;const s=e.count+e.modifier,i=e.count*e.sides+e.modifier,a=(s+i)/2;return{min:s,max:i,average:a.toFixed(1)}}},re={runDiceSimulation(t,e=1e3){const s=[],i={};for(let d=0;d<e;d++){const m=pe.roll(t);if(m.error)return{error:m.error};s.push(m.total),i[m.total]=(i[m.total]||0)+1}const a=[...s].sort((d,m)=>d-m),r=s.reduce((d,m)=>d+m,0)/e,c=s.map(d=>Math.pow(d-r,2)).reduce((d,m)=>d+m,0)/e,p=Math.sqrt(c);let o=null,b=0;for(const[d,m]of Object.entries(i))m>b&&(b=m,o=parseInt(d));const y=e%2===0?(a[e/2-1]+a[e/2])/2:a[Math.floor(e/2)],S=a[Math.floor(e*.25)],u=a[Math.floor(e*.75)];return{expression:t,iterations:e,results:s,distribution:i,stats:{min:a[0],max:a[a.length-1],mean:r.toFixed(2),median:y,mode:o,stdDev:p.toFixed(2),p25:S,p75:u}}},getHistogramData(t){if(t.error)return[];const{distribution:e,iterations:s,stats:i}=t,a=[];for(let n=i.min;n<=i.max;n++){const r=e[n]||0;a.push({value:n,count:r,percentage:(r/s*100).toFixed(1)})}return a},compare(t,e,s=1e3){const i=this.runDiceSimulation(t,s),a=this.runDiceSimulation(e,s);if(i.error||a.error)return{error:i.error||a.error};let n=0,r=0,l=0;for(let c=0;c<s;c++)i.results[c]>a.results[c]?n++:a.results[c]>i.results[c]?r++:l++;return{expr1:{expression:t,stats:i.stats},expr2:{expression:e,stats:a.stats},comparison:{wins1:n,wins2:r,ties:l,win1Pct:(n/s*100).toFixed(1),win2Pct:(r/s*100).toFixed(1),tiePct:(l/s*100).toFixed(1)}}}},we={id:"laboratory",label:"Laboratory",icon:"🧪",render:(t,e)=>{t.innerHTML=`
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
        `;const s=t.querySelector("#lab-expr"),i=t.querySelector("#lab-roll"),a=t.querySelector("#lab-result"),n=t.querySelector("#lab-stats");s.oninput=()=>{const d=pe.stats(s.value);d?n.innerText=`Range: ${d.min}–${d.max} | Average: ${d.average}`:n.innerText=""},s.oninput(),i.onclick=()=>{const d=s.value.trim();if(!d)return;const m=pe.roll(d);m.error?a.innerHTML=`<span style="color:var(--status-error);">${m.error}</span>`:a.innerHTML=`
                    <div><strong>Rolls:</strong> [${m.rolls.join(", ")}]</div>
                    ${m.modifier!==0?`<div><strong>Modifier:</strong> ${m.modifier>0?"+":""}${m.modifier}</div>`:""}
                    <div class="roll-total"><strong>Total:</strong> ${m.total}</div>
                `},s.onkeydown=d=>{d.key==="Enter"&&i.onclick()};const r=t.querySelector("#sim-expr"),l=t.querySelector("#sim-iterations"),c=t.querySelector("#sim-run"),p=t.querySelector("#sim-results"),o=t.querySelector("#histogram");c.onclick=()=>{const d=r.value.trim(),m=parseInt(l.value);d&&(c.disabled=!0,c.innerText="Running...",setTimeout(()=>{const v=re.runDiceSimulation(d,m);if(c.disabled=!1,c.innerText="Run",v.error){p.style.display="none",alert(v.error);return}p.style.display="block",t.querySelector("#stat-min").innerText=v.stats.min,t.querySelector("#stat-max").innerText=v.stats.max,t.querySelector("#stat-mean").innerText=v.stats.mean,t.querySelector("#stat-median").innerText=v.stats.median,t.querySelector("#stat-mode").innerText=v.stats.mode,t.querySelector("#stat-stddev").innerText=v.stats.stdDev;const h=re.getHistogramData(v),g=Math.max(...h.map(f=>f.count));o.innerHTML=h.map(f=>`
                    <div class="hist-bar-container">
                        <div class="hist-bar" style="height: ${f.count/g*100}%;" title="${f.value}: ${f.count} (${f.percentage}%)"></div>
                        <span class="hist-label">${f.value}</span>
                    </div>
                `).join("")},10))};const b=t.querySelector("#cmp-expr1"),y=t.querySelector("#cmp-expr2"),S=t.querySelector("#cmp-run"),u=t.querySelector("#cmp-results");S.onclick=()=>{const d=b.value.trim(),m=y.value.trim();if(!d||!m)return;const v=re.compare(d,m,1e3);if(v.error){u.style.display="none",alert(v.error);return}u.style.display="block",u.innerHTML=`
                <div class="compare-stat">
                    <strong>${d}</strong> wins <span class="highlight">${v.comparison.win1Pct}%</span> of the time
                    <small>(avg: ${v.expr1.stats.mean})</small>
                </div>
                <div class="compare-stat">
                    <strong>${m}</strong> wins <span class="highlight">${v.comparison.win2Pct}%</span> of the time
                    <small>(avg: ${v.expr2.stats.mean})</small>
                </div>
                <div class="compare-stat tie">
                    Ties: ${v.comparison.tiePct}%
                </div>
            `}}},le="samildanach_llm_configs",Q="samildanach_active_config_id",j={getConfigs(){return JSON.parse(localStorage.getItem(le)||"[]")},saveConfig(t){const e=this.getConfigs(),s=e.findIndex(i=>i.id===t.id);s>=0?e[s]=t:e.push(t),localStorage.setItem(le,JSON.stringify(e))},deleteConfig(t){const e=this.getConfigs().filter(s=>s.id!==t);localStorage.setItem(le,JSON.stringify(e)),localStorage.getItem(Q)===t&&localStorage.removeItem(Q)},getActiveConfig(){const t=this.getConfigs(),e=localStorage.getItem(Q);return t.find(s=>s.id===e)||t[0]||null},setActiveConfig(t){localStorage.setItem(Q,t)},async generate(t,e,s={}){var p,o,b,y,S,u,d,m,v,h,g,f,k,E,N,A,R,V;const a={...this.getActiveConfig()||{},...s},n=a.provider||"gemini",r=a.model||"gemini-1.5-flash",l=a.apiKey||"",c=a.maxTokens||4096;if(!l&&n!=="kobold")throw new Error(`Missing API Key for ${n}. Please configure in Settings.`);if(n==="gemini"){const H=`https://generativelanguage.googleapis.com/v1beta/models/${r}:generateContent?key=${l}`,M={contents:e.map(q=>({role:q.role==="user"?"user":"model",parts:[{text:q.content}]})),generationConfig:{temperature:.9,maxOutputTokens:c}};t&&(M.systemInstruction={parts:[{text:t}]});const I=await fetch(H,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(M)});if(!I.ok){const q=await I.json();throw new Error(((p=q.error)==null?void 0:p.message)||I.statusText)}return((u=(S=(y=(b=(o=(await I.json()).candidates)==null?void 0:o[0])==null?void 0:b.content)==null?void 0:y.parts)==null?void 0:S[0])==null?void 0:u.text)||"(No response)"}if(["openai","openrouter","chutes","custom"].includes(n)){let H="https://api.openai.com/v1/chat/completions";n==="openrouter"&&(H="https://openrouter.ai/api/v1/chat/completions"),n==="chutes"&&(H="https://llm.chutes.ai/v1/chat/completions"),n==="custom"&&(H=`${(a.baseUrl||"https://api.example.com/v1").replace(/\/$/,"")}/chat/completions`);const J=[{role:"system",content:t},...e.map(_=>({role:_.role==="model"?"assistant":_.role,content:_.content}))],M={"Content-Type":"application/json",Authorization:`Bearer ${l}`};n==="openrouter"&&(M["HTTP-Referer"]="https://samildanach.app",M["X-Title"]="Samildánach");let I=c,P=0;const q=1;for(;P<=q;){const _=await fetch(H,{method:"POST",headers:M,body:JSON.stringify({model:r,messages:J,temperature:.9,max_tokens:I})});if(!_.ok){const fe=((d=(await _.json()).error)==null?void 0:d.message)||_.statusText,ne=fe.match(/maximum context length is (\d+) tokens.*requested about (\d+) tokens.*\((\d+) in the messages/);if(ne&&P<q){const Me=parseInt(ne[1]),Ae=parseInt(ne[3]),ae=Me-Ae-200;if(ae>0){console.warn(`[LLM] Context limit exceeded. Auto-scaling max_tokens from ${I} to ${ae}.`),I=ae,P++;continue}}throw new Error(fe)}const he=await _.json();let ie=((h=(v=(m=he.choices)==null?void 0:m[0])==null?void 0:v.message)==null?void 0:h.content)||"";const be=(k=(f=(g=he.choices)==null?void 0:g[0])==null?void 0:f.message)==null?void 0:k.reasoning_content;return be&&(ie=`<think>${be}</think>
${ie}`),ie||"(No response)"}}if(n==="anthropic"){const H="https://api.anthropic.com/v1/messages",J=e.map(P=>({role:P.role==="model"?"assistant":"user",content:P.content})),M=await fetch(H,{method:"POST",headers:{"x-api-key":l,"anthropic-version":"2023-06-01","content-type":"application/json","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:r,max_tokens:c,system:t,messages:J,temperature:.9})});if(!M.ok){const P=await M.json();throw new Error(((E=P.error)==null?void 0:E.message)||M.statusText)}return((A=(N=(await M.json()).content)==null?void 0:N[0])==null?void 0:A.text)||"(No response)"}if(n==="kobold"){const J=`${(a.baseUrl||"http://localhost:5001").replace(/\/$/,"")}/api/v1/generate`,M=`${t}

${e.map(q=>`${q.role==="user"?"User":"Assistant"}: ${q.content}`).join(`
`)}`,I=await fetch(J,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:M,max_context_length:4096,max_length:c>2048?2048:c,temperature:.9})});if(!I.ok){const q=await I.text();throw new Error(`Kobold Error: ${q||I.statusText}`)}return((V=(R=(await I.json()).results)==null?void 0:R[0])==null?void 0:V.text)||"(No response)"}throw new Error(`Unknown provider: ${n}`)},async testConfig(t){try{return await this.generate("You are a test assistant.",[{role:"user",content:'Say "Hello" in one word.'}],t),!0}catch(e){throw e}}},ce=[{id:"gemini",label:"Google Gemini",models:["gemini-1.5-flash","gemini-1.5-pro","gemini-2.0-flash"]},{id:"openai",label:"OpenAI",models:["gpt-4o","gpt-4o-mini","gpt-4-turbo","gpt-3.5-turbo"]},{id:"openrouter",label:"OpenRouter",models:["anthropic/claude-3.5-sonnet","google/gemini-pro-1.5","meta-llama/llama-3.1-405b-instruct"]},{id:"anthropic",label:"Anthropic",models:["claude-3-5-sonnet-20241022","claude-3-opus-20240229","claude-3-haiku-20240307"]},{id:"chutes",label:"Chutes AI",models:["deepseek-ai/DeepSeek-V3","deepseek-ai/DeepSeek-R1"]},{id:"kobold",label:"Kobold AI (Local)",models:["local"],baseUrl:"http://localhost:5001"},{id:"custom",label:"Custom Endpoint",models:["custom"]}],ke="samildanach_scribe_state",Ee=[{id:"brainstorm",label:"💡 Brainstorm",desc:"Generate ideas and explore concepts"},{id:"expand",label:"📝 Expand",desc:"Develop and detail existing entries"},{id:"critique",label:"🔍 Critique",desc:"Get feedback and suggestions"}],Te={brainstorm:[{label:"Character concept",prompt:"Help me brainstorm a character who..."},{label:"Location idea",prompt:"I need a unique location for..."},{label:"Faction conflict",prompt:"Create tension between factions by..."},{label:"Plot hook",prompt:"Generate a compelling plot hook involving..."}],expand:[{label:"Add history",prompt:"Expand the backstory and history of..."},{label:"Describe appearance",prompt:"Describe in vivid detail how this looks:"},{label:"Add relationships",prompt:"How might this connect to other elements in my world?"},{label:"Cultural details",prompt:"What customs, traditions, or beliefs would exist here?"}],critique:[{label:"Check consistency",prompt:"Review this for internal consistency:"},{label:"Strengthen concept",prompt:"How can I make this more unique or compelling?"},{label:"Find gaps",prompt:"What questions or gaps exist in this concept?"},{label:"Balance check",prompt:"Is this balanced for gameplay? What adjustments?"}]},me={id:"scribe",label:"Scribe",icon:"✍️",render:async t=>{let e=JSON.parse(localStorage.getItem(ke)||"{}");e.mode||(e.mode="brainstorm"),e.history||(e.history=[]),e.selectedEntries||(e.selectedEntries=[]),e.sessions||(e.sessions={});const s=()=>localStorage.setItem(ke,JSON.stringify(e));await T.init();const i=await T.list(),a=z();t.innerHTML=`
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
                            ${Ee.map(u=>`
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
                            ${a.map(u=>{const d=i.filter(m=>m.type===u.id);return d.length===0?"":`
                                    <div class="entry-category">
                                        <div class="category-label">${u.icon} ${u.label}</div>
                                        ${d.map(m=>`
                                            <label class="entry-checkbox">
                                                <input type="checkbox" 
                                                    value="${m.id}" 
                                                    ${e.selectedEntries.includes(m.id)?"checked":""}>
                                                <span>${m.data.name||"Untitled"}</span>
                                            </label>
                                        `).join("")}
                                    </div>
                                `}).join("")}
                            ${i.length===0?'<div class="empty-hint">No Library entries yet</div>':""}
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
        `;const n=t.querySelector("#chat-log"),r=t.querySelector("#chat-input"),l=t.querySelector("#btn-send"),c=t.querySelector("#template-select"),p=t.querySelector("#session-select");function o(){const u=Te[e.mode]||[];c.innerHTML='<option value="">📝 Templates...</option>'+u.map((d,m)=>`<option value="${m}">${d.label}</option>`).join("")}o(),c.onchange=()=>{const u=parseInt(c.value);if(!isNaN(u)){const d=Te[e.mode]||[];d[u]&&(r.value=d[u].prompt,r.focus())}c.value=""},t.querySelectorAll(".mode-btn").forEach(u=>{u.onclick=()=>{e.mode=u.dataset.mode,t.querySelectorAll(".mode-btn").forEach(d=>d.classList.remove("active")),u.classList.add("active"),o(),s()}}),t.querySelectorAll(".entry-checkbox input").forEach(u=>{u.onchange=()=>{const d=u.value;u.checked?e.selectedEntries.includes(d)||e.selectedEntries.push(d):e.selectedEntries=e.selectedEntries.filter(m=>m!==d),s()}});function b(){if(e.history.length===0){n.innerHTML=`
                    <div class="chat-empty">
                        <div class="empty-icon">✍️</div>
                        <div class="empty-title">The Scribe</div>
                        <div class="empty-hint">Your AI world-building assistant. Select Library entries for context, then ask for help.</div>
                    </div>
                `;return}n.innerHTML=e.history.map(u=>`
                <div class="chat-bubble ${u.role}">
                    <div class="bubble-content">${u.content.replace(/\n/g,"<br>")}</div>
                    <div class="bubble-meta">
                        <span>${u.role==="user"?"You":"✍️ Scribe"}</span>
                        <button class="btn-copy" data-content="${encodeURIComponent(u.content)}" title="Copy">📋</button>
                    </div>
                </div>
            `).join(""),n.querySelectorAll(".btn-copy").forEach(u=>{u.onclick=()=>{navigator.clipboard.writeText(decodeURIComponent(u.dataset.content))}}),n.scrollTop=n.scrollHeight}b();function y(){Ee.find(d=>d.id===e.mode);let u="You are The Scribe, an expert world-building assistant for tabletop RPG settings. ";if(e.mode==="brainstorm"?u+="Help the user generate creative ideas, explore concepts, and brainstorm possibilities. Be imaginative and offer multiple options.":e.mode==="expand"?u+="Help the user develop and expand existing ideas with rich detail. Add depth, history, and connections.":e.mode==="critique"&&(u+="Provide constructive feedback on the user's ideas. Identify strengths, weaknesses, inconsistencies, and suggest improvements."),e.selectedEntries.length>0){const d=e.selectedEntries.map(m=>i.find(v=>v.id===m)).filter(Boolean);d.length>0&&(u+=`

[WORLD CONTEXT - The user has selected these entries from their world Bible:]
`,d.forEach(m=>{const v=a.find(h=>h.id===m.type);if(u+=`
[${(v==null?void 0:v.label)||m.type}] ${m.data.name||"Untitled"}`,m.data.description){const h=m.data.description.replace(/<[^>]+>/g,"").substring(0,300);u+=`: ${h}`}v!=null&&v.fields&&v.fields.forEach(h=>{m.data[h.key]&&(u+=` | ${h.label}: ${m.data[h.key]}`)}),m.data.relationships&&m.data.relationships.length>0&&(u+=`
  Relationships:`,m.data.relationships.forEach(h=>{const g=i.find(E=>E.id===h.targetId),f=(g==null?void 0:g.data.name)||"(Unknown)",k=h.type||"related to";u+=`
    - ${k}: ${f}`,h.notes&&(u+=` (${h.notes})`)}))}),u+=`
[END CONTEXT]`)}return u}async function S(){const u=r.value.trim();if(!u)return;const d={id:Z(),role:"user",content:u,timestamp:new Date().toISOString()};e.history.push(d),r.value="",b(),s(),l.disabled=!0,l.textContent="Thinking...";try{if(!j.getActiveConfig())throw new Error("No API configuration. Go to Settings to add one.");const v=y(),g=e.history.map(E=>({role:E.role==="user"?"user":"model",content:E.content})).slice(-20),f=await j.generate(v,g),k={id:Z(),role:"model",content:f,timestamp:new Date().toISOString()};e.history.push(k),s(),b()}catch(m){console.error("[Scribe]",m),e.history.push({id:Z(),role:"model",content:`[Error: ${m.message}]`,timestamp:new Date().toISOString()}),b()}finally{l.disabled=!1,l.textContent="Send"}}l.onclick=S,r.onkeydown=u=>{u.key==="Enter"&&!u.shiftKey&&(u.preventDefault(),S())},t.querySelector("#btn-clear").onclick=()=>{confirm("Clear all messages?")&&(e.history=[],s(),b())},t.querySelector("#btn-save-session").onclick=()=>{const u=prompt("Session name:",`Session ${Object.keys(e.sessions).length+1}`);u&&(e.sessions[u]={history:[...e.history],mode:e.mode,selectedEntries:[...e.selectedEntries],savedAt:new Date().toISOString()},s(),p.innerHTML='<option value="">-- Sessions --</option>'+Object.keys(e.sessions).map(d=>`<option value="${d}">${d}</option>`).join(""))},t.querySelector("#btn-load-session").onclick=()=>{const u=p.value;if(!u||!e.sessions[u])return;const d=e.sessions[u];e.history=[...d.history],e.mode=d.mode,e.selectedEntries=[...d.selectedEntries],s(),me.render(t)}}},O={async toJSON(){await T.init();const t=await T.list();return{meta:{...x.project},entries:t,exportedAt:new Date().toISOString(),version:"1.0",format:"samildanach-json"}},async toMarkdown(t={}){var n;const{includeRelationships:e=!0}=t;await T.init();const s=await T.list();let i="";i+=`# ${x.project.title||"Untitled Setting"}

`,x.project.author&&(i+=`**Author:** ${x.project.author}

`),x.project.version&&(i+=`**Version:** ${x.project.version}

`),x.project.genre&&(i+=`**Genre:** ${x.project.genre}

`),x.project.system&&(i+=`**System:** ${x.project.system}

`),x.project.description&&(i+=`---

${x.project.description}

`),i+=`---

`;const a=z();for(const r of a){const l=s.filter(c=>c.type===r.id);if(l.length!==0){i+=`## ${r.icon} ${r.label}s

`;for(const c of l){i+=`### ${c.data.name||"Untitled"}

`;for(const p of r.fields){const o=c.data[p.key];o&&(i+=`**${p.label}:** ${o}

`)}if(c.data.description){const p=this._stripHtml(c.data.description);i+=`${p}

`}if(e&&((n=c.data.relationships)==null?void 0:n.length)>0){i+=`**Relationships:**
`;for(const p of c.data.relationships){const o=se(p.type),b=s.find(S=>S.id===p.targetId),y=(b==null?void 0:b.data.name)||"(Unknown)";i+=`- ${o.icon} ${o.label}: ${y}
`}i+=`
`}i+=`---

`}}}return i+=`
---
*Exported from Samildánach on ${new Date().toLocaleDateString()}*
`,i},async toHTML(){let e=(await this.toMarkdown()).replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^# (.+)$/gm,"<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/^- (.+)$/gm,"<li>$1</li>").replace(/(<li>.*<\/li>\n)+/g,"<ul>$&</ul>").replace(/^---$/gm,"<hr>").replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br>");return`<!DOCTYPE html>
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
</html>`},async printToPDF(){const t=await this.toHTML(),e=window.open("","_blank");e.document.write(t),e.document.close(),e.focus(),setTimeout(()=>e.print(),250)},download(t,e,s="text/plain"){const i=new Blob([t],{type:s}),a=URL.createObjectURL(i),n=document.createElement("a");n.href=a,n.download=e,n.click(),URL.revokeObjectURL(a)},_stripHtml(t){const e=document.createElement("div");return e.innerHTML=t,e.querySelectorAll(".wiki-link").forEach(s=>{s.replaceWith(s.dataset.link||s.textContent)}),e.textContent||e.innerText||""}},Ce={id:"export",label:"Export",icon:"📤",render:(t,e)=>{t.innerHTML=`
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
        `;let s="json";const i=t.querySelector("#export-preview"),a=t.querySelector("#btn-export"),n=t.querySelectorAll(".format-btn");n.forEach(c=>{c.onclick=async()=>{n.forEach(p=>p.classList.remove("active")),c.classList.add("active"),s=c.dataset.format,await r()}});async function r(){i.innerHTML='<div class="preview-loading">Generating preview...</div>';try{let c="";switch(s){case"json":const p=await O.toJSON();c=`<pre class="preview-code">${JSON.stringify(p,null,2).substring(0,2e3)}${JSON.stringify(p,null,2).length>2e3?`
...`:""}</pre>`;break;case"markdown":const o=await O.toMarkdown();c=`<pre class="preview-code">${l(o.substring(0,2e3))}${o.length>2e3?`
...`:""}</pre>`;break;case"html":c=`<div class="preview-note">Full HTML document will be downloaded.</div><pre class="preview-code">${l((await O.toHTML()).substring(0,1500))}...</pre>`;break;case"pdf":c=`<div class="preview-note">PDF will open in a print dialog.<br>Use "Save as PDF" in your browser's print options.</div>`;break}i.innerHTML=c}catch(c){i.innerHTML=`<div class="preview-error">Error: ${c.message}</div>`}}a.onclick=async()=>{a.disabled=!0,a.innerText="Exporting...";try{const c=(x.project.title||"samildanach").toLowerCase().replace(/\s+/g,"-");switch(s){case"json":const p=await O.toJSON();O.download(JSON.stringify(p,null,2),`${c}.json`,"application/json");break;case"markdown":const o=await O.toMarkdown();O.download(o,`${c}.md`,"text/markdown");break;case"html":const b=await O.toHTML();O.download(b,`${c}.html`,"text/html");break;case"pdf":await O.printToPDF();break}}catch(c){alert("Export failed: "+c.message)}a.disabled=!1,a.innerText="Download"},r();function l(c){const p=document.createElement("div");return p.textContent=c,p.innerHTML}}},W={id:"settings",label:"Settings",icon:"⚙️",render:(t,e)=>{const s=j.getConfigs(),i=j.getActiveConfig();t.innerHTML=`
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
                            `:s.map(d=>{var m;return`
                                <div class="config-card ${d.id===(i==null?void 0:i.id)?"active":""}" data-id="${d.id}">
                                    <div class="config-info">
                                        <div class="config-name">${d.name||"Unnamed"}</div>
                                        <div class="config-provider">${((m=ce.find(v=>v.id===d.provider))==null?void 0:m.label)||d.provider} • ${d.model}</div>
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
                                    ${ce.map(d=>`<option value="${d.id}">${d.label}</option>`).join("")}
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
        `;const a=t.querySelector("#configs-list"),n=t.querySelector("#config-editor"),r=t.querySelector("#cfg-provider"),l=t.querySelector("#cfg-model"),c=t.querySelector("#field-baseurl"),p=t.querySelector("#field-apikey"),o=t.querySelector("#test-result");let b=null;function y(){const d=r.value,m=ce.find(v=>v.id===d);l.innerHTML=m.models.map(v=>`<option value="${v}">${v}</option>`).join(""),c.style.display=["kobold","custom"].includes(d)?"block":"none",p.style.display=d==="kobold"?"none":"block"}r.onchange=y,y();function S(d=null){var m;b=(d==null?void 0:d.id)||null,t.querySelector("#cfg-name").value=(d==null?void 0:d.name)||"",r.value=(d==null?void 0:d.provider)||"gemini",y(),l.value=(d==null?void 0:d.model)||((m=l.options[0])==null?void 0:m.value)||"",t.querySelector("#cfg-apikey").value=(d==null?void 0:d.apiKey)||"",t.querySelector("#cfg-baseurl").value=(d==null?void 0:d.baseUrl)||"",o.innerHTML="",n.style.display="flex"}function u(){n.style.display="none",b=null}t.querySelector("#btn-add-config").onclick=()=>S(),t.querySelector("#btn-cancel-config").onclick=u,t.querySelector("#btn-save-config").onclick=()=>{const d={id:b||Z(),name:t.querySelector("#cfg-name").value||"Unnamed",provider:r.value,model:l.value,apiKey:t.querySelector("#cfg-apikey").value,baseUrl:t.querySelector("#cfg-baseurl").value};j.saveConfig(d),j.getConfigs().length===1&&j.setActiveConfig(d.id),u(),W.render(t,e)},t.querySelector("#btn-test-config").onclick=async()=>{const d=t.querySelector("#btn-test-config");d.disabled=!0,d.textContent="Testing...",o.innerHTML='<span class="test-pending">Connecting...</span>';const m={provider:r.value,model:l.value,apiKey:t.querySelector("#cfg-apikey").value,baseUrl:t.querySelector("#cfg-baseurl").value};try{await j.testConfig(m),o.innerHTML='<span class="test-success">✓ Connection successful!</span>'}catch(v){o.innerHTML=`<span class="test-error">✗ ${v.message}</span>`}d.disabled=!1,d.textContent="Test Connection"},a.querySelectorAll(".config-card").forEach(d=>{const m=d.dataset.id;d.querySelector(".btn-activate").onclick=()=>{j.setActiveConfig(m),W.render(t,e)},d.querySelector(".btn-edit").onclick=()=>{const v=j.getConfigs().find(h=>h.id===m);S(v)},d.querySelector(".btn-delete").onclick=()=>{confirm("Delete this configuration?")&&(j.deleteConfig(m),W.render(t,e))}})}},de={divider:!0};async function Fe(){console.log(`%c Samildánach v${x.project.version} `,"background: #222; color: #bada55"),C.registerPanel(oe.id,oe),C.registerPanel(w.id,w),C.registerPanel(B.id,B),C.registerPanel("divider1",de),C.registerPanel(ge.id,ge),C.registerPanel(Se.id,Se),C.registerPanel(we.id,we),C.registerPanel("divider2",de),C.registerPanel(me.id,me),C.registerPanel("divider3",de),C.registerPanel(Ce.id,Ce),C.registerPanel(W.id,W),C.init(),C.activePanelId||C.switchPanel(oe.id)}window.addEventListener("DOMContentLoaded",Fe);
