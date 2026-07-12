import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Filter, MoreVertical, 
  Loader2, Edit, Trash2, Eye, 
  FileText, X, Upload, Check, AlertCircle 
} from 'lucide-react';
import { AssetsService } from '../services/assets';
import toast from 'react-hot-toast';

export default function AssetManagement() {
  const location = useLocation();
  const navigate = useNavigate();

  // State variables
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search, Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [limit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Form states
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    serial_number: '',
    acquisition_date: '',
    acquisition_cost: '',
    condition: 'good',
    location: '',
    is_bookable: false,
    status: 'available'
  });

  // File Upload State
  const [photoFile, setPhotoFile] = useState(null);
  const [docFile, setDocFile] = useState(null);

  // Dropdown menus state
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  // Determine user basePath (admin, manager, head, user)
  const getBasePath = () => {
    if (location.pathname.startsWith('/admin')) return '/admin';
    if (location.pathname.startsWith('/manager')) return '/manager';
    if (location.pathname.startsWith('/head')) return '/head';
    if (location.pathname.startsWith('/user')) return '/user';
    return '/user';
  };

  const basePath = getBasePath();

  // Load Categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await AssetsService.getCategories();
        const list = data?.items || data?.results || (Array.isArray(data) ? data : []);
        setCategories(list);
      } catch (err) {
        console.error('Failed to load categories', err);
        // Do not set mock categories; let it be empty
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Close active menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load Assets when dependencies change
  const loadAssets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const offset = (currentPage - 1) * limit;
      const params = {
        limit,
        offset,
        search: searchQuery || undefined,
        category_id: selectedCategory || undefined,
        status: selectedStatus || undefined
      };

      const response = await AssetsService.listAssets(params);
      const items = response?.items || response?.results || (Array.isArray(response) ? response : []);
      const total = response?.total ?? response?.count ?? items.length;

      setAssets(items);
      setTotalItems(total);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
      setError('Failed to fetch assets. Please check your credentials or API connection.');
      toast.error('Error fetching assets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [currentPage, selectedCategory, selectedStatus]);

  // Handle Search submit
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadAssets();
  };

  // Status Style Helper
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
      case 'active':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'allocated':
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'under_maintenance':
      case 'in repair':
      case 'maintenance':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'retired':
      case 'lost':
      case 'disposed':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      default:
        return 'bg-surface-container-high text-on-surface-variant border border-outline-variant';
    }
  };

  // Translate status to human readable
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Get category name from ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? (category.name || category.title) : 'Uncategorized';
  };

  // Open modals helper
  const openAddModal = () => {
    setFormData({
      name: '',
      category_id: categories[0]?.id || '',
      serial_number: '',
      acquisition_date: '',
      acquisition_cost: '',
      condition: 'good',
      location: '',
      is_bookable: false,
      status: 'available'
    });
    setPhotoFile(null);
    setDocFile(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (asset) => {
    setFormData({
      name: asset.name || '',
      category_id: asset.category_id || '',
      serial_number: asset.serial_number || '',
      acquisition_date: asset.acquisition_date ? asset.acquisition_date.substring(0, 10) : '',
      acquisition_cost: asset.acquisition_cost || '',
      condition: asset.condition || 'good',
      location: asset.location || '',
      is_bookable: !!asset.is_bookable,
      status: asset.status || 'available'
    });
    setSelectedAsset(asset);
    setPhotoFile(null);
    setDocFile(null);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (asset) => {
    setSelectedAsset(asset);
    setIsDeleteModalOpen(true);
  };

  // File Upload Helper
  const handleFileUpload = async (file) => {
    if (!file) return null;
    try {
      // Get Presigned URL
      const presignedData = await AssetsService.getPresignedUrl(file.name, file.type);
      const uploadUrl = presignedData.upload_url || presignedData.url;
      const fileUrl = presignedData.file_url || (uploadUrl ? uploadUrl.split('?')[0] : null);

      if (!uploadUrl) {
        throw new Error('No upload URL returned from server');
      }

      // Upload file directly using the presigned URL
      await AssetsService.uploadFileToPresignedUrl(uploadUrl, file);
      return fileUrl;
    } catch (err) {
      console.error('File upload failed for ' + file.name, err);
      toast.error('Failed to upload file: ' + file.name);
      return null;
    }
  };

  // Submit Create Asset Form
  const handleCreateAsset = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category_id) {
      toast.error('Name and Category are required');
      return;
    }

    setFormSubmitting(true);
    try {
      // 1. Create the base asset
      const payload = {
        name: formData.name,
        category_id: formData.category_id,
        serial_number: formData.serial_number || null,
        acquisition_date: formData.acquisition_date || null,
        acquisition_cost: formData.acquisition_cost ? parseFloat(formData.acquisition_cost) : null,
        condition: formData.condition,
        location: formData.location || null,
        is_bookable: formData.is_bookable
      };

      const newAsset = await AssetsService.createAsset(payload);
      toast.success('Asset created successfully!');

      // 2. Perform file uploads if any
      let uploadedPhotoUrl = null;
      let uploadedDocUrl = null;

      if (photoFile) {
        toast.loading('Uploading photo...', { id: 'file-upload' });
        uploadedPhotoUrl = await handleFileUpload(photoFile);
      }

      if (docFile) {
        toast.loading('Uploading documentation...', { id: 'file-upload' });
        uploadedDocUrl = await handleFileUpload(docFile);
      }

      toast.dismiss('file-upload');

      // 3. If files were uploaded, call PUT to update URLs
      if (uploadedPhotoUrl || uploadedDocUrl) {
        const updatePayload = {};
        if (uploadedPhotoUrl) updatePayload.photo_url = uploadedPhotoUrl;
        if (uploadedDocUrl) {
          updatePayload.documents = [{
            name: docFile.name,
            url: uploadedDocUrl,
            uploaded_at: new Date().toISOString()
          }];
        }
        await AssetsService.updateAsset(newAsset.id, updatePayload);
        toast.success('Files linked successfully!');
      }

      setIsAddModalOpen(false);
      loadAssets();
    } catch (err) {
      console.error('Create asset failed:', err);
      toast.error(err.response?.data?.detail || 'Failed to create asset');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Submit Edit Asset Form
  const handleEditAsset = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category_id) {
      toast.error('Name and Category are required');
      return;
    }

    setFormSubmitting(true);
    try {
      // 1. Perform file uploads if any new file selected
      let uploadedPhotoUrl = null;
      let uploadedDocUrl = null;

      if (photoFile) {
        toast.loading('Uploading new photo...', { id: 'file-upload' });
        uploadedPhotoUrl = await handleFileUpload(photoFile);
      }

      if (docFile) {
        toast.loading('Uploading new documentation...', { id: 'file-upload' });
        uploadedDocUrl = await handleFileUpload(docFile);
      }

      toast.dismiss('file-upload');

      // 2. Update the asset
      const payload = {
        name: formData.name,
        category_id: formData.category_id,
        serial_number: formData.serial_number || null,
        acquisition_date: formData.acquisition_date || null,
        acquisition_cost: formData.acquisition_cost ? parseFloat(formData.acquisition_cost) : null,
        condition: formData.condition,
        location: formData.location || null,
        is_bookable: formData.is_bookable,
        status: formData.status
      };

      if (uploadedPhotoUrl) {
        payload.photo_url = uploadedPhotoUrl;
      } else if (selectedAsset.photo_url) {
        payload.photo_url = selectedAsset.photo_url;
      }

      if (uploadedDocUrl) {
        const newDoc = {
          name: docFile.name,
          url: uploadedDocUrl,
          uploaded_at: new Date().toISOString()
        };
        payload.documents = selectedAsset.documents 
          ? [...selectedAsset.documents, newDoc]
          : [newDoc];
      } else if (selectedAsset.documents) {
        payload.documents = selectedAsset.documents;
      }

      await AssetsService.updateAsset(selectedAsset.id, payload);
      toast.success('Asset updated successfully!');
      setIsEditModalOpen(false);
      loadAssets();
    } catch (err) {
      console.error('Update asset failed:', err);
      toast.error(err.response?.data?.detail || 'Failed to update asset');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Delete Asset
  const handleDeleteAsset = async () => {
    setFormSubmitting(true);
    try {
      await AssetsService.deleteAsset(selectedAsset.id);
      toast.success('Asset deleted successfully!');
      setIsDeleteModalOpen(false);
      // Adjust current page if we deleted the last item on the page
      if (assets.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        loadAssets();
      }
    } catch (err) {
      console.error('Delete asset failed:', err);
      toast.error(err.response?.data?.detail || 'Failed to delete asset');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <nav className="flex gap-2 text-xs font-semibold text-on-surface-variant mb-2">
            <span>Enterprise</span>
            <span>/</span>
            <span className="text-primary font-bold">Assets</span>
          </nav>
          <h1 className="text-2xl font-heading font-bold text-on-surface">Asset Management</h1>
          <p className="text-sm text-on-surface-variant mt-1 font-medium">
            Monitor, register, and handle lifecycle details of company assets.
          </p>
        </div>

        {/* Add Asset Button (Visible to Admin and Asset Managers) */}
        {(basePath === '/admin' || basePath === '/manager') && (
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-container hover:text-on-primary-container shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Asset
          </button>
        )}
      </div>

      {/* Filter panel */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-outline-variant flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-surface-container-low">
          
          {/* Search form */}
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets..." 
                className="w-full pl-10 pr-4 py-2 bg-surface text-on-surface rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
              />
            </div>
            <button 
              type="submit"
              className="px-4 py-2 bg-surface border border-outline-variant text-on-surface hover:bg-surface-container rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-xl border border-outline-variant">
              <Filter className="w-3.5 h-3.5 text-outline" />
              <span className="text-xs font-semibold text-on-surface-variant">Filter By:</span>
            </div>
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1.5 text-xs font-semibold bg-surface text-on-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name || c.title}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1.5 text-xs font-semibold bg-surface text-on-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary outline-none"
            >
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="allocated">Allocated</option>
              <option value="reserved">Reserved</option>
              <option value="under_maintenance">Under Maintenance</option>
              <option value="lost">Lost</option>
              <option value="retired">Retired</option>
              <option value="disposed">Disposed</option>
            </select>
          </div>
        </div>

        {/* Content Table Area */}
        <div className="overflow-x-auto relative min-h-[300px]">
          {isLoading ? (
            <div className="absolute inset-0 bg-surface/50 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <span className="text-sm font-semibold text-on-surface-variant">Loading assets from server...</span>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-4">
              <AlertCircle className="w-12 h-12 text-error" />
              <div>
                <h3 className="font-bold text-lg text-on-surface">Failed to Load Assets</h3>
                <p className="text-sm text-on-surface-variant mt-1">{error}</p>
              </div>
              <button 
                onClick={loadAssets}
                className="px-4 py-2 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer"
              >
                Retry Request
              </button>
            </div>
          ) : assets.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-4">
              <span className="material-symbols-outlined text-[48px] text-outline">devices_other</span>
              <div>
                <h3 className="font-bold text-lg text-on-surface">No Assets Found</h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  {searchQuery || selectedCategory || selectedStatus 
                    ? 'No assets match your search filters.' 
                    : 'There are no assets registered in the system.'}
                </p>
              </div>
              {!searchQuery && !selectedCategory && !selectedStatus && (basePath === '/admin' || basePath === '/manager') && (
                <button 
                  onClick={openAddModal}
                  className="px-4 py-2 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer"
                >
                  Register First Asset
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-surface-secondary text-xs uppercase tracking-wider text-on-surface-variant border-b border-outline-variant">
                  <th className="px-6 py-3.5 font-bold w-[130px]">Tag</th>
                  <th className="px-6 py-3.5 font-bold w-[25%]">Name</th>
                  <th className="px-6 py-3.5 font-bold w-[180px]">Category</th>
                  <th className="px-6 py-3.5 font-bold w-[180px]">Status</th>
                  <th className="px-6 py-3.5 font-bold">Assigned To</th>
                  <th className="px-6 py-3.5 font-bold text-right w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-surface-container-low transition-colors align-middle">
                    <td className="px-6 py-4 text-sm font-mono font-bold text-primary">{asset.asset_tag || asset.id.substring(0, 8)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-on-surface truncate">
                      <div className="flex items-center gap-3">
                        {asset.photo_url ? (
                          <img 
                            src={asset.photo_url} 
                            alt={asset.name}
                            className="w-8 h-8 rounded-lg object-cover border border-outline-variant"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-outline">
                            <span className="material-symbols-outlined text-sm">laptop_mac</span>
                          </div>
                        )}
                        <span className="truncate">{asset.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant font-medium truncate">{getCategoryName(asset.category_id)}</td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusStyle(asset.status)}`}>
                        {formatStatus(asset.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant font-semibold truncate">
                      {asset.assigned_to || asset.current_holder_name || (asset.current_holder_id ? `Employee (${asset.current_holder_id.substring(0,8)})` : 'Unassigned')}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === asset.id ? null : asset.id)}
                        className="text-outline hover:text-on-surface transition-colors p-1.5 rounded-lg hover:bg-surface-container cursor-pointer inline-flex items-center justify-center"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === asset.id && (
                        <div 
                          ref={menuRef}
                          className="absolute right-6 top-12 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl z-50 py-1.5 w-44 text-left overflow-hidden transform duration-100 ease-out origin-top-right"
                        >
                          <button 
                            onClick={() => { setActiveMenuId(null); navigate(`${basePath}/asset/${asset.id}`); }}
                            className="w-full px-4 py-2 text-xs font-bold text-on-surface hover:bg-surface-container flex items-center gap-2 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-outline" />
                            View Details
                          </button>

                          {/* Edit / Delete option only available to Admin / Asset Manager */}
                          {(basePath === '/admin' || basePath === '/manager') && (
                            <>
                              <button 
                                onClick={() => { setActiveMenuId(null); openEditModal(asset); }}
                                className="w-full px-4 py-2 text-xs font-bold text-on-surface hover:bg-surface-container flex items-center gap-2 cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5 text-outline" />
                                Edit Asset
                              </button>
                              <div className="h-[1px] bg-outline-variant my-1" />
                              <button 
                                onClick={() => { setActiveMenuId(null); openDeleteModal(asset); }}
                                className="w-full px-4 py-2 text-xs font-bold text-error hover:bg-error-container/10 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-error" />
                                Delete Asset
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination controls */}
        {!isLoading && !error && assets.length > 0 && (
          <div className="p-4 border-t border-outline-variant flex items-center justify-between text-xs font-bold text-on-surface-variant bg-surface-container-low">
            <div>
              Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalItems)} of {totalItems} entries
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
                disabled={currentPage * limit >= totalItems}
                className="px-3.5 py-1.5 border border-outline-variant rounded-xl bg-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-on-surface"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ADD ASSET MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div>
                <h3 className="font-bold text-xl font-heading text-on-surface">Add New Asset</h3>
                <p className="text-xs font-semibold text-on-surface-variant mt-1">Register a new asset tag in the inventory database.</p>
              </div>
              <button 
                className="p-2 hover:bg-surface-variant rounded-full transition-colors cursor-pointer" 
                onClick={() => setIsAddModalOpen(false)}
              >
                <X className="w-5 h-5 text-on-surface" />
              </button>
            </div>
            
            <form className="p-6 overflow-y-auto space-y-5 flex-1" onSubmit={handleCreateAsset}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Asset Name *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. MacBook Pro M3"
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Category *</label>
                  <select 
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name || c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Serial Number</label>
                  <input 
                    type="text" 
                    value={formData.serial_number}
                    onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                    placeholder="e.g. C02D984FMD6R"
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Acquisition Date</label>
                  <input 
                    type="date" 
                    value={formData.acquisition_date}
                    onChange={(e) => setFormData({...formData, acquisition_date: e.target.value})}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Acquisition Cost (USD)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.acquisition_cost}
                    onChange={(e) => setFormData({...formData, acquisition_cost: e.target.value})}
                    placeholder="e.g. 1999.00"
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Asset Condition</label>
                  <select 
                    value={formData.condition}
                    onChange={(e) => setFormData({...formData, condition: e.target.value})}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  >
                    <option value="new">New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                    <option value="damaged">Damaged</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Location</label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g. Headquarters - Floor 3"
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  />
                </div>
              </div>

              {/* Photo & Document Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="border border-dashed border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center bg-surface-container-lowest">
                  <Upload className="w-6 h-6 text-outline mb-2" />
                  <span className="text-xs font-bold text-on-surface">Asset Image</span>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">JPG, PNG up to 5MB</p>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files[0])}
                    className="hidden" 
                    id="photo-upload-add"
                  />
                  <label 
                    htmlFor="photo-upload-add"
                    className="mt-3 px-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-xs font-bold hover:bg-surface cursor-pointer transition-colors text-on-surface"
                  >
                    {photoFile ? photoFile.name : 'Choose Image'}
                  </label>
                  {photoFile && (
                    <button 
                      type="button" 
                      onClick={() => setPhotoFile(null)}
                      className="text-error font-bold text-[10px] mt-2 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  )}
                </div>

                <div className="border border-dashed border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center bg-surface-container-lowest">
                  <FileText className="w-6 h-6 text-outline mb-2" />
                  <span className="text-xs font-bold text-on-surface">Documentation File</span>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">PDF, DOCX up to 10MB</p>
                  <input 
                    type="file" 
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={(e) => setDocFile(e.target.files[0])}
                    className="hidden" 
                    id="doc-upload-add"
                  />
                  <label 
                    htmlFor="doc-upload-add"
                    className="mt-3 px-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-xs font-bold hover:bg-surface cursor-pointer transition-colors text-on-surface"
                  >
                    {docFile ? docFile.name : 'Choose File'}
                  </label>
                  {docFile && (
                    <button 
                      type="button" 
                      onClick={() => setDocFile(null)}
                      className="text-error font-bold text-[10px] mt-2 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Bookable checkbox */}
              <div className="flex items-center gap-2.5 pt-2">
                <input 
                  type="checkbox" 
                  checked={formData.is_bookable}
                  onChange={(e) => setFormData({...formData, is_bookable: e.target.checked})}
                  id="is_bookable_add"
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface"
                />
                <label htmlFor="is_bookable_add" className="text-sm font-semibold text-on-surface cursor-pointer">
                  Allow employee booking reservations for this asset
                </label>
              </div>

              <div className="flex gap-3 pt-5 border-t border-outline-variant">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={formSubmitting}
                  className="flex-1 px-4 py-3 border border-outline-variant rounded-xl font-bold text-on-surface hover:bg-surface-container transition-colors cursor-pointer text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={formSubmitting}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-50"
                >
                  {formSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Asset...
                    </>
                  ) : (
                    'Create Asset'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ASSET MODAL */}
      {isEditModalOpen && selectedAsset && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div>
                <h3 className="font-bold text-xl font-heading text-on-surface">Edit Asset Details</h3>
                <p className="text-xs font-semibold text-on-surface-variant mt-1">
                  Modify the database record for <span className="font-mono text-primary font-bold">{selectedAsset.asset_tag}</span>.
                </p>
              </div>
              <button 
                className="p-2 hover:bg-surface-variant rounded-full transition-colors cursor-pointer" 
                onClick={() => setIsEditModalOpen(false)}
              >
                <X className="w-5 h-5 text-on-surface" />
              </button>
            </div>
            
            <form className="p-6 overflow-y-auto space-y-5 flex-1" onSubmit={handleEditAsset}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Asset Name *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. MacBook Pro M3"
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Category *</label>
                  <select 
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name || c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Serial Number</label>
                  <input 
                    type="text" 
                    value={formData.serial_number}
                    onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                    placeholder="e.g. C02D984FMD6R"
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Acquisition Date</label>
                  <input 
                    type="date" 
                    value={formData.acquisition_date}
                    onChange={(e) => setFormData({...formData, acquisition_date: e.target.value})}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Acquisition Cost (USD)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.acquisition_cost}
                    onChange={(e) => setFormData({...formData, acquisition_cost: e.target.value})}
                    placeholder="e.g. 1999.00"
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Asset Condition</label>
                  <select 
                    value={formData.condition}
                    onChange={(e) => setFormData({...formData, condition: e.target.value})}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  >
                    <option value="new">New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                    <option value="damaged">Damaged</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Operational Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  >
                    <option value="available">Available</option>
                    <option value="allocated">Allocated</option>
                    <option value="reserved">Reserved</option>
                    <option value="under_maintenance">Under Maintenance</option>
                    <option value="lost">Lost</option>
                    <option value="retired">Retired</option>
                    <option value="disposed">Disposed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Location</label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g. Headquarters - Floor 3"
                    className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold text-on-surface"
                  />
                </div>
              </div>

              {/* Photo & Document Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="border border-dashed border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center bg-surface-container-lowest">
                  {selectedAsset.photo_url && !photoFile ? (
                    <img 
                      src={selectedAsset.photo_url} 
                      alt="Current" 
                      className="w-14 h-14 rounded-lg object-cover mb-1 border border-outline-variant"
                    />
                  ) : (
                    <Upload className="w-6 h-6 text-outline mb-2" />
                  )}
                  <span className="text-xs font-bold text-on-surface">Update Asset Image</span>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">JPG, PNG up to 5MB</p>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files[0])}
                    className="hidden" 
                    id="photo-upload-edit"
                  />
                  <label 
                    htmlFor="photo-upload-edit"
                    className="mt-3 px-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-xs font-bold hover:bg-surface cursor-pointer transition-colors text-on-surface"
                  >
                    {photoFile ? photoFile.name : 'Choose Image'}
                  </label>
                  {photoFile && (
                    <button 
                      type="button" 
                      onClick={() => setPhotoFile(null)}
                      className="text-error font-bold text-[10px] mt-2 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  )}
                </div>

                <div className="border border-dashed border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center bg-surface-container-lowest">
                  <FileText className="w-6 h-6 text-outline mb-2" />
                  <span className="text-xs font-bold text-on-surface">Upload Documentation File</span>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">PDF, DOCX up to 10MB</p>
                  <input 
                    type="file" 
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={(e) => setDocFile(e.target.files[0])}
                    className="hidden" 
                    id="doc-upload-edit"
                  />
                  <label 
                    htmlFor="doc-upload-edit"
                    className="mt-3 px-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-xs font-bold hover:bg-surface cursor-pointer transition-colors text-on-surface"
                  >
                    {docFile ? docFile.name : 'Choose File'}
                  </label>
                  {docFile && (
                    <button 
                      type="button" 
                      onClick={() => setDocFile(null)}
                      className="text-error font-bold text-[10px] mt-2 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Bookable checkbox */}
              <div className="flex items-center gap-2.5 pt-2">
                <input 
                  type="checkbox" 
                  checked={formData.is_bookable}
                  onChange={(e) => setFormData({...formData, is_bookable: e.target.checked})}
                  id="is_bookable_edit"
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface"
                />
                <label htmlFor="is_bookable_edit" className="text-sm font-semibold text-on-surface cursor-pointer">
                  Allow employee booking reservations for this asset
                </label>
              </div>

              <div className="flex gap-3 pt-5 border-t border-outline-variant">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={formSubmitting}
                  className="flex-1 px-4 py-3 border border-outline-variant rounded-xl font-bold text-on-surface hover:bg-surface-container transition-colors cursor-pointer text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={formSubmitting}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-50"
                >
                  {formSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE ASSET CONFIRMATION MODAL */}
      {isDeleteModalOpen && selectedAsset && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-error-container/20 text-error flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-on-surface">Delete Asset?</h3>
                <p className="text-sm text-on-surface-variant font-medium">
                  Are you sure you want to delete <span className="font-mono text-primary font-bold">{selectedAsset.name} ({selectedAsset.asset_tag})</span>? 
                  This action is permanent and will remove all associated logs and records.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex gap-3 justify-end">
              <button 
                type="button" 
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={formSubmitting}
                className="px-4 py-2 border border-outline-variant rounded-xl font-semibold text-on-surface hover:bg-surface-container transition-colors text-xs cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleDeleteAsset}
                disabled={formSubmitting}
                className="px-4 py-2 bg-error text-white rounded-xl font-semibold hover:bg-red-700 transition-colors text-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {formSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Permanent'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
