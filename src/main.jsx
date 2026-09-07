import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        gutter={12}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-surface)',
            color: 'var(--text-heading)',
            border: '1px solid var(--border-light)',
            borderLeft: '4px solid var(--gold)',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: 'var(--shadow-elevated)',
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            fontSize: '14px',
            fontWeight: 500,
            maxWidth: '420px',
          },
          success: {
            iconTheme: { primary: 'var(--emerald)', secondary: '#FFFFFF' },
            style: { borderLeftColor: 'var(--emerald)' },
          },
          error: {
            iconTheme: { primary: 'var(--danger)', secondary: '#FFFFFF' },
            style: { borderLeftColor: 'var(--danger)' },
          },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>,
)
