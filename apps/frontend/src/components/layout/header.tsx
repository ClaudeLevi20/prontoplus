'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun, Menu, X, Phone } from 'lucide-react';
import { Button } from '@prontoplus/ui';

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            ProntoPlus
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link
            href="/health"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Health
          </Link>
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Demo Phone Number */}
          <a 
            href={`tel:${process.env.NEXT_PUBLIC_DEMO_PHONE_NUMBER || '+15551234567'}`}
            className="hidden md:flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            <Phone className="h-4 w-4 mr-1" />
            Demo: {process.env.NEXT_PUBLIC_DEMO_PHONE_NUMBER || '(555) 123-4567'}
          </a>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
            aria-label="Toggle theme"
          >
            {mounted && theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container px-4 py-4 space-y-2">
            <Link
              href="/"
              className="block py-2 text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/health"
              className="block py-2 text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Health
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
