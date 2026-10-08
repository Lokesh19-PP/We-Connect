'use client';

// ──────────────────────────────────────────────
// VendorFlow – Notification Bell & Dropdown Component
// Exported for header inclusion (§8 & Prompt 4)
// ──────────────────────────────────────────────
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRole } from '@/lib/role-context';
import {
  getNotificationsForRoleState,
  getUnreadCountForRole,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/data/notifications';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Filter,
} from 'lucide-react';
import type { AppNotification } from '@/types';

export function NotificationBell() {
  const { role } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'action'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const notifications = getNotificationsForRoleState(role);
  const unreadCount = getUnreadCountForRole(role);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markNotificationAsRead(id);
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(role);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterTab === 'unread') return !n.read;
    if (filterTab === 'action') return n.type === 'error' || n.type === 'warning';
    return true;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full relative transition-colors focus:outline-hidden"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 bg-red-600 text-white font-extrabold text-[10px] rounded-full ring-2 ring-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-88 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-xs">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 bg-red-500 text-white text-[10px] font-bold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center space-x-1 text-[11px] text-blue-300 hover:text-white font-medium transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* Tab Filters */}
          <div className="flex items-center border-b border-slate-100 bg-slate-50/80 p-1 text-[11px] font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`flex-1 py-1 rounded-md text-center transition-all ${
                filterTab === 'all'
                  ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                  : 'hover:text-slate-900'
              }`}
            >
              All ({notifications.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('unread')}
              className={`flex-1 py-1 rounded-md text-center transition-all ${
                filterTab === 'unread'
                  ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                  : 'hover:text-slate-900'
              }`}
            >
              Unread ({unreadCount})
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('action')}
              className={`flex-1 py-1 rounded-md text-center transition-all ${
                filterTab === 'action'
                  ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                  : 'hover:text-slate-900'
              }`}
            >
              Action Required
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No notifications matching your filter.
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => setIsOpen(false)}
                  className={`p-3.5 hover:bg-slate-50/80 transition-colors flex items-start justify-between space-x-3 text-xs ${
                    !n.read ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex items-start space-x-2.5 flex-1">
                    {/* Notification Type Icon */}
                    <div className="mt-0.5 shrink-0">
                      {n.type === 'error' ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : n.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      ) : n.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-500" />
                      )}
                    </div>

                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between">
                        <p
                          className={`font-bold text-xs ${
                            !n.read ? 'text-slate-900' : 'text-slate-700'
                          }`}
                        >
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 ml-2" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {n.message}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-300" />
                          <span>{n.createdAt}</span>
                        </span>

                        {n.link && (
                          <Link
                            href={n.link}
                            className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center space-x-0.5"
                          >
                            <span>View</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {!n.read && (
                    <button
                      type="button"
                      onClick={(e) => handleMarkRead(n.id, e)}
                      className="text-[10px] text-slate-400 hover:text-blue-600 p-1"
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center text-[11px]">
            <span className="text-slate-500 font-medium">
              Filtered for <span className="font-bold text-slate-700">{role}</span> role
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
