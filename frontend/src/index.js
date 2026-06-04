// VỊ TRÍ: frontend/src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// --- THÊM MỚI TỪ ĐÂY: Import React Query ---
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Khởi tạo QueryClient với các cấu hình mặc định tối ưu
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Tránh gọi lại API tự động khi người dùng chuyển tab trình duyệt
      retry: 1, // Chỉ thử gọi lại API 1 lần nếu bị lỗi mạng
      staleTime: 5 * 60 * 1000, // Dữ liệu được coi là "tươi" trong 5 phút, không cần fetch lại ngay
    },
  },
});
// --- KẾT THÚC THÊM MỚI ---

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Bọc App bằng QueryClientProvider
  <QueryClientProvider client={queryClient}>
    <App />
    
    {/* Công cụ Debug góc dưới màn hình (Chỉ hiện trong môi trường Development) */}
    <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
  </QueryClientProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();