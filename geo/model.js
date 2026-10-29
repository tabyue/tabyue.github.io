/* 地理互动馆 · 纯计算模块（无 DOM），可在 Node 中单元测试。
   不含任何地图边界、海岸线数据。 */
(function(root){
'use strict';
const rad=d=>d*Math.PI/180, deg=r=>r*180/Math.PI;
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
const mod=(v,m)=>((v%m)+m)%m;
function normLon(v){return mod(v+180,360)-180;}

/* ---------- 经纬度文字 ---------- */
function longitudeText(v){if(v===0)return '0°';if(Math.abs(v)===180)return '180°';return Math.abs(v)+'°'+(v>0?'E':'W');}
function latitudeText(v){return v===0?'0°':Math.abs(v)+'°'+(v>0?'N':'S');}
function hemispheres(lon,lat){
 if(Math.abs(lat)===90)return {ns:lat>0?'北极':'南极',ew:'经线在极点汇聚'};
 const l=normLon(lon);
 return {ns:lat===0?'南北半球分界':lat>0?'北半球':'南半球',ew:(l===-20||l===160)?'东西半球分界':(l>-20&&l<160)?'东半球':'西半球'};
}
function description(lon,lat){
 if(Math.abs(lat)===90)return (lat>0?'北极':'南极')+'：所有经线在这里相交，不能用不同经度区分极点位置。';
 const a=lon===0?'本初子午线':Math.abs(lon)===180?'180° 经线':(lon>0?'东经 ':'西经 ')+Math.abs(lon)+'°';
 const b=lat===0?'赤道':(lat>0?'北纬 ':'南纬 ')+Math.abs(lat)+'°';
 return a+'与'+b+'的交点。';
}

/* ---------- 正射投影球体 ----------
   相机坐标：X 向右，Y 向上，Z 指向观察者；最后按 tilt 旋转到屏幕。 */
function camVec(lon,lat,camera){
 const l=rad(lon-camera.lon),p=rad(lat),e=rad(camera.lat);
 return [Math.cos(p)*Math.sin(l),
  Math.sin(p)*Math.cos(e)-Math.cos(p)*Math.cos(l)*Math.sin(e),
  Math.sin(p)*Math.sin(e)+Math.cos(p)*Math.cos(l)*Math.cos(e)];
}
function toScreen(X,Y,camera){
 const {cx=194,cy=160,r=112,tilt=-14}=camera,t=rad(tilt);
 return {x:cx+r*(X*Math.cos(t)+Y*Math.sin(t)),y:cy+r*(X*Math.sin(t)-Y*Math.cos(t))};
}
function project(lon,lat,camera){const v=camVec(lon,lat,camera),s=toScreen(v[0],v[1],camera);return {x:s.x,y:s.y,z:v[2]};}
function visiblePath(coords,camera){
 let d='',prev=null;
 const pt=p=>p.x.toFixed(2)+' '+p.y.toFixed(2);
 for(const [lon,lat] of coords){
  const p=project(lon,lat,camera);
  if(prev&&(p.z>=0)!==(prev.z>=0)){
   const a=prev.z/(prev.z-p.z);
   d+=(p.z>=0?'M':'L')+pt({x:prev.x+a*(p.x-prev.x),y:prev.y+a*(p.y-prev.y)});
  }
  if(p.z>=0)d+=(prev?'L':'M')+pt(p);
  prev=p;
 }
 return d.replace(/^L/,'M');
}
function meridian(lon){return Array.from({length:91},(_,i)=>[lon,-90+i*2]);}
function parallel(lat){return Array.from({length:181},(_,i)=>[-180+i*2,lat]);}

/* ---------- 自转与昼夜 ---------- */
// 北京时间 = 120°E 的地方时（不计均时差）。12:00 时太阳直射 120°E。
function subsolarLongitude(beijingHour){return normLon(120-15*(beijingHour-12));}
function localTime(beijingHour,lon){return mod(beijingHour+(lon-120)/15,24);}
function timeText(h){const m=Math.round(mod(h,24)*60)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}
function sunDot(lon,lat,sLon,sLat){
 const a=rad(lat),b=rad(sLat),d=rad(lon-sLon);
 return Math.cos(a)*Math.cos(b)*Math.cos(d)+Math.sin(a)*Math.sin(b);
}
// 正射球面上“夜半球”的可见部分（屏幕路径）。返回 {night, terminator}
function nightShape(camera,sLon,sLat){
 const s=camVec(sLon,sLat,camera),h=Math.hypot(s[0],s[1]),N=96;
 const scr=(X,Y)=>{const p=toScreen(X,Y,camera);return p.x.toFixed(2)+' '+p.y.toFixed(2);};
 if(h<1e-6){
  if(s[2]>0)return {night:'',terminator:''};
  let d='';for(let i=0;i<=N;i++){const u=2*Math.PI*i/N;d+=(i?'L':'M')+scr(Math.cos(u),Math.sin(u));}
  return {night:d+'Z',terminator:''};
 }
 const e1=[s[1]/h,-s[0]/h,0];
 const e2=[s[1]*e1[2]-s[2]*e1[1],s[2]*e1[0]-s[0]*e1[2],s[0]*e1[1]-s[1]*e1[0]];
 let term='';
 for(let i=0;i<=N;i++){const t=Math.PI+Math.PI*i/N;term+=(i?'L':'M')+scr(Math.cos(t)*e1[0]+Math.sin(t)*e2[0],Math.cos(t)*e1[1]+Math.sin(t)*e2[1]);}
 const an=Math.atan2(-s[1],-s[0]);
 let limb='';
 for(let i=0;i<=N;i++){const u=an+Math.PI/2-Math.PI*i/N;limb+='L'+scr(Math.cos(u),Math.sin(u));}
 return {night:term+limb+'Z',terminator:term};
}

/* ---------- 公转与四季 ---------- */
const DAY_MS=86400000;
// 低精度太阳位置（《天文年历》近似公式，赤纬误差约 0.01°）
function sunPosition(date){
 const n=date.getTime()/DAY_MS+2440587.5-2451545.0;
 const L=mod(280.460+0.9856474*n,360);
 const g=rad(mod(357.528+0.9856003*n,360));
 const lambda=mod(L+1.915*Math.sin(g)+0.020*Math.sin(2*g),360);
 const eps=23.439-0.0000004*n;
 return {lambda,eps,decl:deg(Math.asin(Math.sin(rad(eps))*Math.sin(rad(lambda))))};
}
function daysInYear(y){return ((y%4===0&&y%100!==0)||y%400===0)?366:365;}
function dayOfYear(y,m,d){return Math.round((Date.UTC(y,m-1,d)-Date.UTC(y,0,1))/DAY_MS)+1;}
function dateOf(y,doy){const d=new Date(Date.UTC(y,0,doy));return {month:d.getUTCMonth()+1,day:d.getUTCDate()};}
function beijingNoon(y,doy){return new Date(Date.UTC(y,0,doy,4,0,0));}
function declinationOn(y,doy){return sunPosition(beijingNoon(y,doy)).decl;}
const TERMS=[[0,'春分'],[90,'夏至'],[180,'秋分'],[270,'冬至']];
// 逐小时扫描黄经穿越 0/90/180/270°，返回北京时间日期
function seasonMarkers(y){
 const out=[],start=Date.UTC(y,0,1,-8),end=Date.UTC(y+1,0,1,-8);
 let prev=sunPosition(new Date(start)).lambda;
 for(let t=start+3600000;t<=end;t+=3600000){
  const cur=sunPosition(new Date(t)).lambda;
  for(const [target,name] of TERMS){
   const crossed=target===0?(prev>300&&cur<60):(prev<target&&cur>=target);
   if(crossed){const bj=new Date(t+8*3600000),m=bj.getUTCMonth()+1,d=bj.getUTCDate();out.push({name,target,month:m,day:d,doy:dayOfYear(y,m,d)});}
  }
  prev=cur;
 }
 return out.sort((a,b)=>a.doy-b.doy);
}
// 昼长（小时）：几何算法，不计大气折射与太阳视半径
function dayLength(lat,decl){
 if(Math.abs(lat)>=89.9999)return Math.abs(decl)<1e-9?12:(lat*decl>0?24:0);
 const x=-Math.tan(rad(lat))*Math.tan(rad(decl));
 if(x<=-1)return 24;if(x>=1)return 0;
 return 2*deg(Math.acos(x))/15;
}
function noonAltitude(lat,decl){return 90-Math.abs(lat-decl);}
function hoursText(h){if(h>=24)return '24 小时（极昼）';if(h<=0)return '0 小时（极夜）';const m=Math.round(h*60);return Math.floor(m/60)+' 小时 '+(m%60)+' 分';}
// 某纬度一年内太阳直射的日期（北京时间正午取样，相邻两日跨越即记为直射日）
function directSunDates(y,lat){
 const n=daysInYear(y),out=[];
 let prev=declinationOn(y,1)-lat;
 for(let i=2;i<=n;i++){
  const cur=declinationOn(y,i)-lat;
  if(prev===0||prev*cur<0){const pick=Math.abs(prev)<Math.abs(cur)?i-1:i;if(!out.length||pick-out[out.length-1]>3)out.push(pick);}
  prev=cur;
 }
 return out.map(d=>Object.assign({doy:d},dateOf(y,d)));
}

/* ---------- 地图与地形：合成地形 ---------- */
const TERRAIN={w:100,h:70,kmPerUnit:0.1};
function segInfo(x,y,ax,ay,bx,by){
 const dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy,t=clamp(((x-ax)*dx+(y-ay)*dy)/l2,0,1);
 return [Math.hypot(x-ax-t*dx,y-ay-t*dy),t];
}
function terrainHeight(x,y){
 // 主峰 A：带向西南、向南两条山脊；次峰 B：东坡陡、西坡缓
 const ga=Math.exp(-(((x-33)**2)/(2*(x<33?11:8)**2)+((y-28)**2)/(2*8**2)));
 const gb=Math.exp(-(((x-72)**2)/(2*(x<72?10:4.6)**2)+((y-30)**2)/(2*8**2)));
 const [d1,t1]=segInfo(x,y,33,28,10,62),[d2,t2]=segInfo(x,y,33,28,45,66);
 const s1=760*Math.exp(-(d1*d1)/(2*4.2*4.2))*Math.pow(1-t1,1.1);
 const s2=700*Math.exp(-(d2*d2)/(2*4*4))*Math.pow(1-t2,1.2);
 const a=820*ga,b=600*gb;
 const mA=Math.pow(a**8+s1**8+s2**8,.125);
 return 40+mA+b;
}
function makeGrid(fn,w,h,step){
 const nx=Math.round(w/step),ny=Math.round(h/step),v=new Float64Array((nx+1)*(ny+1));
 for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++)v[j*(nx+1)+i]=fn(i*step,j*step);
 return {nx,ny,step,v};
}
// marching squares：返回线段数组 [x1,y1,x2,y2]
function contourSegments(grid,level){
 const {nx,ny,step,v}=grid,out=[],W=nx+1;
 const lerp=(a,b)=>(level-a)/(b-a);
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
  const a=v[j*W+i],b=v[j*W+i+1],c=v[(j+1)*W+i+1],d=v[(j+1)*W+i];
  const k=(a>=level?8:0)|(b>=level?4:0)|(c>=level?2:0)|(d>=level?1:0);
  if(k===0||k===15)continue;
  const x=i*step,y=j*step;
  const T=[x+lerp(a,b)*step,y],R=[x+step,y+lerp(b,c)*step],B=[x+lerp(d,c)*step,y+step],L=[x,y+lerp(a,d)*step];
  const add=(p,q)=>out.push([p[0],p[1],q[0],q[1]]);
  const centre=(a+b+c+d)/4>=level;
  switch(k){
   case 1:case 14:add(L,B);break;case 2:case 13:add(B,R);break;case 3:case 12:add(L,R);break;
   case 4:case 11:add(T,R);break;case 6:case 9:add(T,B);break;case 7:case 8:add(L,T);break;
   case 5:if(centre){add(L,T);add(B,R);}else{add(L,B);add(T,R);}break;
   case 10:if(centre){add(T,R);add(L,B);}else{add(L,T);add(B,R);}break;
  }
 }
 return out;
}
function terrainProfile(ax,ay,bx,by,n=160){
 const pts=[];
 for(let i=0;i<=n;i++){const t=i/n,x=ax+(bx-ax)*t,y=ay+(by-ay)*t;pts.push({t,x,y,h:terrainHeight(x,y)});}
 return pts;
}
function localMax(x,y){
 let step=1;
 for(let k=0;k<400;k++){
  let best=[x,y],bh=terrainHeight(x,y);
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const h=terrainHeight(x+dx*step,y+dy*step);if(h>bh){bh=h;best=[x+dx*step,y+dy*step];}}
  if(best[0]===x&&best[1]===y){if(step<0.05)break;step/=2;}else{x=best[0];y=best[1];}
 }
 return {x,y,h:terrainHeight(x,y)};
}
let featureCache=null;
function terrainFeatures(){
 if(featureCache)return featureCache;
 const A=localMax(33,28),B=localMax(72,30);
 // 鞍部：两峰连线上的最低点，再沿垂直方向取最高点
 let low={h:Infinity};
 for(let i=0;i<=200;i++){const t=i/200,x=A.x+(B.x-A.x)*t,y=A.y+(B.y-A.y)*t,h=terrainHeight(x,y);if(t>.1&&t<.9&&h<low.h)low={x,y,h};}
 let saddle=low;
 for(let dy=-8;dy<=8;dy+=.1){const h=terrainHeight(low.x,low.y+dy);if(h>saddle.h||saddle===low)saddle={x:low.x,y:low.y+dy,h};}
 // 山谷：两条山脊之间 y=50 处的最低点
 let valley={h:Infinity};
 for(let x=20;x<=38;x+=.1){const h=terrainHeight(x,50);if(h<valley.h)valley={x,y:50,h};}
 const t=.45,ridgeX=33+(10-33)*t,ridgeY=28+(62-28)*t;
 featureCache={
  peakA:Object.assign({name:'山峰（主峰）'},A),
  peakB:Object.assign({name:'山峰（次峰）'},B),
  saddle:Object.assign({name:'鞍部'},saddle),
  ridge:{name:'山脊',x:ridgeX,y:ridgeY,h:terrainHeight(ridgeX,ridgeY)},
  valley:Object.assign({name:'山谷'},valley),
  steep:{name:'陡坡（次峰东坡）',x:B.x+6,y:B.y,h:terrainHeight(B.x+6,B.y)},
  gentle:{name:'缓坡（次峰西坡）',x:B.x-9,y:B.y,h:terrainHeight(B.x-9,B.y)}
 };
 return featureCache;
}
// 沿某方向从点出发，海拔下降 dh 所需的水平距离（地图单位）
function runForDrop(x,y,dirX,dirY,dh){
 const h0=terrainHeight(x,y),n=Math.hypot(dirX,dirY);
 for(let s=0;s<60;s+=.05){if(h0-terrainHeight(x+dirX/n*s,y+dirY/n*s)>=dh)return s;}
 return Infinity;
}

/* ---------- 天气与气候：1991–2020 气候标准值 ---------- */
const CLIMATE_TYPES={
 tropicalRainforest:{name:'热带雨林气候',trait:'全年高温多雨'},
 tropicalDesert:{name:'热带沙漠气候',trait:'全年炎热干燥'},
 mediterranean:{name:'地中海气候',trait:'夏季炎热干燥，冬季温和多雨'},
 oceanic:{name:'温带海洋性气候',trait:'冬暖夏凉，全年降水较均匀'},
 subtropicalMonsoon:{name:'亚热带季风气候',trait:'夏季高温多雨，冬季温和少雨'},
 temperateMonsoon:{name:'温带季风气候',trait:'夏季高温多雨，冬季寒冷干燥'}
};
const CITIES=[
 {id:'shenzhen',name:'深圳',where:'中国广东',type:'subtropicalMonsoon',station:'深圳（中国气象局，1991–2020）',
  temp:[15.7,16.8,19.4,23.1,26.4,28.3,29.0,28.8,27.9,25.5,21.7,17.4],prec:[35.2,36.8,64.0,140.1,237.1,368.7,309.5,364.3,242.5,73.4,31.7,29.6]},
 {id:'beijing',name:'北京',where:'中国',type:'temperateMonsoon',station:'北京（中国气象局，1991–2020）',
  temp:[-2.7,0.6,7.5,15.1,21.3,25.3,27.2,26.1,21.2,13.8,5.2,-1.0],prec:[2.2,5.8,8.6,21.7,36.1,72.4,169.7,113.4,53.7,28.7,13.5,2.2]},
 {id:'singapore',name:'新加坡',where:'新加坡',type:'tropicalRainforest',station:'新加坡（新加坡气象局，1991–2020）',
  temp:[26.8,27.3,27.8,28.2,28.6,28.5,28.2,28.1,28.0,27.9,27.2,26.8],prec:[221.6,105.1,151.7,164.3,164.3,135.3,146.6,146.9,124.9,168.3,252.3,331.9]},
 {id:'cairo',name:'开罗',where:'埃及',type:'tropicalDesert',station:'开罗国际机场（1991–2020）',
  temp:[14.4,15.6,18.3,21.8,25.6,28.2,29.1,29.2,27.6,24.6,20.0,15.9],prec:[4.8,3.8,6.3,1.3,0.2,0,0,0,0,0.7,4.3,3.4]},
 {id:'rome',name:'罗马',where:'意大利',type:'mediterranean',station:'罗马乌尔贝机场（1991–2020）',
  temp:[7.9,8.6,11.2,14.2,18.7,23.1,26.0,26.1,21.9,17.4,12.4,8.7],prec:[65.6,62.8,58.6,68.6,56.9,30.1,19.8,30.2,64.9,88.1,108.2,98.3]},
 {id:'london',name:'伦敦',where:'英国',type:'oceanic',station:'伦敦邱园（英国气象局，1991–2020）',
  temp:[5.3,5.6,7.7,10.1,13.3,16.2,18.5,18.2,15.4,11.9,8.0,5.6],prec:[59.9,45.4,39.0,43.6,44.6,49.7,45.2,55.1,51.9,67.9,66.0,59.2]}
];
function climateStats(c){
 const r1=v=>Math.round(v*10)/10;
 const hot=c.temp.indexOf(Math.max(...c.temp)),cold=c.temp.indexOf(Math.min(...c.temp));
 const total=c.prec.reduce((a,b)=>a+b,0);
 const wet=c.prec.indexOf(Math.max(...c.prec)),dry=c.prec.indexOf(Math.min(...c.prec));
 const summer=c.prec[5]+c.prec[6]+c.prec[7],winter=c.prec[11]+c.prec[0]+c.prec[1];
 const mayToSep=c.prec.slice(4,9).reduce((a,b)=>a+b,0);
 return {hotMonth:hot+1,hotTemp:c.temp[hot],coldMonth:cold+1,coldTemp:c.temp[cold],range:r1(c.temp[hot]-c.temp[cold]),
  mean:r1(c.temp.reduce((a,b)=>a+b,0)/12),total:r1(total),wetMonth:wet+1,dryMonth:dry+1,
  summer:r1(summer),winter:r1(winter),mayToSepShare:total?Math.round(mayToSep/total*100):0};
}
// 判读理由（据数据生成，不替代教材定义）
function climateReasons(c){
 const s=climateStats(c),out=[];
 out.push('最冷月 '+s.coldMonth+' 月 '+s.coldTemp+'℃，最热月 '+s.hotMonth+' 月 '+s.hotTemp+'℃，年温差 '+s.range+'℃。');
 out.push('年降水量 '+s.total+' 毫米；夏季（6—8 月）'+s.summer+' 毫米，冬季（12—2 月）'+s.winter+' 毫米。');
 const tips={
  tropicalRainforest:'每个月气温都在 26℃ 以上，年温差不到 2℃；每月降水都超过 100 毫米。',
  tropicalDesert:'年降水量不足 25 毫米，夏季连续几个月滴雨不下；夏季均温接近 30℃。',
  mediterranean:'冬季降水明显多于夏季，这是“雨热不同期”，与季风气候正好相反。',
  oceanic:'最热月不到 19℃，最冷月仍在 5℃ 以上；各月降水都在 39—68 毫米之间，分配较均匀。',
  subtropicalMonsoon:'冬季温和（最冷月高于 0℃），5—9 月降水占全年 '+s.mayToSepShare+'%，雨热同期。',
  temperateMonsoon:'最冷月低于 0℃，冬季寒冷干燥；5—9 月降水占全年 '+s.mayToSepShare+'%，集中在夏季。'
 };
 out.push(tips[c.type]);
 return out;
}
const LAPSE=0.6; // ℃/100 m，对流层气温垂直递减的平均值
function temperatureAtAltitude(t0,h){return t0-LAPSE*h/100;}
// 海陆热力性质差异（示意曲线，不代表实测）：陆地升降温快、振幅大；海洋滞后、振幅小
function landSeaSchematic(month){
 const a=2*Math.PI*(month-4.5)/12;
 return {land:15+14*Math.sin(a),sea:15+6*Math.sin(a-2*Math.PI/12)};
}

/* ---------- 中国与世界 ---------- */
const CONTINENTS=[['亚洲',4400],['非洲',3020],['北美洲',2422],['南美洲',1797],['南极洲',1400],['欧洲',1016],['大洋洲',897]];
const OCEANS=[['太平洋',17968],['大西洋',9336],['印度洋',7492],['北冰洋',1310]];

/* ---------- 第 7 课 粤港澳大湾区与深圳 ----------
   来源：深圳市 2024 年统计公报；香港政府统计处（2024 年底人口、土地面积）；
   澳门统计暨普查局（2024 年 12 月）；澳门统计暨普查局「粤港澳大湾区统计专页」（2024）。 */
const GBA={area:55916,pop:8751.2,gdp:148361.2,year:2024,
 nine:['广州','深圳','珠海','佛山','惠州','东莞','中山','江门','肇庆'],sar:['香港','澳门'],
 distractors:['汕头','清远','韶关','湛江','汕尾','河源']};
const GBA_CITIES=[
 {name:'深圳',area:1997.47,pop:1798.95,note:'2024 年末常住人口'},
 {name:'广州',area:7238,pop:1897.8,note:'2024 年末常住人口'},
 {name:'香港',area:1114.57,pop:753.42,note:'2024 年底人口'},
 {name:'澳门',area:33.3,pop:68.83,note:'2024 年 12 月人口'}
];
function density(c){return c.pop*1e4/c.area;}
// 跨海与跨境通道：通车前后耗时（分钟），来源：新华社（深中通道）、香港特区政府大湾区网站
const CROSSINGS=[
 {id:'szzs',name:'深中通道',route:'深圳 → 中山',before:120,after:30,opened:'2024 年 6 月',length:'约 24 千米',src:'新华社 2024-06-30'},
 {id:'hzmb',name:'港珠澳大桥',route:'珠海 → 香港国际机场',before:240,after:45,opened:'2018 年 10 月',length:'约 55 千米',src:'香港特区政府大湾区网站'},
 {id:'hsr',name:'广深港高铁香港段',route:'香港西九龙 → 广州南',before:null,after:47,opened:'2018 年 9 月',length:'',src:'香港特区政府大湾区网站'}
];
const SZ_2024={gdp:36801.87,ind:[0.1,37.8,62.1],teu:3339.86,metroLines:18,metroKm:595,goodAir:97.0,pm25:17.3,export:28122.16};

/* ---------- 第 8 课 中国的疆域与人口 ---------- */
// 34 个省级行政区：23 个省、5 个自治区、4 个直辖市、2 个特别行政区
const PROVINCES=[
 ['北京市','京','北京','直辖市'],['天津市','津','天津','直辖市'],['上海市','沪','上海','直辖市'],['重庆市','渝','重庆','直辖市'],
 ['河北省','冀','石家庄','省'],['山西省','晋','太原','省'],['辽宁省','辽','沈阳','省'],['吉林省','吉','长春','省'],['黑龙江省','黑','哈尔滨','省'],
 ['江苏省','苏','南京','省'],['浙江省','浙','杭州','省'],['安徽省','皖','合肥','省'],['福建省','闽','福州','省'],['江西省','赣','南昌','省'],
 ['山东省','鲁','济南','省'],['河南省','豫','郑州','省'],['湖北省','鄂','武汉','省'],['湖南省','湘','长沙','省'],['广东省','粤','广州','省'],
 ['海南省','琼','海口','省'],['四川省','川或蜀','成都','省'],['贵州省','黔或贵','贵阳','省'],['云南省','云或滇','昆明','省'],['陕西省','陕或秦','西安','省'],
 ['甘肃省','甘或陇','兰州','省'],['青海省','青','西宁','省'],['台湾省','台','台北','省'],
 ['内蒙古自治区','内蒙古','呼和浩特','自治区'],['广西壮族自治区','桂','南宁','自治区'],['西藏自治区','藏','拉萨','自治区'],['宁夏回族自治区','宁','银川','自治区'],['新疆维吾尔自治区','新','乌鲁木齐','自治区'],
 ['香港特别行政区','港','香港','特别行政区'],['澳门特别行政区','澳','澳门','特别行政区']
].map(([full,abbr,capital,type])=>({full,abbr,capital,type,short:full.replace(/(壮族|回族|维吾尔)?(省|市|自治区|特别行政区)$/,'')}));
const LAND_NEIGHBORS=['朝鲜','俄罗斯','蒙古','哈萨克斯坦','吉尔吉斯斯坦','塔吉克斯坦','阿富汗','巴基斯坦','印度','尼泊尔','不丹','缅甸','老挝','越南'];
const SEA_NEIGHBORS=['韩国','日本','菲律宾','马来西亚','文莱','印度尼西亚'];
const NOT_NEIGHBORS=['泰国','柬埔寨','乌兹别克斯坦','孟加拉国','新加坡'];
// 四至（教材常用近似值）
const EXTREMES={north:{lat:53.5,where:'漠河以北的黑龙江主航道中心线'},south:{lat:4,where:'南沙群岛的曾母暗沙'},
 east:{lon:135,where:'黑龙江与乌苏里江主航道中心线相汇处'},west:{lon:73,where:'帕米尔高原'}};
function sunriseGapMinutes(lonEast,lonWest){return Math.round((lonEast-lonWest)*4);}
// 人口：第七次全国人口普查（大陆 31 省区市和现役军人）；2024 年国家统计局统计公报
const POPULATION={census2020:141178,end2024:140828,birth2024:6.77,death2024:7.76,urban2024:94350,han:91.11,minority:8.89};
function naturalGrowth(birth,death){return Math.round((birth-death)*100)/100;}
// 人口最多的 10 个少数民族（七普，人）
const ETHNIC_TOP=[['壮族',19568546],['维吾尔族',11774538],['回族',11377914],['苗族',11067929],['满族',10423303],['彝族',9830327],['土家族',9587732],['藏族',7060731],['蒙古族',6290204],['布依族',3576752]];
const FESTIVALS=[['泼水节','傣族'],['那达慕','蒙古族'],['火把节','彝族'],['三月三歌节','壮族'],['雪顿节','藏族']];

/* ---------- 第 9 课 天气预报与自然灾害 ---------- */
// 风力等级：GB/T 28591-2012，下限（m/s）
const WIND_FLOOR=[0,0.3,1.6,3.4,5.5,8.0,10.8,13.9,17.2,20.8,24.5,28.5,32.7,37.0,41.5,46.2,51.0,56.1];
function windForce(ms){let f=0;for(let i=0;i<WIND_FLOOR.length;i++)if(ms>=WIND_FLOOR[i]-1e-9)f=i;return f;}
// 热带气旋等级：GB/T 19201-2006（按底层中心附近最大平均风速）
function cycloneGrade(ms){
 if(ms<10.8)return null;
 if(ms<17.2)return '热带低压';if(ms<24.5)return '热带风暴';if(ms<32.7)return '强热带风暴';
 if(ms<41.5)return '台风';if(ms<51.0)return '强台风';return '超强台风';
}
// 深圳市气象局现行预警信号含义与是否停课
const SZ_WARNINGS={
 typhoon:[
  {level:'白色',color:'#e9ecef',meaning:'48 小时内将受台风影响。',stop:false},
  {level:'蓝色',color:'#2f6fd6',meaning:'24 小时内将受台风影响，平均风力可达 6 级以上或阵风 8 级以上；或已受影响并将持续。',stop:false},
  {level:'黄色',color:'#f2c230',meaning:'24 小时内将受台风影响，平均风力可达 8 级以上或阵风 10 级以上；或已受影响并将持续。',stop:true},
  {level:'橙色',color:'#f08a24',meaning:'12 小时内将受台风影响，平均风力可达 10 级以上或阵风 12 级以上；或已受影响并将持续。',stop:true},
  {level:'红色',color:'#d93a2f',meaning:'12 小时内将受或已经受台风影响，平均风力可达 12 级以上，或已达 12 级以上并将持续。',stop:true}],
 rain:[
  {level:'黄色',color:'#f2c230',meaning:'6 小时内本地将有暴雨（50 毫米以上），或已出现明显降雨且将持续。',stop:false},
  {level:'橙色',color:'#f08a24',meaning:'过去 3 小时本地降雨量已达 50 毫米以上，且降雨将持续。',stop:false},
  {level:'红色',color:'#d93a2f',meaning:'过去 3 小时本地降雨量已达 100 毫米以上，且降雨将持续。',stop:true}]
};
// 空气质量指数分级：HJ 633-2012
const AQI_LEVELS=[[50,'优','#4caf50','空气质量令人满意，可正常活动。'],[100,'良','#c9b62a','极少数异常敏感人群应减少户外活动。'],[150,'轻度污染','#f08a24','儿童、老年人及心脏病、呼吸系统疾病患者应减少长时间高强度户外锻炼。'],[200,'中度污染','#d93a2f','儿童、老年人及病人应避免长时间高强度户外锻炼，一般人群适量减少户外运动。'],[300,'重度污染','#8e3a8e','儿童、老年人和病人应停留在室内，一般人群减少户外运动。'],[Infinity,'严重污染','#7a2430','儿童、老年人和病人应停留在室内，一般人群应避免户外活动。']];
function aqiLevel(v){const i=AQI_LEVELS.findIndex(l=>v<=l[0]);const l=AQI_LEVELS[i];return {index:i+1,name:l[1],color:l[2],advice:l[3]};}
// 露点（Magnus 公式，Alduchov & Eskridge 系数），回南天：墙面温度低于露点就会结露
function dewPoint(t,rh){const b=17.62,c=243.12,g=Math.log(rh/100)+b*t/(c+t);return c*g/(b-g);}

/* ---------- 第 10 课 中国的产业与交通 ---------- */
// 三次产业增加值占比（%）：全国、深圳、广州 2024 年统计公报 / 澳门统计暨普查局大湾区专页
const INDUSTRY={national:[6.8,36.5,56.7],shenzhen:[0.1,37.8,62.1],guangzhou:[1.1,25.3,73.6]};
const ACTIVITIES=[['种植水稻',1],['近海养殖',1],['植树造林',1],['开采煤矿',2],['组装手机',2],['盖楼房',2],['火力发电',2],['送快递',3],['银行理财',3],['学校教育',3],['开网店',3],['放牧牛羊',1]];
const TRANSPORT_MODES={rail:'铁路',road:'公路',water:'水路',air:'航空',pipe:'管道'};
const TRANSPORT_CASES=[
 {q:'把云南鲜切花尽快运到北京的花店',a:'air',why:'鲜花怕耽搁、价值高、重量轻，适合速度最快的航空。'},
 {q:'把大批集装箱从深圳盐田港运往欧洲',a:'water',why:'远洋运输运量大、运费低，适合海运。'},
 {q:'把大量煤炭从山西运往华东地区',a:'rail',why:'大宗货物、长距离内陆运输，铁路运量大、成本较低。'},
 {q:'把快递从深圳的分拣中心送到你家楼下',a:'road',why:'短途、门到门，公路最灵活。'},
 {q:'把新疆的天然气输送到上海',a:'pipe',why:'“西气东输”用管道连续输送，损耗小、不受天气影响。'}
];

function parseCoordinates(hash){
 const params=new URLSearchParams(String(hash||'').replace(/^#/,''));
 const rawLon=params.get('lon'),rawLat=params.get('lat');
 if(rawLon===null||rawLat===null||rawLon.trim()===''||rawLat.trim()==='')return null;
 const lon=Number(rawLon),lat=Number(rawLat);
 if(!Number.isFinite(lon)||!Number.isFinite(lat)||lon<-180||lon>180||lat<-90||lat>90)return null;
 return {lon:Math.round(lon),lat:Math.round(lat)};
}
function parseNumber(hash,key,min,max){
 const raw=new URLSearchParams(String(hash||'').replace(/^#/,'')).get(key);
 if(raw===null||raw.trim()==='')return null;
 const v=Number(raw);return Number.isFinite(v)&&v>=min&&v<=max?v:null;
}

/* ---------- 海陆变迁与板块运动（第 11 课） ---------- */
// 六大板块与两类边界（湘教版七上第三章）
const PLATES=[
 {name:'亚欧板块',note:'含欧洲和亚洲大部，与多个板块相邻'},
 {name:'太平洋板块',note:'唯一几乎全为海洋的板块'},
 {name:'美洲板块',note:'含南北美洲及邻近海洋'},
 {name:'非洲板块',note:'含非洲大陆及周边海域'},
 {name:'印度洋板块',note:'含印度半岛、阿拉伯半岛和澳大利亚大陆'},
 {name:'南极洲板块',note:'以南极大陆为中心'}
];
const BOUNDARY_CASES=[
 {name:'喜马拉雅山脉持续升高',type:'converge',why:'亚欧板块与印度洋板块碰撞挤压，古地中海消失，山脉仍在抬升'},
 {name:'红海在不断扩张',type:'diverge',why:'非洲板块与印度洋板块张裂，几千万年后可能成为新的大洋'},
 {name:'地中海在不断缩小',type:'converge',why:'亚欧板块与非洲板块相互挤压，古地中海只剩残存海域'},
 {name:'东非大裂谷不断加宽',type:'diverge',why:'板块张裂下陷，是海洋的"胚胎期"'},
 {name:'日本多火山地震',type:'converge',why:'位于亚欧板块与太平洋板块交界处，大洋板块俯冲到大陆板块之下'},
 {name:'冰岛多火山',type:'diverge',why:'位于大西洋中脊（生长边界），岩浆上涌形成火山岛'},
 {name:'安第斯山脉高峻绵长',type:'converge',why:'南极洲板块（纳斯卡板块）与美洲板块碰撞挤压'},
 {name:'大西洋中脊的海岭',type:'diverge',why:'板块张裂处岩浆上涌，海底不断向两侧扩展'}
];
// 板块边界剖面动画：t=0（远古）→ 1（现在）→ 2（未来），返回地形高度序列
function plateProfile(type,t){
 // type: converge 挤压（山脉隆起）/ diverge 张裂（裂谷变海）
 // 输出 41 个采样点的高度（0 基准）
 const N=41,h=new Array(N).fill(0);
 const c=(N-1)/2;
 for(let i=0;i<N;i++){
  const x=i-c;
  if(type==='converge'){
   // 褶皱山脉：以中心为最高、两侧波状衰减，幅度随 t 增大
   const amp=Math.max(0,t)*38;
   h[i]=amp*Math.exp(-x*x/(2*3.2*3.2))+amp*.24*Math.exp(-((x-8)**2)/(2*2*2))+amp*.24*Math.exp(-((x+8)**2)/(2*2*2));
   if(t<0)h[i]+=t*10*Math.exp(-x*x/(2*6*6)); // 远古：浅海沉积层
  }else{
   // 张裂：中心下陷成谷，幅度随 t 增大；t>1 后谷里灌水成海
   const amp=Math.min(1.4,Math.max(0,t));
   h[i]=-amp*30*Math.exp(-x*x/(2*4.4*4.4))+amp*7*Math.exp(-((x-9)**2)/(2*3*3))+amp*7*Math.exp(-((x+9)**2)/(2*3*3));
  }
 }
 return h;
}
// 海陆变迁的化石/遗迹证据
const DRIFT_EVIDENCE=[
 {q:'喜马拉雅山上发现海洋生物化石',a:'这里曾是古地中海的一部分，板块碰撞使海底抬升成山'},
 {q:'台湾海峡海底发现古森林遗迹',a:'这里曾是陆地，后因海面上升或地壳下沉被海水淹没'},
 {q:'南美和非洲海岸线轮廓、古老地层相吻合',a:'两块大陆曾经连在一起（魏格纳大陆漂移学说的重要证据）'},
 {q:'南极洲地下发现煤层',a:'煤层由古代森林形成，说明南极洲曾经位于温暖纬度，后来漂移到了极地'}
];

/* ---------- 世界的居民与文化（第 12 课） ---------- */
// 人口数据：联合国《世界人口展望 2024》
const WORLD_POP={total:82.3,year:2025,growth:0.85,births:132,deaths:63,peak:103,peakYear:2084,
 tfr:2.2,lifeExp:73.5,top:[['印度',14.64],['中国',14.16],['美国',3.47]]};
// 世界人口增长时间轴（亿人）
const POP_HISTORY=[[1650,5.5],[1830,10],[1930,20],[1960,30],[1974,40],[1987,50],[1999,60],[2011,70],[2022,80],[2025,82.3],[2084,103]];
// 人口稠密区与稀疏区
const POP_DENSE=[['东亚（中国东部、日本、朝鲜半岛）','农业历史悠久、工商业发达'],['南亚（印度、孟加拉国等）','世界人口最稠密地区之一，农耕历史久'],
 ['西欧','工业革命最早，经济发达'],['北美东部（美国东北部、加拿大东南部）','工商业与城市集中']];
const POP_SPARSE=[['撒哈拉沙漠等干旱地区','极端干旱，水源匮乏'],['亚马孙热带雨林','气候湿热，原始丛林密布'],
 ['亚洲、北美高纬寒带','终年严寒'],['青藏高原等地势高峻地区','高寒缺氧'],['南极洲','无人定居大陆']];
// 自然增长率（千分率，2023 前后联合国/世界银行口径，教学用约数）
const POP_RATES=[['世界',10.2,7.3],['尼日尔',46,9],['印度',16.9,7.2],['中国',6.39,7.87],['日本',5.9,12.9],['德国',8.8,12.2],['意大利',6.7,12.1]];
// 三大人种
const RACES=[
 {name:'白色人种（欧罗巴人种）',skin:'肤色浅淡',hair:'头发波状、呈浅色',nose:'鼻梁高、嘴唇薄',dist:'欧洲、北美洲、大洋洲、非洲北部及亚洲西部、南部'},
 {name:'黄色人种（蒙古人种）',skin:'皮肤呈淡黄色或棕黄色',hair:'头发黑直',nose:'面部扁平、鼻梁中等',dist:'东亚（中国、日本、朝鲜半岛、蒙古等），美洲印第安人也属黄色人种'},
 {name:'黑色人种（尼格罗人种）',skin:'肤色黝黑',hair:'头发卷曲',nose:'嘴唇较厚',dist:'撒哈拉以南非洲，美洲的黑人多为奴隶贸易迁入的后裔'}
];
// 六大语言与使用人数（约数：母语+部分使用者口径有差异，教学用概数）
const LANGUAGES=[['汉语','世界使用人数最多的语言（母语约 9.4 亿人），主要在中国、东南亚华人社区'],
 ['英语','世界流传最广的语言，约 60 国官方语言，国际交往通用'],
 ['法语','主要在法国、非洲西部与中部、加拿大部分地区'],
 ['俄语','俄罗斯及中亚部分地区通用'],
 ['西班牙语','西班牙和拉丁美洲多数国家'],
 ['阿拉伯语','西亚和北非阿拉伯国家']];
const RELIGIONS=[
 {name:'基督教',origin:'西亚（巴勒斯坦地区）',dist:'欧洲、美洲、大洋洲',followers:'世界信徒最多的宗教'},
 {name:'伊斯兰教',origin:'西亚（阿拉伯半岛）',dist:'西亚、北非、中亚、东南亚部分地区',followers:'教徒称穆斯林'},
 {name:'佛教',origin:'古印度（今尼泊尔一带）',dist:'东亚、东南亚（泰国、缅甸等为上座部佛教）',followers:'世界第三大宗教'}];
// 发展差异（数据为 2023-2024 年世界银行/联合国口径约数，教学用）
const DEV_COMPARE=[
 {k:'人均国民总收入（美元，约）',dev:'4 万以上',deving:'约 1.3 万以下',dv:40,dv2:13},
 {k:'产业结构',dev:'第三产业为主（60% 以上）',deving:'第一、二产业比重较高',dv:70,dv2:40},
 {k:'城市化率（%，约）',dev:'80 以上',deving:'约 52',dv:80,dv2:52},
 {k:'医疗与教育水平',dev:'普及、水平高',deving:'多数国家仍在发展中',dv:85,dv2:45}];
const DEV_EXAMPLES={
 dev:['美国','日本','德国','法国','英国','澳大利亚'],
 deving:['中国','印度','巴西','尼日利亚','埃及','越南']};

/* ---------- 中国的自然资源（第 13 课） ---------- */
// 国土三调（2019 年底，自然资源部）单位：万公顷→换算亿亩
const LAND_TYPES=[['耕地',19.18],['园地',3.03],['林地',42.62],['草地',39.68],['湿地',3.52],['城镇村及工矿用地',5.30]];
// 中国人均资源 vs 世界平均（教材与官方公报常用口径）
const PER_CAPITA=[
 {k:'耕地（亩/人）',cn:1.36,world:3.4,src:'第三次全国国土调查'},
 {k:'水资源（立方米/人，多年平均）',cn:2000,world:8000,src:'水利部'},
 {k:'森林面积（公顷/人）',cn:0.16,world:0.6,src:'国家林草局'}];
// 水资源：南 81% 北 19%（多年平均，水利部口径）；耕地：64% 在秦岭-淮河以北（三调）
const WATER_LAND={waterS:81,waterN:19,landN:64,landS:36,
 total2024:31123,use2024:5928,useAgri:'61.6%',snwd:'830 亿立方米以上（东、中线一期累计调水，惠及 1.95 亿人）'};
// 可再生 / 非可再生资源分类
const RES_CLASSIFY=[
 ['阳光','re'],['土地','re'],['水','re'],['森林','re'],['草原','re'],['鱼虾','re'],
 ['煤炭','non'],['石油','non'],['天然气','non'],['铁矿','non'],['铜矿','non']];
// 新能源（国家能源局 2025 年底）
const POWER_2025=[
 {k:'太阳能发电',v:12.0,color:'#f4c56b'},{k:'风电',v:6.4,color:'#5f97ae'},
 {k:'水电',v:4.5,color:'#4f8197'},{k:'火电',v:15.4,color:'#b0663a',note:'2025 年风光装机历史性超过火电'}];

/* ---------- 中国的地域差异与区域发展（第 14 课） ---------- */
// 四大地理区域（湘教版八下第五章）
const FOUR_ZONES=[
 {name:'北方地区',key:'黑土地、黄土地，旱地农业',line:'与南方地区以秦岭—淮河一线为界',climate:'温带季风气候为主，冬季寒冷干燥'},
 {name:'南方地区',key:'水田农业，鱼米之乡',line:'与北方地区以秦岭—淮河一线为界',climate:'亚热带、热带季风气候，湿热'},
 {name:'西北地区',key:'干旱——最突出的自然特征',line:'与北方地区以 400 毫米年等降水量线（大兴安岭—阴山—贺兰山）为界',climate:'温带大陆性气候，降水自东向西递减'},
 {name:'青藏地区',key:'高寒——最突出的自然特征',line:'与其他区域以第一、二级阶梯分界线（昆仑山—祁连山—横断山）为界',climate:'高原山地气候，太阳辐射强、气温低'}];
// 西北地区景观递变（自东向西）
const NW_SEQUENCE=['草原','荒漠草原','荒漠'];
// 黄土高原水土流失因果链
const LOESS_CHAIN=[
 {step:'土质疏松，多垂直裂隙',tag:'自然'},
 {step:'夏季暴雨集中',tag:'自然'},
 {step:'地表植被破坏（过垦过牧）',tag:'人为'},
 {step:'流水侵蚀加剧',tag:'结果'},
 {step:'地表千沟万壑',tag:'结果'}];
const LOESS_FIX=[['缓坡地','修建梯田，种植耐旱作物'],['陡坡地','退耕还林还草，植树种草'],['沟道','打坝淤地，拦蓄泥沙'],['坡脚','修筑挡土坝等工程措施']];
// 长江经济带（2026 年 1 月国新办发布会：十年成效）
const YANGTZE_BELT={provinces:11,gdpShare:47.3,gdpShare2014:42.2,landShare:'约 21%',popShare:'约 43%',
 waterQuality:'干流水质全线 Ⅱ 类，优良水质断面 96.5%',income:'居民人均可支配收入十年从 2.3 万元提高到 4.4 万元',
 throughput:'干线港口货物吞吐量 42 亿吨，稳居世界内河第一',cities:['上海','江苏','浙江','安徽','江西','湖北','湖南','重庆','四川','云南','贵州']};
// 区域发展案例卡
const REGION_CASES=[
 {name:'东北三省',pos:'纬度最高、冬季漫长',agri:'黑土肥沃，"北大仓"春小麦、玉米、大豆',ind:'重工业基地（钢、机械、石油），振兴东北老工业基地'},
 {name:'黄土高原',pos:'沟壑纵横、水土流失最严重',agri:'治理：梯田、淤地坝、退耕还林还草',ind:'煤炭资源丰富'},
 {name:'长江三角洲',pos:'鱼米之乡、通江达海',agri:'水田农业发达',ind:'全国最大城市群，综合实力最强'},
 {name:'香港·澳门·深圳所在的粤港澳大湾区',pos:'改革开放前沿、外向型经济',agri:'—',ind:'国际科技创新中心，世界级制造业'}];
/* ---------- 了解地区（第 15 课，湘教版七下第八章） ---------- */
const AREAS=[
 {id:'sea',name:'东南亚',sec:'8.1',
  pos:'亚洲东南部，由中南半岛和马来群岛组成；马六甲海峡是连接太平洋和印度洋的"十字路口"。',
  terrain:'中南半岛地势北高南低，山河相间、纵列分布；马来群岛是世界最大的群岛，多火山、地震。',
  climate:'中南半岛大部为热带季风气候，马来群岛大部为热带雨林气候。',
  feature:'稻米主产区；天然橡胶、油棕、椰子等热带经济作物产量大；城市多分布在河流沿岸和河口三角洲；华人华侨多。',
  keys:['马六甲海峡','山河相间、纵列分布','热带季风 + 热带雨林','水稻与热带经济作物']},
 {id:'sa',name:'南亚',sec:'8.2',
  pos:'亚洲南部，喜马拉雅山以南，主体是印度半岛，又称南亚次大陆。',
  terrain:'北部是喜马拉雅山地，中部是印度河平原和恒河平原，南部是德干高原。',
  climate:'以热带季风气候为主，一年分旱季和雨季；6—9 月西南季风带来雨季，季风不稳定时容易发生旱涝。',
  feature:'世界人口最稠密的地区之一；农作物有水稻、小麦、黄麻、棉花、茶叶；印度的软件和服务外包产业发达。',
  keys:['北山、中平原、南高原','热带季风，旱雨季分明','西南季风不稳定→旱涝','人口稠密']},
 {id:'wa',name:'西亚',sec:'8.3',
  pos:'"两洋三洲五海"之地：邻印度洋、大西洋，地处亚、欧、非三洲交界，濒临阿拉伯海、红海、地中海、黑海、里海。',
  terrain:'以高原为主，阿拉伯半岛是世界最大的半岛。',
  climate:'以热带沙漠气候为主，地中海沿岸为地中海气候；气候干旱，水资源十分缺乏。',
  feature:'波斯湾及沿岸是世界石油储量最多、产量和出口量最大的地区，石油经霍尔木兹海峡运往世界各地；沿海国家发展海水淡化。',
  keys:['两洋三洲五海','波斯湾石油','干旱缺水','霍尔木兹海峡']},
 {id:'we',name:'欧洲西部',sec:'8.4',
  pos:'欧洲的西半部，大部分国家临海，是发达国家最集中的地区。',
  terrain:'以平原为主，南部有高大的阿尔卑斯山脉。',
  climate:'以温带海洋性气候为主（受西风和北大西洋暖流影响，冬暖夏凉、降水均匀），南部是地中海气候。',
  feature:'多汁牧草生长茂盛，乳畜业发达；旅游业发达；工业历史悠久；大部分国家是欧洲联盟成员。',
  keys:['温带海洋性气候','北大西洋暖流','乳畜业','发达国家集中']},
 {id:'polar',name:'北极和南极',sec:'8.5',
  pos:'北极地区以北冰洋为主体，周围是亚欧大陆和北美大陆北部；南极地区以南极大陆为主体，四周是海洋。',
  terrain:'南极大陆被厚厚的冰盖覆盖，平均海拔最高，被称为"冰雪高原"。',
  climate:'酷寒、烈风、干燥。南极洲是世界最冷、风力最大的大陆。',
  feature:'科学考察的天然实验室；我国在北极建有黄河站，在南极建有长城站、中山站、昆仑站、泰山站、秦岭站；南极考察多在 11 月至次年 3 月（南半球夏季）。',
  keys:['北冰洋 vs 南极大陆','冰雪高原','世界最冷、风最大','中国科考站']}
];
const AREA_CLUES=[
 ['马六甲海峡是连接太平洋和印度洋的"十字路口"','sea'],['山河相间、纵列分布','sea'],['天然橡胶、油棕产量大','sea'],
 ['西南季风不稳定，易发生旱涝','sa'],['恒河平原人口稠密','sa'],['德干高原','sa'],
 ['"两洋三洲五海"之地','wa'],['波斯湾石油储量最多','wa'],['发展海水淡化','wa'],
 ['乳畜业发达','we'],['北大西洋暖流带来温暖湿润','we'],['发达国家最集中','we'],
 ['"冰雪高原"','polar'],['长城站、中山站','polar'],['以北冰洋为主体','polar']];

/* ---------- 走近国家（第 16 课，湘教版七下第九章） ---------- */
// 人口为各国官方统计机构 2025—2026 年估计的约数；面积为我国地理教材常用数据（法国为本土面积）
const COUNTRIES=[
 {id:'jp',name:'日本',capital:'东京',area:'约 37.8 万平方千米',pop:'约 1.23 亿',
  pos:'亚洲东部、太平洋西北部的岛国，由北海道、本州、四国、九州四个大岛和许多小岛组成。',
  terrain:'山地、丘陵约占国土面积的 3/4，平原狭小；位于亚欧板块与太平洋板块交界处，多火山、地震。',
  climate:'温带季风气候和亚热带季风气候，海洋性特征显著。',
  economy:'资源贫乏，进口原料和燃料，加工成工业产品出口；工业集中在太平洋沿岸和濑户内海沿岸。',
  clues:['岛国，有四个大岛','多火山、地震，最高峰是一座火山','进口原料燃料，出口工业产品','工业集中在太平洋沿岸和濑户内海沿岸']},
 {id:'eg',name:'埃及',capital:'开罗',area:'约 100 万平方千米',pop:'约 1.09 亿',
  pos:'地跨亚、非两洲，大部分在非洲东北部，西奈半岛在亚洲。',
  terrain:'大部分是沙漠，尼罗河纵贯南北。',
  climate:'以热带沙漠气候为主，炎热干燥。',
  economy:'人口和城市集中在尼罗河谷地和三角洲；苏伊士运河、旅游业、石油是重要收入来源；长绒棉著名。',
  clues:['地跨亚、非两洲','大部分人口集中在一条大河的谷地和三角洲','拥有连接地中海和红海的运河','金字塔与古老文明']},
 {id:'ru',name:'俄罗斯',capital:'莫斯科',area:'约 1709.8 万平方千米',pop:'约 1.46 亿',
  pos:'地跨亚欧两洲，是世界上面积最大的国家；以乌拉尔山为界，西部属欧洲，东部属亚洲。',
  terrain:'地势总体东高西低，西部以平原为主，东部多高原山地；多数大河向北注入北冰洋，伏尔加河注入里海。',
  climate:'以温带大陆性气候为主，冬季寒冷漫长。',
  economy:'森林、石油、天然气、煤炭资源丰富；重工业发达，工业区和人口主要集中在欧洲部分；西伯利亚大铁路横贯东西。',
  clues:['冬季寒冷漫长','多数大河向北流入北冰洋','以一条山脉为界横跨亚欧两洲','世界面积最大的国家']},
 {id:'fr',name:'法国',capital:'巴黎',area:'本土约 55 万平方千米',pop:'约 6900 万（含海外领地）',
  pos:'欧洲西部，三面临海（北海与英吉利海峡、大西洋、地中海）。',
  terrain:'以平原和丘陵为主，东南部有阿尔卑斯山脉。',
  climate:'以温带海洋性气候为主，南部沿海是地中海气候。',
  economy:'农业发达，是欧洲重要的农产品出口国，葡萄酒闻名；航空航天、核电、时装和化妆品产业突出；旅游业发达。',
  clues:['欧洲西部，三面临海','温带海洋性气候为主','航空航天与核电产业突出','葡萄酒、时装闻名世界']},
 {id:'us',name:'美国',capital:'华盛顿',area:'约 937 万平方千米',pop:'约 3.42 亿',
  pos:'北美洲中部，东临大西洋、西临太平洋，还包括阿拉斯加和夏威夷。',
  terrain:'西部是高大的落基山脉等山系，中部是广阔平原，东部是低缓的阿巴拉契亚山脉；密西西比河是北美最长的河流。',
  climate:'气候类型多样，以温带大陆性气候和亚热带湿润气候为主。',
  economy:'农业地区专业化、生产高度机械化（玉米带、小麦带、棉花带等）；东北部是传统工业区，南部和西部"阳光地带"新兴工业发展迅速，硅谷是高新技术产业中心；是移民国家。',
  clues:['移民国家','农业地区专业化、高度机械化','西部高山、中部平原、东部低山','东临大西洋、西临太平洋']},
 {id:'au',name:'澳大利亚',capital:'堪培拉',area:'约 769 万平方千米',pop:'约 2790 万',
  pos:'南半球，世界上唯一独占一块大陆的国家，南回归线穿过中部。',
  terrain:'西部是高原，中部是平原（大自流盆地），东部是山地（大分水岭）。',
  climate:'大部分地区干旱，热带沙漠气候面积广，气候类型沿海岸呈环状分布。',
  economy:'被称为"骑在羊背上的国家"和"坐在矿车上的国家"，养羊业和采矿业发达；人口和城市集中在东南沿海；袋鼠、鸭嘴兽等古老生物独特。',
  clues:['南回归线穿过中部','气候类型沿海岸呈环状分布','"骑在羊背上的国家"','世界上唯一独占一块大陆的国家']},
 {id:'br',name:'巴西',sec:'探究',capital:'巴西利亚',area:'约 851 万平方千米',pop:'约 2.14 亿',
  pos:'南美洲东部，是南美洲面积最大、人口最多的国家，赤道和南回归线都穿过国境。',
  terrain:'北部是亚马孙平原，中南部是巴西高原。',
  climate:'以热带雨林气候和热带草原气候为主。',
  economy:'咖啡、甘蔗、大豆产量居世界前列，铁矿资源丰富；亚马孙热带雨林被称为"地球之肺"，保护与开发的矛盾突出；居民以混血种人居多，通用葡萄牙语。',
  clues:['国内通用语言是葡萄牙语','咖啡、甘蔗、大豆产量居世界前列','世界最大热带雨林的大部分在它境内','南美洲面积最大的国家']}
];
/* ---------- 认识大洲（第 17 课，湘教版七下第七章） ---------- */
const CONTINENT_INFO=[
 {id:'asia',name:'亚洲',sec:'7.1',area:'约 4400 万平方千米，世界第一大洲',
  terrain:'地势中部高、四周低，青藏高原是世界最高的高原；地形以高原、山地为主。',
  river:'受地势影响，河流从中部向四周呈放射状流出（长江、湄公河、恒河、鄂毕河等）。',
  climate:'气候复杂多样；季风气候显著（东亚、东南亚、南亚），大陆性气候分布广。',
  people:'世界人口最多的大洲，中国和印度人口均超过 14 亿。',
  clues:['世界面积最大的大洲','地势中部高、四周低，河流呈放射状','季风气候显著','有世界最高峰']},
 {id:'europe',name:'欧洲',sec:'7.1',area:'约 1016 万平方千米',
  terrain:'以平原为主，平均海拔低；海岸线曲折，多半岛、岛屿和海湾；南部有阿尔卑斯山脉。',
  river:'河网稠密，伏尔加河是欧洲最长河流；莱茵河、多瑙河是重要的国际航道。',
  climate:'以温带气候为主，温带海洋性气候分布广，南部沿海为地中海气候。',
  people:'发达国家集中，城市化水平高。',
  clues:['以平原为主、海岸线曲折','温带海洋性气候分布广','发达国家集中','北部有斯堪的纳维亚半岛']},
 {id:'africa',name:'非洲',sec:'7.2',area:'约 3020 万平方千米',
  terrain:'高原面积广大，被称为"高原大陆"；东部有东非大裂谷。',
  river:'尼罗河是世界最长的河流之一；刚果河流量大。',
  climate:'赤道横穿中部，气候以赤道为中心南北大致对称分布；热带草原气候分布最广，撒哈拉沙漠是世界最大的沙漠。',
  people:'人口增长快；多数国家依赖少数几种矿产或农产品出口（单一商品经济）。',
  clues:['被称为"高原大陆"','赤道横穿中部，气候南北对称','热带草原气候分布最广','有世界最大的沙漠']},
 {id:'na',name:'北美洲',sec:'7.3',area:'约 2422 万平方千米',
  terrain:'地形分三大南北纵列带：西部高大山系（落基山脉）、中部平原、东部低缓山地和高原。',
  river:'密西西比河是北美最长的河流；五大湖是世界最大的淡水湖群。',
  climate:'以温带大陆性气候为主，北部寒冷，南部温暖湿润。',
  people:'以美国、加拿大为主；与南美洲以巴拿马运河为界。',
  clues:['西部山系、中部平原、东部低山纵列分布','有世界最大的淡水湖群','与南美洲以运河为界','最长河流是密西西比河']},
 {id:'sa',name:'南美洲',sec:'7.3',area:'约 1797 万平方千米',
  terrain:'西部是纵贯南北的安第斯山脉，东部是平原和高原相间（亚马孙平原、巴西高原、拉普拉塔平原）。',
  river:'亚马孙河是世界流量最大、流域面积最广的河流。',
  climate:'以热带气候为主，亚马孙平原有世界面积最大的热带雨林。',
  people:'居民以混血种人居多；通用西班牙语和葡萄牙语，与中美洲、墨西哥等合称拉丁美洲。',
  clues:['西部有纵贯南北的安第斯山脉','有世界流量最大的河流','世界面积最大的热带雨林','居民以混血种人居多']}
];
// 非洲气候南北对称：自北向南的纬度带（示意）
const AFRICA_BANDS=[
 {name:'地中海气候',from:37,to:30,color:'#c9b382'},{name:'热带沙漠气候',from:30,to:18,color:'#e5c48a'},
 {name:'热带草原气候',from:18,to:5,color:'#c8d38c'},{name:'热带雨林气候',from:5,to:-5,color:'#7fae6b'},
 {name:'热带草原气候',from:-5,to:-18,color:'#c8d38c'},{name:'热带沙漠气候',from:-18,to:-30,color:'#e5c48a'},
 {name:'地中海气候',from:-30,to:-35,color:'#c9b382'}];

/* ---------- 东北地区（第 18 课，湘教版八下第六章） ---------- */
const NORTHEAST={
 scope:'黑龙江省、吉林省、辽宁省和内蒙古自治区东部',
 sections:[
  {id:'pos',sec:'6.1',name:'地理位置与自然特征',items:[
   ['位置','我国纬度最高的地区，东北、西北与俄罗斯、蒙古接壤，东南与朝鲜隔鸭绿江、图们江相望，南临渤海、黄海。'],
   ['地形','"山环水绕、沃野千里"：西有大兴安岭，北有小兴安岭，东有长白山，中部是东北平原（三江平原、松嫩平原、辽河平原），是我国面积最大的平原。'],
   ['气候','温带季风气候为主，冬季寒冷漫长，夏季温暖短促，雨热同期。'],
   ['土壤与植被','黑土肥沃，是世界上珍贵的黑土区之一；大、小兴安岭和长白山森林茂密。']]},
  {id:'city',sec:'6.2',name:'人口与城乡分布',items:[
   ['人口分布','人口集中在平原地区，特别是铁路沿线；山区人口稀少。'],
   ['城市分布','主要城市沿哈尔滨—长春—沈阳—大连铁路（哈大线）分布，形成城市带。'],
   ['乡村','平原地区村落大而集中，农田连片，便于机械化耕作。']]},
  {id:'ind',sec:'6.3',name:'产业布局',items:[
   ['农业','我国重要的商品粮基地，盛产玉米、大豆、水稻、春小麦；黑龙江省粮食产量多年居全国首位。'],
   ['林业','大兴安岭、小兴安岭、长白山是重要林区，现以保护天然林为主。'],
   ['工业','我国重要的重工业基地：鞍山钢铁、大庆石油、长春汽车、沈阳和哈尔滨的机械装备。'],
   ['发展','振兴东北老工业基地：产业升级、发展冰雪旅游和现代农业。']]}
 ],
 // 产业 → 主要依托的条件
 factors:[['大庆的石油工业','石油资源丰富'],['鞍山的钢铁工业','铁矿和煤炭资源丰富'],['三江平原的商品粮生产','土地平坦肥沃、地广人稀便于机械化'],
  ['哈尔滨的冰雪旅游','冬季寒冷漫长、冰雪资源丰富'],['大兴安岭的林业','森林资源丰富'],['大连的港口贸易','临海、有优良港湾']]
};

/* ---------- 区域地理环境与未来图景（第 19 课，湘教版八下第八章） ---------- */
const PLACES8=[
 {id:'bj',name:'北京市',sec:'8.1',title:'城市特征与建设成就',
  facts:[['定位','我国首都，全国政治中心、文化中心、国际交往中心、科技创新中心。'],
   ['自然环境','西、北、东北三面环山，东南是平原；温带季风气候。'],
   ['历史文化','拥有故宫、长城、颐和园、天坛等世界文化遗产；北京中轴线 2024 年列入《世界遗产名录》。'],
   ['发展','有序疏解非首都功能，推进京津冀协同发展和雄安新区建设。']],
  dev:'把"城市病"治理和首都功能提升结合起来'},
 {id:'tw',name:'台湾省',sec:'8.2',title:'地理环境与经济发展',
  facts:[['位置','台湾省是中国的神圣领土，位于我国东南沿海的大陆架上，西隔台湾海峡与福建省相望；由台湾岛、澎湖列岛和钓鱼岛等附属岛屿组成。台湾岛是我国第一大岛。'],
   ['面积与人口','陆地面积约 3.6 万平方千米，人口约 2330 万（2025 年），主要分布在西部沿海平原。'],
   ['自然环境','山地丘陵约占 2/3，中央山脉纵贯南北，玉山海拔 3952 米；北回归线穿过中南部，属热带和亚热带季风气候，森林、水果资源丰富，有"宝岛"之称。'],
   ['经济','以出口加工为主的外向型经济，电子信息产业（集成电路等）地位突出。两岸同根同源、血脉相连。']],
  dev:'两岸经贸往来密切，大陆是台湾最大的贸易伙伴之一'},
 {id:'xj',name:'新疆维吾尔自治区',sec:'8.3',title:'地理概况与开发保护',
  facts:[['面积','约 166 万平方千米，约占全国陆地面积的 1/6，是我国面积最大、交界邻国最多、陆地边境线最长的省级行政区。'],
   ['地形','"三山夹两盆"：北有阿尔泰山，中有天山，南有昆仑山，夹着准噶尔盆地和塔里木盆地；吐鲁番盆地的艾丁湖低于海平面 154.31 米，是我国陆地最低点。'],
   ['气候与水','温带大陆性干旱气候，降水稀少；高山冰雪融水形成河流，塔里木河全长 2486 千米，是我国最长的内陆河。'],
   ['开发','绿洲农业（长绒棉、瓜果，光照充足、昼夜温差大）；石油天然气丰富，是"西气东输"的起点；丝绸之路经济带核心区。']],
  dev:'在保护生态的前提下开发资源，节约用水'},
 {id:'gz',name:'贵州省',sec:'8.4',title:'自然环境与因地制宜',
  facts:[['地形','位于云贵高原东部，喀斯特地貌广布，地表崎岖，素有"地无三里平"之说。'],
   ['气候','亚热带季风气候，阴雨天多，夏季凉爽。'],
   ['生态问题','喀斯特地区土层薄，植被一旦破坏易发生石漠化；通过封山育林、退耕还林等治理。'],
   ['因地制宜','利用凉爽气候和充足电力发展大数据产业；喀斯特天然洼地建成"中国天眼"（FAST）；发展山地旅游、茶叶等特色产业；修建大量桥梁隧道，变天堑为通途。']],
  dev:'把山地劣势转化为特色优势'}
];
// 条件 → 地区
const PLACE_CLUES=[['"三山夹两盆"','xj'],['我国陆地最低点','xj'],['长绒棉、哈密瓜','xj'],['"西气东输"的起点','xj'],
 ['"地无三里平"','gz'],['"中国天眼"所在地','gz'],['石漠化治理','gz'],['大数据产业','gz'],
 ['我国第一大岛','tw'],['玉山海拔 3952 米','tw'],['北回归线穿过中南部','tw'],
 ['全国政治中心、文化中心','bj'],['中轴线列入世界遗产','bj'],['疏解非首都功能','bj']];

/* ---------- 建设永续发展的美丽中国（第 20 课，湘教版八下第九章） ---------- */
// 第一批国家公园（2021 年 10 月设立，国家林业和草原局）单位：平方千米
const NATIONAL_PARKS=[['三江源国家公园',190700,'长江、黄河、澜沧江源头','青海'],['大熊猫国家公园',22000,'保护全国 70% 以上的野生大熊猫','四川、陕西、甘肃'],
 ['东北虎豹国家公园',14100,'野生东北虎、东北豹','吉林、黑龙江'],['海南热带雨林国家公园',4269,'海南长臂猿唯一分布地','海南'],['武夷山国家公园',1280,'中亚热带原生性常绿阔叶林','福建、江西']];
// 深圳生活垃圾分类：可回收物 / 有害垃圾 / 厨余垃圾 / 其他垃圾
const WASTE_TYPES=[['rec','可回收物','#3d7391'],['haz','有害垃圾','#b0472e'],['food','厨余垃圾','#4f7a48'],['other','其他垃圾','#6f7d68']];
const WASTE_ITEMS=[['废旧报纸','rec'],['塑料饮料瓶','rec'],['易拉罐','rec'],['旧衣服','rec'],
 ['过期药品','haz'],['废电池（充电电池）','haz'],['废荧光灯管','haz'],['废水银温度计','haz'],
 ['剩饭剩菜','food'],['果皮','food'],['菜叶','food'],['过期食品（去包装）','food'],
 ['用过的纸巾','other'],['烟头','other'],['陶瓷碎片','other'],['一次性餐盒（污染严重）','other']];
const GREEN_TIMELINE=[[2012,'生态文明建设纳入"五位一体"总体布局'],[2020,'提出 2030 年前碳达峰、2060 年前碳中和目标'],
 [2021,'正式设立第一批 5 个国家公园'],[2025,'风电、太阳能发电装机历史性超过火电'],[2030,'碳达峰（目标）'],[2060,'碳中和（目标）']];
// 人地协调：做法 → 是否符合可持续发展
const PRACTICES=[['在黄土高原坡地修梯田、种树种草',true],['为了多打粮食，在草原上大规模开垦',false],['工业废水处理达标后再排放',true],
 ['长江十年禁渔，让鱼类休养生息',true],['把山地森林全部砍掉改种经济作物',false],['发展风电、光伏，减少燃煤',true],
 ['大量开采地下水灌溉，导致地面沉降',false],['城市推广垃圾分类和资源回收',true]];




const API={rad,deg,clamp,mod,normLon,longitudeText,latitudeText,hemispheres,description,camVec,toScreen,project,visiblePath,meridian,parallel,
 subsolarLongitude,localTime,timeText,sunDot,nightShape,
 sunPosition,daysInYear,dayOfYear,dateOf,declinationOn,seasonMarkers,dayLength,noonAltitude,hoursText,directSunDates,
 TERRAIN,terrainHeight,makeGrid,contourSegments,terrainProfile,terrainFeatures,runForDrop,
 CLIMATE_TYPES,CITIES,climateStats,climateReasons,LAPSE,temperatureAtAltitude,landSeaSchematic,
 CONTINENTS,OCEANS,parseCoordinates,parseNumber,
 GBA,GBA_CITIES,density,CROSSINGS,SZ_2024,
 PROVINCES,LAND_NEIGHBORS,SEA_NEIGHBORS,NOT_NEIGHBORS,EXTREMES,sunriseGapMinutes,POPULATION,naturalGrowth,ETHNIC_TOP,FESTIVALS,
 WIND_FLOOR,windForce,cycloneGrade,SZ_WARNINGS,AQI_LEVELS,aqiLevel,dewPoint,
 INDUSTRY,ACTIVITIES,TRANSPORT_MODES,TRANSPORT_CASES,
 PLATES,BOUNDARY_CASES,plateProfile,DRIFT_EVIDENCE,
 WORLD_POP,POP_HISTORY,POP_DENSE,POP_SPARSE,POP_RATES,RACES,LANGUAGES,RELIGIONS,DEV_COMPARE,DEV_EXAMPLES,
 LAND_TYPES,PER_CAPITA,WATER_LAND,RES_CLASSIFY,POWER_2025,
 FOUR_ZONES,NW_SEQUENCE,LOESS_CHAIN,LOESS_FIX,YANGTZE_BELT,REGION_CASES,
 AREAS,AREA_CLUES,COUNTRIES,
 CONTINENT_INFO,AFRICA_BANDS,NORTHEAST,PLACES8,PLACE_CLUES,NATIONAL_PARKS,WASTE_TYPES,WASTE_ITEMS,GREEN_TIMELINE,PRACTICES};
if(typeof module==='object'&&module.exports)module.exports=API;else root.Geo=API;
})(typeof globalThis!=='undefined'?globalThis:this);
