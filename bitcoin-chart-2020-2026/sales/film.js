// Absolute-time Canvas film. No accumulating state/randomness; seeking and worker order are irrelevant.
(function () {
  const P = globalThis.SALES, C = globalThis.TeslaSales, Studio = globalThis.Studio;
  const photos = {}, N = n => n.toLocaleString('en-US'), clamp = v => Math.max(0, Math.min(1,v));
  const text = (ctx, value, x, y, size=30, color='#F7F0F1', align='left', alpha=1) => {
    ctx.save(); ctx.globalAlpha = alpha; ctx.font = `700 ${size}px Inter`; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(value,x,y); ctx.restore();
  };
  function photo(ctx, id, x, y, w, h, alpha=1) {
    const im = photos[id]; ctx.save();ctx.globalAlpha=alpha;
    // Contain: preserve the full official photograph instead of cutting off the car.
    const k = Math.min(w/im.width,h/im.height), iw = im.width*k, ih=im.height*k;
    ctx.drawImage(im,x+(w-iw)/2,y+(h-ih)/2,iw,ih);ctx.restore();
  }
  function background(ctx,t) {
    ctx.fillStyle='#070507';ctx.fillRect(0,0,1920,1080);
    const g=ctx.createRadialGradient(1450,240,10,1150,450,1200);g.addColorStop(0,'#2B0D16');g.addColorStop(1,'#070507');ctx.fillStyle=g;ctx.fillRect(0,0,1920,1080);
    for(let i=0;i<45;i++) { const x=(i*271.3+Math.sin(t*.11+i)*8)%1920,y=(i*173.7+t*(1+i%3))%1080;
      ctx.globalAlpha=.10+.08*Math.sin(t*.6+i)**2;ctx.fillStyle='#FF8592';ctx.beginPath();ctx.arc(x,y,1+i%2,0,Math.PI*2);ctx.fill(); }
    ctx.globalAlpha=1;
  }
  function pulse(ctx,t) {
    const hit=P.events.filter(e=>e.t<=t&&t<e.t+.55).at(-1);if(!hit)return;
    const p=(t-hit.t)/.55;ctx.save();ctx.globalAlpha=(1-p)*.4;ctx.strokeStyle='#FF5360';ctx.lineWidth=3;ctx.beginPath();ctx.arc(1765,130,20+p*90,0,Math.PI*2);ctx.stroke();ctx.restore();
  }
  function bars(ctx,state,{x=430,y=300,w=1110,dy=130,small=false,models=null,detail=false}={}) {
    const rows=state.rows.filter(r=>r.visible&&(!models||models.includes(r.model.id)));
    const targetOrder=rows.slice().sort((a,b)=>a.rank-b.rank);
    const ceiling=detail?Math.max(10000,Math.ceil(Math.max(...rows.map(r=>r.units))/10000)*10000):P.axisMax;
    const divisions=small?2:4,step=ceiling/divisions, rowHeight=small?32:58;
    text(ctx,detail?'DETAIL SCALE · GLOBAL DELIVERIES':'GLOBAL QUARTERLY DELIVERIES',x,y-55,small?21:24,'#C5ABB2');
    for(let i=0;i<=divisions;i++) {
      const xx=x+w*i/divisions;ctx.strokeStyle='#FFFFFF16';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(xx,y-24);ctx.lineTo(xx,y+(detail?rows.length:5)*dy-30);ctx.stroke();
      text(ctx,N(step*i),xx,y-15,small?17:21,'#A98F98',i===0?'left':i===divisions?'right':'center');
    }
    for(const r of rows) {
      const rank=detail?targetOrder.indexOf(r):r.rank,yy=y+rank*dy;
      const width=Math.max(0,r.visualUnits/ceiling*w);
      ctx.save();ctx.shadowColor=r.model.color;ctx.shadowBlur=12*(globalThis.G.scale||1);ctx.globalAlpha=.85;ctx.fillStyle=r.model.color;ctx.fillRect(x,yy,width,rowHeight);ctx.restore();
      ctx.fillStyle='#FFFFFF55';ctx.fillRect(x,yy,width,2);
      const alpha=state.f>0&&state.f<1?0:1;
      if(!small)photo(ctx,r.model.id,x-175,yy-8,140,82,alpha);
      text(ctx,r.model.name,x-(small?22:185),yy+rowHeight*.72,small?23:27,r.model.color,'right',alpha);
      if(r.displayUnits!==null)text(ctx,(r.status==='estimated'?'≈ ':'')+N(r.displayUnits),x+w+35,yy+rowHeight*.72,small?24:34,'#FFFFFF','left',r.labelAlpha);
      if(!small&&r.yoy!==null)text(ctx,`${r.yoy>=0?'+':''}${r.yoy.toFixed(1)}% YoY`,x+w+35,yy+rowHeight+27,21,'#BBA6AD','left',r.labelAlpha);
    }
  }
  function context(ctx,state) {
    photo(ctx,'logo',100,80,62,65);text(ctx,'TESLA',190,125,40);
    text(ctx,state.chapter?.title.toUpperCase()||'',100,195,27,'#BDA7AE');
    text(ctx,state.quarter,1810,141,70,'#FFFFFF','right');
    const estimates=state.rows.some(r=>r.visible&&r.status==='estimated');
    text(ctx,estimates?P.storyboard.estimateCaption:'ISSUER-REPORTED MODEL DATA',1810,193,21,'#BAA1AA','right');
    text(ctx,'WORLDWIDE · PASSENGER VEHICLES · MODEL-LEVEL DATA',100,1000,20,'#9B828C');
    const absent=state.rows.filter(r=>!r.visible).map(r=>r.model.name);
    if(absent.length)text(ctx,absent.join(' / ')+' · NOT LAUNCHED',1810,1000,20,'#9B828C','right');
    ctx.fillStyle='#FF536044';ctx.fillRect(100,1030,1710,3);ctx.fillStyle='#FF5360';ctx.fillRect(100,1030,1710*clamp(state.t/P.duration),3);
  }
  function intro(ctx,t) {
    photo(ctx,'logo',894,70,132,130);text(ctx,'FIVE MODELS.',960,298,82,'#FFFFFF','center');text(ctx,'ONE RACE.',960,397,82,'#FF5360','center');
    text(ctx,'GLOBAL QUARTERLY DELIVERIES · 2015–2026 Q3',960,471,30,'#CBB6BD','center');
    P.config.models.forEach((m,i)=>{const a=clamp((t-.5-i*.35)/.6),x=95+i*350;photo(ctx,m.id,x,570,330,230,a);text(ctx,m.name,x+165,854,32,m.color,'center',a);});
    text(ctx,'ONE BAR PER MODEL · REAL QUARTERS · SOURCED ESTIMATES MARKED',960,975,23,'#AD949E','center');
  }
  function panel(ctx,state) {
    const s=state.segment,ids=s.models||state.rows.filter(r=>r.visible).map(r=>r.model.id),chosen=state.rows.filter(r=>r.visible&&ids.includes(r.model.id));
    text(ctx,s.title.toUpperCase(),100,272,42);
    if(s.panelKind==='spotlight') {
      text(ctx,'A CLOSER LOOK · SEPARATE SCALE',100,333,26,'#C5ABB2');
      bars(ctx,state,{x:500,y:440,w:940,dy:150,models:ids,detail:true});return;
    }
    const display=chosen.slice(0,2);
    display.forEach((r,i)=>{const p=clamp((state.t-s.t0)/s.duration);photo(ctx,r.model.id,100+i*340+8*Math.sin(p*Math.PI),320,320,220,clamp((state.t-s.t0)/.65));});
    bars(ctx,state,{x:1120,y:335,w:405,dy:103,small:true});
    if(s.panelKind==='head-to-head') {
      const a=chosen.find(r=>r.model.id===ids[0]),b=chosen.find(r=>r.model.id===ids[1]);
      if(a&&b) {text(ctx,a.model.name+' / '+b.model.name,100,620,30,'#BAA1AA');text(ctx,`${N(a.units)} / ${N(b.units)}`,100,694,55);text(ctx,'QUARTERLY GAP  '+N(Math.abs(a.units-b.units)),100,758,29,'#FF8E9B');}
    } else if(s.panelKind==='launch') {
      const a=chosen[0];if(a){text(ctx,a.model.name,100,620,46,a.model.color);text(ctx,(a.status==='estimated'?'≈ ':'')+N(a.units)+' DELIVERED',100,695,48);text(ctx,'FIRST DELIVERY QUARTER · WORLDWIDE',100,757,25,'#BAA1AA');}
    } else {
      const metrics=chosen.map(r=>{
        if(s.panelKind==='annual') {
          const year=state.quarter.slice(0,4),data=P.rows.filter(a=>a.model===r.model.id&&a.quarter.startsWith(year)&&C.active(a));
          return {r,value:data.reduce((a,b)=>a+b.units,0),estimated:data.some(a=>a.status==='estimated')};
        }
        return {r,value:r.yoy,estimated:r.status==='estimated'};
      });
      text(ctx,s.panelKind==='annual'?'CALENDAR-YEAR DELIVERIES':'QUARTERLY DELIVERIES · CHANGE VS PRIOR YEAR',100,620,24,'#BAA1AA');
      metrics.forEach(({r,value,estimated},i)=>{const yy=675+i*49;text(ctx,r.model.name,100,yy,27,r.model.color);text(ctx,value===null?'N/A':(estimated?'≈ ':'')+(s.panelKind==='annual'?N(value):`${value>=0?'+':''}${value.toFixed(1)}%`),740,yy,30,'#FFFFFF','right');});
    }
  }
  function summary(ctx,state) {
    text(ctx,'THE RESULTS',100,287,66);text(ctx,P.storyboard.summaryCaption,100,348,27,'#C5ABB2');
    const totals=P.config.models.map(m=>({m,rows:P.rows.filter(r=>r.model===m.id&&C.active(r))})).map(a=>({...a,total:a.rows.reduce((n,r)=>n+r.units,0)})).sort((a,b)=>b.total-a.total);
    totals.forEach((a,i)=>{const y=420+i*100;photo(ctx,a.m.id,100,y-20,175,90);text(ctx,String(i+1).padStart(2,'0'),310,y+35,35,'#92727D');text(ctx,a.m.name,415,y+35,42,a.m.color);text(ctx,(a.rows.some(r=>r.status==='estimated')?'≈ ':'')+N(a.total),1750,y+35,45,'#FFFFFF','right');});
    text(ctx,'SELECTED PERIOD ONLY · NO ROADSTER OR SEMI · SOURCES IN DESCRIPTION',100,971,21,'#AA909A');
  }
  function draw(ctx,t) {
    if (P.renderWindow && (t < P.renderWindow[0]-1e-8 || t >= P.renderWindow[1]+1e-8)) throw new Error('Frame outside authorized verified preview');
    background(ctx,t);const state=C.stateAt(P,t);
    if(state.segment.kind==='intro')intro(ctx,t);
    else {context(ctx,state);if(state.segment.kind==='panel')panel(ctx,state);else if(state.segment.kind==='summary')summary(ctx,state);else bars(ctx,state);pulse(ctx,t);}
    if(P.renderWindow) text(ctx,'RESEARCH PREVIEW · PUBLISHED ESTIMATES MARKED ≈',960,1057,19,'#BEA6AE','center');
  }
  globalThis.SalesScene={draw};
  Studio.film({draw,duration:P.duration,fadeOut:1.4,post:{grain:0,paper:0,vignette:.10},init:async()=>{
    const approval=await Studio.loadJSON('render-approval.json');
    if(!approval?.approved||approval.contentHash!==P.contentHash||!approval.evidence)throw new Error('Sales review pending; no frames permitted.');
    await Promise.all(Object.entries(P.assets).map(async([id,url])=>{photos[id]=await Studio.loadImage(url);}));
  }});
})();
