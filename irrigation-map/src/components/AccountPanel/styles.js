const styles = {
    container: {
      zIndex: 12,
    },
    panel: {
      maxHeight: "80vh",
      overflowY: "auto",
    },
    header: {
      background: "rgba(15, 15, 15, 0.6)",
      padding: "10px 12px",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      zIndex: 2,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerTitle: {
      fontWeight: "bold",
      fontSize: "13px",
      margin: 0,
    },
    headerButtons: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    closeButton: {
      background: "transparent",
      border: "none",
      fontSize: "16px",
      padding: 0,
    },
    content: {
      padding: "12px 16px",
    },
    input: {
      width: "100%",
      padding: "8px",
      marginTop: "4px",
      marginBottom: "12px",
      borderRadius: "6px",
      border: "1px solid #ccc",
    },
  };
  
  export default styles;
  