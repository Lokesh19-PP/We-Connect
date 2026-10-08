'use client';

// ──────────────────────────────────────────────
// VendorFlow – Admin User Management Component
// Table, Add/Edit Dialog, Workshop Selector logic
// ──────────────────────────────────────────────
import { useState } from 'react';
import {
  getUsers,
  addUser,
  updateUser,
  toggleUserStatus,
  type AppUser,
} from '@/data/settings';
import { getWorkshops } from '@/data/sample';
import { ALL_ROLES } from '@/lib/role-context';
import type { Role } from '@/types';
import {
  Users,
  UserPlus,
  CheckCircle2,
  XCircle,
  X,
  AlertCircle,
  Building2,
  Edit2,
} from 'lucide-react';

export function UserManagement() {
  const [users, setUsers] = useState<AppUser[]>(getUsers());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    role: 'Procurement' as Role,
    workshopId: '',
    status: 'Active' as 'Active' | 'Inactive',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const workshops = getWorkshops();

  const isWorkshopRoleSelected =
    formData.role === 'Workshop Owner' || formData.role === 'Workshop Staff';

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      contact: '',
      role: 'Procurement',
      workshopId: '',
      status: 'Active',
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (user: AppUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      contact: user.contact,
      role: user.role,
      workshopId: user.workshopId || '',
      status: user.status,
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.contact.trim()) errs.contact = 'Email or phone is required';
    if (isWorkshopRoleSelected && !formData.workshopId) {
      errs.workshopId = 'Please select a workshop for workshop roles';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedWorkshop = workshops.find((w) => w.id === formData.workshopId);

    if (editingUser) {
      updateUser(editingUser.id, {
        name: formData.name.trim(),
        contact: formData.contact.trim(),
        role: formData.role,
        workshopId: isWorkshopRoleSelected ? formData.workshopId : undefined,
        workshopName: isWorkshopRoleSelected ? selectedWorkshop?.name : undefined,
        status: formData.status,
      });
    } else {
      addUser({
        name: formData.name.trim(),
        contact: formData.contact.trim(),
        role: formData.role,
        workshopId: isWorkshopRoleSelected ? formData.workshopId : undefined,
        workshopName: isWorkshopRoleSelected ? selectedWorkshop?.name : undefined,
        status: formData.status,
      });
    }

    setUsers(getUsers());
    setIsDialogOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    toggleUserStatus(id);
    setUsers(getUsers());
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden space-y-4">
      {/* Header Bar */}
      <div className="p-5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-sm text-slate-900">User Accounts & Roles</h2>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto px-5 pb-5">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th className="p-3">User Name</th>
              <th className="p-3">Email / Contact</th>
              <th className="p-3">Assigned Role</th>
              <th className="p-3">Assigned Workshop</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">{user.name}</td>
                <td className="p-3 text-slate-600 font-medium">{user.contact}</td>
                <td className="p-3">
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-md text-[11px] border border-blue-200/60">
                    {user.role}
                  </span>
                </td>
                <td className="p-3">
                  {user.workshopName ? (
                    <span className="flex items-center space-x-1 text-slate-800 font-semibold">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span>{user.workshopName}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">N/A (HQ/Unit)</span>
                  )}
                </td>
                <td className="p-3">
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      user.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {user.status === 'Active' ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3 h-3 text-slate-400" />
                    )}
                    <span>{user.status}</span>
                  </span>
                </td>
                <td className="p-3 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(user)}
                    className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                    title="Edit user"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(user.id)}
                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md transition-colors ${
                      user.status === 'Active'
                        ? 'bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-700'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit User Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingUser ? 'Edit User Account' : 'Add New User Account'}
              </h3>
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Deshmukh"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs ${
                    errors.name ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  }`}
                />
                {errors.name && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email or Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="rahul@deccanboilers.in or +91 98765 00000"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs ${
                    errors.contact ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  }`}
                />
                {errors.contact && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.contact}</p>
                )}
              </div>

              {/* Role Dropdown */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  App Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs font-semibold"
                >
                  {ALL_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Workshop Selector (Appears ONLY for Workshop Owner and Workshop Staff) */}
              {isWorkshopRoleSelected && (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5 animate-in fade-in duration-200">
                  <label className="block font-bold text-amber-900 text-xs flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Assign Workshop <span className="text-red-500">*</span></span>
                  </label>
                  <select
                    value={formData.workshopId}
                    onChange={(e) => setFormData({ ...formData, workshopId: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-xs bg-white ${
                      errors.workshopId ? 'border-red-500' : 'border-amber-300'
                    }`}
                  >
                    <option value="">-- Select Workshop --</option>
                    {workshops.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.contactPerson})
                      </option>
                    ))}
                  </select>
                  {errors.workshopId && (
                    <p className="text-[11px] text-red-500 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.workshopId}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
