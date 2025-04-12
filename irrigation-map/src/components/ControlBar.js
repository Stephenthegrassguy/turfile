import React from "react";

const ControlBar = ({ onLogout, onAddObject, onManageAreas }) => {
  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.inner}>
          <button style={styles.button} onClick={onAddObject}>Add Object</button>
          <button style={styles.button} onClick={onManageAreas}>Manage Areas</button>
          <button style={{ ...styles.button, marginTop: "auto" }} onClick={onLogout}>Logout</button>
        </div>
      </div>
      <div style={styles.gradientFade} />
    </div>
  );
};

const styles = {
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "180px", // 120px panel + 60px gradient
    zIndex: 10,
    display: "flex",
    flexDirection: "row",
    pointerEvents: "none"
  },
  container: {
    width: "120px",
    height: "100%",
    background: "rgba(15, 15, 15, 0.6)", // softened slightly
    backdropFilter: "blur(8px)", // softer blur
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
    padding: "10px 0",
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

export default ControlBar;
