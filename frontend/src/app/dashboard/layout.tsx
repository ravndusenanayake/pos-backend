'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  Tags, 
  Layers, 
  LogOut, 
  User as UserIcon, 
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If auth loading is done and there is no active token, redirect to login
    if (!loading && !token) {
      router.push('/login');
    }
  }, [token, loading, router]);

  // Loading Screen
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-slate-400 font-medium">Authorizing secure session...</p>
        </div>
      </div>
    );
  }

  // Guard: if not authenticated, do not show any layout content while redirecting
  if (!token || !user) {
    return null;
  }

  const roleName = user.role?.name || 'CASHIER';
  const isSuperAdmin = roleName === 'SUPER_ADMIN';

  // Navigation Items
  const menuItems = [
    {
      name: 'POS Terminal',
      href: '/dashboard/pos',
      icon: ShoppingBag,
      allowedRoles: ['SUPER_ADMIN', 'CASHIER'],
    },
    {
      name: 'Categories',
      href: '/dashboard/categories',
      icon: Tags,
      allowedRoles: ['SUPER_ADMIN'],
    },
    {
      name: 'Products',
      href: '/dashboard/products',
      icon: Layers,
      allowedRoles: ['SUPER_ADMIN'],
    },
  ];

  const filteredMenuItems = menuItems.filter(item => item.allowedRoles.includes(roleName));

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar Panel */}
      <aside className="w-64 border-r border-slate-900 bg-slate-950/80 backdrop-blur-md flex flex-col z-20">
        {/* Sidebar Header Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-900 gap-3">
          <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
            🍊
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">
            Juice Bar POS
          </span>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">
            Navigation Menu
          </div>
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Card */}
        <div className="p-4 border-t border-slate-900 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-slate-300">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-200">{user.name}</p>
              <p className="text-xs truncate text-slate-500">{user.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full flex items-center justify-start gap-3 px-3 py-2 text-red-400 hover:bg-red-500/5 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Logout Session</span>
          </Button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/60 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className="h-5 w-5 text-emerald-400" />
            <h2 className="font-bold text-lg text-slate-200">
              {pathname === '/dashboard/pos' ? 'POS terminal' : pathname === '/dashboard/categories' ? 'Categories database' : pathname === '/dashboard/products' ? 'Products database' : 'Operations Dashboard'}
            </h2>
          </div>

          {/* User Role Badge */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <Badge className={`px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider text-[10px] ${
                isSuperAdmin 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              }`}>
                {roleName.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </header>

        {/* Dashboard Main Router outlet */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-950/40">
          {children}
        </main>
      </div>
    </div>
  );
}
