import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import AssetManagement from './pages/AssetManagement';
import AssetAllocation from './pages/AssetAllocation';
import AssetCategories from './pages/AssetCategories';
import AssetDetails from './pages/AssetDetails';
import Notifications from './pages/Notifications';
import ResourceBooking from './pages/ResourceBooking';
import EmployeeDirectory from './pages/EmployeeDirectory';
import Maintenance from './pages/Maintenance';
import DepartmentManagement from './pages/DepartmentManagement';
import Audit from './pages/Audit';
import Reports from './pages/Reports';
import Signup from './pages/Signup';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/assets" element={<AssetManagement />} />
          <Route path="/allocation" element={<AssetAllocation />} />
          <Route path="/categories" element={<AssetCategories />} />
          <Route path="/asset/:id" element={<AssetDetails />} />
          <Route path="/notifications" element={<Notifications />} />
          
          <Route path="/booking" element={<ResourceBooking />} />
          <Route path="/employees" element={<EmployeeDirectory />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/departments" element={<DepartmentManagement />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
