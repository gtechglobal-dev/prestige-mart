import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../../api'
import { formatPrice } from '../../utils/helpers'
import { Loader } from '../../components/Loader'

export default function AdminProducts() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', comparePrice: '', sku: '', stock: '', categoryId: '', brand: '', tags: '', images: [], isFeatured: false })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminAPI.getOrders({ limit: 100 }),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => import('../../api').then(m => m.categoryAPI.getAll()),
  })

  const createMutation = useMutation({
    mutationFn: (data) => adminAPI.createProduct(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); setShowForm(false); resetForm() }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] })
  })

  const resetForm = () => setForm({ name: '', description: '', price: '', comparePrice: '', sku: '', stock: '', categoryId: '', brand: '', tags: '', images: [], isFeatured: false })

  const handleSubmit = (e) => {
    e.preventDefault()
    createMutation.mutate({
      ...form,
      price: parseFloat(form.price),
      comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
      stock: parseInt(form.stock) || 0,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Products</h1>
          <p className="text-pm-gray text-sm">Manage your product catalog</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); resetForm() }} className="bg-pm-secondary text-pm-primary px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-pm-secondary-light transition">
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5">
          <h2 className="font-semibold mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary text-sm resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price (₦)</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Compare Price (₦)</label>
              <input type="number" value={form.comparePrice} onChange={e => setForm(f => ({ ...f, comparePrice: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input type="text" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} required className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary text-sm">
                <option value="">Select category</option>
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <input type="text" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
              <input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary text-sm" placeholder="e.g., premium, luxury, new" />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="accent-pm-secondary" />
                Featured Product
              </label>
            </div>
          </div>
          <button type="submit" disabled={createMutation.isPending} className="mt-4 bg-pm-secondary text-pm-primary px-8 py-2.5 rounded-xl font-medium hover:bg-pm-secondary-light transition disabled:opacity-50">
            {createMutation.isPending ? 'Creating...' : editingId ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      )}

      <div className="bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-pm-border dark:border-white/5">
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium">SKU</th>
                <th className="text-left px-4 py-3 font-medium">Price</th>
                <th className="text-left px-4 py-3 font-medium">Stock</th>
                <th className="text-left px-4 py-3 font-medium">Sales</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <tr><td colSpan={6} className="text-center py-8"><Loader /></td></tr> : (
                data?.orders?.map((order, i) => (
                  <tr key={order.id} className="border-b border-pm-border dark:border-white/5 hover:bg-white/50 dark:hover:bg-pm-primary/20 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-pm-light dark:bg-pm-primary/50 overflow-hidden flex-shrink-0">
                          <img src={`https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=100`} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-medium">Product {i + 1}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-pm-gray">SKU-{i + 100}</td>
                    <td className="px-4 py-3 font-medium">{formatPrice(Math.floor(Math.random() * 500000 + 50000))}</td>
                    <td className="px-4 py-3">{Math.floor(Math.random() * 100 + 1)}</td>
                    <td className="px-4 py-3">{Math.floor(Math.random() * 200)}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-pm-secondary hover:text-pm-secondary-light text-xs font-medium mr-3">Edit</button>
                      <button className="text-red-500 hover:text-red-600 text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
