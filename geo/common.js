/* 地理互动馆 · 共享：课程导航、翻页、分享弹窗、SVG 小工具 */
(function(){
'use strict';
const MODULES=[
 {id:'earth',href:'earth.html',no:1,title:'地球与经纬网',short:'经纬网与自转'},
 {id:'seasons',href:'seasons.html',no:2,title:'公转与四季',short:'公转与四季'},
 {id:'terrain',href:'terrain.html',no:3,title:'地图与地形',short:'地图与地形'},
 {id:'climate',href:'climate.html',no:4,title:'天气与气候',short:'天气与气候'},
 {id:'water',href:'water.html',no:5,title:'水循环与河流',short:'水循环与河流'},
 {id:'regions',href:'regions.html',no:6,title:'中国与世界地理',short:'中国与世界'},
 {id:'bayarea',href:'bayarea.html',no:7,title:'粤港澳大湾区与深圳',short:'大湾区与深圳'},
 {id:'china',href:'china.html',no:8,title:'中国的疆域与人口',short:'疆域与人口'},
 {id:'hazards',href:'hazards.html',no:9,title:'天气预报与自然灾害',short:'天气与灾害'},
 {id:'economy',href:'economy.html',no:10,title:'中国的产业与交通',short:'产业与交通'},
 {id:'plates',href:'plates.html',no:11,title:'海陆变迁与板块运动',short:'板块运动'},
 {id:'people',href:'people.html',no:12,title:'世界的居民与文化',short:'居民与文化'},
 {id:'resources',href:'resources.html',no:13,title:'中国的自然资源',short:'自然资源'},
 {id:'zones',href:'zones.html',no:14,title:'中国的地域差异与区域发展',short:'地域差异'},
 {id:'areas',href:'areas.html',no:15,title:'了解地区',short:'了解地区'},
 {id:'countries',href:'countries.html',no:16,title:'走近国家',short:'走近国家'},
 {id:'continents',href:'continents.html',no:17,title:'认识大洲',short:'认识大洲'},
 {id:'northeast',href:'northeast.html',no:18,title:'东北地区',short:'东北地区'},
 {id:'places',href:'places.html',no:19,title:'区域地理环境与未来图景',short:'京台新黔'},
 {id:'green',href:'green.html',no:20,title:'建设永续发展的美丽中国',short:'美丽中国'}
];
const $=id=>document.getElementById(id);
const current=document.body.dataset.module||'';
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');

function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
const S={
 path:(d,stroke,w=1,fill='none',extra='')=>'<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round" '+extra+'/>',
 line:(x1,y1,x2,y2,stroke,w=1,extra='')=>'<path d="M'+x1.toFixed(2)+' '+y1.toFixed(2)+'L'+x2.toFixed(2)+' '+y2.toFixed(2)+'" fill="none" stroke="'+stroke+'" stroke-width="'+w+'" stroke-linecap="round" '+extra+'/>',
 circle:(x,y,r,fill,stroke='none',w=1,extra='')=>'<circle cx="'+x.toFixed(2)+'" cy="'+y.toFixed(2)+'" r="'+r+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+w+'" '+extra+'/>',
 rect:(x,y,w,h,fill,r=0,extra='')=>'<rect x="'+x.toFixed(2)+'" y="'+y.toFixed(2)+'" width="'+Math.max(0,w).toFixed(2)+'" height="'+Math.max(0,h).toFixed(2)+'" rx="'+r+'" fill="'+fill+'" '+extra+'/>',
 text:(x,y,s,size=11,fill='#203b35',weight=400,anchor='start',extra='')=>'<text x="'+x.toFixed(2)+'" y="'+y.toFixed(2)+'" font-size="'+size+'" font-weight="'+weight+'" fill="'+fill+'" text-anchor="'+anchor+'" '+extra+'>'+esc(s)+'</text>',
 arrow:(id,color)=>'<marker id="'+id+'" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="'+color+'"/></marker>'
};
function svgPoint(svg,evt){
 const pt=svg.createSVGPoint();pt.x=evt.clientX;pt.y=evt.clientY;
 const m=svg.getScreenCTM();if(!m)return {x:0,y:0};
 const p=pt.matrixTransform(m.inverse());return {x:p.x,y:p.y};
}
function setRange(input,value,label){
 input.value=value;
 const min=Number(input.min),max=Number(input.max);
 input.style.setProperty('--position',((value-min)/(max-min)*100)+'%');
 if(label)input.setAttribute('aria-valuetext',label);
}
function pressed(group,btn){for(const b of group.querySelectorAll('button')){const on=b===btn;b.setAttribute('aria-pressed',String(on));b.classList.toggle('selected',on);}}
function replaceHash(h){try{history.replaceState(null,'',h?('#'+h):location.pathname+location.search);}catch(e){/* file:// 或受限环境 */}}

/* 课程导航与翻页 */
const nav=$('course-nav');
if(nav)nav.innerHTML=MODULES.map(m=>'<a href="'+m.href+'"'+(m.id===current?' aria-current="page"':'')+'><b>'+m.no+'</b>'+m.short+'</a>').join('');
if(nav){const cur=nav.querySelector('[aria-current]');if(cur&&cur.scrollIntoView)requestAnimationFrame(()=>{nav.scrollLeft=Math.max(0,cur.offsetLeft-nav.clientWidth/2+cur.clientWidth/2);});}
const pager=$('pager'),idx=MODULES.findIndex(m=>m.id===current);
if(pager&&idx>=0){
 const prev=MODULES[idx-1],next=MODULES[idx+1];
 pager.innerHTML=(prev?'<a class="prev" href="'+prev.href+'">← 上一课<strong>'+prev.title+'</strong></a>':'<a class="prev" href="index.html">← 返回<strong>全部课程</strong></a>')+
  (next?'<a class="next" href="'+next.href+'">下一课 →<strong>'+next.title+'</strong></a>':'<a class="next" href="index.html">完成 →<strong>回到课程首页</strong></a>');
}

/* 分享弹窗：复制当前页链接（含当前状态的 # 参数） */
document.body.insertAdjacentHTML('beforeend','<div class="modal-backdrop" id="share-modal" hidden><section class="share-dialog" role="dialog" aria-modal="true" aria-labelledby="share-title" tabindex="-1"><button class="close" id="close-share" aria-label="关闭分享">×</button><span class="small-label">地理互动馆</span><h2 id="share-title">发给微信好友</h2><p id="share-desc">复制下面的链接，粘贴到微信聊天。好友打开后看到的是你现在这一页、这一步的状态。</p><label for="share-url">分享链接</label><input id="share-url" type="text" readonly><button id="copy-link" class="primary">复制链接</button><p class="copy-status" id="copy-status" role="status"></p><div class="wechat-tip">在微信中打开后，也可以点右上角「…」→「发送给朋友」。若无法复制，长按链接全选复制即可。</div><p class="share-disclaimer">这是网页链接，不是小程序卡片；聊天里显示的样式由微信决定。</p></section></div>');
let stateHook=null,previousFocus=null;
function shareUrl(){const u=new URL(location.href);const h=stateHook?stateHook():u.hash.replace(/^#/,'');u.hash=h||'';return u.href;}
function openShare(){previousFocus=document.activeElement;document.dispatchEvent(new CustomEvent('geo:share-open'));$('share-url').value=shareUrl();$('copy-status').textContent='';$('share-modal').hidden=false;document.body.classList.add('modal-open');$('close-share').focus();}
function closeShare(){$('share-modal').hidden=true;document.body.classList.remove('modal-open');if(previousFocus&&previousFocus.focus)previousFocus.focus();}
async function copyLink(){
 const input=$('share-url');let copied=false;
 try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(input.value);copied=true;}}catch(e){/* 走下面的降级 */}
 if(!copied){input.focus();input.select();input.setSelectionRange(0,input.value.length);try{copied=document.execCommand('copy');}catch(e){copied=false;}}
 $('copy-status').textContent=copied?'链接已复制，打开微信粘贴给好友即可。':'浏览器未允许自动复制，请长按上方链接全选复制。';
}
for(const b of document.querySelectorAll('[data-share]'))b.addEventListener('click',()=>{openShare();if(b.dataset.share==='copy')copyLink();});
$('close-share').addEventListener('click',closeShare);
$('copy-link').addEventListener('click',copyLink);
$('share-url').addEventListener('click',e=>e.target.select());
$('share-modal').addEventListener('click',e=>{if(e.target===$('share-modal'))closeShare();});
document.addEventListener('keydown',e=>{
 if($('share-modal').hidden)return;
 if(e.key==='Escape'){closeShare();return;}
 if(e.key==='Tab'){const t=Array.from($('share-modal').querySelectorAll('button,input')),first=t[0],last=t[t.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
});

/* 选择题：data-answer 指向正确选项 */
function optionQuiz(container,{answer,onAnswer}){
 const buttons=Array.from(container.querySelectorAll('button'));
 for(const b of buttons)b.addEventListener('click',()=>{
  const ok=b.dataset.value===answer;
  for(const o of buttons){o.classList.remove('correct','wrong');}
  b.classList.add(ok?'correct':'wrong');
  if(ok)for(const o of buttons)if(o.dataset.value===answer)o.classList.add('correct');
  if(onAnswer)onAnswer(ok,b.dataset.value);
 });
 return ()=>{for(const o of buttons)o.classList.remove('correct','wrong');};
}

const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
// 配对题：items=[[题干,答案值]]，options=[[值,显示名]]；每行只能答一次
function matchRows(listId,scoreId,items,options,explain){
 const list=$(listId);let done=0,right=0;
 list.innerHTML=items.map(([t],i)=>'<div class="choice-row" data-i="'+i+'" style="flex-direction:column;align-items:stretch"><p><b>'+esc(t)+'</b></p><div class="chips small" style="flex-wrap:wrap;justify-content:flex-start">'+(typeof options==='function'?options(i):options).map(([v,l])=>'<button data-v="'+esc(v)+'">'+esc(l)+'</button>').join('')+'</div><p class="verdict" hidden></p></div>').join('');
 for(const row of list.querySelectorAll('.choice-row')){
  const [t,ans]=items[Number(row.dataset.i)];
  for(const b of row.querySelectorAll('button'))b.addEventListener('click',()=>{
   if(row.dataset.done)return;row.dataset.done='1';done++;
   const ok=b.dataset.v===String(ans);if(ok)right++;
   row.classList.add(ok?'correct':'wrong');pressed(row.querySelector('.chips'),b);
   const v=row.querySelector('.verdict');v.hidden=false;v.textContent=(ok?'✓ ':'✗ ')+explain(t,ans,ok);
   $(scoreId).textContent=done===items.length?'答对 '+right+' / '+items.length:'已答 '+done+' / '+items.length;
  });
 }
}
// 三题小测验：qs=[{title,opts:[[v,l]],answer,yes,no}]
function runQuiz(qs){
 let qi=0;
 const show=()=>{const q=qs[qi];$('quiz-title').textContent=q.title;$('quiz-step').textContent=(qi+1)+' / '+qs.length;
  $('quiz-options').innerHTML=shuffle(q.opts).map(([v,l])=>'<button data-value="'+v+'">'+esc(l)+'</button>').join('');$('quiz-feedback').textContent='';$('quiz-feedback').className='feedback';$('next-question').hidden=true;
  optionQuiz($('quiz-options'),{answer:q.answer,onAnswer:ok=>{$('quiz-feedback').textContent=ok?q.yes:q.no;$('quiz-feedback').className='feedback '+(ok?'success':'retry');$('next-question').hidden=!ok;$('next-question').textContent=qi===qs.length-1?'完成，再练一次':'下一题';}});};
 $('next-question').addEventListener('click',()=>{qi=(qi+1)%qs.length;show();});
 show();
}
window.Site={MODULES,$,S,esc,svgPoint,setRange,pressed,replaceHash,reduce,optionQuiz,shuffle,matchRows,runQuiz,
 setShareState(fn){stateHook=fn;},openShare,copyLink};
})();
