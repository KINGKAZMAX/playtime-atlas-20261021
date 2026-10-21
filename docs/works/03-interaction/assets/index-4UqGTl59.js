(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))t(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const c of o.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&t(c)}).observe(document,{childList:!0,subtree:!0});function n(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function t(r){if(r.ep)return;r.ep=!0;const o=n(r);fetch(r.href,o)}})();const ye=12,L="loomdeck.workshop.v1",ee=200,se=60,U={亚麻:{speed:1.18,breakRisk:.9,label:"亚麻"},棉缎:{speed:1.05,breakRisk:.6,label:"棉缎"},羊毛:{speed:.86,breakRisk:1.25,label:"羊毛"},桑蚕丝:{speed:.74,breakRisk:1.6,label:"桑蚕丝"},苎麻:{speed:1,breakRisk:1,label:"苎麻"}},C={靛蓝:{energy:1.15,value:1.25,label:"靛蓝"},柿红:{energy:1.28,value:1.3,label:"柿红"},苔绿:{energy:1.02,value:1.12,label:"苔绿"},米白:{energy:.92,value:1,label:"米白"},墨黑:{energy:1.2,value:1.18,label:"墨黑"}},D={1:"高",2:"中",3:"低"},f={IDLE:"idle",WARP:"warp",RUN:"run",FAULT:"fault",STOP:"stop"},G={idle:"待单",warp:"换经",run:"运行",fault:"故障",stop:"停机"},oe={width:{min:30,max:120,unit:"cm",name:"幅宽"},density:{min:20,max:60,unit:"根/cm",name:"经密"},picks:{min:1,max:12,unit:"匹",name:"匹数"}};function Q(e){const s={},n=String(e.cloth??"").trim();n?U[n]||(s.cloth=`未知布种「${n}」`):s.cloth="必须选择布种";const t=String(e.dye??"").trim();t?C[t]||(s.dye=`未知配色「${t}」`):s.dye="必须选择配色";for(const[o,c]of Object.entries(oe)){const u=e[o];if(u===""||u===null||u===void 0){s[o]=`必须填写${c.name}`;continue}const i=Number(u);if(!Number.isFinite(i)){s[o]=`${c.name}必须是数字`;continue}if(!Number.isInteger(i)){s[o]=`${c.name}必须是整数`;continue}(i<c.min||i>c.max)&&(s[o]=`${c.name}需在 ${c.min}–${c.max} ${c.unit} 之间，当前 ${i}`)}const r=Number(e.priority);return[1,2,3].includes(r)||(s.priority="优先级必须是高 / 中 / 低之一"),{ok:Object.keys(s).length===0,errors:s}}let te=0;function Y(e,s=Date.now()){te+=1;const n=U[e.cloth];C[e.dye];const t=Number(e.picks),r=Number(e.width),o=Number(e.density);return{id:`O-${String(te).padStart(4,"0")}`,cloth:e.cloth,dye:e.dye,width:r,density:o,picks:t,priority:Number(e.priority),workload:Math.round(t*r*(1+o/90)*(2-n.speed)*10),state:"queued",loomId:null,progress:0,createdAt:s,startedAt:null,finishedAt:null}}function $e(){const e=[];for(let s=0;s<ye;s+=1)e.push({id:`L-${String(s+1).padStart(2,"0")}`,name:["一号机","二号机","三号机","四号机","五号机","六号机","七号机","八号机","九号机","十号机","十一号机","十二号机"][s],state:f.IDLE,orderId:null,progress:0,speedFactor:.86+s%5*.075,pickSpeed:26+s%4*5,tension:42+s%6*4,tensionTarget:55+s%5*3,energy:0,breaks:0,warpRemaining:0,warpTotal:0,history:[],spark:[]});return e}function be(){return{version:1,createdAt:Date.now(),savedAt:Date.now(),orders:[],looms:$e(),log:[],telemetry:[],output:0,meter:0,selectedLoomId:null,logPaused:!1,logLevel:"all",chartScale:"density"}}const ke=900;function ve(e,s,n=Math.random){const t=s/1e3;let r=0,o=0,c=0,u=0,i=0;for(const d of e.loom??e.looms){const g=e.orders.find(x=>x.id===d.orderId);switch(d.state){case f.WARP:{d.warpRemaining-=t,d.warpRemaining<=0&&(d.state=f.RUN,d.progress=0,g&&(g.state="running",g.startedAt=Date.now()),$(e,"done",d.id,`${d.id} 换经完成，开始织造`));break}case f.RUN:{if(!g){d.state=f.IDLE;break}const x=U[g.cloth]??U.苎麻,P=C[g.dye]??C.米白,S=1/(1+(g.density-20)/70),I=.0125*d.speedFactor*x.speed*S;d.progress=Math.min(100,d.progress+I*t*100),g.progress=d.progress;const H=(n()-.5)*5.5;d.tension+=(d.tensionTarget-d.tension)*.06*t+H*t*2.2,d.tension=Math.max(18,Math.min(96,d.tension));const W=Math.max(0,(d.tension-62)/34),_=(.0016*x.breakRisk+W*.0075)*(t/ke)*6;if(n()<_)d.breaks+=1,r+=1,d.state=f.FAULT,g.state="assigned",g.progress=d.progress,$(e,"error",d.id,`${d.id} 断经停机，张力 ${d.tension.toFixed(0)} —— 需手动复位`,d);else{const R=.012*t*d.speedFactor*P.energy;d.energy+=R,g.energy=(g.energy??0)+R,d.progress>=100&&(g.state="done",g.finishedAt=Date.now(),e.output+=g.picks,d.state=f.IDLE,d.orderId=null,d.progress=0,$(e,"done",d.id,`${g.id} ${g.cloth}·${g.dye} 完工，产出 ${g.picks} 匹`,d),$(e,"info",d.id,`${d.id} 转入待单，等待派工`,d))}break}case f.FAULT:{d.tension+=(40-d.tension)*.02*t;break}}d.state===f.STOP&&(d.energy+=.0012*t),d.state===f.RUN&&(c+=g?.density??0,u+=d.pickSpeed*(d.speedFactor??1),i+=d.tension),o+=d.energy,r+=d.breaks,d.spark.push(d.state===f.RUN?d.progress:0),d.spark.length>14&&d.spark.shift()}e.meter+=1;const m=e.looms.filter(d=>d.state===f.RUN).length;e.telemetry.push({t:e.meter,density:m?c/m:0,speed:m?u/m:0,tension:m?i/m:0,running:m,breakRate:r,energy:o,output:e.output}),e.telemetry.length>se&&e.telemetry.shift()}function $(e,s,n,t,r=null){const o={id:e.log.length+Math.floor(Math.random()*1e3),at:Date.now(),level:s,source:n,message:t};return e.log.push(o),e.log.length>ee&&e.log.splice(0,e.log.length-ee),r&&(r.history.push(o),r.history.length>24&&r.history.shift()),o}function J(e,s,n){const t=e.orders.find(o=>o.id===s),r=e.looms.find(o=>o.id===n);return t?r?t.state!=="queued"?{ok:!1,error:`订单 ${s} 状态为「${j(t.state)}」，不可重复派单`}:r.state===f.FAULT?{ok:!1,error:`${r.id} 处于故障状态，请先复位`}:r.state===f.STOP?{ok:!1,error:`${r.id} 已停机，无法接单`}:r.orderId?{ok:!1,error:`${r.id} 已有在制订单`}:(t.state="assigned",t.loomId=r.id,r.orderId=t.id,r.state=f.WARP,r.progress=0,r.warpTotal=4+t.picks%3*2,r.warpRemaining=r.warpTotal,$(e,"info",r.id,`${t.id} 派往 ${r.id}，开始换经`,r),{ok:!0}):{ok:!1,error:`机台 ${n} 不存在`}:{ok:!1,error:`订单 ${s} 不存在`}}function z(e,s,n="主管撤单"){const t=e.looms.find(o=>o.id===s);if(!t)return{ok:!1,error:`机台 ${s} 不存在`};if(!t.orderId)return{ok:!1,error:`${t.id} 当前没有订单`};const r=e.orders.find(o=>o.id===t.orderId);return r?r.state==="done"?{ok:!1,error:`${r.id} 已完工，不可撤销`}:(r.state="queued",r.loomId=null,r.progress=0,r.startedAt=null,t.orderId=null,t.progress=0,t.state=f.IDLE,$(e,"warn",t.id,`${r.id} 撤单（${n}），退回队列`,t),{ok:!0}):{ok:!1,error:`${t.id} 的订单记录已丢失`}}function V(e,s){const n=e.looms.find(t=>t.id===s);return n?n.state!==f.FAULT?{ok:!1,error:`${n.id} 未处于故障状态`}:(n.state=n.orderId?f.WARP:f.IDLE,n.warpRemaining=n.orderId?5:0,n.tension=45,$(e,"done",n.id,`${n.id} 故障复位，张力已卸载`,n),{ok:!0}):{ok:!1,error:`机台 ${s} 不存在`}}function ie(e,s){const n=e.looms.find(t=>t.id===s);return n?n.state===f.FAULT?{ok:!1,error:`${n.id} 处于故障状态，请先复位`}:n.state===f.STOP?(n.state=n.orderId?f.WARP:f.IDLE,n.warpRemaining=n.orderId?5:0,$(e,"done",n.id,`${n.id} 重新开机`,n),{ok:!0,message:`${n.id} 已开机`}):(n.state=f.STOP,$(e,"warn",n.id,`${n.id} 主管停机`,n),{ok:!0,message:`${n.id} 已停机`}):{ok:!1,error:`机台 ${s} 不存在`}}function j(e){return{queued:"排队中",assigned:"已派往",running:"生产中",done:"已完工",cancelled:"已撤销"}[e]??e}function de(e){return e.filter(s=>s.state==="queued").sort((s,n)=>s.priority-n.priority||s.createdAt-n.createdAt)}function we(e,s,n){const t=e.orders.find(o=>o.id===s);if(!t)return{ok:!1,error:`订单 ${s} 不存在`};if(t.state!=="queued")return{ok:!1,error:`订单 ${s} 不在队列中`};const r=Math.min(3,Math.max(1,t.priority+n));return r===t.priority?{ok:!1,error:r===1?"已经是最高优先级":"已经是最低优先级"}:(t.priority=r,$(e,"info","主管",`${t.id} 优先级调整为「${D[r]}」`),{ok:!0,message:`${t.id} → ${D[r]}`})}const N=new Map;let A=!0;function _e(){try{const e="__loomdeck_probe__";return window.localStorage.setItem(e,"1"),window.localStorage.removeItem(e),!0}catch{return!1}}function Le({onRestore:e,onFallback:s}={}){A=_e();function n(c){const u=JSON.stringify({...c,savedAt:Date.now()});if(!A)return N.set(L,u),!1;try{return window.localStorage.setItem(L,u),!0}catch(i){return A=!1,N.set(L,u),s?.(i?.name==="QuotaExceededError"?"本地存储配额已满，本次会话改用内存存档（刷新后不保留）":"本地存储不可用，本次会话改用内存存档（刷新后不保留）"),!1}}function t(){let c=null;if(A)try{c=window.localStorage.getItem(L)}catch{c=N.get(L)??null}else c=N.get(L)??null;if(!c)return null;try{const u=JSON.parse(c);if(!u||typeof u!="object"||!Array.isArray(u.looms))throw new Error("存档结构不合法");return u}catch{return s?.("存档数据损坏，已忽略并以初始状态启动"),null}}function r(){if(N.delete(L),!!A)try{window.localStorage.removeItem(L)}catch{}}function o(){return A}return{write:n,read:t,clear:r,isAvailable:o}}function ae(e){const s=be();if(!e)return s;const n={...s,...e,looms:Array.isArray(e.looms)&&e.looms.length?e.looms.map((r,o)=>({...s.looms[o%s.looms.length],...r,history:r.history??[],spark:r.spark??[]})):s.looms,orders:Array.isArray(e.orders)?e.orders:[],log:Array.isArray(e.log)?e.log:[],telemetry:Array.isArray(e.telemetry)?e.telemetry:[]},t=n.orders.reduce((r,o)=>{const c=Number(String(o.id??"").replace(/\D/g,""));return Number.isFinite(c)&&c>r?c:r},0);return n.orderSeq=t,n}const l=(e,s=document)=>s.querySelector(e),M=(e,s=document)=>[...s.querySelectorAll(e)],w=(e,s=1)=>Number.isFinite(e)?e.toFixed(s):"—";function le(e){const s=new Date(e);return`${String(s.getHours()).padStart(2,"0")}:${String(s.getMinutes()).padStart(2,"0")}:${String(s.getSeconds()).padStart(2,"0")}`}function y(e){return String(e).replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[s])}function xe(e){const s=e.looms.filter(i=>i.state===f.RUN).length,n=e.orders.filter(i=>i.state==="queued").length,t=e.looms.filter(i=>i.state===f.FAULT).length,r=e.telemetry[e.telemetry.length-1],o=r?r.breakRate:0;l("#stat-running").textContent=String(s),l("#stat-queued").textContent=String(n),l("#stat-output").textContent=`${e.output} 匹`;const c=l("#stat-breakrate");c.textContent=`${o}`,c.classList.toggle("is-warn",o>0&&o<=2),c.classList.toggle("is-err",o>2),l("#stat-running").classList.toggle("is-err",t>0)}function Se(e,s){const n=l("#order-list"),t=l("#orders-empty"),r=de(e.orders),o=e.orders.filter(i=>i.state!=="queued"&&i.state!=="cancelled"),c=e.orders.filter(i=>i.state==="done");l("#orders-count").textContent=String(e.orders.length);const u=[];if(r.length&&(u.push('<li class="order-card__section" style="display:none"></li>'),r.forEach((i,m)=>{u.push(`
        <li class="order-card ${m===0?"is-top":""}" data-order="${i.id}">
          <div class="order-card__top">
            <span class="order-card__id">${i.id}</span>
            <span class="order-card__name">${y(i.cloth)} · ${y(i.dye)}</span>
            <span class="order-card__prio" data-p="${i.priority}">${D[i.priority]}</span>
          </div>
          <div class="order-card__meta">
            <span>幅宽 <b>${i.width}</b>cm</span>
            <span>经密 <b>${i.density}</b></span>
            <span><b>${i.picks}</b> 匹</span>
          </div>
          <div class="order-card__state">${j(i.state)}</div>
          <div class="order-card__acts">
            <button type="button" class="btn btn--tiny" data-act="assign" data-order="${i.id}">派单…</button>
            <button type="button" class="btn btn--tiny" data-act="raise" data-order="${i.id}" ${i.priority===1?"disabled":""}>提优先</button>
            <button type="button" class="btn btn--tiny" data-act="lower" data-order="${i.id}" ${i.priority===3?"disabled":""}>降优先</button>
            <button type="button" class="btn btn--tiny" data-act="cancel" data-order="${i.id}">撤单</button>
          </div>
        </li>`)})),o.length)for(const i of o){const m=e.looms.find(d=>d.id===i.loomId);u.push(`
        <li class="order-card is-running" data-order="${i.id}">
          <div class="order-card__top">
            <span class="order-card__id">${i.id}</span>
            <span class="order-card__name">${y(i.cloth)} · ${y(i.dye)}</span>
            <span class="order-card__prio" data-p="${i.priority}">${D[i.priority]}</span>
          </div>
          <div class="order-card__meta">
            <span>${y(m?m.id:"—")}</span>
            <span>幅宽 <b>${i.width}</b>cm</span>
            <span>经密 <b>${i.density}</b></span>
            <span><b>${i.picks}</b> 匹</span>
          </div>
          <div class="order-card__state is-run">${j(i.state)} · ${w(i.progress,0)}%</div>
        </li>`)}if(c.length)for(const i of c.slice(-6).reverse())u.push(`
        <li class="order-card is-done" data-order="${i.id}">
          <div class="order-card__top">
            <span class="order-card__id">${i.id}</span>
            <span class="order-card__name">${y(i.cloth)} · ${y(i.dye)}</span>
          </div>
          <div class="order-card__meta"><span>${i.picks} 匹 · ${i.width}cm</span></div>
          <div class="order-card__state">已完工</div>
        </li>`);n.innerHTML=u.join(""),t.hidden=u.length>0,l("#btn-clear-orders").disabled=r.length===0}function Ae(e,s){const n=l("#loom-grid");n.innerHTML=e.looms.map((t,r)=>{const o=e.orders.find(d=>d.id===t.orderId),c=o?`<b>${o.id}</b> ${y(o.cloth)}·${y(o.dye)}`:t.state===f.IDLE?"等待派工":t.state===f.FAULT?"断经待复位":"—",u=(t.spark??[]).map(d=>`<i style="height:${Math.max(6,d)}%"></i>`).join(""),i=e.selectedLoomId===t.id,m=t.state===f.FAULT?'<span class="loom__badge">断经</span>':t.state===f.WARP?'<span class="loom__badge" style="background:var(--gold)">换经</span>':"";return`
      <button type="button" class="loom ${i?"is-selected":""}" role="listitem"
              data-state="${t.state}" data-loom="${t.id}" data-idx="${r}"
              aria-label="${t.id} ${t.name}，状态 ${G[t.state]}">
        ${m}
        <div class="loom__head">
          <span class="loom__id">${t.id}</span>
          <span class="loom__state">${G[t.state]}</span>
        </div>
        <div class="loom__order">${c}</div>
        <div class="loom__bar"><div class="loom__barfill" style="width:${t.progress.toFixed(1)}%"></div></div>
        <div class="loom__stats">
          <span>梭速 <b>${t.pickSpeed}</b></span>
          <span>张力 <b>${w(t.tension,0)}</b></span>
          <span>断经 <b>${t.breaks}</b></span>
        </div>
        <div class="loom__spark" aria-hidden="true">${u}</div>
      </button>`}).join("")}function ce(e){const s=e.looms.filter(u=>u.state===f.RUN),n=e.telemetry[e.telemetry.length-1]??{speed:0,tension:0,breakRate:0},t=e.looms.filter(u=>u.state===f.FAULT).length,r=e.looms.reduce((u,i)=>u+i.energy,0),o=s.length?s.reduce((u,i)=>u+(e.orders.find(m=>m.id===i.orderId)?.density??0),0)/s.length:0,c=[{k:"平均经密",v:w(o,0),u:"根/cm",cls:""},{k:"平均梭速",v:w(n.speed,0),u:"梭/分",cls:""},{k:"平均张力",v:w(n.tension,0),u:"N",cls:n.tension>74?"is-warn":""},{k:"断经次数",v:String(n.breakRate),u:"次",cls:n.breakRate>2?"is-err":n.breakRate?"is-warn":""},{k:"在织台数",v:String(s.length),u:"台",cls:""},{k:"累计能耗",v:w(r,2),u:"kWh",cls:""},{k:"故障机台",v:String(t),u:"台",cls:t?"is-err":""},{k:"本班产量",v:String(e.output),u:"匹",cls:""}];l("#readouts").innerHTML=c.map(u=>`
    <div class="readout ${u.cls}">
      <div class="readout__k">${u.k}</div>
      <div class="readout__v">${u.v}<small>${u.u}</small></div>
    </div>`).join(""),Te(e),Ee(e)}function Te(e){const s=l("#telemetry-chart"),n=e.chartScale,t=e.telemetry.slice(-se),r=320,o=140,c=26,u=6,i=8,m=16;if(!t.length){s.innerHTML=`<text x="${r/2}" y="${o/2}" text-anchor="middle" class="chart-label">等待采样…</text>`;return}const d=t.map(k=>n==="density"?k.density:k.speed),g=Math.max(...d,1),x=Math.min(...d,0),P=Math.max(g-x,n==="density"?8:6),S=x-P*.12,I=g+P*.16,H=k=>c+k/Math.max(1,t.length-1)*(r-c-u),W=k=>i+(1-(k-S)/(I-S))*(o-i-m),_=t.map((k,v)=>[H(v),W(d[v])]),R=_.map((k,v)=>`${v===0?"M":"L"}${k[0].toFixed(1)},${k[1].toFixed(1)}`).join(" "),me=`${R} L${_[_.length-1][0].toFixed(1)},${o-m} L${_[0][0].toFixed(1)},${o-m} Z`,ge=[0,.5,1].map(k=>{const v=i+k*(o-i-m);return`<line x1="${c}" y1="${v.toFixed(1)}" x2="${r-u}" y2="${v.toFixed(1)}"/>`}).join(""),he=[I,(I+S)/2,S].map((k,v)=>`<text x="2" y="${(i+v/2*(o-i-m)+3).toFixed(1)}" class="chart-label">${k.toFixed(0)}</text>`).join(""),Z=_[_.length-1];s.innerHTML=`
    <defs>
      <linearGradient id="loomdeck-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c04a24" stop-opacity=".55"/>
        <stop offset="100%" stop-color="#c04a24" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <g class="chart-grid">${ge}</g>
    ${he}
    <line class="chart-axis" x1="${c}" y1="${i}" x2="${c}" y2="${o-m}"/>
    <path class="chart-area" d="${me}"/>
    <path class="chart-line" d="${R}"/>
    <circle class="chart-dot" cx="${Z[0].toFixed(1)}" cy="${Z[1].toFixed(1)}" r="2.6"/>`,l("#chart-title").textContent=n==="density"?"车间平均经密":"车间平均梭速",l("#chart-unit").textContent=n==="density"?"根/cm":"梭/分"}function Ee(e){const s=e.looms.map(n=>{const t=e.orders.find(c=>c.id===n.orderId),r=n.state===f.RUN?n.progress:n.state===f.WARP?4:0,o=n.state===f.RUN?"var(--indigo-mid)":n.state===f.FAULT?"var(--err)":n.state===f.WARP?"var(--gold)":"var(--ink-mute)";return`
      <div class="bar-row">
        <span class="bar-row__id">${n.id}</span>
        <div class="bar-row__track"><div class="bar-row__fill" style="width:${r.toFixed(1)}%;background:${o}"></div></div>
        <span class="bar-row__v">${t?y(t.cloth):"—"}</span>
      </div>`}).join("");l("#load-bars").innerHTML=s}function X(e,{append:s=!1}={}){const n=l("#log-list"),t=e.log.filter(r=>e.logLevel==="all"?!0:e.logLevel==="warn"&&r.level==="warn"||r.level==="error");if(!s)n.innerHTML=t.map(r=>re(r)).join("");else if(t.length){const r=t[t.length-1];for(n.insertAdjacentHTML("beforeend",re(r));n.children.length>220;)n.removeChild(n.firstChild)}e.logPaused||(n.parentElement.scrollTop=n.parentElement.scrollHeight)}function re(e){const s=e.source==="主管"?"主管":e.source;return`<li class="log-row" data-level="${e.level}">
    <span class="log-row__t">${le(e.at)}</span>
    <span class="log-row__src">${y(s)}</span>
    <span class="log-row__msg">${y(e.message)}</span>
  </li>`}function Ie(e){const s=l("#drawer"),n=e.looms.find(i=>i.id===e.selectedLoomId);if(!n){s.hidden=!0;return}s.hidden=!1,l("#drawer-title").textContent=`${n.id} · ${n.name}`;const t=e.orders.find(i=>i.id===n.orderId),r=n.spark??[],o=Math.max(100,...r),c=r.length>1?r.map((i,m)=>{const d=m/(r.length-1)*300+4,g=58-i/o*52;return`${m===0?"M":"L"}${d.toFixed(1)},${g.toFixed(1)}`}).join(" "):"",u=n.history.slice().reverse();l("#drawer-body").innerHTML=`
    <div class="dsec">
      <div class="dsec__h">机台状态</div>
      <dl class="dl">
        <dt>状态</dt><dd>${G[n.state]}</dd>
        <dt>当前订单</dt><dd>${t?y(t.id):"—"}</dd>
        <dt>进度</dt><dd>${w(n.progress,1)}%</dd>
        <dt>梭速</dt><dd>${n.pickSpeed} 梭/分</dd>
        <dt>张力</dt><dd>${w(n.tension,1)} N</dd>
        <dt>目标张力</dt><dd>${n.tensionTarget} N</dd>
        <dt>本班能耗</dt><dd>${w(n.energy,3)} kWh</dd>
        <dt>断经次数</dt><dd>${n.breaks}</dd>
      </dl>
    </div>

    ${t?`
    <div class="dsec">
      <div class="dsec__h">在制订单</div>
      <dl class="dl">
        <dt>布种</dt><dd>${y(t.cloth)}</dd>
        <dt>配色</dt><dd>${y(t.dye)}</dd>
        <dt>幅宽</dt><dd>${t.width} cm</dd>
        <dt>经密</dt><dd>${t.density} 根/cm</dd>
        <dt>匹数</dt><dd>${t.picks}</dd>
        <dt>优先级</dt><dd>${D[t.priority]}</dd>
        <dt>状态</dt><dd>${j(t.state)}</dd>
      </dl>
    </div>`:""}

    <div class="dsec">
      <div class="dsec__h">进度曲线</div>
      <svg class="dspark" viewBox="0 0 308 62" preserveAspectRatio="none" role="img" aria-label="该机进度曲线">
        <line x1="0" y1="58" x2="308" y2="58"/>
        <line x1="0" y1="30" x2="308" y2="30"/>
        ${c?`<path d="${c}"/>`:""}
      </svg>
    </div>

    <div class="dsec">
      <div class="dsec__h">机台操作</div>
      <div class="order-card__acts">
        <button type="button" class="btn btn--tiny" data-drawer-act="reset" ${n.state!==f.FAULT?"disabled":""}>复位故障</button>
        <button type="button" class="btn btn--tiny" data-drawer-act="power" ${n.state===f.FAULT?"disabled":""}>
          ${n.state===f.STOP?"开机":"停机"}
        </button>
        <button type="button" class="btn btn--tiny" data-drawer-act="revoke" ${n.orderId?"":"disabled"}>撤销订单</button>
      </div>
    </div>

    <div class="dsec">
      <div class="dsec__h">事件历史</div>
      ${u.length?u.map(i=>`
        <div class="devent">
          <span class="devent__t">${le(i.at)}</span>
          <span class="devent__m">${y(i.message)}</span>
        </div>`).join(""):'<p class="empty-note">本班暂无事件记录。</p>'}
    </div>`}function p(e,s=""){const n=l("#toast-stack"),t=document.createElement("div");t.className=`toast ${s?`is-${s}`:""}`,t.textContent=e,n.appendChild(t),setTimeout(()=>{t.classList.add("is-out"),setTimeout(()=>t.remove(),320)},2600)}const O=Le({onFallback:e=>p(e,"err")});let a=ae(O.read()),F=null;O.read()&&(F=a.savedAt??null,$(a,"info","系统","已恢复上次会话的车间存档"));let B=Date.now(),ne=null,T=null,K=!1;function b(e={}){K||(K=!0,requestAnimationFrame(()=>{K=!1,xe(a),Se(a),Ae(a),ce(a),X(a,{append:e.appendLog}),Ie(a)}))}function Re(){ne||(B=Date.now(),ne=setInterval(()=>{const e=Date.now(),s=Math.min(2400,e-B);B=e;const n=a.log.length;ve(a,s);const t=a.log.length;b({appendLog:t>n})},900))}function h(){T&&clearTimeout(T),T=setTimeout(()=>{O.write(a)},700)}function ue(){T&&(clearTimeout(T),T=null),O.write(a)}const E=l("#order-form");function fe(e,s){const n=E.querySelector(`[name="${e}"]`)?.closest(".field");if(!n)return;n.classList.toggle("has-error",!!s);let t=n.querySelector(".field__err");s?(t||(t=document.createElement("span"),t.className="field__err",n.appendChild(t)),t.textContent=s):t&&t.remove()}function Ne(){M(".field.has-error",E).forEach(s=>s.classList.remove("has-error")),M(".field__err",E).forEach(s=>s.remove());const e=l("#form-error");e.hidden=!0,e.textContent=""}function pe(){return{cloth:l("#f-cloth").value,width:l("#f-width").value,density:l("#f-density").value,picks:l("#f-picks").value,dye:l("#f-dye").value,priority:l("#f-priority").value}}E.addEventListener("submit",e=>{e.preventDefault(),Ne();const s=pe(),{ok:n,errors:t}=Q(s);if(!n){for(const[i,m]of Object.entries(t))fe(i,m);const o=Object.keys(t)[0],c=l("#form-error");c.textContent=`无法下单：${t[o]}`,c.hidden=!1,E.querySelector(`[name="${o}"]`)?.focus();return}const r=Y(s);a.orders.push(r),$(a,"info","主管",`新订单 ${r.id}：${r.cloth}·${r.dye} ${r.width}cm ${r.picks} 匹`),p(`已加入订单簿：${r.id}`,"ok"),b(),h()});E.addEventListener("input",e=>{const s=e.target.name;if(!s)return;if(e.target.closest(".field")?.classList.contains("has-error")){const{errors:t}=Q(pe());fe(s,t[s]??"")}});l("#btn-clear-orders").addEventListener("click",()=>{const e=a.orders.filter(s=>s.state==="queued");if(!e.length){p("没有待排订单");return}for(const s of e)s.state="cancelled";$(a,"warn","主管",`清空待排订单 ${e.length} 张`),p(`已清空 ${e.length} 张待排订单`,"ok"),b(),h()});l("#order-list").addEventListener("click",e=>{const s=e.target.closest("button[data-act]");if(!s)return;const n=s.dataset.order,t=s.dataset.act;if(t==="assign"){const r=a.looms.find(c=>c.state===f.IDLE&&!c.orderId);if(!r){p("没有可接单的机台（全部在制、故障或停机）","err");return}const o=J(a,n,r.id);if(!o.ok){p(o.error,"err");return}p(`${n} 已派往 ${r.id}`,"ok")}else if(t==="raise"||t==="lower"){const r=we(a,n,t==="raise"?-1:1);if(!r.ok){p(r.error,"err");return}p(r.message,"ok")}else if(t==="cancel"){const r=a.orders.find(o=>o.id===n);if(!r)return;if(r.state!=="queued"){p("只有排队中的订单可以撤单","err");return}r.state="cancelled",$(a,"warn","主管",`订单 ${n} 被撤销`),p(`${n} 已撤销`,"ok")}b(),h()});l("#loom-grid").addEventListener("click",e=>{const s=e.target.closest(".loom");if(!s)return;const n=s.dataset.loom;a.selectedLoomId=a.selectedLoomId===n?null:n,b(),h()});l("#drawer-body").addEventListener("click",e=>{const s=e.target.closest("button[data-drawer-act]");if(!s)return;const n=a.selectedLoomId;if(!n)return;const t=s.dataset.drawerAct;if(t==="reset"){const r=V(a,n);if(!r.ok){p(r.error,"err");return}p(`${n} 已复位`,"ok")}else if(t==="power"){const r=ie(a,n);if(!r.ok){p(r.error,"err");return}p(r.message,"ok")}else if(t==="revoke"){const r=z(a,n);if(!r.ok){p(r.error,"err");return}p(`${n} 的订单已退回队列`,"ok")}b(),h()});l("#btn-close-drawer").addEventListener("click",()=>{a.selectedLoomId=null,b(),h()});M("#log-list").length;document.querySelectorAll("[data-level]").forEach(e=>{e.tagName==="BUTTON"&&e.addEventListener("click",()=>{document.querySelectorAll(".seg--sm .seg__btn").forEach(s=>s.classList.remove("is-on")),e.classList.add("is-on"),a.logLevel=e.dataset.level,X(a),h()})});l("#btn-pause-log").addEventListener("click",()=>{a.logPaused=!a.logPaused;const e=l("#btn-pause-log");e.setAttribute("aria-pressed",String(a.logPaused)),e.textContent=a.logPaused?"继续滚动":"暂停滚动",p(a.logPaused?"日志自动滚动已暂停":"日志自动滚动已继续"),h()});l("#btn-clear-log").addEventListener("click",()=>{a.log.length=0,X(a),p("日志已清空"),h()});M(".seg .seg__btn[data-scale]").forEach(e=>{e.addEventListener("click",()=>{M(".seg .seg__btn[data-scale]").forEach(s=>s.classList.remove("is-on")),e.classList.add("is-on"),a.chartScale=e.dataset.scale,ce(a),h()})});l("#btn-help").addEventListener("click",()=>{l("#help-modal").hidden=!1,l("#btn-close-help").focus()});l("#btn-close-help").addEventListener("click",()=>{l("#help-modal").hidden=!0,l("#btn-help").focus()});l("#help-modal").addEventListener("click",e=>{e.target===l("#help-modal")&&(l("#help-modal").hidden=!0)});l("#btn-reset-all").addEventListener("click",()=>{window.confirm("重置车间将清空订单簿、机台状态、日志与遥测存档，确定继续？")&&(O.clear(),a=ae(null),F=null,l("#restore-banner").hidden=!0,$(a,"info","系统","车间已重置，回到初始状态"),b(),p("车间已重置","ok"))});l("#btn-dismiss-restore").addEventListener("click",()=>{l("#restore-banner").hidden=!0});function q(e,s){const n=a.looms;if(!n.length)return;let t=n.findIndex(r=>r.id===a.selectedLoomId);if(t===-1)t=0;else{const r=window.innerWidth>=1280?4:window.innerWidth>=768?3:2;t=Math.min(n.length-1,Math.max(0,t+e+s*r))}a.selectedLoomId=n[t].id,b(),h()}document.addEventListener("keydown",e=>{const s=e.target?.tagName,n=s==="INPUT"||s==="SELECT"||s==="TEXTAREA";if(e.key==="Escape"){if(!l("#help-modal").hidden){l("#help-modal").hidden=!0,l("#btn-help").focus();return}a.selectedLoomId&&(a.selectedLoomId=null,b(),h());return}if(!n&&!(e.metaKey||e.ctrlKey||e.altKey)&&l("#help-modal").hidden){switch(e.key){case"ArrowUp":e.preventDefault(),q(0,-1);return;case"ArrowDown":e.preventDefault(),q(0,1);return;case"ArrowLeft":e.preventDefault(),q(-1,0);return;case"ArrowRight":e.preventDefault(),q(1,0);return;case"Enter":{e.preventDefault();const t=a.looms.find(c=>c.id===a.selectedLoomId);if(!t){p("请先选中一台织机","err");return}const r=de(a.orders)[0];if(!r){p("订单簿里没有待排订单","err");return}const o=J(a,r.id,t.id);if(!o.ok){p(o.error,"err");return}p(`${r.id} 已派往 ${t.id}`,"ok"),b(),h();return}case"Backspace":{e.preventDefault();const t=a.looms.find(o=>o.id===a.selectedLoomId);if(!t){p("请先选中一台织机","err");return}const r=z(a,t.id,"快捷键撤单");if(!r.ok){p(r.error,"err");return}p(`${t.id} 的订单已退回队列`,"ok"),b(),h();return}case" ":{e.preventDefault(),l("#btn-pause-log").click();return}case"l":case"L":l("#btn-clear-log").click();return;case"r":case"R":{const t=a.looms.find(o=>o.id===a.selectedLoomId);if(!t){p("请先选中一台织机","err");return}const r=V(a,t.id);if(!r.ok){p(r.error,"err");return}p(`${t.id} 已复位`,"ok"),b(),h();return}case"t":case"T":{const t=a.chartScale==="density"?"speed":"density";document.querySelector(`.seg__btn[data-scale="${t}"]`)?.click();return}case"n":case"N":e.preventDefault(),l("#f-width").focus(),l("#f-width").select?.();return}if(/^[0-9]$/.test(e.key)){const t=e.key==="0"?10:Number(e.key),r=a.looms[t-1];if(!r)return;a.selectedLoomId=r.id,b(),h()}}});window.addEventListener("beforeunload",ue);document.addEventListener("visibilitychange",()=>{document.visibilityState==="hidden"&&ue()});if(F){const e=l("#restore-banner");l("#restore-banner-text").textContent=`已恢复上次会话 · ${new Date(F).toLocaleString("zh-CN",{hour12:!1})}`,e.hidden=!1}if(!a.orders.length&&!F){const e=Y({cloth:"亚麻",dye:"靛蓝",width:92,density:44,picks:5,priority:1}),s=Y({cloth:"桑蚕丝",dye:"柿红",width:76,density:38,picks:3,priority:2});a.orders.push(e,s),$(a,"info","系统","车间启动，已载入两张示例订单")}Re();b();h();window.__loomdeck={get state(){return a},assignOrder:J,revokeOrder:z,resetLoom:V,toggleLoomPower:ie,validateOrderDraft:Q,LIMITS:oe};
