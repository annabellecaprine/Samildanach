(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function n(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(i){if(i.ep)return;i.ep=!0;const o=n(i);fetch(i.href,o)}})();const ke="samildanach_state",w={project:{title:"Untitled Setting",author:"",version:"1.0.0",description:"",genre:"",system:""},session:{activePanel:null,activeEntryId:null},cache:{},_subscribers:[],init(){const t=localStorage.getItem(ke);if(t)try{const e=JSON.parse(t);e.project&&Object.assign(this.project,e.project),e.session&&Object.assign(this.session,e.session)}catch(e){console.warn("Failed to restore state:",e)}},save(){const t={project:this.project,session:this.session};localStorage.setItem(ke,JSON.stringify(t))},updateProject(t){Object.assign(this.project,t),this.save(),this._notify("project",this.project)},updateSession(t){Object.assign(this.session,t),this.save(),this._notify("session",this.session)},subscribe(t,e){const n={key:t,callback:e};return this._subscribers.push(n),()=>{const s=this._subscribers.indexOf(n);s>=0&&this._subscribers.splice(s,1)}},_notify(t,e){this._subscribers.filter(n=>n.key===t).forEach(n=>n.callback(e))},exportState(){return{project:{...this.project},session:{...this.session}}},importState(t){t.project&&Object.assign(this.project,t.project),t.session&&Object.assign(this.session,t.session),this.save(),this._notify("project",this.project),this._notify("session",this.session)}},D={panels:{},activePanelId:null,init:function(){w.init(),this.renderSidebar(),this.bindEvents();const t=localStorage.getItem("theme")||"dark";document.documentElement.setAttribute("data-theme",t),w.session.activePanel&&this.panels[w.session.activePanel]&&this.switchPanel(w.session.activePanel)},registerPanel:function(t,e){this.panels[t]=e,this.renderSidebar()},switchPanel:function(t){if(!this.panels[t])return;this.activePanelId=t,w.updateSession({activePanel:t}),document.querySelectorAll(".nav-item").forEach(s=>{s.classList.toggle("active",s.dataset.id===t)});const e=document.getElementById("main-view");e.innerHTML="";const n=document.createElement("div");n.className="panel-container",this.panels[t].render(n,w),e.appendChild(n)},renderSidebar:function(){const t=document.getElementById("nav-list");t&&(t.innerHTML="",Object.keys(this.panels).forEach(e=>{const n=this.panels[e];if(e==="divider"||n.divider){const i=document.createElement("div");i.className="nav-divider",t.appendChild(i);return}const s=document.createElement("div");s.className="nav-item",s.innerHTML=n.icon||"📦",s.title=n.label||e,s.dataset.id=e,s.onclick=()=>this.switchPanel(e),e===this.activePanelId&&s.classList.add("active"),t.appendChild(s)}))},bindEvents:function(){const t=document.getElementById("theme-toggle");t&&(t.onclick=()=>{const e=document.documentElement,s=e.getAttribute("data-theme")==="dark"?"light":"dark";e.setAttribute("data-theme",s),localStorage.setItem("theme",s)})}},I={container:null,show:function(t,e="info",n=3e3){this.ensureContainer();const s=document.createElement("div");s.className=`toast toast-${e}`;const i=this.getIcon(e);s.innerHTML=`
            <div class="toast-icon">${i}</div>
            <div class="toast-message">${t}</div>
            <button class="toast-close">&times;</button>
        `,s.querySelector(".toast-close").onclick=()=>{this.dismiss(s)},n>0&&setTimeout(()=>{this.dismiss(s)},n),this.container.appendChild(s),requestAnimationFrame(()=>{s.classList.add("show")})},dismiss:function(t){t.classList.remove("show"),t.addEventListener("transitionend",()=>{t.parentNode&&t.parentNode.removeChild(t)})},ensureContainer:function(){this.container||(this.container=document.createElement("div"),this.container.className="toast-container",document.body.appendChild(this.container))},getIcon:function(t){switch(t){case"success":return"✅";case"warning":return"⚠️";case"error":return"❌";case"info":default:return"ℹ️"}}};window.Toast=I;const U={generateId:(t="id")=>typeof crypto<"u"&&crypto.randomUUID?`${t}_${crypto.randomUUID().split("-")[0]}`:`${t}_${Math.random().toString(36).substring(2,9)}`,escapeHtml:t=>{const e=document.createElement("div");return e.textContent=t,e.innerHTML},debounce:(t,e=300)=>{let n;return(...s)=>{clearTimeout(n),n=setTimeout(()=>t(...s),e)}},deepClone:t=>JSON.parse(JSON.stringify(t)),formatDate:t=>{const e=new Date(t);return e.toLocaleDateString()+" "+e.toLocaleTimeString()},truncate:(t,e=50)=>!t||t.length<=e?t:t.substring(0,e-3)+"..."},oe=U.generateId,Oe="samildanach_vault",He=1,Y="items",te="registry",ae="vault_registry";let L=null;function Ee(){return{id:ae,lastUpdatedAt:new Date().toISOString(),universes:[],allTags:[],blocks:{},itemCounts:{actor:0,lorebook:0,script:0,location:0,event:0,pair:0}}}const $={init:function(){return new Promise((t,e)=>{if(L){t(L);return}const n=indexedDB.open(Oe,He);n.onerror=s=>{console.error("[VaultDB] Failed to open database:",s.target.error),e(s.target.error)},n.onsuccess=s=>{L=s.target.result,console.log("[VaultDB] Database opened successfully"),t(L)},n.onupgradeneeded=s=>{const i=s.target.result;if(!i.objectStoreNames.contains(Y)){const o=i.createObjectStore(Y,{keyPath:"id"});o.createIndex("type","type",{unique:!1}),o.createIndex("universe","universe",{unique:!1}),o.createIndex("updatedAt","updatedAt",{unique:!1}),console.log("[VaultDB] Items store created")}i.objectStoreNames.contains(te)||(i.createObjectStore(te,{keyPath:"id"}),console.log("[VaultDB] Registry store created"))}})},getRegistry:function(){return new Promise((t,e)=>{if(!L){e(new Error("VaultDB not initialized"));return}const i=L.transaction(te,"readonly").objectStore(te).get(ae);i.onsuccess=()=>{i.result?t(i.result):$.updateRegistry(Ee()).then(t).catch(e)},i.onerror=o=>e(o.target.error)})},updateRegistry:function(t){return new Promise((e,n)=>{if(!L){n(new Error("VaultDB not initialized"));return}const i=L.transaction(te,"readwrite").objectStore(te),o=i.get(ae);o.onsuccess=()=>{const c={...o.result||Ee(),...t,id:ae,lastUpdatedAt:new Date().toISOString()},l=i.put(c);l.onsuccess=()=>e(c),l.onerror=p=>n(p.target.error)},o.onerror=a=>n(a.target.error)})},list:function(t={}){return new Promise((e,n)=>{if(!L){n(new Error("VaultDB not initialized"));return}const i=L.transaction(Y,"readonly").objectStore(Y);let o;t.type?o=i.index("type").openCursor(IDBKeyRange.only(t.type)):t.universe?o=i.index("universe").openCursor(IDBKeyRange.only(t.universe)):o=i.openCursor();const a=[];o.onsuccess=c=>{const l=c.target.result;if(l){const p=l.value;let r=!0;t.type&&p.type!==t.type&&(r=!1),t.universe&&p.universe!==t.universe&&(r=!1),t.tags&&t.tags.length>0&&(t.tags.every(y=>{var S;return(S=p.tags)==null?void 0:S.includes(y)})||(r=!1)),r&&a.push(p),l.continue()}else a.sort((p,r)=>new Date(r.updatedAt).getTime()-new Date(p.updatedAt).getTime()),e(a)},o.onerror=c=>n(c.target.error)})},addItem:function(t,e,n={}){return new Promise((s,i)=>{if(!L){console.error("[VaultDB]AddItem: DB not initialized"),i(new Error("VaultDB not initialized"));return}const o=new Date().toISOString();let a;try{a=U&&U.generateId?U.generateId("vault"):`vault_${crypto.randomUUID()}`}catch(d){console.error("[VaultDB] ID Gen Failed:",d),a="vault_"+Date.now()}const c={id:a,type:t,version:1,universe:n.universe||"",tags:n.tags||[],createdAt:o,updatedAt:o,data:e};console.log("[VaultDB] Adding Item:",c);const r=L.transaction(Y,"readwrite").objectStore(Y).add(c);r.onsuccess=()=>{console.log("[VaultDB] Add Success"),s(c)},r.onerror=d=>{console.error("[VaultDB] Add Failed:",d.target.error),i(d.target.error)}})},updateItem:function(t){return new Promise((e,n)=>{if(!L){n(new Error("VaultDB not initialized"));return}t.updatedAt=new Date().toISOString();const o=L.transaction(Y,"readwrite").objectStore(Y).put(t);o.onsuccess=()=>e(t),o.onerror=a=>n(a.target.error)})},deleteItem:function(t){return new Promise((e,n)=>{if(!L){n(new Error("VaultDB not initialized"));return}const o=L.transaction(Y,"readwrite").objectStore(Y).delete(t);o.onsuccess=()=>e(),o.onerror=a=>n(a.target.error)})}},_e="samildanach_rules",Fe=1,_="rules";let A=null;const P={init:function(){return new Promise((t,e)=>{if(A){t(A);return}const n=indexedDB.open(_e,Fe);n.onerror=s=>{console.error("[RulesDB] Failed to open database:",s.target.error),e(s.target.error)},n.onsuccess=s=>{A=s.target.result,console.log("[RulesDB] Database opened successfully"),t(A)},n.onupgradeneeded=s=>{const i=s.target.result;if(!i.objectStoreNames.contains(_)){const o=i.createObjectStore(_,{keyPath:"id"});o.createIndex("type","type",{unique:!1}),o.createIndex("updatedAt","updatedAt",{unique:!1}),console.log("[RulesDB] Rules store created")}}})},list:function(t={}){return new Promise((e,n)=>{if(!A){n(new Error("RulesDB not initialized"));return}const i=A.transaction(_,"readonly").objectStore(_);let o;t.type?o=i.index("type").openCursor(IDBKeyRange.only(t.type)):o=i.openCursor();const a=[];o.onsuccess=c=>{const l=c.target.result;l?(a.push(l.value),l.continue()):(a.sort((p,r)=>new Date(r.updatedAt).getTime()-new Date(p.updatedAt).getTime()),e(a))},o.onerror=c=>n(c.target.error)})},get:function(t){return new Promise((e,n)=>{if(!A){n(new Error("RulesDB not initialized"));return}const o=A.transaction(_,"readonly").objectStore(_).get(t);o.onsuccess=()=>e(o.result||null),o.onerror=a=>n(a.target.error)})},add:function(t,e){return new Promise((n,s)=>{if(!A){s(new Error("RulesDB not initialized"));return}const i=new Date().toISOString();let o;try{o=U&&U.generateId?U.generateId("rule"):`rule_${crypto.randomUUID().split("-")[0]}`}catch{o="rule_"+Date.now()}const a={id:o,type:t,createdAt:i,updatedAt:i,data:e},p=A.transaction(_,"readwrite").objectStore(_).add(a);p.onsuccess=()=>{console.log("[RulesDB] Added rule:",o),n(a)},p.onerror=r=>{console.error("[RulesDB] Add failed:",r.target.error),s(r.target.error)}})},update:function(t){return new Promise((e,n)=>{if(!A){n(new Error("RulesDB not initialized"));return}t.updatedAt=new Date().toISOString();const o=A.transaction(_,"readwrite").objectStore(_).put(t);o.onsuccess=()=>e(t),o.onerror=a=>n(a.target.error)})},delete:function(t){return new Promise((e,n)=>{if(!A){n(new Error("RulesDB not initialized"));return}const o=A.transaction(_,"readwrite").objectStore(_).delete(t);o.onsuccess=()=>{console.log("[RulesDB] Deleted rule:",t),e()},o.onerror=a=>n(a.target.error)})},exportAll:function(){return this.list()},importAll:function(t){return new Promise(async(e,n)=>{if(!A){n(new Error("RulesDB not initialized"));return}let s=0;for(const i of t)try{const o={...i,id:U.generateId("rule"),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};await this.add(o.type,o.data),s++}catch(o){console.warn("[RulesDB] Import skip:",o)}e(s)})}},Be="samildanach_flows",Ue=1,F="flows";let N=null;const C={init:function(){return new Promise((t,e)=>{if(N){t(N);return}const n=indexedDB.open(Be,Ue);n.onerror=s=>{console.error("[FlowsDB] Failed to open database:",s.target.error),e(s.target.error)},n.onsuccess=s=>{N=s.target.result,console.log("[FlowsDB] Database opened successfully"),t(N)},n.onupgradeneeded=s=>{const i=s.target.result;i.objectStoreNames.contains(F)||(i.createObjectStore(F,{keyPath:"id"}).createIndex("updatedAt","updatedAt",{unique:!1}),console.log("[FlowsDB] Flows store created"))}})},list:function(){return new Promise((t,e)=>{if(!N){e(new Error("FlowsDB not initialized"));return}const i=N.transaction(F,"readonly").objectStore(F).openCursor(),o=[];i.onsuccess=a=>{const c=a.target.result;c?(o.push(c.value),c.continue()):(o.sort((l,p)=>new Date(p.updatedAt).getTime()-new Date(l.updatedAt).getTime()),t(o))},i.onerror=a=>e(a.target.error)})},get:function(t){return new Promise((e,n)=>{if(!N){n(new Error("FlowsDB not initialized"));return}const o=N.transaction(F,"readonly").objectStore(F).get(t);o.onsuccess=()=>e(o.result||null),o.onerror=a=>n(a.target.error)})},create:function(t){return new Promise((e,n)=>{if(!N){n(new Error("FlowsDB not initialized"));return}const s=new Date().toISOString();let i;try{i=U&&U.generateId?U.generateId("flow"):`flow_${crypto.randomUUID().split("-")[0]}`}catch{i="flow_"+Date.now()}const o={id:i,name:t||"Untitled Flow",description:"",createdAt:s,updatedAt:s,version:1,nodes:[],links:[],transform:{x:0,y:0,scale:1},exposedInputs:[],exposedOutputs:[]},l=N.transaction(F,"readwrite").objectStore(F).add(o);l.onsuccess=()=>{console.log("[FlowsDB] Created flow:",i,t),e(o)},l.onerror=p=>{console.error("[FlowsDB] Create failed:",p.target.error),n(p.target.error)}})},update:function(t){return new Promise((e,n)=>{if(!N){n(new Error("FlowsDB not initialized"));return}t.updatedAt=new Date().toISOString(),t.version=(t.version||0)+1,t.exposedInputs=this.computeExposedInputs(t),t.exposedOutputs=this.computeExposedOutputs(t);const o=N.transaction(F,"readwrite").objectStore(F).put(t);o.onsuccess=()=>{console.log("[FlowsDB] Updated flow:",t.id,"v"+t.version),e(t)},o.onerror=a=>n(a.target.error)})},delete:function(t){return new Promise((e,n)=>{if(!N){n(new Error("FlowsDB not initialized"));return}const o=N.transaction(F,"readwrite").objectStore(F).delete(t);o.onsuccess=()=>{console.log("[FlowsDB] Deleted flow:",t),e()},o.onerror=a=>n(a.target.error)})},computeExposedInputs:function(t){const e=[],n=new Set;return(t.links||[]).forEach(s=>{n.add(`${s.to.nodeId}:${s.to.socket}`)}),(t.nodes||[]).forEach(s=>{(s.inputs||[]).forEach(i=>{const o=`${s.id}:${i}`;n.has(o)||e.push({nodeId:s.id,socket:i,label:`${s.title}.${i}`})})}),e},computeExposedOutputs:function(t){const e=[],n=new Set;return(t.links||[]).forEach(s=>{n.add(`${s.from.nodeId}:${s.from.socket}`)}),(t.nodes||[]).forEach(s=>{(s.outputs||[]).forEach(i=>{const o=`${s.id}:${i}`;n.has(o)||e.push({nodeId:s.id,socket:i,label:`${s.title}.${i}`})})}),e}},be={person:{id:"person",label:"Person",icon:"👤",color:"#6366f1",fields:[{key:"role",label:"Role",type:"text"},{key:"affiliation",label:"Affiliation",type:"text"},{key:"motivation",label:"Motivation",type:"text"},{key:"appearance",label:"Appearance",type:"textarea"}]},location:{id:"location",label:"Location",icon:"📍",color:"#22c55e",fields:[{key:"region",label:"Region",type:"text"},{key:"climate",label:"Climate",type:"text"},{key:"pointsOfInterest",label:"Points of Interest",type:"textarea"}]},faction:{id:"faction",label:"Faction",icon:"🏛️",color:"#f59e0b",fields:[{key:"goals",label:"Goals",type:"textarea"},{key:"allies",label:"Allies",type:"text"},{key:"enemies",label:"Enemies",type:"text"}]},concept:{id:"concept",label:"Concept",icon:"💡",color:"#8b5cf6",fields:[{key:"domain",label:"Domain",type:"text"},{key:"principles",label:"Core Principles",type:"textarea"}]},event:{id:"event",label:"Event",icon:"📜",color:"#ef4444",fields:[{key:"era",label:"Era/Date",type:"text"},{key:"participants",label:"Participants",type:"text"},{key:"outcome",label:"Outcome",type:"textarea"}]},item:{id:"item",label:"Item",icon:"🎁",color:"#14b8a6",fields:[{key:"origin",label:"Origin",type:"text"},{key:"properties",label:"Properties",type:"textarea"}]}},Z=t=>be[t]||be.item,se=()=>Object.values(be),Ae=[{id:"item",label:"Item",icon:"⚔️",color:"#f59e0b",description:"Weapons, armor, consumables, and equipment",fields:[{key:"type",label:"Type",placeholder:"weapon, armor, consumable, tool..."},{key:"rarity",label:"Rarity",placeholder:"common, uncommon, rare, legendary..."},{key:"damage",label:"Damage/Effect",placeholder:"1d8 slashing, +2 AC..."},{key:"properties",label:"Properties",placeholder:"versatile, finesse, two-handed..."},{key:"value",label:"Value",placeholder:"50 gold, priceless..."},{key:"weight",label:"Weight",placeholder:"3 lbs, light..."}]},{id:"spell",label:"Spell",icon:"✨",color:"#8b5cf6",description:"Magic spells and mystical abilities",fields:[{key:"level",label:"Level",placeholder:"Cantrip, 1st, 2nd..."},{key:"school",label:"School",placeholder:"Evocation, Necromancy..."},{key:"castTime",label:"Cast Time",placeholder:"1 action, bonus action, ritual..."},{key:"range",label:"Range",placeholder:"60 feet, touch, self..."},{key:"duration",label:"Duration",placeholder:"Instantaneous, 1 minute, concentration..."},{key:"damage",label:"Effect/Damage",placeholder:"3d6 fire, heals 2d8+3..."},{key:"components",label:"Components",placeholder:"V, S, M (a bat guano)..."}]},{id:"ability",label:"Ability",icon:"💪",color:"#ef4444",description:"Class features, racial traits, and special abilities",fields:[{key:"source",label:"Source",placeholder:"Fighter 3, Elf racial, feat..."},{key:"usage",label:"Usage",placeholder:"At will, 1/short rest, 3/long rest..."},{key:"action",label:"Action Cost",placeholder:"Action, bonus action, reaction..."},{key:"effect",label:"Effect",placeholder:"Add 1d6 to attack, advantage on saves..."},{key:"prerequisite",label:"Prerequisite",placeholder:"STR 13, proficiency in..."}]},{id:"condition",label:"Condition",icon:"🔥",color:"#06b6d4",description:"Status effects, buffs, debuffs, and environmental conditions",fields:[{key:"type",label:"Type",placeholder:"debuff, buff, environmental..."},{key:"effect",label:"Effect",placeholder:"Disadvantage on attacks, -2 AC..."},{key:"duration",label:"Duration",placeholder:"1 round, until cured, permanent..."},{key:"removal",label:"Removal",placeholder:"Lesser restoration, DC 15 CON save..."},{key:"stacking",label:"Stacking",placeholder:"Does not stack, stacks to 3..."}]},{id:"rule",label:"Rule",icon:"📜",color:"#22c55e",description:"Custom game rules, house rules, and mechanics",fields:[{key:"category",label:"Category",placeholder:"Combat, exploration, social, rest..."},{key:"trigger",label:"Trigger",placeholder:"When attacking, on critical hit..."},{key:"resolution",label:"Resolution",placeholder:"Roll contested Athletics, DC = 10 + CR..."},{key:"consequences",label:"Consequences",placeholder:"On success... On failure..."}]}];function Me(){return Ae}function Ne(t){return Ae.find(e=>e.id===t)}const re={member_of:{id:"member_of",label:"Member of",icon:"👥",inverse:"has_member",description:"This entry is a member of the target."},has_member:{id:"has_member",label:"Has Member",icon:"👤",inverse:"member_of",description:"The target is a member of this entry."},located_in:{id:"located_in",label:"Located in",icon:"📍",inverse:"contains",description:"This entry is located within the target."},contains:{id:"contains",label:"Contains",icon:"🗺️",inverse:"located_in",description:"This entry contains the target."},ally_of:{id:"ally_of",label:"Ally of",icon:"🤝",inverse:"ally_of",description:"This entry is allied with the target."},enemy_of:{id:"enemy_of",label:"Enemy of",icon:"⚔️",inverse:"enemy_of",description:"This entry is an enemy of the target."},parent_of:{id:"parent_of",label:"Parent of",icon:"👨‍👧",inverse:"child_of",description:"This entry is the parent of the target."},child_of:{id:"child_of",label:"Child of",icon:"👶",inverse:"parent_of",description:"This entry is the child of the target."},related_to:{id:"related_to",label:"Related to",icon:"🔗",inverse:"related_to",description:"Generic relationship."},created_by:{id:"created_by",label:"Created by",icon:"🛠️",inverse:"creator_of",description:"This entry was created by the target."},creator_of:{id:"creator_of",label:"Creator of",icon:"✨",inverse:"created_by",description:"This entry created the target."}},le=t=>re[t]||re.related_to,Ve=()=>Object.values(re),B={async toJSON(){await $.init();const t=await $.list();await P.init();const e=await P.list();await C.init();const n=await C.list();return{meta:{...w.project},entries:t,rules:e,flows:n,exportedAt:new Date().toISOString(),version:"2.0",format:"samildanach-json"}},async toMarkdown(t={}){var a;const{includeRelationships:e=!0}=t;await $.init();const n=await $.list();let s="";s+=`# ${w.project.title||"Untitled Setting"}

`,w.project.author&&(s+=`**Author:** ${w.project.author}

`),w.project.version&&(s+=`**Version:** ${w.project.version}

`),w.project.genre&&(s+=`**Genre:** ${w.project.genre}

`),w.project.system&&(s+=`**System:** ${w.project.system}

`),w.project.description&&(s+=`---

${w.project.description}

`),s+=`---

`;const i=se();for(const c of i){const l=n.filter(p=>p.type===c.id);if(l.length!==0){s+=`## ${c.icon} ${c.label}s

`;for(const p of l){s+=`### ${p.data.name||"Untitled"}

`;for(const r of c.fields){const d=p.data[r.key];d&&(s+=`**${r.label}:** ${d}

`)}if(p.data.description){const r=this._stripHtml(p.data.description);s+=`${r}

`}if(e&&((a=p.data.relationships)==null?void 0:a.length)>0){s+=`**Relationships:**
`;for(const r of p.data.relationships){const d=le(r.type),y=n.find(m=>m.id===r.targetId),S=(y==null?void 0:y.data.name)||"(Unknown)";s+=`- ${d.icon} ${d.label}: ${S}
`}s+=`
`}s+=`---

`}}}await P.init();const o=await P.list();if(o.length>0){s+=`# Grimoire 

`;const c=Me();for(const l of c){const p=o.filter(r=>r.type===l.id);if(p.length!==0){s+=`## ${l.icon} ${l.label}

`;for(const r of p){s+=`### ${r.data.name||"Untitled"}

`;for(const d of l.fields){const y=r.data[d.key];y&&(s+=`**${d.label}:** ${y}

`)}if(r.data.description){const d=this._stripHtml(r.data.description);s+=`${d}

`}s+=`---

`}}}}return s+=`
---
*Exported from Samildánach on ${new Date().toLocaleDateString()}*
`,s},async toHTML(){let e=(await this.toMarkdown()).replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^# (.+)$/gm,"<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/^- (.+)$/gm,"<li>$1</li>").replace(/(<li>.*<\/li>\n)+/g,"<ul>$&</ul>").replace(/^---$/gm,"<hr>").replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br>");return`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${w.project.title||"Samildánach Export"}</title>
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
</html>`},async printToPDF(){const t=await this.toHTML(),e=window.open("","_blank");e.document.write(t),e.document.close(),e.focus(),setTimeout(()=>e.print(),250)},download(t,e,n="text/plain"){const s=new Blob([t],{type:n}),i=URL.createObjectURL(s),o=document.createElement("a");o.href=i,o.download=e,o.click(),URL.revokeObjectURL(i)},_stripHtml(t){const e=document.createElement("div");return e.innerHTML=t,e.querySelectorAll(".wiki-link").forEach(n=>{n.replaceWith(n.dataset.link||n.textContent)}),e.textContent||e.innerText||""}},T={active:!1,currentStep:0,currentConfig:null,els:{},configs:{},register:function(t,e){this.configs[t]=e},start:function(t){const e=this.configs[t];if(!e||!e.length){console.warn(`Tour "${t}" not found.`);return}this.currentConfig=e,this.currentStep=0,this.active=!0,this.createOverlay(),this.renderStep(),document.addEventListener("keydown",this.handleKey),window.addEventListener("resize",this.handleResize),window.addEventListener("scroll",this.handleScroll,{capture:!0})},end:function(){this.active=!1,this.currentConfig=null,this.currentStep=0,this.removeOverlay(),document.removeEventListener("keydown",this.handleKey),window.removeEventListener("resize",this.handleResize),window.removeEventListener("scroll",this.handleScroll,{capture:!0})},createOverlay:function(){if(this.els.overlay)return;const t=document.createElement("div");t.className="tour-overlay",t.innerHTML=`
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
        `,document.body.appendChild(t),this.els={overlay:t,highlight:t.querySelector(".tour-highlight"),popup:t.querySelector(".tour-popup"),title:t.querySelector("#tour-title"),content:t.querySelector("#tour-content"),progress:t.querySelector("#tour-progress"),btnPrev:t.querySelector("#tour-prev"),btnNext:t.querySelector("#tour-next"),btnClose:t.querySelector("#tour-close")},this.els.btnClose.onclick=()=>this.end(),this.els.btnPrev.onclick=()=>this.prev(),this.els.btnNext.onclick=()=>this.next()},removeOverlay:function(){this.els.overlay&&(this.els.overlay.remove(),this.els={})},renderStep:function(){if(!this.active||!this.currentConfig)return;const t=this.currentConfig[this.currentStep],e=document.querySelector(t.target);e||console.warn(`Tour target "${t.target}" not found.`),this.els.title.innerText=t.title,this.els.content.innerHTML=t.content,this.els.progress.innerText=`${this.currentStep+1} / ${this.currentConfig.length}`,this.els.btnPrev.disabled=this.currentStep===0,this.els.btnNext.innerText=this.currentStep===this.currentConfig.length-1?"Finish":"Next",this.positionOverlay(e)},positionOverlay:function(t){if(!t){this.els.highlight.style.opacity="0",this.centerPopup();return}t.scrollIntoView({behavior:"smooth",block:"center"}),setTimeout(()=>{const e=t.getBoundingClientRect(),n=4;this.els.highlight.style.width=`${e.width+n*2}px`,this.els.highlight.style.height=`${e.height+n*2}px`,this.els.highlight.style.top=`${e.top-n}px`,this.els.highlight.style.left=`${e.left-n}px`,this.els.highlight.style.opacity="1",this.placePopup(e)},100)},placePopup:function(t){const e=this.els.popup,n=e.getBoundingClientRect(),s=16,i=window.innerWidth,o=window.innerHeight;let a,c;if(t.right+n.width+s<i)a=t.top,c=t.right+s;else if(t.left-n.width-s>0)a=t.top,c=t.left-n.width-s;else if(t.bottom+n.height+s<o)a=t.bottom+s,c=t.left;else if(t.top-n.height-s>0)a=t.top-n.height-s,c=t.left;else{this.centerPopup();return}a<s&&(a=s),c<s&&(c=s),a+n.height>o-s&&(a=o-s-n.height),c+n.width>i-s&&(c=i-s-n.width),e.style.top=`${a}px`,e.style.left=`${c}px`,e.style.transform="none"},centerPopup:function(){const t=this.els.popup;t.style.top="50%",t.style.left="50%",t.style.transform="translate(-50%, -50%)"},next:function(){this.currentStep<this.currentConfig.length-1?(this.currentStep++,this.renderStep()):this.end()},prev:function(){this.currentStep>0&&(this.currentStep--,this.renderStep())},handleKey:function(t){T.active&&(t.key==="Escape"&&T.end(),t.key==="ArrowRight"&&T.next(),t.key==="ArrowLeft"&&T.prev())},handleResize:function(){T.active&&T.renderStep()},handleScroll:function(){}};T.handleKey=T.handleKey.bind(T);T.handleResize=T.handleResize.bind(T);T.handleScroll=T.handleScroll.bind(T);T.register("getting-started",[{target:'.nav-item[data-id="project"]',title:"Project Home",content:"Your command center. Manage project details, import/export data, and see an overview of your world."},{target:'.nav-item[data-id="library"]',title:"The Library",content:"A taxonomical database for your world. Create and organize Stories, Characters, Locations, and Items."},{target:'.nav-item[data-id="grimoire"]',title:"The Grimoire",content:"Define the Rules of your system. Create Spells, Feats, and Abilities with custom data fields."},{target:'.nav-item[data-id="architect"]',title:"The Architect",content:"A powerful Visual Node Editor. Design logic flows, encounter structures, and complex systems."},{target:'.nav-item[data-id="laboratory"]',title:"The Laboratory",content:"Test and balance your mechanics. Roll dice, run probability simulations, and compare math."},{target:'.nav-item[data-id="scribe"]',title:"The Scribe",content:"AI-assisted world-building. Chat with an AI that knows your library to brainstorm and expand your ideas."},{target:'.nav-item[data-id="export"]',title:"System Tools",content:"Export your entire project to JSON/Markdown, configure LLM settings, and manage themes."}]);const pe={id:"project",label:"Project",icon:"🏠",render:async(t,e)=>{try{await $.init()}catch(c){t.innerHTML=`<div class="text-muted">Vault Error: ${c.message}</div>`;return}const n=await $.list(),s={};se().forEach(c=>{s[c.id]=n.filter(l=>l.type===c.id).length});const i=n.reduce((c,l)=>{var p;return c+(((p=l.data.relationships)==null?void 0:p.length)||0)},0);t.innerHTML=`
            <div class="project-layout">
                <div class="project-content">
                    
                    <!-- Header -->
                    <div class="project-header flex justify-between items-center">
                        <div class="flex items-center gap-md flex-1">
                            <div class="project-icon">📖</div>
                            <input id="proj-title" type="text" value="${w.project.title}" 
                                placeholder="Setting Title" class="project-title flex-1">
                        </div>
                        <div class="project-author" style="margin-right: 16px;">
                            <input id="proj-author" type="text" value="${w.project.author}" 
                                placeholder="Author Name">
                        </div>
                        <button id="btn-tour" class="btn btn-secondary btn-sm">Start Tour 🚩</button>
                    </div>

                    <!-- Stats Cards -->
                    <div class="stats-grid">
                        ${se().map(c=>`
                            <div class="stat-card" style="border-left-color: ${c.color};">
                                <div class="stat-icon">${c.icon}</div>
                                <div class="stat-value">${s[c.id]||0}</div>
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
                                <input id="proj-version" type="text" value="${w.project.version}" class="input">
                            </div>
                            <div class="detail-field">
                                <label class="label">Genre</label>
                                <input id="proj-genre" type="text" value="${w.project.genre}" 
                                    placeholder="Fantasy, Sci-Fi, Horror..." class="input">
                            </div>
                        </div>
                        
                        <div class="detail-field">
                            <label class="label">Compatible Game System</label>
                            <input id="proj-system" type="text" value="${w.project.system}" 
                                placeholder="D&D 5e, Pathfinder 2e, Fate Core..." class="input">
                        </div>

                        <div class="detail-field" style="margin-top: 16px;">
                            <label class="label">Description</label>
                            <textarea id="proj-description" rows="4" 
                                placeholder="Describe your setting..." class="textarea">${w.project.description}</textarea>
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
        `;const o=()=>{w.updateProject({title:t.querySelector("#proj-title").value,author:t.querySelector("#proj-author").value,version:t.querySelector("#proj-version").value,genre:t.querySelector("#proj-genre").value,system:t.querySelector("#proj-system").value,description:t.querySelector("#proj-description").value})};t.querySelectorAll("input, textarea").forEach(c=>{c.oninput=o}),t.querySelector("#btn-tour").onclick=()=>{T.start("getting-started")},t.querySelector("#btn-export").onclick=async()=>{try{const c=(w.project.title||"samildanach").toLowerCase().replace(/\s+/g,"-"),l=await B.toJSON();B.download(JSON.stringify(l,null,2),`${c}.json`,"application/json"),I.show("Project exported successfully","success")}catch(c){I.show("Export failed: "+c.message,"error")}};const a=t.querySelector("#import-file");t.querySelector("#btn-import").onclick=()=>a.click(),a.onchange=async c=>{const l=c.target.files[0];if(l)try{const p=await l.text(),r=JSON.parse(p);let d={entries:0,rules:0,flows:0};if(r.meta&&w.updateProject(r.meta),r.entries&&Array.isArray(r.entries)){await $.init();for(const y of r.entries)await $.addItem(y.type,y.data);d.entries=r.entries.length}if(r.rules&&Array.isArray(r.rules)){await P.init();for(const y of r.rules)await P.add(y.type,y.data);d.rules=r.rules.length}if(r.flows&&Array.isArray(r.flows)){await C.init();for(const y of r.flows)await C.update(y);d.flows=r.flows.length}I.show(`Imported: ${d.entries} Items, ${d.rules} Rules, ${d.flows} Flows`,"success"),setTimeout(()=>location.reload(),1500)}catch(p){console.error(p),I.show("Import failed: "+p.message,"error")}}}};class q{constructor(e={}){this.title=e.title||"Modal",this.content=e.content||"",this.actions=e.actions||[],this.onClose=e.onClose||null,this.element=null}show(){this.element=document.createElement("div"),this.element.className="modal-overlay",this.element.innerHTML=`
            <div class="modal-content">
                <h3 class="modal-title">${this.title}</h3>
                <div class="modal-body"></div>
                <div class="modal-actions"></div>
            </div>
        `;const e=this.element.querySelector(".modal-body");typeof this.content=="string"?e.innerHTML=this.content:this.content instanceof HTMLElement&&e.appendChild(this.content);const n=this.element.querySelector(".modal-actions");this.actions.forEach(s=>{const i=document.createElement("button");i.className=s.className||"btn btn-secondary",i.innerText=s.label,i.onclick=()=>{s.onClick&&s.onClick(this)},n.appendChild(i)}),this.element.onclick=s=>{s.target===this.element&&this.close()},document.body.appendChild(this.element)}close(){this.element&&(this.element.remove(),this.element=null),this.onClose&&this.onClose()}getBody(){var e;return(e=this.element)==null?void 0:e.querySelector(".modal-body")}static confirm(e,n){return new Promise(s=>{const i=new q({title:e,content:`<p>${n}</p>`,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:()=>{i.close(),s(!1)}},{label:"Confirm",className:"btn btn-primary",onClick:()=>{i.close(),s(!0)}}]});i.show()})}static alert(e,n){return new Promise(s=>{const i=new q({title:e,content:`<p>${n}</p>`,actions:[{label:"OK",className:"btn btn-primary",onClick:()=>{i.close(),s()}}]});i.show()})}static prompt(e,n=""){return new Promise(s=>{const i=document.createElement("div");i.innerHTML=`
                <input type="text" class="input" style="width:100%" value="${n}">
            `;const o=i.querySelector("input"),a=new q({title:e,content:i,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:()=>{a.close(),s(null)}},{label:"OK",className:"btn btn-primary",onClick:()=>{a.close(),s(o.value)}}]});a.show(),setTimeout(()=>o.focus(),50),o.onkeydown=c=>{c.key==="Enter"&&(a.close(),s(o.value))}})}}class We{constructor(e,n={}){this.container=e,this.items=[],this.activeCategory=null,this.activeItemId=null,this.onSelect=n.onSelect||null,this.onCreate=n.onCreate||null}setItems(e){this.items=e,this.render()}setActiveItem(e){this.activeItemId=e,this.renderList()}render(){this.container.innerHTML=`
            <div id="category-tabs" class="library-tabs"></div>
            <div class="library-search-bar">
                <input id="lib-search" type="text" placeholder="Search..." class="input">
                <button id="lib-add-btn" class="btn btn-primary">+</button>
            </div>
            <div id="lib-list" class="library-list"></div>
        `,this.tabsEl=this.container.querySelector("#category-tabs"),this.searchInput=this.container.querySelector("#lib-search"),this.listEl=this.container.querySelector("#lib-list"),this.addBtn=this.container.querySelector("#lib-add-btn"),this.renderTabs(),this.renderList(),this.searchInput.oninput=()=>this.renderList(),this.addBtn.onclick=()=>{this.onCreate&&this.onCreate()}}renderTabs(){this.tabsEl.innerHTML="";const e=document.createElement("button");e.innerText="All",e.className="tab"+(this.activeCategory===null?" active":""),e.onclick=()=>{this.activeCategory=null,this.renderTabs(),this.renderList()},this.tabsEl.appendChild(e),se().forEach(n=>{const s=document.createElement("button");s.innerText=`${n.icon} ${n.label}`,s.className="tab"+(this.activeCategory===n.id?" active":""),this.activeCategory===n.id&&(s.style.background=n.color,s.style.borderColor=n.color),s.onclick=()=>{this.activeCategory=n.id,this.renderTabs(),this.renderList()},this.tabsEl.appendChild(s)})}renderList(){var i;if(!this.listEl)return;this.listEl.innerHTML="";const e=((i=this.searchInput)==null?void 0:i.value.toLowerCase())||"",n=this.activeCategory,s=this.items.filter(o=>{const a=(o.data.name||"").toLowerCase().includes(e),c=n?o.type===n:!0;return a&&c});if(s.length===0){this.listEl.innerHTML='<div class="library-list-empty">No entries found.</div>';return}s.forEach(o=>{const a=Z(o.type),c=this.activeItemId===o.id,l=document.createElement("div");l.className="list-item"+(c?" active":""),l.innerHTML=`
                <span>${a.icon}</span>
                <span class="flex-1" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${o.data.name||"Untitled"}</span>
            `,l.onclick=()=>{this.onSelect&&this.onSelect(o)},this.listEl.appendChild(l)})}}class Pe{constructor(e,n="",s={}){this.container=e,this.value=n,this.onChange=null,this.onLinkClick=s.onLinkClick||null,this.getEntries=s.getEntries||(()=>[])}render(){this.container.innerHTML=`
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
        `,this.editor=this.container.querySelector(".rte-content"),this.autocomplete=this.container.querySelector(".rte-autocomplete"),this.bindEvents()}renderWithLinks(e){return e.replace(/\[\[([^\]]+)\]\]/g,(n,s)=>`<span class="wiki-link" data-link="${s}">[[${s}]]</span>`)}extractRawText(e){const n=document.createElement("div");return n.innerHTML=e,n.querySelectorAll(".wiki-link").forEach(s=>{s.replaceWith(`[[${s.dataset.link}]]`)}),n.innerHTML}bindEvents(){this.container.querySelectorAll("button[data-cmd]").forEach(e=>{e.onclick=n=>{n.preventDefault();const s=e.dataset.cmd;s==="link"?this.insertLinkPlaceholder():s==="h2"||s==="h3"?document.execCommand("formatBlock",!1,s):document.execCommand(s,!1,null),this.editor.focus()}}),this.editor.oninput=()=>{this.checkForAutocomplete(),this.value=this.extractRawText(this.editor.innerHTML),this.onChange&&this.onChange(this.value)},this.editor.onclick=e=>{if(e.target.classList.contains("wiki-link")){const n=e.target.dataset.link;this.onLinkClick&&this.onLinkClick(n)}},this.editor.onkeydown=e=>{if(this.autocomplete.style.display!=="none")if(e.key==="ArrowDown"||e.key==="ArrowUp")e.preventDefault(),this.navigateAutocomplete(e.key==="ArrowDown"?1:-1);else if(e.key==="Enter"||e.key==="Tab"){const n=this.autocomplete.querySelector(".selected");n&&(e.preventDefault(),this.selectAutocompleteItem(n.dataset.name))}else e.key==="Escape"&&this.hideAutocomplete()},this.editor.onblur=()=>{setTimeout(()=>this.hideAutocomplete(),150)}}insertLinkPlaceholder(){document.execCommand("insertText",!1,"[[]]");const e=window.getSelection();if(e.rangeCount){const n=e.getRangeAt(0);n.setStart(n.startContainer,n.startOffset-2),n.collapse(!0),e.removeAllRanges(),e.addRange(n)}}checkForAutocomplete(){const e=window.getSelection();if(!e.rangeCount)return;const n=e.getRangeAt(0),s=n.startContainer;if(s.nodeType!==Node.TEXT_NODE)return;const o=s.textContent.substring(0,n.startOffset).match(/\[\[([^\]]*?)$/);if(o){const a=o[1].toLowerCase(),c=this.getEntries().filter(l=>(l.data.name||"").toLowerCase().includes(a)).slice(0,8);c.length>0?this.showAutocomplete(c):this.hideAutocomplete()}else this.hideAutocomplete()}showAutocomplete(e){this.autocomplete.innerHTML="",e.forEach((n,s)=>{const i=document.createElement("div");i.dataset.name=n.data.name,i.className="rte-autocomplete-item"+(s===0?" selected":""),i.innerText=n.data.name||"Untitled",i.onmousedown=o=>{o.preventDefault(),this.selectAutocompleteItem(n.data.name)},this.autocomplete.appendChild(i)}),this.autocomplete.style.display="block",this.autocomplete.style.left="16px",this.autocomplete.style.bottom="16px"}hideAutocomplete(){this.autocomplete.style.display="none"}navigateAutocomplete(e){var o,a;const n=Array.from(this.autocomplete.children),s=n.findIndex(c=>c.classList.contains("selected"));(o=n[s])==null||o.classList.remove("selected");const i=Math.max(0,Math.min(n.length-1,s+e));(a=n[i])==null||a.classList.add("selected")}selectAutocompleteItem(e){const n=window.getSelection();if(!n.rangeCount)return;const s=n.getRangeAt(0),i=s.startContainer;if(i.nodeType!==Node.TEXT_NODE)return;const o=i.textContent,a=o.substring(0,s.startOffset);if(a.match(/\[\[([^\]]*?)$/)){const l=a.lastIndexOf("[["),p=o.substring(s.startOffset),r=p.indexOf("]]"),d=r>=0?p.substring(r+2):p,y=document.createElement("span");y.className="wiki-link",y.dataset.link=e,y.innerText=`[[${e}]]`;const S=document.createTextNode(o.substring(0,l)),m=document.createTextNode(" "+d),h=i.parentNode;h.insertBefore(S,i),h.insertBefore(y,i),h.insertBefore(m,i),h.removeChild(i);const u=document.createRange();u.setStartAfter(y),u.collapse(!0),n.removeAllRanges(),n.addRange(u)}this.hideAutocomplete(),this.value=this.extractRawText(this.editor.innerHTML),this.onChange&&this.onChange(this.value)}getValue(){return this.extractRawText(this.editor.innerHTML)}setValue(e){this.value=e,this.editor&&(this.editor.innerHTML=this.renderWithLinks(e))}}class Ge{constructor(e,n={}){this.container=e,this.item=null,this.onSave=n.onSave||null,this.onNameChange=n.onNameChange||null,this.onLinkClick=n.onLinkClick||null,this.onDelete=n.onDelete||null,this.getEntries=n.getEntries||(()=>[]),this.editorInstance=null}setItem(e){this.item=e,e?this.render():this.showEmpty()}showEmpty(){this.container.innerHTML=`
            <div class="empty-state">
                <h2>Select an entry</h2>
                <p>Or create a new one to start building your world.</p>
            </div>
        `}render(){if(!this.item)return this.showEmpty();const e=Z(this.item.type);this.container.innerHTML=`
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
        `;const n=this.container.querySelector("#asset-title"),s=this.container.querySelector("#metadata-fields"),i=this.container.querySelector("#asset-rte-mount");this.container.querySelector("#save-status"),e.fields.forEach(l=>{const p=document.createElement("div");p.className="metadata-field";const r=document.createElement("label");r.innerText=l.label,r.className="label";let d;l.type==="textarea"?(d=document.createElement("textarea"),d.rows=2,d.className="textarea"):(d=document.createElement("input"),d.type="text",d.className="input"),d.value=this.item.data[l.key]||"",d.oninput=()=>{this.item.data[l.key]=d.value,this.save()},p.appendChild(r),p.appendChild(d),s.appendChild(p)});const o=new Pe(i,this.item.data.description||"",{getEntries:this.getEntries,onLinkClick:this.onLinkClick});o.render(),this.editorInstance=o,o.onChange=l=>{this.item.data.description=l,this.save()};let a=null;n.oninput=()=>{this.item.data.name=n.value,this.save(),clearTimeout(a),a=setTimeout(()=>{this.onNameChange&&this.onNameChange(this.item)},300)};const c=this.container.querySelector("#btn-delete-entry");c&&(c.onclick=async()=>{if(await q.confirm("Delete Entry",`Are you sure you want to delete "${this.item.data.name||"this entry"}"?`)&&this.onDelete)try{await this.onDelete(this.item),I.show("Entry deleted","success")}catch{I.show("Failed to delete entry","error")}})}async save(){const e=this.container.querySelector("#save-status");e&&(e.innerText="Saving..."),this.onSave&&await this.onSave(this.item),e&&(e.innerText="Saved")}}class ze{constructor(e,n={}){this.container=e,this.item=null,this.allItems=[],this.onSave=n.onSave||null,this.onNavigate=n.onNavigate||null}setItem(e,n){this.item=e,this.allItems=n,e&&this.render()}render(){this.item&&(this.item.data.relationships||(this.item.data.relationships=[]),this.container.innerHTML=`
            <div class="relationships-header">
                <div class="label">Relationships</div>
                <button id="add-relationship-btn" class="btn btn-primary" style="padding:4px 10px; font-size:11px;">+ Add</button>
            </div>
            <div id="relationships-list" class="relationships-list"></div>
            <div id="back-references" class="back-references"></div>
        `,this.renderRelationships(),this.container.querySelector("#add-relationship-btn").onclick=()=>this.showAddModal())}renderRelationships(){const e=this.container.querySelector("#relationships-list"),n=this.container.querySelector("#back-references");e.innerHTML="",this.item.data.relationships.length===0?e.innerHTML='<div class="text-muted text-sm">No relationships defined.</div>':(this.item.data.relationships.forEach((i,o)=>{const a=le(i.type),c=this.allItems.find(d=>d.id===i.targetId),l=c?c.data.name||"Untitled":"(Deleted)",p=c?Z(c.type):{icon:"❓"},r=document.createElement("div");r.className="relationship-row",r.innerHTML=`
                    <span>${a.icon}</span>
                    <span class="relationship-type">${a.label}</span>
                    <span class="relationship-target" data-id="${i.targetId}">${p.icon} ${l}</span>
                    <button class="relationship-delete" data-idx="${o}">×</button>
                `,e.appendChild(r)}),e.querySelectorAll(".relationship-target").forEach(i=>{i.onclick=()=>{const o=this.allItems.find(a=>a.id===i.dataset.id);o&&this.onNavigate&&this.onNavigate(o)}}),e.querySelectorAll(".relationship-delete").forEach(i=>{i.onclick=()=>{this.item.data.relationships.splice(parseInt(i.dataset.idx),1),this.onSave&&this.onSave(this.item),this.renderRelationships()}}));const s=this.allItems.filter(i=>{var o;return i.id!==this.item.id&&((o=i.data.relationships)==null?void 0:o.some(a=>a.targetId===this.item.id))});n.innerHTML="",s.length===0?n.innerHTML='<div class="text-muted text-xs">No incoming references.</div>':(n.innerHTML='<div class="back-ref-label">Referenced by:</div>',s.forEach(i=>{const o=Z(i.type);i.data.relationships.filter(c=>c.targetId===this.item.id).forEach(c=>{const l=le(c.type),p=re[l.inverse],r=document.createElement("div");r.className="back-ref-item",r.innerHTML=`<span>${o.icon}</span> ${i.data.name||"Untitled"} <span class="text-muted">(${(p==null?void 0:p.label)||l.label})</span>`,r.onclick=()=>{this.onNavigate&&this.onNavigate(i)},n.appendChild(r)})}))}showAddModal(){const e=document.createElement("div");e.className="flex flex-col gap-md",e.innerHTML=`
            <div>
                <label class="label">Type</label>
                <select id="rel-type-select" class="input" style="width:100%; margin-top:4px;"></select>
            </div>
            <div>
                <label class="label">Target Entry</label>
                <select id="rel-target-select" class="input" style="width:100%; margin-top:4px;"></select>
            </div>
        `,new q({title:"Add Relationship",content:e,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:o=>o.close()},{label:"Add",className:"btn btn-primary",onClick:o=>{const a=e.querySelector("#rel-type-select"),c=e.querySelector("#rel-target-select"),l=a.value,p=c.value;l&&p&&(this.item.data.relationships.push({type:l,targetId:p}),this.onSave&&this.onSave(this.item),this.renderRelationships()),o.close()}}]}).show();const s=e.querySelector("#rel-type-select"),i=e.querySelector("#rel-target-select");Ve().forEach(o=>{const a=document.createElement("option");a.value=o.id,a.innerText=`${o.icon} ${o.label}`,s.appendChild(a)}),this.allItems.filter(o=>o.id!==this.item.id).forEach(o=>{const a=Z(o.type),c=document.createElement("option");c.value=o.id,c.innerText=`${a.icon} ${o.data.name||"Untitled"}`,i.appendChild(c)})}}const x={id:"library",label:"Library",icon:"📚",entryList:null,entryEditor:null,relationshipManager:null,allItems:[],activeItem:null,render:async(t,e)=>{try{await $.init()}catch(o){t.innerHTML=`<div class="text-muted">Vault Error: ${o.message}</div>`;return}t.innerHTML=`
            <div class="library-layout">
                <div id="lib-sidebar" class="library-sidebar"></div>
                <div id="lib-main" class="library-main">
                    <div id="lib-editor-area"></div>
                    <div id="lib-relationships-area" class="relationships-section" style="display:none;"></div>
                </div>
            </div>
        `;const n=t.querySelector("#lib-sidebar"),s=t.querySelector("#lib-editor-area"),i=t.querySelector("#lib-relationships-area");if(x.allItems=await $.list(),x.entryList=new We(n,{onSelect:o=>x.selectItem(o,s,i),onCreate:()=>x.showCreateModal()}),x.entryList.setItems(x.allItems),x.entryEditor=new Ge(s,{onSave:async o=>{await $.updateItem(o)},onNameChange:o=>{x.entryList.setItems(x.allItems)},onLinkClick:o=>{const a=x.allItems.find(c=>(c.data.name||"").toLowerCase()===o.toLowerCase());a&&x.selectItem(a,s,i)},onDelete:async o=>{await $.deleteItem(o.id),x.allItems=x.allItems.filter(a=>a.id!==o.id),x.entryList.setItems(x.allItems),x.entryEditor.showEmpty(),i.style.display="none",w.updateSession({activeEntryId:null})},getEntries:()=>x.allItems}),x.entryEditor.showEmpty(),x.relationshipManager=new ze(i,{onSave:async o=>{await $.updateItem(o)},onNavigate:o=>{x.selectItem(o,s,i)}}),w.session.activeEntryId){const o=x.allItems.find(a=>a.id===w.session.activeEntryId);o&&x.selectItem(o,s,i)}},selectItem(t,e,n){x.activeItem=t,x.entryList.setActiveItem(t.id),x.entryEditor.setItem(t),n.style.display="block",x.relationshipManager.setItem(t,x.allItems),w.updateSession({activeEntryId:t.id})},showCreateModal(){const t=document.createElement("div");t.className="grid-3",se().forEach(n=>{const s=document.createElement("button");s.className="btn btn-secondary",s.style.cssText="flex-direction:column; padding:12px;",s.innerHTML=`<span style="font-size:20px;">${n.icon}</span><span class="text-xs">${n.label}</span>`,s.onclick=async()=>{e.close();const i=await $.addItem(n.id,{name:`New ${n.label}`,description:""});x.allItems.push(i),x.entryList.setItems(x.allItems);const o=document.querySelector("#lib-editor-area"),a=document.querySelector("#lib-relationships-area");x.selectItem(i,o,a)},t.appendChild(s)});const e=new q({title:"Create New Entry",content:t,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:n=>n.close()}]});e.show()}},j={id:"grimoire",label:"Grimoire",icon:"📖",_state:{activeCategory:"item",selectedRuleId:null,searchQuery:""},render:async t=>{var p;await P.init();let e=await P.list();const n=Me();let s=j._state.activeCategory||((p=n[0])==null?void 0:p.id)||"item",i=j._state.selectedRuleId,o=i?e.find(r=>r.id===i):null,a=j._state.searchQuery||"",c=null;async function l(){var S,m,h;e=await P.list(),o=i?e.find(u=>u.id===i):null;const r=Ne(s);let d=e.filter(u=>u.type===s);if(a){const u=a.toLowerCase();d=d.filter(b=>(b.data.name||"").toLowerCase().includes(u)||(b.data.description||"").toLowerCase().includes(u)||Object.values(b.data).some(f=>typeof f=="string"&&f.toLowerCase().includes(u)))}t.innerHTML=`
                <div class="grimoire-layout">
                    <!-- Left: Categories + List -->
                    <div class="grimoire-sidebar">
                        <div class="sidebar-header">
                            <strong>📖 Grimoire</strong>
                        </div>

                        <!-- Category Tabs -->
                        <div class="category-tabs">
                            ${n.map(u=>`
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
                                   placeholder="Search ${(r==null?void 0:r.label)||"rules"}..." 
                                   value="${a}">
                        </div>

                        <!-- Rule List -->
                        <div class="rule-list">
                            ${d.length===0?`
                                <div class="empty-state">
                                    <div class="empty-icon">${a?"🔍":(r==null?void 0:r.icon)||"📖"}</div>
                                    <div class="empty-text">${a?"No matches":`No ${(r==null?void 0:r.label)||"rules"} yet`}</div>
                                </div>
                            `:d.map(u=>`
                                <div class="rule-item ${(o==null?void 0:o.id)===u.id?"selected":""}" data-id="${u.id}">
                                    <div class="rule-icon" style="color: ${r==null?void 0:r.color}">${r==null?void 0:r.icon}</div>
                                    <div class="rule-info">
                                        <div class="rule-name">${u.data.name||"Untitled"}</div>
                                        <div class="rule-meta">${u.data.type||u.data.level||""}</div>
                                    </div>
                                </div>
                            `).join("")}
                        </div>

                        <div class="sidebar-footer">
                            <button id="btn-add-rule" class="btn btn-primary btn-sm">+ Add ${(r==null?void 0:r.label)||"Rule"}</button>
                        </div>
                    </div>

                    <!-- Right: Editor -->
                    <div class="grimoire-main">
                        ${o?`
                            <div class="rule-editor">
                                <div class="editor-header">
                                    <input type="text" id="rule-name" class="input input-lg" 
                                           value="${o.data.name||""}" 
                                           placeholder="${(r==null?void 0:r.label)||"Rule"} Name">
                                    <button id="btn-delete-rule" class="btn btn-ghost btn-sm" title="Delete">🗑️</button>
                                </div>

                                <div class="editor-fields">
                                    ${((r==null?void 0:r.fields)||[]).map(u=>`
                                        <div class="field-group">
                                            <label class="field-label">${u.label}</label>
                                            <input type="text" 
                                                   class="input field-input" 
                                                   data-field="${u.key}"
                                                   value="${o.data[u.key]||""}"
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
                                <div class="empty-text">Select or create a ${(r==null?void 0:r.label)||"rule"}</div>
                            </div>
                        `}
                    </div>
                </div>
            `,t.querySelectorAll(".cat-tab").forEach(u=>{u.onclick=()=>{s=u.dataset.cat,i=null,o=null,a="",j._state.activeCategory=s,j._state.selectedRuleId=null,j._state.searchQuery="",l()}});const y=t.querySelector("#grimoire-search");if(y&&(y.oninput=u=>{a=u.target.value,j._state.searchQuery=a,l().then(()=>{const b=t.querySelector("#grimoire-search");b&&(b.focus(),b.setSelectionRange(b.value.length,b.value.length))})}),t.querySelectorAll(".rule-item").forEach(u=>{u.onclick=()=>{i=u.dataset.id,o=e.find(b=>b.id===i),j._state.selectedRuleId=i,l()}}),(S=t.querySelector("#btn-add-rule"))==null||S.addEventListener("click",async()=>{const u=await P.add(s,{name:`New ${(r==null?void 0:r.label)||"Rule"}`,description:""});console.log("[Grimoire] Created rule:",u.id),i=u.id,j._state.selectedRuleId=i,a="",j._state.searchQuery="",l()}),(m=t.querySelector("#btn-delete-rule"))==null||m.addEventListener("click",async()=>{!o||!await q.confirm("Delete Rule",`Delete "${o.data.name||"this rule"}"?`)||(await P.delete(o.id),I.show("Rule deleted","success"),i=null,o=null,j._state.selectedRuleId=null,l())}),(h=t.querySelector("#btn-save-rule"))==null||h.addEventListener("click",async()=>{var f;if(!o)return;const b={name:((f=t.querySelector("#rule-name"))==null?void 0:f.value)||""};t.querySelectorAll(".field-input").forEach(g=>{b[g.dataset.field]=g.value}),c&&(b.description=c.getValue()),o.data=b,await P.update(o),I.show("Rule saved","success"),l()}),o){const u=t.querySelector("#description-editor");u&&(c=new Pe(u,o.data.description||""),c.render())}}await l()}},$e={id:"graph",label:"Graph",icon:"🕸️",render:async(t,e)=>{try{await $.init()}catch(f){t.innerHTML=`<div class="text-muted">Vault Error: ${f.message}</div>`;return}t.style.padding="0",t.innerHTML=`
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
        `;const n=t.querySelector("#graph-container"),s=t.querySelector("#graph-canvas"),i=s.getContext("2d"),o=()=>{s.width=n.clientWidth,s.height=n.clientHeight};o(),window.addEventListener("resize",o);const a=await $.list(),c=a.map((f,g)=>{const v=Z(f.type),k=g/a.length*Math.PI*2,E=Math.min(s.width,s.height)*.3;return{id:f.id,item:f,label:f.data.name||"Untitled",icon:v.icon,color:v.color,x:s.width/2+Math.cos(k)*E,y:s.height/2+Math.sin(k)*E,vx:0,vy:0}}),l=Object.fromEntries(c.map(f=>[f.id,f])),p=[];a.forEach(f=>{(f.data.relationships||[]).forEach(g=>{if(l[g.targetId]){const v=le(g.type);p.push({from:f.id,to:g.targetId,label:v.label,color:v.icon})}})});let r={x:0,y:0,scale:1},d=!1,y={x:0,y:0},S=null;const m=()=>{i.clearRect(0,0,s.width,s.height),i.save(),i.translate(r.x,r.y),i.scale(r.scale,r.scale),i.lineWidth=2,p.forEach(f=>{const g=l[f.from],v=l[f.to];g&&v&&(i.strokeStyle="rgba(100, 116, 139, 0.5)",i.beginPath(),i.moveTo(g.x,g.y),i.lineTo(v.x,v.y),i.stroke())}),c.forEach(f=>{i.fillStyle=f.color||"#6366f1",i.beginPath(),i.arc(f.x,f.y,24,0,Math.PI*2),i.fill(),i.font="16px sans-serif",i.textAlign="center",i.textBaseline="middle",i.fillStyle="#fff",i.fillText(f.icon,f.x,f.y),i.font="11px sans-serif",i.fillStyle="var(--text-primary)",i.fillText(f.label,f.x,f.y+36)}),i.restore()},h=()=>{const f=s.width/2,g=s.height/2;c.forEach(v=>{c.forEach(k=>{if(v.id===k.id)return;const E=v.x-k.x,V=v.y-k.y,O=Math.sqrt(E*E+V*V)||1,W=5e3/(O*O);v.vx+=E/O*W,v.vy+=V/O*W}),v.vx+=(f-v.x)*.001,v.vy+=(g-v.y)*.001}),p.forEach(v=>{const k=l[v.from],E=l[v.to];if(k&&E){const V=E.x-k.x,O=E.y-k.y,W=Math.sqrt(V*V+O*O)||1,X=(W-150)*.01;k.vx+=V/W*X,k.vy+=O/W*X,E.vx-=V/W*X,E.vy-=O/W*X}}),c.forEach(v=>{S!==v&&(v.x+=v.vx*.1,v.y+=v.vy*.1),v.vx*=.9,v.vy*=.9}),m(),requestAnimationFrame(h)};h();const u=f=>({x:(f.offsetX-r.x)/r.scale,y:(f.offsetY-r.y)/r.scale}),b=(f,g)=>c.find(v=>{const k=v.x-f,E=v.y-g;return Math.sqrt(k*k+E*E)<24});s.onmousedown=f=>{const g=u(f),v=b(g.x,g.y);v?S=v:(d=!0,y={x:f.clientX,y:f.clientY})},s.onmousemove=f=>{if(S){const g=u(f);S.x=g.x,S.y=g.y}else d&&(r.x+=f.clientX-y.x,r.y+=f.clientY-y.y,y={x:f.clientX,y:f.clientY})},s.onmouseup=()=>{S=null,d=!1},s.onwheel=f=>{f.preventDefault();const g=f.deltaY>0?.9:1.1;r.scale*=g,r.scale=Math.min(Math.max(.3,r.scale),3)},t.querySelector("#graph-reset").onclick=()=>{r={x:0,y:0,scale:1}},t.querySelector("#graph-relayout").onclick=()=>{c.forEach((f,g)=>{const v=g/c.length*Math.PI*2,k=Math.min(s.width,s.height)*.3;f.x=s.width/2+Math.cos(v)*k,f.y=s.height/2+Math.sin(v)*k,f.vx=0,f.vy=0})}}};class Ye{constructor(e,n,s){this.container=e,this.nodeLayer=n,this.svgLayer=s,this.nodes=[],this.links=[],this.transform={x:0,y:0,scale:1},this.isDragging=!1,this.lastMouse={x:0,y:0},this.isWiring=!1,this.wireFrom=null,this.wireLine=null,this.selectedLink=null,this.onDataChange=null}init(){this.container.onmousedown=e=>{(e.button===1||e.button===0&&e.altKey)&&(this.isDragging=!0,this.lastMouse={x:e.clientX,y:e.clientY},this.container.style.cursor="grabbing",e.preventDefault())},this.container.onmousemove=e=>{if(this.isDragging){const n=e.clientX-this.lastMouse.x,s=e.clientY-this.lastMouse.y;this.transform.x+=n,this.transform.y+=s,this.lastMouse={x:e.clientX,y:e.clientY},this.updateTransform()}if(this.isWiring&&this.wireLine){const n=this.container.getBoundingClientRect(),s=e.clientX-n.left,i=e.clientY-n.top;this.updateWirePreview(s,i)}},this.container.onmouseup=e=>{this.isDragging=!1,this.container.style.cursor="default",this.isWiring&&this.cancelWiring()},this.container.onwheel=e=>{e.preventDefault();const n=e.deltaY>0?.9:1.1;this.transform.scale*=n,this.transform.scale=Math.min(Math.max(.2,this.transform.scale),2),this.updateTransform()},window.addEventListener("keydown",e=>{e.key==="Delete"&&this.selectedLink&&(this.deleteLink(this.selectedLink),this.selectedLink=null)})}exportData(){return{nodes:this.nodes,links:this.links,transform:this.transform}}importData(e){e&&(this.nodes=[],this.links=[],this.nodeLayer.innerHTML="",e.transform&&(this.transform=e.transform,this.updateTransform()),e.nodes&&e.nodes.forEach(n=>this.addNode(n,!0)),this.links=e.links||[],this.updateLinks())}notifyChange(){this.onDataChange&&this.onDataChange(this.exportData())}updateTransform(){this.nodeLayer.style.transform=`translate(${this.transform.x}px, ${this.transform.y}px) scale(${this.transform.scale})`,this.updateLinks()}resetView(){this.transform={x:0,y:0,scale:1},this.updateTransform()}addNode(e,n=!1){this.nodes.push(e);const s=this.renderNodeElement(e);this.nodeLayer.appendChild(s),n||this.notifyChange()}renderNodeElement(e){const n=document.createElement("div");n.className="node"+(e.type?` ${e.type}`:""),n.id=e.id,n.style.left=e.x+"px",n.style.top=e.y+"px";let s=(e.inputs||[]).map(d=>`
            <div class="socket-row">
                <div class="socket input" 
                     data-node-id="${e.id}" 
                     data-socket-type="input" 
                     data-socket-name="${d}" 
                     title="${d}"></div>
                <span>${d}</span>
            </div>
        `).join(""),i=(e.outputs||[]).map(d=>`
            <div class="socket-row" style="justify-content: flex-end;">
                <span>${d}</span>
                <div class="socket output" 
                     data-node-id="${e.id}" 
                     data-socket-type="output" 
                     data-socket-name="${d}" 
                     title="${d}"></div>
            </div>
        `).join("");n.innerHTML=`
            <div class="node-header">${e.title}</div>
            <div class="node-body">
                ${s}
                ${i}
            </div>
        `;const o=n.querySelector(".node-header");let a=!1,c={x:0,y:0},l={x:e.x,y:e.y};o.onmousedown=d=>{d.button===0&&(a=!0,c={x:d.clientX,y:d.clientY},l={x:e.x,y:e.y},n.classList.add("selected"),d.stopPropagation())};const p=d=>{if(a){const y=(d.clientX-c.x)/this.transform.scale,S=(d.clientY-c.y)/this.transform.scale;e.x=l.x+y,e.y=l.y+S,n.style.left=e.x+"px",n.style.top=e.y+"px",this.updateLinks()}},r=()=>{a&&(a=!1,n.classList.remove("selected"),this.notifyChange())};return window.addEventListener("mousemove",p),window.addEventListener("mouseup",r),n.querySelectorAll(".socket").forEach(d=>{d.onmousedown=y=>{y.stopPropagation(),this.startWiring(d)},d.onmouseup=y=>{y.stopPropagation(),this.isWiring&&this.completeWiring(d)}}),n}startWiring(e){const n=e.dataset.nodeId,s=e.dataset.socketType,i=e.dataset.socketName;this.isWiring=!0,this.wireFrom={nodeId:n,socket:i,type:s,element:e},this.wireLine=document.createElementNS("http://www.w3.org/2000/svg","path"),this.wireLine.setAttribute("class","connection-line wiring"),this.svgLayer.appendChild(this.wireLine),e.classList.add("wiring")}updateWirePreview(e,n){if(!this.wireFrom||!this.wireLine)return;const s=this.getSocketPosition(this.wireFrom.element),i=s.x,o=s.y,a=e,c=n,l=this.wireFrom.type==="output"?i+50:i-50,p=this.wireFrom.type==="output"?a-50:a+50,r=`M ${i} ${o} C ${l} ${o}, ${p} ${c}, ${a} ${c}`;this.wireLine.setAttribute("d",r)}completeWiring(e){if(!this.wireFrom)return;const n=e.dataset.nodeId,s=e.dataset.socketType,i=e.dataset.socketName;if(this.wireFrom.type===s){console.log("[Canvas] Cannot connect same socket types"),this.cancelWiring();return}if(this.wireFrom.nodeId===n){console.log("[Canvas] Cannot connect node to itself"),this.cancelWiring();return}let o,a;if(this.wireFrom.type==="output"?(o={nodeId:this.wireFrom.nodeId,socket:this.wireFrom.socket},a={nodeId:n,socket:i}):(o={nodeId:n,socket:i},a={nodeId:this.wireFrom.nodeId,socket:this.wireFrom.socket}),!this.links.some(l=>l.from.nodeId===o.nodeId&&l.from.socket===o.socket&&l.to.nodeId===a.nodeId&&l.to.socket===a.socket)){const l={id:"link_"+Date.now(),from:o,to:a};this.links.push(l),console.log("[Canvas] Created link:",l),this.notifyChange()}this.cancelWiring(),this.updateLinks()}cancelWiring(){var e;this.wireLine&&(this.wireLine.remove(),this.wireLine=null),(e=this.wireFrom)!=null&&e.element&&this.wireFrom.element.classList.remove("wiring"),this.isWiring=!1,this.wireFrom=null}getSocketPosition(e){const n=this.container.getBoundingClientRect(),s=e.getBoundingClientRect();return{x:s.left+s.width/2-n.left,y:s.top+s.height/2-n.top}}deleteLink(e){const n=this.links.findIndex(s=>s.id===e);n>=0&&(this.links.splice(n,1),this.updateLinks(),this.notifyChange())}updateLinks(){this.svgLayer.innerHTML="",this.links.forEach(e=>{const n=this.nodeLayer.querySelector(`#${e.from.nodeId}`),s=this.nodeLayer.querySelector(`#${e.to.nodeId}`);if(!n||!s)return;const i=n.querySelector(`.socket.output[data-socket-name="${e.from.socket}"]`),o=s.querySelector(`.socket.input[data-socket-name="${e.to.socket}"]`);if(!i||!o)return;const a=this.getSocketPosition(i),c=this.getSocketPosition(o),l=document.createElementNS("http://www.w3.org/2000/svg","path"),p=a.x+50,r=c.x-50,d=`M ${a.x} ${a.y} C ${p} ${a.y}, ${r} ${c.y}, ${c.x} ${c.y}`;l.setAttribute("d",d),l.setAttribute("class","connection-line"+(e.id===this.selectedLink?" selected":"")),l.dataset.linkId=e.id,l.onclick=y=>{y.stopPropagation(),this.selectedLink=e.id,this.updateLinks()},this.svgLayer.appendChild(l)})}}const Ce={event:{id:"event",label:"Event",icon:"⚡",color:"#4ade80",description:'Triggers like "On Combat Start", "On Turn Begin"',templates:[{title:"On Start",outputs:["next"]},{title:"On Turn Begin",outputs:["next"]},{title:"On Attack",inputs:["attacker","target"],outputs:["next"]},{title:"On Damage",inputs:["target","amount"],outputs:["next"]}]},condition:{id:"condition",label:"Condition",icon:"❓",color:"#facc15",description:"If/else branching logic",templates:[{title:"If Greater Than",inputs:["a","b"],outputs:["true","false"]},{title:"If Equal",inputs:["a","b"],outputs:["true","false"]},{title:"If Has Tag",inputs:["target","tag"],outputs:["true","false"]},{title:"Compare Roll",inputs:["roll","dc"],outputs:["success","failure"]}]},action:{id:"action",label:"Action",icon:"🎲",color:"#60a5fa",description:"Roll dice, modify values, apply effects",templates:[{title:"Roll Dice",inputs:["expression"],outputs:["result","next"]},{title:"Add Value",inputs:["a","b"],outputs:["result"]},{title:"Apply Damage",inputs:["target","amount"],outputs:["next"]},{title:"Set Variable",inputs:["name","value"],outputs:["next"]}]},reference:{id:"reference",label:"Library",icon:"📚",color:"#c084fc",description:"Link to Library entries (lore, characters, locations)",templates:[]},rules:{id:"rules",label:"Rules",icon:"📖",color:"#f59e0b",description:"Link to Grimoire entries (items, spells, abilities)",templates:[]},compound:{id:"compound",label:"Flows",icon:"📦",color:"#06b6d4",description:"Reuse entire flows as single nodes",templates:[]}};class Ke{constructor(e={}){this.onSelect=e.onSelect||null}async show(){const e=document.createElement("div");e.className="node-picker";const n=document.createElement("div");n.className="library-tabs",n.style.marginBottom="16px";const s=document.createElement("div");s.className="node-picker-panels";const i=async a=>{n.querySelectorAll(".tab").forEach(l=>{l.classList.toggle("active",l.dataset.type===a)}),s.innerHTML="";const c=Ce[a];if(a==="reference"){await $.init();const l=await $.list();if(l.length===0){s.innerHTML='<div class="text-muted">No Library entries. Create entries in the Library first.</div>';return}const p=document.createElement("div");p.className="grid-2",p.style.gap="8px",l.forEach(r=>{const d=Z(r.type),y=document.createElement("button");y.className="btn btn-secondary",y.style.cssText="justify-content:flex-start; padding:8px 12px; text-align:left;",y.innerHTML=`<span style="margin-right:8px;">${(d==null?void 0:d.icon)||"📄"}</span> ${r.data.name||"Untitled"}`,y.onclick=()=>{this.onSelect&&this.onSelect({type:"reference",title:`📚 ${r.data.name||"Untitled"}`,entryId:r.id,entryType:r.type,inputs:["in"],outputs:["out","data"]}),o.close()},p.appendChild(y)}),s.appendChild(p)}else if(a==="rules"){await P.init();const l=await P.list();if(l.length===0){s.innerHTML='<div class="text-muted">No Grimoire entries. Create rules in the Grimoire first.</div>';return}const p=document.createElement("div");p.className="grid-2",p.style.gap="8px",l.forEach(r=>{const d=Ne(r.type),y=document.createElement("button");y.className="btn btn-secondary",y.style.cssText="justify-content:flex-start; padding:8px 12px; text-align:left;",y.innerHTML=`<span style="margin-right:8px;">${(d==null?void 0:d.icon)||"📖"}</span> ${r.data.name||"Untitled"}`,y.onclick=()=>{this.onSelect&&this.onSelect({type:"rules",title:`📖 ${r.data.name||"Untitled"}`,ruleId:r.id,ruleType:r.type,inputs:["in"],outputs:["out","effect"]}),o.close()},p.appendChild(y)}),s.appendChild(p)}else if(a==="compound"){await C.init();const l=await C.list();if(l.length===0){s.innerHTML='<div class="text-muted">No saved flows found. Create a flow first.</div>';return}const p=document.createElement("div");p.className="grid-2",p.style.gap="8px",l.forEach(r=>{const d=document.createElement("button");d.className="btn btn-secondary",d.style.cssText="justify-content:flex-start; padding:8px 12px; text-align:left;",d.innerHTML=`<span style="margin-right:8px;">📦</span> ${r.name}`,d.onclick=()=>{this.onSelect&&this.onSelect({type:"compound",title:`📦 ${r.name}`,flowId:r.id,inputs:(r.exposedInputs||[]).map(y=>y.label||y.socket),outputs:(r.exposedOutputs||[]).map(y=>y.label||y.socket)}),o.close()},p.appendChild(d)}),s.appendChild(p)}else{const l=document.createElement("div");l.className="grid-2",l.style.gap="8px",c.templates.forEach(p=>{const r=document.createElement("button");r.className="btn btn-secondary",r.style.cssText="justify-content:flex-start; padding:8px 12px;",r.innerHTML=`<span style="margin-right:8px;">${c.icon}</span> ${p.title}`,r.onclick=()=>{this.onSelect&&this.onSelect({type:a,title:p.title,inputs:p.inputs||[],outputs:p.outputs||[]}),o.close()},l.appendChild(r)}),s.appendChild(l)}};Object.values(Ce).forEach(a=>{const c=document.createElement("button");c.className="tab",c.dataset.type=a.id,c.innerHTML=`${a.icon} ${a.label}`,c.onclick=()=>i(a.id),n.appendChild(c)}),e.appendChild(n),e.appendChild(s);const o=new q({title:"Add Node",content:e,actions:[{label:"Cancel",className:"btn btn-secondary",onClick:a=>a.close()}]});o.show(),await i("event")}}const Q={id:"architect",label:"Architect",icon:"📐",_state:{activeFlowId:null},render:async(t,e)=>{t.style.padding="0",await C.init();let n=await C.list(),s=Q._state.activeFlowId;(!s||!n.find(c=>c.id===s))&&(n.length===0&&(n=[await C.create("Main Flow")]),s=n[0].id,Q._state.activeFlowId=s);let i=await C.get(s),o=null;async function a(){n=await C.list(),i=await C.get(s),t.innerHTML=`
                <div class="architect-workspace" id="arch-workspace">
                    <div class="connection-layer" id="arch-connections">
                        <svg width="100%" height="100%" id="arch-svg"></svg>
                    </div>
                    <div class="node-layer" id="arch-nodes"></div>
                    
                    <div class="architect-toolbar">
                        <div class="toolbar-group">
                            <select id="flow-selector" class="input input-sm">
                                ${n.map(d=>`
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
            `;const c=t.querySelector("#arch-workspace"),l=t.querySelector("#arch-nodes"),p=t.querySelector("#arch-svg");o=new Ye(c,l,p),o.init(),i&&o.importData({nodes:i.nodes||[],links:i.links||[],transform:i.transform||{x:0,y:0,scale:1}}),o.onDataChange=async d=>{i&&(i.nodes=d.nodes,i.links=d.links,i.transform=d.transform,await C.update(i))},t.querySelector("#flow-selector").onchange=async d=>{s=d.target.value,Q._state.activeFlowId=s,a()},t.querySelector("#btn-new-flow").onclick=async()=>{const d=await q.prompt("Flow name:","New Flow");if(!d)return;s=(await C.create(d)).id,Q._state.activeFlowId=s,a()},t.querySelector("#btn-rename-flow").onclick=async()=>{if(!i)return;const d=await q.prompt("Rename flow:",i.name);d&&(i.name=d,await C.update(i),a())},t.querySelector("#btn-delete-flow").onclick=async()=>{var y;if(!i)return;if(n.length<=1){I.show("Cannot delete the last flow.","warning");return}await q.confirm("Delete Flow",`Delete "${i.name}"?`)&&(await C.delete(i.id),n=await C.list(),s=(y=n[0])==null?void 0:y.id,Q._state.activeFlowId=s,a(),I.show("Flow deleted","success"))};const r=new Ke({onSelect:d=>{o.addNode({id:U.generateId("node"),x:100+Math.random()*100,y:100+Math.random()*100,type:d.type,title:d.title,inputs:d.inputs||[],outputs:d.outputs||[],entryId:d.entryId||null,entryType:d.entryType||null,ruleId:d.ruleId||null,ruleType:d.ruleType||null,flowId:d.flowId||null})}});t.querySelector("#btn-add-node").onclick=()=>{r.show()},t.querySelector("#btn-reset-view").onclick=()=>{o.resetView()},t.querySelector("#btn-clear-all").onclick=async()=>{await q.confirm("Clear Nodes","Clear all nodes in this flow?")&&(o.nodes=[],o.links=[],l.innerHTML="",p.innerHTML="",o.notifyChange(),I.show("Flow cleared","success"))}}await a()}},ve={parse(t){const e=t.trim().match(/^(\d+)?d(\d+)([+-]\d+)?$/i);return e?{count:parseInt(e[1])||1,sides:parseInt(e[2]),modifier:parseInt(e[3])||0}:null},rollOne(t){return Math.floor(Math.random()*t)+1},rollMany(t,e){const n=[];for(let s=0;s<t;s++)n.push(this.rollOne(e));return n},roll(t){const e=this.parse(t);if(!e)return{error:"Invalid format. Use NdX or NdX+Y (e.g., 2d6+3)"};const n=this.rollMany(e.count,e.sides),s=n.reduce((o,a)=>o+a,0),i=s+e.modifier;return{expression:t,rolls:n,subtotal:s,modifier:e.modifier,total:i}},format(t){if(t.error)return t.error;let e=`[${t.rolls.join(", ")}]`;return t.modifier!==0&&(e+=` ${t.modifier>0?"+":""}${t.modifier}`),e+=` = ${t.total}`,e},stats(t){const e=this.parse(t);if(!e)return null;const n=e.count+e.modifier,s=e.count*e.sides+e.modifier,i=(n+s)/2;return{min:n,max:s,average:i.toFixed(1)}}},he={runDiceSimulation(t,e=1e3){const n=[],s={};for(let h=0;h<e;h++){const u=ve.roll(t);if(u.error)return{error:u.error};n.push(u.total),s[u.total]=(s[u.total]||0)+1}const i=[...n].sort((h,u)=>h-u),a=n.reduce((h,u)=>h+u,0)/e,l=n.map(h=>Math.pow(h-a,2)).reduce((h,u)=>h+u,0)/e,p=Math.sqrt(l);let r=null,d=0;for(const[h,u]of Object.entries(s))u>d&&(d=u,r=parseInt(h));const y=e%2===0?(i[e/2-1]+i[e/2])/2:i[Math.floor(e/2)],S=i[Math.floor(e*.25)],m=i[Math.floor(e*.75)];return{expression:t,iterations:e,results:n,distribution:s,stats:{min:i[0],max:i[i.length-1],mean:a.toFixed(2),median:y,mode:r,stdDev:p.toFixed(2),p25:S,p75:m}}},getHistogramData(t){if(t.error)return[];const{distribution:e,iterations:n,stats:s}=t,i=[];for(let o=s.min;o<=s.max;o++){const a=e[o]||0;i.push({value:o,count:a,percentage:(a/n*100).toFixed(1)})}return i},compare(t,e,n=1e3){const s=this.runDiceSimulation(t,n),i=this.runDiceSimulation(e,n);if(s.error||i.error)return{error:s.error||i.error};let o=0,a=0,c=0;for(let l=0;l<n;l++)s.results[l]>i.results[l]?o++:i.results[l]>s.results[l]?a++:c++;return{expr1:{expression:t,stats:s.stats},expr2:{expression:e,stats:i.stats},comparison:{wins1:o,wins2:a,ties:c,win1Pct:(o/n*100).toFixed(1),win2Pct:(a/n*100).toFixed(1),tiePct:(c/n*100).toFixed(1)}}}},Te={id:"laboratory",label:"Laboratory",icon:"🧪",render:(t,e)=>{t.innerHTML=`
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
        `;const n=t.querySelector("#lab-expr"),s=t.querySelector("#lab-roll"),i=t.querySelector("#lab-result"),o=t.querySelector("#lab-stats");n.oninput=()=>{const h=ve.stats(n.value);h?o.innerText=`Range: ${h.min}–${h.max} | Average: ${h.average}`:o.innerText=""},n.oninput(),s.onclick=()=>{const h=n.value.trim();if(!h)return;const u=ve.roll(h);u.error?i.innerHTML=`<span style="color:var(--status-error);">${u.error}</span>`:i.innerHTML=`
                    <div><strong>Rolls:</strong> [${u.rolls.join(", ")}]</div>
                    ${u.modifier!==0?`<div><strong>Modifier:</strong> ${u.modifier>0?"+":""}${u.modifier}</div>`:""}
                    <div class="roll-total"><strong>Total:</strong> ${u.total}</div>
                `},n.onkeydown=h=>{h.key==="Enter"&&s.onclick()};const a=t.querySelector("#sim-expr"),c=t.querySelector("#sim-iterations"),l=t.querySelector("#sim-run"),p=t.querySelector("#sim-results"),r=t.querySelector("#histogram");l.onclick=()=>{const h=a.value.trim(),u=parseInt(c.value);h&&(l.disabled=!0,l.innerText="Running...",setTimeout(()=>{const b=he.runDiceSimulation(h,u);if(l.disabled=!1,l.innerText="Run",b.error){p.style.display="none",I.show(b.error,"error");return}p.style.display="block",t.querySelector("#stat-min").innerText=b.stats.min,t.querySelector("#stat-max").innerText=b.stats.max,t.querySelector("#stat-mean").innerText=b.stats.mean,t.querySelector("#stat-median").innerText=b.stats.median,t.querySelector("#stat-mode").innerText=b.stats.mode,t.querySelector("#stat-stddev").innerText=b.stats.stdDev;const f=he.getHistogramData(b),g=Math.max(...f.map(v=>v.count));r.innerHTML=f.map(v=>`
                    <div class="hist-bar-container">
                        <div class="hist-bar" style="height: ${v.count/g*100}%;" title="${v.value}: ${v.count} (${v.percentage}%)"></div>
                        <span class="hist-label">${v.value}</span>
                    </div>
                `).join("")},10))};const d=t.querySelector("#cmp-expr1"),y=t.querySelector("#cmp-expr2"),S=t.querySelector("#cmp-run"),m=t.querySelector("#cmp-results");S.onclick=()=>{const h=d.value.trim(),u=y.value.trim();if(!h||!u)return;const b=he.compare(h,u,1e3);if(b.error){m.style.display="none",I.show(b.error,"error");return}m.style.display="block",m.innerHTML=`
                <div class="compare-stat">
                    <strong>${h}</strong> wins <span class="highlight">${b.comparison.win1Pct}%</span> of the time
                    <small>(avg: ${b.expr1.stats.mean})</small>
                </div>
                <div class="compare-stat">
                    <strong>${u}</strong> wins <span class="highlight">${b.comparison.win2Pct}%</span> of the time
                    <small>(avg: ${b.expr2.stats.mean})</small>
                </div>
                <div class="compare-stat tie">
                    Ties: ${b.comparison.tiePct}%
                </div>
            `}}},me="samildanach_llm_configs",ie="samildanach_active_config_id",G={getConfigs(){return JSON.parse(localStorage.getItem(me)||"[]")},saveConfig(t){const e=this.getConfigs(),n=e.findIndex(s=>s.id===t.id);n>=0?e[n]=t:e.push(t),localStorage.setItem(me,JSON.stringify(e))},deleteConfig(t){const e=this.getConfigs().filter(n=>n.id!==t);localStorage.setItem(me,JSON.stringify(e)),localStorage.getItem(ie)===t&&localStorage.removeItem(ie)},getActiveConfig(){const t=this.getConfigs(),e=localStorage.getItem(ie);return t.find(n=>n.id===e)||t[0]||null},setActiveConfig(t){localStorage.setItem(ie,t)},async generate(t,e,n={}){var p,r,d,y,S,m,h,u,b,f,g,v,k,E,V,O,W,X;const i={...this.getActiveConfig()||{},...n},o=i.provider||"gemini",a=i.model||"gemini-1.5-flash",c=i.apiKey||"",l=i.maxTokens||4096;if(!c&&o!=="kobold")throw new Error(`Missing API Key for ${o}. Please configure in Settings.`);if(o==="gemini"){const K=`https://generativelanguage.googleapis.com/v1beta/models/${a}:generateContent?key=${c}`,R={contents:e.map(H=>({role:H.role==="user"?"user":"model",parts:[{text:H.content}]})),generationConfig:{temperature:.9,maxOutputTokens:l}};t&&(R.systemInstruction={parts:[{text:t}]});const M=await fetch(K,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(R)});if(!M.ok){const H=await M.json();throw new Error(((p=H.error)==null?void 0:p.message)||M.statusText)}return((m=(S=(y=(d=(r=(await M.json()).candidates)==null?void 0:r[0])==null?void 0:d.content)==null?void 0:y.parts)==null?void 0:S[0])==null?void 0:m.text)||"(No response)"}if(["openai","openrouter","chutes","custom"].includes(o)){let K="https://api.openai.com/v1/chat/completions";o==="openrouter"&&(K="https://openrouter.ai/api/v1/chat/completions"),o==="chutes"&&(K="https://llm.chutes.ai/v1/chat/completions"),o==="custom"&&(K=`${(i.baseUrl||"https://api.example.com/v1").replace(/\/$/,"")}/chat/completions`);const ee=[{role:"system",content:t},...e.map(J=>({role:J.role==="model"?"assistant":J.role,content:J.content}))],R={"Content-Type":"application/json",Authorization:`Bearer ${c}`};o==="openrouter"&&(R["HTTP-Referer"]="https://samildanach.app",R["X-Title"]="Samildánach");let M=l,z=0;const H=1;for(;z<=H;){const J=await fetch(K,{method:"POST",headers:R,body:JSON.stringify({model:a,messages:ee,temperature:.9,max_tokens:M})});if(!J.ok){const Se=((h=(await J.json()).error)==null?void 0:h.message)||J.statusText,de=Se.match(/maximum context length is (\d+) tokens.*requested about (\d+) tokens.*\((\d+) in the messages/);if(de&&z<H){const Re=parseInt(de[1]),je=parseInt(de[3]),ue=Re-je-200;if(ue>0){console.warn(`[LLM] Context limit exceeded. Auto-scaling max_tokens from ${M} to ${ue}.`),M=ue,z++;continue}}throw new Error(Se)}const we=await J.json();let ce=((f=(b=(u=we.choices)==null?void 0:u[0])==null?void 0:b.message)==null?void 0:f.content)||"";const xe=(k=(v=(g=we.choices)==null?void 0:g[0])==null?void 0:v.message)==null?void 0:k.reasoning_content;return xe&&(ce=`<think>${xe}</think>
${ce}`),ce||"(No response)"}}if(o==="anthropic"){const K="https://api.anthropic.com/v1/messages",ee=e.map(z=>({role:z.role==="model"?"assistant":"user",content:z.content})),R=await fetch(K,{method:"POST",headers:{"x-api-key":c,"anthropic-version":"2023-06-01","content-type":"application/json","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:a,max_tokens:l,system:t,messages:ee,temperature:.9})});if(!R.ok){const z=await R.json();throw new Error(((E=z.error)==null?void 0:E.message)||R.statusText)}return((O=(V=(await R.json()).content)==null?void 0:V[0])==null?void 0:O.text)||"(No response)"}if(o==="kobold"){const ee=`${(i.baseUrl||"http://localhost:5001").replace(/\/$/,"")}/api/v1/generate`,R=`${t}

${e.map(H=>`${H.role==="user"?"User":"Assistant"}: ${H.content}`).join(`
`)}`,M=await fetch(ee,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:R,max_context_length:4096,max_length:l>2048?2048:l,temperature:.9})});if(!M.ok){const H=await M.text();throw new Error(`Kobold Error: ${H||M.statusText}`)}return((X=(W=(await M.json()).results)==null?void 0:W[0])==null?void 0:X.text)||"(No response)"}throw new Error(`Unknown provider: ${o}`)},async testConfig(t){try{return await this.generate("You are a test assistant.",[{role:"user",content:'Say "Hello" in one word.'}],t),!0}catch(e){throw e}}},fe=[{id:"gemini",label:"Google Gemini",models:["gemini-1.5-flash","gemini-1.5-pro","gemini-2.0-flash"]},{id:"openai",label:"OpenAI",models:["gpt-4o","gpt-4o-mini","gpt-4-turbo","gpt-3.5-turbo"]},{id:"openrouter",label:"OpenRouter",models:["anthropic/claude-3.5-sonnet","google/gemini-pro-1.5","meta-llama/llama-3.1-405b-instruct"]},{id:"anthropic",label:"Anthropic",models:["claude-3-5-sonnet-20241022","claude-3-opus-20240229","claude-3-haiku-20240307"]},{id:"chutes",label:"Chutes AI",models:["deepseek-ai/DeepSeek-V3","deepseek-ai/DeepSeek-R1"]},{id:"kobold",label:"Kobold AI (Local)",models:["local"],baseUrl:"http://localhost:5001"},{id:"custom",label:"Custom Endpoint",models:["custom"]}],Ie="samildanach_scribe_state",Le=[{id:"brainstorm",label:"💡 Brainstorm",desc:"Generate ideas and explore concepts"},{id:"expand",label:"📝 Expand",desc:"Develop and detail existing entries"},{id:"critique",label:"🔍 Critique",desc:"Get feedback and suggestions"}],qe={brainstorm:[{label:"Character concept",prompt:"Help me brainstorm a character who..."},{label:"Location idea",prompt:"I need a unique location for..."},{label:"Faction conflict",prompt:"Create tension between factions by..."},{label:"Plot hook",prompt:"Generate a compelling plot hook involving..."}],expand:[{label:"Add history",prompt:"Expand the backstory and history of..."},{label:"Describe appearance",prompt:"Describe in vivid detail how this looks:"},{label:"Add relationships",prompt:"How might this connect to other elements in my world?"},{label:"Cultural details",prompt:"What customs, traditions, or beliefs would exist here?"}],critique:[{label:"Check consistency",prompt:"Review this for internal consistency:"},{label:"Strengthen concept",prompt:"How can I make this more unique or compelling?"},{label:"Find gaps",prompt:"What questions or gaps exist in this concept?"},{label:"Balance check",prompt:"Is this balanced for gameplay? What adjustments?"}]},ge={id:"scribe",label:"Scribe",icon:"✍️",render:async t=>{let e=JSON.parse(localStorage.getItem(Ie)||"{}");e.mode||(e.mode="brainstorm"),e.history||(e.history=[]),e.selectedEntries||(e.selectedEntries=[]),e.sessions||(e.sessions={});const n=()=>localStorage.setItem(Ie,JSON.stringify(e));await $.init();const s=await $.list(),i=se();t.innerHTML=`
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
                            ${Le.map(m=>`
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
                            ${i.map(m=>{const h=s.filter(u=>u.type===m.id);return h.length===0?"":`
                                    <div class="entry-category">
                                        <div class="category-label">${m.icon} ${m.label}</div>
                                        ${h.map(u=>`
                                            <label class="entry-checkbox">
                                                <input type="checkbox" 
                                                    value="${u.id}" 
                                                    ${e.selectedEntries.includes(u.id)?"checked":""}>
                                                <span>${u.data.name||"Untitled"}</span>
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
        `;const o=t.querySelector("#chat-log"),a=t.querySelector("#chat-input"),c=t.querySelector("#btn-send"),l=t.querySelector("#template-select"),p=t.querySelector("#session-select");function r(){const m=qe[e.mode]||[];l.innerHTML='<option value="">📝 Templates...</option>'+m.map((h,u)=>`<option value="${u}">${h.label}</option>`).join("")}r(),l.onchange=()=>{const m=parseInt(l.value);if(!isNaN(m)){const h=qe[e.mode]||[];h[m]&&(a.value=h[m].prompt,a.focus())}l.value=""},t.querySelectorAll(".mode-btn").forEach(m=>{m.onclick=()=>{e.mode=m.dataset.mode,t.querySelectorAll(".mode-btn").forEach(h=>h.classList.remove("active")),m.classList.add("active"),r(),n()}}),t.querySelectorAll(".entry-checkbox input").forEach(m=>{m.onchange=()=>{const h=m.value;m.checked?e.selectedEntries.includes(h)||e.selectedEntries.push(h):e.selectedEntries=e.selectedEntries.filter(u=>u!==h),n()}});function d(){if(e.history.length===0){o.innerHTML=`
                    <div class="chat-empty">
                        <div class="empty-icon">✍️</div>
                        <div class="empty-title">The Scribe</div>
                        <div class="empty-hint">Your AI world-building assistant. Select Library entries for context, then ask for help.</div>
                    </div>
                `;return}o.innerHTML=e.history.map(m=>`
                <div class="chat-bubble ${m.role}">
                    <div class="bubble-content">${m.content.replace(/\n/g,"<br>")}</div>
                    <div class="bubble-meta">
                        <span>${m.role==="user"?"You":"✍️ Scribe"}</span>
                        <button class="btn-copy" data-content="${encodeURIComponent(m.content)}" title="Copy">📋</button>
                    </div>
                </div>
            `).join(""),o.querySelectorAll(".btn-copy").forEach(m=>{m.onclick=()=>{navigator.clipboard.writeText(decodeURIComponent(m.dataset.content))}}),o.scrollTop=o.scrollHeight}d();function y(){Le.find(h=>h.id===e.mode);let m="You are The Scribe, an expert world-building assistant for tabletop RPG settings. ";if(e.mode==="brainstorm"?m+="Help the user generate creative ideas, explore concepts, and brainstorm possibilities. Be imaginative and offer multiple options.":e.mode==="expand"?m+="Help the user develop and expand existing ideas with rich detail. Add depth, history, and connections.":e.mode==="critique"&&(m+="Provide constructive feedback on the user's ideas. Identify strengths, weaknesses, inconsistencies, and suggest improvements."),e.selectedEntries.length>0){const h=e.selectedEntries.map(u=>s.find(b=>b.id===u)).filter(Boolean);h.length>0&&(m+=`

[WORLD CONTEXT - The user has selected these entries from their world Bible:]
`,h.forEach(u=>{const b=i.find(f=>f.id===u.type);if(m+=`
[${(b==null?void 0:b.label)||u.type}] ${u.data.name||"Untitled"}`,u.data.description){const f=u.data.description.replace(/<[^>]+>/g,"").substring(0,300);m+=`: ${f}`}b!=null&&b.fields&&b.fields.forEach(f=>{u.data[f.key]&&(m+=` | ${f.label}: ${u.data[f.key]}`)}),u.data.relationships&&u.data.relationships.length>0&&(m+=`
  Relationships:`,u.data.relationships.forEach(f=>{const g=s.find(E=>E.id===f.targetId),v=(g==null?void 0:g.data.name)||"(Unknown)",k=f.type||"related to";m+=`
    - ${k}: ${v}`,f.notes&&(m+=` (${f.notes})`)}))}),m+=`
[END CONTEXT]`)}return m}async function S(){const m=a.value.trim();if(!m)return;const h={id:oe(),role:"user",content:m,timestamp:new Date().toISOString()};e.history.push(h),a.value="",d(),n(),c.disabled=!0,c.textContent="Thinking...";try{if(!G.getActiveConfig())throw new Error("No API configuration. Go to Settings to add one.");const b=y(),g=e.history.map(E=>({role:E.role==="user"?"user":"model",content:E.content})).slice(-20),v=await G.generate(b,g),k={id:oe(),role:"model",content:v,timestamp:new Date().toISOString()};e.history.push(k),n(),d()}catch(u){console.error("[Scribe]",u),e.history.push({id:oe(),role:"model",content:`[Error: ${u.message}]`,timestamp:new Date().toISOString()}),d()}finally{c.disabled=!1,c.textContent="Send"}}c.onclick=S,a.onkeydown=m=>{m.key==="Enter"&&!m.shiftKey&&(m.preventDefault(),S())},t.querySelector("#btn-clear").onclick=async()=>{await q.confirm("Clear Chat","Clear all messages?")&&(e.history=[],n(),d(),I.show("Chat cleared","success"))},t.querySelector("#btn-save-session").onclick=async()=>{const m=await q.prompt("Session name:",`Session ${Object.keys(e.sessions).length+1}`);m&&(e.sessions[m]={history:[...e.history],mode:e.mode,selectedEntries:[...e.selectedEntries],savedAt:new Date().toISOString()},n(),p.innerHTML='<option value="">-- Sessions --</option>'+Object.keys(e.sessions).map(h=>`<option value="${h}">${h}</option>`).join(""),I.show("Session saved","success"))},t.querySelector("#btn-load-session").onclick=()=>{const m=p.value;if(!m||!e.sessions[m])return;const h=e.sessions[m];e.history=[...h.history],e.mode=h.mode,e.selectedEntries=[...h.selectedEntries],n(),ge.render(t)}}},De={id:"export",label:"Export",icon:"📤",render:(t,e)=>{t.innerHTML=`
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
        `;let n="json";const s=t.querySelector("#export-preview"),i=t.querySelector("#btn-export"),o=t.querySelectorAll(".format-btn");o.forEach(l=>{l.onclick=async()=>{o.forEach(p=>p.classList.remove("active")),l.classList.add("active"),n=l.dataset.format,await a()}});async function a(){s.innerHTML='<div class="preview-loading">Generating preview...</div>';try{let l="";switch(n){case"json":const p=await B.toJSON();l=`<pre class="preview-code">${JSON.stringify(p,null,2).substring(0,2e3)}${JSON.stringify(p,null,2).length>2e3?`
...`:""}</pre>`;break;case"markdown":const r=await B.toMarkdown();l=`<pre class="preview-code">${c(r.substring(0,2e3))}${r.length>2e3?`
...`:""}</pre>`;break;case"html":l=`<div class="preview-note">Full HTML document will be downloaded.</div><pre class="preview-code">${c((await B.toHTML()).substring(0,1500))}...</pre>`;break;case"pdf":l=`<div class="preview-note">PDF will open in a print dialog.<br>Use "Save as PDF" in your browser's print options.</div>`;break}s.innerHTML=l}catch(l){s.innerHTML=`<div class="preview-error">Error: ${l.message}</div>`}}i.onclick=async()=>{i.disabled=!0,i.innerText="Exporting...";try{const l=(w.project.title||"samildanach").toLowerCase().replace(/\s+/g,"-");switch(n){case"json":const p=await B.toJSON();B.download(JSON.stringify(p,null,2),`${l}.json`,"application/json");break;case"markdown":const r=await B.toMarkdown();B.download(r,`${l}.md`,"text/markdown");break;case"html":const d=await B.toHTML();B.download(d,`${l}.html`,"text/html");break;case"pdf":await B.printToPDF();break}}catch(l){alert("Export failed: "+l.message)}i.disabled=!1,i.innerText="Download"},a();function c(l){const p=document.createElement("div");return p.textContent=l,p.innerHTML}}},ne={id:"settings",label:"Settings",icon:"⚙️",render:(t,e)=>{const n=G.getConfigs(),s=G.getActiveConfig();t.innerHTML=`
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
                            ${n.length===0?`
                                <div class="empty-state">
                                    <div class="empty-icon">🔑</div>
                                    <div class="empty-text">No API configurations yet</div>
                                    <div class="empty-hint">Add a configuration to enable AI features</div>
                                </div>
                            `:n.map(h=>{var u;return`
                                <div class="config-card ${h.id===(s==null?void 0:s.id)?"active":""}" data-id="${h.id}">
                                    <div class="config-info">
                                        <div class="config-name">${h.name||"Unnamed"}</div>
                                        <div class="config-provider">${((u=fe.find(b=>b.id===h.provider))==null?void 0:u.label)||h.provider} • ${h.model}</div>
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
                                    ${fe.map(h=>`<option value="${h.id}">${h.label}</option>`).join("")}
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
        `;const i=t.querySelector("#configs-list"),o=t.querySelector("#config-editor"),a=t.querySelector("#cfg-provider"),c=t.querySelector("#cfg-model"),l=t.querySelector("#field-baseurl"),p=t.querySelector("#field-apikey"),r=t.querySelector("#test-result");let d=null;function y(){const h=a.value,u=fe.find(b=>b.id===h);c.innerHTML=u.models.map(b=>`<option value="${b}">${b}</option>`).join(""),l.style.display=["kobold","custom"].includes(h)?"block":"none",p.style.display=h==="kobold"?"none":"block"}a.onchange=y,y();function S(h=null){var u;d=(h==null?void 0:h.id)||null,t.querySelector("#cfg-name").value=(h==null?void 0:h.name)||"",a.value=(h==null?void 0:h.provider)||"gemini",y(),c.value=(h==null?void 0:h.model)||((u=c.options[0])==null?void 0:u.value)||"",t.querySelector("#cfg-apikey").value=(h==null?void 0:h.apiKey)||"",t.querySelector("#cfg-baseurl").value=(h==null?void 0:h.baseUrl)||"",r.innerHTML="",o.style.display="flex"}function m(){o.style.display="none",d=null}t.querySelector("#btn-add-config").onclick=()=>S(),t.querySelector("#btn-cancel-config").onclick=m,t.querySelector("#btn-save-config").onclick=()=>{const h={id:d||oe(),name:t.querySelector("#cfg-name").value||"Unnamed",provider:a.value,model:c.value,apiKey:t.querySelector("#cfg-apikey").value,baseUrl:t.querySelector("#cfg-baseurl").value};G.saveConfig(h),G.getConfigs().length===1&&G.setActiveConfig(h.id),m(),ne.render(t,e)},t.querySelector("#btn-test-config").onclick=async()=>{const h=t.querySelector("#btn-test-config");h.disabled=!0,h.textContent="Testing...",r.innerHTML='<span class="test-pending">Connecting...</span>';const u={provider:a.value,model:c.value,apiKey:t.querySelector("#cfg-apikey").value,baseUrl:t.querySelector("#cfg-baseurl").value};try{await G.testConfig(u),r.innerHTML='<span class="test-success">✓ Connection successful!</span>'}catch(b){r.innerHTML=`<span class="test-error">✗ ${b.message}</span>`}h.disabled=!1,h.textContent="Test Connection"},i.querySelectorAll(".config-card").forEach(h=>{const u=h.dataset.id;h.querySelector(".btn-activate").onclick=()=>{G.setActiveConfig(u),ne.render(t,e)},h.querySelector(".btn-edit").onclick=()=>{const b=G.getConfigs().find(f=>f.id===u);S(b)},h.querySelector(".btn-delete").onclick=async()=>{await q.confirm("Delete Config","Delete this configuration?")&&(G.deleteConfig(u),ne.render(t,e),I.show("Configuration deleted","success"))}})}},ye={divider:!0};async function Je(){console.log(`%c Samildánach v${w.project.version} `,"background: #222; color: #bada55"),D.registerPanel(pe.id,pe),D.registerPanel(x.id,x),D.registerPanel(j.id,j),D.registerPanel("divider1",ye),D.registerPanel($e.id,$e),D.registerPanel(Q.id,Q),D.registerPanel(Te.id,Te),D.registerPanel("divider2",ye),D.registerPanel(ge.id,ge),D.registerPanel("divider3",ye),D.registerPanel(De.id,De),D.registerPanel(ne.id,ne),D.init(),D.activePanelId||D.switchPanel(pe.id)}window.addEventListener("DOMContentLoaded",Je);
