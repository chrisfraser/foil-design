/* ============================================================================
   Hydrodynamic Foils course — shared widget behaviour
   Auto-wires any markup that follows the conventions below. Load with `defer`.
   Pairs with the .quiz / .calc styles in assets/styles.css.
   (Sibling to the Hydrophone course's widgets.js — same conventions.)
   ============================================================================ */
(function () {
  'use strict';

  /* ---- Quizzes ----------------------------------------------------------
     <div class="quiz" data-explain-right="..." data-explain-wrong="...">
       <div class="q-text">Question?</div>
       <div class="q-options">
         <button class="opt" data-correct>Right answer</button>
         <button class="opt">Distractor</button>
       </div>
       <div class="q-feedback"></div>
     </div>
     Per-option override: add data-feedback="..." to a button.
  ------------------------------------------------------------------------- */
  function wireQuiz(quiz) {
    var options = Array.prototype.slice.call(quiz.querySelectorAll('button.opt'));
    var feedback = quiz.querySelector('.q-feedback');
    var answered = false;

    options.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (answered) return;
        answered = true;
        var isRight = btn.hasAttribute('data-correct');

        options.forEach(function (o) {
          o.disabled = true;
          if (o.hasAttribute('data-correct')) o.classList.add('correct');
        });
        if (!isRight) btn.classList.add('wrong');

        if (feedback) {
          var msg = btn.getAttribute('data-feedback');
          if (!msg) {
            msg = isRight
              ? (quiz.getAttribute('data-explain-right') || 'Correct.')
              : (quiz.getAttribute('data-explain-wrong') || 'Not quite — see the highlighted answer.');
          }
          feedback.innerHTML = (isRight ? '✓ ' : '✗ ') + msg;
          feedback.classList.add('show', isRight ? 'right' : 'nope');
        }
      });
    });
  }

  /* ---- Range helper -----------------------------------------------------
     <input type="range" data-output="#myOutput" data-suffix=" kn">
     Mirrors the live value into the element matched by data-output.
     Lessons add their own 'input' listeners for the real computation.
  ------------------------------------------------------------------------- */
  function wireRange(input) {
    var sel = input.getAttribute('data-output');
    if (!sel) return;
    var out = document.querySelector(sel);
    if (!out) return;
    var suffix = input.getAttribute('data-suffix') || '';
    var sync = function () { out.textContent = input.value + suffix; };
    input.addEventListener('input', sync);
    sync();
  }

  /* ---- init -------------------------------------------------------------- */
  function init() {
    document.querySelectorAll('.quiz').forEach(wireQuiz);
    document.querySelectorAll('input[type=range][data-output]').forEach(wireRange);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Expose helpers for lesson-specific scripts that want them. */
  window.FoilWidgets = { wireQuiz: wireQuiz, wireRange: wireRange };
})();
