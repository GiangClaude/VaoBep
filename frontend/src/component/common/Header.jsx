import { useState } from 'react';
import {useNavigate, Link} from 'react-router-dom';
import { Search, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import apiClient from '../../api';
import { useAuth } from '../../AuthContext';
import { getAvatarUrl } from '../../utils/imageHelper';

import {ProfilePage} from '../../pages/ProfilePage'
const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const {currentUser, setCurrentUser} = useAuth();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    navigate('/login');
  }

  const navItems = [
    { label: 'Trang Chủ', to: '/homepage' },
    { label: 'Công Thức', to: '/recipes' },
    { label: 'Bài Viết', to: '/articles' }, // Ví dụ, nếu chưa có route thì để #
    { label: 'Từ Điển', to: '/dictionary' },
  ];

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
        // Ví dụ logic search: chuyển hướng sang trang recipes với query
        if (searchValue.trim()) {
            navigate(`/search?keyword=${encodeURIComponent(searchValue)}`);
        }
    }
  }

  return (
    <header className="sticky top-0 bg-white shadow-md border-b border-gray-200 z-[1000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo/Brand */}
            <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/homepage')}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-bold">
                C
              </div>
              <span className="text-xl font-bold text-gray-800">CozyHub</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="text-gray-700 hover:text-orange-500 transition-colors font-medium text-sm"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full px-4 py-2 pr-10 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition"
              />
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-4">
            {currentUser? (
              <div className='relative'>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className='flex items-center gap-3 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition'
                >
                  <img
                    src={getAvatarUrl(currentUser.id, currentUser.avatar)}
                    alt={currentUser.fullName}
                    className="w-9 h-9 rounded-full border-2 border-gray-200"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-800">{currentUser.fullName}</p>
                    <p className="text-xs text-gray-500">{currentUser.role}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-800">{currentUser.fullName}</p>
                      <p className="text-xs text-gray-500">{currentUser.email}</p>
                    </div>
                    <div className="py-2">
                      {/* 1. Hồ sơ (Link) */}
                      <Link 
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition flex items-center gap-3"
                      >
                        <User className="w-4 h-4" /> 
                        Hồ Sơ
                      </Link>
                      
                      {/* 2. Cài đặt (Link) */}
                      <Link 
                        to="/settings" // Nhớ tạo route này hoặc đổi thành '#'
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition flex items-center gap-3"
                      >
                        <Settings className="w-4 h-4" /> 
                        Cài Đặt
                      </Link>
                      
                      {/* Đường kẻ ngang phân cách cho đẹp */}
                      <div className="border-t border-gray-100 my-1"></div>
                      
                      {/* 3. Đăng xuất (Button - Màu đỏ) */}
                      <button 
                        onClick={logout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-3 font-medium"
                      >
                        <LogOut className="w-4 h-4" /> 
                        Đăng Xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ): (
              <div className="flex items-center gap-3">
                {/* Nút Đăng nhập (Style nhẹ nhàng) */}
                <Link 
                  to="/login"
                  className="text-gray-600 hover:text-orange-500 font-medium text-sm transition-colors"
                >
                  Đăng nhập
                </Link>

                {/* Nút Đăng ký (Style nổi bật giống Logo) */}
                <Link 
                  to="/register"
                  className="bg-gradient-to-br from-orange-400 to-red-500 text-white px-4 py-2 rounded-full hover:opacity-90 transition shadow-sm font-medium text-sm"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;