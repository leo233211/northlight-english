(function () {
  "use strict";
  var clips = [
    { show: "Friends", region: "US", bvid: "BV1yW5NzGEuw", duration: "4:26", level: "B1", note: "日常对话、幽默与关系潜台词", expressions: ["give someone a hand", "make it up to someone", "I have no idea"] },
    { show: "Sherlock", region: "UK", bvid: "BV1qu4y1S7zm", duration: "2:14", level: "B2", note: "快速英音、逻辑连接与人物性格", expressions: ["apparently", "as far as I am concerned", "that is not the point"] },
    { show: "Downton Abbey", region: "UK", bvid: "BV1iG4y1N75S", duration: "3:43", level: "B2", note: "礼貌、阶层语气与含蓄表达", expressions: ["I wonder if you might", "I am afraid", "if you do not mind"] },
    { show: "The Big Bang Theory", region: "US", bvid: "BV1Ct411Y7Z8", duration: "4:06", level: "B2", note: "科技词、笑声节奏与直白口语", expressions: ["What is the matter?", "It depends", "That makes sense"] },
    { show: "Modern Family", region: "US", bvid: "BV1Ns41167Da", duration: "10:28", level: "B1", note: "家庭冲突、讽刺和自然连读", expressions: ["I am just saying", "let it go", "take it easy"] },
    { show: "Young Sheldon", region: "US", bvid: "BV16P411C7FH", duration: "4:29", level: "B1", note: "校园生活、学术表达与冷幽默", expressions: ["for the record", "strictly speaking", "in my defence"] }
  ];
  var opened = new Set();
  function renderClips() {
    document.getElementById("funGrid").innerHTML = clips.map(function (clip, index) {
      return '<article class="card video-card"><button class="video-poster" type="button" data-clip="' + index + '" aria-label="播放 ' + clip.show + ' 片段"><span class="play-orb">▶</span><span class="video-label">点击加载 B 站播放器</span></button><h3>' + clip.show + '</h3><p>' + clip.note + '</p><div class="video-meta"><span>' + clip.region + ' · ' + clip.level + '</span><span>' + clip.duration + '</span></div><div class="meta-row">' + clip.expressions.map(function (expression) { return '<span class="tag">' + expression + '</span>'; }).join("") + '</div></article>';
    }).join("");
  }
  function loadClip(index, poster) {
    var clip = clips[index];
    var frame = document.createElement("div");
    frame.className = "video-frame";
    frame.innerHTML = '<iframe src="https://player.bilibili.com/player.html?bvid=' + encodeURIComponent(clip.bvid) + '&page=1&high_quality=1&danmaku=0&autoplay=0" title="' + clip.show + ' 英语片段" loading="lazy" allowfullscreen="allowfullscreen" referrerpolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"></iframe>';
    poster.replaceWith(frame);
    opened.add(clip.bvid);
    NL.toast("播放器已加载。建议第一遍看剧情，第二遍收集一个可迁移表达。");
  }
  function init() {
    var grid = document.getElementById("funGrid");
    if (!grid) return;
    renderClips();
    grid.addEventListener("click", function (event) { var poster = event.target.closest("[data-clip]"); if (poster) loadClip(Number(poster.getAttribute("data-clip")), poster); });
    document.getElementById("funQuiz").addEventListener("click", function (event) {
      var button = event.target.closest("[data-fun-option]");
      if (!button) return;
      var correct = button.getAttribute("data-correct") === "true";
      button.parentElement.querySelectorAll(".option").forEach(function (option) { option.classList.remove("correct", "wrong"); });
      button.classList.add(correct ? "correct" : "wrong");
      document.getElementById("funFeedback").textContent = correct ? "正确。语气与语境常常比字面意思更关键。" : "再想一想：说话者的语气和回避行为提供了额外信息。";
      if (correct && opened.size >= 1) NL.markModule("fun", true, { clipOpened: true, quizCorrect: true });
    });
  }
  document.addEventListener("DOMContentLoaded", init);
})();
