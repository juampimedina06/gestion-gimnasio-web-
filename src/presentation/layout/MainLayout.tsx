import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col lg:flex-row relative selection:bg-volt selection:text-black overflow-x-hidden">
      {/* Gym Atmospheric Background (Subtle glow & grid) */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(204,255,0,0.035),transparent)] z-0" />
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem] z-0" />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

