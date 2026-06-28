/* ===========================================================================
   Reynolds-number calculator (Lesson 7).  Pairs with .rc-* styles in styles.css.

   Re = v · L / ν   (speed × chord ÷ kinematic viscosity of water)
   ν ≈ 1.0×10⁻⁶ m²/s at ~20 °C, ~1.3×10⁻⁶ at ~10 °C.

   Shows where your foil lands on a log Reynolds scale, what regime that is,
   and therefore which polar to trust. Our trolling depressors sit in the
   awkward low-Re band where textbook/high-Re polars over-predict performance.

   Usage:
     <div id="re1" class="re-calc"></div>
     <script src="../assets/re-calc.js"></script>
     <script>mountReCalc("re1", { speed:5, chord:100, cold:false });</script>
   =========================================================================== */
(function () {
  var KN = 0.514444;
  function num(x, d) { return x.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function sci(x) {
    var e = Math.floor(Math.log10(x)), m = x / Math.pow(10, e);
    var sup = String(e).replace(/-/g, "⁻").replace(/[0-9]/g, function (c) { return "⁰¹²³⁴⁵⁶⁷⁸⁹"[+c]; });
    return num(m, 1) + "×10" + sup;
  }
  function row(parent, label, min, max, step, val, fmt) {
    var wrap = document.createElement("div"); wrap.className = "rc-row";
    var lab = document.createElement("label"); lab.className = "rc-label";
    var nm = document.createElement("span"); nm.textContent = label;
    var out = document.createElement("b"); out.className = "rc-val";
    lab.appendChild(nm); lab.appendChild(out);
    var inp = document.createElement("input"); inp.type = "range";
    inp.min = min; inp.max = max; inp.step = step; inp.value = val; inp.className = "rc-slider";
    wrap.appendChild(lab); wrap.appendChild(inp); parent.appendChild(wrap);
    inp._out = out; inp._fmt = fmt; return inp;
  }

  var BANDS = [
    { hi: 1e5, name: "Very low Re", note: "laminar, fussy — sharp drag rise, low C_L,max", cls: "bad" },
    { hi: 5e5, name: "Low-Re foil regime", note: "where trolling depressors live — high-Re polars OVER-predict here", cls: "warn" },
    { hi: 2e6, name: "Moderate Re", note: "most published foil polars; reasonably well-behaved", cls: "good" },
    { hi: Infinity, name: "High Re", note: "big/fast hydrofoils & ships; textbook territory", cls: "good" }
  ];
  var MARKS = [
    { re: 1e5, label: "model glider" },
    { re: 5e5, label: "dinghy foil" },
    { re: 3e6, label: "keelboat" },
    { re: 2e7, label: "ship / airliner" }
  ];

  function mountReCalc(id, opts) {
    opts = opts || {};
    var root = document.getElementById(id);
    if (!root) return;
    root.classList.add("re-calc"); root.innerHTML = "";

    var grid = document.createElement("div"); grid.className = "rc-grid";
    var sV = row(grid, "Trolling speed", 1, 12, 0.5, opts.speed || 5, function (v) { return num(v, 1) + " kn"; });
    var sC = row(grid, "Foil chord", 20, 400, 5, opts.chord || 100, function (v) { return num(v, 0) + " mm"; });
    root.appendChild(grid);

    var cold = !!opts.cold;
    var tbtn = document.createElement("button"); tbtn.type = "button"; tbtn.className = "rc-temp";
    root.appendChild(tbtn);

    var fig = document.createElement("div"); fig.className = "rc-fig"; root.appendChild(fig);
    var out = document.createElement("div"); out.className = "rc-out"; root.appendChild(out);

    var LO = 4, HI = 7.5;  // log10 scale bounds (1e4 .. ~3e7)
    function xpct(re) { return Math.max(0, Math.min(100, (Math.log10(re) - LO) / (HI - LO) * 100)); }

    function buildSVG(re) {
      var W = 640, H = 96, mx = 24, bar = 18, by = 34;
      var bw = W - 2 * mx;
      var s = "<svg viewBox='0 0 " + W + " " + H + "' role='img' aria-label='Reynolds number on a logarithmic scale'>";
      s += "<defs><linearGradient id='rcG' x1='0' y1='0' x2='1' y2='0'>" +
           "<stop offset='0' stop-color='#c1492b'/><stop offset='.28' stop-color='#c9a14a'/>" +
           "<stop offset='.55' stop-color='#2a9db0'/><stop offset='1' stop-color='#0b6b7a'/></linearGradient></defs>";
      s += "<rect x='" + mx + "' y='" + by + "' width='" + bw + "' height='" + bar + "' rx='4' fill='url(#rcG)'/>";
      // decade ticks
      for (var e = 4; e <= 7; e++) {
        var xp = mx + xpct(Math.pow(10, e)) / 100 * bw;
        s += "<line x1='" + xp + "' y1='" + (by - 4) + "' x2='" + xp + "' y2='" + (by + bar + 4) + "' stroke='#9aa' stroke-width='1'/>";
        s += "<text x='" + xp + "' y='" + (by + bar + 18) + "' text-anchor='middle' class='rc-svg-t'>10" + "⁴⁵⁶⁷"[e - 4] + "</text>";
      }
      // reference marks
      MARKS.forEach(function (m) {
        var xp = mx + xpct(m.re) / 100 * bw;
        s += "<text x='" + xp + "' y='" + (by - 8) + "' text-anchor='middle' class='rc-svg-t ds-muted'>" + m.label + "</text>";
      });
      // you marker
      var yx = mx + xpct(re) / 100 * bw;
      s += "<polygon points='" + num(yx, 1) + "," + (by - 2) + " " + num(yx - 6, 1) + "," + (by - 14) + " " + num(yx + 6, 1) + "," + (by - 14) + "' fill='#052435'/>";
      s += "<line x1='" + num(yx, 1) + "' y1='" + by + "' x2='" + num(yx, 1) + "' y2='" + (by + bar) + "' stroke='#052435' stroke-width='2'/>";
      s += "</svg>";
      return s;
    }

    function bandFor(re) { for (var i = 0; i < BANDS.length; i++) if (re < BANDS[i].hi) return BANDS[i]; return BANDS[BANDS.length - 1]; }

    function compute() {
      var nu = cold ? 1.3e-6 : 1.0e-6;
      var v = parseFloat(sV.value) * KN, L = parseFloat(sC.value) / 1000;
      [sV, sC].forEach(function (x) { x._out.textContent = x._fmt(parseFloat(x.value)); });
      tbtn.textContent = cold ? "Water ≈ 10 °C · ν = 1.3×10⁻⁶ m²/s ⇄" : "Water ≈ 20 °C · ν = 1.0×10⁻⁶ m²/s ⇄";
      var re = v * L / nu;
      var band = bandFor(re);
      fig.innerHTML = buildSVG(re);
      out.innerHTML =
        card("Reynolds number", sci(re), "Re = v·L/ν", "good") +
        card("Regime", band.name, band.note, band.cls) +
        card("In SI", num(v, 2) + " m/s × " + num(L, 3) + " m", "÷ " + (cold ? "1.3" : "1.0") + "×10⁻⁶");
    }
    function card(t, v, s, cls) {
      return "<div class='rc-card " + (cls || "") + "'><div class='rc-card-t'>" + t + "</div><div class='rc-card-v'>" + v + "</div><div class='rc-card-s'>" + s + "</div></div>";
    }

    [sV, sC].forEach(function (x) { x.addEventListener("input", compute); });
    tbtn.addEventListener("click", function () { cold = !cold; compute(); });
    compute();
  }

  window.mountReCalc = mountReCalc;
})();
