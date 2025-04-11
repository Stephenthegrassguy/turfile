// irrigation-map/src/components/MapComponent.js
import React from 'react';
import { GoogleMap } from "@react-google-maps/api";

const MapComponent = ({
  center,
  containerStyle,
  onMapClick,
  children,
}) => (
  <GoogleMap
    mapContainerStyle={containerStyle}
    center={center}
    zoom={18}
    onClick={onMapClick}
    options={{
      mapTypeId: "satellite",
      tilt: 0,
      disableDefaultUI: true,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false
    }}
  >
    {children}
  </GoogleMap>
);

export default MapComponent;