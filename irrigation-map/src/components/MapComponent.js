import React, { useRef, useCallback } from 'react';
import { GoogleMap } from "@react-google-maps/api";

const MapComponent = ({
  center,
  containerStyle,
  onMapClick,
  children,
  mapRef // 👈 receive the mapRef from parent
}) => {
  const handleLoad = useCallback((map) => {
    if (mapRef) {
      mapRef.current = map;
    }
  }, [mapRef]);

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={18}
      onClick={onMapClick}
      onLoad={handleLoad} // 👈 capture the map instance
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
};

export default MapComponent;
