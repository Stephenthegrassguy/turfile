import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import styles from "./styles";

const SearchBar = ({ mapItems, onSelectItem }) => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSearch = (e) => setQuery(e.target.value);

  const filteredItems = mapItems.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item) => {
    setQuery("");
    onSelectItem(item);
    setFocused(false);
  };

  const isExpanded = focused || query;

  return (
    <motion.div
      style={styles.toolbarButton}
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => {
        if (!query) setFocused(false);
      }}
      animate={{ width: isExpanded ? 160 : 44 }}
      transition={{ type: "tween", duration: 0.2, ease: "easeInOut" }}
    >
      <div style={styles.iconWrapper}>
        <Search size={20} color="white" />
      </div>

      <motion.div
        style={styles.labelWrapper}
        animate={{
          opacity: isExpanded ? 1 : 0,
          maxWidth: isExpanded ? 120 : 0
        }}
        transition={{ duration: 0.2 }}
      >
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={handleSearch}
          onFocus={() => setFocused(true)}
          style={styles.input}
        />
      </motion.div>

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
    </motion.div>
  );
};

export default SearchBar;
