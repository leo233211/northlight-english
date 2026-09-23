(function () {
  "use strict";
  var prompts = [
    "Some students believe that university courses should focus mainly on employment skills, while others argue that academic knowledge has broader value. Discuss both views and give your opinion.",
    "As cities become more expensive, should governments prioritise rent controls or the construction of new housing? Explain your reasoning.",
    "Some people argue that economic growth always improves living standards. To what extent do you agree or disagree?"
  ];
  var academicWords = ["analyse", "assessment", "assumption", "benefit", "consequence", "considerable", "consistent", "constraint", "context", "demonstrate", "distribution", "evidence", "factor", "framework", "implication", "indicate", "inequality", "interpret", "measure", "outcome", "policy", "significant", "suggest", "theory", "therefore"];
  var hedges = ["may", "might", "can", "could", "often", "generally", "tend", "likely", "appears", "suggests", "in some cases"];
  var transitions = ["however", "therefore", "moreover", "furthermore", "although", "whereas", "consequently", "in contrast", "for example", "as a result"];
  var informal = ["a lot of", "lots of", "kind of", "stuff", "things", "really", "totally", "get", "big", "bad", "good"];
  var promptIndex = 0;
  function words(text) { return String(text || "").toLowerCase().match(/[a-z][a-z'-]*/g) || []; }
  function sentences(text) { return String(text || "").split(/[.!?]+/).map(function (item) { return item.trim(); }).filter(Boolean); }
  function countMatches(text, list) { var lower = String(text || "").toLowerCase(); return list.reduce(function (total, item) { return total + (lower.split(item).length - 1); }, 0); }
  function analyse(text) {
    var tokens = words(text);
    var sentenceList = sentences(text);
    var unique = new Set(tokens).size;
    var lex = tokens.length ? Math.round(unique / tokens.length * 100) : 0;
    var avgSentence = sentenceList.length ? Math.round(tokens.length / sentenceList.length) : 0;
    var transitionCount = countMatches(text, transitions);
    var hedgeCount = countMatches(text, hedges);
    var academicCount = countMatches(text, academicWords);
    var informalCount = countMatches(text, informal);
    var longSentences = sentenceList.filter(function (sentence) { return words(sentence).length > 32; }).length;
    var taskScore = Math.min(100, Math.round(tokens.length / 180 * 100));
    var coherence = Math.max(30, Math.min(100, 55 + transitionCount * 7 - Math.max(0, avgSentence - 24) * 2));
    var vocabulary = Math.max(25, Math.min(100, 42 + academicCount * 6 + Math.max(0, lex - 45)));
    var grammar = Math.max(30, Math.min(100, 92 - longSentences * 9 - Math.max(0, avgSentence - 30) * 2));
    var style = Math.max(25, Math.min(100, 78 + hedgeCount * 3 - informalCount * 7));
    return { tokens: tokens.length, sentences: sentenceList.length, unique: unique, lex: lex, avgSentence: avgSentence, transitionCount: transitionCount, hedgeCount: hedgeCount, academicCount: academicCount, informalCount: informalCount, longSentences: longSentences, scores: [taskScore, coherence, vocabulary, grammar, style] };
  }
  function feedbackFor(data) {
    var items = [];
    if (data.tokens < 120) items.push("先把正文扩展到 120–180 词：一个清晰立场、两个发展段落和一个结论。");
    if (data.avgSentence > 25) items.push("平均句长偏高。把每句话缩到一个主要主张，再用下一句解释或举例。");
    if (data.transitionCount < 3) items.push("增加逻辑关系词，但不要机械堆砌。尝试 however、whereas、therefore、as a result。");
    if (data.hedgeCount < 2) items.push("学术英语需要谨慎表达。可使用 may、tend to、suggest、it appears that。");
    if (data.informalCount > 0) items.push("检测到口语或模糊表达。将 a lot of 改为 considerable，将 things 改为 factors 或 aspects。");
    if (data.academicCount < 5) items.push("加入与主题相关的学术词，但必须保证搭配和语境准确。");
    if (data.longSentences > 1) items.push("有 " + data.longSentences + " 个超长句。先拆句，再检查主谓一致和指代。");
    if (!items.length) items.push("结构的基础较稳。下一步检查每个例子是否真正支持段落主题句，并删除重复解释。");
    return items;
  }
  function renderAnalysis() {
    var text = document.getElementById("writingDraft").value;
    var data = analyse(text);
    document.getElementById("wordCount").textContent = data.tokens + " words";
    document.getElementById("sentenceCount").textContent = data.sentences + " sentences";
    document.getElementById("lexicalDiversity").textContent = data.lex + "% unique";
    ["task", "coherence", "vocabulary", "grammar", "style"].forEach(function (key, index) {
      document.getElementById("score-" + key).style.width = data.scores[index] + "%";
      document.getElementById("value-" + key).textContent = data.scores[index] + "/100";
    });
    document.getElementById("writingFeedback").innerHTML = feedbackFor(data).map(function (item) { return '<div class="callout"><p>' + item + '</p></div>'; }).join("");
    var store = NL.read(NL.KEYS.writing, {});
    store[NL.localDateKey()] = { draft: text, updatedAt: new Date().toISOString(), analysis: data };
    NL.write(NL.KEYS.writing, store);
  }
  function setPrompt() { document.getElementById("writingPrompt").textContent = prompts[promptIndex % prompts.length]; document.getElementById("promptIndex").textContent = String((promptIndex % prompts.length) + 1) + " / " + prompts.length; }
  function init() {
    var editor = document.getElementById("writingDraft");
    if (!editor) return;
    var store = NL.read(NL.KEYS.writing, {});
    var saved = store[NL.localDateKey()];
    if (saved && saved.draft) editor.value = saved.draft;
    promptIndex = NL.getDayNumber() % prompts.length;
    setPrompt();
    renderAnalysis();
    editor.addEventListener("input", renderAnalysis);
    document.getElementById("newPrompt").addEventListener("click", function () { promptIndex += 1; setPrompt(); NL.toast("已切换写作题目。"); });
    document.getElementById("completeWriting").addEventListener("click", function () {
      var data = analyse(editor.value);
      if (data.tokens < 100) { NL.toast("至少写到 100 词再完成；今日目标是 120–180 词。"); return; }
      NL.markModule("writing", true, { words: data.tokens, updatedAt: new Date().toISOString() });
      NL.toast("写作模块已完成，草稿仅保存在本机。");
    });
    document.getElementById("clearWriting").addEventListener("click", function () {
      if (!window.confirm("确定清空今天保存在本机的草稿吗？")) return;
      editor.value = "";
      renderAnalysis();
    });
  }
  document.addEventListener("DOMContentLoaded", init);
})();
