// ControlBar/styles.js
const styles = {
    floatingGlassPanel: {
        position: "absolute",
        top: "50%",
        left: "20px",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "16px",
        borderRadius: "20px",
        background: "rgba(255, 255, 255, 0.08)",        // ⬅️ Lighter tint instead of dark
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.45)",
        border: "1px solid rgba(255,255,255,0.12)",
        zIndex: 1000
      },
      
    toolbarButton: {
      background: "rgba(30, 30, 30, 0.85)",
      color: "white",
      border: "none",
      borderRadius: "999px",
      height: "44px",
      width: "44px",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      cursor: "pointer",
      overflow: "hidden",
      whiteSpace: "nowrap",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.8)",
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
      background: "rgba(0, 0, 0, 0.3)",
      borderRadius: "50%",
      overflow: "hidden",
      boxShadow: "inset 0 0 4px rgba(255, 255, 255, 0.1)"
    },
    labelWrapper: {
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
      whiteSpace: "nowrap",
      paddingLeft: "8px"
    },
    buttonLabel: {
      fontSize: "13px",
      color: "white"
    },
    profileImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    }
  };
  
  export default styles;