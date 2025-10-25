import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">ProntoPlus</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered receptionist solution for orthodontic practices
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Quick Links</h4>
            <nav className="flex flex-col space-y-1">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                href="/health"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Health Check
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Legal</h4>
            <nav className="flex flex-col space-y-1">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Contact</h4>
            <a
              href="mailto:support@prontoplus.com"
              className="block text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              support@prontoplus.com
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} ProntoPlus. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
