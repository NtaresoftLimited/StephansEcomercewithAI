"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Navigation } from "lucide-react";

const STORES = [
    {
        id: "1",
        name: "Masaki Branch (Main)",
        address: "11 Slipway Rd, Masaki, Dar es Salaam",
        phone: "+255 786 627 873",
        hours: "Mon-Sat: 9AM - 8:30PM",
        position: [-6.7452, 39.2825] as [number, number],
    },
    {
        id: "2",
        name: "Mikocheni Branch",
        address: "58 Mikocheni A, Dar es Salaam",
        phone: "+255 786 627 873",
        hours: "Mon-Sat: 9AM - 6:00PM",
        position: [-6.7733, 39.2699] as [number, number],
    },
];

export function StoreLocator() {
    const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="background-color: #2b231d; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <img src="/favicon.png" alt="Stephan's Pet Store" style="width: 20px; height: 20px; object-fit: contain; filter: brightness(0) invert(1);" />
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #2b231d; margin: -2px auto 0;"></div>`,
        iconSize: [36, 44],
        iconAnchor: [18, 44],
        popupAnchor: [0, -44],
    });

    // Center between the two stores approximately
    const center: [number, number] = [-6.7592, 39.2762];

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: "100%", width: "100%", zIndex: 10 }}
            scrollWheelZoom={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {STORES.map((store) => (
                <Marker
                    key={store.id}
                    position={store.position}
                    icon={customIcon}
                >
                    <Popup className="custom-popup">
                        <div className="p-1 min-w-[180px]">
                            <h3 className="font-bold text-zinc-900 mb-1">{store.name}</h3>
                            <p className="text-sm text-zinc-600 mb-2">{store.address}</p>
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${store.position[0]},${store.position[1]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-white bg-[#8c6b5d] px-3 py-1.5 rounded-md hover:bg-[#5a4a42] transition-colors"
                            >
                                <Navigation className="h-3 w-3" />
                                Directions
                            </a>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
