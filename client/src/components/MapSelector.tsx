import React, { useEffect, useRef, useState } from 'react';

interface MapSelectorProps {
    onSelect: (lat: number, lng: number) => void;
    apiKey: string;
    mapId?: string; // Optional mapId prop
}

const MapSelector: React.FC<MapSelectorProps> = ({ onSelect, apiKey, mapId }) => {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<google.maps.Map | null>(null);
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const [placeInput, setPlaceInput] = useState<string>('');

    useEffect(() => {
        // Check if Google Maps API script is already loaded
        if (!window.google) {
            const existingScript = document.querySelector(`script[src^="https://maps.googleapis.com/maps/api/js?key=${apiKey}"]`);
            if (!existingScript) {
                const script = document.createElement("script");
                script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&map_id=${mapId}`;
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
            }
        }

        const initializeMap = () => {
            if (mapRef.current) {
                const mapOptions: google.maps.MapOptions = {
                    center: { lat: 23.8103, lng: 90.4125 }, // Default to Dhaka, Bangladesh
                    zoom: 8,
                };
                mapInstance.current = new window.google.maps.Map(mapRef.current, mapOptions);

                // Add a click event listener to the map
                window.google.maps.event.addListener(mapInstance.current, "click", (event: google.maps.MapMouseEvent) => {
                    if (event.latLng) {
                        const lat = event.latLng.lat();
                        const lng = event.latLng.lng();
                        onSelect(lat, lng); // Callback to parent component
                    }
                });

                // Initialize the Places Autocomplete
                const input = document.getElementById('place-input') as HTMLInputElement;
                const autoCompleteInstance = new window.google.maps.places.Autocomplete(input);
                setAutocomplete(autoCompleteInstance);

                // Listener for place selection
                autoCompleteInstance.addListener('place_changed', () => {
                    const place = autoCompleteInstance.getPlace();
                    if (place.geometry && place.geometry.location) {
                        const lat = place.geometry.location.lat();
                        const lng = place.geometry.location.lng();
                        onSelect(lat, lng); // Callback to parent component
                        // Optionally center the map on the selected place
                        mapInstance.current?.setCenter(place.geometry.location);
                    }
                });
            }
        };

        // Wait for the Google Maps script to load before initializing the map
        const checkGoogleMaps = setInterval(() => {
            if (window.google && window.google.maps) {
                clearInterval(checkGoogleMaps);
                initializeMap();
            }
        }, 100);

        // Cleanup function to prevent memory leaks
        return () => {
            if (mapInstance.current) {
                window.google.maps.event.clearInstanceListeners(mapInstance.current);
            }
        };
    }, [apiKey, mapId, onSelect]);

    return (
        <div>
            {/* Input for place name */}
            <input
                type="text"
                id="place-input"
                value={placeInput}
                onChange={(e) => setPlaceInput(e.target.value)}
                placeholder="Search for a place"
                className="mb-2 p-2 w-full border border-gray-300 rounded"
            />
            <div ref={mapRef} style={{ height: '400px', width: '100%' }}></div>
        </div>
    );
};

export default MapSelector;
