import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle2, Info, Loader2, AlertCircle, Check } from 'lucide-react';
import { NotificationsService } from '../services/notifications';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await NotificationsService.listNotifications({ limit: 100 });
      setNotifications(data.items || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Failed to retrieve notifications. Please check your connection.');
      toast.error('Error loading notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await NotificationsService.markNotificationRead(id, true);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      toast.success('Notification marked as read');
    } catch (err) {
      console.error('Failed to update notification:', err);
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    if (unread.length === 0) return;

    try {
      await Promise.all(unread.map(n => NotificationsService.markNotificationRead(n.id, true)));
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      toast.error('Failed to update some notifications');
      loadNotifications();
    }
  };

  // Helper: Get notification styles & icons
  const getNotifDetails = (type) => {
    const lowerType = type?.toLowerCase() || '';
    if (lowerType.includes('alert') || lowerType.includes('reject') || lowerType.includes('critical') || lowerType.includes('error')) {
      return {
        icon: AlertTriangle,
        color: 'text-error bg-error/10'
      };
    }
    if (lowerType.includes('success') || lowerType.includes('resolve') || lowerType.includes('approve') || lowerType.includes('complete')) {
      return {
        icon: CheckCircle2,
        color: 'text-secondary bg-secondary/10'
      };
    }
    return {
      icon: Info,
      color: 'text-primary bg-primary/10'
    };
  };

  // Helper: Format relative timestamp
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-on-surface">Notifications</h1>
          <p className="text-sm text-on-surface-variant mt-1 font-medium">
            Stay updated with alerts, maintenance work, and resource audit cycles.
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            className="text-sm font-semibold text-primary hover:text-primary-container hover:underline cursor-pointer transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Main Container */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm relative min-h-[250px] overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 bg-surface/50 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <span className="text-sm font-semibold text-on-surface-variant">Loading notifications...</span>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-4">
            <AlertCircle className="w-12 h-12 text-error" />
            <div>
              <h3 className="font-bold text-lg text-on-surface">Failed to Load Notifications</h3>
              <p className="text-sm text-on-surface-variant mt-1">{error}</p>
            </div>
            <button 
              onClick={loadNotifications}
              className="px-4 py-2 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center gap-4 min-h-[250px]">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-on-surface">All caught up!</h3>
              <p className="text-sm text-on-surface-variant mt-1">You have no new notifications at this time.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant">
            {notifications.map(n => {
              const details = getNotifDetails(n.type);
              const IconComp = details.icon;
              
              return (
                <div 
                  key={n.id} 
                  className={`p-5 flex justify-between items-start gap-4 transition-colors ${
                    n.is_read ? 'hover:bg-surface-container-low/30' : 'bg-primary-container/5 hover:bg-primary-container/10 border-l-4 border-l-primary'
                  }`}
                >
                  <div className="flex gap-4 flex-1">
                    <div className={`p-2 rounded-full h-fit flex-shrink-0 ${details.color}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className={`font-semibold text-on-surface ${n.is_read ? 'font-medium' : 'font-bold'}`}>
                        {n.message}
                      </div>
                      <div className="text-xs text-outline mt-2 font-semibold">
                        {formatTimeAgo(n.created_at)}
                      </div>
                    </div>
                  </div>

                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      title="Mark as read"
                      className="p-1 hover:bg-surface-container-high rounded-full text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
