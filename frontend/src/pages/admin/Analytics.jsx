import { useQuery } from '@tanstack/react-query'
import { adminAPI } from '../../api'
import { formatPrice } from '../../utils/helpers'
import { PageLoader } from '../../components/Loader'

export default function AdminAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: adminAPI.getAnalytics,
  })

  if (isLoading) return <PageLoader />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading">Analytics</h1>
        <p className="text-pm-gray text-sm">Business performance insights</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5">
          <p className="text-xs text-pm-gray uppercase tracking-wider">This Month Revenue</p>
          <p className="text-2xl font-bold text-pm-secondary mt-1">{formatPrice(data?.thisMonthRevenue || 0)}</p>
        </div>
        <div className="p-5 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5">
          <p className="text-xs text-pm-gray uppercase tracking-wider">Last Month Revenue</p>
          <p className="text-2xl font-bold mt-1">{formatPrice(data?.lastMonthRevenue || 0)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="p-6 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5">
          <h2 className="font-semibold mb-4">Top Selling Products</h2>
          <div className="space-y-3">
            {data?.topProducts?.slice(0, 8).map((p, i) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-pm-gray font-medium w-6">{i + 1}.</span>
                  <span className="truncate">{p.name}</span>
                </div>
                <span className="font-medium flex-shrink-0 ml-4">{p.saleCount} sold</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5">
          <h2 className="font-semibold mb-4">Products by Category</h2>
          <div className="space-y-3">
            {data?.categoryStats?.map(cat => (
              <div key={cat.id} className="flex items-center justify-between text-sm">
                <span>{cat.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-pm-border dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-pm-secondary rounded-full" style={{ width: `${Math.min((cat._count?.products / Math.max(...(data.categoryStats.map(c => c._count?.products)))) * 100, 100)}%` }} />
                  </div>
                  <span className="text-pm-gray text-xs w-8 text-right">{cat._count?.products}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5">
        <h2 className="font-semibold mb-4">Monthly Revenue (12 Months)</h2>
        <div className="flex items-end gap-2 h-48">
          {data?.monthlyRevenue?.map((d, i) => {
            const max = Math.max(...(data?.monthlyRevenue?.map(r => Number(r.revenue)) || [0]), 1)
            const height = (Number(d.revenue) / max) * 100
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="w-full bg-pm-secondary/20 rounded-t relative" style={{ height: `${Math.max(height, 3)}%` }}>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 text-xs text-pm-gray whitespace-nowrap opacity-0 group-hover:opacity-100 transition bg-white dark:bg-pm-dark px-2 py-1 rounded shadow">{formatPrice(Number(d.revenue))}</div>
                </div>
                <span className="text-[10px] text-pm-gray mt-1">
                  {new Date(d.month).toLocaleString('default', { month: 'short' })}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
