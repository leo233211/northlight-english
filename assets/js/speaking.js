(function () {
  "use strict";
  var sentences = [
    { text: "Economics is not only about money; it is about how people make decisions under constraints.", tip: "重读 money、decisions、constraints；分号前稍停。" },
    { text: "There is considerable evidence that early intervention can improve long-term outcomes.", tip: "considerable 和 improve 加重；that 后弱读连读。" },
    { text: "Although the policy may reduce inflation, it could also raise unemployment in the short run.", tip: "although 句升调，主句用降调；对比 reduce / raise。" },
    { text: "I would argue that the benefits outweigh the costs, provided that the scheme is carefully designed.", tip: "would argue 保持坚定但礼貌；provided that 快速连读。" },
    { text: "The data suggest a strong correlation, but they do not establish causation.", tip: "suggest 谨慎，but 后明显停顿；correlation / causation 对比重音。" },
    { text: "What matters is not merely whether growth occurs, but how its benefits are distributed.", tip: "not merely ... but ... 形成语调对比。" },
    { text: "In order to evaluate this claim, we need to consider both efficiency and equity.", tip: "evaluate、efficiency、equity 三个核心词清楚拉开。" },
    { text: "On balance the proposal seems worthwhile, though some limitations should be acknowledged.", tip: "On balance 后短停；though 引导让步，句尾降调。" }
  ];
  var chosen = 0;
  var recorder = null;
  var chunks = [];
  var recordings = [];
  var startTime = 0;
  var timer = null;
  function renderSentences() {
    document.getElementById("shadowingList").innerHTML = sentences.map(function (sentence, index) {
      return '<article class="listening-sentence"><p>' + sentence.text + '</p><p class="sentence-note">' + sentence.tip + '</p><div class="pronounce-row"><button class="pronounce-button" type="button" data-play="' + index + '" data-locale="en-GB">英式示范</button><button class="pronounce-button" type="button" data-play="' + index + '" data-locale="en-US">美式示范</button><button class="button quiet small" type="button" data-select="' + index + '">选择跟读</button></div></article>';
    }).join("");
    selectSentence(0);
  }
  function selectSentence(index) { chosen = index; document.getElementById("selectedSentence").textContent = sentences[index].text; document.getElementById("recordStatus").textContent = "准备录制第 " + (index + 1) + " 句"; }
  function toggleRecording() {
    if (recorder && recorder.state === "recording") { recorder.stop(); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) { NL.toast("当前页面无法访问麦克风。公开的 HTTPS 页面或 localhost 可使用录音。"); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      recorder = new MediaRecorder(stream);
      chunks = [];
      recorder.addEventListener("dataavailable", function (event) { if (event.data.size) chunks.push(event.data); });
      recorder.addEventListener("stop", function () {
        var blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        recordings.unshift({ url: URL.createObjectURL(blob), sentence: sentences[chosen].text, duration: Math.max(1, Math.round((Date.now() - startTime) / 1000)) });
        stream.getTracks().forEach(function (track) { track.stop(); });
        document.getElementById("waveform").classList.remove("active");
        document.getElementById("recordButton").textContent = "开始录音";
        document.getElementById("recordStatus").textContent = "已录制，可在下方回放比较";
        renderRecordings();
        if (recordings.length >= 2) NL.markModule("speaking", true, { recordings: recordings.length });
      });
      recorder.start();
      startTime = Date.now();
      document.getElementById("waveform").classList.add("active");
      document.getElementById("recordButton").textContent = "停止录音";
      document.getElementById("recordStatus").textContent = "录音中 · 请跟读并保持自然语速";
      window.clearInterval(timer);
      timer = window.setInterval(function () { document.getElementById("recordStatus").textContent = "录音中 · " + Math.round((Date.now() - startTime) / 1000) + " 秒"; }, 500);
    }).catch(function () { NL.toast("未获得麦克风权限，仍可使用示范音频完成影子跟读。"); });
  }
  function renderRecordings() {
    var container = document.getElementById("recordingList");
    if (!recordings.length) { container.innerHTML = '<div class="empty-state"><div class="empty-orb" aria-hidden="true"></div><h3>还没有录音</h3><p>点击开始录音，完成一遍影子跟读。录音只保留在当前页面内存中，刷新后会消失。</p></div>'; return; }
    container.innerHTML = recordings.map(function (item, index) {
      return '<div class="recording-item"><div><strong>Take ' + (recordings.length - index) + '</strong><br><span>' + item.duration + 's</span></div><audio controls src="' + item.url + '"></audio><button class="button danger small" type="button" data-delete-record="' + index + '">删除</button></div>';
    }).join("");
  }
  function init() {
    if (!document.getElementById("shadowingList")) return;
    renderSentences();
    renderRecordings();
    document.getElementById("recordButton").addEventListener("click", toggleRecording);
    document.getElementById("completeSpeaking").addEventListener("click", function () { NL.markModule("speaking", true, { selfPractice: true, recordings: recordings.length }); NL.toast("口语模块已完成。目标不是完美，而是让重音、停顿和连贯性更稳定。"); });
    document.getElementById("shadowingList").addEventListener("click", function (event) {
      var play = event.target.closest("[data-play]");
      var select = event.target.closest("[data-select]");
      if (play) NL.speak(sentences[Number(play.getAttribute("data-play"))].text, play.getAttribute("data-locale"), { rate: 0.84 });
      if (select) selectSentence(Number(select.getAttribute("data-select")));
    });
    document.getElementById("recordingList").addEventListener("click", function (event) {
      var button = event.target.closest("[data-delete-record]");
      if (!button) return;
      var index = Number(button.getAttribute("data-delete-record"));
      URL.revokeObjectURL(recordings[index].url);
      recordings.splice(index, 1);
      renderRecordings();
    });
  }
  document.addEventListener("DOMContentLoaded", init);
})();
