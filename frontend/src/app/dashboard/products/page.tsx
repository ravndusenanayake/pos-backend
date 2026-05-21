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
import { ShieldAlert, Plus, RefreshCw, ShoppingCart } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  category_id: number;
  product_type: 'FINISHED' | 'RECIPE';
  price: string | number;
  quantity: number;
  image: string | null;
  status: boolean;
  category: Category;
}

export default function ProductsPage() {
  const { user, token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:3000/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to retrieve products database');
      }

      const data = await res.json();
      setProducts(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error occurred while loading products';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
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

  // Helper to format currency
  const formatPrice = (price: string | number) => {
    const num = Number(price);
    return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
  };

  // Helper to render Stock badge dynamically
  const renderStockBadge = (product: Product) => {
    if (product.product_type === 'RECIPE') {
      return (
        <span className="text-xs text-slate-500 font-medium italic">
          N/A (Recipe Type)
        </span>
      );
    }

    const qty = product.quantity;
    if (qty === 0) {
      return (
        <Badge className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold">
          Out of Stock (0)
        </Badge>
      );
    }
    if (qty <= 5) {
      return (
        <Badge className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[10px] font-bold">
          Low Stock ({qty})
        </Badge>
      );
    }
    return (
      <Badge className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
        Healthy ({qty})
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-200">Products Inventory</h1>
          <p className="text-sm text-slate-400 mt-1">Manage and view catalog pricing, stock levels, and classifications.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchProducts} 
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
            Add Product
          </Button>
        </div>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="rounded-xl border border-slate-900 bg-slate-950/20 p-24 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mb-4" />
          <p className="text-sm text-slate-400 font-medium animate-pulse">Syncing products from POS...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center text-red-400">
          ⚠️ {error}
          <div className="mt-4">
            <Button onClick={fetchProducts} variant="outline" size="sm" className="border-red-500/20 text-red-400 hover:bg-red-500/10">
              Retry Sync
            </Button>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-slate-900 border-dashed bg-slate-950/10 p-20 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-slate-500 mb-4">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No Products Registered</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Get started by registering a product item. Click the &quot;Add Product&quot; button above.
          </p>
        </div>
      ) : (
        /* Products Data Table */
        <div className="rounded-xl border border-slate-900 bg-slate-900/40 backdrop-blur-md overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-900/80 border-slate-800">
              <TableRow className="border-slate-900 hover:bg-slate-900/80">
                <TableHead className="w-[80px] text-slate-400 font-bold">Code</TableHead>
                <TableHead className="text-slate-400 font-bold">Product Item</TableHead>
                <TableHead className="text-slate-400 font-bold">Category</TableHead>
                <TableHead className="w-[120px] text-slate-400 font-bold text-center">Type</TableHead>
                <TableHead className="w-[100px] text-slate-400 font-bold text-right">Price</TableHead>
                <TableHead className="w-[150px] text-slate-400 font-bold text-center">Inventory Level</TableHead>
                <TableHead className="w-[100px] text-slate-400 font-bold text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="border-slate-800">
              {products.map((product) => (
                <TableRow key={product.id} className="border-slate-900 hover:bg-slate-900/40 transition-colors">
                  <TableCell className="font-mono text-xs text-slate-500 font-semibold">
                    #PRD-{product.id.toString().padStart(3, '0')}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-200">{product.name}</TableCell>
                  <TableCell className="text-slate-400 text-sm">
                    {product.category?.name || 'Unassigned'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider ${
                      product.product_type === 'FINISHED' 
                        ? 'border-indigo-500/30 text-indigo-400 bg-indigo-500/5' 
                        : 'border-amber-500/30 text-amber-400 bg-amber-500/5'
                    }`}>
                      {product.product_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium text-emerald-400">
                    {formatPrice(product.price)}
                  </TableCell>
                  <TableCell className="text-center">
                    {renderStockBadge(product)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      product.status 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/25'
                    }`}>
                      {product.status ? 'Active' : 'Inactive'}
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
