/* ==== THE KHABAR BOOK · adventure-food.css v4.1 · paper-on-desk, single screen ====
   Palette: Cream #F8F2E8 · Tomato #E94D2E · Mango #F6C94C · Leaf #47764A · Ink #24231F (everything else is derived with color-mix) */
:root{--cream:#F8F2E8;--tomato:#E94D2E;--mango:#F6C94C;--leaf:#47764A;--ink:#24231F;
  --paper:var(--cream);--green:var(--leaf);
  --card:color-mix(in srgb,var(--cream) 45%,#fff);
  --sand:color-mix(in srgb,var(--cream) 82%,var(--ink));
  --muted:color-mix(in srgb,var(--ink) 62%,var(--cream));
  --body:color-mix(in srgb,var(--ink) 80%,var(--cream));
  --line:rgba(36,35,31,.16);--edge:color-mix(in srgb,var(--cream) 78%,var(--ink));
  --leaf-2:color-mix(in srgb,var(--leaf) 65%,#fff);
  --tomato-d:color-mix(in srgb,var(--tomato) 72%,#000);  /* small tomato text + button shadows */
  --shadow:0 8px 20px rgba(36,35,31,.16);
  --serif:'Tiro Bangla',Georgia,serif;--sans:'Hind Siliguri','Trebuchet MS',system-ui,sans-serif;--desk-a:#24231F;--desk-b:#2e2d28;
  box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--desk-a:#141311;--desk-b:#1d1c19}}
:root[data-theme="dark"]{--desk-a:#141311;--desk-b:#1d1c19}
*{box-sizing:border-box}
html,body{margin:0;width:100%;height:100%;overflow:hidden}
body{color:var(--ink);background:var(--desk-a);font:400 15px/1.45 var(--sans);display:grid;place-items:center}
button{font:inherit;color:inherit;cursor:pointer}
.desk{position:fixed;inset:0;background:radial-gradient(ellipse at 18% 14%,rgba(246,201,76,.10),transparent 28%),repeating-linear-gradient(92deg,var(--desk-a) 0,var(--desk-b) 5px,var(--desk-a) 12px,var(--desk-b) 18px)}
.book{position:relative;width:min(1600px,100vw);height:min(1000px,100dvh);overflow:hidden;display:grid;grid-template-rows:auto minmax(0,1fr);background:var(--paper);border:10px solid #3b3a35;box-shadow:0 18px 60px rgba(10,10,8,.6);
  background-image:radial-gradient(ellipse at 14% 25%,rgba(255,255,255,.55),transparent 28%),radial-gradient(ellipse at 90% 80%,rgba(246,201,76,.16),transparent 32%),repeating-linear-gradient(0deg,transparent 0 5px,rgba(36,35,31,.025) 6px 7px)}
.book::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.35;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.14'/%3E%3C/svg%3E")}
.leaf{position:absolute;font-size:clamp(24px,3vw,46px);filter:saturate(.75);opacity:.9;pointer-events:none;z-index:6}
.leaf.one{top:-10px;left:30%;font-size:50px;transform:rotate(-24deg)}.leaf.two{bottom:1%;right:2%;transform:rotate(25deg);font-size:46px}

/* header */
header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:6px 4.2%;min-height:64px;position:relative;z-index:5;border-bottom:1px dashed var(--line)}
.brand{display:flex;align-items:center;gap:10px;rotate:-2deg}
.brand-mark{width:42px;height:42px;display:grid;place-items:center;background:var(--tomato);border:2px solid var(--ink);border-radius:50%;font-size:22px;box-shadow:3px 3px 0 var(--ink)}
.brand-name{font:700 clamp(22px,2.6vw,34px)/.95 var(--sans);letter-spacing:-1px;color:var(--green)}.brand-name span{color:var(--tomato)}
.tagline{font:italic 13px var(--serif);margin-top:3px;white-space:nowrap}
nav{display:flex;align-items:center;gap:clamp(10px,2vw,28px);font-weight:600;font-size:14px}
nav button{border:0;background:none;padding:8px 2px;border-bottom:2px solid transparent;transition:color .2s,border-color .2s,transform .15s}
nav button:hover{transform:translateY(-1px)}nav button.active{border-color:var(--green);color:var(--green)}
nav .cta{background:var(--tomato);color:#fff;border-radius:99px;padding:8px 16px;border:0;box-shadow:0 3px 0 var(--tomato-d)}
nav .cta:active{transform:translateY(2px);box-shadow:none}

/* layout: same zones as the prototype, on a grid so nothing can overlap or scroll */
main{position:relative;z-index:1;min-height:0;display:grid;gap:clamp(8px,1.6dvh,18px) clamp(10px,1.6vw,26px);padding:clamp(8px,2dvh,22px) 4.2%;
  grid-template-columns:minmax(190px,23%) minmax(0,1fr) minmax(240px,26%);grid-template-rows:auto minmax(0,1fr) auto;
  grid-template-areas:"intro map pass" "cards map panel" "next top panel"}
main>*{min-height:0;min-width:0}
.piece{position:relative;background:var(--card);border:1px solid var(--edge);box-shadow:var(--shadow)}
.piece::after{content:"";position:absolute;inset:6px;border:1.5px dashed rgba(233,77,46,.3);pointer-events:none}  /* nakshi-kantha stitch */
.intro{grid-area:intro;align-self:start;z-index:3}
.eyebrow{color:var(--tomato-d);font-weight:700;font-size:11px;letter-spacing:2px;text-transform:uppercase}
h1{font:400 clamp(24px,2.7vw,40px)/1.25 var(--serif);margin:8px 0 6px;rotate:-1.5deg}
h1 em{font-style:normal;color:var(--green);text-decoration:underline;text-decoration-color:var(--tomato);text-decoration-thickness:3px;text-underline-offset:6px}
.sub{font:italic clamp(12px,1vw,14px) var(--serif);color:var(--green);margin:0 0 8px}
.intro p{font-size:clamp(12px,1vw,14px);color:var(--body);max-width:280px;margin:0}

.passport{grid-area:pass;align-self:start;padding:14px 16px;rotate:2deg;clip-path:polygon(1% 0,100% 2%,98% 100%,0 97%);z-index:4}
.pass-head{display:flex;align-items:center;gap:9px;font-weight:700;font-size:15px}
.pass-icon{background:var(--green);color:var(--mango);width:30px;height:34px;display:grid;place-items:center;border-radius:3px;font-size:17px}
.prow{display:flex;align-items:center;gap:12px;margin:10px 0 6px}
@property --done{syntax:'<percentage>';inherits:false;initial-value:0%}
.ring{width:56px;height:56px;border-radius:50%;flex:none;display:grid;place-items:center;background:conic-gradient(var(--green) 0 var(--done),var(--sand) var(--done) 100%);transition:--done 1.2s cubic-bezier(.2,1,.3,1)}
.ring::after{content:"";width:41px;height:41px;border-radius:50%;background:var(--card)}
.num{font-size:24px;font-weight:700;line-height:1}.num small{font-size:11px;font-weight:500;color:var(--muted)}
.tier{font-weight:700;font-size:15px;color:var(--green);line-height:1.3}.tier-en{font:italic 11px var(--serif);color:var(--muted);display:block}
.bar{height:7px;background:var(--sand);border-radius:9px;overflow:hidden;margin:6px 0 10px}
.bar span{display:block;height:100%;width:var(--w,0%);background:linear-gradient(90deg,var(--green),var(--leaf-2));border-radius:9px;transition:width 1.2s cubic-bezier(.2,1,.3,1)}
.stats{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px dashed var(--line);padding-top:8px}
.stat{text-align:center;border-right:1px dashed var(--line)}.stat:last-child{border:0}
.stat b{display:block;font-size:20px}.stat span{font-size:11px;color:var(--muted)}

/* map */
.map-zone{grid-area:map;position:relative;display:grid;place-items:center;z-index:2}
.mand-bg{position:absolute;inset:4%;display:grid;place-items:center;color:var(--line);opacity:.9;animation:spin 140s linear infinite;pointer-events:none}
.mand-bg svg{height:100%;max-width:100%;aspect-ratio:1}
.map-svg{position:relative;width:100%;height:100%;overflow:visible;filter:drop-shadow(4px 7px 0 rgba(36,35,31,.3))}
.d{stroke:var(--cream);stroke-width:2;cursor:pointer;transform-box:fill-box;transform-origin:center;transition:filter .15s,fill .4s;animation:cell .55s var(--cd,0s) cubic-bezier(.2,1.4,.4,1) backwards}
.d.no{fill:var(--sand)}.d.has{fill:var(--mango)}.d.done{fill:var(--leaf)}
.d:hover{filter:brightness(1.12)}
.d.sel{stroke:var(--tomato);stroke-width:4.5}
.d.pop{animation:popc .5s cubic-bezier(.2,1.8,.4,1)}
.pin{transform-box:fill-box;transform-origin:center;animation:popin .6s cubic-bezier(.2,1.8,.4,1) both;pointer-events:none;filter:drop-shadow(1px 2px 0 rgba(36,35,31,.35))}
.stamp{position:absolute;right:0;top:1%;width:clamp(78px,7vw,112px);aspect-ratio:1;border:3px double var(--tomato);color:var(--tomato);border-radius:50%;display:grid;place-items:center;text-align:center;rotate:13deg;font-weight:700;font-size:clamp(8px,.7vw,10px);letter-spacing:1px;pointer-events:none;line-height:1.2}
.stamp strong{font:400 clamp(13px,1.4vw,20px)/1.2 var(--serif);display:block}
.sea{position:absolute;left:0;bottom:1%;display:flex;align-items:flex-end;gap:10px;pointer-events:none;color:var(--leaf);opacity:.75}
.boat{width:clamp(44px,5vw,76px);animation:drift 9s ease-in-out infinite alternate;filter:drop-shadow(0 4px 3px rgba(0,0,0,.2))}
.waves{font-size:20px;letter-spacing:4px;animation:wave 6s ease-in-out infinite}
.compass{font:38px/1 var(--serif);color:var(--muted);text-align:center;rotate:-12deg;animation:sway 7s ease-in-out infinite}.compass small{display:block;font-size:9px;letter-spacing:2px}

/* polaroids, next, top */
.cards{grid-area:cards;display:flex;flex-direction:column;justify-content:space-around;align-items:flex-start;z-index:4;padding-left:2%}
.pola{position:relative;width:clamp(118px,12vw,170px);padding:6px 6px 9px;background:var(--card);border:1px solid var(--edge);box-shadow:var(--shadow);rotate:var(--r);cursor:pointer;transition:rotate .25s,scale .25s}
.pola:nth-child(2){align-self:flex-end}
.pola:hover{rotate:0deg;scale:1.04}
.pola .ph{width:100%;height:clamp(52px,9dvh,100px)}
.pola b{font-size:13px;display:block;margin:6px 3px 0;line-height:1.3}
.pola small{display:block;margin:0 3px;color:var(--muted);font-size:11px}.pola small.en{font:italic 11px var(--serif)}
.heart{position:absolute;right:8px;bottom:8px;border:0;background:none;color:var(--tomato);font-size:18px;line-height:1;padding:2px}
.next{grid-area:next;align-self:end;padding:12px 14px;rotate:-2deg;z-index:3}
.next h3,.top h3,.panel h3{font:400 15px var(--serif);margin:0 0 6px}
.next p{font-size:12px;margin:0 0 8px;color:var(--body)}
.btn{border:0;border-radius:99px;background:var(--tomato);color:#fff;padding:8px 15px;font-weight:700;font-size:14px;box-shadow:0 3px 0 var(--tomato-d);transition:transform .15s}
.btn:hover{transform:translateY(-2px) rotate(-1.5deg)}.btn:active{transform:translateY(2px);box-shadow:none}
.top{grid-area:top;align-self:end;padding:11px 15px;rotate:-.4deg;z-index:3}
.top-h{display:flex;justify-content:space-between;align-items:center}
.top-h button{background:none;border:0;color:var(--green);font-weight:700;font-size:11px}
.ranks{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
.rank{display:flex;align-items:center;gap:8px;background:color-mix(in srgb,var(--card) 70%,transparent);border:1px solid var(--edge);padding:5px;border-radius:6px;transition:translate .2s}
.rank:hover{translate:0 -3px}
.rank .ph{width:42px;height:42px;border-radius:50%;border:2px solid #fff;flex:none}.rank .ph::before{font-size:19px}
.rank b{display:block;font-size:12px;line-height:1.25}.rank small{display:block;color:var(--tomato-d);font-size:10px;font-weight:700}.rank em{font-style:normal;font-size:11px;color:var(--muted)}

/* dish panel (today's special / selected district) */
.panel{grid-area:panel;display:flex;flex-direction:column;gap:6px;padding:14px 16px;rotate:1.5deg;overflow:hidden;z-index:4}
.p-label{font-size:12px;color:var(--tomato-d);font-weight:700;letter-spacing:.04em}
.p-body{display:flex;flex-direction:column;gap:7px;flex:1;min-height:0}
.p-body.swap{animation:swap .45s cubic-bezier(.2,1.2,.4,1)}
.p-top{display:flex;flex-direction:column;gap:7px;flex:1;min-height:0}
.p-top .ph{flex:1;min-height:60px;max-height:210px;border:4px solid #fff;box-shadow:0 3px 8px rgba(36,35,31,.18)}
.p-top .ph::before{font-size:clamp(36px,4vw,60px)}
.p-name{font:700 20px/1.3 var(--sans)}.p-en{font:italic 13px var(--serif);color:var(--muted);margin-top:-4px}
.p-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
.check{border:2px solid var(--tomato);background:none;color:var(--tomato-d);border-radius:99px;padding:7px 14px;font-weight:700;font-size:13px;white-space:nowrap;transition:all .2s}
.check.on{background:var(--green);border-color:var(--green);color:#fff;animation:popc .45s cubic-bezier(.2,1.8,.4,1)}
.chips{display:flex;flex-wrap:wrap;gap:6px;max-height:0;opacity:0;overflow:hidden;transition:max-height .45s cubic-bezier(.2,1,.3,1),opacity .3s}
.chips.open{max-height:96px;opacity:1}
.chip{border:1.5px solid var(--edge);background:var(--card);border-radius:99px;padding:5px 11px;font-weight:600;font-size:13px;transition:transform .15s,background .2s}
.chip:active{transform:scale(.93)}.chip.on{background:var(--mango);border-color:var(--ink)}
.soon{text-align:center;padding:14px 0;color:var(--muted)}.soon b{display:block;font:400 22px var(--serif);color:var(--tomato)}
.link{background:none;border:0;color:var(--green);font-weight:700;font-size:12px;text-decoration:underline;margin-top:6px}

/* photo slot: a real <img> covers the gradient+emoji; if it fails to load the slot stays */
.ph{position:relative;overflow:hidden;display:grid;place-items:center;background:linear-gradient(135deg,var(--a,#e9b96a),var(--b,#c9742f))}
.ph::before{content:attr(data-e);font-size:clamp(22px,3vw,44px);filter:drop-shadow(0 3px 3px rgba(0,0,0,.25));animation:bob 4s ease-in-out infinite;animation-delay:var(--pd,0s)}
.ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.92)}

/* modals */
.toast{position:absolute;left:50%;bottom:6%;translate:-50% 0;padding:11px 18px;background:var(--ink);color:var(--card);border-radius:8px;font-size:13px;box-shadow:var(--shadow);opacity:0;transform:translateY(20px);pointer-events:none;transition:opacity .25s,transform .35s cubic-bezier(.2,1.4,.4,1);z-index:40;white-space:nowrap}
.toast.show{opacity:1;transform:none}
.mb{position:absolute;inset:0;background:rgba(36,35,31,.78);display:grid;place-items:center;z-index:30;opacity:0;pointer-events:none;transition:opacity .25s;padding:10px}
.mb.open{opacity:1;pointer-events:auto}
.modal{width:min(430px,100%);max-height:96%;display:flex;flex-direction:column;gap:10px;background:var(--card);padding:18px;border:2px solid var(--ink);box-shadow:8px 8px 0 var(--ink);rotate:-1deg;scale:.92;translate:0 14px;transition:scale .4s cubic-bezier(.2,1.5,.4,1),translate .4s cubic-bezier(.2,1.5,.4,1)}
.mb.open .modal{scale:1;translate:0}
.modal h2{font:400 22px var(--serif);margin:0;display:flex;justify-content:space-between;align-items:center}
.x{border:0;background:none;font-size:18px}
.seg{display:flex;gap:6px;flex-wrap:wrap}
.acts{display:flex;gap:8px}.acts .btn{flex:1;padding:10px 6px}.acts .alt{background:transparent;color:var(--ink);border:1.5px solid var(--ink);box-shadow:none}
.sharecard{position:relative;width:min(100%,calc(44dvh*var(--ar,1.91)));aspect-ratio:var(--ar,1.91);margin:0 auto;container-type:size;display:flex;gap:4cqmin;padding:6cqmin;background:var(--paper);border:1px solid var(--edge);box-shadow:var(--shadow);overflow:hidden}
.sharecard.tall,.sharecard.sq{flex-direction:column}
.sc-l{flex:1;display:flex;flex-direction:column;justify-content:center;gap:1.5cqmin;min-width:0}
.sc-l small{font:700 3.8cqmin var(--sans);color:var(--tomato-d);letter-spacing:.14em;text-transform:uppercase}
.sc-l b{font:700 11cqmin/1.3 var(--sans);color:var(--green)}
.sc-l span{font:600 5cqmin var(--sans)}.sc-l i{font:italic 3.6cqmin var(--serif);color:var(--muted)}
.sc-r{flex:1;min-width:0;min-height:0;background:var(--card);border:1px solid var(--edge);padding:2cqmin;rotate:2deg;box-shadow:var(--shadow)}
.sc-r svg{width:100%;height:100%;display:block}
.sc-stamp{position:absolute;right:4cqmin;bottom:4cqmin;border:.8cqmin double var(--tomato);color:var(--tomato);border-radius:50%;width:15cqmin;aspect-ratio:1;display:grid;place-items:center;font:700 2.4cqmin var(--sans);rotate:-12deg;text-align:center}
.mlist{display:grid;gap:8px}
.mlist .rank{padding:7px 10px}.mlist .bb{height:6px;background:var(--sand);border-radius:9px;margin-top:4px;overflow:hidden}.mlist .bb i{display:block;height:100%;background:var(--tomato);width:var(--p)}
.bit{position:fixed;width:8px;height:12px;border-radius:50% 0;z-index:60;pointer-events:none;animation:fly .8s ease-out forwards}

/* responsive */
@media (min-width:761px) and (max-width:1100px){main{grid-template-columns:minmax(150px,21%) minmax(0,1fr) minmax(210px,27%)}.intro p,.tagline{display:none}}
@media (min-width:761px) and (max-height:780px){.intro p,.next p{display:none}.sub{margin:0}}
@media (min-width:761px) and (max-height:620px){.cards{display:none}}
@media (max-width:760px){
  .book{width:100vw;height:100dvh;border:0}
  header{min-height:54px}.brand-mark{width:34px;height:34px;font-size:18px}.tagline,.nav-hide{display:none}
  nav{gap:8px;font-size:13px}nav .cta{padding:7px 12px}
  main{padding:8px 10px;gap:8px;grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr) auto;grid-template-areas:"pass" "map" "panel"}
  .intro,.cards,.next,.top,.stamp,.compass{display:none}
  .passport{rotate:0deg;clip-path:none;padding:8px 12px}.passport .stats,.pass-head{display:none}.prow{margin:0}.bar{margin:6px 0 0}.ring{width:44px;height:44px}.ring::after{width:32px;height:32px}.num{font-size:19px}
  .panel{rotate:0deg;padding:10px 12px}.p-top{flex-direction:row;align-items:center;flex:none}.p-top .ph{flex:none;width:58px;height:58px;min-height:0;border-width:3px}.p-top .ph::before{font-size:26px}
  .p-info{flex:1;min-width:0}.p-name{font-size:17px}.chip{font-size:12px;padding:4px 9px}.chips.open{max-height:80px}
  .leaf{display:none}.mand-bg{inset:0}
}

/* motion: pieces settle onto the desk in sequence (translate/scale/opacity only, so each piece keeps its rotation) */
header{animation:rise .6s .05s backwards}
.intro{animation:rise .7s .2s backwards}
.map-zone{animation:rise .9s .3s backwards}
.passport{animation:drop .8s .45s cubic-bezier(.2,1.3,.4,1) backwards}
.pola{animation:drop .8s var(--d) cubic-bezier(.2,1.3,.4,1) backwards,float 8s calc(var(--d) + 1s) ease-in-out infinite}
.pola:nth-child(1){--d:.9s}.pola:nth-child(2){--d:1.05s}
.next{animation:drop .8s 1.3s cubic-bezier(.2,1.3,.4,1) backwards}
.top{animation:rise .8s 1.45s backwards}
.panel{animation:drop .8s 1.6s cubic-bezier(.2,1.3,.4,1) backwards}
.stamp{animation:slam .6s 1.8s cubic-bezier(.2,1.6,.4,1) backwards}
.leaf{animation:sway 6s ease-in-out infinite;transform-origin:50% 0}
.brand:hover .brand-mark{animation:wob .6s}
.tier.flip{animation:flip .6s cubic-bezier(.2,1.4,.4,1)}
.heart.on{animation:popc .45s cubic-bezier(.2,1.8,.4,1)}
@keyframes rise{from{opacity:0;translate:0 18px}}
@keyframes drop{from{opacity:0;translate:0 -30px;scale:.94}}
@keyframes cell{from{opacity:0;scale:.35}}
@keyframes slam{from{opacity:0;scale:2.4;rotate:-18deg}}
@keyframes popin{from{opacity:0;scale:.2;translate:0 -14px}}
@keyframes swap{from{opacity:0;translate:14px 0}}
@keyframes float{50%{translate:0 -5px}}
@keyframes bob{50%{translate:0 -4px}}
@keyframes sway{50%{rotate:6deg}}
@keyframes wave{50%{translate:12px 0}}
@keyframes drift{from{translate:-6px 0}to{translate:14px 3px}}
@keyframes spin{to{rotate:360deg}}
@keyframes popc{50%{scale:1.3}}
@keyframes wob{25%{rotate:-14deg}75%{rotate:14deg}}
@keyframes flip{from{opacity:0;rotate:x 90deg}}
@keyframes fly{to{transform:translate(var(--dx),var(--dy)) rotate(200deg);opacity:0}}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
