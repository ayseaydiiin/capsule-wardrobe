import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Shirt, Plus, Palette, LogOut, MessageCircle, Share2, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from './NotificationPanel';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', icon: Home, label: 'Ana Sayfa' },
    { path: '/closet', icon: Shirt, label: 'Dolap' },
    { path: '/add', icon: Plus, label: 'Ekle' },
    { path: '/canvas', icon: Palette, label: 'Kombin' },
    { path: '/feed', icon: Share2, label: 'Feed' },
    { path: '/messages', icon: MessageCircle, label: 'Mesajlar' },
    { path: '/friends', icon: Users, label: 'Arkadaşlar' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-charcoal">Capsule Wardrobe</h1>
          </div>
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-charcoal text-white'
                      : 'text-charcoal hover:bg-soft-gray'
                  }`}
                >
                  <Icon size={20} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* Kullanıcı bilgisi ve Çıkış */}
            <div className="ml-4 flex items-center space-x-4 pl-4 border-l border-gray-300">
              <NotificationPanel />
              <span className="hidden sm:inline text-sm text-gray-600">
                {user?.username && `Hoş geldiniz, ${user.username}`}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                title="Çıkış Yap"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
