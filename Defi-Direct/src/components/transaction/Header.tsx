// 'use client';

// import React from 'react';
// import { Avatar, Dropdown, Menu } from 'antd';
// import { BellOutlined, DownOutlined } from '@ant-design/icons';

// const Header = () => {
//   const menu = (
//     <Menu className="bg-[#1a1a2e] text-white">
//       <Menu.Item key="1" className="hover:bg-[#262640]">Profile</Menu.Item>
//       <Menu.Item key="2" className="hover:bg-[#262640]">Settings</Menu.Item>
//       <Menu.Item key="3" className="hover:bg-[#262640]">Logout</Menu.Item>
//     </Menu>
//   );

//   return (
//     <div className="flex justify-center bg-[#0A0014] items-center w-full py-6">
//       <div className=" px-10 py-4 rounded-lg shadow-md w-full max-w-screen-2xl">
//         <div className="flex justify-between items-center">
//           {/* Left - Welcome Message */}
//           <h1 className="text-3xl  font-semibold text-white">Transactions</h1>

//           {/* Right - Icons and User Profile */}
//           <div className="flex items-center space-x-6">
//             {/* Notification Bell */}
//             <BellOutlined className="text-white text-2xl cursor-pointer hover:text-purple-400 transition" />

//             {/* Wallet Address & Avatar */}
//             <Dropdown overlay={menu} trigger={['click']}>
//               <div className="flex items-center bg-[#1A0E2C] px-4 py-2 rounded-full space-x-3 cursor-pointer shadow-md hover:bg-[#2A1C44] transition">
//                 {/* Shortened Wallet Address */}
//                 <p className="text-white text-sm font-medium">1A1Z6MEA...9uC</p>
//                 {/* Dropdown Arrow */}
//                 <DownOutlined className="text-white text-sm" />
//                 {/* User Avatar */}
//                 <Avatar 
//                   size="large" 
//                   src="https://avatars.githubusercontent.com/u/1?v=4" 
//                   className="border-2 border-purple-500"
//                 />
//               </div>
//             </Dropdown>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Header;




'use client';

import React, { useState } from 'react';
import { Avatar, Dropdown, Menu } from 'antd';
import { BellOutlined, DownOutlined, MenuOutlined } from '@ant-design/icons';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menu = (
    <Menu className="bg-[#1a1a2e] text-white">
      <Menu.Item key="1" className="hover:bg-[#262640]">Profile</Menu.Item>
      <Menu.Item key="2" className="hover:bg-[#262640]">Settings</Menu.Item>
      <Menu.Item key="3" className="hover:bg-[#262640]">Logout</Menu.Item>
    </Menu>
  );

  // Mobile menu component
  const MobileMenu = () => (
    <div className={`
      absolute top-full left-0 right-0 
      bg-[#1a1a2e] text-white
      border-t border-gray-800
      transition-all duration-300 ease-in-out
      ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
      lg:hidden z-50
    `}>
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-3 p-3">
          <Avatar 
            size="large" 
            src="https://avatars.githubusercontent.com/u/1?v=4" 
            className="border-2 border-purple-500"
          />
          <p className="text-sm font-medium">1A1Z6MEA...9uC</p>
        </div>
        <div className="border-t border-gray-800" />
        <div className="p-3 hover:bg-[#262640] rounded-lg">Profile</div>
        <div className="p-3 hover:bg-[#262640] rounded-lg">Settings</div>
        <div className="p-3 hover:bg-[#262640] rounded-lg">Logout</div>
      </div>
    </div>
  );

  return (
    <div className="relative flex justify-center bg-[#0A0014] items-center w-full">
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 rounded-lg shadow-md w-full max-w-screen-2xl">
        <div className="flex justify-between items-center">
          {/* Left - Welcome Message */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white">
            Transactions
          </h1>

          {/* Right - Icons and User Profile */}
          <div className="flex items-center">
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              <BellOutlined className="text-white text-2xl cursor-pointer hover:text-purple-400 transition" />
              
              <Dropdown overlay={menu} trigger={['click']}>
                <div className="flex items-center bg-[#1A0E2C] px-4 py-2 rounded-full space-x-3 cursor-pointer shadow-md hover:bg-[#2A1C44] transition">
                  <p className="text-white text-sm font-medium">1A1Z6MEA...9uC</p>
                  <DownOutlined className="text-white text-sm" />
                  <Avatar 
                    size="large" 
                    src="https://avatars.githubusercontent.com/u/1?v=4" 
                    className="border-2 border-purple-500"
                  />
                </div>
              </Dropdown>
            </div>

            {/* Mobile Navigation */}
            <div className="flex lg:hidden items-center space-x-4">
              <BellOutlined className="text-white text-xl cursor-pointer hover:text-purple-400 transition" />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center space-x-2 bg-[#1A0E2C] p-2 rounded-full cursor-pointer hover:bg-[#2A1C44] transition"
              >
                <Avatar 
                  size="small"
                  src="https://avatars.githubusercontent.com/u/1?v=4" 
                  className="border-2 border-purple-500"
                />
                <MenuOutlined className="text-white text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <MobileMenu />
    </div>
  );
};

export default Header;
