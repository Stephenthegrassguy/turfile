// src/components/CreateInventory/styles.js

const styles = {
    headerContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px",
    },
    headerText: {
      fontSize: "13px",
      fontWeight: "500",
      margin: 0,
    },
    headerButtonContainer: {
      display: "flex",
      gap: "8px",
    },
    tableContainer: {
      overflowX: "auto",
    },
    table: {
      fontSize: "12px",
      width: "100%",
      tableLayout: "fixed",
      borderCollapse: "collapse",
    },
    tableHeaderLeft: {
      textAlign: "left",
      paddingBottom: "6px",
    },
    tableHeaderCenter: {
      textAlign: "center",
      paddingBottom: "6px",
    },
    tableDataCenter: {
      textAlign: "center",
    },
    // Additional style for the inventory input width override
    inventoryInput: {
      width: "40px",
    },
  };
  
  export default styles;
  