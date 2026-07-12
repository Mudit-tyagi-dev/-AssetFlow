import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { 
  AdminLayout, 
  AssetManagerLayout, 
  DepartmentHeadLayout, 
  EmployeeLayout 
} from './components/layout/AppLayout';

import Dashboard from './pages/Dashboard';
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
import Login from './pages/Login';
import Signup from './pages/Signup';
import RegisterOrg from './pages/RegisterOrg';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OrganizationSetup from './pages/OrganizationSetup';
import NotFound from './pages/NotFound';

function App() {
  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{ className: 'font-sans text-sm font-semibold', duration: 3000 }} 
        containerStyle={{ zIndex: 99999 }}
      />
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/register-org" element={<RegisterOrg />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/organization-setup" element={<OrganizationSetup />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="departments" element={<DepartmentManagement />} />
          <Route path="assets" element={<AssetManagement />} />
          <Route path="categories" element={<AssetCategories />} />
          <Route path="allocation" element={<AssetAllocation />} />
          <Route path="booking" element={<ResourceBooking />} />
          <Route path="employees" element={<EmployeeDirectory />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="audit" element={<Audit />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="asset/:id" element={<AssetDetails />} />
        </Route>

        {/* Asset Manager Routes */}
        <Route path="/manager" element={<AssetManagerLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="assets" element={<AssetManagement />} />
          <Route path="allocation" element={<AssetAllocation />} />
          <Route path="booking" element={<ResourceBooking />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="audit" element={<Audit />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="asset/:id" element={<AssetDetails />} />
        </Route>

        {/* Department Head Routes */}
        <Route path="/head" element={<DepartmentHeadLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="assets" element={<AssetManagement />} />
          <Route path="allocation" element={<AssetAllocation />} />
          <Route path="booking" element={<ResourceBooking />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="asset/:id" element={<AssetDetails />} />
        </Route>

        {/* Employee Routes */}
        <Route path="/user" element={<EmployeeLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="assets" element={<AssetManagement />} />
          <Route path="allocation" element={<AssetAllocation />} />
          <Route path="booking" element={<ResourceBooking />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="asset/:id" element={<AssetDetails />} />
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
