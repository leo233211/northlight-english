(function () {
  "use strict";
  var INTERVAL_DAYS = [1, 2, 4, 7, 15, 30, 60];
  var RATING_LABELS = { again: "Again", hard: "Hard", good: "Good", easy: "Easy" };
  var state = { plan: [], index: 0, activeWord: null };

  function flattenIelts() {
    var source = typeof vocabulary !== "undefined" && vocabulary ? vocabulary : {};
    return Object.keys(source).map(function (theme, themeIndex) {
      var group = source[theme] || {};
      var words = Array.isArray(group.words) ? group.words.flat(2) : [];
      return {
        theme: theme,
        themeIndex: themeIndex,
        words: words.map(function (item) {
          return { id: "ielts-" + themeIndex + "-" + item.id, w: String(item.word || "").trim(), p: String(item.pos || "n.").trim(), z: String(item.meaning || "待补充释义").trim(), e: String(item.example || "").trim(), t: "ielts", theme: theme };
        }).filter(function (item) { return item.w; })
      };
    }).filter(function (group) { return group.words.length; });
  }

  function economicsItems() {
    var source = Array.isArray(window.ECONOMICS_VOCABULARY) ? window.ECONOMICS_VOCABULARY : [];
    return source.map(function (item, index) {
      return { id: "economics-" + index, w: item[0], p: item[1], z: item[2], e: item[3], t: "economics", theme: "International Economics" };
    });
  }

  function sentenceFor(word) {
    if (word.e && word.e !== "-") return word.e.replace(/[.。]$/, "") + ".";
    var pos = String(word.p || "").toLowerCase();
    if (pos.indexOf("v") === 0) return "In an academic discussion, researchers may " + word.w + " the evidence before drawing a conclusion.";
    if (pos.indexOf("adj") >= 0) return "The report describes the outcome as " + word.w + " in this particular context.";
    if (pos.indexOf("adv") >= 0) return "The author presents the argument " + word.w + " and supports it with evidence.";
    return "The concept of " + word.w + " plays an important role in this economic discussion.";
  }

  function interleaveIelts(groups) {
    var result = [];
    var maximum = groups.reduce(function (size, group) { return Math.max(size, group.words.length); }, 0);
    for (var index = 0; index < maximum; index += 1) {
      groups.forEach(function (group) { if (group.words[index]) result.push(group.words[index]); });
    }
    return result;
  }

  function planForDay(dayNumber) {
    var learned = new Set(NL.getWords().map(function (word) { return word.id; }));
    var fallback = interleaveIelts(flattenIelts());
    var econ = economicsItems();
    var ieltsPlan = [];
    var start = ((Math.max(1, dayNumber) - 1) * 22) % fallback.length;
    for (var step = 0; step < fallback.length && ieltsPlan.length < 22; step += 1) {
      var candidate = fallback[(start + step) % fallback.length];
      if (!learned.has(candidate.id) && !ieltsPlan.some(function (word) { return word.id === candidate.id; })) ieltsPlan.push(candidate);
    }
    var economicsPlan = [];
    var econStart = ((Math.max(1, dayNumber) - 1) * 8) % econ.length;
    for (var econStep = 0; econStep < econ.length && economicsPlan.length < 8; econStep += 1) {
      var term = econ[(econStart + econStep) % econ.length];
      if (!learned.has(term.id) && !economicsPlan.some(function (word) { return word.id === term.id; })) economicsPlan.push(term);
    }
    return ieltsPlan.slice(0, 22).concat(economicsPlan.slice(0, 8)).map(function (word) {
      return Object.assign({}, word, { example: sentenceFor(word) });
    });
  }

  function formatDate(value) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "未安排";
    return (date.getMonth() + 1) + "月" + date.getDate() + "日 " + String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0");
  }

  function nextSchedule(word, rating) {
    var now = new Date();
    var isNew = !word.learnedAt;
    var stage = Number.isInteger(word.stage) ? word.stage : 0;
    if (rating === "again") { stage = 0; now.setMinutes(now.getMinutes() + 10); }
    else if (rating === "hard") { stage = 0; now.setMinutes(now.getMinutes() + 30); }
    else if (rating === "easy") { stage = isNew ? 1 : Math.min(INTERVAL_DAYS.length, stage + 2); now.setDate(now.getDate() + (INTERVAL_DAYS[Math.max(0, stage - 1)] || 60)); }
    else if (isNew) { stage = 0; now.setMinutes(now.getMinutes() + 20); }
    else { stage = Math.min(INTERVAL_DAYS.length, stage + 1); now.setDate(now.getDate() + (INTERVAL_DAYS[Math.max(0, stage - 1)] || 60)); }
    return { stage: stage, nextReview: now.toISOString() };
  }

  function updateWordBank(word, rating) {
    var words = NL.getWords();
    var index = words.findIndex(function (item) { return item.id === word.id; });
    var schedule = nextSchedule(index >= 0 ? words[index] : word, rating);
    var entry = index >= 0 ? words[index] : { id: word.id, w: word.w, p: word.p, z: word.z, t: word.t, theme: word.theme, example: word.example, learnedAt: new Date().toISOString(), firstDate: NL.localDateKey(), ratingHistory: [] };
    entry.lastRating = rating;
    entry.stage = schedule.stage;
    entry.nextReview = schedule.nextReview;
    entry.lastReviewedAt = new Date().toISOString();
    entry.ratingHistory = Array.isArray(entry.ratingHistory) ? entry.ratingHistory : [];
    entry.ratingHistory.push({ rating: rating, at: new Date().toISOString() });
    if (index >= 0) words[index] = entry; else words.push(entry);
    NL.saveWords(words);
  }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character];
    });
  }

  function renderWord() {
    var card = document.getElementById("wordCard");
    if (!card) return;
    if (!state.activeWord) {
      card.innerHTML = '<div class="empty-state"><div class="empty-orb" aria-hidden="true"></div><h3>今日 30 个新词已完成</h3><p>词汇已经进入你的本地词库。现在可以返回复习队列，等待下一轮到期卡片。</p><a class="button sage" href="calendar.html">记录今日学习</a></div>';
      document.getElementById("wordCounter").textContent = "30 / 30";
      document.getElementById("wordProgress").style.width = "100%";
      return;
    }
    var word = state.activeWord;
    document.getElementById("wordCounter").textContent = state.index + " / 30";
    document.getElementById("wordProgress").style.width = (state.index / 30 * 100) + "%";
    document.getElementById("wordText").textContent = word.w;
    document.getElementById("wordPos").textContent = (word.t === "economics" ? "Economics · " : "IELTS · ") + word.p + " · " + word.theme;
    document.getElementById("wordMeaning").textContent = word.z;
    document.getElementById("wordExample").textContent = word.example;
    document.getElementById("wordCategory").textContent = word.t === "economics" ? "国际经济学 1/4" : "IELTS & Academic 3/4";
    var dictionaryLink = document.getElementById('dictionaryLink'); if (dictionaryLink) dictionaryLink.href = 'https://dict.youdao.com/result?word=' + encodeURIComponent(word.w);
    var cambridgeLink = document.getElementById('cambridgeLink'); if (cambridgeLink) cambridgeLink.href = 'https://dictionary.cambridge.org/dictionary/english/' + encodeURIComponent(word.w);
  }

  function rateCurrent(rating) {
    if (!state.activeWord) return;
    updateWordBank(state.activeWord, rating);
    state.index += 1;
    state.activeWord = state.plan[state.index] || null;
    if (!state.activeWord) {
      NL.markModule("vocabulary", true, { newWords: 30, completedAt: new Date().toISOString() });
      NL.toast("今日 30 个新词已完成，已加入艾宾浩斯复习队列。");
    } else {
      NL.toast(RATING_LABELS[rating] + "：已记录，下次复习时间已更新。");
    }
    renderWord();
    renderDueQueue();
    renderWordBank();
  }

  function renderDueQueue() {
    var container = document.getElementById("dueQueue");
    if (!container) return;
    var due = NL.getDueWords();
    if (!due.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-orb" aria-hidden="true"></div><h3>现在没有到期词</h3><p>先完成今日 30 个新词。20 分钟后，第一批快速巩固会自动出现在这里。</p></div>';
      return;
    }
    container.innerHTML = due.slice(0, 12).map(function (word) {
      return '<div class="due-item"><div><strong>' + escapeHtml(word.w) + '</strong><span>' + escapeHtml(word.z) + ' · 第 ' + (Number(word.stage || 0) + 1) + ' 阶段</span></div><button class="button quiet small" type="button" data-review-id="' + escapeHtml(word.id) + '">英音提示</button></div>';
    }).join("");
  }

  function reviewById(id) {
    var word = NL.getWords().find(function (item) { return item.id === id; });
    if (word) NL.speak(word.w + ". " + (word.example || ""), "en-GB", { rate: 0.82 });
  }

  function renderWordBank() {
    var table = document.getElementById("wordTable");
    if (!table) return;
    var query = (document.getElementById("wordSearch") && document.getElementById("wordSearch").value || "").trim().toLowerCase();
    var filter = document.getElementById("wordFilter") && document.getElementById("wordFilter").value || "all";
    var words = NL.getWords().filter(function (word) {
      var categoryMatch = filter === "all" || word.t === filter;
      var queryMatch = !query || word.w.toLowerCase().indexOf(query) >= 0 || String(word.z).indexOf(query) >= 0;
      return categoryMatch && queryMatch;
    }).sort(function (a, b) { return new Date(b.learnedAt) - new Date(a.learnedAt); });
    if (!words.length) {
      table.innerHTML = '<div class="empty-state"><div class="empty-orb" aria-hidden="true"></div><h3>词库还是空的</h3><p>完成第一张卡片后，单词会自动进入这里，并保存学习日期、评级和下次复习时间。</p><a class="button sage" href="#wordCard">开始今日词汇</a></div>';
      return;
    }
    table.innerHTML = '<div class="table-shell"><table class="data-table"><thead><tr><th>单词</th><th>释义</th><th>来源</th><th>阶段</th><th>下次复习</th></tr></thead><tbody>' + words.map(function (word) {
      return '<tr><td><strong>' + escapeHtml(word.w) + '</strong><br><span>' + escapeHtml(word.p) + '</span></td><td>' + escapeHtml(word.z) + '</td><td>' + (word.t === "economics" ? "经济学" : "IELTS") + '</td><td>' + (Number(word.stage || 0) + 1) + '</td><td>' + formatDate(word.nextReview) + '</td></tr>';
    }).join("") + '</tbody></table></div>';
  }

  function init() {
    if (!document.getElementById("wordCard")) return;
    state.plan = planForDay(NL.getDayNumber());
    state.index = 0;
    state.activeWord = state.plan[0] || null;
    if (!state.plan.length) NL.markModule("vocabulary", true, { newWords: 0, completedAt: new Date().toISOString() });
    renderWord();
    renderDueQueue();
    renderWordBank();
    document.querySelectorAll("[data-rating]").forEach(function (button) {
      button.addEventListener("click", function () { rateCurrent(button.getAttribute("data-rating")); });
    });
    document.querySelectorAll("[data-speak-locale]").forEach(function (button) {
      button.addEventListener("click", function () {
        if (state.activeWord) NL.speak(state.activeWord.w + ". " + state.activeWord.example, button.getAttribute("data-speak-locale"));
      });
    });
    document.getElementById("dueQueue")?.addEventListener("click", function (event) {
      var button = event.target.closest("[data-review-id]");
      if (button) reviewById(button.getAttribute("data-review-id"));
    });
    document.getElementById("wordSearch")?.addEventListener("input", renderWordBank);
    document.getElementById("wordFilter")?.addEventListener("change", renderWordBank);
    document.getElementById("exportWords")?.addEventListener("click", function () {
      var blob = new Blob([JSON.stringify(NL.getWords(), null, 2)], { type: "application/json" });
      var link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "northlight-wordbank-" + NL.localDateKey() + ".json";
      link.click();
      URL.revokeObjectURL(link.href);
      NL.toast("词库已导出到本机下载目录。");
    });
    window.addEventListener("northlight:words", function () { renderDueQueue(); renderWordBank(); NL.updateGlobalUI(); });
  }

  window.NorthlightVocabulary = { planForDay: planForDay, flattenIelts: flattenIelts, economicsItems: economicsItems };
  document.addEventListener("DOMContentLoaded", init);
})();
