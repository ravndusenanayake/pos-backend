'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp } from 'lucide-react';

interface DashboardStats {
  todaySales: number;
  totalOrders: number;
  totalProducts: number;
  totalCashiers: number;
}

export default function DashboardIndexPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait until auth is loaded
    if (authLoading) return;

    // If user is a Cashier, automatically redirect to POS
    if (user?.role.name === 'CASHIER') {
      router.replace('/dashboard/pos');
      return;
    }

    // Fetch stats for Super Admin
    const fetchStats = async () => {
      if (!token) return;
      try {
        const res = await fetch('http://localhost:3000/api/sales/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch dashboard statistics');
        }
        
        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred loading stats');
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [user, token, authLoading, router]);

  if (authLoading || (user?.role.name === 'CASHIER')) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-slate-400 font-medium">Loading interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Dashboard Overview <TrendingUp className="h-6 w-6 text-emerald-400" />
          </h1>
          <p className="text-slate-400 mt-1">Real-time analytical insights and system status.</p>
        </div>
      </div>

      {error ? (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          ⚠️ {error}
        </div>
      ) : loadingStats || !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-slate-900/40 border-slate-800/80 animate-pulse h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Today's Sales */}
          <Card className="backdrop-blur-sm bg-slate-900/50 border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <DollarSign className="h-7 w-7 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Today's Revenue</p>
                <h3 className="text-2xl font-bold text-white tracking-tight mt-1">
                  ${stats.todaySales.toFixed(2)}
                </h3>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Total Orders */}
          <Card className="backdrop-blur-sm bg-slate-900/50 border-slate-800/80 hover:border-blue-500/50 hover:bg-slate-900/80 transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <ShoppingBag className="h-7 w-7 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Total Orders</p>
                <h3 className="text-2xl font-bold text-white tracking-tight mt-1">
                  {stats.totalOrders}
                </h3>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Total Products */}
          <Card className="backdrop-blur-sm bg-slate-900/50 border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900/80 transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <Package className="h-7 w-7 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Active Catalog</p>
                <h3 className="text-2xl font-bold text-white tracking-tight mt-1">
                  {stats.totalProducts}
                </h3>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Total Cashiers */}
          <Card className="backdrop-blur-sm bg-slate-900/50 border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                <Users className="h-7 w-7 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Total Cashiers</p>
                <h3 className="text-2xl font-bold text-white tracking-tight mt-1">
                  {stats.totalCashiers}
                </h3>
              </div>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}
