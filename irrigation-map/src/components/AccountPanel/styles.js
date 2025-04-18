const styles = {
    outerContainer: {
      zIndex: 12,
      position: "fixed",
    },
    panel: {
      background: "rgba(30, 30, 30, 0.85)",
      backdropFilter: "blur(12px)",
      borderRadius: "16px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
      color: "#fff",
      width: "400px",               // ✅ Wider panel
      padding: "16px",              // ✅ Adequate spacing
      display: "flex",
      flexDirection: "column",
      gap: "12px",                  // ✅ Clean vertical spacing
    },
    draggableHeader: {
      background: "rgba(15, 15, 15, 0.6)",
      padding: "10px 12px",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      zIndex: 2,
    },
    headerText: {
      fontWeight: "bold",
      fontSize: "13px",
      margin: 0,
    },
    closeButton: {
      background: "transparent",
      border: "none",
      fontSize: "16px",
      float: "right",
      cursor: "pointer"
    },
    input: {
      width: "100%",
      padding: "6px",
      marginBottom: "8px",
      borderRadius: "6px",
      border: "1px solid #333",
      background: "#222",
      color: "white"
    }
  };
  
  export default styles;
  