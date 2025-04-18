import React, { useState } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db, auth, storage } from "../../firebase";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { updatePassword } from "firebase/auth";
import {
  draggableHeader,
  overlayBase,
  panelBase,
  button
} from "../../styles/PanelStyles";
import styles from "./styles";

const AccountPanel = ({ userProfile, onClose, onProfileUpdate }) => {
  const [name, setName] = useState(userProfile?.name || "");
  const [newPassword, setNewPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [message, setMessage] = useState("");


  const [panelPosition, setPanelPosition] = useState({ top: 100, left: 300 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const startDrag = (e) => {
    setDragging(true);
    setOffset({ x: e.clientX - panelPosition.left, y: e.clientY - panelPosition.top });
  };

  const onDrag = (e) => {
    if (!dragging) return;
    setPanelPosition({
      top: e.clientY - offset.y,
      left: e.clientX - offset.x
    });
  };

  const stopDrag = () => setDragging(false);

  const handleSave = async () => {
    let profilePicUrl = userProfile.profilePic || null;
    setMessage("");

    try {
      if (profileImage) {
        const imageRef = storageRef(storage, `profilePictures/${auth.currentUser.uid}`);
        await uploadBytes(imageRef, profileImage);
        profilePicUrl = await getDownloadURL(imageRef);

        if (onProfileUpdate) {
          onProfileUpdate({ profilePic: profilePicUrl });
        }
      }

      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        name,
        profilePic: profilePicUrl,
      });

      if (onProfileUpdate) {
        onProfileUpdate({ name });
      }

      if (passwordTouched && newPassword) {
        try {
          await updatePassword(auth.currentUser, newPassword);
        } catch (passwordError) {
          console.warn("Password update failed:", passwordError.message);
          setMessage("Saved, but re-login required to change password.");
          return;
        }
      }
      

      setMessage("Changes saved!");
    } catch (err) {
      console.error(err);
      setMessage("Error: " + err.message);
    }
  };

  return (
    <div
      style={{
        ...overlayBase,
        ...styles.outerContainer,
        top: panelPosition.top,
        left: panelPosition.left,
      }}
      onMouseMove={onDrag}
      onMouseUp={stopDrag}
    >
      <div style={{ ...panelBase, ...styles.panel }}>
        <div
          style={{ ...draggableHeader, ...styles.draggableHeader }}
          onMouseDown={startDrag}
        >
          <h4 style={styles.headerText}>Manage Account</h4>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        <div style={{ padding: "10px" }}>
          <input
            type="text"
            placeholder="Display Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />

<input
  type="password"
  placeholder="New Password"
  value={newPassword}
  onChange={(e) => {
    setNewPassword(e.target.value);
    setPasswordTouched(true); // ✅ Only triggers when user types
  }}
  style={styles.input}
  autoComplete="new-password"
/>


          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfileImage(e.target.files[0])}
            style={{ marginBottom: "8px", color: "#fff" }}
          />

          {profileImage && (
            <img
              src={URL.createObjectURL(profileImage)}
              alt="Preview"
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                objectFit: "cover",
                marginBottom: "8px"
              }}
            />
          )}

          <button onClick={handleSave} style={button}>Save Changes</button>
          {message && <p style={{ color: "#ccc", marginTop: "8px" }}>{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default AccountPanel;
