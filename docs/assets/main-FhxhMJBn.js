(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function i(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(n){if(n.ep)return;n.ep=!0;const a=i(n);fetch(n.href,a)}})();const $e="samildanach_state",x={project:{title:"Untitled Setting",author:"",version:"1.0.0",description:"",genre:"",system:""},session:{activePanel:null,activeEntryId:null},cache:{},_subscribers:[],init(){const t=localStorage.getItem($e);if(t)try{const e=JSON.parse(t);e.project&&Object.assign(this.project,e.project),e.session&&Object.assign(this.session,e.session)}catch(e){console.warn("Failed to restore state:",e)}},save(){const t={project:this.project,session:this.session};localStorage.setItem($e,JSON.stringify(t))},updateProject(t){Object.assign(this.project,t),this.save(),this._notify("project",this.project)},updateSession(t){Object.assign(this.session,t),this.save(),this._notify("session",this.session)},subscribe(t,e){const i={key:t,callback:e};return this._subscribers.push(i),()=>{const s=this._subscribers.indexOf(i);s>=0&&this._subscribers.splice(s,1)}},_notify(t,e){this._subscribers.filter(i=>i.key===t).forEach(i=>i.callback(e))},exportState(){return{project:{...this.project},session:{...this.session}}},importState(t){t.project&&Object.assign(this.project,t.project),t.session&&Object.assign(this.session,t.session),this.save(),this._notify("project",this.project),this._notify("session",this.session)}},A={panels:{},activePanelId:null,init:function(){x.init(),this.renderSidebar(),this.bindEvents();const t=localStorage.getItem("theme")||"dark";document.documentElement.setAttribute("data-theme",t),x.session.activePanel&&this.panels[x.session.activePanel]&&this.switchPanel(x.session.activePanel)},registerPanel:function(t,e){this.panels[t]=e,this.renderSidebar()},switchPanel:function(t){if(!this.panels[t])return;this.activePanelId=t,x.updateSession({activePanel:t}),document.querySelectorAll(".nav-item").forEach(s=>{s.classList.toggle("active",s.dataset.id===t)});const e=document.getElementById("main-view");e.innerHTML="";const i=document.createElement("div");i.className="panel-container",this.panels[t].render(i,x),e.appendChild(i)},renderSidebar:function(){const t=document.getElementById("nav-list");t&&(t.innerHTML="",Object.keys(this.panels).forEach(e=>{const i=this.panels[e];if(e==="divider"||i.divider){const n=document.createElement("div");n.className="nav-divider",t.appendChild(n);return}const s=document.createElement("div");s.className="nav-item",s.innerHTML=i.icon||"📦",s.title=i.label||e,s.dataset.id=e,s.onclick=()=>this.switchPanel(e),e===this.activePanelId&&s.classList.add("active"),t.appendChild(s)}))},bindEvents:function(){const t=document.getElementById("theme-toggle");t&&(t.onclick=()=>{const e=document.documentElement,s=e.getAttribute("data-theme")==="dark"?"light":"dark";e.setAttribute("data-theme",s),localStorage.setItem("theme",s)})}},I={container:null,show:function(t,e="info",i=3e3){this.ensureContainer();const s=document.createElement("div");s.className=`toast toast-${e}`;const n=this.getIcon(e);s.innerHTML=`
            <div class="toast-icon">${n}</div>
            <div class="toast-message">${t}</div>
            <button class="toast-close">&times;</button>
        `,s.querySelector(".toast-close").onclick=()=>{this.dismiss(s)},i>0&&setTimeout(()=>{this.dismiss(s)},i),this.container.appendChild(s),requestAnimationFrame(()=>{s.classList.add("show")})},dismiss:function(t){t.classList.remove("show"),t.addEventListener("transitionend",()=>{t.parentNode&&t.parentNode.removeChild(t)})},ensureContainer:function(){this.container||(this.container=document.createElement("div"),this.container.className="toast-container",document.body.appendChild(this.container))},getIcon:function(t){switch(t){case"success":return"✅";case"warning":return"⚠️";case"error":return"❌";case"info":default:return"ℹ️"}}};window.Toast=I;const L={active:!1,currentStep:0,currentConfig:null,els:{},configs:{},register:function(t,e){this.configs[t]=e},start:function(t){const e=this.configs[t];if(!e||!e.length){console.warn(`Tour "${t}" not found.`);return}this.currentConfig=e,this.currentStep=0,this.active=!0,this.createOverlay(),this.renderStep(),document.addEventListener("keydown",this.handleKey),window.addEventListener("resize",this.handleResize),window.addEventListener("scroll",this.handleScroll,{capture:!0})},end:function(){this.active=!1,this.currentConfig=null,this.currentStep=0,this.removeOverlay(),document.removeEventListener("keydown",this.handleKey),window.removeEventListener("resize",this.handleResize),window.removeEventListener("scroll",this.handleScroll,{capture:!0})},createOverlay:function(){if(this.els.overlay)return;const t=document.createElement("div");t.className="tour-overlay",t.innerHTML=`
            <div class="tour-highlight"></div>
            <div class="tour-popup">
                <div class="tour-header">
                    <strong id="tour-title"></strong>
                    <button class="btn-icon btn-sm" id="tour-close">&times;</button>
                </div>
                <div class="tour-body" id="tour-content"></div>
                <div class="tour-footer">
                    <span id="tour-progress" class="text-muted text-xs"></span>
                    <div class="tour-actions">
                        <button class="btn btn-secondary btn-sm" id="tour-prev">Prev</button>
                        <button class="btn btn-primary btn-sm" id="tour-next">Next</button>
                    </div>
                </div>
            </div>
        `,document.body.appendChild(t),this.els={overlay:t,highlight:t.querySelector(".tour-highlight"),popup:t.querySelector(".tour-popup"),title:t.querySelector("#tour-title"),content:t.querySelector("#tour-content"),progress:t.querySelector("#tour-progress"),btnPrev:t.querySelector("#tour-prev"),btnNext:t.querySelector("#tour-next"),btnClose:t.querySelector("#tour-close")},this.els.btnClose.onclick=()=>this.end(),this.els.btnPrev.onclick=()=>this.prev(),this.els.btnNext.onclick=()=>this.next()},removeOverlay:function(){this.els.overlay&&(this.els.overlay.remove(),this.els={})},renderStep:function(){if(!this.active||!this.currentConfig)return;const t=this.currentConfig[this.currentStep],e=document.querySelector(t.target);e||console.warn(`Tour target "${t.target}" not found.`),this.els.title.innerText=t.title,this.els.content.innerHTML=t.content,this.els.progress.innerText=`${this.currentStep+1} / ${this.currentConfig.length}`,this.els.btnPrev.disabled=this.currentStep===0,this.els.btnNext.innerText=this.currentStep===this.currentConfig.length-1?"Finish":"Next",this.positionOverlay(e)},positionOverlay:function(t){if(!t){this.els.highlight.style.opacity="0",this.centerPopup();return}t.scrollIntoView({behavior:"smooth",block:"center"}),setTimeout(()=>{const e=t.getBoundingClientRect(),i=4;this.els.highlight.style.width=`${e.width+i*2}px`,this.els.highlight.style.height=`${e.height+i*2}px`,this.els.highlight.style.top=`${e.top-i}px`,this.els.highlight.style.left=`${e.left-i}px`,this.els.highlight.style.opacity="1",this.placePopup(e)},100)},placePopup:function(t){const e=this.els.popup,i=e.getBoundingClientRect(),s=16,n=window.innerWidth,a=window.innerHeight;let o,r;if(t.right+i.width+s<n)o=t.top,r=t.right+s;else if(t.left-i.width-s>0)o=t.top,r=t.left-i.width-s;else if(t.bottom+i.height+s<a)o=t.bottom+s,r=t.left;else if(t.top-i.height-s>0)o=t.top-i.height-s,r=t.left;else{this.centerPopup();return}o<s&&(o=s),r<s&&(r=s),o+i.height>a-s&&(o=a-s-i.height),r+i.width>n-s&&(r=n-s-i.width),e.style.top=`${o}px`,e.style.left=`${r}px`,e.style.transform="none"},centerPopup:function(){const t=this.els.popup;t.style.top="50%",t.style.left="50%",t.style.transform="translate(-50%, -50%)"},next:function(){this.currentStep<this.currentConfig.length-1?(this.currentStep++,this.renderStep()):this.end()},prev:function(){this.currentStep>0&&(this.currentStep--,this.renderStep())},handleKey:function(t){L.active&&(t.key==="Escape"&&L.end(),t.key==="ArrowRight"&&L.next(),t.key==="ArrowLeft"&&L.prev())},handleResize:function(){L.active&&L.renderStep()},handleScroll:function(){}};L.handleKey=L.handleKey.bind(L);L.handleResize=L.handleResize.bind(L);L.handleScroll=L.handleScroll.bind(L);L.register("getting-started",[{target:'.nav-item[data-id="project"]',title:"Project Home",content:"Your command center. Manage project details, import/export data, and see an overview of your world."},{target:'.nav-item[data-id="library"]',title:"The Library",content:"A taxonomical database for your world. Create and organize Stories, Characters, Locations, and Items."},{target:'.nav-item[data-id="grimoire"]',title:"The Grimoire",content:"Define the Rules of your system. Create Spells, Feats, and Abilities with custom data fields."},{target:'.nav-item[data-id="architect"]',title:"The Architect",content:"A powerful Visual Node Editor. Design logic flows, encounter structures, and complex systems."},{target:'.nav-item[data-id="laboratory"]',title:"The Laboratory",content:"Test and balance your mechanics. Roll dice, run probability simulations, and compare math."},{target:'.nav-item[data-id="scribe"]',title:"The Scribe",content:"AI-assisted world-building. Chat with an AI that knows your library to brainstorm and expand your ideas."},{target:'.nav-item[data-id="export"]',title:"System Tools",content:"Export your entire project to JSON/Markdown, configure LLM settings, and manage themes."}]);const k={generateId:(t="id")=>typeof crypto<"u"&&crypto.randomUUID?`${t}_${crypto.randomUUID().split("-")[0]}`:`${t}_${Math.random().toString(36).substring(2,9)}`,escapeHtml:t=>{const e=document.createElement("div");return e.textContent=t,e.innerHTML},debounce:(t,e=300)=>{let i;return(...s)=>{clearTimeout(i),i=setTimeout(()=>t(...s),e)}},deepClone:t=>JSON.parse(JSON.stringify(t)),formatDate:t=>{const e=new Date(t);return e.toLocaleDateString()+" "+e.toLocaleTimeString()},truncate:(t,e=50)=>!t||t.length<=e?t:t.substring(0,e-3)+"..."},ne=k.generateId;class we{constructor(e){this.config=e,this.db=null}init(){return new Promise((e,i)=>{if(this.db){e(this.db);return}const s=indexedDB.open(this.config.dbName,this.config.version);s.onerror=n=>{console.error(`[GenericDB:${this.config.dbName}] Open Failed:`,n.target.error),i(n.target.error)},s.onsuccess=n=>{this.db=n.target.result,e(this.db)},s.onupgradeneeded=n=>{const a=n.target.result;this.config.stores.forEach(o=>{if(!a.objectStoreNames.contains(o.name)){const r=a.createObjectStore(o.name,{keyPath:o.keyPath||"id"});o.indexes&&o.indexes.forEach(l=>{r.createIndex(l.name,l.keyPath||l.name,l.options||{unique:!1})}),console.log(`[GenericDB:${this.config.dbName}] Created store: ${o.name}`)}})}})}get(e,i){return new Promise((s,n)=>{if(!this.db)return n(new Error("DB not initialized"));const o=this.db.transaction(e,"readonly").objectStore(e).get(i);o.onsuccess=()=>s(o.result||null),o.onerror=r=>n(r.target.error)})}add(e,i){return new Promise((s,n)=>{if(!this.db)return n(new Error("DB not initialized"));const o=this.db.transaction(e,"readwrite").objectStore(e).add(i);o.onsuccess=()=>s(i),o.onerror=r=>n(r.target.error)})}put(e,i){return new Promise((s,n)=>{if(!this.db)return n(new Error("DB not initialized"));const o=this.db.transaction(e,"readwrite").objectStore(e).put(i);o.onsuccess=()=>s(i),o.onerror=r=>n(r.target.error)})}delete(e,i){return new Promise((s,n)=>{if(!this.db)return n(new Error("DB not initialized"));const o=this.db.transaction(e,"readwrite").objectStore(e).delete(i);o.onsuccess=()=>s(),o.onerror=r=>n(r.target.error)})}list(e,i){return new Promise((s,n)=>{if(!this.db)return n(new Error("DB not initialized"));const o=this.db.transaction(e,"readonly").objectStore(e);let r;i&&i.index&&i.value?r=o.index(i.index).openCursor(IDBKeyRange.only(i.value)):r=o.openCursor();const l=[];r.onsuccess=h=>{const c=h.target.result;c?(l.push(c.value),c.continue()):s(l)},r.onerror=h=>n(h.target.error)})}async getAll(e){return this.list(e)}}const Re="samildanach_vault",te="items",ae="registry",ye="vault_registry";function Oe(){return{id:ye,lastUpdatedAt:new Date().toISOString(),universes:[],allTags:[],blocks:{},itemCounts:{actor:0,lorebook:0,script:0,location:0,event:0,pair:0}}}const N=new we({dbName:Re,version:1,stores:[{name:te,keyPath:"id",indexes:[{name:"type",keyPath:"type"},{name:"universe",keyPath:"universe"},{name:"updatedAt",keyPath:"updatedAt"}]},{name:ae,keyPath:"id"}]}),C={init:function(){return N.init()},getRegistry:async function(){await N.init();const t=await N.get(ae,ye);if(t)return t;const e=Oe();return await N.put(ae,e),e},updateRegistry:async function(t){await N.init();const i={...await this.getRegistry(),...t,id:ye,lastUpdatedAt:new Date().toISOString()};return await N.put(ae,i),i},list:async function(t={}){await N.init();let e=null;return t.type?e={index:"type",value:t.type}:t.universe&&(e={index:"universe",value:t.universe}),(await N.list(te,e)).filter(n=>!(t.type&&n.type!==t.type||t.universe&&n.universe!==t.universe||t.tags&&t.tags.length>0&&!t.tags.every(o=>{var r;return(r=n.tags)==null?void 0:r.includes(o)}))).sort((n,a)=>new Date(a.updatedAt).getTime()-new Date(n.updatedAt).getTime())},addItem:async function(t,e,i={}){await N.init();const s=new Date().toISOString();let n;try{n=k&&k.generateId?k.generateId("vault"):`vault_${crypto.randomUUID()}`}catch{n="vault_"+Date.now()}const a={id:n,type:t,version:1,universe:i.universe||"",tags:i.tags||[],createdAt:s,updatedAt:s,data:e};return console.log("[VaultDB] Adding Item:",a),await N.add(te,a),a},updateItem:async function(t){return await N.init(),t.updatedAt=new Date().toISOString(),await N.put(te,t),t},deleteItem:async function(t){await N.init(),await N.delete(te,t)}},_e="samildanach_rules",V="rules",H=new we({dbName:_e,version:1,stores:[{name:V,keyPath:"id",indexes:[{name:"type",keyPath:"type"},{name:"updatedAt",keyPath:"updatedAt"}]}]}),P={init:function(){return H.init()},list:async function(t={}){await H.init();let e=null;return t.type&&(e={index:"type",value:t.type}),(await H.list(V,e)).sort((s,n)=>new Date(n.updatedAt).getTime()-new Date(s.updatedAt).getTime())},get:async function(t){return await H.init(),H.get(V,t)},add:async function(t,e){await H.init();const i=new Date().toISOString();let s;try{s=k&&k.generateId?k.generateId("rule"):`rule_${crypto.randomUUID().split("-")[0]}`}catch{s="rule_"+Date.now()}const n={id:s,type:t,createdAt:i,updatedAt:i,data:e};return await H.add(V,n),console.log("[RulesDB] Added rule:",s),n},update:async function(t){return await H.init(),t.updatedAt=new Date().toISOString(),await H.put(V,t),t},delete:async function(t){await H.init(),await H.delete(V,t),console.log("[RulesDB] Deleted rule:",t)},exportAll:function(){return this.list()},importAll:function(t){return new Promise(async(e,i)=>{try{await H.init();let s=0;for(const n of t)try{const a={...n,id:k.generateId("rule"),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};await H.add(V,a),s++}catch(a){console.warn("[RulesDB] Import skip:",a)}e(s)}catch(s){i(s)}})}},Fe="samildanach_flows",Z="flows",B=new we({dbName:Fe,version:1,stores:[{name:Z,keyPath:"id",indexes:[{name:"updatedAt",keyPath:"updatedAt"}]}]}),T={init:function(){return B.init()},list:async function(){return await B.init(),(await B.getAll(Z)).sort((e,i)=>new Date(i.updatedAt).getTime()-new Date(e.updatedAt).getTime())},get:async function(t){return await B.init(),B.get(Z,t)},create:async function(t){await B.init();const e=new Date().toISOString();let i;try{i=k&&k.generateId?k.generateId("flow"):`flow_${crypto.randomUUID().split("-")[0]}`}catch{i="flow_"+Date.now()}const s={id:i,name:t||"Untitled Flow",description:"",createdAt:e,updatedAt:e,version:1,nodes:[],links:[],transform:{x:0,y:0,scale:1},exposedInputs:[],exposedOutputs:[]};return await B.add(Z,s),console.log("[FlowsDB] Created flow:",i),s},update:async function(t){return await B.init(),t.updatedAt=new Date().toISOString(),t.version=(t.version||0)+1,t.exposedInputs=this.computeExposedInputs(t),t.exposedOutputs=this.computeExposedOutputs(t),await B.put(Z,t),t},delete:async function(t){await B.init(),await B.delete(Z,t),console.log("[FlowsDB] Deleted flow:",t)},computeExposedInputs:function(t){const e=[],i=new Set;return(t.links||[]).forEach(s=>{i.add(`${s.to.nodeId}:${s.to.socket}`)}),(t.nodes||[]).forEach(s=>{(s.inputs||[]).forEach(n=>{const a=`${s.id}:${n}`;i.has(a)||e.push({nodeId:s.id,socket:n,label:`${s.title}.${n}`})})}),e},computeExposedOutputs:function(t){const e=[],i=new Set;return(t.links||[]).forEach(s=>{i.add(`${s.from.nodeId}:${s.from.socket}`)}),(t.nodes||[]).forEach(s=>{(s.outputs||[]).forEach(n=>{const a=`${s.id}:${n}`;i.has(a)||e.push({nodeId:s.id,socket:n,label:`${s.title}.${n}`})})}),e}},ve={person:{id:"person",label:"Person",icon:"👤",color:"#6366f1",fields:[{key:"role",label:"Role",type:"text"},{key:"affiliation",label:"Affiliation",type:"text"},{key:"motivation",label:"Motivation",type:"text"},{key:"appearance",label:"Appearance",type:"textarea"}]},location:{id:"location",label:"Location",icon:"📍",color:"#22c55e",fields:[{key:"region",label:"Region",type:"text"},{key:"climate",label:"Climate",type:"text"},{key:"pointsOfInterest",label:"Points of Interest",type:"textarea"}]},faction:{id:"faction",label:"Faction",icon:"🏛️",color:"#f59e0b",fields:[{key:"goals",label:"Goals",type:"textarea"},{key:"allies",label:"Allies",type:"text"},{key:"enemies",label:"Enemies",type:"text"}]},concept:{id:"concept",label:"Concept",icon:"💡",color:"#8b5cf6",fields:[{key:"domain",label:"Domain",type:"text"},{key:"principles",label:"Core Principles",type:"textarea"}]},event:{id:"event",label:"Event",icon:"📜",color:"#ef4444",fields:[{key:"era",label:"Era/Date",type:"text"},{key:"participants",label:"Participants",type:"text"},{key:"outcome",label:"Outcome",type:"textarea"}]},item:{id:"item",label:"Item",icon:"🎁",color:"#14b8a6",fields:[{key:"origin",label:"Origin",type:"text"},{key:"properties",label:"Properties",type:"textarea"}]}},z=t=>ve[t]||ve.item,ee=()=>Object.values(ve),qe=[{id:"item",label:"Item",icon:"⚔️",color:"#f59e0b",description:"Weapons, armor, consumables, and equipment",fields:[{key:"type",label:"Type",placeholder:"weapon, armor, consumable, tool..."},{key:"rarity",label:"Rarity",placeholder:"common, uncommon, rare, legendary..."},{key:"damage",label:"Damage/Effect",placeholder:"1d8 slashing, +2 AC..."},{key:"properties",label:"Properties",placeholder:"versatile, finesse, two-handed..."},{key:"value",label:"Value",placeholder:"50 gold, priceless..."},{key:"weight",label:"Weight",placeholder:"3 lbs, light..."}]},{id:"spell",label:"Spell",icon:"✨",color:"#8b5cf6",description:"Magic spells and mystical abilities",fields:[{key:"level",label:"Level",placeholder:"Cantrip, 1st, 2nd..."},{key:"school",label:"School",placeholder:"Evocation, Necromancy..."},{key:"castTime",label:"Cast Time",placeholder:"1 action, bonus action, ritual..."},{key:"range",label:"Range",placeholder:"60 feet, touch, self..."},{key:"duration",label:"Duration",placeholder:"Instantaneous, 1 minute, concentration..."},{key:"damage",label:"Effect/Damage",placeholder:"3d6 fire, heals 2d8+3..."},{key:"components",label:"Components",placeholder:"V, S, M (a bat guano)..."}]},{id:"ability",label:"Ability",icon:"💪",color:"#ef4444",description:"Class features, racial traits, and special abilities",fields:[{key:"source",label:"Source",placeholder:"Fighter 3, Elf racial, feat..."},{key:"usage",label:"Usage",placeholder:"At will, 1/short rest, 3/long rest..."},{key:"action",label:"Action Cost",placeholder:"Action, bonus action, reaction..."},{key:"effect",label:"Effect",placeholder:"Add 1d6 to attack, advantage on saves..."},{key:"prerequisite",label:"Prerequisite",placeholder:"STR 13, proficiency in..."}]},{id:"condition",label:"Condition",icon:"🔥",color:"#06b6d4",description:"Status effects, buffs, debuffs, and environmental conditions",fields:[{key:"type",label:"Type",placeholder:"debuff, buff, environmental..."},{key:"effect",label:"Effect",placeholder:"Disadvantage on attacks, -2 AC..."},{key:"duration",label:"Duration",placeholder:"1 round, until cured, permanent..."},{key:"removal",label:"Removal",placeholder:"Lesser restoration, DC 15 CON save..."},{key:"stacking",label:"Stacking",placeholder:"Does not stack, stacks to 3..."}]},{id:"rule",label:"Rule",icon:"📜",color:"#22c55e",description:"Custom game rules, house rules, and mechanics",fields:[{key:"category",label:"Category",placeholder:"Combat, exploration, social, rest..."},{key:"trigger",label:"Trigger",placeholder:"When attacking, on critical hit..."},{key:"resolution",label:"Resolution",placeholder:"Roll contested Athletics, DC = 10 + CR..."},{key:"consequences",label:"Consequences",placeholder:"On success... On failure..."}]}];function Ne(){return qe}function Pe(t){return qe.find(e=>e.id===t)}const oe={member_of:{id:"member_of",label:"Member of",icon:"👥",inverse:"has_member",description:"This entry is a member of the target."},has_member:{id:"has_member",label:"Has Member",icon:"👤",inverse:"member_of",description:"The target is a member of this entry."},located_in:{id:"located_in",label:"Located in",icon:"📍",inverse:"contains",description:"This entry is located within the target."},contains:{id:"contains",label:"Contains",icon:"🗺️",inverse:"located_in",description:"This entry contains the target."},ally_of:{id:"ally_of",label:"Ally of",icon:"🤝",inverse:"ally_of",description:"This entry is allied with the target."},enemy_of:{id:"enemy_of",label:"Enemy of",icon:"⚔️",inverse:"enemy_of",description:"This entry is an enemy of the target."},parent_of:{id:"parent_of",label:"Parent of",icon:"👨‍👧",inverse:"child_of",description:"This entry is the parent of the target."},child_of:{id:"child_of",label:"Child of",icon:"👶",inverse:"parent_of",description:"This entry is the child of the target."},related_to:{id:"related_to",label:"Related to",icon:"🔗",inverse:"related_to",description:"Generic relationship."},created_by:{id:"created_by",label:"Created by",icon:"🛠️",inverse:"creator_of",description:"This entry was created by the target."},creator_of:{id:"creator_of",label:"Creator of",icon:"✨",inverse:"created_by",description:"This entry created the target."}},re=t=>oe[t]||oe.related_to,Ue=()=>Object.values(oe),_={async toJSON(){await C.init();const t=await C.list();await P.init();const e=await P.list();await T.init();const i=await T.list();return{meta:{...x.project},entries:t,rules:e,flows:i,exportedAt:new Date().toISOString(),version:"2.0",format:"samildanach-json"}},async toMarkdown(t={}){var o;const{includeRelationships:e=!0}=t;await C.init();const i=await C.list();let s="";s+=`# ${x.project.title||"Untitled Setting"}

`,x.project.author&&(s+=`**Author:** ${x.project.author}

`),x.project.version&&(s+=`**Version:** ${x.project.version}

`),x.project.genre&&(s+=`**Genre:** ${x.project.genre}

`),x.project.system&&(s+=`**System:** ${x.project.system}

`),x.project.description&&(s+=`---

${x.project.description}

`),s+=`---

`;const n=ee();for(const r of n){const l=i.filter(h=>h.type===r.id);if(l.length!==0){s+=`## ${r.icon} ${r.label}s

`;for(const h of l){s+=`### ${h.data.name||"Untitled"}

`;for(const c of r.fields){const d=h.data[c.key];d&&(s+=`**${c.label}:** ${d}

`)}if(h.data.description){const c=this._stripHtml(h.data.description);s+=`${c}

`}if(e&&((o=h.data.relationships)==null?void 0:o.length)>0){s+=`**Relationships:**
`;for(const c of h.data.relationships){const d=re(c.type),f=i.find(m=>m.id===c.targetId),w=(f==null?void 0:f.data.name)||"(Unknown)";s+=`- ${d.icon} ${d.label}: ${w}
`}s+=`
`}s+=`---

`}}}await P.init();const a=await P.list();if(a.length>0){s+=`# Grimoire 

`;const r=Ne();for(const l of r){const h=a.filter(c=>c.type===l.id);if(h.length!==0){s+=`## ${l.icon} ${l.label}

`;for(const c of h){s+=`### ${c.data.name||"Untitled"}

`;for(const d of l.fields){const f=c.data[d.key];f&&(s+=`**${d.label}:** ${f}

`)}if(c.data.description){const d=this._stripHtml(c.data.description);s+=`${d}

`}s+=`---

`}}}}return s+=`
---
*Exported from Samildánach on ${new Date().toLocaleDateString()}*
`,s},async toHTML(){let e=(await this.toMarkdown()).replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^# (.+)$/gm,"<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/^- (.+)$/gm,"<li>$1</li>").replace(/(<li>.*<\/li>\n)+/g,"<ul>$&</ul>").replace(/^---$/gm,"<hr>").replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br>");return`<!DOCTYPE html>
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
</html>`},async printToPDF(){const t=await this.toHTML(),e=window.open("","_blank");e.document.write(t),e.document.close(),e.focus(),setTimeout(()=>e.print(),250)},download(t,e,i="text/plain"){const s=new Blob([t],{type:i}),n=URL.createObjectURL(s),a=document.createElement("a");a.href=n,a.download=e,a.click(),URL.revokeObjectURL(n)},_stripHtml(t){const e=document.createElement("div");return e.innerHTML=t,e.querySelectorAll(".wiki-link").forEach(i=>{i.replaceWith(i.dataset.link||i.textContent)}),e.textContent||e.innerText||""}},ue={id:"project",label:"Project",icon:"🏠",render:async(t,e)=>{try{await C.init()}catch(r){t.innerHTML=`<div class="text-muted">Vault Error: ${r.message}</div>`;return}const i=await C.list(),s={};ee().forEach(r=>{s[r.id]=i.filter(l=>l.type===r.id).length});const n=i.reduce((r,l)=>{var h;return r+(((h=l.data.relationships)==null?void 0:h.length)||0)},0);t.innerHTML=`
            <div class="project-layout">
                <div class="project-content">
                    
                    <!-- Header -->
                    <div class="project-header">
                        <div class="project-icon">📖</div>
                        <input id="proj-title" type="text" value="${k.escapeHtml(x.project.title)}" 
                            placeholder="Setting Title" class="project-title">
                        <div class="project-author">
                            <input id="proj-author" type="text" value="${k.escapeHtml(x.project.author)}" 
                                placeholder="Author Name">
                        </div>
                    </div>

                    <!-- Stats Cards -->
                    <div class="stats-grid">
                        ${ee().map(r=>`
                            <div class="stat-card" style="border-left-color: ${r.color};">
                                <div class="stat-icon">${r.icon}</div>
                                <div class="stat-value">${s[r.id]||0}</div>
                                <div class="stat-label">${r.label}s</div>
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
                                <input id="proj-version" type="text" value="${k.escapeHtml(x.project.version)}" class="input">
                            </div>
                            <div class="detail-field">
                                <label class="label">Genre</label>
                                <input id="proj-genre" type="text" value="${k.escapeHtml(x.project.genre)}" 
                                    placeholder="Fantasy, Sci-Fi, Horror..." class="input">
                            </div>
                        </div>
                        
                        <div class="detail-field">
                            <label class="label">Compatible Game System</label>
                            <input id="proj-system" type="text" value="${k.escapeHtml(x.project.system)}" 
                                placeholder="D&D 5e, Pathfinder 2e, Fate Core..." class="input">
                        </div>

                        <div class="detail-field mt-lg">
                            <label class="label">Description</label>
                            <textarea id="proj-description" rows="4" 
                                placeholder="Describe your setting..." class="textarea">${k.escapeHtml(x.project.description)}</textarea>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="quick-actions">
                        <button id="btn-export" class="action-btn">📤 Export Setting</button>
                        <button id="btn-import" class="action-btn">📥 Import Setting</button>
                    </div>
                    <input type="file" id="import-file" accept=".json" class="hidden">
                </div>
            </div>
        `;const a=()=>{x.updateProject({title:t.querySelector("#proj-title").value,author:t.querySelector("#proj-author").value,version:t.querySelector("#proj-version").value,genre:t.querySelector("#proj-genre").value,system:t.querySelector("#proj-system").value,description:t.querySelector("#proj-description").value})};t.querySelectorAll("input, textarea").forEach(r=>{r.oninput=a}),t.querySelector("#btn-export").onclick=async()=>{const r=t.querySelector("#btn-export"),l=r.innerHTML;r.disabled=!0,r.innerHTML='<span class="spinner"></span> Exporting...';try{await new Promise(d=>setTimeout(d,50));const h=(x.project.title||"samildanach").toLowerCase().replace(/\s+/g,"-"),c=await _.toJSON();_.download(JSON.stringify(c,null,2),`${h}.json`,"application/json"),I.show("Project exported successfully","success")}catch(h){I.show("Export failed: "+h.message,"error")}finally{r.disabled=!1,r.innerHTML=l}};const o=t.querySelector("#import-file");t.querySelector("#btn-import").onclick=()=>o.click(),o.onchange=async r=>{const l=r.target.files[0];if(!l)return;const h=t.querySelector("#btn-import"),c=h.innerHTML;h.disabled=!0,h.innerHTML='<span class="spinner"></span> Importing...',await new Promise(d=>setTimeout(d,50));try{const d=await l.text(),f=JSON.parse(d);let w={entries:0,rules:0,flows:0};if(f.meta&&x.updateProject(f.meta),f.entries&&Array.isArray(f.entries)){await C.init();for(const m of f.entries)await C.addItem(m.type,m.data);w.entries=f.entries.length}if(f.rules&&Array.isArray(f.rules)){await P.init();for(const m of f.rules)await P.add(m.type,m.data);w.rules=f.rules.length}if(f.flows&&Array.isArray(f.flows)){await T.init();for(const m of f.flows)await T.update(m);w.flows=f.flows.length}I.show(`Imported: ${w.entries} Items, ${w.rules} Rules, ${w.flows} Flows`,"success"),setTimeout(()=>location.reload(),1500)}catch(d){console.error(d),I.show("Import failed: "+d.message,"error"),h.disabled=!1,h.innerHTML=c}}}};class M{constructor(e={}){this.title=e.title||"Modal",this.content=e.content||"",this.actions=e.actions||[],this.onClose=e.onClose||null,this.element=null}show(){this.element=document.createElement("div"),this.element.className="modal-overlay",this.element.innerHTML=`
            <div class="modal-content">
                <h3 class="modal-title">${this.title}</h3>
                <div class="modal-body"></div>
                <div class="modal-actions"></div>
            </div>
        `;const e=this.element.querySelector(".modal-body");typeof this.content=="string"?e.innerHTML=this.content:this.content instanceof HTMLElement&&e.appendChild(this.content);const i=this.element.querySelector(".modal-actions");this.actions.forEach(s=>{const n=document.createElement("button");n.className=s.className||"btn btn-secondary",n.innerText=s.label,n.onclick=()=>{s.onClick&&s.onClick(this)},i.appendChild(n)}),this.element.onclick=s=>{s.target===this.element&&this.close()},document.body.appendChild(this.element)}close(){this.element&&(this.element.remove(),this.element=null),this.onClose&&this.onClose()}getBody(){var e;return(e=this.element)==null?void 0:e.querySelector(".modal-body")}static confirm(e,i){return new Promise(s=>{const n=new M({title:e,content:`<p>${i}</p>`,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:()=>{n.close(),s(!1)}},{label:"Confirm",className:"btn btn-primary",onClick:()=>{n.close(),s(!0)}}]});n.show()})}static alert(e,i){return new Promise(s=>{const n=new M({title:e,content:`<p>${i}</p>`,actions:[{label:"OK",className:"btn btn-primary",onClick:()=>{n.close(),s()}}]});n.show()})}static prompt(e,i=""){return new Promise(s=>{const n=document.createElement("div");n.innerHTML=`
                <input type="text" class="input" style="width:100%" value="${i}">
            `;const a=n.querySelector("input"),o=new M({title:e,content:n,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:()=>{o.close(),s(null)}},{label:"OK",className:"btn btn-primary",onClick:()=>{o.close(),s(a.value)}}]});o.show(),setTimeout(()=>a.focus(),50),a.onkeydown=r=>{r.key==="Enter"&&(o.close(),s(a.value))}})}}class Be{constructor(e,i={}){this.container=e,this.items=[],this.activeCategory=null,this.activeItemId=null,this.onSelect=i.onSelect||null,this.onCreate=i.onCreate||null}setItems(e){this.items=e,this.render()}setActiveItem(e){this.activeItemId=e,this.renderList()}render(){this.container.innerHTML=`
            <div id="category-tabs" class="library-tabs"></div>
            <div class="library-search-bar">
                <input id="lib-search" type="text" placeholder="Search..." class="input">
                <button id="lib-add-btn" class="btn btn-primary">+</button>
            </div>
            <div id="lib-list" class="library-list"></div>
        `,this.tabsEl=this.container.querySelector("#category-tabs"),this.searchInput=this.container.querySelector("#lib-search"),this.listEl=this.container.querySelector("#lib-list"),this.addBtn=this.container.querySelector("#lib-add-btn"),this.renderTabs(),this.renderList(),this.searchInput.oninput=()=>this.renderList(),this.addBtn.onclick=()=>{this.onCreate&&this.onCreate()}}renderTabs(){this.tabsEl.innerHTML="";const e=document.createElement("button");e.innerText="All",e.className="tab"+(this.activeCategory===null?" active":""),e.onclick=()=>{this.activeCategory=null,this.renderTabs(),this.renderList()},this.tabsEl.appendChild(e),ee().forEach(i=>{const s=document.createElement("button");s.innerText=`${i.icon} ${i.label}`,s.className="tab"+(this.activeCategory===i.id?" active":""),this.activeCategory===i.id&&(s.style.background=i.color,s.style.borderColor=i.color),s.onclick=()=>{this.activeCategory=i.id,this.renderTabs(),this.renderList()},this.tabsEl.appendChild(s)})}renderList(){var n;if(!this.listEl)return;this.listEl.innerHTML="";const e=((n=this.searchInput)==null?void 0:n.value.toLowerCase())||"",i=this.activeCategory,s=this.items.filter(a=>{const o=(a.data.name||"").toLowerCase().includes(e),r=i?a.type===i:!0;return o&&r});if(s.length===0){this.listEl.innerHTML='<div class="library-list-empty">No entries found.</div>';return}s.forEach(a=>{const o=z(a.type),r=this.activeItemId===a.id,l=document.createElement("div");l.className="list-item"+(r?" active":""),l.innerHTML=`
                <span>${o.icon}</span>
                <span class="flex-1" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${k.escapeHtml(a.data.name||"Untitled")}</span>
            `,l.onclick=()=>{this.onSelect&&this.onSelect(a)},this.listEl.appendChild(l)})}}class De{constructor(e,i="",s={}){this.container=e,this.value=i,this.onChange=null,this.onLinkClick=s.onLinkClick||null,this.getEntries=s.getEntries||(()=>[])}render(){this.container.innerHTML=`
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
        `,this.editor=this.container.querySelector(".rte-content"),this.autocomplete=this.container.querySelector(".rte-autocomplete"),this.bindEvents()}renderWithLinks(e){return e.replace(/\[\[([^\]]+)\]\]/g,(i,s)=>`<span class="wiki-link" data-link="${s}">[[${s}]]</span>`)}extractRawText(e){const i=document.createElement("div");return i.innerHTML=e,i.querySelectorAll(".wiki-link").forEach(s=>{s.replaceWith(`[[${s.dataset.link}]]`)}),i.innerHTML}bindEvents(){this.container.querySelectorAll("button[data-cmd]").forEach(e=>{e.onclick=i=>{i.preventDefault();const s=e.dataset.cmd;s==="link"?this.insertLinkPlaceholder():s==="h2"||s==="h3"?document.execCommand("formatBlock",!1,s):document.execCommand(s,!1,null),this.editor.focus()}}),this.editor.oninput=()=>{this.checkForAutocomplete(),this.value=this.extractRawText(this.editor.innerHTML),this.onChange&&this.onChange(this.value)},this.editor.onclick=e=>{if(e.target.classList.contains("wiki-link")){const i=e.target.dataset.link;this.onLinkClick&&this.onLinkClick(i)}},this.editor.onkeydown=e=>{if(this.autocomplete.style.display!=="none")if(e.key==="ArrowDown"||e.key==="ArrowUp")e.preventDefault(),this.navigateAutocomplete(e.key==="ArrowDown"?1:-1);else if(e.key==="Enter"||e.key==="Tab"){const i=this.autocomplete.querySelector(".selected");i&&(e.preventDefault(),this.selectAutocompleteItem(i.dataset.name))}else e.key==="Escape"&&this.hideAutocomplete()},this.editor.onblur=()=>{setTimeout(()=>this.hideAutocomplete(),150)}}insertLinkPlaceholder(){document.execCommand("insertText",!1,"[[]]");const e=window.getSelection();if(e.rangeCount){const i=e.getRangeAt(0);i.setStart(i.startContainer,i.startOffset-2),i.collapse(!0),e.removeAllRanges(),e.addRange(i)}}checkForAutocomplete(){const e=window.getSelection();if(!e.rangeCount)return;const i=e.getRangeAt(0),s=i.startContainer;if(s.nodeType!==Node.TEXT_NODE)return;const a=s.textContent.substring(0,i.startOffset).match(/\[\[([^\]]*?)$/);if(a){const o=a[1].toLowerCase(),r=this.getEntries().filter(l=>(l.data.name||"").toLowerCase().includes(o)).slice(0,8);r.length>0?this.showAutocomplete(r):this.hideAutocomplete()}else this.hideAutocomplete()}showAutocomplete(e){this.autocomplete.innerHTML="",e.forEach((i,s)=>{const n=document.createElement("div");n.dataset.name=i.data.name,n.className="rte-autocomplete-item"+(s===0?" selected":""),n.innerText=i.data.name||"Untitled",n.onmousedown=a=>{a.preventDefault(),this.selectAutocompleteItem(i.data.name)},this.autocomplete.appendChild(n)}),this.autocomplete.style.display="block",this.autocomplete.style.left="16px",this.autocomplete.style.bottom="16px"}hideAutocomplete(){this.autocomplete.style.display="none"}navigateAutocomplete(e){var a,o;const i=Array.from(this.autocomplete.children),s=i.findIndex(r=>r.classList.contains("selected"));(a=i[s])==null||a.classList.remove("selected");const n=Math.max(0,Math.min(i.length-1,s+e));(o=i[n])==null||o.classList.add("selected")}selectAutocompleteItem(e){const i=window.getSelection();if(!i.rangeCount)return;const s=i.getRangeAt(0),n=s.startContainer;if(n.nodeType!==Node.TEXT_NODE)return;const a=n.textContent,o=a.substring(0,s.startOffset);if(o.match(/\[\[([^\]]*?)$/)){const l=o.lastIndexOf("[["),h=a.substring(s.startOffset),c=h.indexOf("]]"),d=c>=0?h.substring(c+2):h,f=document.createElement("span");f.className="wiki-link",f.dataset.link=e,f.innerText=`[[${e}]]`;const w=document.createTextNode(a.substring(0,l)),m=document.createTextNode(" "+d),p=n.parentNode;p.insertBefore(w,n),p.insertBefore(f,n),p.insertBefore(m,n),p.removeChild(n);const u=document.createRange();u.setStartAfter(f),u.collapse(!0),i.removeAllRanges(),i.addRange(u)}this.hideAutocomplete(),this.value=this.extractRawText(this.editor.innerHTML),this.onChange&&this.onChange(this.value)}getValue(){return this.extractRawText(this.editor.innerHTML)}setValue(e){this.value=e,this.editor&&(this.editor.innerHTML=this.renderWithLinks(e))}}class Ge{constructor(e,i={}){this.container=e,this.item=null,this.onSave=i.onSave||null,this.onNameChange=i.onNameChange||null,this.onLinkClick=i.onLinkClick||null,this.onDelete=i.onDelete||null,this.getEntries=i.getEntries||(()=>[]),this.editorInstance=null}setItem(e){this.item=e,e?this.render():this.showEmpty()}showEmpty(){this.container.innerHTML=`
            <div class="empty-state">
                <h2>Select an entry</h2>
                <p>Or create a new one to start building your world.</p>
            </div>
        `}render(){if(!this.item)return this.showEmpty();const e=z(this.item.type);this.container.innerHTML=`
            <div class="library-editor active">
                <div class="entry-header">
                    <span id="entry-icon" class="entry-icon">${e.icon}</span>
                    <input id="asset-title" type="text" placeholder="Entry Name" 
                        value="${this.item.data.name||""}" class="input-title entry-title">
                    <span id="entry-category-badge" class="badge" 
                        style="background:${e.color}; color:#fff;">${e.label}</span>
                    <button id="btn-delete-entry" class="btn btn-ghost btn-sm" title="Delete Entry" style="margin-left:auto;">🗑️</button>
                </div>
                
                <div id="metadata-fields" class="metadata-grid"></div>
                
                <div class="description-label">Description</div>
                <div id="asset-rte-mount" class="description-editor"></div>
                
                <div id="save-status" class="save-status">Saved</div>
            </div>
        `;const i=this.container.querySelector("#asset-title"),s=this.container.querySelector("#metadata-fields"),n=this.container.querySelector("#asset-rte-mount");this.container.querySelector("#save-status"),e.fields.forEach(l=>{const h=document.createElement("div");h.className="metadata-field";const c=document.createElement("label");c.innerText=l.label,c.className="label";let d;l.type==="textarea"?(d=document.createElement("textarea"),d.rows=2,d.className="textarea"):(d=document.createElement("input"),d.type="text",d.className="input"),d.value=this.item.data[l.key]||"",d.oninput=()=>{this.item.data[l.key]=d.value,this.save()},h.appendChild(c),h.appendChild(d),s.appendChild(h)});const a=new De(n,this.item.data.description||"",{getEntries:this.getEntries,onLinkClick:this.onLinkClick});a.render(),this.editorInstance=a,a.onChange=l=>{this.item.data.description=l,this.save()};let o=null;i.oninput=()=>{this.item.data.name=i.value,this.save(),clearTimeout(o),o=setTimeout(()=>{this.onNameChange&&this.onNameChange(this.item)},300)};const r=this.container.querySelector("#btn-delete-entry");r&&(r.onclick=async()=>{if(await M.confirm("Delete Entry",`Are you sure you want to delete "${this.item.data.name||"this entry"}"?`)&&this.onDelete)try{await this.onDelete(this.item),I.show("Entry deleted","success")}catch{I.show("Failed to delete entry","error")}})}async save(){const e=this.container.querySelector("#save-status");e&&(e.innerText="Saving..."),this.onSave&&await this.onSave(this.item),e&&(e.innerText="Saved")}}class We{constructor(e,i={}){this.container=e,this.item=null,this.allItems=[],this.onSave=i.onSave||null,this.onNavigate=i.onNavigate||null}setItem(e,i){this.item=e,this.allItems=i,e&&this.render()}render(){this.item&&(this.item.data.relationships||(this.item.data.relationships=[]),this.container.innerHTML=`
            <div class="relationships-header">
                <div class="label">Relationships</div>
                <button id="add-relationship-btn" class="btn btn-primary btn-sm">+ Add</button>
            </div>
            <div id="relationships-list" class="relationships-list"></div>
            <div id="back-references" class="back-references"></div>
        `,this.renderRelationships(),this.container.querySelector("#add-relationship-btn").onclick=()=>this.showAddModal())}renderRelationships(){const e=this.container.querySelector("#relationships-list"),i=this.container.querySelector("#back-references");e.innerHTML="",this.item.data.relationships.length===0?e.innerHTML='<div class="text-muted text-sm">No relationships defined.</div>':(this.item.data.relationships.forEach((n,a)=>{const o=re(n.type),r=this.allItems.find(d=>d.id===n.targetId),l=r?r.data.name||"Untitled":"(Deleted)",h=r?z(r.type):{icon:"❓"},c=document.createElement("div");c.className="relationship-row",c.innerHTML=`
                    <span>${o.icon}</span>
                    <span class="relationship-type">${o.label}</span>
                    <span class="relationship-target" data-id="${n.targetId}">${h.icon} ${l}</span>
                    <button class="relationship-delete" data-idx="${a}">×</button>
                `,e.appendChild(c)}),e.querySelectorAll(".relationship-target").forEach(n=>{n.onclick=()=>{const a=this.allItems.find(o=>o.id===n.dataset.id);a&&this.onNavigate&&this.onNavigate(a)}}),e.querySelectorAll(".relationship-delete").forEach(n=>{n.onclick=()=>{this.item.data.relationships.splice(parseInt(n.dataset.idx),1),this.onSave&&this.onSave(this.item),this.renderRelationships()}}));const s=this.allItems.filter(n=>{var a;return n.id!==this.item.id&&((a=n.data.relationships)==null?void 0:a.some(o=>o.targetId===this.item.id))});i.innerHTML="",s.length===0?i.innerHTML='<div class="text-muted text-xs">No incoming references.</div>':(i.innerHTML='<div class="back-ref-label">Referenced by:</div>',s.forEach(n=>{const a=z(n.type);n.data.relationships.filter(r=>r.targetId===this.item.id).forEach(r=>{const l=re(r.type),h=oe[l.inverse],c=document.createElement("div");c.className="back-ref-item",c.innerHTML=`<span>${a.icon}</span> ${k.escapeHtml(n.data.name||"Untitled")} <span class="text-muted">(${(h==null?void 0:h.label)||l.label})</span>`,c.onclick=()=>{this.onNavigate&&this.onNavigate(n)},i.appendChild(c)})}))}showAddModal(){const e=document.createElement("div");e.className="flex flex-col gap-md",e.innerHTML=`
            <div>
                <label class="label">Type</label>
                <select id="rel-type-select" class="input w-full mt-sm"></select>
            </div>
            <div>
                <label class="label">Target Entry</label>
                <select id="rel-target-select" class="input w-full mt-sm"></select>
            </div>
        `,new M({title:"Add Relationship",content:e,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:a=>a.close()},{label:"Add",className:"btn btn-primary",onClick:a=>{const o=e.querySelector("#rel-type-select"),r=e.querySelector("#rel-target-select"),l=o.value,h=r.value;l&&h&&(this.item.data.relationships.push({type:l,targetId:h}),this.onSave&&this.onSave(this.item),this.renderRelationships()),a.close()}}]}).show();const s=e.querySelector("#rel-type-select"),n=e.querySelector("#rel-target-select");Ue().forEach(a=>{const o=document.createElement("option");o.value=a.id,o.innerText=`${a.icon} ${a.label}`,s.appendChild(o)}),this.allItems.filter(a=>a.id!==this.item.id).forEach(a=>{const o=z(a.type),r=document.createElement("option");r.value=a.id,r.innerText=`${o.icon} ${a.data.name||"Untitled"}`,n.appendChild(r)})}}const S={id:"library",label:"Library",icon:"📚",entryList:null,entryEditor:null,relationshipManager:null,allItems:[],activeItem:null,render:async(t,e)=>{t.innerHTML='<div class="loading-container"><div class="spinner spinner-lg"></div><div class="text-muted">Loading Library...</div></div>';try{await C.init()}catch(a){t.innerHTML=`<div class="text-muted">Vault Error: ${a.message}</div>`;return}t.innerHTML=`
            <div class="library-layout">
                <div id="lib-sidebar" class="library-sidebar"></div>
                <div id="lib-main" class="library-main">
                    <div id="lib-editor-area"></div>
                    <div id="lib-relationships-area" class="relationships-section hidden"></div>
                </div>
            </div>
        `;const i=t.querySelector("#lib-sidebar"),s=t.querySelector("#lib-editor-area"),n=t.querySelector("#lib-relationships-area");if(S.allItems=await C.list(),S.entryList=new Be(i,{onSelect:a=>S.selectItem(a,s,n),onCreate:()=>S.showCreateModal()}),S.entryList.setItems(S.allItems),S.entryEditor=new Ge(s,{onSave:async a=>{await C.updateItem(a)},onNameChange:a=>{S.entryList.setItems(S.allItems)},onLinkClick:a=>{const o=S.allItems.find(r=>(r.data.name||"").toLowerCase()===a.toLowerCase());o&&S.selectItem(o,s,n)},onDelete:async a=>{await C.deleteItem(a.id),S.allItems=S.allItems.filter(o=>o.id!==a.id),S.entryList.setItems(S.allItems),S.entryEditor.showEmpty(),n.style.display="none",x.updateSession({activeEntryId:null})},getEntries:()=>S.allItems}),S.entryEditor.showEmpty(),S.relationshipManager=new We(n,{onSave:async a=>{await C.updateItem(a)},onNavigate:a=>{S.selectItem(a,s,n)}}),x.session.activeEntryId){const a=S.allItems.find(o=>o.id===x.session.activeEntryId);a&&S.selectItem(a,s,n)}},selectItem(t,e,i){S.activeItem=t,S.entryList.setActiveItem(t.id),S.entryEditor.setItem(t),i.style.display="block",S.relationshipManager.setItem(t,S.allItems),x.updateSession({activeEntryId:t.id})},showCreateModal(){const t=document.createElement("div");t.className="grid-3",ee().forEach(i=>{const s=document.createElement("button");s.className="btn btn-secondary",s.style.cssText="flex-direction:column; padding:12px;",s.innerHTML=`<span style="font-size:20px;">${i.icon}</span><span class="text-xs">${i.label}</span>`,s.onclick=async()=>{e.close();const n=await C.addItem(i.id,{name:`New ${i.label}`,description:""});S.allItems.push(n),S.entryList.setItems(S.allItems);const a=document.querySelector("#lib-editor-area"),o=document.querySelector("#lib-relationships-area");S.selectItem(n,a,o)},t.appendChild(s)});const e=new M({title:"Create New Entry",content:t,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:i=>i.close()}]});e.show()}},j={id:"grimoire",label:"Grimoire",icon:"📖",_state:{activeCategory:"item",selectedRuleId:null,searchQuery:""},render:async t=>{var h;await P.init();let e=await P.list();const i=Ne();let s=j._state.activeCategory||((h=i[0])==null?void 0:h.id)||"item",n=j._state.selectedRuleId,a=n?e.find(c=>c.id===n):null,o=j._state.searchQuery||"",r=null;async function l(){var w,m,p;e=await P.list(),a=n?e.find(u=>u.id===n):null;const c=Pe(s);let d=e.filter(u=>u.type===s);if(o){const u=o.toLowerCase();d=d.filter(v=>(v.data.name||"").toLowerCase().includes(u)||(v.data.description||"").toLowerCase().includes(u)||Object.values(v.data).some(y=>typeof y=="string"&&y.toLowerCase().includes(u)))}t.innerHTML=`
                <div class="grimoire-layout">
                    <!-- Left: Categories + List -->
                    <div class="grimoire-sidebar">
                        <div class="sidebar-header">
                            <strong>📖 Grimoire</strong>
                        </div>

                        <!-- Category Tabs -->
                        <div class="category-tabs">
                            ${i.map(u=>`
                                <button class="cat-tab ${u.id===s?"active":""}" 
                                        data-cat="${u.id}" 
                                        style="--cat-color: ${u.color}"
                                        title="${u.description}">
                                    ${u.icon}
                                </button>
                            `).join("")}
                        </div>

                        <!-- Search -->
                        <div style="padding: 0 8px 8px 8px;">
                            <input type="text" id="grimoire-search" class="input input-sm" 
                                   style="width: 100%;" 
                                   placeholder="Search ${(c==null?void 0:c.label)||"rules"}..." 
                                   value="${o}">
                        </div>

                        <!-- Rule List -->
                        <div class="rule-list">
                            ${d.length===0?`
                                <div class="empty-state">
                                    <div class="empty-icon">${o?"🔍":(c==null?void 0:c.icon)||"📖"}</div>
                                    <div class="empty-text">${o?"No matches":`No ${(c==null?void 0:c.label)||"rules"} yet`}</div>
                                </div>
                            `:d.map(u=>`
                                <div class="rule-item ${(a==null?void 0:a.id)===u.id?"selected":""}" data-id="${u.id}">
                                    <div class="rule-icon" style="color: ${c==null?void 0:c.color}">${c==null?void 0:c.icon}</div>
                                    <div class="rule-info">
                                        <div class="rule-name">${u.data.name||"Untitled"}</div>
                                        <div class="rule-meta">${u.data.type||u.data.level||""}</div>
                                    </div>
                                </div>
                            `).join("")}
                        </div>

                        <div class="sidebar-footer">
                            <button id="btn-add-rule" class="btn btn-primary btn-sm">+ Add ${(c==null?void 0:c.label)||"Rule"}</button>
                        </div>
                    </div>

                    <!-- Right: Editor -->
                    <div class="grimoire-main">
                        ${a?`
                            <div class="rule-editor">
                                <div class="editor-header">
                                    <input type="text" id="rule-name" class="input input-lg" 
                                           value="${a.data.name||""}" 
                                           placeholder="${(c==null?void 0:c.label)||"Rule"} Name">
                                    <button id="btn-delete-rule" class="btn btn-ghost btn-sm" title="Delete">🗑️</button>
                                </div>

                                <div class="editor-fields">
                                    ${((c==null?void 0:c.fields)||[]).map(u=>`
                                        <div class="field-group">
                                            <label class="field-label">${u.label}</label>
                                            <input type="text" 
                                                   class="input field-input" 
                                                   data-field="${u.key}"
                                                   value="${a.data[u.key]||""}"
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
                                <div class="empty-text">Select or create a ${(c==null?void 0:c.label)||"rule"}</div>
                            </div>
                        `}
                    </div>
                </div>
            `,t.querySelectorAll(".cat-tab").forEach(u=>{u.onclick=()=>{s=u.dataset.cat,n=null,a=null,o="",j._state.activeCategory=s,j._state.selectedRuleId=null,j._state.searchQuery="",l()}});const f=t.querySelector("#grimoire-search");if(f&&(f.oninput=u=>{o=u.target.value,j._state.searchQuery=o,l().then(()=>{const v=t.querySelector("#grimoire-search");v&&(v.focus(),v.setSelectionRange(v.value.length,v.value.length))})}),t.querySelectorAll(".rule-item").forEach(u=>{u.onclick=()=>{n=u.dataset.id,a=e.find(v=>v.id===n),j._state.selectedRuleId=n,l()}}),(w=t.querySelector("#btn-add-rule"))==null||w.addEventListener("click",async()=>{const u=await P.add(s,{name:`New ${(c==null?void 0:c.label)||"Rule"}`,description:""});console.log("[Grimoire] Created rule:",u.id),n=u.id,j._state.selectedRuleId=n,o="",j._state.searchQuery="",l()}),(m=t.querySelector("#btn-delete-rule"))==null||m.addEventListener("click",async()=>{!a||!await M.confirm("Delete Rule",`Delete "${a.data.name||"this rule"}"?`)||(await P.delete(a.id),I.show("Rule deleted","success"),n=null,a=null,j._state.selectedRuleId=null,l())}),(p=t.querySelector("#btn-save-rule"))==null||p.addEventListener("click",async()=>{var y;if(!a)return;const v={name:((y=t.querySelector("#rule-name"))==null?void 0:y.value)||""};t.querySelectorAll(".field-input").forEach(g=>{v[g.dataset.field]=g.value}),r&&(v.description=r.getValue()),a.data=v,await P.update(a),I.show("Rule saved","success"),l()}),a){const u=t.querySelector("#description-editor");u&&(r=new De(u,a.data.description||""),r.render())}}await l()}},Ee={id:"graph",label:"Graph",icon:"🕸️",render:async(t,e)=>{try{await C.init()}catch(y){t.innerHTML=`<div class="text-muted">Vault Error: ${y.message}</div>`;return}t.style.padding="0",t.innerHTML=`
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
        `;const i=t.querySelector("#graph-container"),s=t.querySelector("#graph-canvas"),n=s.getContext("2d"),a=()=>{s.width=i.clientWidth,s.height=i.clientHeight};a(),window.addEventListener("resize",a);const o=await C.list(),r=o.map((y,g)=>{const b=z(y.type),$=g/o.length*Math.PI*2,E=Math.min(s.width,s.height)*.3;return{id:y.id,item:y,label:y.data.name||"Untitled",icon:b.icon,color:b.color,x:s.width/2+Math.cos($)*E,y:s.height/2+Math.sin($)*E,vx:0,vy:0}}),l=Object.fromEntries(r.map(y=>[y.id,y])),h=[];o.forEach(y=>{(y.data.relationships||[]).forEach(g=>{if(l[g.targetId]){const b=re(g.type);h.push({from:y.id,to:g.targetId,label:b.label,color:b.icon})}})});let c={x:0,y:0,scale:1},d=!1,f={x:0,y:0},w=null;const m=()=>{n.clearRect(0,0,s.width,s.height),n.save(),n.translate(c.x,c.y),n.scale(c.scale,c.scale),n.lineWidth=2,h.forEach(y=>{const g=l[y.from],b=l[y.to];g&&b&&(n.strokeStyle="rgba(100, 116, 139, 0.5)",n.beginPath(),n.moveTo(g.x,g.y),n.lineTo(b.x,b.y),n.stroke())}),r.forEach(y=>{n.fillStyle=y.color||"#6366f1",n.beginPath(),n.arc(y.x,y.y,24,0,Math.PI*2),n.fill(),n.font="16px sans-serif",n.textAlign="center",n.textBaseline="middle",n.fillStyle="#fff",n.fillText(y.icon,y.x,y.y),n.font="11px sans-serif",n.fillStyle="var(--text-primary)",n.fillText(y.label,y.x,y.y+36)}),n.restore()},p=()=>{const y=s.width/2,g=s.height/2;r.forEach(b=>{r.forEach($=>{if(b.id===$.id)return;const E=b.x-$.x,F=b.y-$.y,R=Math.sqrt(E*E+F*F)||1,U=5e3/(R*R);b.vx+=E/R*U,b.vy+=F/R*U}),b.vx+=(y-b.x)*.001,b.vy+=(g-b.y)*.001}),h.forEach(b=>{const $=l[b.from],E=l[b.to];if($&&E){const F=E.x-$.x,R=E.y-$.y,U=Math.sqrt(F*F+R*R)||1,J=(U-150)*.01;$.vx+=F/U*J,$.vy+=R/U*J,E.vx-=F/U*J,E.vy-=R/U*J}}),r.forEach(b=>{w!==b&&(b.x+=b.vx*.1,b.y+=b.vy*.1),b.vx*=.9,b.vy*=.9}),m(),requestAnimationFrame(p)};p();const u=y=>({x:(y.offsetX-c.x)/c.scale,y:(y.offsetY-c.y)/c.scale}),v=(y,g)=>r.find(b=>{const $=b.x-y,E=b.y-g;return Math.sqrt($*$+E*E)<24});s.onmousedown=y=>{const g=u(y),b=v(g.x,g.y);b?w=b:(d=!0,f={x:y.clientX,y:y.clientY})},s.onmousemove=y=>{if(w){const g=u(y);w.x=g.x,w.y=g.y}else d&&(c.x+=y.clientX-f.x,c.y+=y.clientY-f.y,f={x:y.clientX,y:y.clientY})},s.onmouseup=()=>{w=null,d=!1},s.onwheel=y=>{y.preventDefault();const g=y.deltaY>0?.9:1.1;c.scale*=g,c.scale=Math.min(Math.max(.3,c.scale),3)},t.querySelector("#graph-reset").onclick=()=>{c={x:0,y:0,scale:1}},t.querySelector("#graph-relayout").onclick=()=>{r.forEach((y,g)=>{const b=g/r.length*Math.PI*2,$=Math.min(s.width,s.height)*.3;y.x=s.width/2+Math.cos(b)*$,y.y=s.height/2+Math.sin(b)*$,y.vx=0,y.vy=0})}}};class Ye{constructor(e,i,s){this.container=e,this.nodeLayer=i,this.svgLayer=s,this.nodes=[],this.links=[],this.transform={x:0,y:0,scale:1},this.isDragging=!1,this.lastMouse={x:0,y:0},this.isWiring=!1,this.wireFrom=null,this.wireLine=null,this.selectedLink=null,this.onDataChange=null}init(){this.container.onmousedown=e=>{(e.button===1||e.button===0&&e.altKey)&&(this.isDragging=!0,this.lastMouse={x:e.clientX,y:e.clientY},this.container.style.cursor="grabbing",e.preventDefault())},this.container.onmousemove=e=>{if(this.isDragging){const i=e.clientX-this.lastMouse.x,s=e.clientY-this.lastMouse.y;this.transform.x+=i,this.transform.y+=s,this.lastMouse={x:e.clientX,y:e.clientY},this.updateTransform()}if(this.isWiring&&this.wireLine){const i=this.container.getBoundingClientRect(),s=e.clientX-i.left,n=e.clientY-i.top;this.updateWirePreview(s,n)}},this.container.onmouseup=e=>{this.isDragging=!1,this.container.style.cursor="default",this.isWiring&&this.cancelWiring()},this.container.onwheel=e=>{e.preventDefault();const i=e.deltaY>0?.9:1.1;this.transform.scale*=i,this.transform.scale=Math.min(Math.max(.2,this.transform.scale),2),this.updateTransform()},window.addEventListener("keydown",e=>{e.key==="Delete"&&this.selectedLink&&(this.deleteLink(this.selectedLink),this.selectedLink=null)})}exportData(){return{nodes:this.nodes,links:this.links,transform:this.transform}}importData(e){e&&(this.nodes=[],this.links=[],this.nodeLayer.innerHTML="",e.transform&&(this.transform=e.transform,this.updateTransform()),e.nodes&&e.nodes.forEach(i=>this.addNode(i,!0)),this.links=e.links||[],this.updateLinks())}notifyChange(){this.onDataChange&&this.onDataChange(this.exportData())}updateTransform(){this.nodeLayer.style.transform=`translate(${this.transform.x}px, ${this.transform.y}px) scale(${this.transform.scale})`,this.updateLinks()}resetView(){this.transform={x:0,y:0,scale:1},this.updateTransform()}addNode(e,i=!1){this.nodes.push(e);const s=this.renderNodeElement(e);this.nodeLayer.appendChild(s),i||this.notifyChange()}renderNodeElement(e){const i=document.createElement("div");i.className="node"+(e.type?` ${e.type}`:""),i.id=e.id,i.style.left=e.x+"px",i.style.top=e.y+"px";let s=(e.inputs||[]).map(d=>`
            <div class="socket-row">
                <div class="socket input" 
                     data-node-id="${e.id}" 
                     data-socket-type="input" 
                     data-socket-name="${d}" 
                     title="${d}"></div>
                <span>${d}</span>
            </div>
        `).join(""),n=(e.outputs||[]).map(d=>`
            <div class="socket-row" style="justify-content: flex-end;">
                <span>${d}</span>
                <div class="socket output" 
                     data-node-id="${e.id}" 
                     data-socket-type="output" 
                     data-socket-name="${d}" 
                     title="${d}"></div>
            </div>
        `).join("");i.innerHTML=`
            <div class="node-header">${e.title}</div>
            <div class="node-body">
                ${s}
                ${n}
            </div>
        `;const a=i.querySelector(".node-header");let o=!1,r={x:0,y:0},l={x:e.x,y:e.y};a.onmousedown=d=>{d.button===0&&(o=!0,r={x:d.clientX,y:d.clientY},l={x:e.x,y:e.y},i.classList.add("selected"),d.stopPropagation())};const h=d=>{if(o){const f=(d.clientX-r.x)/this.transform.scale,w=(d.clientY-r.y)/this.transform.scale;e.x=l.x+f,e.y=l.y+w,i.style.left=e.x+"px",i.style.top=e.y+"px",this.updateLinks()}},c=()=>{o&&(o=!1,i.classList.remove("selected"),this.notifyChange())};return window.addEventListener("mousemove",h),window.addEventListener("mouseup",c),i.querySelectorAll(".socket").forEach(d=>{d.onmousedown=f=>{f.stopPropagation(),this.startWiring(d)},d.onmouseup=f=>{f.stopPropagation(),this.isWiring&&this.completeWiring(d)}}),i}startWiring(e){const i=e.dataset.nodeId,s=e.dataset.socketType,n=e.dataset.socketName;this.isWiring=!0,this.wireFrom={nodeId:i,socket:n,type:s,element:e},this.wireLine=document.createElementNS("http://www.w3.org/2000/svg","path"),this.wireLine.setAttribute("class","connection-line wiring"),this.svgLayer.appendChild(this.wireLine),e.classList.add("wiring")}updateWirePreview(e,i){if(!this.wireFrom||!this.wireLine)return;const s=this.getSocketPosition(this.wireFrom.element),n=s.x,a=s.y,o=e,r=i,l=this.wireFrom.type==="output"?n+50:n-50,h=this.wireFrom.type==="output"?o-50:o+50,c=`M ${n} ${a} C ${l} ${a}, ${h} ${r}, ${o} ${r}`;this.wireLine.setAttribute("d",c)}completeWiring(e){if(!this.wireFrom)return;const i=e.dataset.nodeId,s=e.dataset.socketType,n=e.dataset.socketName;if(this.wireFrom.type===s){console.log("[Canvas] Cannot connect same socket types"),this.cancelWiring();return}if(this.wireFrom.nodeId===i){console.log("[Canvas] Cannot connect node to itself"),this.cancelWiring();return}let a,o;if(this.wireFrom.type==="output"?(a={nodeId:this.wireFrom.nodeId,socket:this.wireFrom.socket},o={nodeId:i,socket:n}):(a={nodeId:i,socket:n},o={nodeId:this.wireFrom.nodeId,socket:this.wireFrom.socket}),!this.links.some(l=>l.from.nodeId===a.nodeId&&l.from.socket===a.socket&&l.to.nodeId===o.nodeId&&l.to.socket===o.socket)){const l={id:"link_"+Date.now(),from:a,to:o};this.links.push(l),console.log("[Canvas] Created link:",l),this.notifyChange()}this.cancelWiring(),this.updateLinks()}cancelWiring(){var e;this.wireLine&&(this.wireLine.remove(),this.wireLine=null),(e=this.wireFrom)!=null&&e.element&&this.wireFrom.element.classList.remove("wiring"),this.isWiring=!1,this.wireFrom=null}getSocketPosition(e){const i=this.container.getBoundingClientRect(),s=e.getBoundingClientRect();return{x:s.left+s.width/2-i.left,y:s.top+s.height/2-i.top}}deleteLink(e){const i=this.links.findIndex(s=>s.id===e);i>=0&&(this.links.splice(i,1),this.updateLinks(),this.notifyChange())}updateLinks(){this.svgLayer.innerHTML="",this.links.forEach(e=>{const i=this.nodeLayer.querySelector(`#${e.from.nodeId}`),s=this.nodeLayer.querySelector(`#${e.to.nodeId}`);if(!i||!s)return;const n=i.querySelector(`.socket.output[data-socket-name="${e.from.socket}"]`),a=s.querySelector(`.socket.input[data-socket-name="${e.to.socket}"]`);if(!n||!a)return;const o=this.getSocketPosition(n),r=this.getSocketPosition(a),l=document.createElementNS("http://www.w3.org/2000/svg","path"),h=o.x+50,c=r.x-50,d=`M ${o.x} ${o.y} C ${h} ${o.y}, ${c} ${r.y}, ${r.x} ${r.y}`;l.setAttribute("d",d),l.setAttribute("class","connection-line"+(e.id===this.selectedLink?" selected":"")),l.dataset.linkId=e.id,l.onclick=f=>{f.stopPropagation(),this.selectedLink=e.id,this.updateLinks()},this.svgLayer.appendChild(l)})}}const Ce={event:{id:"event",label:"Event",icon:"⚡",color:"#4ade80",description:'Triggers like "On Combat Start", "On Turn Begin"',templates:[{title:"On Start",outputs:["next"]},{title:"On Turn Begin",outputs:["next"]},{title:"On Attack",inputs:["attacker","target"],outputs:["next"]},{title:"On Damage",inputs:["target","amount"],outputs:["next"]}]},condition:{id:"condition",label:"Condition",icon:"❓",color:"#facc15",description:"If/else branching logic",templates:[{title:"If Greater Than",inputs:["a","b"],outputs:["true","false"]},{title:"If Equal",inputs:["a","b"],outputs:["true","false"]},{title:"If Has Tag",inputs:["target","tag"],outputs:["true","false"]},{title:"Compare Roll",inputs:["roll","dc"],outputs:["success","failure"]}]},action:{id:"action",label:"Action",icon:"🎲",color:"#60a5fa",description:"Roll dice, modify values, apply effects",templates:[{title:"Roll Dice",inputs:["expression"],outputs:["result","next"]},{title:"Add Value",inputs:["a","b"],outputs:["result"]},{title:"Apply Damage",inputs:["target","amount"],outputs:["next"]},{title:"Set Variable",inputs:["name","value"],outputs:["next"]}]},reference:{id:"reference",label:"Library",icon:"📚",color:"#c084fc",description:"Link to Library entries (lore, characters, locations)",templates:[]},rules:{id:"rules",label:"Rules",icon:"📖",color:"#f59e0b",description:"Link to Grimoire entries (items, spells, abilities)",templates:[]},compound:{id:"compound",label:"Flows",icon:"📦",color:"#06b6d4",description:"Reuse entire flows as single nodes",templates:[]}};class Ke{constructor(e={}){this.onSelect=e.onSelect||null}async show(){const e=document.createElement("div");e.className="node-picker";const i=document.createElement("div");i.className="library-tabs",i.style.marginBottom="16px";const s=document.createElement("div");s.className="node-picker-panels";const n=async o=>{i.querySelectorAll(".tab").forEach(l=>{l.classList.toggle("active",l.dataset.type===o)}),s.innerHTML="";const r=Ce[o];if(o==="reference"){await C.init();const l=await C.list();if(l.length===0){s.innerHTML='<div class="text-muted">No Library entries. Create entries in the Library first.</div>';return}const h=document.createElement("div");h.className="grid-2",h.style.gap="8px",l.forEach(c=>{const d=z(c.type),f=document.createElement("button");f.className="btn btn-secondary",f.style.cssText="justify-content:flex-start; padding:8px 12px; text-align:left;",f.innerHTML=`<span class="mr-sm">${(d==null?void 0:d.icon)||"📄"}</span> ${k.escapeHtml(c.data.name||"Untitled")}`,f.onclick=()=>{this.onSelect&&this.onSelect({type:"reference",title:`📚 ${c.data.name||"Untitled"}`,entryId:c.id,entryType:c.type,inputs:["in"],outputs:["out","data"]}),a.close()},h.appendChild(f)}),s.appendChild(h)}else if(o==="rules"){await P.init();const l=await P.list();if(l.length===0){s.innerHTML='<div class="text-muted">No Grimoire entries. Create rules in the Grimoire first.</div>';return}const h=document.createElement("div");h.className="grid-2",h.style.gap="8px",l.forEach(c=>{const d=Pe(c.type),f=document.createElement("button");f.className="btn btn-secondary",f.style.cssText="justify-content:flex-start; padding:8px 12px; text-align:left;",f.innerHTML=`<span class="mr-sm">${(d==null?void 0:d.icon)||"📖"}</span> ${k.escapeHtml(c.data.name||"Untitled")}`,f.onclick=()=>{this.onSelect&&this.onSelect({type:"rules",title:`📖 ${c.data.name||"Untitled"}`,ruleId:c.id,ruleType:c.type,inputs:["in"],outputs:["out","effect"]}),a.close()},h.appendChild(f)}),s.appendChild(h)}else if(o==="compound"){await T.init();const l=await T.list();if(l.length===0){s.innerHTML='<div class="text-muted">No saved flows found. Create a flow first.</div>';return}const h=document.createElement("div");h.className="grid-2",h.style.gap="8px",l.forEach(c=>{const d=document.createElement("button");d.className="btn btn-secondary",d.style.cssText="justify-content:flex-start; padding:8px 12px; text-align:left;",d.innerHTML=`<span class="mr-sm">📦</span> ${k.escapeHtml(c.name)}`,d.onclick=()=>{this.onSelect&&this.onSelect({type:"compound",title:`📦 ${c.name}`,flowId:c.id,inputs:(c.exposedInputs||[]).map(f=>f.label||f.socket),outputs:(c.exposedOutputs||[]).map(f=>f.label||f.socket)}),a.close()},h.appendChild(d)}),s.appendChild(h)}else{const l=document.createElement("div");l.className="grid-2",l.style.gap="8px",r.templates.forEach(h=>{const c=document.createElement("button");c.className="btn btn-secondary",c.style.cssText="justify-content:flex-start; padding:8px 12px;",c.innerHTML=`<span class="mr-sm">${r.icon}</span> ${h.title}`,c.onclick=()=>{this.onSelect&&this.onSelect({type:o,title:h.title,inputs:h.inputs||[],outputs:h.outputs||[]}),a.close()},l.appendChild(c)}),s.appendChild(l)}};Object.values(Ce).forEach(o=>{const r=document.createElement("button");r.className="tab",r.dataset.type=o.id,r.innerHTML=`${o.icon} ${o.label}`,r.onclick=()=>n(o.id),i.appendChild(r)}),e.appendChild(i),e.appendChild(s);const a=new M({title:"Add Node",content:e,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:o=>o.close()}]});a.show(),await n("event")}}const X={id:"architect",label:"Architect",icon:"📐",_state:{activeFlowId:null},render:async(t,e)=>{t.style.padding="0",t.innerHTML='<div class="loading-container"><div class="spinner spinner-lg"></div><div class="text-muted">Loading Architect...</div></div>',await T.init();let i=await T.list(),s=X._state.activeFlowId;(!s||!i.find(r=>r.id===s))&&(i.length===0&&(i=[await T.create("Main Flow")]),s=i[0].id,X._state.activeFlowId=s);let n=await T.get(s),a=null;async function o(){i=await T.list(),n=await T.get(s),t.innerHTML=`
                <div class="architect-workspace" id="arch-workspace">
                    <div class="connection-layer" id="arch-connections">
                        <svg width="100%" height="100%" id="arch-svg"></svg>
                    </div>
                    <div class="node-layer" id="arch-nodes"></div>
                    
                    <div class="architect-toolbar">
                        <div class="toolbar-group">
                            <select id="flow-selector" class="input input-sm">
                                ${i.map(d=>`
                                    <option value="${d.id}" ${d.id===s?"selected":""}>
                                        ${d.name}
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
            `;const r=t.querySelector("#arch-workspace"),l=t.querySelector("#arch-nodes"),h=t.querySelector("#arch-svg");a=new Ye(r,l,h),a.init(),n&&a.importData({nodes:n.nodes||[],links:n.links||[],transform:n.transform||{x:0,y:0,scale:1}}),a.onDataChange=async d=>{n&&(n.nodes=d.nodes,n.links=d.links,n.transform=d.transform,await T.update(n))},t.querySelector("#flow-selector").onchange=async d=>{s=d.target.value,X._state.activeFlowId=s,o()},t.querySelector("#btn-new-flow").onclick=async()=>{const d=await M.prompt("Flow name:","New Flow");if(!d)return;s=(await T.create(d)).id,X._state.activeFlowId=s,o()},t.querySelector("#btn-rename-flow").onclick=async()=>{if(!n)return;const d=await M.prompt("Rename flow:",n.name);d&&(n.name=d,await T.update(n),o())},t.querySelector("#btn-delete-flow").onclick=async()=>{var f;if(!n)return;if(i.length<=1){I.show("Cannot delete the last flow.","warning");return}await M.confirm("Delete Flow",`Delete "${n.name}"?`)&&(await T.delete(n.id),i=await T.list(),s=(f=i[0])==null?void 0:f.id,X._state.activeFlowId=s,o(),I.show("Flow deleted","success"))};const c=new Ke({onSelect:d=>{a.addNode({id:k.generateId("node"),x:100+Math.random()*100,y:100+Math.random()*100,type:d.type,title:d.title,inputs:d.inputs||[],outputs:d.outputs||[],entryId:d.entryId||null,entryType:d.entryType||null,ruleId:d.ruleId||null,ruleType:d.ruleType||null,flowId:d.flowId||null})}});t.querySelector("#btn-add-node").onclick=()=>{c.show()},t.querySelector("#btn-reset-view").onclick=()=>{a.resetView()},t.querySelector("#btn-clear-all").onclick=async()=>{await M.confirm("Clear Nodes","Clear all nodes in this flow?")&&(a.nodes=[],a.links=[],l.innerHTML="",h.innerHTML="",a.notifyChange(),I.show("Flow cleared","success"))}}await o()}},be={parse(t){const e=t.trim().match(/^(\d+)?d(\d+)([+-]\d+)?$/i);return e?{count:parseInt(e[1])||1,sides:parseInt(e[2]),modifier:parseInt(e[3])||0}:null},rollOne(t){return Math.floor(Math.random()*t)+1},rollMany(t,e){const i=[];for(let s=0;s<t;s++)i.push(this.rollOne(e));return i},roll(t){const e=this.parse(t);if(!e)return{error:"Invalid format. Use NdX or NdX+Y (e.g., 2d6+3)"};const i=this.rollMany(e.count,e.sides),s=i.reduce((a,o)=>a+o,0),n=s+e.modifier;return{expression:t,rolls:i,subtotal:s,modifier:e.modifier,total:n}},format(t){if(t.error)return t.error;let e=`[${t.rolls.join(", ")}]`;return t.modifier!==0&&(e+=` ${t.modifier>0?"+":""}${t.modifier}`),e+=` = ${t.total}`,e},stats(t){const e=this.parse(t);if(!e)return null;const i=e.count+e.modifier,s=e.count*e.sides+e.modifier,n=(i+s)/2;return{min:i,max:s,average:n.toFixed(1)}}},pe={runDiceSimulation(t,e=1e3){const i=[],s={};for(let p=0;p<e;p++){const u=be.roll(t);if(u.error)return{error:u.error};i.push(u.total),s[u.total]=(s[u.total]||0)+1}const n=[...i].sort((p,u)=>p-u),o=i.reduce((p,u)=>p+u,0)/e,l=i.map(p=>Math.pow(p-o,2)).reduce((p,u)=>p+u,0)/e,h=Math.sqrt(l);let c=null,d=0;for(const[p,u]of Object.entries(s))u>d&&(d=u,c=parseInt(p));const f=e%2===0?(n[e/2-1]+n[e/2])/2:n[Math.floor(e/2)],w=n[Math.floor(e*.25)],m=n[Math.floor(e*.75)];return{expression:t,iterations:e,results:i,distribution:s,stats:{min:n[0],max:n[n.length-1],mean:o.toFixed(2),median:f,mode:c,stdDev:h.toFixed(2),p25:w,p75:m}}},getHistogramData(t){if(t.error)return[];const{distribution:e,iterations:i,stats:s}=t,n=[];for(let a=s.min;a<=s.max;a++){const o=e[a]||0;n.push({value:a,count:o,percentage:(o/i*100).toFixed(1)})}return n},compare(t,e,i=1e3){const s=this.runDiceSimulation(t,i),n=this.runDiceSimulation(e,i);if(s.error||n.error)return{error:s.error||n.error};let a=0,o=0,r=0;for(let l=0;l<i;l++)s.results[l]>n.results[l]?a++:n.results[l]>s.results[l]?o++:r++;return{expr1:{expression:t,stats:s.stats},expr2:{expression:e,stats:n.stats},comparison:{wins1:a,wins2:o,ties:r,win1Pct:(a/i*100).toFixed(1),win2Pct:(o/i*100).toFixed(1),tiePct:(r/i*100).toFixed(1)}}}},Te={id:"laboratory",label:"Laboratory",icon:"🧪",render:(t,e)=>{t.innerHTML=`
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
                        <div id="lab-stats" class="text-muted text-sm mt-md"></div>
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
                        
                        <div id="sim-results" class="simulation-results hidden">
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
                        <div id="cmp-results" class="compare-results hidden"></div>
                    </div>
                </div>
            </div>
        `;const i=t.querySelector("#lab-expr"),s=t.querySelector("#lab-roll"),n=t.querySelector("#lab-result"),a=t.querySelector("#lab-stats");i.oninput=()=>{const p=be.stats(i.value);p?a.innerText=`Range: ${p.min}–${p.max} | Average: ${p.average}`:a.innerText=""},i.oninput(),s.onclick=()=>{const p=i.value.trim();if(!p)return;const u=be.roll(p);u.error?n.innerHTML=`<span class="text-error">${k.escapeHtml(u.error)}</span>`:n.innerHTML=`
                    <div><strong>Rolls:</strong> [${u.rolls.join(", ")}]</div>
                    ${u.modifier!==0?`<div><strong>Modifier:</strong> ${u.modifier>0?"+":""}${u.modifier}</div>`:""}
                    <div class="roll-total"><strong>Total:</strong> ${u.total}</div>
                `},i.onkeydown=p=>{p.key==="Enter"&&s.onclick()};const o=t.querySelector("#sim-expr"),r=t.querySelector("#sim-iterations"),l=t.querySelector("#sim-run"),h=t.querySelector("#sim-results"),c=t.querySelector("#histogram");l.onclick=()=>{const p=o.value.trim(),u=parseInt(r.value);p&&(l.disabled=!0,l.innerText="Running...",setTimeout(()=>{const v=pe.runDiceSimulation(p,u);if(l.disabled=!1,l.innerText="Run",v.error){h.style.display="none",I.show(v.error,"error");return}h.style.display="block",t.querySelector("#stat-min").innerText=v.stats.min,t.querySelector("#stat-max").innerText=v.stats.max,t.querySelector("#stat-mean").innerText=v.stats.mean,t.querySelector("#stat-median").innerText=v.stats.median,t.querySelector("#stat-mode").innerText=v.stats.mode,t.querySelector("#stat-stddev").innerText=v.stats.stdDev;const y=pe.getHistogramData(v),g=Math.max(...y.map(b=>b.count));c.innerHTML=y.map(b=>`
                    <div class="hist-bar-container">
                        <div class="hist-bar" style="height: ${b.count/g*100}%;" title="${b.value}: ${b.count} (${b.percentage}%)"></div>
                        <span class="hist-label">${b.value}</span>
                    </div>
                `).join("")},10))};const d=t.querySelector("#cmp-expr1"),f=t.querySelector("#cmp-expr2"),w=t.querySelector("#cmp-run"),m=t.querySelector("#cmp-results");w.onclick=()=>{const p=d.value.trim(),u=f.value.trim();if(!p||!u)return;const v=pe.compare(p,u,1e3);if(v.error){m.style.display="none",I.show(v.error,"error");return}m.style.display="block",m.innerHTML=`
                <div class="compare-stat">
                    <strong>${k.escapeHtml(p)}</strong> wins <span class="highlight">${v.comparison.win1Pct}%</span> of the time
                    <small>(avg: ${v.expr1.stats.mean})</small>
                </div>
                <div class="compare-stat">
                    <strong>${k.escapeHtml(u)}</strong> wins <span class="highlight">${v.comparison.win2Pct}%</span> of the time
                    <small>(avg: ${v.expr2.stats.mean})</small>
                </div>
                <div class="compare-stat tie">
                    Ties: ${v.comparison.tiePct}%
                </div>
            `}}},he="samildanach_llm_configs",ie="samildanach_active_config_id",G={getConfigs(){return JSON.parse(localStorage.getItem(he)||"[]")},saveConfig(t){const e=this.getConfigs(),i=e.findIndex(s=>s.id===t.id);i>=0?e[i]=t:e.push(t),localStorage.setItem(he,JSON.stringify(e))},deleteConfig(t){const e=this.getConfigs().filter(i=>i.id!==t);localStorage.setItem(he,JSON.stringify(e)),localStorage.getItem(ie)===t&&localStorage.removeItem(ie)},getActiveConfig(){const t=this.getConfigs(),e=localStorage.getItem(ie);return t.find(i=>i.id===e)||t[0]||null},setActiveConfig(t){localStorage.setItem(ie,t)},async generate(t,e,i={}){var h,c,d,f,w,m,p,u,v,y,g,b,$,E,F,R,U,J;const n={...this.getActiveConfig()||{},...i},a=n.provider||"gemini",o=n.model||"gemini-1.5-flash",r=n.apiKey||"",l=n.maxTokens||4096;if(!r&&a!=="kobold")throw new Error(`Missing API Key for ${a}. Please configure in Settings.`);if(a==="gemini"){const Y=`https://generativelanguage.googleapis.com/v1beta/models/${o}:generateContent?key=${r}`,D={contents:e.map(O=>({role:O.role==="user"?"user":"model",parts:[{text:O.content}]})),generationConfig:{temperature:.9,maxOutputTokens:l}};t&&(D.systemInstruction={parts:[{text:t}]});const q=await fetch(Y,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(D)});if(!q.ok){const O=await q.json();throw new Error(((h=O.error)==null?void 0:h.message)||q.statusText)}return((m=(w=(f=(d=(c=(await q.json()).candidates)==null?void 0:c[0])==null?void 0:d.content)==null?void 0:f.parts)==null?void 0:w[0])==null?void 0:m.text)||"(No response)"}if(["openai","openrouter","chutes","custom"].includes(a)){let Y="https://api.openai.com/v1/chat/completions";a==="openrouter"&&(Y="https://openrouter.ai/api/v1/chat/completions"),a==="chutes"&&(Y="https://llm.chutes.ai/v1/chat/completions"),a==="custom"&&(Y=`${(n.baseUrl||"https://api.example.com/v1").replace(/\/$/,"")}/chat/completions`);const Q=[{role:"system",content:t},...e.map(K=>({role:K.role==="model"?"assistant":K.role,content:K.content}))],D={"Content-Type":"application/json",Authorization:`Bearer ${r}`};a==="openrouter"&&(D["HTTP-Referer"]="https://samildanach.app",D["X-Title"]="Samildánach");let q=l,W=0;const O=1;for(;W<=O;){const K=await fetch(Y,{method:"POST",headers:D,body:JSON.stringify({model:o,messages:Q,temperature:.9,max_tokens:q})});if(!K.ok){const ke=((p=(await K.json()).error)==null?void 0:p.message)||K.statusText,ce=ke.match(/maximum context length is (\d+) tokens.*requested about (\d+) tokens.*\((\d+) in the messages/);if(ce&&W<O){const He=parseInt(ce[1]),je=parseInt(ce[3]),de=He-je-200;if(de>0){console.warn(`[LLM] Context limit exceeded. Auto-scaling max_tokens from ${q} to ${de}.`),q=de,W++;continue}}throw new Error(ke)}const xe=await K.json();let le=((y=(v=(u=xe.choices)==null?void 0:u[0])==null?void 0:v.message)==null?void 0:y.content)||"";const Se=($=(b=(g=xe.choices)==null?void 0:g[0])==null?void 0:b.message)==null?void 0:$.reasoning_content;return Se&&(le=`<think>${Se}</think>
${le}`),le||"(No response)"}}if(a==="anthropic"){const Y="https://api.anthropic.com/v1/messages",Q=e.map(W=>({role:W.role==="model"?"assistant":"user",content:W.content})),D=await fetch(Y,{method:"POST",headers:{"x-api-key":r,"anthropic-version":"2023-06-01","content-type":"application/json","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:o,max_tokens:l,system:t,messages:Q,temperature:.9})});if(!D.ok){const W=await D.json();throw new Error(((E=W.error)==null?void 0:E.message)||D.statusText)}return((R=(F=(await D.json()).content)==null?void 0:F[0])==null?void 0:R.text)||"(No response)"}if(a==="kobold"){const Q=`${(n.baseUrl||"http://localhost:5001").replace(/\/$/,"")}/api/v1/generate`,D=`${t}

${e.map(O=>`${O.role==="user"?"User":"Assistant"}: ${O.content}`).join(`
`)}`,q=await fetch(Q,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:D,max_context_length:4096,max_length:l>2048?2048:l,temperature:.9})});if(!q.ok){const O=await q.text();throw new Error(`Kobold Error: ${O||q.statusText}`)}return((J=(U=(await q.json()).results)==null?void 0:U[0])==null?void 0:J.text)||"(No response)"}throw new Error(`Unknown provider: ${a}`)},async testConfig(t){try{return await this.generate("You are a test assistant.",[{role:"user",content:'Say "Hello" in one word.'}],t),!0}catch(e){throw e}}},me=[{id:"gemini",label:"Google Gemini",models:["gemini-1.5-flash","gemini-1.5-pro","gemini-2.0-flash"]},{id:"openai",label:"OpenAI",models:["gpt-4o","gpt-4o-mini","gpt-4-turbo","gpt-3.5-turbo"]},{id:"openrouter",label:"OpenRouter",models:["anthropic/claude-3.5-sonnet","google/gemini-pro-1.5","meta-llama/llama-3.1-405b-instruct"]},{id:"anthropic",label:"Anthropic",models:["claude-3-5-sonnet-20241022","claude-3-opus-20240229","claude-3-haiku-20240307"]},{id:"chutes",label:"Chutes AI",models:["deepseek-ai/DeepSeek-V3","deepseek-ai/DeepSeek-R1"]},{id:"kobold",label:"Kobold AI (Local)",models:["local"],baseUrl:"http://localhost:5001"},{id:"custom",label:"Custom Endpoint",models:["custom"]}],Le="samildanach_scribe_state",Ie=[{id:"brainstorm",label:"💡 Brainstorm",desc:"Generate ideas and explore concepts"},{id:"expand",label:"📝 Expand",desc:"Develop and detail existing entries"},{id:"critique",label:"🔍 Critique",desc:"Get feedback and suggestions"}],Me={brainstorm:[{label:"Character concept",prompt:"Help me brainstorm a character who..."},{label:"Location idea",prompt:"I need a unique location for..."},{label:"Faction conflict",prompt:"Create tension between factions by..."},{label:"Plot hook",prompt:"Generate a compelling plot hook involving..."}],expand:[{label:"Add history",prompt:"Expand the backstory and history of..."},{label:"Describe appearance",prompt:"Describe in vivid detail how this looks:"},{label:"Add relationships",prompt:"How might this connect to other elements in my world?"},{label:"Cultural details",prompt:"What customs, traditions, or beliefs would exist here?"}],critique:[{label:"Check consistency",prompt:"Review this for internal consistency:"},{label:"Strengthen concept",prompt:"How can I make this more unique or compelling?"},{label:"Find gaps",prompt:"What questions or gaps exist in this concept?"},{label:"Balance check",prompt:"Is this balanced for gameplay? What adjustments?"}]},ge={id:"scribe",label:"Scribe",icon:"✍️",render:async t=>{let e=JSON.parse(localStorage.getItem(Le)||"{}");e.mode||(e.mode="brainstorm"),e.history||(e.history=[]),e.selectedEntries||(e.selectedEntries=[]),e.sessions||(e.sessions={});const i=()=>localStorage.setItem(Le,JSON.stringify(e));await C.init();const s=await C.list(),n=ee();t.innerHTML=`
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
                            ${Ie.map(m=>`
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
                            ${n.map(m=>{const p=s.filter(u=>u.type===m.id);return p.length===0?"":`
                                    <div class="entry-category">
                                        <div class="category-label">${m.icon} ${m.label}</div>
                                        ${p.map(u=>`
                                            <label class="entry-checkbox">
                                                <input type="checkbox" 
                                                    value="${u.id}" 
                                                    ${e.selectedEntries.includes(u.id)?"checked":""}>
                                                <span>${k.escapeHtml(u.data.name||"Untitled")}</span>
                                            </label>
                                        `).join("")}
                                    </div>
                                `}).join("")}
                            ${s.length===0?'<div class="empty-hint">No Library entries yet</div>':""}
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
        `;const a=t.querySelector("#chat-log"),o=t.querySelector("#chat-input"),r=t.querySelector("#btn-send"),l=t.querySelector("#template-select"),h=t.querySelector("#session-select");function c(){const m=Me[e.mode]||[];l.innerHTML='<option value="">📝 Templates...</option>'+m.map((p,u)=>`<option value="${u}">${p.label}</option>`).join("")}c(),l.onchange=()=>{const m=parseInt(l.value);if(!isNaN(m)){const p=Me[e.mode]||[];p[m]&&(o.value=p[m].prompt,o.focus())}l.value=""},t.querySelectorAll(".mode-btn").forEach(m=>{m.onclick=()=>{e.mode=m.dataset.mode,t.querySelectorAll(".mode-btn").forEach(p=>p.classList.remove("active")),m.classList.add("active"),c(),i()}}),t.querySelectorAll(".entry-checkbox input").forEach(m=>{m.onchange=()=>{const p=m.value;m.checked?e.selectedEntries.includes(p)||e.selectedEntries.push(p):e.selectedEntries=e.selectedEntries.filter(u=>u!==p),i()}});function d(){if(e.history.length===0){a.innerHTML=`
                    <div class="chat-empty">
                        <div class="empty-icon">✍️</div>
                        <div class="empty-title">The Scribe</div>
                        <div class="empty-hint">Your AI world-building assistant. Select Library entries for context, then ask for help.</div>
                    </div>
                `;return}a.innerHTML=e.history.map(m=>`
                <div class="chat-bubble ${m.role}">
                    <div class="bubble-content">${k.escapeHtml(m.content).replace(/\n/g,"<br>")}</div>
                    <div class="bubble-meta">
                        <span>${m.role==="user"?"You":"✍️ Scribe"}</span>
                        <button class="btn-copy" data-content="${encodeURIComponent(m.content)}" title="Copy">📋</button>
                    </div>
                </div>
            `).join(""),a.querySelectorAll(".btn-copy").forEach(m=>{m.onclick=()=>{navigator.clipboard.writeText(decodeURIComponent(m.dataset.content))}}),a.scrollTop=a.scrollHeight}d();function f(){Ie.find(p=>p.id===e.mode);let m="You are The Scribe, an expert world-building assistant for tabletop RPG settings. ";if(e.mode==="brainstorm"?m+="Help the user generate creative ideas, explore concepts, and brainstorm possibilities. Be imaginative and offer multiple options.":e.mode==="expand"?m+="Help the user develop and expand existing ideas with rich detail. Add depth, history, and connections.":e.mode==="critique"&&(m+="Provide constructive feedback on the user's ideas. Identify strengths, weaknesses, inconsistencies, and suggest improvements."),e.selectedEntries.length>0){const p=e.selectedEntries.map(u=>s.find(v=>v.id===u)).filter(Boolean);p.length>0&&(m+=`

[WORLD CONTEXT - The user has selected these entries from their world Bible:]
`,p.forEach(u=>{const v=n.find(y=>y.id===u.type);if(m+=`
[${(v==null?void 0:v.label)||u.type}] ${u.data.name||"Untitled"}`,u.data.description){const y=u.data.description.replace(/<[^>]+>/g,"").substring(0,300);m+=`: ${y}`}v!=null&&v.fields&&v.fields.forEach(y=>{u.data[y.key]&&(m+=` | ${y.label}: ${u.data[y.key]}`)}),u.data.relationships&&u.data.relationships.length>0&&(m+=`
  Relationships:`,u.data.relationships.forEach(y=>{const g=s.find(E=>E.id===y.targetId),b=(g==null?void 0:g.data.name)||"(Unknown)",$=y.type||"related to";m+=`
    - ${$}: ${b}`,y.notes&&(m+=` (${y.notes})`)}))}),m+=`
[END CONTEXT]`)}return m}async function w(){const m=o.value.trim();if(!m)return;const p={id:ne(),role:"user",content:m,timestamp:new Date().toISOString()};e.history.push(p),o.value="",d(),i(),r.disabled=!0,r.textContent="Thinking...";try{if(!G.getActiveConfig())throw new Error("No API configuration. Go to Settings to add one.");const v=f(),g=e.history.map(E=>({role:E.role==="user"?"user":"model",content:E.content})).slice(-20),b=await G.generate(v,g),$={id:ne(),role:"model",content:b,timestamp:new Date().toISOString()};e.history.push($),i(),d()}catch(u){console.error("[Scribe]",u),e.history.push({id:ne(),role:"model",content:`[Error: ${u.message}]`,timestamp:new Date().toISOString()}),d()}finally{r.disabled=!1,r.textContent="Send"}}r.onclick=w,o.onkeydown=m=>{m.key==="Enter"&&!m.shiftKey&&(m.preventDefault(),w())},t.querySelector("#btn-clear").onclick=async()=>{await M.confirm("Clear Chat","Clear all messages?")&&(e.history=[],i(),d(),I.show("Chat cleared","success"))},t.querySelector("#btn-save-session").onclick=async()=>{const m=await M.prompt("Session name:",`Session ${Object.keys(e.sessions).length+1}`);m&&(e.sessions[m]={history:[...e.history],mode:e.mode,selectedEntries:[...e.selectedEntries],savedAt:new Date().toISOString()},i(),h.innerHTML='<option value="">-- Sessions --</option>'+Object.keys(e.sessions).map(p=>`<option value="${p}">${p}</option>`).join(""),I.show("Session saved","success"))},t.querySelector("#btn-load-session").onclick=()=>{const m=h.value;if(!m||!e.sessions[m])return;const p=e.sessions[m];e.history=[...p.history],e.mode=p.mode,e.selectedEntries=[...p.selectedEntries],i(),ge.render(t)}}},Ae={id:"export",label:"Export",icon:"📤",render:(t,e)=>{t.innerHTML=`
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
        `;let i="json";const s=t.querySelector("#export-preview"),n=t.querySelector("#btn-export"),a=t.querySelectorAll(".format-btn");a.forEach(l=>{l.onclick=async()=>{a.forEach(h=>h.classList.remove("active")),l.classList.add("active"),i=l.dataset.format,await o()}});async function o(){s.innerHTML='<div class="preview-loading">Generating preview...</div>';try{let l="";switch(i){case"json":const h=await _.toJSON();l=`<pre class="preview-code">${JSON.stringify(h,null,2).substring(0,2e3)}${JSON.stringify(h,null,2).length>2e3?`
...`:""}</pre>`;break;case"markdown":const c=await _.toMarkdown();l=`<pre class="preview-code">${r(c.substring(0,2e3))}${c.length>2e3?`
...`:""}</pre>`;break;case"html":l=`<div class="preview-note">Full HTML document will be downloaded.</div><pre class="preview-code">${r((await _.toHTML()).substring(0,1500))}...</pre>`;break;case"pdf":l=`<div class="preview-note">PDF will open in a print dialog.<br>Use "Save as PDF" in your browser's print options.</div>`;break}s.innerHTML=l}catch(l){s.innerHTML=`<div class="preview-error">Error: ${l.message}</div>`}}n.onclick=async()=>{n.disabled=!0,n.innerText="Exporting...";try{const l=(x.project.title||"samildanach").toLowerCase().replace(/\s+/g,"-");switch(i){case"json":const h=await _.toJSON();_.download(JSON.stringify(h,null,2),`${l}.json`,"application/json");break;case"markdown":const c=await _.toMarkdown();_.download(c,`${l}.md`,"text/markdown");break;case"html":const d=await _.toHTML();_.download(d,`${l}.html`,"text/html");break;case"pdf":await _.printToPDF();break}}catch(l){alert("Export failed: "+l.message)}n.disabled=!1,n.innerText="Download"},o();function r(l){const h=document.createElement("div");return h.textContent=l,h.innerHTML}}},se={id:"settings",label:"Settings",icon:"⚙️",render:(t,e)=>{const i=G.getConfigs(),s=G.getActiveConfig();t.innerHTML=`
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
                            ${i.length===0?`
                                <div class="empty-state">
                                    <div class="empty-icon">🔑</div>
                                    <div class="empty-text">No API configurations yet</div>
                                    <div class="empty-hint">Add a configuration to enable AI features</div>
                                </div>
                            `:i.map(p=>{var u;return`
                                <div class="config-card ${p.id===(s==null?void 0:s.id)?"active":""}" data-id="${p.id}">
                                    <div class="config-info">
                                        <div class="config-name">${k.escapeHtml(p.name||"Unnamed")}</div>
                                        <div class="config-provider">${((u=me.find(v=>v.id===p.provider))==null?void 0:u.label)||k.escapeHtml(p.provider)} • ${k.escapeHtml(p.model)}</div>
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
                    <div id="config-editor" class="config-editor hidden">
                        <div class="editor-content">
                            <h3 class="editor-title">Configuration</h3>
                            
                            <div class="field-group">
                                <label class="field-label">Name</label>
                                <input type="text" id="cfg-name" class="input" placeholder="My API Key">
                            </div>

                            <div class="field-group">
                                <label class="field-label">Provider</label>
                                <select id="cfg-provider" class="input">
                                    ${me.map(p=>`<option value="${p.id}">${p.label}</option>`).join("")}
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

                            <div class="field-group hidden" id="field-baseurl">
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
        `;const n=t.querySelector("#configs-list"),a=t.querySelector("#config-editor"),o=t.querySelector("#cfg-provider"),r=t.querySelector("#cfg-model"),l=t.querySelector("#field-baseurl"),h=t.querySelector("#field-apikey"),c=t.querySelector("#test-result");let d=null;function f(){const p=o.value,u=me.find(v=>v.id===p);r.innerHTML=u.models.map(v=>`<option value="${v}">${v}</option>`).join(""),l.style.display=["kobold","custom"].includes(p)?"block":"none",h.style.display=p==="kobold"?"none":"block"}o.onchange=f,f();function w(p=null){var u;d=(p==null?void 0:p.id)||null,t.querySelector("#cfg-name").value=(p==null?void 0:p.name)||"",o.value=(p==null?void 0:p.provider)||"gemini",f(),r.value=(p==null?void 0:p.model)||((u=r.options[0])==null?void 0:u.value)||"",t.querySelector("#cfg-apikey").value=(p==null?void 0:p.apiKey)||"",t.querySelector("#cfg-baseurl").value=(p==null?void 0:p.baseUrl)||"",c.innerHTML="",a.style.display="flex"}function m(){a.style.display="none",d=null}t.querySelector("#btn-add-config").onclick=()=>w(),t.querySelector("#btn-cancel-config").onclick=m,t.querySelector("#btn-save-config").onclick=()=>{const p={id:d||ne(),name:t.querySelector("#cfg-name").value||"Unnamed",provider:o.value,model:r.value,apiKey:t.querySelector("#cfg-apikey").value,baseUrl:t.querySelector("#cfg-baseurl").value};G.saveConfig(p),G.getConfigs().length===1&&G.setActiveConfig(p.id),m(),se.render(t,e)},t.querySelector("#btn-test-config").onclick=async()=>{const p=t.querySelector("#btn-test-config");p.disabled=!0,p.textContent="Testing...",c.innerHTML='<span class="test-pending">Connecting...</span>';const u={provider:o.value,model:r.value,apiKey:t.querySelector("#cfg-apikey").value,baseUrl:t.querySelector("#cfg-baseurl").value};try{await G.testConfig(u),c.innerHTML='<span class="test-success">✓ Connection successful!</span>'}catch(v){c.innerHTML=`<span class="test-error">✗ ${k.escapeHtml(v.message)}</span>`}p.disabled=!1,p.textContent="Test Connection"},n.querySelectorAll(".config-card").forEach(p=>{const u=p.dataset.id;p.querySelector(".btn-activate").onclick=()=>{G.setActiveConfig(u),se.render(t,e)},p.querySelector(".btn-edit").onclick=()=>{const v=G.getConfigs().find(y=>y.id===u);w(v)},p.querySelector(".btn-delete").onclick=async()=>{await M.confirm("Delete Config","Delete this configuration?")&&(G.deleteConfig(u),se.render(t,e),I.show("Configuration deleted","success"))}})}},fe={divider:!0};async function Je(){console.log(`%c Samildánach v${x.project.version} `,"background: #222; color: #bada55"),A.registerPanel(ue.id,ue),A.registerPanel(S.id,S),A.registerPanel(j.id,j),A.registerPanel("divider1",fe),A.registerPanel(Ee.id,Ee),A.registerPanel(X.id,X),A.registerPanel(Te.id,Te),A.registerPanel("divider2",fe),A.registerPanel(ge.id,ge),A.registerPanel("divider3",fe),A.registerPanel(Ae.id,Ae),A.registerPanel(se.id,se),A.init(),A.activePanelId||A.switchPanel(ue.id);const t=document.getElementById("global-tour-btn");t&&(t.onclick=()=>L.start("getting-started"))}window.addEventListener("DOMContentLoaded",Je);
