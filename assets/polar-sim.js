/* ===========================================================================
   Polar explorer (Lessons 4, 5, 9).  Pairs with .ps-* styles in styles.css.

   One plot, three views, three foil sections. Teaches:
     • C_L rises ~linearly with angle of attack α, then collapses at STALL
     • the drag polar (C_L vs C_D) and the low-drag "bucket"
     • L/D and the fact that PEAK efficiency sits well before C_L,max
       (shown by the tangent-from-origin to the polar = max L/D)

   The coefficient models are simple analytic fits — qualitatively right for a
   moderate Reynolds number (~few×10^5), NOT a substitute for a real polar.
   Flat plate stalls early and low; NACA 0012 is symmetric; NACA 4412 is
   cambered (makes lift at α = 0, stalls later, higher C_L,max).

   Usage:
     <div id="polar1" class="polar-sim"></div>
     <script src="../assets/polar-sim.js"></script>
     <script>mountPolarSim("polar1", { section:"naca4412", view:"cl-alpha", alpha:6, compare:true });</script>
   =========================================================================== */
(function () {
  var SECTIONS = {
    flat:     { name: "Flat plate", color: "#c9a14a", a: 0.090, a0: 0,  clmax: 0.85, astall: 9,  cd0: 0.022, k: 0.045, clmd: 0 },
    naca0012: { name: "NACA 0012", color: "#2a9db0", a: 0.105, a0: 0,  clmax: 1.35, astall: 14, cd0: 0.0075, k: 0.022, clmd: 0 },
    naca4412: { name: "NACA 4412", color: "#3f7d4e", a: 0.105, a0: -4, clmax: 1.55, astall: 15, cd0: 0.0090, k: 0.020, clmd: 0.45 }
  };
  var VIEWS = [
    { id: "cl-alpha", label: "C_L vs α" },
    { id: "polar",    label: "Polar (C_L–C_D)" },
    { id: "ld-alpha", label: "L/D vs α" }
  ];

  function cl(s, al) {
    var lin = s.a * (al - s.a0);
    var sat = s.clmax * Math.tanh(lin / s.clmax);
    if (al <= s.astall) return sat;
    var atStall = s.clmax * Math.tanh(s.a * (s.astall - s.a0) / s.clmax);
    return atStall - 0.075 * (al - s.astall);
  }
  function cd(s, al) {
    var c = cl(s, al);
    var d = s.cd0 + s.k * (c - s.clmd) * (c - s.clmd);
    if (al > s.astall) d += 0.020 * (al - s.astall);
    return d;
  }
  function num(x, d) { return x.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }); }

  // find α of max L/D for a section (scan)
  function peakLD(s) {
    var best = { ld: 0, al: 0, cl: 0, cd: 1 };
    for (var al = 0; al <= s.astall; al += 0.25) {
      var c = cl(s, al), d = cd(s, al), ld = c / d;
      if (ld > best.ld) best = { ld: ld, al: al, cl: c, cd: d };
    }
    return best;
  }

  function mountPolarSim(id, opts) {
    opts = opts || {};
    var root = document.getElementById(id);
    if (!root) return;
    root.classList.add("polar-sim");
    root.innerHTML = "";

    var state = {
      section: opts.section || "naca4412",
      view: opts.view || "cl-alpha",
      alpha: opts.alpha != null ? opts.alpha : 6,
      compare: opts.compare !== false
    };
    var shown = (opts.sections || ["flat", "naca0012", "naca4412"]);

    // ---- control rows -----------------------------------------------------
    var fig = document.createElement("div"); fig.className = "ps-fig"; root.appendChild(fig);

    var ctr = document.createElement("div"); ctr.className = "ps-controls";
    // view toggle
    var viewWrap = document.createElement("div"); viewWrap.className = "ps-seg";
    VIEWS.forEach(function (v) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = v.label;
      b.dataset.view = v.id;
      b.addEventListener("click", function () { state.view = v.id; render(); });
      viewWrap.appendChild(b);
    });
    ctr.appendChild(viewWrap);
    // section select
    var secWrap = document.createElement("div"); secWrap.className = "ps-seg ps-sec";
    shown.forEach(function (key) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = SECTIONS[key].name;
      b.dataset.sec = key;
      b.addEventListener("click", function () { state.section = key; render(); });
      secWrap.appendChild(b);
    });
    ctr.appendChild(secWrap);
    root.appendChild(ctr);

    var ctr2 = document.createElement("div"); ctr2.className = "ps-controls2";
    var cmpLabel = document.createElement("label"); cmpLabel.className = "ps-cmp";
    var cmp = document.createElement("input"); cmp.type = "checkbox"; cmp.checked = state.compare;
    cmp.addEventListener("change", function () { state.compare = cmp.checked; render(); });
    cmpLabel.appendChild(cmp); cmpLabel.appendChild(document.createTextNode(" overlay the other sections"));
    ctr2.appendChild(cmpLabel);

    var slabel = document.createElement("label"); slabel.className = "ps-slabel";
    slabel.innerHTML = 'angle of attack α &nbsp;<b class="ps-aval"></b>';
    var slider = document.createElement("input"); slider.type = "range";
    slider.min = "-6"; slider.max = "20"; slider.step = "0.5"; slider.value = state.alpha;
    slider.className = "ps-slider";
    slider.addEventListener("input", function () { state.alpha = parseFloat(slider.value); render(); });
    slabel.appendChild(slider);
    ctr2.appendChild(slabel);
    root.appendChild(ctr2);

    var out = document.createElement("div"); out.className = "ps-out"; root.appendChild(out);

    // ---- plot geometry ----------------------------------------------------
    var W = 640, H = 360, ML = 54, MR = 16, MT = 16, MB = 42;
    var pW = W - ML - MR, pH = H - MT - MB;

    function domains() {
      if (state.view === "polar") return { xd: [0, 0.10], yd: [-0.6, 1.8], xl: "C_D (drag coefficient)", yl: "C_L" };
      if (state.view === "ld-alpha") {
        var mx = 0;
        Object.keys(SECTIONS).forEach(function (k) { mx = Math.max(mx, peakLD(SECTIONS[k]).ld); });
        return { xd: [-6, 20], yd: [0, Math.ceil(mx / 10) * 10 * 1.05], xl: "angle of attack α (°)", yl: "L/D" };
      }
      return { xd: [-6, 20], yd: [-0.6, 1.8], xl: "angle of attack α (°)", yl: "C_L" };
    }
    function X(v, d) { return ML + (v - d.xd[0]) / (d.xd[1] - d.xd[0]) * pW; }
    function Y(v, d) { return MT + (1 - (v - d.yd[0]) / (d.yd[1] - d.yd[0])) * pH; }

    // value of plotted point for a section at α, in current view
    function pt(s, al, d) {
      if (state.view === "polar") return [X(cd(s, al), d), Y(cl(s, al), d)];
      if (state.view === "ld-alpha") return [X(al, d), Y(cl(s, al) / cd(s, al), d)];
      return [X(al, d), Y(cl(s, al), d)];
    }
    function curve(s, d) {
      var pts = [];
      for (var al = -6; al <= 20.001; al += 0.5) {
        var p = pt(s, al, d);
        if (isFinite(p[0]) && isFinite(p[1])) pts.push(num(p[0], 1) + "," + num(p[1], 1));
      }
      return pts.join(" ");
    }

    function render() {
      // sync control active states
      viewWrap.querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", b.dataset.view === state.view); });
      secWrap.querySelectorAll("button").forEach(function (b) {
        b.classList.toggle("on", b.dataset.sec === state.section);
        b.style.setProperty("--chip", SECTIONS[b.dataset.sec].color);
      });
      root.querySelector(".ps-aval").textContent = num(state.alpha, 1) + "°";

      var d = domains();
      var s = SECTIONS[state.section];
      var stalled = state.alpha > s.astall;
      var pk = peakLD(s);
      var svg = "<svg viewBox='0 0 " + W + " " + H + "' role='img' aria-label='Foil polar plot'>";

      // gridlines + axes
      var xticks = state.view === "polar" ? [0, 0.02, 0.04, 0.06, 0.08, 0.10] : [-5, 0, 5, 10, 15, 20];
      var yA = d.yd[0], yB = d.yd[1];
      var ystep = (yB - yA) <= 2 ? 0.4 : (yB <= 40 ? 10 : 20);
      svg += "<rect x='" + ML + "' y='" + MT + "' width='" + pW + "' height='" + pH + "' fill='#fff' stroke='#ddd8c8'/>";
      for (var yv = Math.ceil(yA / ystep) * ystep; yv <= yB + 1e-6; yv += ystep) {
        var yp = Y(yv, d);
        svg += "<line x1='" + ML + "' y1='" + yp + "' x2='" + (W - MR) + "' y2='" + yp + "' stroke='#eee7d4'/>";
        svg += "<text x='" + (ML - 6) + "' y='" + (yp + 4) + "' text-anchor='end' class='ps-tick'>" + num(yv, (ystep < 1 ? 1 : 0)) + "</text>";
      }
      xticks.forEach(function (xv) {
        var xp = X(xv, d);
        svg += "<line x1='" + xp + "' y1='" + MT + "' x2='" + xp + "' y2='" + (H - MB) + "' stroke='#eee7d4'/>";
        svg += "<text x='" + xp + "' y='" + (H - MB + 16) + "' text-anchor='middle' class='ps-tick'>" + (state.view === "polar" ? num(xv, 2) : xv) + "</text>";
      });
      // zero C_L line
      if (state.view !== "ld-alpha") svg += "<line x1='" + ML + "' y1='" + Y(0, d) + "' x2='" + (W - MR) + "' y2='" + Y(0, d) + "' stroke='#cdc7b5' stroke-dasharray='4 3'/>";
      svg += "<text x='" + (ML + pW / 2) + "' y='" + (H - 6) + "' text-anchor='middle' class='ps-axl'>" + d.xl + "</text>";
      svg += "<text transform='translate(14," + (MT + pH / 2) + ") rotate(-90)' text-anchor='middle' class='ps-axl'>" + d.yl + "</text>";

      // stall shading (alpha views)
      if (state.view !== "polar") {
        var xs = X(s.astall, d), xe = X(20, d);
        svg += "<rect x='" + xs + "' y='" + MT + "' width='" + (xe - xs) + "' height='" + pH + "' fill='#c1492b' opacity='0.07'/>";
        svg += "<line x1='" + xs + "' y1='" + MT + "' x2='" + xs + "' y2='" + (H - MB) + "' stroke='#c1492b' stroke-dasharray='4 3' opacity='.7'/>";
        svg += "<text x='" + (xs + 5) + "' y='" + (MT + 14) + "' class='ps-note' fill='#c1492b'>stall →</text>";
      }

      // ghost curves (compare)
      if (state.compare) {
        shown.forEach(function (key) {
          if (key === state.section) return;
          svg += "<polyline points='" + curve(SECTIONS[key], d) + "' fill='none' stroke='" + SECTIONS[key].color + "' stroke-width='1.5' opacity='.32'/>";
        });
      }
      // active curve
      svg += "<polyline points='" + curve(s, d) + "' fill='none' stroke='" + s.color + "' stroke-width='2.6'/>";

      // max-L/D annotation
      if (state.view === "polar") {
        var mp = pt(s, pk.al, d);
        svg += "<line x1='" + X(0, d) + "' y1='" + Y(0, d) + "' x2='" + num(mp[0] + (mp[0] - X(0, d)) * 0.15, 1) + "' y2='" + num(mp[1] - (Y(0, d) - mp[1]) * 0.15, 1) + "' stroke='#0a3d5c' stroke-width='1.2' stroke-dasharray='5 4'/>";
        svg += "<circle cx='" + mp[0] + "' cy='" + mp[1] + "' r='4' fill='none' stroke='#0a3d5c' stroke-width='1.5'/>";
        svg += "<text x='" + (mp[0] + 8) + "' y='" + (mp[1] - 6) + "' class='ps-note'>max L/D ≈ " + num(pk.ld, 0) + "</text>";
      } else if (state.view === "ld-alpha") {
        var lp = pt(s, pk.al, d);
        svg += "<line x1='" + lp[0] + "' y1='" + lp[1] + "' x2='" + lp[0] + "' y2='" + (H - MB) + "' stroke='#3f7d4e' stroke-dasharray='4 3'/>";
        svg += "<circle cx='" + lp[0] + "' cy='" + lp[1] + "' r='4' fill='#3f7d4e'/>";
        svg += "<text x='" + (lp[0] + 6) + "' y='" + (lp[1] - 6) + "' class='ps-note' fill='#3f7d4e'>peak L/D (α=" + num(pk.al, 0) + "°)</text>";
      }

      // operating-point marker on active curve
      var mk = pt(s, state.alpha, d);
      if (isFinite(mk[0]) && isFinite(mk[1])) {
        svg += "<circle cx='" + mk[0] + "' cy='" + mk[1] + "' r='6.5' fill='" + (stalled ? "#c1492b" : s.color) + "' stroke='#fff' stroke-width='1.5'/>";
      }
      svg += "</svg>";
      fig.innerHTML = svg;

      // readout cards
      var c = cl(s, state.alpha), dd = cd(s, state.alpha), ld = c / dd;
      var ldCls = stalled ? "bad" : (ld >= pk.ld * 0.92 ? "good" : "");
      out.innerHTML =
        card("Section", s.name, stalled ? "stalled" : "attached", stalled ? "bad" : "") +
        card("C_L", num(c, 2), "lift coefficient") +
        card("C_D", num(dd, 3), "drag coefficient") +
        card("L/D", num(ld, 0), stalled ? "collapsed" : (ld >= pk.ld * 0.92 ? "near peak " + num(pk.ld, 0) : "peak is " + num(pk.ld, 0)), ldCls);
    }
    function card(t, v, s, cls) {
      return "<div class='ps-card " + (cls || "") + "'><div class='ps-card-t'>" + t + "</div><div class='ps-card-v'>" + v + "</div><div class='ps-card-s'>" + s + "</div></div>";
    }

    render();
  }

  window.mountPolarSim = mountPolarSim;
})();
