import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { store } from '@/app/store'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/routes'
import { ToastProvider } from '@/lib/toast'
import '@/styles/globals.css'
import '@/lib/i18n'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <RouterProvider router={router} />
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </ToastProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
)
