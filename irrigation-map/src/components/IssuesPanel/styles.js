// src/components/styles.js

const styles = {
    // Outer container adds a fixed z-index; top and left will be provided dynamically
    outerContainer: {
      zIndex: 12,
    },
    // Flex container to reverse row order
    flexRowReverse: {
      display: "flex",
      flexDirection: "row-reverse",
    },
    // Panel style overrides for width and overflow
    panel: {
      width: "200px",
      maxHeight: "30vh",
      overflowY: "auto",
    },
    // Draggable header style includes background color, padding, border, and zIndex
    draggableHeader: {
      background: "rgba(15, 15, 15, 0.6)",
      padding: "10px 12px",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      zIndex: 2,
    },
    // Header text formatting
    headerText: {
      fontWeight: "bold",
      fontSize: "13px",
      margin: 0,
    },
    // Close button style: transparent background and borderless
    closeButton: {
      background: "transparent",
      border: "none",
      fontSize: "16px",
      padding: 0,
    },
    // Styles for the issues list container
    issuesList: {
      listStyle: "disc",
      padding: "10px 20px",
      margin: 0,
      overflowY: "auto",
    },
    // Styles for each individual list item
    listItem: {
      fontSize: "12px",
      marginBottom: "6px",
      cursor: "pointer",
      color: "#fff",
    },
    // Style for a list item when no issues are found
    noIssues: {
      fontSize: "12px",
      color: "#fff",
    },
    // Gradient fade style on the side of the panel
    gradientFade: {
      width: "60px",
      height: "100%",
      background:
        "linear-gradient(to left, rgba(15,15,15,0.6), rgba(15,15,15,0.25), rgba(15,15,15,0.05), transparent)",
      pointerEvents: "none",
    },
  };
  
  export default styles;
  