// ControlBar/index.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Plus, LandPlot, TriangleAlert, List } from "lucide-react";
import SearchBar from "../SearchBar";
import styles from "./styles";

const buttons = [
  { icon: <Plus size={20} color="#34d399" />, label: "Add Object", onClickKey: "onAddObject" },
  { icon: <LandPlot size={20} color="#3b82f6" />, label: "Manage Areas", onClickKey: "onManageAreas" },
  { icon: <List size={20} color="#fbbf24" />, label: "Head Inventory", onClickKey: "onShowInventoryPanel" },
  { icon: <TriangleAlert size={20} color="#ef4444" />, label: "Current Issues", onClickKey: "onShowIssuesPanel" },
  { icon: <LogOut size={20} color="white" />, label: "Logout", onClickKey: "onLogout" }
];

const ControlBar = ({
  onLogout,
  onAddObject,
  onManageAreas,
  onShowIssuesPanel,
  mapItems,
  setSelectedItem,
  setMapZoom,
  setMapCenter,
  onShowInventoryPanel
}) => {
  const handlers = {
    onLogout,
    onAddObject,
    onManageAreas,
    onShowIssuesPanel,
    onShowInventoryPanel
  };

  const [hoveredLabel, setHoveredLabel] = useState(null);

  return (
    <div style={styles.floatingGlassPanel}>
      <SearchBar
        mapItems={mapItems}
        onSelectItem={(item) => {
          setSelectedItem(item);
          setMapCenter(item.position);
          setMapZoom(18);
        }}
      />

      {buttons.map(({ icon, label, onClickKey }) => {
        const isHovered = hoveredLabel === label;

        return (
          <motion.div
            key={label}
            style={styles.toolbarButton}
            onClick={handlers[onClickKey]}
            onMouseEnter={() => setHoveredLabel(label)}
            onMouseLeave={() => setHoveredLabel(null)}
            animate={{ width: isHovered ? 160 : 44 }}
            transition={{ type: "tween", duration: 0.2, ease: "easeInOut" }}
          >
            <div style={styles.iconWrapper}>{icon}</div>
            <motion.div
              style={styles.labelWrapper}
              animate={{ opacity: isHovered ? 1 : 0, maxWidth: isHovered ? 120 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <span style={styles.buttonLabel}>{label}</span>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ControlBar;