import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../../api'
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers'
import { Loader } from '../../components/Loader'

const orderStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function AdminOrders() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter, page],
    queryFn: () => adminAPI.getOrders({ status: statusFilter || undefined, page, limit: 20 }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateOrderStatus(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Orders</h1>
          <p className="text-pm-gray text-sm">Manage customer orders</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setStatusFilter('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${!statusFilter ? 'bg-pm-secondary text-pm-primary' : 'bg-pm-light dark:bg-pm-primary/30 text-pm-gray'}`}>All</button>
          {orderStatuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${statusFilter === s ? 'bg-pm-secondary text-pm-primary' : 'bg-pm-light dark:bg-pm-primary/30 text-pm-gray'}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-pm-border dark:border-white/5">
                <th className="text-left px-4 py-3 font-medium">Order #</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Items</th>
                <th className="text-left px-4 py-3 font-medium">Total</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Payment</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <tr><td colSpan={8} className="text-center py-8"><Loader /></td></tr> : (
                data?.orders?.map(order => (
                  <tr key={order.id} className="border-b border-pm-border dark:border-white/5 hover:bg-white/50 dark:hover:bg-pm-primary/20 transition">
                    <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                    <td className="px-4 py-3">{order.user?.firstName} {order.user?.lastName}</td>
                    <td className="px-4 py-3">{order.items?.length}</td>
                    <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <select value={order.status} onChange={(e) => updateMutation.mutate({ id: order.id, data: { status: e.target.value } })} className={`text-xs px-2 py-1 rounded-lg font-medium border-0 outline-none ${getStatusColor(order.status)}`}>
                        {orderStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>{order.paymentStatus}</span>
                    </td>
                    <td className="px-4 py-3 text-pm-gray text-xs">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-pm-secondary hover:text-pm-secondary-light text-xs font-medium">View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {data?.pagination?.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).slice(0, 10).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`h-9 w-9 rounded-lg text-sm font-medium transition ${p === page ? 'bg-pm-secondary text-pm-primary' : 'border border-pm-border dark:border-white/10 hover:bg-pm-light dark:hover:bg-pm-primary/30'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  )
}
