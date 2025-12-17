/* dscc helper (minimal inline build) */
window.dscc = window.dscc || {
  subscribeToData: function(cb) {
    window.addEventListener("message", function(e) {
      if (e.data && e.data.tables) cb(e.data);
    });
  },
  objectTransform: function(d){ return d; }
};

(function () {
  const root = document.createElement("div");
  root.id = "sparklineRoot";
  document.body.appendChild(root);

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  root.appendChild(svg);

  function draw(data) {
    svg.innerHTML = "";

    const rows = data.tables[0].rows || [];
    if (rows.length < 2) return;

    const style = data.style.sparklineStyle || {};
    const color = style.lineColor?.value || "#7E57C2";
    const width = style.lineWidth?.value || 3;
    const duration = style.durationMs?.value || 900;

    const points = rows.map((r, i) => ({
      x: i * (100 / (rows.length - 1)),
      y: 100 - Number(r[1].value || 0)
    }));

    const d = points.map((p, i) =>
      `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`
    ).join(" ");

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", width);
    path.setAttribute("stroke-linecap", "round");

    svg.appendChild(path);

    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    path.getBoundingClientRect();
    path.style.transition = `stroke-dashoffset ${duration}ms ease-out`;
    path.style.strokeDashoffset = "0";
  }

  dscc.subscribeToData(draw);
})();