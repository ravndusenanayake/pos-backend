'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, RefreshCw, Trash2, Plus, Minus, CreditCard, ShieldCheck } from 'lucide-react';

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

interface CartItem {
  product: Product;
  qty: number;
}

interface SuccessInvoiceItem {
  id: number;
  qty: number;
  product?: {
    name: string;
  };
  total: string | number;
}

interface SuccessInvoice {
  invoice_no: string;
  cashier?: {
    name: string;
    email: string;
  };
  created_at: string | Date;
  items?: SuccessInvoiceItem[];
  subtotal: string | number;
  discount: string | number;
  total: string | number;
}

export default function PosPage() {
  const { user, token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInvoice, setSuccessInvoice] = useState<SuccessInvoice | null>(null);

  const fetchProducts = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:3000/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      // Only display active products in POS
      setProducts(data.filter((p: Product) => p.status));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error fetching catalog';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Cart operations
  const addToCart = (product: Product) => {
    setSuccessInvoice(null);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        // If finished type, guard against stock level
        if (product.product_type === 'FINISHED' && existing.qty >= product.quantity) {
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      // First item
      if (product.product_type === 'FINISHED' && product.quantity <= 0) {
        return prev; // No stock
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (productId: number, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === productId);
      if (!existing) return prev;
      const newQty = existing.qty + delta;
      if (newQty <= 0) {
        return prev.filter((item) => item.product.id !== productId);
      }
      if (existing.product.product_type === 'FINISHED' && newQty > existing.product.quantity) {
        return prev; // Exceeds stock
      }
      return prev.map((item) =>
        item.product.id === productId ? { ...item, qty: newQty } : item
      );
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Subtotal & totals
  const subtotal = cart.reduce((sum, item) => sum + Number(item.product.price) * item.qty, 0);
  const total = Math.max(0, subtotal - discount);

  // Submit Checkout to Express Backend API
  const handleCheckout = async () => {
    if (!token || !user) return;
    if (cart.length === 0) return;

    setCheckoutLoading(true);
    setError(null);
    setSuccessInvoice(null);

    const payload = {
      cashier_id: user.id,
      payment_method: paymentMethod,
      discount: Number(discount),
      items: cart.map((item) => ({
        product_id: item.product.id,
        qty: item.qty
      }))
    };

    try {
      const res = await fetch('http://localhost:3000/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Checkout transaction failed');
      }

      // Success
      setSuccessInvoice(data.sale);
      setCart([]);
      setDiscount(0);
      // Reload catalog to refresh stock counts
      fetchProducts();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error occurred during checkout';
      setError(msg);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 1. Products Selection Grid */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-200">Juice Catalog</h2>
            <p className="text-xs text-slate-400">Click on any product item to add to active sale</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchProducts} className="border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-900/40">
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Sync Catalog
          </Button>
        </div>

        {error && !checkoutLoading && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-slate-900 bg-slate-950/20">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading catalog items...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-slate-900 border-dashed text-slate-500">
            No active products found in POS catalog database.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => {
              const outOfStock = product.product_type === 'FINISHED' && product.quantity <= 0;
              return (
                <Card 
                  key={product.id}
                  onClick={() => !outOfStock && addToCart(product)}
                  className={`backdrop-blur-sm bg-slate-900/40 border-slate-900/80 transition-all duration-200 cursor-pointer overflow-hidden ${
                    outOfStock 
                      ? 'opacity-40 cursor-not-allowed border-slate-950' 
                      : 'hover:border-emerald-500/40 hover:bg-slate-900/70 hover:scale-[1.02]'
                  }`}
                >
                  <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                    <div className="flex justify-between items-start">
                      <Badge className={`text-[9px] font-bold py-0 ${
                        product.product_type === 'FINISHED' 
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {product.product_type}
                      </Badge>
                      <span className="text-xs font-semibold text-emerald-400">
                        ${Number(product.price).toFixed(2)}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-slate-200 line-clamp-1">{product.name}</h3>
                      <p className="text-[10px] text-slate-500">{product.category?.name || 'Beverage'}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-400 flex justify-between items-center">
                      <span>Stock level:</span>
                      {product.product_type === 'RECIPE' ? (
                        <span className="italic text-slate-600">Recipe</span>
                      ) : (
                        <span className={`font-bold ${product.quantity <= 5 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                          {product.quantity} left
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Cart & Checkout Details Panel */}
      <div className="space-y-6">
        <Card className="backdrop-blur-md bg-slate-900/60 border-slate-800/80 flex flex-col h-[75vh]">
          <CardHeader className="border-b border-slate-900 px-6 py-4 flex flex-row items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-emerald-400" />
            <CardTitle className="text-lg font-bold text-slate-200">Active Cart</CardTitle>
          </CardHeader>

          {/* Cart Scroll Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center gap-2">
                🍊
                <p className="text-xs font-semibold">Active Cart is Empty</p>
                <p className="text-[10px] text-slate-600 max-w-[180px]">Add juice items from catalog to start POS billing</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center bg-slate-950/40 p-3 rounded-lg border border-slate-900/60">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate text-slate-200">{item.product.name}</p>
                    <p className="text-[10px] text-emerald-400 font-mono">${Number(item.product.price).toFixed(2)} each</p>
                  </div>
                  
                  <div className="flex items-center gap-2.5">
                    <button 
                      onClick={() => updateQty(item.product.id, -1)}
                      className="h-5 w-5 rounded bg-slate-900 flex items-center justify-center border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 text-xs"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                    <button 
                      onClick={() => updateQty(item.product.id, 1)}
                      className="h-5 w-5 rounded bg-slate-900 flex items-center justify-center border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 text-xs"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="h-5 w-5 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded flex items-center justify-center text-xs ml-1 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pricing & Checkout Section */}
          <div className="p-6 border-t border-slate-900 bg-slate-950/40 space-y-4 rounded-b-xl">
            {/* Discount & Payment Configuration */}
            {cart.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="discount" className="text-[10px] text-slate-400">Discount Amount ($)</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      step="0.01"
                      className="h-8 bg-slate-950 border-slate-800 text-xs mt-1 text-slate-200 focus-visible:ring-emerald-500 focus-visible:ring-offset-slate-950"
                      value={discount || ''}
                      onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment" className="text-[10px] text-slate-400">Payment Option</Label>
                    <select
                      id="payment"
                      className="w-full h-8 rounded-md bg-slate-950 border border-slate-800 text-xs mt-1 px-2.5 text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="CASH">Cash</option>
                      <option value="CARD">Debit / Credit</option>
                      <option value="MOBILE">Mobile Pay</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Calculations display */}
            <div className="space-y-1.5 text-xs text-slate-400 pt-2">
              <div className="flex justify-between">
                <span>Total Items Bill:</span>
                <span className="font-mono text-slate-200">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-400">
                <span>Discount applied:</span>
                <span className="font-mono">-${Number(discount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-200 pt-1.5 border-t border-slate-900">
                <span>Final Invoice Total:</span>
                <span className="font-mono text-emerald-400">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <Button
              onClick={handleCheckout}
              disabled={checkoutLoading || cart.length === 0}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 hover:from-emerald-400 hover:to-emerald-500 font-bold"
            >
              {checkoutLoading ? (
                <div className="flex items-center justify-center gap-1.5">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  Creating Invoice...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <CreditCard className="h-4.5 w-4.5" />
                  Complete Checkout
                </div>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Invoice receipt print popup */}
      {successInvoice && (
        <div className="lg:col-span-3 z-30 fixed inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
          <Card className="w-full max-w-md bg-slate-900 border-emerald-500/20 shadow-2xl relative">
            <CardHeader className="text-center border-b border-slate-800">
              <div className="h-10 w-10 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <CardTitle className="text-emerald-400 font-bold">Transaction Confirmed</CardTitle>
              <p className="text-[10px] text-slate-500 mt-1">Invoice registered in POS records</p>
            </CardHeader>

            <CardContent className="p-6 space-y-4 font-mono text-xs text-slate-300">
              <div className="flex justify-between text-slate-500 text-[10px]">
                <span>INVOICE NO:</span>
                <span className="text-emerald-400 font-bold">{successInvoice.invoice_no}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[10px]">
                <span>CASHIER:</span>
                <span>{successInvoice.cashier?.name} ({successInvoice.cashier?.email})</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[10px] border-b border-slate-800 pb-2">
                <span>DATE:</span>
                <span>{new Date(successInvoice.created_at).toLocaleString()}</span>
              </div>

              {/* Items listing */}
              <div className="space-y-1.5 py-2 max-h-40 overflow-y-auto">
                {successInvoice.items?.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.qty}x {item.product?.name}</span>
                    <span>${Number(item.total).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Bill Details */}
              <div className="border-t border-slate-800 pt-3 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${Number(successInvoice.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Discount:</span>
                  <span>-${Number(successInvoice.discount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold text-sm border-t border-dashed border-slate-800 pt-2 mt-2">
                  <span>Grand Total:</span>
                  <span>${Number(successInvoice.total).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>

            <div className="p-6 border-t border-slate-800 flex gap-4">
              <Button onClick={() => setSuccessInvoice(null)} className="w-full bg-slate-800 text-slate-200 hover:bg-slate-700">
                Dismiss Receipt
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
