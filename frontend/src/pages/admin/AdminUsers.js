// src/pages/admin/AdminUsers.js
import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { format } from 'date-fns';
import { FiSearch, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getAllUsers({ page, limit, search: search || undefined });
      setUsers(data.data.users);
      setTotal(data.data.total);
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const totalPages = Math.ceil(total / limit);

  return (
    <AdminLayout title="Users">
      {/* Search */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="bg-dark-800 text-white placeholder-gray-500 rounded-xl pl-9 pr-4 py-2 text-sm border border-white/10 input-glow w-64"
          />
        </div>
        <span className="text-gray-400 text-sm self-center">
          Total: <span className="text-white font-semibold">{total}</span> users
        </span>
      </div>

      {loading ? <LoadingSpinner fullScreen={false} /> : users.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">👥</div>
          <p>No users found</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {['User', 'Phone', 'Verified', 'Role', 'Joined'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-gradient flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{u.name}</p>
                          <p className="text-gray-500 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{u.phone || '—'}</td>
                    <td className="px-4 py-3">
                      {u.isVerified
                        ? <FiCheckCircle size={16} className="text-green-400" />
                        : <FiXCircle size={16} className="text-red-400" />
                      }
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        u.role === 'admin' ? 'bg-primary-500/15 text-primary-400' : 'bg-gray-500/15 text-gray-400'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm whitespace-nowrap">
                      {format(new Date(u.createdAt), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
              <span className="text-gray-400 text-sm">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}
                  className="px-3 py-1.5 glass rounded-lg text-sm text-gray-300 hover:text-white disabled:opacity-40">← Prev</button>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}
                  className="px-3 py-1.5 glass rounded-lg text-sm text-gray-300 hover:text-white disabled:opacity-40">Next →</button>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
