import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-pm-dark px-4">
          <div className="text-center max-w-md">
            <h1 className="text-6xl font-bold text-pm-secondary font-heading">Oops!</h1>
            <p className="text-pm-gray mt-4 text-lg">Something went wrong. Please try refreshing the page.</p>
            <button
              onClick={() => { localStorage.clear(); window.location.reload() }}
              className="mt-6 inline-block bg-pm-secondary text-pm-primary px-8 py-3 rounded-xl font-semibold hover:bg-pm-secondary-light transition"
            >
              Refresh & Clear Cache
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
