// irrigation-map/src/components/PlacementManagement.js
import React from "react";

const PlacementManagement = ({
  placingType,
  setPlacingType,
  itemName,
  setItemName,
  holes,
  selectedHole,
  setSelectedHole,
  selectedArea,
  setSelectedArea,
  areasByHole,
  setShowAddObjectForm,
}) => {
  return (
    <div style={{ position: "absolute", top: 60, left: 10, background: "white", padding: "10px", border: "1px solid gray", zIndex: 2 }}>
      <h4>Add Object</h4>
      <select onChange={(e) => setPlacingType(e.target.value)} value={placingType || ""}>
        <option value="" disabled>Select Type</option>
        <option value="head">Head</option>
        <option value="valve">Valve</option>
        <option value="satellite">Satellite</option>
        <option value="splice box">Splice Box</option>
        <option value="wire">Wire</option>
        <option value="pipe">Pipe</option>
      </select>

      <select onChange={(e) => setSelectedHole(e.target.value)} value={selectedHole || ""}>
        <option value="" disabled>Select Hole</option>
        {holes.map(hole => <option key={hole} value={hole}>{hole}</option>)}
      </select>

      <select onChange={(e) => setSelectedArea(e.target.value)} value={selectedArea || ""} disabled={!selectedHole}>
        <option value="" disabled>Select Area</option>
        {selectedHole && areasByHole[selectedHole] && areasByHole[selectedHole].map(area => <option key={area} value={area}>{area}</option>)}
      </select>

      <input
        type="text"
        placeholder="Enter item name"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
      /><br />
      <button onClick={() => setShowAddObjectForm(false)}>Close</button>
      <p style={{ fontSize: "0.85rem", marginTop: "5px" }}>
        After selecting, click the map to place it.
      </p>
    </div>
  );
};

export default PlacementManagement;