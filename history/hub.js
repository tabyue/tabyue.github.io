/* 首页：统计已覆盖的单元数 */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    var rows = document.querySelectorAll('#cover-table tbody tr'), ok = 0;
    Array.prototype.forEach.call(rows, function (tr) { if (tr.querySelector('td:last-child a')) ok++; });
    var el = document.getElementById('cover-sum');
    if (el) el.innerHTML = '<span>共 ' + rows.length + ' 行对照</span><span style="color:#7d4d3c">已覆盖 ' + ok + '</span><span style="color:#6f6663">待做 ' + (rows.length - ok) + '</span>';
  });
})();
