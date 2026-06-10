import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../../api'
import { formatDate } from '../../utils/helpers'
import { Loader } from '../../components/Loader'

export default function AdminCoupons() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', minOrder: '0', maxUses: '100', expiresAt: '' })

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: adminAPI.getCoupons,
  })

  const createMutation = useMutation({
    mutationFn: (data) => adminAPI.createCoupon(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-coupons'] }); setShowForm(false); setForm({ code: '', type: 'percentage', value: '', minOrder: '0', maxUses: '100', expiresAt: '' }) }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    createMutation.mutate({
      code: form.code,
      type: form.type,
      value: parseFloat(form.value),
      minOrder: parseFloat(form.minOrder || 0),
      maxUses: parseInt(form.maxUses || 100),
      expiresAt: form.expiresAt || null,
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Coupons</h1>
          <p className="text-pm-gray text-sm">Manage discount coupons</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-pm-secondary text-pm-primary px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-pm-secondary-light transition">
          {showForm ? 'Cancel' : '+ Create Coupon'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5">
          <h2 className="font-semibold mb-4">Create Coupon</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Code</label>
              <input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary text-sm" placeholder="WELCOME20" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary text-sm">
                <option value="percentage">Percentage</option>
                <option value="flat">Flat Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Value</label>
              <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} required className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min Order (₦)</label>
              <input type="number" value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Uses</label>
              <input type="number" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expires At</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary text-sm" />
            </div>
          </div>
          <button type="submit" disabled={createMutation.isPending} className="mt-4 bg-pm-secondary text-pm-primary px-8 py-2.5 rounded-xl font-medium hover:bg-pm-secondary-light transition disabled:opacity-50">
            {createMutation.isPending ? 'Creating...' : 'Create Coupon'}
          </button>
        </form>
      )}

      <div className="bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-pm-border dark:border-white/5">
                <th className="text-left px-4 py-3 font-medium">Code</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Value</th>
                <th className="text-left px-4 py-3 font-medium">Uses</th>
                <th className="text-left px-4 py-3 font-medium">Expires</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <tr><td colSpan={6} className="text-center py-8"><Loader /></td></tr> : (
                coupons?.map(coupon => (
                  <tr key={coupon.id} className="border-b border-pm-border dark:border-white/5 hover:bg-white/50 dark:hover:bg-pm-primary/20 transition">
                    <td className="px-4 py-3 font-medium">{coupon.code}</td>
                    <td className="px-4 py-3 capitalize">{coupon.type}</td>
                    <td className="px-4 py-3">{coupon.type === 'percentage' ? `${coupon.value}%` : `₦${coupon.value.toLocaleString()}`}</td>
                    <td className="px-4 py-3">{coupon.usedCount}/{coupon.maxUses}</td>
                    <td className="px-4 py-3 text-pm-gray text-xs">{coupon.expiresAt ? formatDate(coupon.expiresAt) : 'Never'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{coupon.isActive ? 'Active' : 'Inactive'}</span>
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
