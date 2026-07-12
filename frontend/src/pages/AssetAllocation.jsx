import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  PieChart, Server, Monitor, Plus, Search, Filter, 
  Loader2, AlertCircle, X, Check, XCircle, RotateCcw, ArrowRightLeft, Clock
} from 'lucide-react';
import { AllocationsService } from '../services/allocations';
import { AssetsService } from '../services/assets';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

export default function AssetAllocation() {
  const location = useLocation();

  // Primary data states
  const [allocations, setAllocations] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  // UI state managers
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('checkouts'); // 'checkouts' | 'transfers'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState(''); // 'employee' | 'department'

  // Modals state
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form states
  const [allocateFormData, setAllocateFormData] = useState({
    asset_id: '',
    allocated_to_type: 'employee',
    allocated_to_id: '',
    expected_return_date: ''
  });

  const [returnFormData, setReturnFormData] = useState({
    condition_check_in_notes: ''
  });

  const [transferFormData, setTransferFormData] = useState({
    to_holder_type: 'employee',
    to_holder_id: ''
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

  // Load all baseline data
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [allocData, transData, assetsData, catData, employeesData, deptsData] = await Promise.all([
        AllocationsService.listAllocations({ limit: 1000 }),
        AllocationsService.listTransfers({ limit: 1000 }),
        AssetsService.listAssets({ limit: 1000 }),
        AssetsService.getCategories(),
        apiClient.get('/org/employees?limit=1000'),
        apiClient.get('/org/departments')
      ]);

      setAllocations(allocData.items || []);
      setTransfers(transData.items || []);
      setAssets(assetsData.items || []);
      setCategories(catData?.items || catData?.results || (Array.isArray(catData) ? catData : []));
      setEmployees(employeesData.data?.items || []);
      setDepartments(deptsData.data || []);
    } catch (err) {
      console.error('Failed to load allocations resources:', err);
      setError('Failed to retrieve allocations record datasets. Check database configurations.');
      toast.error('Error loading allocations data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reset pagination
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, typeFilter]);

  // Helper: Axios error details
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

  // Helper: Get Entity name maps
  const getAssetName = (assetId) => {
    const asset = assets.find(a => a.id === assetId);
    return asset ? asset.name : `Asset (${assetId.substring(0, 8)})`;
  };

  const getAssetTag = (assetId) => {
    const asset = assets.find(a => a.id === assetId);
    return asset ? (asset.asset_tag || asset.id.substring(0, 8)) : assetId.substring(0, 8);
  };

  const getHolderName = (holderType, holderId) => {
    if (holderType === 'employee') {
      const emp = employees.find(e => e.id === holderId);
      return emp ? emp.name : `Employee (${holderId.substring(0, 8)})`;
    } else {
      const dept = departments.find(d => d.id === holderId);
      return dept ? dept.name : `Department (${holderId.substring(0, 8)})`;
    }
  };

  const getEmployeeName = (empId) => {
    const emp = employees.find(e => e.id === empId);
    return emp ? emp.name : `User (${empId.substring(0, 8)})`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return <span className="text-outline font-medium italic">None Set</span>;
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  // Style helper allocation status
  const getAllocStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'returned':
        return 'bg-outline/10 text-outline border border-outline/20';
      case 'transferred':
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      default:
        return 'bg-surface-container text-on-surface-variant';
    }
  };

  const getTransferStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'requested':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'rejected':
        return 'bg-error/10 text-error border border-error/20';
      default:
        return 'bg-surface-container text-on-surface-variant';
    }
  };

  // Live Metric Calculators (Original UI preserved but dynamic!)
  const getDeptAllocationMetrics = () => {
    const deptCounts = {};
    let totalCount = 0;

    allocations.forEach(alloc => {
      if (alloc.status === 'active') {
        let deptName = 'Individual/Other';
        if (alloc.allocated_to_type === 'department') {
          const dept = departments.find(d => d.id === alloc.allocated_to_id);
          deptName = dept ? dept.name : 'Unknown Department';
        } else {
          const emp = employees.find(e => e.id === alloc.allocated_to_id);
          if (emp && emp.department_id) {
            const dept = departments.find(d => d.id === emp.department_id);
            deptName = dept ? dept.name : 'Unknown Department';
          } else {
            deptName = 'Unassigned Department';
          }
        }
        deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
        totalCount++;
      }
    });

    const list = Object.keys(deptCounts).map(deptName => {
      const count = deptCounts[deptName];
      const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
      return { department: deptName, count, percentage, color: 'bg-primary' };
    });

    list.sort((a, b) => b.count - a.count);
    const colors = ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-error', 'bg-outline'];
    return list.map((item, idx) => ({ ...item, color: colors[idx % colors.length] })).slice(0, 5);
  };

  const getCategoryMetrics = () => {
    const catCounts = {};
    let totalCount = 0;

    allocations.forEach(alloc => {
      if (alloc.status === 'active') {
        const asset = assets.find(a => a.id === alloc.asset_id);
        if (asset && asset.category_id) {
          const category = categories.find(c => c.id === asset.category_id);
          const catName = category ? (category.name || category.title) : 'Other';
          catCounts[catName] = (catCounts[catName] || 0) + 1;
          totalCount++;
        }
      }
    });

    const list = Object.keys(catCounts).map(catName => {
      const count = catCounts[catName];
      const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
      return { category: catName, count, percentage };
    });

    list.sort((a, b) => b.count - a.count);
    return list.slice(0, 4);
  };

  const activeDeptMetrics = getDeptAllocationMetrics();
  const activeCategoryMetrics = getCategoryMetrics();

  // Operations
  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    if (!allocateFormData.asset_id || !allocateFormData.allocated_to_id) {
      toast.error('Asset and recipient details are required');
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = {
        asset_id: allocateFormData.asset_id,
        allocated_to_type: allocateFormData.allocated_to_type,
        allocated_to_id: allocateFormData.allocated_to_id,
        expected_return_date: allocateFormData.expected_return_date || null
      };

      await AllocationsService.allocateAsset(payload);
      toast.success('Asset allocated successfully');
      setIsAllocateOpen(false);
      setAllocateFormData({
        asset_id: '',
        allocated_to_type: 'employee',
        allocated_to_id: '',
        expected_return_date: ''
      });
      loadData();
    } catch (err) {
      console.error('Allocation checkout error:', err);
      toast.error(getErrorMessage(err));
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const payload = {
        condition_check_in_notes: returnFormData.condition_check_in_notes.trim() || null
      };

      await AllocationsService.returnAsset(selectedAllocation.asset_id, payload);
      toast.success('Asset returned and checked in successfully');
      setIsReturnOpen(false);
      setReturnFormData({ condition_check_in_notes: '' });
      loadData();
    } catch (err) {
      console.error('Checkin return error:', err);
      toast.error(getErrorMessage(err));
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferFormData.to_holder_id) {
      toast.error('Please choose a recipient target');
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = {
        asset_id: selectedAllocation.asset_id,
        to_holder_type: transferFormData.to_holder_type,
        to_holder_id: transferFormData.to_holder_id
      };

      await AllocationsService.requestTransfer(payload);
      toast.success('Transfer request submitted successfully');
      setIsTransferOpen(false);
      setTransferFormData({ to_holder_type: 'employee', to_holder_id: '' });
      loadData();
    } catch (err) {
      console.error('Transfer request error:', err);
      toast.error(getErrorMessage(err));
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleResolveTransfer = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this asset transfer request?`)) {
      return;
    }
    try {
      await AllocationsService.resolveTransfer(id, status);
      toast.success(`Transfer request ${status}`);
      loadData();
    } catch (err) {
      console.error('Resolve transfer error:', err);
      toast.error(getErrorMessage(err));
    }
  };

  // Modals open triggers
  const openReturnModal = (alloc) => {
    setSelectedAllocation(alloc);
    setIsReturnOpen(true);
  };

  const openTransferModal = (alloc) => {
    setSelectedAllocation(alloc);
    setIsTransferOpen(true);
  };

  // Filter listings
  const filteredCheckouts = allocations.filter(a => {
    const assetName = getAssetName(a.asset_id).toLowerCase();
    const assetTag = getAssetTag(a.asset_id).toLowerCase();
    const holderName = getHolderName(a.allocated_to_type, a.allocated_to_id).toLowerCase();
    const search = searchQuery.toLowerCase();

    const matchesSearch = assetName.includes(search) || assetTag.includes(search) || holderName.includes(search);
    const matchesType = typeFilter ? a.allocated_to_type === typeFilter : true;
    
    return matchesSearch && matchesType;
  });

  const sortedCheckouts = [...filteredCheckouts].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    return new Date(b.allocated_at) - new Date(a.allocated_at);
  });

  const filteredTransfers = transfers.filter(t => {
    const assetName = getAssetName(t.asset_id).toLowerCase();
    const assetTag = getAssetTag(t.asset_id).toLowerCase();
    const requester = getEmployeeName(t.requested_by_id).toLowerCase();
    const search = searchQuery.toLowerCase();

    const matchesSearch = assetName.includes(search) || assetTag.includes(search) || requester.includes(search);
    const matchesStatus = typeFilter ? t.status === typeFilter : true;

    return matchesSearch && matchesStatus;
  });

  const sortedTransfers = [...filteredTransfers].sort((a, b) => {
    if (a.status === 'requested' && b.status !== 'requested') return -1;
    if (a.status !== 'requested' && b.status === 'requested') return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Client pagination
  const currentItems = activeTab === 'checkouts' ? sortedCheckouts : sortedTransfers;
  const totalPages = Math.ceil(currentItems.length / itemsPerPage);
  const paginatedItems = currentItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <nav className="flex gap-2 text-xs font-semibold text-on-surface-variant mb-2">
            <span>Enterprise</span>
            <span>/</span>
            <span className="text-primary font-bold">Allocation</span>
          </nav>
          <h1 className="text-2xl font-heading font-bold text-on-surface">Asset Allocation</h1>
          <p className="text-sm text-on-surface-variant mt-1 font-medium">
            Checkout physical assets to employees or departments, and process transfer request loops.
          </p>
        </div>
        {isAdminOrManager && (
          <button 
            onClick={() => setIsAllocateOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-container hover:text-on-primary-container shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Allocate Asset
          </button>
        )}
      </div>

      {/* KPI Row (Original preserved styled grids!) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metric 1 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-heading font-semibold mb-6 flex items-center gap-2 text-on-surface">
            <PieChart className="w-5 h-5 text-primary" />
            Allocation by Department
          </h2>
          <div className="space-y-4">
            {activeDeptMetrics.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1 font-semibold text-on-surface-variant">
                  <span className="font-medium text-on-surface">{item.department}</span>
                  <span>{item.percentage}% ({item.count} items)</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
            {activeDeptMetrics.length === 0 && (
              <div className="text-xs text-outline italic text-center py-6">No department checkouts active.</div>
            )}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-heading font-semibold mb-6 flex items-center gap-2 text-on-surface">
            <Server className="w-5 h-5 text-secondary" />
            Category Breakdown
          </h2>
          <div className="flex-1 flex flex-col justify-center space-y-3">
            {activeCategoryMetrics.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                <span className="text-sm font-semibold text-on-surface">{item.category}</span>
                <span className="text-xs bg-secondary-container text-secondary px-2.5 py-0.5 rounded-full font-bold">
                  {item.count} Active
                </span>
              </div>
            ))}
            {activeCategoryMetrics.length === 0 && (
              <div className="text-xs text-outline italic text-center py-6">No assets checked out currently.</div>
            )}
          </div>
        </div>
      </div>

      {/* Main List Container */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        {/* Search form & filters */}
        <div className="p-4 border-b border-outline-variant flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-surface-container-low">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by asset, tag, requester, holder..." 
              className="w-full pl-10 pr-4 py-2 bg-surface text-on-surface rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-xl border border-outline-variant">
              <Filter className="w-3.5 h-3.5 text-outline" />
              <span className="text-xs font-semibold text-on-surface-variant">Filter:</span>
            </div>

            {activeTab === 'checkouts' ? (
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold bg-surface text-on-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary outline-none"
              >
                <option value="">All Recipient Types</option>
                <option value="employee">Employee</option>
                <option value="department">Department</option>
              </select>
            ) : (
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold bg-surface text-on-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary outline-none"
              >
                <option value="">All Statuses</option>
                <option value="requested">Requested</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 bg-surface-container-lowest flex items-center gap-4 text-on-surface-variant text-sm border-b border-outline-variant">
          <button 
            onClick={() => setActiveTab('checkouts')}
            className={`flex items-center gap-2 font-semibold pb-4 -mb-[1px] cursor-pointer transition-colors ${
              activeTab === 'checkouts' 
                ? 'text-primary border-b-2 border-primary' 
                : 'hover:text-on-surface'
            }`}
          >
            <Clock className="w-4 h-4" /> 
            Active Checkouts
            {allocations.filter(a => a.status === 'active').length > 0 && (
              <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full ml-1 font-bold">
                {allocations.filter(a => a.status === 'active').length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('transfers')}
            className={`flex items-center gap-2 font-semibold pb-4 -mb-[1px] cursor-pointer transition-colors ${
              activeTab === 'transfers' 
                ? 'text-primary border-b-2 border-primary' 
                : 'hover:text-on-surface'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" /> 
            Transfer Requests
            {transfers.filter(t => t.status === 'requested').length > 0 && (
              <span className="bg-amber-500/10 text-amber-600 text-[10px] px-1.5 py-0.5 rounded-full ml-1 font-bold">
                {transfers.filter(t => t.status === 'requested').length}
              </span>
            )}
          </button>
        </div>

        {/* Dynamic Table List */}
        <div className="overflow-x-auto relative min-h-[300px]">
          {isLoading ? (
            <div className="absolute inset-0 bg-surface/50 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <span className="text-sm font-semibold text-on-surface-variant">Syncing records...</span>
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
                Retry
              </button>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center gap-4 min-h-[300px]">
              <AlertCircle className="w-12 h-12 text-outline" />
              <div>
                <h3 className="font-bold text-lg text-on-surface">No Records Found</h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  {searchQuery || typeFilter
                    ? 'No allocations match your selected filters.'
                    : activeTab === 'checkouts'
                      ? 'No active asset checkouts found.'
                      : 'No transfer requests recorded.'}
                </p>
              </div>
            </div>
          ) : activeTab === 'checkouts' ? (
            /* Active Checkouts Table */
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-surface-secondary text-xs uppercase tracking-wider text-on-surface-variant border-b border-outline-variant font-bold">
                  <th className="px-6 py-3.5 w-[20%]">Asset</th>
                  <th className="px-6 py-3.5">Asset Tag</th>
                  <th className="px-6 py-3.5 w-[20%]">Recipient</th>
                  <th className="px-6 py-3.5 w-[150px]">Recipient Type</th>
                  <th className="px-6 py-3.5 w-[150px]">Expected Return</th>
                  <th className="px-6 py-3.5 w-[120px]">Status</th>
                  <th className="px-6 py-3.5 text-right w-[160px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant bg-surface-container-lowest text-sm">
                {paginatedItems.map((a) => {
                  const assetName = getAssetName(a.asset_id);
                  const assetTag = getAssetTag(a.asset_id);
                  const holderName = getHolderName(a.allocated_to_type, a.allocated_to_id);

                  return (
                    <tr key={a.id} className="hover:bg-surface-container-low transition-colors align-middle">
                      <td className="px-6 py-4 font-semibold text-on-surface truncate" title={assetName}>
                        {assetName}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-primary truncate" title={assetTag}>
                        {assetTag}
                      </td>
                      <td className="px-6 py-4 font-semibold text-on-surface-variant truncate" title={holderName}>
                        {holderName}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-medium uppercase tracking-wider text-xs">
                        {a.allocated_to_type}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-medium whitespace-nowrap">
                        {formatDate(a.expected_return_date)}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${getAllocStatusStyle(a.status)}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {a.status === 'active' && (
                            <>
                              <button 
                                onClick={() => openTransferModal(a)}
                                title="Transfer Asset"
                                className="px-2.5 py-1.5 border border-outline text-primary border-primary hover:bg-primary-container/10 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" /> Transfer
                              </button>
                              {isAdminOrManager && (
                                <button 
                                  onClick={() => openReturnModal(a)}
                                  title="Return / Check In"
                                  className="px-2.5 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-container transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" /> Return
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            /* Transfer Requests Table */
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-surface-secondary text-xs uppercase tracking-wider text-on-surface-variant border-b border-outline-variant font-bold">
                  <th className="px-6 py-3.5 w-[20%]">Asset</th>
                  <th className="px-6 py-3.5 w-[150px]">Asset Tag</th>
                  <th className="px-6 py-3.5 w-[150px]">Requested By</th>
                  <th className="px-6 py-3.5 w-[20%]">Target Recipient</th>
                  <th className="px-6 py-3.5 w-[150px]">Recipient Type</th>
                  <th className="px-6 py-3.5 w-[120px]">Status</th>
                  {isAdminOrManager && <th className="px-6 py-3.5 text-right w-[150px]">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant bg-surface-container-lowest text-sm">
                {paginatedItems.map((t) => {
                  const assetName = getAssetName(t.asset_id);
                  const assetTag = getAssetTag(t.asset_id);
                  const requester = getEmployeeName(t.requested_by_id);
                  const newHolder = getHolderName(t.to_holder_type, t.to_holder_id);

                  return (
                    <tr key={t.id} className="hover:bg-surface-container-low transition-colors align-middle">
                      <td className="px-6 py-4 font-semibold text-on-surface truncate" title={assetName}>
                        {assetName}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-primary truncate" title={assetTag}>
                        {assetTag}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-semibold truncate" title={requester}>
                        {requester}
                      </td>
                      <td className="px-6 py-4 font-semibold text-on-surface-variant truncate" title={newHolder}>
                        {newHolder}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-medium uppercase tracking-wider text-xs">
                        {t.to_holder_type}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${getTransferStatusStyle(t.status)}`}>
                          {t.status}
                        </span>
                      </td>
                      {isAdminOrManager && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {t.status === 'requested' && (
                              <>
                                <button 
                                  onClick={() => handleResolveTransfer(t.id, 'approved')}
                                  title="Approve Transfer"
                                  className="p-1 hover:bg-emerald-500/10 text-emerald-500 hover:text-emerald-600 rounded-lg transition-colors cursor-pointer inline-flex"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleResolveTransfer(t.id, 'rejected')}
                                  title="Reject Transfer"
                                  className="p-1 hover:bg-error-container/10 text-error hover:text-error rounded-lg transition-colors cursor-pointer inline-flex"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
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

        {/* Pagination */}
        {!isLoading && currentItems.length > itemsPerPage && (
          <div className="p-4 border-t border-outline-variant flex items-center justify-between text-xs font-bold text-on-surface-variant bg-surface-container-low">
            <div>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, currentItems.length)} of {currentItems.length} entries
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
                disabled={currentPage * itemsPerPage >= currentItems.length}
                className="px-3.5 py-1.5 border border-outline-variant rounded-xl bg-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-on-surface"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ALLOCATE ASSET (CHECKOUT) MODAL */}
      {isAllocateOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-sans">
            <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div>
                <h3 className="font-bold text-xl font-heading text-on-surface">Allocate Asset Tag</h3>
                <p className="text-xs font-semibold text-on-surface-variant mt-1">Assign available resources directly to employees or departments.</p>
              </div>
              <button 
                className="p-2 hover:bg-surface-variant rounded-full transition-colors cursor-pointer" 
                onClick={() => setIsAllocateOpen(false)}
              >
                <X className="w-5 h-5 text-on-surface" />
              </button>
            </div>
            
            <form className="p-6 overflow-y-auto space-y-5 flex-1" onSubmit={handleAllocateSubmit}>
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">Select Asset *</label>
                <select 
                  required
                  value={allocateFormData.asset_id}
                  onChange={(e) => setAllocateFormData({...allocateFormData, asset_id: e.target.value})}
                  className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                >
                  <option value="" disabled>Select Available Asset</option>
                  {assets.filter(a => a.status === 'available').map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.asset_tag || a.id.substring(0,8)})</option>
                  ))}
                </select>
                {assets.filter(a => a.status === 'available').length === 0 && (
                  <p className="text-[10px] text-tertiary font-bold mt-1">No available assets currently in repository.</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Recipient Type *</label>
                  <select 
                    value={allocateFormData.allocated_to_type}
                    onChange={(e) => setAllocateFormData({
                      ...allocateFormData, 
                      allocated_to_type: e.target.value,
                      allocated_to_id: '' // reset selection
                    })}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  >
                    <option value="employee">Employee</option>
                    <option value="department">Department</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Recipient *</label>
                  {allocateFormData.allocated_to_type === 'employee' ? (
                    <select 
                      required
                      value={allocateFormData.allocated_to_id}
                      onChange={(e) => setAllocateFormData({...allocateFormData, allocated_to_id: e.target.value})}
                      className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                    >
                      <option value="" disabled>Select Recipient User</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                      ))}
                    </select>
                  ) : (
                    <select 
                      required
                      value={allocateFormData.allocated_to_id}
                      onChange={(e) => setAllocateFormData({...allocateFormData, allocated_to_id: e.target.value})}
                      className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                    >
                      <option value="" disabled>Select Recipient Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">Expected Return Date (Optional)</label>
                <input 
                  type="date" 
                  value={allocateFormData.expected_return_date}
                  onChange={(e) => setAllocateFormData({...allocateFormData, expected_return_date: e.target.value})}
                  className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                <button 
                  type="button"
                  onClick={() => setIsAllocateOpen(false)}
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
                  Confirm Checkout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RETURN ASSET MODAL */}
      {isReturnOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans">
            <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div>
                <h3 className="font-bold text-lg font-heading text-on-surface">Process Return</h3>
                <p className="text-xs font-semibold text-on-surface-variant mt-1">Check in asset and record current condition details.</p>
              </div>
              <button 
                className="p-2 hover:bg-surface-variant rounded-full transition-colors cursor-pointer" 
                onClick={() => setIsReturnOpen(false)}
              >
                <X className="w-5 h-5 text-on-surface" />
              </button>
            </div>
            
            <form className="p-6 space-y-4" onSubmit={handleReturnSubmit}>
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  Check-in Asset: <strong className="text-primary font-bold">{selectedAllocation && getAssetName(selectedAllocation.asset_id)}</strong>
                </p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Currently checked out to: {selectedAllocation && getHolderName(selectedAllocation.allocated_to_type, selectedAllocation.allocated_to_id)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">Check-in Condition Notes (Optional)</label>
                <textarea 
                  value={returnFormData.condition_check_in_notes}
                  onChange={(e) => setReturnFormData({ condition_check_in_notes: e.target.value })}
                  placeholder="e.g. Returned clean, screen intact, battery charging normally."
                  rows={3}
                  className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                <button 
                  type="button"
                  onClick={() => setIsReturnOpen(false)}
                  className="px-4 py-2 border border-outline-variant text-on-surface rounded-xl hover:bg-surface-container text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={formSubmitting}
                  className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REQUEST TRANSFER MODAL */}
      {isTransferOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans">
            <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div>
                <h3 className="font-bold text-lg font-heading text-on-surface">Request Transfer</h3>
                <p className="text-xs font-semibold text-on-surface-variant mt-1">Initiate a transfer request for this allocated asset.</p>
              </div>
              <button 
                className="p-2 hover:bg-surface-variant rounded-full transition-colors cursor-pointer" 
                onClick={() => setIsTransferOpen(false)}
              >
                <X className="w-5 h-5 text-on-surface" />
              </button>
            </div>
            
            <form className="p-6 space-y-4" onSubmit={handleTransferSubmit}>
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  Transfer Asset: <strong className="text-primary font-bold">{selectedAllocation && getAssetName(selectedAllocation.asset_id)}</strong>
                </p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Current Owner: {selectedAllocation && getHolderName(selectedAllocation.allocated_to_type, selectedAllocation.allocated_to_id)}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Target Recipient Type *</label>
                  <select 
                    value={transferFormData.to_holder_type}
                    onChange={(e) => setTransferFormData({
                      ...transferFormData, 
                      to_holder_type: e.target.value,
                      to_holder_id: '' // reset selection
                    })}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  >
                    <option value="employee">Employee</option>
                    <option value="department">Department</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Target Recipient *</label>
                  {transferFormData.to_holder_type === 'employee' ? (
                    <select 
                      required
                      value={transferFormData.to_holder_id}
                      onChange={(e) => setTransferFormData({...transferFormData, to_holder_id: e.target.value})}
                      className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                    >
                      <option value="" disabled>Select Target User</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                      ))}
                    </select>
                  ) : (
                    <select 
                      required
                      value={transferFormData.to_holder_id}
                      onChange={(e) => setTransferFormData({...transferFormData, to_holder_id: e.target.value})}
                      className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                    >
                      <option value="" disabled>Select Target Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                <button 
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="px-4 py-2 border border-outline-variant text-on-surface rounded-xl hover:bg-surface-container text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={formSubmitting}
                  className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Request Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
