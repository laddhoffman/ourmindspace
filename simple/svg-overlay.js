class SVGOverlay {
  constructor (uiMesh) {
    // Our expectation/requirement is that the provided `div` has the same
    // origin point as the corresponding UIMesh upon which this is overlain.
    this.setUiMesh(uiMesh);

    // Let's add our svg
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('overlay');
    this.setSvg(svg);
    this.getUiMesh().getDiv().append(this.getSvg());

    // Let's make the viewbox match the available dimensions
    // What if we set the viewbox to match the width of the svg element itself?
    // const {width, height} = this.getUiMesh().getBoundingRectangle();
    const {width, height} = this.getUiMesh().getBoundingRectangle();
    // const width = parseInt(window.getComputedStyle(this.getSvg()).getPropertyValue('clientWidth'));
    // const width = window.innerWidth;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
  }

  recomputeSize() {
    // Let's make the viewbox match the available dimensions
    const {width, height} = this.getUiMesh().getBoundingRectangle();
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  }

  setSvg(element) { this.svg = element; }
  getSvg() { return this.svg; }

  setUiMesh(uiMesh) { this.uiMesh = uiMesh; }
  getUiMesh() { return this.uiMesh; }

  // Now some useful function -- draw a line from one point to another.
  // `from` and `to` are objects, each with properties `top` and `left`.
  createLine(from, to, className) {
    // Let's append a line to an svg
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', from.left);
    line.setAttribute('y1', from.top);
    line.setAttribute('x2', to.left);
    line.setAttribute('y2', to.top);
    // line.setAttribute('stroke', stroke);
    line.classList.add(className);
    this.getSvg().append(line);
    return line;
  }
}
