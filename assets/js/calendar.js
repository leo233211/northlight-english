(function () {
  "use strict";
  var cursor = new Date(); cursor.setDate(1);
  var selectedKey = NL.localDateKey();
  var moduleLabels = { vocabulary: "词汇", listening: "听力", reading: "阅读", writing: "写作", speaking: "口语", fun: "趣味" };
  function renderStats() {
    var progress = NL.getProgress();
    var monthPrefix = cursor.getFullYear() + "-" + String(cursor.getMonth() + 1).padStart(2, "0");
    var activeDays = Object.keys(progress).filter(function (key) { return key.indexOf(monthPrefix) === 0 && NL.MODULES.filter(function (module) { return progress[key][module] && progress[key][module].complete; }).length >= 5; }).length;
    document.getElementById("monthStudyDays").textContent = String(activeDays);
    document.getElementById("calendarStreak").textContent = String(NL.getStreak());
    document.getElementById("calendarWords").textContent = String(NL.getWords().length);
    document.getElementById("calendarDue").textContent = String(NL.getDueWords().length);
  }
  function renderCalendar() {
    var year = cursor.getFullYear(); var month = cursor.getMonth();
    document.getElementById("calendarTitle").textContent = year + "年 " + (month + 1) + "月";
    var offset = (new Date(year, month, 1).getDay() + 6) % 7;
    var days = new Date(year, month + 1, 0).getDate();
    var progress = NL.getProgress(); var cells = [];
    for (var blank = 0; blank < offset; blank += 1) cells.push('<button class="calendar-day empty" tabindex="-1" aria-hidden="true"></button>');
    for (var day = 1; day <= days; day += 1) {
      var key = year + "-" + String(month + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0");
      var dayData = progress[key] || {};
      var completed = NL.MODULES.filter(function (module) { return dayData[module] && dayData[module].complete; }).length;
      var percent = Math.round(completed / NL.MODULES.length * 100);
      var classes = ["calendar-day"]; if (completed >= 5) classes.push("complete"); if (key === NL.localDateKey()) classes.push("today");
      cells.push('<button class="' + classes.join(" ") + '" type="button" data-date="' + key + '"><span class="day-number">' + day + '</span><span class="day-mark">' + (completed >= 5 ? "有效学习日" : completed ? completed + " / " + NL.MODULES.length + " 模块" : "未记录") + '</span><span class="day-progress"><span style="width:' + percent + '%"></span></span></button>');
    }
    document.getElementById("calendarGrid").innerHTML = cells.join("");
    renderDetail(selectedKey);
  }
  function renderDetail(key) {
    selectedKey = key; var detail = document.getElementById("calendarDetail"); var day = NL.getDayProgress(key);
    var completed = NL.MODULES.filter(function (module) { return day[module] && day[module].complete; });
    if (!completed.length) { detail.innerHTML = '<div class="empty-state"><div class="empty-orb" aria-hidden="true"></div><h3>这一天还没有学习记录</h3><p>进入任一模块完成训练，进度会自动写入本机日历。</p><a class="button sage" href="index.html">返回今日计划</a></div>'; return; }
    detail.innerHTML = '<h3 style="margin-top:0;font-family:var(--serif);font-weight:500">' + key + '</h3><p style="color:var(--muted)">完成 ' + completed.length + ' / ' + NL.MODULES.length + ' 个模块</p><div class="chip-row">' + NL.MODULES.map(function (module) { var done = day[module] && day[module].complete; return '<span class="status-chip ' + (done ? "complete" : "pending") + '">' + moduleLabels[module] + (done ? " 已完成" : " 未完成") + '</span>'; }).join("") + '</div>';
  }
  function init() {
    if (!document.getElementById("calendarGrid")) return;
    renderStats(); renderCalendar();
    document.getElementById("prevMonth").addEventListener("click", function () { cursor.setMonth(cursor.getMonth() - 1); renderStats(); renderCalendar(); });
    document.getElementById("nextMonth").addEventListener("click", function () { cursor.setMonth(cursor.getMonth() + 1); renderStats(); renderCalendar(); });
    document.getElementById("calendarGrid").addEventListener("click", function (event) { var day = event.target.closest("[data-date]"); if (day) renderDetail(day.getAttribute("data-date")); });
    document.getElementById("clearCalendar").addEventListener("click", function () { if (!window.confirm("确定清除本机中的学习进度吗？词库与写作草稿不会被删除。")) return; NL.write(NL.KEYS.progress, {}); NL.updateGlobalUI(); renderStats(); renderCalendar(); NL.toast("学习日历已清除。"); });
  }
  document.addEventListener("DOMContentLoaded", init);
})();
