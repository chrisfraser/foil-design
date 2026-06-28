/* ===========================================================================
   Aspect-ratio / induced-drag visualiser (Lesson 6).
   Pairs with .ar-* styles in styles.css.

   Teaches why short, stubby depressors (low aspect ratio) leak lift at the
   tips and pay a big INDUCED drag penalty:
        C_Di = C_L² / (π · AR · e)
   At fixed planform area, lowering AR makes the foil stubbier, fattens the tip
   vortices, and craters L/D. e (Oswald efficiency) ≈ 0.8 here; profile drag is
   a fixed stand-in. Qualitative, for intuition — real numbers come from CFD.

   Usage:
     <div id="ar1" class="ar-sim"></div>
     <script src="../assets/ar-sim.js"></script>
     <script>mountArSim("ar1", { ar: 3, cl: 0.8 });</script>
   =========================================================================== */
(function () {
  var S = 0.02;       // planform area, m² (our 200 cm² worked foil)
  var E = 0.8;        // Oswald efficiency factor
  var CD0 = 0.012;    // profile (section) drag — fixed stand-in
  function num(x, d) { return x.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }); }

  function row(parent, label, min, max, step, val, fmt) {
    var wrap = document.createElement("div"); wrap.className = "ar-row";
    var lab = document.createElement("label"); lab.className = "ar-label";
    var nm = document.createElement("span"); nm.textContent = label;
    var out = document.createElement("b"); out.className = "ar-val";
    lab.appendChild(nm); lab.appendChild(out);
    var inp = document.createElement("input"); inp.type = "range";
    inp.min = min; inp.max = max; inp.step = step; inp.value = val; inp.className = "ar-slider";
    wrap.appendChild(lab); wrap.appendChild(inp); parent.appendChild(wrap);
    inp._out = out; inp._fmt = fmt; return inp;
  }

  function mountArSim(id, opts) {
    opts = opts || {};
    var root = document.getElementById(id);
    if (!root) return;
    root.classList.add("ar-sim"); root.innerHTML = "";

    var fig = document.createElement("div"); fig.className = "ar-fig"; root.appendChild(fig);
    var grid = document.createElement("div"); grid.className = "ar-grid";
    var sAR = row(grid, "Aspect ratio AR", 1, 12, 0.5, opts.ar || 3, function (v) { return num(v, 1); });
    var sCL = row(grid, "Operating C_L", 0.2, 1.2, 0.05, opts.cl || 0.8, function (v) { return num(v, 2); });
    root.appendChild(grid);
    var out = document.createElement("div"); out.className = "ar-out"; root.appendChild(out);

    function buildSVG(AR, cdi, cd) {
      var W = 640, H = 220;
      var b = Math.sqrt(AR * S), c = S / b;   // span, chord (m)
      // scale planform into left box
      var bx = 24, by = 20, bw = 300, bh = 180;
      var sc = Math.min(bw / Math.max(b, 0.01), bh / Math.max(c, 0.01)) * 0.82;
      var pw = b * sc, ph = c * sc;
      var px = bx + (bw - pw) / 2, py = by + (bh - ph) / 2;
      var s = "<svg viewBox='0 0 " + W + " " + H + "' role='img' aria-label='Planform and drag split for the chosen aspect ratio'>";
      // planform box bg
      s += "<rect x='" + bx + "' y='" + by + "' width='" + bw + "' height='" + bh + "' fill='#f3fbfc' stroke='#ddd8c8' rx='6'/>";
      s += "<text x='" + (bx + 8) + "' y='" + (by + 16) + "' class='ar-svg-t'>planform (same area, " + num(b, 2) + " m span × " + num(c, 2) + " m chord)</text>";
      // the foil planform
      s += "<rect x='" + num(px, 1) + "' y='" + num(py, 1) + "' width='" + num(pw, 1) + "' height='" + num(ph, 1) + "' fill='#0b6b7a' opacity='.9' rx='3'/>";
      // tip vortices — size grows with induced drag
      var vr = 6 + cdi * 380;
      [px, px + pw].forEach(function (tx) {
        var cyv = py + ph / 2;
        s += "<circle cx='" + num(tx, 1) + "' cy='" + num(cyv, 1) + "' r='" + num(vr, 1) + "' fill='none' stroke='#c1492b' stroke-width='2' opacity='.75'/>";
        s += "<circle cx='" + num(tx, 1) + "' cy='" + num(cyv, 1) + "' r='" + num(vr * 0.55, 1) + "' fill='none' stroke='#c1492b' stroke-width='1.5' opacity='.5'/>";
      });
      s += "<text x='" + num(px + pw, 1) + "' y='" + num(py + ph / 2 + vr + 14, 1) + "' text-anchor='middle' class='ar-svg-t' fill='#c1492b'>tip vortex</text>";

      // drag split bar (right)
      var rx = 350, rw = 266, ry = 70, rh = 34;
      var prof = CD0 / cd, ind = cdi / cd;
      s += "<text x='" + rx + "' y='" + (ry - 12) + "' class='ar-svg-t'>where the drag goes</text>";
      s += "<rect x='" + rx + "' y='" + ry + "' width='" + num(rw * prof, 1) + "' height='" + rh + "' fill='#0b6b7a'/>";
      s += "<rect x='" + num(rx + rw * prof, 1) + "' y='" + ry + "' width='" + num(rw * ind, 1) + "' height='" + rh + "' fill='#c1492b'/>";
      s += "<text x='" + (rx + 4) + "' y='" + (ry + rh + 16) + "' class='ar-svg-t' fill='#0b6b7a'>profile " + num(prof * 100, 0) + "%</text>";
      s += "<text x='" + (rx + rw) + "' y='" + (ry + rh + 16) + "' text-anchor='end' class='ar-svg-t' fill='#c1492b'>induced " + num(ind * 100, 0) + "%</text>";
      s += "</svg>";
      return s;
    }

    function compute() {
      var AR = parseFloat(sAR.value), cl = parseFloat(sCL.value);
      [sAR, sCL].forEach(function (x) { x._out.textContent = x._fmt(parseFloat(x.value)); });
      var cdi = cl * cl / (Math.PI * AR * E);
      var cd = CD0 + cdi;
      var ld = cl / cd, ldInf = cl / CD0;
      fig.innerHTML = buildSVG(AR, cdi, cd);
      out.innerHTML =
        card("Induced drag C_Di", num(cdi, 4), "= C_L²/(π·AR·e)", cdi > CD0 ? "bad" : "") +
        card("Total C_D", num(cd, 4), num(cdi / cd * 100, 0) + "% is induced") +
        card("L/D (this AR)", num(ld, 1), "real, finite wing", "good") +
        card("L/D if AR→∞", num(ldInf, 1), "the ceiling you lose to tips");
    }
    function card(t, v, s, cls) {
      return "<div class='ar-card " + (cls || "") + "'><div class='ar-card-t'>" + t + "</div><div class='ar-card-v'>" + v + "</div><div class='ar-card-s'>" + s + "</div></div>";
    }

    [sAR, sCL].forEach(function (x) { x.addEventListener("input", compute); });
    compute();
  }

  window.mountArSim = mountArSim;
})();
