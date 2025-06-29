'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { FaCog, FaExchangeAlt, FaThLarge, FaBars, FaTimes, FaHome, FaLink } from 'react-icons/fa';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';


const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }: { isMobileMenuOpen: boolean, setIsMobileMenuOpen: Dispatch<SetStateAction<boolean>> }) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Set active based on current path
  useEffect(() => {
    const path = pathname?.split('/')[1] || 'dashboard';
    setActive(path.charAt(0).toUpperCase() + path.slice(1));
  }, [pathname]);

  const [active, setActive] = useState('Dashboard');

  const menuItems = [
    { name: 'Home', icon: <FaHome />, link: '/' },
    { name: 'Dashboard', icon: <FaThLarge />, link: '/dashboard' },
    { name: 'Transactions', icon: <FaExchangeAlt />, link: '/transaction' },
    { name: 'Cross-Chain', icon: <FaLink />, link: '/crosschain' },
    { name: 'Settings', icon: <FaCog />, link: '/settings' },
  ];

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobileMenuOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:relative h-screen bg-[#151021] text-white flex flex-col z-30",
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-[320px]",
        // Mobile positioning
        "lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Toggle Button - Desktop */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 bg-[#151021] p-2 rounded-full cursor-pointer"
        >
          {isCollapsed ? <FaBars className="text-white" /> : <FaTimes className="text-white" />}
        </button>

        {/* Close Button - Mobile */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden absolute right-4 top-4 text-white"
        >
          <FaTimes size={24} />
        </button>

        {/* Logo */}
        <h1 className={cn(
          "px-5 mt-[50px] font-bold text-center text-white mb-10",
          isCollapsed ? "text-2xl" : "text-3xl"
        )}>
          {isCollapsed ? (
            <span className="text-[#9C2CFF]">DD</span>
          ) : (
            <>
              <span className="text-[#ffff]">DeFi-</span>
              <span className="text-[#9C2CFF]">Direct</span>
            </>
          )}
        </h1>

        {/* Navigation */}
        <nav className={cn(
          "flex flex-col mt-[70px] gap-6",
          isCollapsed ? "px-2" : "pl-8"
        )}>
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.link}
              className={cn(
                'flex h-[68px] gap-3 p-3 rounded-lg transition-all duration-200 items-center',
                active === item.name ? 'bg-gradient-to-r from-[#5B2B99] to-black' : 'hover:bg-gray-800',
                isCollapsed && 'justify-center'
              )}
              onClick={() => {
                setActive(item.name);
                setIsMobileMenuOpen(false);
              }}
            >
              <span className={cn(
                "text-lg",
                isCollapsed && "text-xl"
              )}>{item.icon}</span>
              {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;