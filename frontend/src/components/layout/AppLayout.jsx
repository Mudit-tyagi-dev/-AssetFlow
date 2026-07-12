import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { apiClient } from '../../api/client';
import { jwtDecode } from 'jwt-decode';

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
  const [user, setUser] = useState(null);
  const location = useLocation();

  // Close sidebar on route change (mobile UX)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Fetch current user using existing API
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        
        const decoded = jwtDecode(token);
        const userId = decoded.user_id;

        // Fetch all employees in org and find the logged in user
        const res = await apiClient.get('/org/employees');
        const employees = res.data.items || [];
        const currentUser = employees.find(emp => emp.id === userId);
        
        if (currentUser) {
          setUser(currentUser);
        } else {
          setUser({ name: 'User' });
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setUser({ name: 'User' });
      }
    };
    fetchUser();
  }, []);

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
        <Topbar role={role} user={user} onMenuClick={() => setIsSidebarOpen(true)} />
        <div className="p-4 lg:p-8 space-y-6 max-w-[1440px] mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
