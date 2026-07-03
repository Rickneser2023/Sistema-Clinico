import './globals.css'
import DashboardLayout from '@/components/DashboardLayout'
import ThemeProvider from '@/components/ThemeProvider'
import AuthProvider from '@/components/AuthProvider'
import ToastProvider from '@/components/ToastProvider'
import ErrorBoundary from '@/components/ErrorBoundary'

export const metadata = {
  title: 'MediHist - Sistema de Gestión Clínica',
  description: 'Sistema de gestión de historias clínicas y dashboard médico profesional',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <ErrorBoundary>
                <DashboardLayout>
                  {children}
                </DashboardLayout>
              </ErrorBoundary>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
