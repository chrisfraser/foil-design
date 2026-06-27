/* ===========================================================================
   Interactive lift/drag force calculator (reusable across lessons).
   Pairs with .fc-* styles in style.css.

   Live-computes the lift equation  L = ½·ρ·v²·A·C_L  (and drag, same form)
   for a foil in water, and shows the equation with the numbers substituted in.
   Built for the depressor mission: speed in KNOTS, area in cm², fresh/salt water.

   Usage:
     <div id="calc1" class="force-calc"></div>
     <script src="../assets/force-calc.js"></script>
     <script>mountForceCalc("calc1");</script>
   =========================================================================== */
(function () {
  var KN = 0.514444;   // 1 knot in m/s
  var G  = 9.80665;    // gravity, for N -> kgf

  function row(parent, label, min, max, step, val, fmt) {
    var wrap = document.createElement("div"); wrap.className = "fc-row";
    var lab = document.createElement("label"); lab.className = "fc-label";
    var name = document.createElement("span"); name.textContent = label;
    var out = document.createElement("b"); out.className = "fc-val";
    lab.appendChild(name); lab.appendChild(out);
    var inp = document.createElement("input");
    inp.type = "range"; inp.min = min; inp.max = max; inp.step = step; inp.value = val;
    inp.className = "fc-slider";
    wrap.appendChild(lab); wrap.appendChild(inp);
    parent.appendChild(wrap);
    inp._out = out; inp._fmt = fmt;
    return inp;
  }
  function num(x, d) {
    return x.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
  }

  function mountForceCalc(containerId, opts) {
    opts = opts || {};
    var root = document.getElementById(containerId);
    if (!root) return;
    root.classList.add("force-calc");
    root.innerHTML = "";

    var grid = document.createElement("div"); grid.className = "fc-grid";
    var sSpeed = row(grid, "Boat speed", 1, 12, 0.5, opts.speed || 5,    function (v) { return num(v,1) + " kn"; });
    var sArea  = row(grid, "Foil area",  50, 1200, 10, opts.area || 200, function (v) { return num(v,0) + " cm² (" + num(v/10000,3) + " m²)"; });
    var sCl    = row(grid, "Lift coeff. C_L", 0.2, 1.4, 0.05, opts.cl || 1.0, function (v) { return num(v,2); });
    var sCd    = row(grid, "Drag coeff. C_D", 0.02, 0.45, 0.01, opts.cd || 0.12, function (v) { return num(v,2); });
    root.appendChild(grid);

    var waterSalt = opts.salt !== false;
    var wbtn = document.createElement("button");
    wbtn.type = "button"; wbtn.className = "fc-water";
    root.appendChild(wbtn);

    var out = document.createElement("div"); out.className = "fc-out";
    root.appendChild(out);
    var eq = document.createElement("div"); eq.className = "fc-eq";
    root.appendChild(eq);

    function compute() {
      var rho = waterSalt ? 1025 : 1000;
      var v = parseFloat(sSpeed.value) * KN;
      var A = parseFloat(sArea.value) / 10000;       // cm² -> m²
      var cl = parseFloat(sCl.value), cd = parseFloat(sCd.value);
      var q = 0.5 * rho * v * v;                      // dynamic pressure, Pa
      var L = q * A * cl, D = q * A * cd;
      var ld = D > 0 ? L / D : 0;

      [sSpeed, sArea, sCl, sCd].forEach(function (s) { s._out.textContent = s._fmt(parseFloat(s.value)); });
      wbtn.textContent = waterSalt ? "Seawater · ρ = 1025 kg/m³ ⇄" : "Fresh water · ρ = 1000 kg/m³ ⇄";

      out.innerHTML =
        card("Dynamic pressure q", num(q, 0) + " <span class='fc-u'>Pa</span>", "½ρv² — the push of moving water") +
        card("Downforce (lift)", num(L, 0) + " <span class='fc-u'>N</span>", num(L / G, 1) + " kgf ↓", "good") +
        card("Tow load (drag)", num(D, 0) + " <span class='fc-u'>N</span>", num(D / G, 1) + " kgf →") +
        card("Efficiency L/D", num(ld, 1) + "", "downforce per unit drag");

      eq.innerHTML =
        "<span class='fc-eq-title'>Lift equation, with your numbers</span>" +
        "L = ½ · ρ · v² · A · C<sub>L</sub><br>" +
        "L = ½ · " + num(rho, 0) + " · " + num(v, 2) + "² · " + num(A, 3) + " · " + num(cl, 2) +
        " = <b>" + num(L, 0) + " N</b> (" + num(L / G, 1) + " kgf)" +
        "<div class='fc-note'>" + num(parseFloat(sSpeed.value), 1) +
        " kn = " + num(v, 2) + " m/s. Double the speed → 4× every force (the v² term).</div>";
    }
    function card(title, big, sub, cls) {
      return "<div class='fc-card " + (cls || "") + "'>" +
        "<div class='fc-card-t'>" + title + "</div>" +
        "<div class='fc-card-v'>" + big + "</div>" +
        "<div class='fc-card-s'>" + sub + "</div></div>";
    }

    [sSpeed, sArea, sCl, sCd].forEach(function (s) { s.addEventListener("input", compute); });
    wbtn.addEventListener("click", function () { waterSalt = !waterSalt; compute(); });
    compute();
  }

  window.mountForceCalc = mountForceCalc;
})();
