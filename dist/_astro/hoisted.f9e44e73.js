function S(){const t=document.querySelector(".hamburger-menu"),e=document.querySelector(".menu-icon"),n=document.querySelector("#menu-items");t?.addEventListener("click",()=>{const r=t.getAttribute("aria-expanded")==="true";e?.classList.toggle("is-active"),t.setAttribute("aria-expanded",r?"false":"true"),t.setAttribute("aria-label",r?"Open Menu":"Close Menu"),n?.classList.toggle("display-none")})}S();document.addEventListener("astro:after-swap",S);const $=t=>history.state&&history.replaceState({...history.state,...t},""),b=!!document.startViewTransition,g=()=>!!document.querySelector('[name="astro-view-transitions-enabled"]'),x=t=>location.pathname===t.pathname&&location.search===t.search,k=t=>document.dispatchEvent(new Event(t)),L=()=>k("astro:page-load"),H=()=>{let t=document.createElement("div");t.setAttribute("aria-live","assertive"),t.setAttribute("aria-atomic","true"),t.className="astro-route-announcer",document.body.append(t),setTimeout(()=>{let e=document.title||document.querySelector("h1")?.textContent||location.pathname;t.textContent=e},60)},f="data-astro-transition-persist";let w,y=0;history.state?(y=history.state.index,scrollTo({left:history.state.scrollX,top:history.state.scrollY})):g()&&history.replaceState({index:y,scrollX,scrollY,intraPage:!1},"");const R=(t,e)=>{let n=!1,r=!1;return(...a)=>{if(n){r=!0;return}t(...a),n=!0,setTimeout(()=>{r&&(r=!1,t(...a)),n=!1},e)}};async function I(t){try{const e=await fetch(t),n=e.headers.get("content-type")?.replace(/;.*$/,"");return n!=="text/html"&&n!=="application/xhtml+xml"?null:{html:await e.text(),redirected:e.redirected?e.url:void 0,mediaType:n}}catch{return null}}function P(){const t=document.querySelector('[name="astro-view-transitions-fallback"]');return t?t.getAttribute("content"):"animate"}function F(){let t=Promise.resolve();for(const e of Array.from(document.scripts)){if(e.dataset.astroExec==="")continue;const n=document.createElement("script");n.innerHTML=e.innerHTML;for(const r of e.attributes){if(r.name==="src"){const a=new Promise(l=>{n.onload=l});t=t.then(()=>a)}n.setAttribute(r.name,r.value)}n.dataset.astroExec="",e.replaceWith(n)}return t}function C(t){const e=t.effect;return!e||!(e instanceof KeyframeEffect)||!e.target?!1:window.getComputedStyle(e.target,e.pseudoElement).animationIterationCount==="infinite"}const q=(t,e,n)=>{const r=!x(t);let a=!1;t.href!==location.href&&(e?history.replaceState({...history.state},"",t.href):(history.replaceState({...history.state,intraPage:n},""),history.pushState({index:++y,scrollX:0,scrollY:0},"",t.href)),r&&(scrollTo({left:0,top:0,behavior:"instant"}),a=!0)),t.hash?location.href=t.href:a||scrollTo({left:0,top:0,behavior:"instant"})};function X(t){const e=[];for(const n of t.querySelectorAll("head link[rel=stylesheet]"))if(!document.querySelector(`[${f}="${n.getAttribute(f)}"], link[rel=stylesheet][href="${n.getAttribute("href")}"]`)){const r=document.createElement("link");r.setAttribute("rel","preload"),r.setAttribute("as","style"),r.setAttribute("href",n.getAttribute("href")),e.push(new Promise(a=>{["load","error"].forEach(l=>r.addEventListener(l,a)),document.head.append(r)}))}return e}async function T(t,e,n,r,a){const l=o=>{const c=o.getAttribute(f),u=c&&t.head.querySelector(`[${f}="${c}"]`);if(u)return u;if(o.matches("link[rel=stylesheet]")){const d=o.getAttribute("href");return t.head.querySelector(`link[rel=stylesheet][href="${d}"]`)}return null},m=()=>{const o=document.activeElement;if(o?.closest(`[${f}]`)){if(o instanceof HTMLInputElement||o instanceof HTMLTextAreaElement){const c=o.selectionStart,u=o.selectionEnd;return{activeElement:o,start:c,end:u}}return{activeElement:o}}else return{activeElement:null}},h=({activeElement:o,start:c,end:u})=>{o&&(o.focus(),(o instanceof HTMLInputElement||o instanceof HTMLTextAreaElement)&&(o.selectionStart=c,o.selectionEnd=u))},p=()=>{const o=document.documentElement,c=[...o.attributes].filter(({name:s})=>(o.removeAttribute(s),s.startsWith("data-astro-")));[...t.documentElement.attributes,...c].forEach(({name:s,value:i})=>o.setAttribute(s,i));for(const s of document.scripts)for(const i of t.scripts)if(!s.src&&s.textContent===i.textContent||s.src&&s.type===i.type&&s.src===i.src){i.dataset.astroExec="";break}for(const s of Array.from(document.head.children)){const i=l(s);i?i.remove():s.remove()}document.head.append(...t.head.children);const u=document.body,d=m();document.body.replaceWith(t.body);for(const s of u.querySelectorAll(`[${f}]`)){const i=s.getAttribute(f),A=document.querySelector(`[${f}="${i}"]`);A&&A.replaceWith(s)}h(d),r?scrollTo(r.scrollX,r.scrollY):q(e,n.history==="replace",!1),k("astro:after-swap")},E=X(t);if(E.length&&await Promise.all(E),a==="animate"){const o=document.getAnimations();document.documentElement.dataset.astroTransitionFallback="old";const c=document.getAnimations().filter(d=>!o.includes(d)&&!C(d));await Promise.all(c.map(d=>d.finished)),p(),document.documentElement.dataset.astroTransitionFallback="new"}else p()}async function M(t,e,n,r){let a;const l=e.href,m=await I(l);if(m===null){location.href=l;return}m.redirected&&(e=new URL(m.redirected)),w??=new DOMParser;const h=w.parseFromString(m.html,m.mediaType);if(h.querySelectorAll("noscript").forEach(p=>p.remove()),!h.querySelector('[name="astro-view-transitions-enabled"]')){location.href=l;return}r||history.replaceState({...history.state,scrollX,scrollY},""),document.documentElement.dataset.astroTransition=t,b?a=document.startViewTransition(()=>T(h,e,n,r)).finished:a=T(h,e,n,r,P());try{await a}finally{await F(),L(),H()}}function Y(t,e){if(!g()){location.href=t;return}const n=new URL(t,location.href);location.origin===n.origin&&x(n)?q(n,e?.history==="replace",!0):M("forward",n,e??{})}function K(t){if(!g()&&t.state){history.scrollRestoration&&(history.scrollRestoration="manual"),location.reload();return}if(t.state===null){history.scrollRestoration&&(history.scrollRestoration="auto");return}history.scrollRestoration&&(history.scrollRestoration="manual");const e=history.state;if(e.intraPage)scrollTo(e.scrollX,e.scrollY);else{const n=e.index,r=n>y?"forward":"back";y=n,M(r,new URL(location.href),{},e)}}const v=()=>{$({scrollX,scrollY})};{(b||P()!=="none")&&(addEventListener("popstate",K),addEventListener("load",L),"onscrollend"in window?addEventListener("scrollend",v):addEventListener("scroll",R(v,350),{passive:!0}));for(const t of document.scripts)t.dataset.astroExec=""}function O(){const t=document.querySelector('[name="astro-view-transitions-fallback"]');return t?t.getAttribute("content"):"animate"}function W(t){if(document.querySelector(`link[rel=prefetch][href="${t}"]`))return;if(navigator.connection){let n=navigator.connection;if(n.saveData||/(2|3)g/.test(n.effectiveType||""))return}let e=document.createElement("link");e.setAttribute("rel","prefetch"),e.setAttribute("href",t),document.head.append(e)}(b||O()!=="none")&&(document.addEventListener("click",t=>{let e=t.target;e instanceof Element&&e.tagName!=="A"&&(e=e.closest("a")),!(!e||!(e instanceof HTMLAnchorElement)||e.dataset.astroReload!==void 0||e.hasAttribute("download")||!e.href||e.target&&e.target!=="_self"||e.origin!==location.origin||t.button!==0||t.metaKey||t.ctrlKey||t.altKey||t.shiftKey||t.defaultPrevented)&&(t.preventDefault(),Y(e.href,{history:e.dataset.astroHistory==="replace"?"replace":"auto"}))}),["mouseenter","touchstart","focus"].forEach(t=>{document.addEventListener(t,e=>{if(e.target instanceof HTMLAnchorElement){let n=e.target;n.origin===location.origin&&n.pathname!==location.pathname&&g()&&W(n.pathname)}},{passive:!0,capture:!0})}));