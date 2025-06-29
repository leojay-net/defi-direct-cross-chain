'use client';

import React, { useState } from 'react';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Siderbar';
import { AuthGuard } from '@/components/auth/AuthGuard';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <AuthGuard>
            <div className="flex h-screen bg-[#0A0014]">
                <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header
                        isMobileMenuOpen={isMobileMenuOpen}
                        setIsMobileMenuOpen={setIsMobileMenuOpen}
                    />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#0A0014]">
                        {children}
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
};

export default Layout; 