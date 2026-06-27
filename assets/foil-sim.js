/* ===========================================================================
   Interactive foil simulator (reusable across lessons).
   Pairs with .foil-sim styles in style.css.

   A draggable angle-of-attack widget: flow comes in from the left, the foil
   tilts with the slider, and lift (perpendicular to flow) + drag (along flow)
   vectors update live. Toggle between WING (lift up) and DEPRESSOR (lift down).
   Past the stall angle, lift collapses and the wake goes turbulent.

   The physics is a simple thin-airfoil model — qualitatively right (linear
   lift with angle, ~14 deg stall, induced+separation drag), NOT quantitative.
   Lesson 1 is pre-equation, so magnitudes are shown as relative bars/arrows.

   Usage:
     <div id="sim1" class="foil-sim"></div>
     <script src="../assets/foil-sim.js"></script>
     <script>mountFoilSim("sim1", { mode: "depressor", alpha: 6 });</script>
   =========================================================================== */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function mountFoilSim(containerId, opts) {
    opts = opts || {};
    var root = document.getElementById(containerId);
    if (!root) return;
    root.classList.add("foil-sim");
    root.innerHTML = "";

    var mode = opts.mode === "wing" ? "wing" : "depressor";

    var W = 600, H = 340, cx = 295, cy = 178, half = 78; // foil half-chord
    var STALL = 14, AMAX = 24;
    var slopePerDeg = 2 * Math.PI / 180;          // thin-airfoil lift slope
    var clMax = slopePerDeg * STALL;

    // ---- SVG canvas -------------------------------------------------------
    var svg = el("svg", {
      viewBox: "0 0 " + W + " " + H, role: "img",
      "aria-label": "Interactive foil. Change the angle of attack and flip between a wing and a depressor."
    });
    root.appendChild(svg);

    // ---- HTML controls ----------------------------------------------------
    var ctr = document.createElement("div"); ctr.className = "fs-controls";
    var lab = document.createElement("label");
    lab.className = "fs-slabel";
    lab.innerHTML = 'Angle of attack &nbsp;<b class="fs-aval"></b>';
    var slider = document.createElement("input");
    slider.type = "range"; slider.min = "0"; slider.max = "" + AMAX; slider.step = "1";
    slider.value = opts.alpha != null ? opts.alpha : 6;
    slider.className = "fs-slider";
    lab.appendChild(slider);
    var toggle = document.createElement("button");
    toggle.type = "button"; toggle.className = "fs-toggle";
    ctr.appendChild(lab); ctr.appendChild(toggle);
    root.appendChild(ctr);

    var read = document.createElement("div"); read.className = "fs-readout";
    root.appendChild(read);

    // ---- physics ----------------------------------------------------------
    function physics(a) {
      var cl, stalled = false;
      if (a <= STALL) { cl = slopePerDeg * a; }
      else { stalled = true; cl = clMax - (clMax - 0.85) * Math.min(1, (a - STALL) / 10); }
      var cd = 0.03 + 0.04 * cl * cl;
      if (stalled) cd += 0.05 * (a - STALL);
      return { cl: cl, cd: cd, stalled: stalled };
    }

    function rot(lx, ly, rad) { // rotate local point about pivot -> screen coords
      return [cx + lx * Math.cos(rad) - ly * Math.sin(rad),
              cy + lx * Math.sin(rad) + ly * Math.cos(rad)];
    }

    function clear() { while (svg.firstChild) svg.removeChild(svg.firstChild); }

    function draw() {
      var a = parseInt(slider.value, 10);
      var p = physics(a);
      var up = (mode === "wing");
      var rotDeg = up ? a : -a;          // wing: nose up; depressor: nose down
      var rad = rotDeg * Math.PI / 180;
      clear();

      // defs: arrowheads (right-pointing, orient=auto rotates to line)
      var defs = el("defs");
      defs.innerHTML =
        '<marker id="fs-aFlow" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="9" refX="10" refY="4.5" orient="auto"><path d="M0,0 L11,4.5 L0,9 Z" fill="#2b6cb0"/></marker>' +
        '<marker id="fs-aLift" markerUnits="userSpaceOnUse" markerWidth="13" markerHeight="10" refX="12" refY="5" orient="auto"><path d="M0,0 L13,5 L0,10 Z" fill="#2f7d4f"/></marker>' +
        '<marker id="fs-aDrag" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="9" refX="11" refY="4.5" orient="auto"><path d="M0,0 L12,4.5 L0,9 Z" fill="#6a6a60"/></marker>';
      svg.appendChild(defs);

      // ground/water tint
      svg.appendChild(el("rect", { x: 0, y: 0, width: W, height: H, fill: "#f3f8f9" }));

      // ---- flow streamlines (upstream always smooth) ----
      var ys = [-72, -36, 0, 36, 72];
      ys.forEach(function (dy) {
        var y = cy + dy;
        var up1 = el("line", { x1: 14, y1: y, x2: 168, y2: y, stroke: "#2b6cb0",
          "stroke-width": 2, "marker-end": "url(#fs-aFlow)", opacity: 0.85 });
        svg.appendChild(up1);
        if (!p.stalled) {
          svg.appendChild(el("line", { x1: 430, y1: y, x2: 586, y2: y, stroke: "#2b6cb0",
            "stroke-width": 2, "marker-end": "url(#fs-aFlow)", opacity: 0.85 }));
        } else {
          // turbulent wake
          var amp = 7 + Math.abs(dy) * 0.12 + (a - STALL) * 0.8;
          var d = "M 418 " + y, x = 418;
          for (var i = 0; i < 9; i++) { x += 19; d += " Q " + (x - 9) + " " + (y - amp) + " " + x + " " + y + " Q " + (x + 9 - 19) + " " + (y + amp) + " " + x + " " + y; }
          svg.appendChild(el("path", { d: d, fill: "none", stroke: "#c2622f", "stroke-width": 2, opacity: 0.7 }));
        }
      });
      svg.appendChild(el("text", { x: 16, y: cy - 86, fill: "#2b6cb0",
        "font-family": "ui-sans-serif,system-ui", "font-size": 12 })).textContent = "water flow →";

      // ---- flow reference line through pivot (dashed) ----
      svg.appendChild(el("line", { x1: cx - 120, y1: cy, x2: cx + 150, y2: cy,
        stroke: "#9aa", "stroke-width": 1, "stroke-dasharray": "5 5" }));

      // ---- foil + chord (rotated group) ----
      var g = el("g", { transform: "rotate(" + rotDeg + " " + cx + " " + cy + ")" });
      var cs = up ? 1 : -1; // camber bulge up for wing, down for depressor
      function P(x, y) { return (cx + x) + " " + (cy + cs * y); }
      var path = "M " + P(-half, 0) +
        " Q " + P(-46, -11) + " " + P(0, -9) +
        " Q " + P(48, -5) + " " + P(half, 0) +
        " Q " + P(46, 4) + " " + P(0, 6) +
        " Q " + P(-46, 8) + " " + P(-half, 0) + " Z";
      g.appendChild(el("path", { d: path, fill: "#1f6f78", opacity: 0.92 }));
      // chord line
      g.appendChild(el("line", { x1: cx - half, y1: cy, x2: cx + half, y2: cy,
        stroke: "#0e3b40", "stroke-width": 1, "stroke-dasharray": "2 3", opacity: 0.7 }));
      svg.appendChild(g);

      // ---- angle-of-attack arc at leading edge ----
      var LE = rot(-half, 0, rad);
      var r = 40;
      var s0 = [LE[0] + r, LE[1]];                                   // along flow (+x)
      var s1 = [LE[0] + r * Math.cos(rad), LE[1] + r * Math.sin(rad)]; // along chord
      if (a > 0) {
        var sweep = rotDeg >= 0 ? 1 : 0;
        svg.appendChild(el("path", { d: "M " + s0[0] + " " + s0[1] + " A " + r + " " + r + " 0 0 " + sweep + " " + s1[0] + " " + s1[1],
          fill: "none", stroke: "#0e3b40", "stroke-width": 1.5 }));
        var midR = (rad) / 2;
        svg.appendChild(el("text", { x: LE[0] + (r + 12) * Math.cos(midR), y: LE[1] + (r + 12) * Math.sin(midR) + 4,
          fill: "#0e3b40", "font-family": "ui-sans-serif,system-ui", "font-size": 13, "font-style": "italic" })).textContent = "α";
      }

      // ---- lift vector (perpendicular to flow = vertical) ----
      var liftLen = Math.max(0, p.cl) * 78;
      var ly = up ? cy - liftLen : cy + liftLen;
      if (liftLen > 4) {
        svg.appendChild(el("line", { x1: cx, y1: cy, x2: cx, y2: ly,
          stroke: "#2f7d4f", "stroke-width": 2.5, "marker-end": "url(#fs-aLift)" }));
        svg.appendChild(el("text", { x: cx + 12, y: up ? ly - 6 : ly + 18,
          fill: "#2f7d4f", "font-family": "ui-sans-serif,system-ui", "font-size": 13, "font-weight": 700 }))
          .textContent = "LIFT " + (up ? "↑" : "↓");
      }

      // ---- drag vector (along flow = downstream) ----
      var dragLen = p.cd * 300;
      svg.appendChild(el("line", { x1: cx, y1: cy, x2: cx + dragLen, y2: cy,
        stroke: "#6a6a60", "stroke-width": 2.5, "marker-end": "url(#fs-aDrag)" }));
      svg.appendChild(el("text", { x: cx + dragLen + 8, y: cy - 7,
        fill: "#6a6a60", "font-family": "ui-sans-serif,system-ui", "font-size": 12 })).textContent = "drag";

      // ---- stall badge ----
      if (p.stalled) {
        var badge = el("g", {});
        badge.appendChild(el("rect", { x: W - 168, y: 14, width: 154, height: 26, rx: 5, fill: "#b23b3b" }));
        badge.appendChild(el("text", { x: W - 91, y: 31, fill: "#fff", "text-anchor": "middle",
          "font-family": "ui-sans-serif,system-ui", "font-size": 12, "font-weight": 700 }));
        badge.lastChild.textContent = "STALLED — flow separated";
        svg.appendChild(badge);
      }

      // ---- update controls + readout ----
      document.querySelector("#" + containerId + " .fs-aval").textContent = a + "°";
      toggle.textContent = up ? "Flip to depressor ↓" : "Flip to wing ↑";

      var liftPct = Math.round(Math.max(0, p.cl) / clMax * 100);
      var dragPct = Math.round(Math.min(1, p.cd / 0.5) * 100);
      var dirSentence = up
        ? "<b>WING</b> — lift points <b style='color:#2f7d4f'>UP</b>"
        : "<b>DEPRESSOR</b> — lift points <b style='color:#2f7d4f'>DOWN</b> (it dives)";
      read.innerHTML =
        "<div class='fs-mode'>" + dirSentence +
          " &nbsp;·&nbsp; <span class='fs-pill " + (p.stalled ? "bad" : "ok") + "'>" +
          (p.stalled ? "stalled" : "attached") + "</span></div>" +
        "<div class='fs-bar'><span class='fs-key'>Lift</span><span class='fs-track'><i style='width:" + liftPct + "%;background:#2f7d4f'></i></span></div>" +
        "<div class='fs-bar'><span class='fs-key'>Drag</span><span class='fs-track'><i style='width:" + dragPct + "%;background:#6a6a60'></i></span></div>";
    }

    slider.addEventListener("input", draw);
    toggle.addEventListener("click", function () { mode = (mode === "wing") ? "depressor" : "wing"; draw(); });
    draw();
  }

  window.mountFoilSim = mountFoilSim;
})();
