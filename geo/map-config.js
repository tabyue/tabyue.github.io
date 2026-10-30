/* 地理互动馆 · 地图配置
 *
 * 地图底图使用「天地图」（国家地理信息公共服务平台），国界、南海诸岛等均由天地图按国家标准提供，
 * 本站不自行绘制任何国界或地图轮廓。
 *
 * 启用方法（只改这一行）：
 *   1. 打开 https://console.tianditu.gov.cn/ 注册并登录
 *   2. 「应用管理」→「创建新应用」，应用类型选「浏览器端」
 *   3. 白名单填写网站域名（例如 www.tabyue.com）
 *   4. 把得到的 key 粘贴到下面 tk 的引号里，替换占位文字
 *
 * 没填 key 时，各课的地图区域会显示地点和经纬度清单，并给出自然资源部标准地图服务的链接。
 * 本文件必须以普通（非 defer）脚本放在 <head> 中：天地图加载器在解析期会用 document.write 补加载核心代码。
 */
(function(){
'use strict';
var tk='93bc5160f5b33dcf7b76999ee0e756d7'; // 浏览器端 key，白名单 www.tabyue.com（2026-10-29 用户提供）
var ok=/^[0-9a-zA-Z]{32}$/.test(tk);
window.GEO_MAP_CONFIG={provider:'tianditu',enabled:ok,tk:ok?tk:''};
// 只用瓦片、不用天地图 JS API 的页面（如地球仪贴图）写 data-tdt-api="off"，
// 免得白白加载几百 KB 的地图库；key 仍然只存这一处。
var me=document.currentScript,wantApi=!me||me.getAttribute('data-tdt-api')!=='off';
if(ok&&wantApi&&document.readyState==='loading'){
 document.write('<script src="https://api.tianditu.gov.cn/api?v=4.0&tk='+tk+'"><\/script>');
}
})();
