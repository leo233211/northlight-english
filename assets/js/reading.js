(function () {
  "use strict";
  var passages = [
    {
      id: "opportunity-cost", label: "Economics", title: "The Hidden Cost of Every Choice", level: "B1–B2 · 6 minutes",
      intro: "This passage introduces opportunity cost and explains why economists focus on alternatives rather than money alone.",
      paragraphs: [
        "Every choice involves giving something up. A student who spends an evening revising for an economics test cannot use those hours to attend a society meeting, work part-time, or rest. Economists call the value of the best alternative forgone the opportunity cost of the chosen option.",
        "Opportunity cost is not always equal to the price of a good. A university course may be free at the point of use, but it still has a cost: the income that the student could have earned elsewhere, the time that could have been spent on other activities, and the value of the skills that were not developed. These costs are often invisible in a simple budget, yet they influence real decisions.",
        "The idea becomes especially important when resources are scarce. Governments must decide how much to spend on hospitals, schools, transport, and environmental protection. Choosing more of one thing usually means choosing less of another. This is a trade-off. It does not mean that every decision has only one correct answer; rather, it means that serious analysis should identify who gains, who loses, and what alternatives are being displaced.",
        "Opportunity cost also helps explain why people may respond differently to the same price. A cheap product is not necessarily cheap if buying it requires an hour of travel or a large amount of attention. Likewise, an expensive option may be worthwhile if it saves time that can be used productively. Economists therefore examine the full set of benefits and costs rather than looking only at the amount of money exchanged.",
        "For university students, the concept has a practical use. Before making a decision, ask what is being sacrificed. The answer may reveal that the real choice is not simply between yes and no, but between several possible uses of limited time, energy, and money."
      ],
      questions: [
        { q: "What is opportunity cost according to the passage?", options: ["The price paid for a good", "The value of the best alternative given up", "The total income earned by a student"], answer: 1, evidence: "The first paragraph defines it as the value of the best alternative forgone." },
        { q: "Why can a free university course still have a cost?", options: ["Because students must pay for books", "Because time and alternatives have value", "Because all courses are privately funded"], answer: 1, evidence: "The second paragraph identifies income, time, and undeveloped skills as possible costs." },
        { q: "What does the writer suggest serious analysis should identify?", options: ["Only the cheapest option", "Who gains, who loses and what is displaced", "Why every choice is equally good"], answer: 1, evidence: "The third paragraph gives exactly this list." }
      ]
    },
    {
      id: "academic-reading", label: "Academic skills", title: "Why University Reading Feels Different", level: "B1–B2 · 6 minutes",
      intro: "A short guide to reading for argument, evidence and limitations rather than translating every sentence.",
      paragraphs: [
        "At school, reading is often judged by whether a student can find a fact or answer a comprehension question. At university, reading serves a different purpose. An academic text is usually part of an argument: the author is trying to establish a claim, respond to other scholars, or explain why a particular interpretation is useful.",
        "This changes how a successful reader approaches the page. Instead of asking only what each sentence means, the reader asks what work the sentence is doing. Is it defining a concept, providing evidence, presenting a counterargument, or setting a limitation? A paragraph may contain several facts, but its main function is usually one of these moves.",
        "It is also important to distinguish the author's claim from the evidence used to support it. A strong claim should not be accepted merely because it sounds confident. The reader needs to notice the source of the evidence, the size and context of the sample, and whether alternative explanations have been considered. This is especially important in economics, where a relationship that holds in one country or period may not hold everywhere.",
        "Reading efficiently does not mean reading carelessly. It means adjusting the speed to the purpose. A first reading may focus on the abstract, introduction, headings, and conclusion. A second reading may return to key paragraphs and annotate the argument. A final reading may check exact definitions, numbers, or references before using the material in an essay.",
        "The goal is not to remember every word. It is to leave the text with a clear map: What is the central claim? What evidence supports it? What remains uncertain? Once those questions have answers, the reader is prepared to contribute to a seminar rather than merely summarise the reading."
      ],
      questions: [
        { q: "How does university reading differ from school reading in the passage?", options: ["It requires less attention to facts", "It focuses more on arguments and scholarly conversation", "It always involves longer books"], answer: 1, evidence: "The first paragraph contrasts finding facts with understanding an argument." },
        { q: "What should a reader ask about evidence?", options: ["Whether it sounds confident", "Whether its source, sample and context are reliable", "Whether it contains difficult vocabulary"], answer: 1, evidence: "The third paragraph lists source, sample, context and alternative explanations." },
        { q: "What is the writer's main recommendation?", options: ["Read every text at the same speed", "Build a map of claim, evidence and uncertainty", "Memorise all definitions before reading"], answer: 1, evidence: "The final paragraph states the three central questions." }
      ]
    },
    {
      id: "cities", label: "IELTS style", title: "Can Cities Grow Without Becoming Unfair?", level: "B2 · 8 minutes",
      intro: "Practise argument mapping, cautious language and the difference between correlation and causation.",
      paragraphs: [
        "Cities are often described as engines of opportunity. Workers move towards them because wages tend to be higher and because a dense labour market can make it easier to change jobs. Firms cluster in the same places to share infrastructure, recruit skilled workers, and exchange knowledge. These advantages can raise productivity and generate economic growth.",
        "However, growth does not automatically benefit everyone equally. When demand for housing rises faster than supply, rents and house prices may increase sharply. Workers on lower incomes can be pushed towards the edge of a city, where transport costs and commuting time reduce the practical value of their wages. A city may therefore become more productive while also becoming less accessible.",
        "Some economists argue that the solution is to build more homes, especially in areas with strong demand. Others emphasise public transport, rent support, and rules that prevent excessive speculation. The policies are not mutually exclusive, but each involves costs and distributional effects. Building more housing may reduce pressure on prices, yet existing residents may oppose new development. Subsidising rents can help tenants in the short run, but it may also increase demand if supply responds slowly.",
        "It would be too simple to conclude that urban growth is either good or bad. The relevant question is how the benefits and costs are distributed, and whether institutions can respond quickly enough. A city that attracts investment but excludes essential workers may eventually lose the services and social diversity that made it attractive in the first place."
      ],
      questions: [
        { q: "According to the passage, why do firms cluster in cities?", options: ["To avoid all competition", "To share infrastructure, workers and knowledge", "Because wages are always lower"], answer: 1, evidence: "The first paragraph lists these three advantages." },
        { q: "What can happen when housing demand rises faster than supply?", options: ["Lower-income workers may face higher effective costs", "All residents become wealthier", "Transport costs always fall"], answer: 0, evidence: "The second paragraph explains the pressure on lower-income workers." },
        { q: "Does the passage prove that rent subsidies always reduce long-term housing costs?", options: ["Yes", "No", "The passage does not discuss subsidies"], answer: 1, evidence: "The third paragraph says subsidies may increase demand if supply responds slowly." }
      ]
    }
  ];

  var activeId = passages[0].id;
  var correctAnswers = new Set();

  function renderTabs() {
    document.getElementById("readingTabs").innerHTML = passages.map(function (passage) {
      return '<button type="button" data-passage="' + passage.id + '" class="' + (passage.id === activeId ? "active" : "") + '">' + passage.label + '</button>';
    }).join("");
  }

  function renderPassage() {
    var passage = passages.find(function (item) { return item.id === activeId; });
    document.getElementById("readingTitle").textContent = passage.title;
    document.getElementById("readingMeta").textContent = passage.level;
    document.getElementById("readingIntro").textContent = passage.intro;
    document.getElementById("readingBody").innerHTML = passage.paragraphs.map(function (paragraph) { return '<p>' + paragraph + '</p>'; }).join("");
    document.getElementById("questionSet").innerHTML = passage.questions.map(function (question, questionIndex) {
      return '<article class="question"><h4>' + (questionIndex + 1) + '. ' + question.q + '</h4><div class="option-list">' + question.options.map(function (option, optionIndex) {
        return '<button class="option" type="button" data-question="' + questionIndex + '" data-option="' + optionIndex + '">' + String.fromCharCode(65 + optionIndex) + '. ' + option + '</button>';
      }).join("") + '</div><p class="feedback"></p></article>';
    }).join("");
    correctAnswers = new Set();
  }

  function answerQuestion(button) {
    var passage = passages.find(function (item) { return item.id === activeId; });
    var questionIndex = Number(button.getAttribute("data-question"));
    var optionIndex = Number(button.getAttribute("data-option"));
    var question = passage.questions[questionIndex];
    var card = button.closest(".question");
    card.querySelectorAll(".option").forEach(function (option) { option.classList.remove("correct", "wrong"); });
    if (optionIndex === question.answer) {
      button.classList.add("correct");
      card.querySelector(".feedback").textContent = "正确。" + question.evidence;
      correctAnswers.add(activeId + "-" + questionIndex);
    } else {
      button.classList.add("wrong");
      card.querySelectorAll(".option")[question.answer].classList.add("correct");
      card.querySelector(".feedback").textContent = "再回到原文核对。" + question.evidence;
    }
    if (correctAnswers.size >= passage.questions.length) NL.markModule("reading", true, { passage: passage.id, correct: correctAnswers.size });
  }

  function init() {
    if (!document.getElementById("readingBody")) return;
    renderTabs();
    renderPassage();
    document.getElementById("readingTabs").addEventListener("click", function (event) {
      var button = event.target.closest("[data-passage]");
      if (!button) return;
      activeId = button.getAttribute("data-passage");
      renderTabs();
      renderPassage();
    });
    document.getElementById("questionSet").addEventListener("click", function (event) {
      var button = event.target.closest("[data-option]");
      if (button) answerQuestion(button);
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
