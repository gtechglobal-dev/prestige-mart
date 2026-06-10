import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminAPI } from '../../api'
import { formatDate } from '../../utils/helpers'
import { Loader } from '../../components/Loader'

export default function AdminCustomers() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', page],
    queryFn: () => adminAPI.getCustomers({ page, limit: 20 }),
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading">Customers</h1>
        <p className="text-pm-gray text-sm">View and manage customers</p>
      </div>

      <div className="bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-pm-border dark:border-white/5">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Phone</th>
                <th className="text-left px-4 py-3 font-medium">Orders</th>
                <th className="text-left px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <tr><td colSpan={5} className="text-center py-8"><Loader /></td></tr> : (
                data?.customers?.map(customer => (
                  <tr key={customer.id} className="border-b border-pm-border dark:border-white/5 hover:bg-white/50 dark:hover:bg-pm-primary/20 transition">
                    <td className="px-4 py-3 font-medium">{customer.firstName} {customer.lastName}</td>
                    <td className="px-4 py-3 text-pm-gray">{customer.email}</td>
                    <td className="px-4 py-3 text-pm-gray">{customer.phone || '-'}</td>
                    <td className="px-4 py-3">{customer._count?.orders || 0}</td>
                    <td className="px-4 py-3 text-pm-gray text-xs">{formatDate(customer.createdAt)}</td>
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
