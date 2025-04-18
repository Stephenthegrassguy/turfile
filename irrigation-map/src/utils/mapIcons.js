export function getShapeIcon(type) {
  if (!window.google) return null;

  const baseStyles = {
    path: window.google.maps.SymbolPath.CIRCLE,
    scale: 5, // consistent size across all icons
    fillOpacity: 1,
    strokeWeight: 0,
  };

  const colorMap = {
    head: "blue",
    valve: "red",
    satellite: "green",
    "splice box": "purple",
    default: "gray",
  };

  return {
    ...baseStyles,
    fillColor: colorMap[type] || colorMap.default,
  };
}
