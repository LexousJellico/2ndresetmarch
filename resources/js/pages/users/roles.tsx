import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';

interface UserItem {
  id: number;
  name: string | null;
  email: string;
  roles: string[];
}

interface PageProps {
  users: UserItem[];
  availableRoles: string[];
}

const RolesPage: React.FC<PageProps> = ({ users, availableRoles }) => {
  const [localRoles, setLocalRoles] = useState<Record<number, string[]>>(
    Object.fromEntries(users.map(u => [u.id, u.roles]))
  );

  const handleChange = (userId: number, selected: string[]) => {
    setLocalRoles(prev => ({ ...prev, [userId]: selected }));
  };

  const submit = (userId: number) => {
    router.put(`/users/${userId}/roles`, { roles: localRoles[userId] }, {
      preserveScroll: true,
      onSuccess: () => {},
    });
  };

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold">Role Assignment</h1>
      <p className="text-sm text-gray-600">Manage user roles. Changes apply immediately.</p>
      <div className="overflow-x-auto border rounded-md bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2 font-medium">User</th>
              <th className="p-2 font-medium">Email</th>
              <th className="p-2 font-medium">Roles</th>
              <th className="p-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.name || '—'}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2 align-top">
                  <select
                    multiple
                    value={localRoles[u.id] || []}
                    onChange={e => {
                      const opts = Array.from(e.target.selectedOptions).map(o => o.value);
                      handleChange(u.id, opts);
                    }}
                    className="min-w-[160px] h-28 border rounded px-2 py-1 text-sm focus:outline-none focus:ring"
                  >
                    {availableRoles.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <div className="mt-1 text-xs text-gray-500">Ctrl/Cmd+Click to multi-select.</div>
                </td>
                <td className="p-2">
                  <button
                    onClick={() => submit(u.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 focus:outline-none"
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RolesPage;
