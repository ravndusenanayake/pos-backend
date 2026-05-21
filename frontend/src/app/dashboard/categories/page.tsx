'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Plus, RefreshCw, Layers } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  status: boolean;
}

export default function CategoriesPage() {
  const { user, token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:3000/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to retrieve categories database');
      }

      const data = await res.json();
      setCategories(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error occurred while loading categories';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Authorization Guard: Super Admin Access Only
  const isSuperAdmin = user?.role?.name === 'SUPER_ADMIN';
  if (!isSuperAdmin) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center px-4">
        <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4 animate-bounce">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-100">Access Privileges Insufficient</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-sm">
          This secure database view is restricted to Super Administrator roles only. Please contact system support for authorization.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-200">Categories Inventory</h1>
          <p className="text-sm text-slate-400 mt-1">Manage and view your product classifications.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchCategories} 
            className="border-slate-800 text-slate-300 bg-slate-900/40 hover:bg-slate-900/80"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </Button>
          <Button 
            size="sm" 
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Categories Database Loader */}
      {loading ? (
        <div className="rounded-xl border border-slate-900 bg-slate-950/20 p-24 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mb-4" />
          <p className="text-sm text-slate-400 font-medium animate-pulse">Syncing categories from POS...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center text-red-400">
          ⚠️ {error}
          <div className="mt-4">
            <Button onClick={fetchCategories} variant="outline" size="sm" className="border-red-500/20 text-red-400 hover:bg-red-500/10">
              Retry Sync
            </Button>
          </div>
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-slate-900 border-dashed bg-slate-950/10 p-20 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-slate-500 mb-4">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No Categories Registered</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Get started by creating your very first category definition. Click the &quot;Add Category&quot; button above.
          </p>
        </div>
      ) : (
        /* Categories Datatable */
        <div className="rounded-xl border border-slate-900 bg-slate-900/40 backdrop-blur-md overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-900/80 border-slate-800">
              <TableRow className="border-slate-900 hover:bg-slate-900/80">
                <TableHead className="w-[100px] text-slate-400 font-bold">Category ID</TableHead>
                <TableHead className="text-slate-400 font-bold">Classification Name</TableHead>
                <TableHead className="w-[120px] text-slate-400 font-bold text-center">Status Badge</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="border-slate-800">
              {categories.map((category) => (
                <TableRow key={category.id} className="border-slate-900 hover:bg-slate-900/40 transition-colors">
                  <TableCell className="font-mono text-xs text-slate-500 font-semibold">
                    #CAT-{category.id.toString().padStart(3, '0')}
                  </TableCell>
                  <TableCell className="font-medium text-slate-200">{category.name}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      category.status 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/25'
                    }`}>
                      {category.status ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
