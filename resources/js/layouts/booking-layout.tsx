import ProgressBar from '@/components/booking/ProgressBar';
import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { BookingThemeProvider } from '@/contexts/BookingThemeProvider';

interface BookingLayoutProps {
  children: ReactNode;
  currentStep?: number;
  totalSteps?: number;
}

export default function BookingLayout({
  children,
  currentStep,
  totalSteps = 3,
}: BookingLayoutProps) {
  return (
    <BookingThemeProvider>
      <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-foreground md:text-2xl">
              Quinta de Colliguay
            </span>
          </Link>

          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            <Link
              href="/"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Inicio
            </Link>
          </nav>
        </div>
      </header>

      {/* Progress Bar */}
      {currentStep !== undefined && (
        <ProgressBar current={currentStep} total={totalSteps} />
      )}

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-8 md:py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-muted/30">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Quinta de Colliguay. Todos los
            derechos reservados.
          </p>
        </div>
      </footer>
    </div>
    </BookingThemeProvider>
  );
}
