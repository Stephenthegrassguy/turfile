// src/components/HeadInventory/styles.js

const styles = {
    // Outer container styling (positioned dynamically via inline top/left)
    container: {
      zIndex: 12,
    },
    // Panel styling (combines with panelBase)
    panel: {
      maxHeight: "80vh",
      overflowY: "auto",
    },
    // Header styling (combines with draggableHeader)
    header: {
      background: "rgba(15, 15, 15, 0.6)",
      padding: "10px 12px",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      zIndex: 2,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    // Header title text styling
    headerTitle: {
      fontWeight: "bold",
      fontSize: "13px",
      margin: 0,
    },
    // Header buttons container styling
    headerButtons: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    // Toggle track style (base)
    toggleTrack: {
      width: "40px",
      height: "22px",
      backgroundColor: "#ccc",
      borderRadius: "999px",
      position: "relative",
      cursor: "pointer",
    },
    // Toggle thumb style (dynamic based on placement status)
    toggleThumb: (on) => ({
      width: "18px",
      height: "18px",
      borderRadius: "50%",
      backgroundColor: "white",
      position: "absolute",
      top: "2px",
      left: on ? "20px" : "2px",
      transition: "left 0.2s ease-in-out",
    }),
    // Active toggle track style for placement mode
    toggleTrackActive: {
      backgroundColor: "#6fff8f",
    },
    // Close button styling override
    closeButton: {
      background: "transparent",
      border: "none",
      fontSize: "16px",
      padding: 0,
    },
    // Content wrapper inside the panel
    content: {
      padding: "12px 16px",
    },
    // Filter container styling for select boxes and clear button
    filterContainer: {
      marginTop: "12px",
      marginBottom: "12px",
      display: "flex",
      gap: "8px",
    },
    // Message shown in placement mode
    placingMessage: {
      fontSize: "13px",
      fontWeight: 500,
      marginBottom: "12px",
    },
    // Text displaying the count of heads
    countText: {
      fontSize: "12px",
    },
    // List container styling for inventory items
    list: {
      paddingLeft: "16px",
      fontSize: "12px",
      margin: 0,
    },
    // List item styling for each head; dynamic animationDelay is applied inline
    listItem: {
      marginBottom: "6px",
      color: "#fff",
      cursor: "pointer",
      opacity: 0,
      transform: "translateY(10px)",
      animation: "fadeSlideIn 0.4s ease-out forwards",
    },
  };
  
  export default styles;
  