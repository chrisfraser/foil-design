/* ===========================================================================
   Reusable quiz widget for foil lessons.   Pairs with .quiz styles in style.css.

   Usage in a lesson:
     <div id="quiz1" class="quiz"></div>
     <script src="../assets/quiz.js"></script>
     <script>
       mountQuiz("quiz1", [
         {
           q: "Question text?",
           options: ["Answer one here", "Answer two here", "Answer three!"],
           answer: 1,                      // index of correct option
           explain: "Why that is right."   // shown after any choice
         },
       ]);
     </script>

   Design notes:
   - Immediate feedback on click (tight feedback loop — retrieval practice).
   - Options are presented in author order; keep them equal-length & clue-free
     (a teaching convention from the course, enforced by the author, not code).
   - Tracks a running score for the block.
   =========================================================================== */
(function () {
  function mountQuiz(containerId, questions) {
    var root = document.getElementById(containerId);
    if (!root) return;
    var answered = 0, correct = 0, total = questions.length;

    var scoreEl = document.createElement("div");
    scoreEl.className = "quiz-score";

    questions.forEach(function (item, qi) {
      var qEl = document.createElement("div");
      qEl.className = "q";

      var prompt = document.createElement("div");
      prompt.className = "q-prompt";
      prompt.textContent = (qi + 1) + ". " + item.q;
      qEl.appendChild(prompt);

      var fb = document.createElement("div");
      fb.className = "feedback";

      var buttons = [];
      item.options.forEach(function (opt, oi) {
        var b = document.createElement("button");
        b.className = "opt";
        b.type = "button";
        b.textContent = opt;
        b.addEventListener("click", function () {
          if (b.disabled) return;
          var isRight = oi === item.answer;
          buttons.forEach(function (bb, bi) {
            bb.disabled = true;
            if (bi === item.answer) bb.classList.add("correct");
          });
          if (!isRight) b.classList.add("incorrect");

          fb.classList.add("show", isRight ? "right" : "wrong");
          fb.textContent = (isRight ? "Correct. " : "Not quite. ") + (item.explain || "");

          answered++;
          if (isRight) correct++;
          render();
        });
        buttons.push(b);
        qEl.appendChild(b);
      });

      qEl.appendChild(fb);
      root.appendChild(qEl);
    });

    root.appendChild(scoreEl);

    function render() {
      scoreEl.textContent = "Score: " + correct + " / " + total +
        (answered === total ? "  —  done!" : "");
    }
    render();
  }

  window.mountQuiz = mountQuiz;
})();
