import React, { useState } from "react";
import { auth } from "../../firebase";
import {
  updateProfile,
  sendPasswordResetEmail,
  deleteUser,
} from "firebase/auth";

import {
  overlayBase,
  panelBase,
  draggableHeader,
  button,
} from "../../styles/PanelStyles";
import styles from "./styles";

const AccountPanel = ({ onClose }) => {
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName || "");

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ top: 100, left: 100 });

  const startDrag = (e) => {
    setDragging(true);
    setOffset({
      x: e.clientX - panelPosition.left,
      y: e.clientY - panelPosition.top,
    });
  };

  const onDrag = (e) => {
    if (!dragging) return;
    const newLeft = e.clientX - offset.x;
    const newTop = e.clientY - offset.y;
    setPanelPosition({ top: newTop, left: newLeft });
  };

  const stopDrag = () => setDragging(false);

  const handleUpdate = async () => {
    try {
      await updateProfile(user, { displayName });
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email);
      alert("Password reset email sent.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      try {
        await deleteUser(user);
        alert("Account deleted.");
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div
      style={{
        ...overlayBase,
        ...styles.container,
        top: panelPosition.top,
        left: panelPosition.left,
      }}
      onMouseMove={onDrag}
      onMouseUp={stopDrag}
    >
      <div style={{ ...panelBase, ...styles.panel, width: "320px" }}>
        <div
          style={{ ...draggableHeader, ...styles.header }}
          onMouseDown={startDrag}
        >
          <h4 style={styles.headerTitle}>My Account</h4>
          <div style={styles.headerButtons}>
            <button style={{ ...button, ...styles.closeButton }} onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div style={styles.content}>
          <p><strong>Email:</strong> {user?.email}</p>

          <label>
            Display Name:
            <input
              style={styles.input}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </label>

          <button style={button} onClick={handleUpdate}>Update Display Name</button>
          <button style={button} onClick={handleResetPassword}>Reset Password</button>
          <button
            style={{ ...button, backgroundColor: "#e74c3c" }}
            onClick={handleDeleteAccount}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountPanel;
