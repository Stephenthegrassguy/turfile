import React, { useState } from "react";

const SearchBar = ({ mapItems, onSelectItem }) => {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  const filteredItems = mapItems.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item) => {
    setQuery("");
    onSelectItem(item);
  };

  const styles = {
    container: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    },
    input: {
      background: "rgba(255, 255, 255, 0.08)",
      border: "none",
      color: "white", // Make sure input text is white
      padding: "6px 8px",
      width: "100%",
      borderRadius: "6px",
      fontSize: "11px",
      marginBottom: "12px",
      outline: "none",
      textAlign: "center",
      fontFamily: "inherit",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxSizing: "border-box"
    },
    resultsBox: {
      width: "100%",
      maxHeight: "140px",
      overflowY: "auto",
      background: "rgba(0, 0, 0, 0.6)",
      borderRadius: "6px"
    },
    resultItem: {
      padding: "6px 8px",
      fontSize: "11px",
      color: "white",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
      cursor: "pointer"
    }
  };

  return (
    <div style={styles.container}>
      <input
        type="text"
        placeholder="Search items..."
        value={query}
        onChange={handleSearch}
        style={styles.input}
      />
      {query && (
        <div style={styles.resultsBox}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              style={styles.resultItem}
            >
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;