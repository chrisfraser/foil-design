/* ===========================================================================
   Dive-depth visualiser (Lesson 3).  Pairs with .ds-* styles in style.css.

   Shows a depressor towed behind a boat as a FORCE BALANCE:
     • the foil makes downforce L (down) and drag D (back),
     • the towline must pull equal-and-opposite, so it trails up-and-forward
       at the angle whose tangent is L/D:   tan θ = L / D,
     • the equilibrium depth is then        depth = lineOut · sin θ.

   The big teaching point: speed does NOT appear. L and D both scale with
   ½ρv², so v² cancels in L/D — faster trolling barely changes depth, it just
   raises tow load. Depth is set by L/D and line length.

   A "real-world factor" η scales the ideal depth down to mimic the depth lost
   to line drag and foil weight (a fudge factor you calibrate by testing).

   Usage:
     <div id="depth1" class="depth-sim"></div>
     <script src="../assets/depth-sim.js"></script>
     <script>mountDepthSim("depth1", { ld: 4, line: 30, eta: 1.0 });</script>
   =========================================================================== */
(function () {
  function num(x, d) {
    return x.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function row(parent, label, min, max, step, val, fmt) {
    var wrap = document.createElement("div"); wrap.className = "ds-row";
    var lab = document.createElement("label"); lab.className = "ds-label";
    var name = document.createElement("span"); name.textContent = label;
    var out = document.createElement("b"); out.className = "ds-val";
    lab.appendChild(name); lab.appendChild(out);
    var inp = document.createElement("input");
    inp.type = "range"; inp.min = min; inp.max = max; inp.step = step; inp.value = val;
    inp.className = "ds-slider";
    wrap.appendChild(lab); wrap.appendChild(inp);
    parent.appendChild(wrap);
    inp._out = out; inp._fmt = fmt;
    return inp;
  }
  function card(title, big, sub, cls) {
    return "<div class='ds-card " + (cls || "") + "'>" +
      "<div class='ds-card-t'>" + title + "</div>" +
      "<div class='ds-card-v'>" + big + "</div>" +
      "<div class='ds-card-s'>" + sub + "</div></div>";
  }

  // --- the scale diagram, returned as an <svg> string -----------------------
  function buildSVG(ld, lineM, eta) {
    var W = 640, H = 380;
    var surfaceY = 50, boatX = 600;
    var marginL = 64, marginB = 44;            // room for the depth axis / seabed label

    var theta = Math.atan(ld);                 // line angle above horizontal, radians
    var horizM = lineM * Math.cos(theta);
    var depthIdealM = lineM * Math.sin(theta);
    var depthRealM  = depthIdealM * eta;

    // auto-fit metres -> px so the whole triangle always fills the frame
    var availW = boatX - marginL - 10;
    var availH = H - surfaceY - marginB;
    var scale = Math.min(availW / Math.max(horizM, 0.001), availH / Math.max(depthIdealM, 0.001));

    var depX = boatX - horizM * scale;
    var idealY = surfaceY + depthIdealM * scale;
    var realY  = surfaceY + depthRealM  * scale;

    var s = "";
    s += "<svg viewBox='0 0 " + W + " " + H + "' role='img' aria-label='Depressor towed behind a boat, line trailing at the lift/drag angle'>";
    s += "<defs>" +
         "<marker id='dsArrL' markerWidth='9' markerHeight='9' refX='2' refY='4.5' orient='auto'>" +
           "<path d='M0,0 L9,4.5 L0,9 z' fill='var(--good)'/></marker>" +
         "<marker id='dsArrD' markerWidth='9' markerHeight='9' refX='2' refY='4.5' orient='auto'>" +
           "<path d='M0,0 L9,4.5 L0,9 z' fill='var(--accent-2)'/></marker>" +
         "<marker id='dsArrDim' markerWidth='8' markerHeight='8' refX='4' refY='4' orient='auto'>" +
           "<path d='M0,0 L8,4 L0,8 z' fill='var(--ink-soft)'/></marker>" +
         "<linearGradient id='dsWater' x1='0' y1='0' x2='0' y2='1'>" +
           "<stop offset='0' stop-color='#dff0f2'/><stop offset='1' stop-color='#bfe0e4'/></linearGradient>" +
         "</defs>";

    // water + surface + boat
    s += "<rect x='0' y='" + surfaceY + "' width='" + W + "' height='" + (H - surfaceY) + "' fill='url(#dsWater)'/>";
    s += "<line x1='0' y1='" + surfaceY + "' x2='" + W + "' y2='" + surfaceY + "' stroke='#7fb3bb' stroke-width='2'/>";
    s += "<text x='8' y='" + (surfaceY - 8) + "' class='ds-svg-t'>water surface</text>";
    // boat (hull + a nub) moving right
    var by = surfaceY;
    s += "<path d='M" + (boatX - 34) + "," + (by - 14) + " L" + (boatX + 16) + "," + (by - 14) +
         " L" + (boatX + 6) + "," + by + " L" + (boatX - 26) + "," + by + " z' fill='#5a5a52'/>";
    s += "<path d='M" + (boatX - 6) + "," + (by - 14) + " L" + (boatX - 6) + "," + (by - 30) +
         " L" + (boatX + 12) + "," + (by - 14) + " z' fill='#8a8a80'/>";
    s += "<text x='" + (boatX - 30) + "' y='" + (by - 22) + "' class='ds-svg-t'>3–10 kn →</text>";

    // line(s): ideal straight (dashed when it differs) + real (solid, bowed if losses)
    if (eta < 0.999) {
      s += "<line x1='" + boatX + "' y1='" + by + "' x2='" + depX + "' y2='" + idealY +
           "' stroke='#9aa' stroke-width='1.5' stroke-dasharray='5 4'/>";
      s += "<text x='" + (depX + 6) + "' y='" + (idealY + 4) + "' class='ds-svg-t ds-muted'>ideal</text>";
      // real line bows downstream (toward the boat side) under its own drag
      var cx = (boatX + depX) / 2 + 26, cy = (by + realY) / 2 + 22;
      s += "<path d='M" + boatX + "," + by + " Q" + cx + "," + cy + " " + depX + "," + realY +
           "' fill='none' stroke='var(--accent)' stroke-width='2.5'/>";
    } else {
      s += "<line x1='" + boatX + "' y1='" + by + "' x2='" + depX + "' y2='" + realY +
           "' stroke='var(--accent)' stroke-width='2.5'/>";
    }

    // angle arc + label at the depressor (between horizontal and the line)
    var arcR = 34;
    var ax = depX + arcR, ay = realY;
    var axE = depX + arcR * Math.cos(theta), ayE = realY - arcR * Math.sin(theta);
    s += "<path d='M" + ax + "," + ay + " A" + arcR + "," + arcR + " 0 0 0 " + axE + "," + ayE +
         "' fill='none' stroke='var(--ink-soft)' stroke-width='1.2'/>";
    s += "<line x1='" + depX + "' y1='" + realY + "' x2='" + (depX + arcR + 14) + "' y2='" + realY +
         "' stroke='var(--ink-soft)' stroke-width='1' stroke-dasharray='3 3'/>";
    s += "<text x='" + (depX + arcR + 6) + "' y='" + (realY - arcR * 0.35) + "' class='ds-svg-t'>θ = " +
         num(theta * 180 / Math.PI, 0) + "°</text>";

    // the depressor (a short plate tilted nose-down) + force arrows
    s += "<g transform='translate(" + depX + "," + realY + ")'>";
    s += "<rect x='-16' y='-4' width='32' height='8' rx='2' transform='rotate(-18)' fill='#1a1a17'/>";
    // downforce L (green, straight down) and drag D (rust, downstream = away from boat, i.e. left)
    s += "<line x1='0' y1='6' x2='0' y2='48' stroke='var(--good)' stroke-width='3' marker-end='url(#dsArrL)'/>";
    s += "<text x='6' y='44' class='ds-svg-t' fill='var(--good)'>L</text>";
    s += "<line x1='-6' y1='0' x2='-46' y2='0' stroke='var(--accent-2)' stroke-width='3' marker-end='url(#dsArrD)'/>";
    s += "<text x='-44' y='-6' class='ds-svg-t' fill='var(--accent-2)'>D</text>";
    s += "</g>";

    // depth dimension on the left
    var dimX = 30;
    s += "<line x1='" + dimX + "' y1='" + surfaceY + "' x2='" + dimX + "' y2='" + realY +
         "' stroke='var(--ink-soft)' stroke-width='1.2' marker-start='url(#dsArrDim)' marker-end='url(#dsArrDim)'/>";
    s += "<line x1='" + (dimX - 6) + "' y1='" + surfaceY + "' x2='" + (dimX + 6) + "' y2='" + surfaceY + "' stroke='var(--ink-soft)'/>";
    s += "<line x1='" + (dimX - 6) + "' y1='" + realY + "' x2='" + depX + "' y2='" + realY +
         "' stroke='var(--ink-soft)' stroke-width='1' stroke-dasharray='3 3'/>";
    s += "<text x='" + (dimX + 8) + "' y='" + ((surfaceY + realY) / 2) + "' class='ds-svg-t ds-depth'>" +
         num(depthRealM, 1) + " m</text>";

    s += "</svg>";
    return s;
  }

  function mountDepthSim(containerId, opts) {
    opts = opts || {};
    var root = document.getElementById(containerId);
    if (!root) return;
    root.classList.add("depth-sim");
    root.innerHTML = "";

    var fig = document.createElement("div"); fig.className = "ds-fig";
    root.appendChild(fig);

    var grid = document.createElement("div"); grid.className = "ds-grid";
    var sLD   = row(grid, "Foil efficiency L/D", 1, 8, 0.5, opts.ld || 4,
                    function (v) { return num(v, 1); });
    var sLine = row(grid, "Line let out", 5, 60, 1, opts.line || 30,
                    function (v) { return num(v, 0) + " m"; });
    var sEta  = row(grid, "Real-world factor (line drag + weight)", 0.4, 1.0, 0.05, opts.eta || 1.0,
                    function (v) { return num(v * 100, 0) + "%" + (v > 0.999 ? " (ideal)" : ""); });
    root.appendChild(grid);

    var out = document.createElement("div"); out.className = "ds-out";
    root.appendChild(out);
    var eq = document.createElement("div"); eq.className = "ds-eq";
    root.appendChild(eq);

    function compute() {
      var ld = parseFloat(sLD.value), lineM = parseFloat(sLine.value), eta = parseFloat(sEta.value);
      var theta = Math.atan(ld);
      var thetaDeg = theta * 180 / Math.PI;
      var depthIdeal = lineM * Math.sin(theta);
      var depthReal = depthIdeal * eta;

      [sLD, sLine, sEta].forEach(function (s) { s._out.textContent = s._fmt(parseFloat(s.value)); });

      fig.innerHTML = buildSVG(ld, lineM, eta);

      out.innerHTML =
        card("Line angle θ", num(thetaDeg, 0) + "°", "trails at the L/D angle") +
        card("Depth (ideal)", num(depthIdeal, 1) + " <span class='ds-u'>m</span>", "line × sin θ", "muted") +
        card("Depth (realistic)", num(depthReal, 1) + " <span class='ds-u'>m</span>",
             eta > 0.999 ? "= ideal" : num(eta * 100, 0) + "% of ideal", "good") +
        card("Speed's effect", "none*", "*on depth — see note");

      eq.innerHTML =
        "<span class='ds-eq-title'>Depth, with your numbers</span>" +
        "θ = arctan(L/D) = arctan(" + num(ld, 1) + ") = " + num(thetaDeg, 0) + "°<br>" +
        "depth = line · sin θ = " + num(lineM, 0) + " · sin(" + num(thetaDeg, 0) + "°) = <b>" +
        num(depthIdeal, 1) + " m</b>" +
        (eta > 0.999 ? "" : " &nbsp;→ &nbsp;× " + num(eta, 2) + " = <b>" + num(depthReal, 1) + " m</b> in practice") +
        "<div class='ds-note'>Notice there is <b>no v</b> in here. L and D both grow with ½ρv², so speed " +
        "cancels in L/D — trolling faster barely changes depth, it just raises the tow load.</div>";
    }

    [sLD, sLine, sEta].forEach(function (s) { s.addEventListener("input", compute); });
    compute();
  }

  window.mountDepthSim = mountDepthSim;
})();
