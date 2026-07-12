import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ui/ConfirmModal';

export default function AssetCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('Devices');
  const [catWarranty, setCatWarranty] = useState('12');
  const [catDesc, setCatDesc] = useState('');
  const [trackDep, setTrackDep] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Inline Validation State
  const [errors, setErrors] = useState({});
  const nameInputRef = useRef(null);

  // Deletion Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/org/categories');
      setCategories(res.data || []);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setCatName('');
    setCatIcon('Devices');
    setCatWarranty('12');
    setCatDesc('');
    setTrackDep(false);
    setEditingCategory(null);
    setErrors({});
  };

  const handleEditClick = (cat) => {
    setEditingCategory(cat);
    setCatName(cat.name || '');
    setCatIcon(cat.custom_fields?.icon || 'Devices');
    setCatWarranty(cat.custom_fields?.warranty || '12');
    setCatDesc(cat.custom_fields?.description || '');
    setTrackDep(!!cat.custom_fields?.track_depreciation);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setCatToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!catToDelete) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/org/categories/${catToDelete}`);
      toast.success('Category deleted successfully');
      fetchCategories();
      setIsConfirmOpen(false);
      setCatToDelete(null);
    } catch (err) {
      console.error('Failed to delete category:', err);
      toast.error(err.response?.data?.detail || 'Failed to delete category. Active assets might be assigned to this category.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNameChange = (val) => {
    setCatName(val);
    if (val.trim() && errors.name) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.name;
        return next;
      });
    }
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!catName.trim()) {
      newErrors.name = 'Category name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Auto focus first invalid field
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 50);
      return;
    }
    
    setIsSaving(true);
    try {
      const payload = {
        name: catName,
        custom_fields: {
          icon: catIcon,
          warranty: catWarranty,
          description: catDesc,
          track_depreciation: trackDep
        }
      };

      if (editingCategory) {
        await apiClient.put(`/org/categories/${editingCategory.id}`, payload);
        toast.success('Category updated successfully!');
      } else {
        await apiClient.post('/org/categories', payload);
        toast.success('Category created successfully!');
      }
      
      resetForm();
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const getIconDetails = (iconStr) => {
    switch(iconStr) {
      case 'Devices': return { icon: 'devices', container: 'bg-primary-container/20 text-primary', bg: 'bg-primary' };
      case 'Tools': return { icon: 'build', container: 'bg-secondary-container/20 text-secondary', bg: 'bg-secondary' };
      case 'Appliances': return { icon: 'kitchen', container: 'bg-tertiary-container/20 text-tertiary', bg: 'bg-tertiary' };
      case 'Infrastructure': return { icon: 'domain', container: 'bg-error-container/20 text-error', bg: 'bg-error' };
      default: return { icon: 'category', container: 'bg-primary-container/20 text-primary', bg: 'bg-primary' };
    }
  };

  return (
    <>
      {/* Breadcrumbs & Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 animate-fade-in">
        <div>
          <nav className="flex gap-2 text-xs font-semibold text-on-surface-variant mb-2">
            <span>Assets</span>
            <span>/</span>
            <span className="text-primary font-bold">Categories</span>
          </nav>
          <h2 className="font-bold text-3xl font-heading text-on-surface">Asset Categories</h2>
          <p className="text-sm text-on-surface-variant mt-1 font-medium">Manage and organize enterprise physical assets by type.</p>
        </div>
        <button 
          className="bg-primary text-white px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95 cursor-pointer" 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-6 h-[220px] animate-pulse flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-surface-container mb-4"></div>
                <div className="h-6 w-32 bg-surface-container rounded mb-2"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-surface-container rounded"></div>
                <div className="h-4 w-2/3 bg-surface-container rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest max-w-xl mx-auto px-6">
          <span className="material-symbols-outlined text-5xl text-outline mb-4">folder</span>
          <h3 className="text-lg font-heading font-bold text-on-surface">No categories found</h3>
          <p className="text-sm text-on-surface-variant mt-2 max-w-sm">Create your first category to start organizing physical assets.</p>
          <button 
            className="mt-6 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-md shadow-primary/10"
            onClick={() => { resetForm(); setIsModalOpen(true); }}
          >
            + Create Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {categories.map((cat) => {
            const iconKey = cat.custom_fields?.icon || 'Devices';
            const { icon, container, bg } = getIconDetails(iconKey);
            const warranty = cat.custom_fields?.warranty || 'N/A';
            const description = cat.custom_fields?.description || 'No description provided.';

            return (
              <div key={cat.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:shadow-md transition-shadow group flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${container}`}>
                      <span className="material-symbols-outlined text-3xl">{icon}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEditClick(cat); }}
                        className="p-1 hover:bg-surface-variant rounded text-on-surface-variant hover:text-primary transition-colors cursor-pointer inline-flex"
                        title="Edit Category"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(cat.id); }}
                        className="p-1 hover:bg-surface-variant rounded text-on-surface-variant hover:text-error transition-colors cursor-pointer inline-flex"
                        title="Delete Category"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        cat.status === 'active' ? 'bg-secondary-container/30 text-secondary border border-secondary/20' : 'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        {cat.status || 'active'}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-bold text-xl font-heading mb-4 text-on-surface">{cat.name}</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm font-medium text-on-surface-variant">
                    <span>Standard Warranty</span>
                    <span className="font-bold text-on-surface">{warranty} Months</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-on-surface-variant">
                    <span>Depreciation Tracking</span>
                    <span className="font-bold text-on-surface">{cat.custom_fields?.track_depreciation ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-4 overflow-hidden">
                    <div className={`${bg} h-full w-full rounded-full`}></div>
                  </div>
                  <p className="text-[11px] text-on-surface-variant pt-2 font-medium line-clamp-2" title={description}>{description}</p>
                </div>
              </div>
            );
          })}
          
          {/* Custom Category Placeholder */}
          <div 
            className="border-2 border-dashed border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-surface-container-low transition-all cursor-pointer group min-h-[220px]" 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
          >
            <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-on-surface-variant">add_circle</span>
            </div>
            <span className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Add New Category</span>
            <p className="text-xs text-on-surface-variant mt-1.5 font-medium max-w-[200px]">Define a new category and default settings.</p>
          </div>
        </div>
      )}

      {/* Slide-over or Modal for creation */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest w-full max-w-xl rounded-2xl border border-outline-variant/60 shadow-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/40 flex justify-between items-center">
              <h3 className="text-lg font-heading font-bold text-on-surface">
                {editingCategory ? 'Edit Asset Category' : 'Create Asset Category'}
              </h3>
              <button 
                className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                onClick={() => { resetForm(); setIsModalOpen(false); }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmitCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Category Name</label>
                <input 
                  ref={nameInputRef}
                  value={catName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`w-full rounded-xl border bg-surface-container-low px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium ${
                    errors.name ? 'border-error text-error focus:ring-error/20 focus:border-error' : 'border-outline-variant'
                  }`} 
                  placeholder="e.g. Network Hardware, Furniture" 
                  type="text"
                />
                {errors.name && (
                  <p className="text-xs text-error font-semibold mt-1.5 flex items-center gap-1">
                    ❌ {errors.name}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Icon Type</label>
                  <select 
                    value={catIcon}
                    onChange={(e) => setCatIcon(e.target.value)}
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium cursor-pointer"
                  >
                    <option value="Devices">Devices (PC, Monitor)</option>
                    <option value="Tools">Tools (Screwdrivers, Kits)</option>
                    <option value="Appliances">Appliances (AC, Fridge)</option>
                    <option value="Infrastructure">Infrastructure (Server, Rack)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Standard Warranty (Months)</label>
                  <input 
                    value={catWarranty}
                    onChange={(e) => setCatWarranty(e.target.value)}
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium" 
                    placeholder="e.g. 12, 24" 
                    type="number"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Description</label>
                <textarea 
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-sm font-medium" 
                  placeholder="Briefly describe what assets fall under this category..." 
                  rows="3"
                ></textarea>
              </div>
              <div className="flex items-center gap-2 pt-2 cursor-pointer" onClick={() => setTrackDep(!trackDep)}>
                <input 
                  checked={trackDep}
                  readOnly
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-low cursor-pointer" 
                  type="checkbox"
                />
                <label className="text-sm font-medium text-on-surface cursor-pointer select-none">
                  Enable automated depreciation tracking
                </label>
              </div>
              
              <div className="flex gap-3 pt-6 border-t border-outline-variant">
                <button 
                  type="button" 
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 border border-outline-variant rounded-xl font-semibold text-on-surface hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => { resetForm(); setIsModalOpen(false); }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Creating...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generic Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Delete Category?"
        description="This action cannot be undone. Are you sure you want to permanently delete this category?"
        onConfirm={handleConfirmDelete}
        onCancel={() => { setIsConfirmOpen(false); setCatToDelete(null); }}
        isLoading={isDeleting}
      />
    </>
  );
}
