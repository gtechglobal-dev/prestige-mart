import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProductCard from '../components/ProductCard'
import { Loader } from '../components/Loader'
import SEO from '../components/SEO'
import { productAPI, categoryAPI } from '../api'

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [priceRange, setPriceRange] = useState([0, 5000000])
  const [showFilters, setShowFilters] = useState(false)

  const params = {
    category: searchParams.get('category') || undefined,
    search: searchParams.get('search') || undefined,
    sort: searchParams.get('sort') || 'newest',
    minPrice: searchParams.get('minPrice') || undefined,
    maxPrice: searchParams.get('maxPrice') || undefined,
    page: searchParams.get('page') || '1',
  }

  const { data, isLoading } = useQuery({
    queryKey: ['products', params],
    queryFn: () => productAPI.getAll(params),
    keepPreviousData: true,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryAPI.getAll,
  })

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) newParams.set(key, value)
      else newParams.delete(key)
    })
    if (updates.page === undefined) newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'name_asc', label: 'Name: A-Z' },
  ]

  return (
    <>
      <SEO title="Shop" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Categories</h3>
                <div className="space-y-2">
                  <button onClick={() => updateParams({ category: '' })} className={`block w-full text-left text-sm py-1.5 px-3 rounded-lg transition ${!searchParams.get('category') ? 'bg-pm-secondary/10 text-pm-secondary font-medium' : 'text-pm-gray hover:text-pm-primary dark:hover:text-white'}`}>
                    All Products
                  </button>
                  {categories?.map(cat => (
                    <button key={cat.slug} onClick={() => updateParams({ category: cat.id })} className={`block w-full text-left text-sm py-1.5 px-3 rounded-lg transition ${searchParams.get('category') === cat.id ? 'bg-pm-secondary/10 text-pm-secondary font-medium' : 'text-pm-gray hover:text-pm-primary dark:hover:text-white'}`}>
                      {cat.name} ({cat._count?.products || 0})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Price Range</h3>
                <div className="space-y-3">
                  <input type="range" min="0" max="5000000" step="10000" value={priceRange[0]} onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])} className="w-full accent-pm-secondary" />
                  <input type="range" min="0" max="5000000" step="10000" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} className="w-full accent-pm-secondary" />
                  <div className="flex items-center justify-between text-sm text-pm-gray">
                    <span>₦{priceRange[0].toLocaleString()}</span>
                    <span>₦{priceRange[1].toLocaleString()}</span>
                  </div>
                  <button onClick={() => updateParams({ minPrice: priceRange[0], maxPrice: priceRange[1] })} className="w-full bg-pm-primary text-white dark:bg-pm-secondary dark:text-pm-primary text-sm py-2 rounded-lg hover:opacity-90 transition">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-heading">Shop</h1>
                <p className="text-sm text-pm-gray mt-1">{data?.pagination?.total || 0} products found</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden text-sm px-4 py-2 border border-pm-border dark:border-white/10 rounded-lg hover:bg-pm-light dark:hover:bg-pm-primary/30 transition">
                  Filters
                </button>
                <select value={params.sort} onChange={(e) => updateParams({ sort: e.target.value })} className="text-sm bg-transparent border border-pm-border dark:border-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-pm-secondary">
                  {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {isLoading ? <Loader className="py-20" /> : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {data?.products?.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                </div>

                {data?.products?.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-pm-gray">No products found matching your criteria.</p>
                  </div>
                )}

                {data?.pagination?.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map(page => (
                      <button key={page} onClick={() => updateParams({ page: String(page) })} className={`h-10 w-10 rounded-lg text-sm font-medium transition ${page === data.pagination.page ? 'bg-pm-secondary text-pm-primary' : 'border border-pm-border dark:border-white/10 hover:bg-pm-light dark:hover:bg-pm-primary/30'}`}>
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
