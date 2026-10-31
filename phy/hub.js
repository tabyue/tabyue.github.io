/* 首页：统计已覆盖的章节数 */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    var rows = document.querySelectorAll('#cover-table tbody tr');
    var ok = 0;
    Array.prototype.forEach.call(rows, function (tr) {
      if (tr.querySelector('td:last-child a')) ok++;
    });
    var el = document.getElementById('cover-sum');
    if (el) {
      el.innerHTML = '<span>共 ' + rows.length + ' 章</span>' +
        '<span style="color:#5a4097">已覆盖 ' + ok + '</span>' +
        '<span style="color:#6f6a7d">待做 ' + (rows.length - ok) + '</span>';
    }
  });
})();
