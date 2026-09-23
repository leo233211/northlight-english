(function () {
  "use strict";

  var KEYS = {
    profile: "northlight.profile.v1",
    progress: "northlight.progress.v1",
    words: "northlight.wordbank.v1",
    writing: "northlight.writing.v1",
    readings: "northlight.readings.v1",
    recordings: "northlight.recordings.v1"
  };

  var MODULES = ["vocabulary", "listening", "reading", "writing", "speaking", "fun"];
  var MODULE_LABELS = {
    vocabulary: "词汇",
    listening: "听力",
    reading: "阅读",
    writing: "写作",
    speaking: "口语",
    fun: "趣味"
  };

  function safeParse(value, fallback) {
    try { return JSON.parse(value); } catch (error) { return fallback; }
  }

  function localDateKey(value) {
    var date = value instanceof Date ? value : new Date();
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  }

  function parseDateKey(key) {
    var parts = String(key || "").split("-").map(Number);
    if (parts.length !== 3 || parts.some(function (part) { return !Number.isFinite(part); })) return new Date();
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function daysBetween(a, b) {
    var first = parseDateKey(a);
    var second = parseDateKey(b);
    first.setHours(12, 0, 0, 0);
    second.setHours(12, 0, 0, 0);
    return Math.round((second - first) / 86400000);
  }

  function read(key, fallback) {
    try {
      var stored = localStorage.getItem(key);
      if (stored === null) return fallback;
      var parsed = safeParse(stored, fallback);
      return parsed === null ? fallback : parsed;
    } catch (error) { return fallback; }
  }

  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (error) { return false; }
  }

  function ensureProfile() {
    var profile = read(KEYS.profile, null);
    if (!profile || !profile.startDate) {
      profile = { startDate: localDateKey(), createdAt: new Date().toISOString(), version: 1 };
      write(KEYS.profile, profile);
    }
    return profile;
  }

  function getDayNumber(dateKey) {
    var profile = ensureProfile();
    var difference = daysBetween(profile.startDate, dateKey || localDateKey());
    return Math.max(1, difference + 1);
  }

  function getProgress() {
    var value = read(KEYS.progress, {});
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function getDayProgress(dateKey) {
    var key = dateKey || localDateKey();
    var value = getProgress()[key];
    return value && typeof value === "object" ? value : {};
  }

  function getCompletedCount(dateKey) {
    var day = getDayProgress(dateKey);
    return MODULES.filter(function (module) { return Boolean(day[module] && day[module].complete); }).length;
  }

  function getDayPercent(dateKey) {
    return Math.round(getCompletedCount(dateKey) / MODULES.length * 100);
  }

  function getStreak() {
    var progress = getProgress();
    var cursor = new Date();
    var streak = 0;
    for (var index = 0; index < 366; index += 1) {
      var key = localDateKey(cursor);
      var day = progress[key] || {};
      var completed = MODULES.filter(function (module) { return Boolean(day[module] && day[module].complete); }).length;
      if (completed >= 5) streak += 1;
      else if (index > 0 || completed < 5) break;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function markModule(module, complete, meta) {
    if (MODULES.indexOf(module) === -1) return;
    var progress = getProgress();
    var key = localDateKey();
    if (!progress[key]) progress[key] = {};
    progress[key][module] = Object.assign({}, progress[key][module] || {}, meta || {}, {
      complete: complete !== false,
      updatedAt: new Date().toISOString()
    });
    write(KEYS.progress, progress);
    window.dispatchEvent(new CustomEvent("northlight:progress", { detail: { module: module, date: key, progress: progress[key] } }));
    updateGlobalUI();
  }

  function getWords() {
    var words = read(KEYS.words, []);
    return Array.isArray(words) ? words : [];
  }

  function saveWords(words) {
    write(KEYS.words, Array.isArray(words) ? words : []);
    updateGlobalUI();
    window.dispatchEvent(new CustomEvent("northlight:words"));
  }

  function getDueWords(now) {
    var stamp = (now instanceof Date ? now : new Date()).getTime();
    return getWords().filter(function (word) {
      return word && word.nextReview && new Date(word.nextReview).getTime() <= stamp;
    }).sort(function (a, b) { return new Date(a.nextReview) - new Date(b.nextReview); });
  }

  function getVoice(locale) {
    if (!("speechSynthesis" in window)) return null;
    var voices = window.speechSynthesis.getVoices();
    var exact = voices.find(function (voice) { return voice.lang.toLowerCase() === locale.toLowerCase(); });
    if (exact) return exact;
    var prefix = locale.split("-")[0].toLowerCase();
    return voices.find(function (voice) { return voice.lang.toLowerCase().indexOf(prefix) === 0; }) || null;
  }

  function speak(text, locale, options) {
    if (!("speechSynthesis" in window) || !text) {
      toast("当前浏览器不支持语音朗读，请使用最新版 Chrome、Edge 或 Safari。");
      return false;
    }
    window.speechSynthesis.cancel();
    var utterance = new SpeechSynthesisUtterance(String(text));
    var voice = getVoice(locale);
    if (voice) utterance.voice = voice;
    utterance.lang = locale;
    utterance.rate = options && options.rate ? options.rate : 0.88;
    utterance.pitch = options && options.pitch ? options.pitch : 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  function toast(message) {
    var element = document.getElementById("toast");
    if (!element) {
      element = document.createElement("div");
      element.id = "toast";
      element.className = "toast";
      element.setAttribute("role", "status");
      document.body.appendChild(element);
    }
    element.textContent = message;
    element.classList.add("visible");
    window.clearTimeout(element._timer);
    element._timer = window.setTimeout(function () { element.classList.remove("visible"); }, 2800);
  }

  function formatChineseDate(date) {
    var weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    return date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日 · " + weekdays[date.getDay()];
  }

  function updateGlobalUI() {
    var today = localDateKey();
    var count = getCompletedCount(today);
    var percent = getDayPercent(today);
    var dayNumber = getDayNumber(today);
    document.querySelectorAll("[data-today-date]").forEach(function (element) { element.textContent = formatChineseDate(new Date()); });
    document.querySelectorAll("[data-day-number]").forEach(function (element) { element.textContent = String(dayNumber); });
    document.querySelectorAll("[data-day-percent]").forEach(function (element) { element.textContent = percent + "%"; });
    document.querySelectorAll("[data-daily-progress]").forEach(function (element) { element.style.width = percent + "%"; });
    document.querySelectorAll("[data-completed-count]").forEach(function (element) { element.textContent = String(count); });
    document.querySelectorAll("[data-total-count]").forEach(function (element) { element.textContent = String(MODULES.length); });
    document.querySelectorAll("[data-due-count]").forEach(function (element) { element.textContent = String(getDueWords().length); });
    document.querySelectorAll("[data-streak-count]").forEach(function (element) { element.textContent = String(getStreak()); });
    document.querySelectorAll("[data-word-count]").forEach(function (element) { element.textContent = String(getWords().length); });

    document.querySelectorAll("[data-module-status]").forEach(function (element) {
      var module = element.getAttribute("data-module-status");
      var day = getDayProgress(today);
      var complete = Boolean(day[module] && day[module].complete);
      element.textContent = complete ? "已完成" : "待完成";
      element.classList.toggle("complete", complete);
      element.classList.toggle("pending", !complete);
    });

    document.querySelectorAll("[data-module-card]").forEach(function (element) {
      var module = element.getAttribute("data-module-card");
      var day = getDayProgress(today);
      var complete = Boolean(day[module] && day[module].complete);
      element.classList.toggle("complete", complete);
      var chip = element.querySelector("[data-module-status]");
      if (chip) {
        chip.textContent = complete ? "已完成" : "今日待做";
        chip.classList.toggle("complete", complete);
        chip.classList.toggle("pending", !complete);
      }
    });
  }

  function initNavigation() {
    var nav = document.querySelector(".site-nav");
    var toggle = document.querySelector(".nav-toggle");
    var path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".site-nav a").forEach(function (link) {
      var href = link.getAttribute("href") || "";
      if (href === path || (path === "" && href === "index.html")) link.setAttribute("aria-current", "page");
    });
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
      nav.addEventListener("click", function () { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); });
    }
  }

  function initSkeletons() {
    window.setTimeout(function () {
      document.querySelectorAll("[data-skeleton] .skeleton").forEach(function (node) { node.remove(); });
      document.querySelectorAll("[data-skeleton]").forEach(function (node) { node.removeAttribute("data-skeleton"); });
    }, 220);
  }

  window.NL = {
    KEYS: KEYS,
    MODULES: MODULES,
    MODULE_LABELS: MODULE_LABELS,
    localDateKey: localDateKey,
    parseDateKey: parseDateKey,
    daysBetween: daysBetween,
    read: read,
    write: write,
    ensureProfile: ensureProfile,
    getDayNumber: getDayNumber,
    getProgress: getProgress,
    getDayProgress: getDayProgress,
    getCompletedCount: getCompletedCount,
    getDayPercent: getDayPercent,
    getStreak: getStreak,
    markModule: markModule,
    getWords: getWords,
    saveWords: saveWords,
    getDueWords: getDueWords,
    speak: speak,
    getVoice: getVoice,
    toast: toast,
    updateGlobalUI: updateGlobalUI
  };

  document.addEventListener("DOMContentLoaded", function () {
    ensureProfile();
    initNavigation();
    initSkeletons();
    updateGlobalUI();
    if ("speechSynthesis" in window) window.speechSynthesis.getVoices();
  });
  window.addEventListener("storage", updateGlobalUI);
})();
