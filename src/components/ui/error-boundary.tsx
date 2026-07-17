import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Button } from './button'

type Props = { children: ReactNode; fallback?: ReactNode }
type State = { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <h2 className="text-lg font-semibold text-earth-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-earth-500 mb-6">{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <Button onClick={() => { this.setState({ hasError: false }); window.location.reload() }}>
            Reload Page
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
