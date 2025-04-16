import React from "react";
import SearchBar from "./SearchBar";

const ControlBar = ({
  onLogout,
  onAddObject,
  onManageAreas,
  onShowIssuesPanel,
  mapItems,
  setSelectedItem,
  setMapZoom,
  setMapCenter,
  onShowAccountPanel,
  onShowInventoryPanel
}) => {
  const styles = {
    wrapper: {
      position: "absolute",
      top: 0,
      left: 0,
      height: "100%",
      width: "180px",
      zIndex: 10,
      display: "flex",
      flexDirection: "row",
      pointerEvents: "none"
    },
    container: {
      width: "120px",
      height: "100%",
      background: "rgba(15, 15, 15, 0.6)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "auto",
      borderTopRightRadius: "6px",
      borderBottomRightRadius: "6px"
    },
    inner: {
      display: "flex",
      flexDirection: "column",
      height: "90%",
      width: "80%",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 0"
    },
    gradientFade: {
      width: "60px",
      height: "100%",
      background: "linear-gradient(to right, rgba(15,15,15,0.6), rgba(15,15,15,0.25), rgba(15,15,15,0.05), transparent)",
      pointerEvents: "none"
    },
    button: {
      background: "rgba(255, 255, 255, 0.08)",
      border: "none",
      color: "white",
      padding: "6px 8px",
      width: "100%",
      borderRadius: "6px",
      fontSize: "11px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      marginBottom: "12px"
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.inner}>
          <SearchBar
            mapItems={mapItems}
            onSelectItem={(item) => {
              setSelectedItem(item);
              setMapCenter(item.position);
              setMapZoom(18);
            }}
          />

          <button style={styles.button} onClick={onAddObject}>Add Object</button>
          <button style={styles.button} onClick={onManageAreas}>Manage Areas</button>
          <button style={styles.button} onClick={onShowInventoryPanel}>Head Inventory</button>
          <button style={styles.button} onClick={onShowIssuesPanel}>Current Issues</button>
          <button style={{ ...styles.button, marginTop: "auto" }} onClick={onLogout}>Logout</button>
          <button onClick={onShowAccountPanel} className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded shadow">My Account</button>
        </div>
      </div>
      <div style={styles.gradientFade} />
    </div>
  );
};

export default ControlBar;
