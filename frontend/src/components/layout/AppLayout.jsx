import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export function AdminLayout() {
  return <LayoutShell role="Admin" basePath="/admin" />;
}

export function AssetManagerLayout() {
  return <LayoutShell role="Asset Manager" basePath="/manager" />;
}

export function DepartmentHeadLayout() {
  return <LayoutShell role="Department Head" basePath="/head" />;
}

export function EmployeeLayout() {
  return <LayoutShell role="Employee" basePath="/user" />;
}

function LayoutShell({ role, basePath }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (mobile UX)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="bg-surface text-on-surface overflow-hidden font-sans flex h-screen">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <Sidebar 
        role={role} 
        basePath={basePath} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-background relative w-full lg:ml-[260px]">
        <Topbar role={role} onMenuClick={() => setIsSidebarOpen(true)} />
        <div className="p-4 lg:p-8 space-y-6 max-w-[1440px] mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
