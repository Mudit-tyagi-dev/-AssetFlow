import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Wrench, CheckCircle2, Clock, Plus, Search, Filter, 
  Loader2, AlertCircle, X, Check, XCircle, User, Hammer
} from 'lucide-react';
import { MaintenanceService } from '../services/maintenance';
import { AssetsService } from '../services/assets';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

export default function Maintenance() {
  const location = useLocation();

  // State variables
  const [requests, setRequests] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search, Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'resolved'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form states
  const [createFormData, setCreateFormData] = useState({
    asset_id: '',
    issue_description: '',
    priority: 'medium',
    photo_url: ''
  });

  const [assignFormData, setAssignFormData] = useState({
    technician_name: '',
    status: 'technician_assigned'
  });

  // Determine user basePath (admin, manager, head, user)
  const getBasePath = () => {
    if (location.pathname.startsWith('/admin')) return '/admin';
    if (location.pathname.startsWith('/manager')) return '/manager';
    if (location.pathname.startsWith('/head')) return '/head';
    if (location.pathname.startsWith('/user')) return '/user';
    return '/user';
  };

  const basePath = getBasePath();
  const isAdminOrManager = basePath === '/admin' || basePath === '/manager';

  // Load all data on mount
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [maintData, assetsData, employeesData] = await Promise.all([
        MaintenanceService.listRequests({ limit: 1000 }),
        AssetsService.listAssets({ limit: 1000 }),
        apiClient.get('/org/employees?limit=1000')
      ]);

      setRequests(maintData.items || []);
      setAssets(assetsData.items || []);
      setEmployees(employeesData.data?.items || []);
    } catch (err) {
      console.error('Failed to load maintenance data:', err);
      setError('Failed to load maintenance records. Please check your network or server connection.');
      toast.error('Error loading page data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reset pagination on tab/filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, priorityFilter]);

  // Helper: Get Axios error message
  const getErrorMessage = (error) => {
    if (error.response?.data?.detail) {
      if (typeof error.response.data.detail === 'string') {
        return error.response.data.detail;
      }
      if (Array.isArray(error.response.data.detail) && error.response.data.detail[0]?.msg) {
        return error.response.data.detail[0].msg;
      }
    }
    return error.message || 'An unexpected error occurred';
  };

  // Helper: Resolve asset names
  const getAssetName = (assetId) => {
    const asset = assets.find(a => a.id === assetId);
    return asset ? asset.name : `Asset (${assetId.substring(0, 8)})`;
  };

  const getAssetTag = (assetId) => {
    const asset = assets.find(a => a.id === assetId);
    return asset ? (asset.asset_tag || asset.id.substring(0, 8)) : assetId.substring(0, 8);
  };

  // Helper: Resolve employee names
  const getEmployeeName = (employeeId) => {
    const emp = employees.find(e => e.id === employeeId);
    return emp ? emp.name : `User (${employeeId.substring(0, 8)})`;
  };

  // Helper: Format Date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Style helper: Status
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'approved':
        return 'bg-primary/10 text-primary border border-primary/20';
      case 'technician_assigned':
        return 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20';
      case 'in_progress':
        return 'bg-tertiary/10 text-tertiary border border-tertiary/20';
      case 'resolved':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'rejected':
        return 'bg-error/10 text-error border border-error/20';
      default:
        return 'bg-surface-container text-on-surface-variant border border-outline-variant';
    }
  };

  const formatStatus = (status) => {
    if (!status) return '';
    return status.replace(/_/g, ' ');
  };

  // Style helper: Priority
  const getPriorityStyle = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'low':
        return 'bg-surface-container text-on-surface-variant';
      case 'medium':
        return 'bg-blue-500/10 text-blue-500';
      case 'high':
        return 'bg-orange-500/10 text-orange-500';
      case 'critical':
        return 'bg-error/10 text-error font-bold';
      default:
        return 'bg-surface-container text-on-surface-variant';
    }
  };

  // Handlers
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createFormData.asset_id) {
      toast.error('Please select an asset');
      return;
    }
    if (createFormData.issue_description.trim().length < 5) {
      toast.error('Issue description must be at least 5 characters');
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = {
        asset_id: createFormData.asset_id,
        issue_description: createFormData.issue_description.trim(),
        priority: createFormData.priority,
        photo_url: createFormData.photo_url.trim() || null
      };

      await MaintenanceService.raiseRequest(payload);
      toast.success('Maintenance request raised successfully');
      setIsCreateOpen(false);
      // Reset form
      setCreateFormData({ asset_id: '', issue_description: '', priority: 'medium', photo_url: '' });
      loadData();
    } catch (err) {
      console.error('Failed to raise request:', err);
      toast.error(getErrorMessage(err));
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await MaintenanceService.approveRequest(id);
      toast.success('Request approved successfully');
      loadData();
    } catch (err) {
      console.error('Failed to approve request:', err);
      toast.error(getErrorMessage(err));
    }
  };

  const handleReject = async (id) => {
    try {
      await MaintenanceService.rejectRequest(id);
      toast.success('Request rejected successfully');
      loadData();
    } catch (err) {
      console.error('Failed to reject request:', err);
      toast.error(getErrorMessage(err));
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const payload = {
        technician_name: assignFormData.technician_name.trim() || null,
        status: assignFormData.status
      };

      await MaintenanceService.assignTechnician(selectedRequest.id, payload);
      toast.success('Technician assigned successfully');
      setIsAssignOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to assign technician:', err);
      toast.error(getErrorMessage(err));
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleResolve = async (id) => {
    if (!window.confirm('Are you sure you want to mark this request as resolved? The asset status will return to Available.')) {
      return;
    }
    try {
      await MaintenanceService.resolveRequest(id);
      toast.success('Request marked as resolved');
      loadData();
    } catch (err) {
      console.error('Failed to resolve request:', err);
      toast.error(getErrorMessage(err));
    }
  };

  // Open modals helper
  const openAssignModal = (req) => {
    setSelectedRequest(req);
    setAssignFormData({
      technician_name: req.technician_name || '',
      status: req.status === 'approved' ? 'technician_assigned' : req.status
    });
    setIsAssignOpen(true);
  };

  // Filter requests
  const filteredRequests = requests.filter(r => {
    const assetName = getAssetName(r.asset_id).toLowerCase();
    const assetTag = getAssetTag(r.asset_id).toLowerCase();
    const id = r.id.toLowerCase();
    const technician = (r.technician_name || '').toLowerCase();
    const description = r.issue_description.toLowerCase();
    const search = searchQuery.toLowerCase();
    
    const matchesSearch = assetName.includes(search) || assetTag.includes(search) || id.includes(search) || technician.includes(search) || description.includes(search);
    const matchesPriority = priorityFilter ? r.priority === priorityFilter : true;
    
    // Tab filter
    // Active: pending, approved, technician_assigned, in_progress
    // Resolved/Rejected: resolved, rejected
    const matchesTab = activeTab === 'active'
      ? ['pending', 'approved', 'technician_assigned', 'in_progress'].includes(r.status)
      : ['resolved', 'rejected'].includes(r.status);

    return matchesSearch && matchesPriority && matchesTab;
  });

  // Sort: Active pending first, then by date desc
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Client-side pagination
  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage);
  const paginatedRequests = sortedRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <nav className="flex gap-2 text-xs font-semibold text-on-surface-variant mb-2">
            <span>Enterprise</span>
            <span>/</span>
            <span className="text-primary font-bold">Maintenance</span>
          </nav>
          <h1 className="text-2xl font-heading font-bold text-on-surface">Maintenance Requests</h1>
          <p className="text-sm text-on-surface-variant mt-1 font-medium">
            Monitor, raise, approve, and resolve maintenance tickets for organizational assets.
          </p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-container hover:text-on-primary-container shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Raise Request
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        {/* Search & Filter bar */}
        <div className="p-4 border-b border-outline-variant flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-surface-container-low">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by asset, technician, ID, or description..." 
              className="w-full pl-10 pr-4 py-2 bg-surface text-on-surface rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-xl border border-outline-variant">
              <Filter className="w-3.5 h-3.5 text-outline" />
              <span className="text-xs font-semibold text-on-surface-variant">Filter By:</span>
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-surface text-on-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary outline-none"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="px-6 pt-4 bg-surface-container-lowest flex items-center gap-4 text-on-surface-variant text-sm border-b border-outline-variant">
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 font-semibold pb-4 -mb-[1px] cursor-pointer transition-colors ${
              activeTab === 'active' 
                ? 'text-primary border-b-2 border-primary' 
                : 'hover:text-on-surface'
            }`}
          >
            <Clock className="w-4 h-4" /> 
            Active Tickets
            {requests.filter(r => ['pending', 'approved', 'technician_assigned', 'in_progress'].includes(r.status)).length > 0 && (
              <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full ml-1 font-bold">
                {requests.filter(r => ['pending', 'approved', 'technician_assigned', 'in_progress'].includes(r.status)).length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('resolved')}
            className={`flex items-center gap-2 font-semibold pb-4 -mb-[1px] cursor-pointer transition-colors ${
              activeTab === 'resolved' 
                ? 'text-primary border-b-2 border-primary' 
                : 'hover:text-on-surface'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" /> 
            Resolved & Rejected
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-x-auto relative min-h-[300px]">
          {isLoading ? (
            <div className="absolute inset-0 bg-surface/50 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <span className="text-sm font-semibold text-on-surface-variant">Loading records...</span>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-4">
              <AlertCircle className="w-12 h-12 text-error" />
              <div>
                <h3 className="font-bold text-lg text-on-surface">Failed to Load Records</h3>
                <p className="text-sm text-on-surface-variant mt-1">{error}</p>
              </div>
              <button 
                onClick={loadData}
                className="px-4 py-2 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer"
              >
                Retry Request
              </button>
            </div>
          ) : sortedRequests.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-4">
              <Wrench className="w-12 h-12 text-outline" />
              <div>
                <h3 className="font-bold text-lg text-on-surface">No Requests Found</h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  {searchQuery || priorityFilter
                    ? 'No requests match your current search filters.'
                    : activeTab === 'active'
                      ? 'No active maintenance requests exist currently.'
                      : 'There are no resolved or rejected request records.'}
                </p>
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-surface-secondary text-xs uppercase tracking-wider text-on-surface-variant border-b border-outline-variant">
                  <th className="px-6 py-3.5 font-bold w-[110px]">ID</th>
                  <th className="px-6 py-3.5 font-bold w-[20%]">Asset</th>
                  <th className="px-6 py-3.5 font-bold w-[30%]">Issue Description</th>
                  <th className="px-6 py-3.5 font-bold w-[100px]">Priority</th>
                  <th className="px-6 py-3.5 font-bold w-[140px]">Raised By</th>
                  <th className="px-6 py-3.5 font-bold w-[150px]">Technician</th>
                  <th className="px-6 py-3.5 font-bold w-[120px]">Date</th>
                  <th className="px-6 py-3.5 font-bold w-[130px]">Status</th>
                  {isAdminOrManager && <th className="px-6 py-3.5 font-bold text-right w-[180px]">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
                {paginatedRequests.map((r) => {
                  const assetName = getAssetName(r.asset_id);
                  const assetTag = getAssetTag(r.asset_id);
                  const raisedByName = getEmployeeName(r.raised_by_id);

                  return (
                    <tr key={r.id} className="hover:bg-surface-container-low transition-colors align-middle text-sm">
                      <td className="px-6 py-4 font-mono font-bold text-primary truncate" title={r.id}>
                        {r.id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-on-surface truncate" title={assetName}>
                        <div className="flex flex-col">
                          <span>{assetName}</span>
                          <span className="text-[10px] text-on-surface-variant font-mono font-bold">Tag: {assetTag}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-medium truncate" title={r.issue_description}>
                        {r.issue_description}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wider ${getPriorityStyle(r.priority)}`}>
                          {r.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-semibold truncate" title={raisedByName}>
                        {raisedByName}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-semibold truncate" title={r.technician_name || 'Unassigned'}>
                        {r.technician_name || <span className="text-outline font-medium italic">Unassigned</span>}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-medium whitespace-nowrap">
                        {formatDate(r.created_at)}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${getStatusStyle(r.status)}`}>
                          {formatStatus(r.status)}
                        </span>
                      </td>
                      {isAdminOrManager && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {r.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleApprove(r.id)}
                                  title="Approve Maintenance"
                                  className="p-1 hover:bg-emerald-500/10 text-emerald-500 hover:text-emerald-600 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleReject(r.id)}
                                  title="Reject Maintenance"
                                  className="p-1 hover:bg-error-container/10 text-error hover:text-error rounded-lg transition-colors cursor-pointer"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {['approved', 'technician_assigned', 'in_progress'].includes(r.status) && (
                              <button 
                                onClick={() => openAssignModal(r)}
                                title="Assign Technician / Status"
                                className="p-1 hover:bg-primary/10 text-primary hover:text-primary-container rounded-lg transition-colors cursor-pointer"
                              >
                                <User className="w-4 h-4" />
                              </button>
                            )}
                            {['technician_assigned', 'in_progress'].includes(r.status) && (
                              <button 
                                onClick={() => handleResolve(r.id)}
                                title="Mark Resolved"
                                className="p-1 hover:bg-emerald-500/10 text-emerald-500 hover:text-emerald-600 rounded-lg transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination controls */}
        {!isLoading && !error && sortedRequests.length > itemsPerPage && (
          <div className="p-4 border-t border-outline-variant flex items-center justify-between text-xs font-bold text-on-surface-variant bg-surface-container-low">
            <div>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedRequests.length)} of {sortedRequests.length} entries
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 border border-outline-variant rounded-xl bg-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-on-surface"
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage * itemsPerPage >= sortedRequests.length}
                className="px-3.5 py-1.5 border border-outline-variant rounded-xl bg-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-on-surface"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RAISE MAINTENANCE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-sans">
            <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div>
                <h3 className="font-bold text-xl font-heading text-on-surface">Raise Maintenance Request</h3>
                <p className="text-xs font-semibold text-on-surface-variant mt-1">Report asset hardware faults or scheduled upkeep.</p>
              </div>
              <button 
                className="p-2 hover:bg-surface-variant rounded-full transition-colors cursor-pointer" 
                onClick={() => setIsCreateOpen(false)}
              >
                <X className="w-5 h-5 text-on-surface" />
              </button>
            </div>
            
            <form className="p-6 overflow-y-auto space-y-5 flex-1" onSubmit={handleCreateSubmit}>
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">Select Asset *</label>
                <select 
                  required
                  value={createFormData.asset_id}
                  onChange={(e) => setCreateFormData({...createFormData, asset_id: e.target.value})}
                  className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                >
                  <option value="" disabled>Select Asset</option>
                  {assets.filter(a => a.status !== 'retired' && a.status !== 'disposed').map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.asset_tag || a.id.substring(0,8)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">Priority *</label>
                <select 
                  value={createFormData.priority}
                  onChange={(e) => setCreateFormData({...createFormData, priority: e.target.value})}
                  className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">Issue Description * (Minimum 5 characters)</label>
                <textarea 
                  required
                  minLength={5}
                  value={createFormData.issue_description}
                  onChange={(e) => setCreateFormData({...createFormData, issue_description: e.target.value})}
                  placeholder="Provide precise details of the issue..."
                  rows={4}
                  className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">Photo URL (Optional)</label>
                <input 
                  type="url" 
                  value={createFormData.photo_url}
                  onChange={(e) => setCreateFormData({...createFormData, photo_url: e.target.value})}
                  placeholder="https://example.com/asset-photo.jpg"
                  className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                <button 
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-5 py-2.5 border border-outline-variant text-on-surface rounded-xl hover:bg-surface-container text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={formSubmitting}
                  className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN TECHNICIAN MODAL */}
      {isAssignOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans">
            <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div>
                <h3 className="font-bold text-xl font-heading text-on-surface">Assign Technician</h3>
                <p className="text-xs font-semibold text-on-surface-variant mt-1">Assign work details to standard technicians.</p>
              </div>
              <button 
                className="p-2 hover:bg-surface-variant rounded-full transition-colors cursor-pointer" 
                onClick={() => setIsAssignOpen(false)}
              >
                <X className="w-5 h-5 text-on-surface" />
              </button>
            </div>
            
            <form className="p-6 space-y-5" onSubmit={handleAssignSubmit}>
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">Technician Name *</label>
                <input 
                  required
                  type="text" 
                  value={assignFormData.technician_name}
                  onChange={(e) => setAssignFormData({...assignFormData, technician_name: e.target.value})}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">Work Status *</label>
                <select 
                  value={assignFormData.status}
                  onChange={(e) => setAssignFormData({...assignFormData, status: e.target.value})}
                  className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                >
                  <option value="technician_assigned">Technician Assigned</option>
                  <option value="in_progress">In Progress</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                <button 
                  type="button"
                  onClick={() => setIsAssignOpen(false)}
                  className="px-5 py-2.5 border border-outline-variant text-on-surface rounded-xl hover:bg-surface-container text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={formSubmitting}
                  className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Assign Work
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
