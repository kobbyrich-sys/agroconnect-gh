import { createServerClient } from '@agroconnect/shared';

export default async function UsersPage() {
  const supabase = await createServerClient();
  const { data: users } = await supabase
    .from('profiles')
    .select(`
      id, full_name, email, phone, role, status, is_email_verified, created_at,
      user_roles!left(role)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  const roleColors: Record<string, string> = {
    buyer: 'bg-blue-50 text-blue-700',
    seller: 'bg-emerald-50 text-emerald-700',
    admin: 'bg-red-50 text-red-700',
  };

  function getRoles(user: any): string[] {
    const profileRole = user.role || 'buyer';
    const platformRoles = (user.user_roles || []).map((r: any) => r.role);
    const all = new Set([...platformRoles, profileRole]);
    return Array.from(all).filter(Boolean);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500">{users?.length ?? 0} users</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">User</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Role</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Joined</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u: any) => (
              <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                      {(u.full_name || 'U').charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.full_name || 'Unnamed'}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {getRoles(u).map(role => (
                      <span key={role} className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${roleColors[role] || 'bg-gray-50 text-gray-600'}`}>
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${
                    u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {u.status || 'active'}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-4 text-right">
                  <span className="text-sm text-gray-400">—</span>
                </td>
              </tr>
            ))}
            {(!users || users.length === 0) && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
