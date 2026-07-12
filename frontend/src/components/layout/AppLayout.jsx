import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  return (
    <div className="bg-surface text-on-surface overflow-hidden font-sans">
      <Sidebar />
      <main className="ml-[260px] h-screen flex flex-col overflow-y-auto bg-background relative">
        <Topbar />
        <div className="p-8 space-y-6 max-w-[1440px] mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
