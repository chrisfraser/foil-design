/* ===========================================================================
   Depressor sizing capstone (Lesson 13).  Pairs with .cs-* styles in styles.css.

   Pulls the whole course into one panel: the lift equation (L2), drag & L/D
   (L2/L4), and the dive-depth force balance (L3). Set your speed, foil area,
   section coefficients, line out and real-world factor, and read out downforce,
   tow load, the trail angle and the depth you'll actually run.

   Usage:
     <div id="sizing13" class="cs-sim"></div>
     <script src="../assets/sizing-sim.js"></script>
     <script>mountSizingSim("sizing13", { speed:5, area:200, cl:0.9, cd:0.13, line:30, eta:0.7, salt:true });</script>
   =========================================================================== */
(function () {
  var KN = 0.514444, G = 9.80665;
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

  function mountSizingSim(id, opts) {
    opts = opts || {};
    var root = document.getElementById(id);
    if (!root) return;
    root.classList.add("cs-sim"); root.innerHTML = "";

    var fig = document.createElement("div"); fig.className = "cs-fig"; root.appendChild(fig);
    var grid = document.createElement("div"); grid.className = "cs-grid";
    var sV = row(grid, "Trolling speed", 1, 12, 0.5, opts.speed || 5, function (v) { return num(v, 1) + " kn"; });
    var sA = row(grid, "Foil area", 50, 1200, 10, opts.area || 200, function (v) { return num(v, 0) + " cm²"; });
    var sCl = row(grid, "Lift coeff. C_L", 0.2, 1.4, 0.05, opts.cl || 0.9, function (v) { return num(v, 2); });
    var sCd = row(grid, "Drag coeff. C_D", 0.02, 0.45, 0.01, opts.cd || 0.13, function (v) { return num(v, 2); });
    var sLine = row(grid, "Line let out", 5, 80, 1, opts.line || 30, function (v) { return num(v, 0) + " m"; });
    var sEta = row(grid, "Real-world factor η", 0.4, 1.0, 0.05, opts.eta || 0.7, function (v) { return num(v * 100, 0) + "%"; });
    root.appendChild(grid);

    var salt = opts.salt !== false;
    var btn = document.createElement("button"); btn.type = "button"; btn.className = "cs-toggle"; root.appendChild(btn);
    var out = document.createElement("div"); out.className = "cs-out"; root.appendChild(out);

    function schematic(theta, lineM, depthReal) {
      var W = 640, H = 200, surfaceY = 30, boatX = 600, mL = 56, mB = 24;
      var horizM = lineM * Math.cos(theta), depthM = lineM * Math.sin(theta);
      var availW = boatX - mL - 8, availH = H - surfaceY - mB;
      var sc = Math.min(availW / Math.max(horizM, 0.01), availH / Math.max(depthM, 0.01));
      var depX = boatX - horizM * sc, depY = surfaceY + depthReal / Math.max(depthM, 0.001) * (depthM * sc);
      var s = "<svg viewBox='0 0 " + W + " " + H + "' role='img' aria-label='Depressor towed at the trail angle'>";
      s += "<rect x='0' y='" + surfaceY + "' width='" + W + "' height='" + (H - surfaceY) + "' fill='#eef9fb'/>";
      s += "<line x1='0' y1='" + surfaceY + "' x2='" + W + "' y2='" + surfaceY + "' stroke='#7fb3bb' stroke-width='2'/>";
      s += "<path d='M" + (boatX - 30) + "," + (surfaceY - 12) + " L" + (boatX + 14) + "," + (surfaceY - 12) + " L" + (boatX + 6) + "," + surfaceY + " L" + (boatX - 24) + "," + surfaceY + " z' fill='#44515b'/>";
      s += "<line x1='" + boatX + "' y1='" + surfaceY + "' x2='" + num(depX, 1) + "' y2='" + num(depY, 1) + "' stroke='#0b6b7a' stroke-width='2.5'/>";
      s += "<text x='" + ((boatX + depX) / 2) + "' y='" + ((surfaceY + depY) / 2 - 6) + "' class='cs-svg-t'>θ = " + num(theta * 180 / Math.PI, 0) + "°</text>";
      // depressor + force arrows
      s += "<g transform='translate(" + num(depX, 1) + "," + num(depY, 1) + ")'>";
      s += "<rect x='-15' y='-4' width='30' height='8' rx='2' transform='rotate(-16)' fill='#052435'/>";
      s += "<line x1='0' y1='6' x2='0' y2='40' stroke='#3f7d4e' stroke-width='3' marker-end='url(#szL)'/>";
      s += "<line x1='-6' y1='0' x2='-40' y2='0' stroke='#c1492b' stroke-width='3' marker-end='url(#szD)'/>";
      s += "</g>";
      // depth dim
      s += "<line x1='28' y1='" + surfaceY + "' x2='28' y2='" + num(depY, 1) + "' stroke='#44515b' stroke-width='1.2'/>";
      s += "<line x1='28' y1='" + num(depY, 1) + "' x2='" + num(depX, 1) + "' y2='" + num(depY, 1) + "' stroke='#44515b' stroke-width='1' stroke-dasharray='3 3'/>";
      s += "<text x='34' y='" + num((surfaceY + depY) / 2, 1) + "' class='cs-svg-t' fill='#0a3d5c' font-weight='700'>" + num(depthReal, 1) + " m</text>";
      s += "<defs><marker id='szL' markerWidth='9' markerHeight='9' refX='2' refY='4.5' orient='auto'><path d='M0,0 L9,4.5 L0,9 z' fill='#3f7d4e'/></marker>" +
           "<marker id='szD' markerWidth='9' markerHeight='9' refX='2' refY='4.5' orient='auto'><path d='M0,0 L9,4.5 L0,9 z' fill='#c1492b'/></marker></defs>";
      s += "</svg>";
      return s;
    }

    function compute() {
      var rho = salt ? 1025 : 1000;
      var v = parseFloat(sV.value) * KN, A = parseFloat(sA.value) / 10000;
      var cl = parseFloat(sCl.value), cd = parseFloat(sCd.value);
      var lineM = parseFloat(sLine.value), eta = parseFloat(sEta.value);
      [sV, sA, sCl, sCd, sLine, sEta].forEach(function (x) { x._out.textContent = x._fmt(parseFloat(x.value)); });
      btn.textContent = salt ? "Seawater · ρ = 1025 kg/m³ ⇄" : "Fresh water · ρ = 1000 kg/m³ ⇄";
      var q = 0.5 * rho * v * v, L = q * A * cl, D = q * A * cd, ld = L / D;
      var theta = Math.atan(ld), depthIdeal = lineM * Math.sin(theta), depthReal = depthIdeal * eta;
      var tow = Math.sqrt(L * L + D * D) / G;
      fig.innerHTML = schematic(theta, lineM, depthReal);
      out.innerHTML =
        card("Downforce", num(L / G, 1) + " kgf", "L = ½ρv²·A·C_L", "good") +
        card("Tow load", num(tow, 1) + " kgf", "what your gear holds") +
        card("L/D", num(ld, 1), "sets the trail angle") +
        card("Dive depth", num(depthReal, 1) + " m", "ℓ·sinθ × η (real)", "good");
    }
    [sV, sA, sCl, sCd, sLine, sEta].forEach(function (x) { x.addEventListener("input", compute); });
    btn.addEventListener("click", function () { salt = !salt; compute(); });
    compute();
  }
  window.mountSizingSim = mountSizingSim;
})();
