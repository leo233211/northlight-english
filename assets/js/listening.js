(function () {
  "use strict";

  var sentences = [
    { text: "Scarcity forces individuals and societies to make choices about how limited resources are allocated.", zh: "稀缺性迫使个人与社会就有限资源的分配作出选择。", focus: "forces ... to make choices" },
    { text: "Opportunity cost is not simply the money spent; it is the value of the best alternative forgone.", zh: "机会成本不只是花掉的钱，而是被放弃的最佳替代方案的价值。", focus: "not simply ...; it is ..." },
    { text: "At the equilibrium price, the quantity demanded by consumers equals the quantity supplied by producers.", zh: "在均衡价格下，消费者需求量等于生产者供给量。", focus: "quantity demanded / supplied" },
    { text: "A small change in price may have a substantial effect when demand is highly elastic.", zh: "当需求富有弹性时，价格的小幅变化也可能产生显著影响。", focus: "substantial effect / highly elastic" },
    { text: "Policymakers often face a trade-off between reducing inflation and supporting employment in the short run.", zh: "政策制定者往往要在短期降低通胀与支持就业之间作出权衡。", focus: "face a trade-off between" },
    { text: "The central bank raised interest rates to cool aggregate demand, although the effect may take several months.", zh: "央行提高利率以抑制总需求，不过其效果可能需要数月才会显现。", focus: "to cool aggregate demand / although" },
    { text: "Comparative advantage suggests that countries can gain from specialisation even when one is more productive in every industry.", zh: "比较优势表明，即使一国在所有行业都更具生产率，各国仍可从专业化中获益。", focus: "gain from specialisation" },
    { text: "It would be misleading to infer causation from a simple correlation between two economic variables.", zh: "仅凭两个经济变量之间的简单相关关系推断因果关系会产生误导。", focus: "misleading to infer causation" }
  ];

  var videos = [
    { title: "What is the future of work?", bvid: "BV1Pp421f7DP", duration: "6:13", note: "大学与职业变化 · 英式发音", meta: "BBC 6 Minute English" },
    { title: "Healthy meals on a budget", bvid: "BV1rpXnYAE27", duration: "5:52", note: "价格、选择与生活英语", meta: "BBC 6 Minute English" },
    { title: "Is rejection good for us?", bvid: "BV1Wveb6rEjB", duration: "6:22", note: "心理与成长 · 观点表达", meta: "BBC 6 Minute English" },
    { title: "How do we describe smells?", bvid: "BV18Khs6PEnr", duration: "6:13", note: "感官词汇 · 细致描述", meta: "BBC 6 Minute English" },
    { title: "Climate change and population", bvid: "BV1sz4y1u7qN", duration: "6:12", note: "因果链与政策表达", meta: "BBC 6 Minute English" },
    { title: "Why smells make us feel at home", bvid: "BV1zET7zUEDb", duration: "6:14", note: "生活经验 · 英式语调节奏", meta: "BBC 6 Minute English" }
  ];

  var played = new Set();

  function renderSentences() {
    var container = document.getElementById("sentenceList");
    container.innerHTML = sentences.map(function (item, index) {
      return '<article class="listening-sentence"><p>' + item.text + '</p><p class="sentence-note">' + item.zh + ' · 重点：' + item.focus + '</p><div class="pronounce-row"><button class="pronounce-button" type="button" data-sentence="' + index + '" data-locale="en-GB">英式发音</button><button class="pronounce-button" type="button" data-sentence="' + index + '" data-locale="en-US">美式发音</button></div></article>';
    }).join("");
  }

  function renderVideos() {
    var container = document.getElementById("bbcVideoGrid");
    container.innerHTML = videos.map(function (video, index) {
      return '<article class="card video-card"><button class="video-poster" type="button" data-video="' + index + '" aria-label="播放 ' + video.title + '"><span class="play-orb">▶</span><span class="video-label">点击加载 B 站播放器</span></button><h3>' + video.title + '</h3><p>' + video.note + '</p><div class="video-meta"><span>' + video.meta + '</span><span>' + video.duration + '</span></div></article>';
    }).join("");
  }

  function loadVideo(index, poster) {
    var video = videos[index];
    var frame = document.createElement("div");
    frame.className = "video-frame";
    frame.innerHTML = '<iframe src="https://player.bilibili.com/player.html?bvid=' + encodeURIComponent(video.bvid) + '&page=1&high_quality=1&danmaku=0&autoplay=0" title="' + video.title + '" loading="lazy" allowfullscreen="allowfullscreen" referrerpolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"></iframe>';
    poster.replaceWith(frame);
    played.add(video.bvid);
    if (played.size >= 2) NL.markModule("listening", true, { videosPlayed: played.size });
    NL.toast("视频播放器已加载；若受地区限制，可点击下方 BBC 官方链接。");
  }

  function initQuiz() {
    document.querySelectorAll("[data-listening-answer]").forEach(function (button) {
      button.addEventListener("click", function () {
        var correct = button.getAttribute("data-correct") === "true";
        document.querySelectorAll('[data-listening-question="' + button.getAttribute("data-listening-question") + '"] .option').forEach(function (option) { option.classList.remove("correct", "wrong"); });
        button.classList.add(correct ? "correct" : "wrong");
        document.getElementById("listeningFeedback").textContent = correct ? "正确。答案依据：虽然相关性可提示关系，但不能单独证明因果关系。" : "再听一遍第 8 句，注意 misleading、infer causation 和 correlation。";
        if (correct) NL.markModule("listening", true, { quizCorrect: true });
      });
    });
  }

  function init() {
    if (!document.getElementById("sentenceList")) return;
    renderSentences();
    renderVideos();
    initQuiz();
    document.getElementById("sentenceList").addEventListener("click", function (event) {
      var button = event.target.closest("[data-sentence]");
      if (!button) return;
      var item = sentences[Number(button.getAttribute("data-sentence"))];
      NL.speak(item.text, button.getAttribute("data-locale"), { rate: 0.84 });
    });
    document.getElementById("bbcVideoGrid").addEventListener("click", function (event) {
      var poster = event.target.closest("[data-video]");
      if (poster) loadVideo(Number(poster.getAttribute("data-video")), poster);
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
