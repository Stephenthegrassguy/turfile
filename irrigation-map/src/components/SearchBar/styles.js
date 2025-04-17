const styles = {
  toolbarButton: {
    background: "rgba(30, 30, 30, 0.85)", // match other buttons
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "999px",
    height: "44px",
    width: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    cursor: "pointer",
    overflow: "hidden",
    whiteSpace: "nowrap",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)",
    padding: 0,
    transition: "all 0.2s ease"
  },
  iconWrapper: {
    width: "44px",
    height: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    background: "rgba(0, 0, 0, 0.2)",
    borderRadius: "50%",
    boxShadow: "inset 0 0 4px rgba(255, 255, 255, 0.1)"
  },
  labelWrapper: {
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    whiteSpace: "nowrap",
    paddingLeft: "8px"
  },
  input: {
    background: "transparent",
    border: "none",
    color: "white",
    fontSize: "13px",
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
    padding: 0,               // 🔥 important to prevent glow
    margin: 0,                // 🔥 important to collapse spacing
    boxShadow: "none"         // remove native input shadows
  },
  
  resultsBox: {
    position: "absolute",
    top: "52px",
    left: 0,
    background: "rgba(0, 0, 0, 0.6)",
    borderRadius: "6px",
    maxHeight: "140px",
    overflowY: "auto",
    width: "200px",
    zIndex: 10
  },
  resultItem: {
    padding: "6px 8px",
    fontSize: "13px",
    color: "white",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    cursor: "pointer"
  }
};

export default styles;
