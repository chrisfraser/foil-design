/* ===========================================================================
   Mesh-independence / convergence visualiser (Lesson 11).
   Pairs with .cs-* styles in styles.css.

   Teaches that a CFD answer is only trustworthy once it has stopped changing
   as you refine the mesh — and that the first cell's y+ must be sane. Coarse
   meshes give confident, wrong numbers. The drag converges to a grid-
   independent value from above as cell count rises.

   Discretisation model: C_D(N) = C_D,∞ · (1 + a / level^p) — qualitative.

   Usage:
     <div id="mesh11" class="cs-sim"></div>
     <script src="../assets/mesh-sim.js"></script>
     <script>mountMeshSim("mesh11", { level: 3 });</script>
   =========================================================================== */
(function () {
  var CD_INF = 0.0095;        // grid-independent ("converged") drag coefficient
  function num(x, d) { return x.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function cells(level) { return Math.round(4000 * Math.pow(2, level - 1)); }
  function fmtCells(n) { return n >= 1e6 ? num(n / 1e6, 2) + "M" : num(n / 1e3, 0) + "k"; }
  function cd(level) { return CD_INF * (1 + 0.55 / Math.pow(level, 1.6)); }
  function yplus(level) { return 60 / Math.pow(2, (level - 1) * 0.72); }

  function mountMeshSim(id, opts) {
    opts = opts || {};
    var root = document.getElementById(id);
    if (!root) return;
    root.classList.add("cs-sim"); root.innerHTML = "";

    var fig = document.createElement("div"); fig.className = "cs-fig"; root.appendChild(fig);
    var grid = document.createElement("div"); grid.className = "cs-grid";
    var wrap = document.createElement("div"); wrap.className = "cs-row";
    var lab = document.createElement("label"); lab.className = "cs-label";
    lab.innerHTML = "<span>Mesh refinement</span><b class='cs-val'></b>";
    var sl = document.createElement("input"); sl.type = "range"; sl.min = "1"; sl.max = "10"; sl.step = "1";
    sl.value = opts.level || 3; sl.className = "cs-slider";
    wrap.appendChild(lab); wrap.appendChild(sl); grid.appendChild(wrap);
    root.appendChild(grid);
    var out = document.createElement("div"); out.className = "cs-out"; root.appendChild(out);
    var verdict = document.createElement("div"); verdict.className = "cs-verdict"; root.appendChild(verdict);

    var W = 640, H = 240, ML = 60, MR = 18, MT = 14, MB = 36, pW = W - ML - MR, pH = H - MT - MB;
    var xd = [Math.log10(cells(1)) - 0.15, Math.log10(cells(10)) + 0.15];
    var yd = [CD_INF * 0.96, cd(1) * 1.04];
    function X(v) { return ML + (v - xd[0]) / (xd[1] - xd[0]) * pW; }
    function Y(v) { return MT + (1 - (v - yd[0]) / (yd[1] - yd[0])) * pH; }

    function svg(level) {
      var s = "<svg viewBox='0 0 " + W + " " + H + "' role='img' aria-label='Drag coefficient converging as the mesh is refined'>";
      s += "<rect x='" + ML + "' y='" + MT + "' width='" + pW + "' height='" + pH + "' fill='#fff' stroke='#ddd8c8'/>";
      // converged asymptote
      s += "<line x1='" + ML + "' y1='" + Y(CD_INF) + "' x2='" + (W - MR) + "' y2='" + Y(CD_INF) + "' stroke='#3f7d4e' stroke-dasharray='5 4'/>";
      s += "<text x='" + (W - MR - 4) + "' y='" + (Y(CD_INF) - 6) + "' text-anchor='end' class='cs-svg-t' fill='#3f7d4e'>grid-independent C_D ≈ " + num(CD_INF, 4) + "</text>";
      // y ticks
      for (var i = 0; i <= 4; i++) { var yv = yd[0] + (yd[1] - yd[0]) * i / 4; var yp = Y(yv); s += "<text x='" + (ML - 6) + "' y='" + (yp + 4) + "' text-anchor='end' class='cs-svg-t'>" + num(yv, 4) + "</text>"; }
      // x ticks (decades of cells)
      for (var e = 4; e <= 6; e++) { var xp = X(e); s += "<line x1='" + xp + "' y1='" + MT + "' x2='" + xp + "' y2='" + (H - MB) + "' stroke='#eee7d4'/>"; s += "<text x='" + xp + "' y='" + (H - MB + 16) + "' text-anchor='middle' class='cs-svg-t'>10" + "⁴⁵⁶"[e - 4] + " cells</text>"; }
      // curve
      var pts = [];
      for (var L = 1; L <= 10; L++) pts.push(num(X(Math.log10(cells(L))), 1) + "," + num(Y(cd(L)), 1));
      s += "<polyline points='" + pts.join(" ") + "' fill='none' stroke='#0b6b7a' stroke-width='2.4'/>";
      // current marker
      var mx = X(Math.log10(cells(level))), my = Y(cd(level));
      var stalledColor = (Math.abs(cd(level) - CD_INF) / CD_INF > 0.05) ? "#c1492b" : "#3f7d4e";
      s += "<circle cx='" + num(mx, 1) + "' cy='" + num(my, 1) + "' r='6' fill='" + stalledColor + "' stroke='#fff' stroke-width='1.5'/>";
      s += "<text x='" + (ML + 6) + "' y='" + (MT + 16) + "' class='cs-svg-t'>C_D vs cell count — refine until the curve goes flat</text>";
      s += "</svg>";
      return s;
    }
    function card(t, v, su, cls) { return "<div class='cs-card " + (cls || "") + "'><div class='cs-card-t'>" + t + "</div><div class='cs-card-v'>" + v + "</div><div class='cs-card-s'>" + su + "</div></div>"; }

    function compute() {
      var level = parseInt(sl.value, 10);
      root.querySelector(".cs-val").textContent = "level " + level + " · " + fmtCells(cells(level));
      var c = cd(level), err = (c - CD_INF) / CD_INF * 100, yp = yplus(level);
      fig.innerHTML = svg(level);
      var errCls = err < 2 ? "good" : (err < 8 ? "warn" : "bad");
      var ypCls = (yp <= 5) ? "good" : (yp <= 30 ? "warn" : "bad");
      out.innerHTML =
        card("Cells", fmtCells(cells(level)), "control volumes") +
        card("C_D (this mesh)", num(c, 4), "what the solver reports") +
        card("Error vs converged", (err >= 0 ? "+" : "") + num(err, 1) + "%", "drag is over-read when coarse", errCls) +
        card("Wall y+", num(yp, 1), "target ≈ 1 (≤5 ok)", ypCls);
      var v, vc;
      if (err < 2 && yp <= 5) { v = "✓ Grid-independent and y+ in range — this number is trustworthy."; vc = "good"; }
      else if (err < 8) { v = "~ Getting close, but not flat yet. Refine once or twice more before you believe it."; vc = "warn"; }
      else { v = "✗ Too coarse: the drag is badly over-read and y+ is far too high. Do not trust this result."; vc = "bad"; }
      verdict.className = "cs-verdict " + vc; verdict.textContent = v;
    }
    sl.addEventListener("input", compute);
    compute();
  }
  window.mountMeshSim = mountMeshSim;
})();
