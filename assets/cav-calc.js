/* ===========================================================================
   Cavitation calculator (Lesson 12).  Pairs with .cs-* styles in styles.css.

   Cavitation = water boiling into vapour where the local pressure drops below
   its vapour pressure. The cavitation number compares the available pressure
   margin to the dynamic pressure:
        σ = (p_atm + ρ·g·d − p_v) / (½ ρ v²)
   The foil cavitates when its suction peak |C_p,min| exceeds σ. Counter-
   intuitive lessons: going DEEPER raises σ (safer); going FASTER lowers it
   (riskier); a hard-working (high-suction) foil cavitates sooner.

   Usage:
     <div id="cav12" class="cs-sim"></div>
     <script src="../assets/cav-calc.js"></script>
     <script>mountCavCalc("cav12", { speed:8, depth:10, cpmin:2.0, salt:true });</script>
   =========================================================================== */
(function () {
  var PA = 101325, PV = 2339, G = 9.80665, KN = 0.514444;
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

  function mountCavCalc(id, opts) {
    opts = opts || {};
    var root = document.getElementById(id);
    if (!root) return;
    root.classList.add("cs-sim"); root.innerHTML = "";

    var grid = document.createElement("div"); grid.className = "cs-grid";
    var sV = row(grid, "Speed", 1, 15, 0.5, opts.speed || 8, function (v) { return num(v, 1) + " kn"; });
    var sD = row(grid, "Depth", 0, 50, 1, opts.depth != null ? opts.depth : 10, function (v) { return num(v, 0) + " m"; });
    var sCp = row(grid, "Suction peak |C_p,min| (how hard the foil works)", 0.5, 5, 0.1, opts.cpmin || 2.0, function (v) { return num(v, 1); });
    root.appendChild(grid);

    var salt = opts.salt !== false;
    var btn = document.createElement("button"); btn.type = "button"; btn.className = "cs-toggle"; root.appendChild(btn);
    var fig = document.createElement("div"); fig.className = "cs-fig"; root.appendChild(fig);
    var out = document.createElement("div"); out.className = "cs-out"; root.appendChild(out);
    var verdict = document.createElement("div"); verdict.className = "cs-verdict"; root.appendChild(verdict);

    function gauge(sigma, cpmin) {
      var W = 640, H = 84, mx = 20, by = 30, bh = 22, bw = W - 2 * mx;
      var max = Math.max(6, sigma * 1.2, cpmin * 1.6);
      function px(v) { return mx + Math.max(0, Math.min(1, v / max)) * bw; }
      var s = "<svg viewBox='0 0 " + W + " " + H + "' role='img' aria-label='Cavitation number versus the foil suction demand'>";
      // danger zone 0..cpmin
      s += "<rect x='" + mx + "' y='" + by + "' width='" + (px(cpmin) - mx) + "' height='" + bh + "' fill='#fdf0ec' stroke='#f0cfc4'/>";
      s += "<rect x='" + px(cpmin) + "' y='" + by + "' width='" + (mx + bw - px(cpmin)) + "' height='" + bh + "' fill='#eef7ef' stroke='#cfe6d3'/>";
      // threshold
      s += "<line x1='" + px(cpmin) + "' y1='" + (by - 6) + "' x2='" + px(cpmin) + "' y2='" + (by + bh + 6) + "' stroke='#c1492b' stroke-width='2'/>";
      s += "<text x='" + px(cpmin) + "' y='" + (by - 10) + "' text-anchor='middle' class='cs-svg-t' fill='#c1492b'>cavitation threshold (|C_p,min| = " + num(cpmin, 1) + ")</text>";
      // sigma marker
      s += "<polygon points='" + num(px(sigma), 1) + "," + (by + bh + 4) + " " + num(px(sigma) - 6, 1) + "," + (by + bh + 16) + " " + num(px(sigma) + 6, 1) + "," + (by + bh + 16) + "' fill='#052435'/>";
      s += "<text x='" + num(px(sigma), 1) + "' y='" + (by + bh + 30) + "' text-anchor='middle' class='cs-svg-t'>σ = " + num(sigma, 1) + "</text>";
      s += "</svg>";
      return s;
    }

    function compute() {
      var rho = salt ? 1025 : 1000;
      var v = parseFloat(sV.value) * KN, d = parseFloat(sD.value), cpmin = parseFloat(sCp.value);
      [sV, sD, sCp].forEach(function (x) { x._out.textContent = x._fmt(parseFloat(x.value)); });
      btn.textContent = salt ? "Seawater · ρ = 1025 kg/m³ ⇄" : "Fresh water · ρ = 1000 kg/m³ ⇄";
      var pamb = PA + rho * G * d, q = 0.5 * rho * v * v;
      var sigma = (pamb - PV) / q;
      var ratio = sigma / cpmin;
      fig.innerHTML = gauge(sigma, cpmin);
      var cls = ratio >= 1.3 ? "good" : (ratio >= 1.0 ? "warn" : "bad");
      out.innerHTML =
        card("Cavitation number σ", num(sigma, 1), "(p_amb − p_v) / ½ρv²", cls) +
        card("Ambient pressure", num(pamb / 1000, 0) + " kPa", "atmospheric + depth") +
        card("Dynamic pressure q", num(q / 1000, 1) + " kPa", "½ρv² — rises with v²") +
        card("Margin σ / |C_p,min|", num(ratio, 2) + "×", ratio >= 1 ? "above threshold" : "below — cavitating", cls);
      var t, vc;
      if (ratio >= 1.3) { t = "✓ Comfortable margin — no cavitation expected. (Try dropping depth or raising speed to see it bite.)"; vc = "good"; }
      else if (ratio >= 1.0) { t = "~ Marginal — you're close to inception. Small surface nicks or a higher-loaded spot may cavitate."; vc = "warn"; }
      else { t = "✗ Cavitating: the suction peak exceeds the available pressure. Expect lift loss, vibration and surface erosion. Slow down, run deeper, or unload the foil."; vc = "bad"; }
      verdict.className = "cs-verdict " + vc; verdict.textContent = t;
    }
    [sV, sD, sCp].forEach(function (x) { x.addEventListener("input", compute); });
    btn.addEventListener("click", function () { salt = !salt; compute(); });
    compute();
  }
  window.mountCavCalc = mountCavCalc;
})();
