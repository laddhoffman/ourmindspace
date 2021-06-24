function rectangleContainsPoint(rect, point) {
  return point.left >= rect.left &&
    point.left <= rect.left + rect.width &&
    point.top >= rect.top &&
    point.top <= rect.top + rect.height;
}

function getRectangleCorners(rect) {
  return [
    {left: rect.left, top: rect.top},
    {left: rect.left, top: rect.top + rect.height},
    {left: rect.left + rect.width, top: rect.top},
    {left: rect.left + rect.width, top: rect.top + rect.height},
  ];
}

function getRectangleCenter(rect) {
  return {
    left: (rect.left + 0.5 * rect.width),
    top: (rect.top + 0.5 * rect.height),
  };
}

function rectanglesIntersect(rect1, rect2) {
  const rect1CornersInRect2 = getRectangleCorners(rect1).some(point => {
    return rectangleContainsPoint(rect2, point);
  });
  const rect2CornersInRect1 = getRectangleCorners(rect2).some(point => {
    return rectangleContainsPoint(rect1, point);
  });
  return rect1CornersInRect2 || rect2CornersInRect1;
}

function getBoundingRectangle(rectangles) {
    let result;
    for (const rectangle of rectangles) {
      const {left, top, width, height} = rectangle;
      const right = left + width;
      const bottom = top + height;
      if (!result) {
        result = {};
        result.left = left
        result.top = top;
        result.right = right;
        result.bottom = bottom;
      }
      result = result || rectangle;
      result.left = Math.min(result.left, left);
      result.top = Math.min(result.top, top);
      result.right = Math.max(result.right, right);
      result.bottom = Math.max(result.bottom, bottom);
    }
    return {
      left: result.left,
      top: result.top,
      width: result.right - result.left,
      height: result.bottom - result.top,
    };
}

function getDivRectangle(div) {
  // Let's also include padding here
  const computedStyle = window.getComputedStyle(div);
  const getValue = property => parseInt(computedStyle.getPropertyValue(property));
  const result = {
    left: getValue('left'),
    top: getValue('top'),
    width: getValue('width') + getValue('padding-left') + getValue('padding-right'),
    height: getValue('height') + getValue('padding-top') + getValue('padding-bottom'),
  };
  return result;
}
