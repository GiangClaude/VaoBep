import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import useDishMap from '../hooks/useDishMap';
import DishPopupCard from '../component/dictionary/DishPopupCard';
import { getDishImageUrl } from '../utils/imageHelper';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const DishMap = () => {
    console.log("MAPBOX TOKEN:", process.env.REACT_APP_MAPBOX_ACCESS_TOKEN); // Debug log để kiểm tra token
    const mapContainer = useRef(null);
    const map = useRef(null);
    const { summaryData, allDishes, loading } = useDishMap();

    useEffect(() => {
        if (map.current || loading) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/light-v10',
            center: [15, 20],
            zoom: 2.2,
            maxZoom: 15,
            minZoom: 1.5
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    }, [loading]);

    useEffect(() => {
        if (!map.current || loading) return;

        const currentMarkers = document.querySelectorAll('.mapboxgl-marker');
        currentMarkers.forEach(m => m.remove());

        // --- LAYER 1: QUỐC GIA (Zoom out) ---
        summaryData.forEach(country => {
            const el = document.createElement('div');
            el.className = 'country-marker group';
            // Style trực tiếp bằng Tailwind-like classes (hoặc dùng style attribute)
            el.innerHTML = `
                <div class="relative w-16 h-16 md:w-20 md:h-20 cursor-pointer transition-all duration-500 hover:scale-125">
                    <div class="absolute inset-0 rounded-full bg-[#7d5a3f] animate-ping opacity-20"></div>
                    <img src="${getDishImageUrl('', country.top_dish_image)}" 
                         class="w-full h-full rounded-full border-4 border-white shadow-xl object-cover relative z-10" />
                    <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#7d5a3f] text-[#fff9f0] px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap z-20 shadow-md">
                        ${country.country} (${country.total_dishes})
                    </div>
                </div>
            `;

            const marker = new mapboxgl.Marker(el)
                .setLngLat([country.lng, country.lat])
                .addTo(map.current);

            // [MỚI] CLICK TO ZOOM
            el.addEventListener('click', () => {
                map.current.flyTo({
                    center: [country.lng, country.lat],
                    zoom: 6,
                    essential: true,
                    duration: 2000 // 2 giây
                });
            });

            map.current.on('zoom', () => {
                el.style.display = map.current.getZoom() < 4.5 ? 'block' : 'none';
            });
        });

        // --- LAYER 2: CHI TIẾT MÓN ĂN (Zoom in) ---
        allDishes.forEach(dish => {
            const el = document.createElement('div');
            el.className = 'dish-marker hover:z-50';
            // Tăng size icon khi zoom sâu
            el.innerHTML = `
                <div class="w-10 h-10 md:w-12 md:h-12 cursor-pointer transition-transform hover:scale-150">
                    <img src="${getDishImageUrl(dish.dish_id, dish.image_url)}" 
                         class="w-full h-full rounded-full border-2 border-[#7d5a3f] shadow-lg object-cover bg-white" />
                </div>
            `;

            const popupNode = document.createElement('div');
            const popup = new mapboxgl.Popup({ 
                className: 'dish-popup-container',
                offset: 25, 
                closeButton: false,
                maxWidth: 'none' // Cho phép card tự quyết định width
            }).setDOMContent(popupNode);

            new mapboxgl.Marker(el)
                .setLngLat([dish.longitude, dish.latitude])
                .setPopup(popup)
                .addTo(map.current);

            popup.on('open', () => {
                const root = createRoot(popupNode);
                root.render(<DishPopupCard dish={dish} />);
            });

            map.current.on('zoom', () => {
                el.style.display = map.current.getZoom() >= 4.5 ? 'block' : 'none';
            });
        });

    }, [summaryData, allDishes, loading]);

    if (loading) return <div className="flex justify-center p-10 text-[#7d5a3f] font-bold italic animate-pulse">Khám phá bản đồ ẩm thực...</div>;

    return (
        <div className="w-full h-[650px] rounded-3xl shadow-inner border-[12px] border-white overflow-hidden relative group">
            <div ref={mapContainer} className="w-full h-full" />
            
            {/* Overlay Trang trí */}
            <div className="absolute top-4 left-4 pointer-events-none">
                <div className="bg-[#fff9f0]/90 backdrop-blur-sm p-3 rounded-xl border border-[#7d5a3f]/20 shadow-lg">
                    <h2 className="text-[#7d5a3f] font-bold text-sm tracking-widest uppercase">Food Dictionary Map</h2>
                    <p className="text-[10px] text-[#a68b6d]">Phóng to để xem tinh hoa từng vùng miền</p>
                </div>
            </div>
        </div>
    );
};

export default DishMap;