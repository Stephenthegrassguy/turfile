// styles.js
const styles = {
    wrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    },
    text: {
      margin: "4px 0",
      color: "#fff",
      fontSize: "13px"
    },
    textarea: {
      width: "100%",
      height: "60px",
      fontSize: "12px",
      borderRadius: "4px",
      border: "1px solid #444",
      backgroundColor: "#222",
      color: "#fff",
      marginTop: "6px"
    },
    statusRow: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginTop: "10px",
      flexWrap: "wrap"
    },
    buttonGroup: {
      marginTop: "10px",
      display: "flex",
      justifyContent: "space-between",
      width: "100%"
    },
    logForm: {
      marginTop: "10px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "10px"
    },
    logFormButtons: {
      display: "flex",
      justifyContent: "center",
      gap: "12px",
      marginTop: "10px"
    },
    fileInput: {
      display: "none"
    },
    imagePreviewContainer: {
      display: "flex",
      gap: "6px",
      flexWrap: "wrap",
      marginTop: "6px",
      justifyContent: "center"
    },
    thumbWrapper: {
      position: "relative",
      width: "50px",
      height: "50px",
      borderRadius: "4px",
      overflow: "visible",
      border: "1px solid #555"
    },
    thumb: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block"
    },
    removeButton: {
      position: "absolute",
      top: "-8px",
      right: "-8px",
      backgroundColor: "#c0392b",
      color: "#fff",
      border: "2px solid #111",
      borderRadius: "50%",
      width: "18px",
      height: "18px",
      fontSize: "12px",
      fontWeight: "bold",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 0 4px rgba(0,0,0,0.5)"
    },
    logItem: {
      marginBottom: "10px",
      cursor: "pointer"
    },
    modalBackdrop: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.6)",
      zIndex: 9999,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    },
    modalContent: {
      background: "#111",
      color: "#fff",
      padding: "20px",
      borderRadius: "8px",
      maxWidth: "400px",
      width: "90%",
      maxHeight: "90vh",
      overflowY: "auto"
    },
    fullImage: {
      width: "100%",
      maxHeight: "300px",
      objectFit: "contain",
      marginTop: "10px",
      borderRadius: "6px"
    },
    logList: {
      maxHeight: "150px",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      marginTop: "10px"
    },
    logRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 0",
      borderBottom: "1px solid #777",
      cursor: "pointer"
    },
    logText: {
      flex: 1,
      marginRight: "10px"
    },
    logThumb: {
      width: "40px",
      height: "40px",
      objectFit: "cover",
      borderRadius: "4px",
      border: "1px solid #555"
    }
  };
  
  export default styles;
  