import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import DishPopupCard from '../component/dictionary/DishPopupCard';
import { getDishImageUrl } from '../utils/imageHelper';

import { useDishMapSummaryQuery, useDishMapAllQuery } from '../hooks/queries/useDictionaryQueries';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const DishMap = () => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    
    // State quản lý trạng thái zoom để thêm/bớt class ở container cha
    const [isZoomedIn, setIsZoomedIn] = useState(false);

    const { data: summaryData = [], isLoading: loadingSummary } = useDishMapSummaryQuery();
    const { data: allDishes = [], isLoading: loadingAll } = useDishMapAllQuery();

    const loading = loadingSummary || loadingAll;
    
    // Khởi tạo bản đồ Mapbox và đăng ký sự kiện lắng nghe mức zoom duy nhất
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

        // Hàm cập nhật trạng thái zoom dựa trên threshold cố định (4.5)
        const handleMapZoom = () => {
            const currentZoom = map.current.getZoom();
            setIsZoomedIn(currentZoom >= 4.5);
        };

        map.current.on('zoom', handleMapZoom);

        // Hủy bỏ lắng nghe sự kiện khi component bị unmount
        return () => {
            if (map.current) {
                map.current.off('zoom', handleMapZoom);
            }
        };
    }, [loading]);

    // Tạo và quản lý các Marker hiển thị món ăn trên bản đồ
    useEffect(() => {
        if (!map.current || loading) return;

        const currentMarkers = document.querySelectorAll('.mapboxgl-marker');
        currentMarkers.forEach(m => m.remove());

        // --- LAYER 1: QUỐC GIA (Zoom out) ---
        summaryData.forEach(country => {
            const el = document.createElement('div');
            el.className = 'country-marker group';
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

            new mapboxgl.Marker(el)
                .setLngLat([country.lng, country.lat])
                .addTo(map.current);

            el.addEventListener('click', () => {
                map.current.flyTo({
                    center: [country.lng, country.lat],
                    zoom: 6,
                    essential: true,
                    duration: 2000
                });
            });
        });

        // --- LAYER 2: CHI TIẾT MÓN ĂN (Zoom in) ---
        allDishes.forEach(dish => {
            const el = document.createElement('div');
            el.className = 'dish-marker hover:z-50';
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
                maxWidth: 'none'
            }).setDOMContent(popupNode);

            new mapboxgl.Marker(el)
                .setLngLat([dish.longitude, dish.latitude])
                .setPopup(popup)
                .addTo(map.current);

            popup.on('open', () => {
                const root = createRoot(popupNode);
                root.render(<DishPopupCard dish={dish} />);
            });
        });

    }, [summaryData, allDishes, loading]);

    if (loading) return <div className="flex justify-center p-10 text-[#7d5a3f] font-bold italic animate-pulse">Khám phá bản đồ ẩm thực...</div>;

    return (
        <div className={`w-full h-[650px] rounded-3xl shadow-inner border-[12px] border-white overflow-hidden relative group ${isZoomedIn ? 'is-zoomed-in' : ''}`}>
            
            {/* Inject CSS xử lý ẩn hiện marker theo class của container cha để tối ưu render */}
            <style>{`
                .country-marker { display: block; }
                .dish-marker { display: none; }
                
                .is-zoomed-in .country-marker { display: none; }
                .is-zoomed-in .dish-marker { display: block; }
            `}</style>

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