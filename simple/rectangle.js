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
function rectanglesIntersect(rect1, rect2) {
  const rect1CornersInRect2 = getRectangleCorners(rect1).some(point => {
    return rectangleContainsPoint(rect2, point);
  });
  const rect2CornersInRect1 = getRectangleCorners(rect2).some(point => {
    return rectangleContainsPoint(rect1, point);
  });
  return rect1CornersInRect2 || rect2CornersInRect1;
}

