import { Outlet, useSearchParams } from "react-router-dom";
import Header from "../../component/common/Header";
import { Footer } from "../../component/common/Footer";
import SearchTabs from "../../component/search/SearchTabs"; // <-- Gọi Component Tab ngang

export default function SearchLayout() {
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get("keyword") || "";

    return (
        <div className="min-h-screen flex flex-col bg-[#fff9f0]">
            {/* Đổi max-w-7xl thành max-w-[1400px] để mở rộng layout */}
            <main className="flex-1 container mx-auto px-4 sm:px-8 py-8 max-w-[1400px]">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Kết quả tìm kiếm cho "{keyword}"
                    </h1>
                </div>

                {/* Thanh Tabs ngang */}
                <SearchTabs />

                {/* Khu vực nội dung chiếm 100% chiều rộng */}
                <div className="relative min-h-[500px]">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}