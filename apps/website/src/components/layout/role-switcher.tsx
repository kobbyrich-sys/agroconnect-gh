'use client';

import { useAuth } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';

const ROLE_LABELS: Record<string, string> = {
  buyer: 'Buyer',
  seller: 'Seller',
};

const ROLE_ICONS: Record<string, string> = {
  buyer: '🛒',
  seller: '🏪',
};

const ROLE_MEMORY_KEY = 'agroconnect_role_memory';
const NAV_MEMORY_KEY = 'agroconnect_nav_memory';

export function RoleSwitcher() {
  const { user, activeRole, roles, switchRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (!user || roles.length < 2) return null;

  const otherRole = roles.find(r => r !== activeRole);
  if (!otherRole) return null;

  const handleSwitch = () => {
    // Save current path for this role
    const memory = JSON.parse(localStorage.getItem(NAV_MEMORY_KEY) || '{}');
    memory[activeRole] = pathname;
    localStorage.setItem(NAV_MEMORY_KEY, JSON.stringify(memory));

    // Switch role
    switchRole(otherRole);

    // Navigate to saved path for the new role, or default
    const savedPath = memory[otherRole];
    if (savedPath && savedPath !== pathname) {
      router.push(savedPath);
    } else {
      router.push(otherRole === 'seller' ? '/dashboard' : '/marketplace');
    }
  };

  return (
    <button
      onClick={handleSwitch}
      className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-xs transition-colors hover:bg-gray-50"
      title={`Switch to ${ROLE_LABELS[otherRole] || otherRole} mode`}
    >
      <span className="text-xs">{ROLE_ICONS[otherRole] || '🔄'}</span>
      <span>Switch to {ROLE_LABELS[otherRole] || otherRole}</span>
    </button>
  );
}
