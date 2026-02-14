"use client";

import { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Phone, Clock, Navigation } from "lucide-react";
import L from "leaflet";

// Fix for default marker icon in Next.js
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface StoreLocation {
    id: string;
    name: string;
    address: string;
    phone: string;
    hours: string;
    position: [number, number];
}

const STORES: StoreLocation[] = [
    {
        id: "1",
        name: "Masaki Branch (Main)",
        address: "11 Slipway Rd, Masaki, Dar es Salaam",
        phone: "+255 786 627 873",
        hours: "Mon-Sat: 9AM - 8:30PM",
        position: [-6.7452, 39.2825], // Approximate Masaki coordinates
    },
    {
        id: "2",
        name: "Mikocheni Branch",
        address: "Opposite the Tanesco Office, Mikocheni, Dar es Salaam",
        phone: "+255 786 627 873",
        hours: "Mon-Sat: 9AM - 6:00PM",
        position: [-6.7733, 39.2699], // Mikocheni coordinates
    },
];

export function StoreLocator() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

    const filteredStores = useMemo(() => {
        return STORES.filter((store) =>
            store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            store.address.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const activeStore = useMemo(() => {
        return STORES.find(s => s.id === selectedStoreId) || STORES[0];
    }, [selectedStoreId]);

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)] min-h-[600px] border rounded-lg overflow-hidden bg-white shadow-sm">
            {/* Sidebar - Store List */}
            <div className="w-full lg:w-1/3 flex flex-col border-r border-zinc-200">
                <div className="p-4 border-b border-zinc-200 bg-zinc-50">
                    <h2 className="text-xl font-bold text-[#6b3e1e] mb-4">Find a Store</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search by location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6b3e1e]/20 focus:border-[#6b3e1e] transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredStores.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500">
                            No stores found matching your search.
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-100">
                            {filteredStores.map((store) => (
                                <button
                                    key={store.id}
                                    onClick={() => setSelectedStoreId(store.id)}
                                    className={`w-full text-left p-4 hover:bg-zinc-50 transition-colors ${selectedStoreId === store.id ? "bg-[#6b3e1e]/5" : ""
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className={`font-semibold ${selectedStoreId === store.id ? "text-[#6b3e1e]" : "text-zinc-900"
                                            }`}>
                                            {store.name}
                                        </h3>
                                        {selectedStoreId === store.id && (
                                            <span className="text-xs bg-[#6b3e1e] text-white px-2 py-0.5 rounded-full">
                                                Selected
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-2 text-sm text-zinc-600">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#6b3e1e]" />
                                            <span>{store.address}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 shrink-0 text-[#6b3e1e]" />
                                            <span>{store.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 shrink-0 text-[#6b3e1e]" />
                                            <span>{store.hours}</span>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${store.position[0]},${store.position[1]}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-xs font-medium text-[#6b3e1e] hover:underline"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Navigation className="h-3 w-3" />
                                            Get Directions
                                        </a>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Map Area */}
            <div className="w-full lg:w-2/3 h-full relative bg-zinc-100">
                <MapContainer
                    center={activeStore.position}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                    key={activeStore.id} // Re-render map when selected store changes to center it
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {filteredStores.map((store) => (
                        <Marker
                            key={store.id}
                            position={store.position}
                            icon={icon}
                            eventHandlers={{
                                click: () => setSelectedStoreId(store.id),
                            }}
                        >
                            <Popup>
                                <div className="p-2 min-w-[200px]">
                                    <h3 className="font-bold text-zinc-900 mb-1">{store.name}</h3>
                                    <p className="text-sm text-zinc-600 mb-2">{store.address}</p>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${store.position[0]},${store.position[1]}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-medium text-white bg-[#6b3e1e] px-3 py-1.5 rounded-md hover:bg-[#5a3419] transition-colors"
                                    >
                                        Get Directions
                                    </a>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}
