/* ===========================================================================
   On-water calibration tool (Lesson 14).  Pairs with .cs-* styles in styles.css.

   Closes the loop: compare the depth your model predicted (ℓ·sinθ from the
   foil's L/D, Lesson 3) with the depth you actually measured, and back out your
   real-world factor η = measured / ideal — the single number that captures all
   the line-drag and weight losses for YOUR rig. Then use η to plan the line
   needed to hit a target depth next time.

   Usage:
     <div id="calib14" class="cs-sim"></div>
     <script src="../assets/calib-calc.js"></script>
     <script>mountCalibCalc("calib14", { ld:5, line:30, measured:20, target:25 });</script>
   =========================================================================== */
(function () {
  function num(x, d) { return x.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function row(parent, label, min, max, step, val, fmt) {
    var wrap = document.createElement("div"); wrap.className = "cs-row";
    var lab = document.createElement("label"); lab.className = "cs-label";
    var nm = document.createElement("span"); nm.textContent = label;
    var out = document.createElement("b"); out.className = "cs-val";
    lab.appendChild(nm); lab.appendChild(out);
    var inp = document.createElement("input"); inp.type = "range";
    inp.min = min; inp.max = max; inp.step = step; inp.value = val; inp.className = "cs-slider";
    wrap.appendChild(lab); wrap.appendChild(inp); parent.appendChild(wrap);
    inp._out = out; inp._fmt = fmt; return inp;
  }
  function card(t, v, su, cls) { return "<div class='cs-card " + (cls || "") + "'><div class='cs-card-t'>" + t + "</div><div class='cs-card-v'>" + v + "</div><div class='cs-card-s'>" + su + "</div></div>"; }

  function mountCalibCalc(id, opts) {
    opts = opts || {};
    var root = document.getElementById(id);
    if (!root) return;
    root.classList.add("cs-sim"); root.innerHTML = "";

    var grid = document.createElement("div"); grid.className = "cs-grid";
    var sLD = row(grid, "Foil L/D (from your tools)", 1, 8, 0.5, opts.ld || 5, function (v) { return num(v, 1); });
    var sLine = row(grid, "Line you let out on the test", 5, 80, 1, opts.line || 30, function (v) { return num(v, 0) + " m"; });
    var sMeas = row(grid, "Depth you measured", 1, 60, 0.5, opts.measured || 20, function (v) { return num(v, 1) + " m"; });
    var sTgt = row(grid, "Target depth (next trip)", 3, 60, 1, opts.target || 25, function (v) { return num(v, 0) + " m"; });
    root.appendChild(grid);
    var out = document.createElement("div"); out.className = "cs-out"; root.appendChild(out);
    var verdict = document.createElement("div"); verdict.className = "cs-verdict"; root.appendChild(verdict);

    function compute() {
      var ld = parseFloat(sLD.value), lineM = parseFloat(sLine.value), meas = parseFloat(sMeas.value), tgt = parseFloat(sTgt.value);
      [sLD, sLine, sMeas, sTgt].forEach(function (x) { x._out.textContent = x._fmt(parseFloat(x.value)); });
      var theta = Math.atan(ld), sinT = Math.sin(theta);
      var ideal = lineM * sinT;
      var eta = meas / ideal;
      var etaClamped = Math.min(eta, 1.2);
      // line needed next time to hit target, using calibrated eta
      var lineNeeded = tgt / (Math.max(etaClamped, 0.05) * sinT);
      var cls = eta >= 0.8 ? "good" : (eta >= 0.6 ? "warn" : "bad");
      out.innerHTML =
        card("Ideal depth", num(ideal, 1) + " m", "ℓ · sin(arctan L/D)") +
        card("Your η", num(eta * 100, 0) + "%", "measured ÷ ideal", cls) +
        card("Lost to the line", num((1 - Math.min(eta, 1)) * 100, 0) + "%", "drag + weight", cls) +
        card("Line for " + num(tgt, 0) + " m", num(lineNeeded, 0) + " m", "using your η", "good");
      var t, vc;
      if (eta >= 0.8) { t = "✓ Clean rig — you keep most of the ideal depth. Thin line and a steep foil are paying off."; vc = "good"; }
      else if (eta >= 0.6) { t = "~ Typical. A good chunk goes to line drag. Thinner line, less scope, or a higher-L/D foil would deepen you."; vc = "warn"; }
      else { t = "✗ Lots lost to the line — likely thick/long warp bowing badly, or a heavy/buoyant foil. Address that before chasing foil tweaks."; vc = "bad"; }
      verdict.className = "cs-verdict " + vc;
      verdict.textContent = t + " Feed this η back into the Lesson 3 model and it will predict your real depth.";
    }
    [sLD, sLine, sMeas, sTgt].forEach(function (x) { x.addEventListener("input", compute); });
    compute();
  }
  window.mountCalibCalc = mountCalibCalc;
})();
