export function Loader({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-6 w-6', md: 'h-10 w-10', lg: 'h-16 w-16' }
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizes[size]} border-4 border-pm-border border-t-pm-secondary rounded-full animate-spin`} />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 border-4 border-pm-border border-t-pm-secondary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-pm-gray">Loading...</p>
      </div>
    </div>
  )
}
