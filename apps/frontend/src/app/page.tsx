import Link from 'next/link';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@prontoplus/ui';
import { Phone, Calendar, Users, Shield } from 'lucide-react';
import { DemoSection } from '@/components/demo/demo-section';
import DemoPhoneCTA from '@/components/DemoPhoneCTA';
import DemoScenarios from '@/components/demo/demo-scenarios';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-24 sm:py-32">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl">
              AI-Powered Receptionist for{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Orthodontists
              </span>
            </h1>
            
            <p className="mb-8 text-xl text-muted-foreground">
              Streamline your practice with intelligent appointment scheduling,
              patient communication, and practice management.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="#demo">
                <Button size="lg" className="text-lg">
                  <Phone className="mr-2 h-5 w-5" />
                  Try Demo
                </Button>
              </Link>
              
              <Link href="/health">
                <Button size="lg" variant="outline" className="text-lg">
                  Check API Status
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/50">
        <div className="container px-4">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Everything You Need to Run Your Practice
              </h2>
              <p className="text-lg text-muted-foreground">
                Powerful features designed specifically for orthodontic practices
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Smart Scheduling</CardTitle>
                  <CardDescription>
                    AI-powered appointment scheduling that adapts to your practice
                    patterns and patient preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> Automated scheduling
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> Smart conflict detection
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> Waitlist management
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Patient Communication</CardTitle>
                  <CardDescription>
                    Automated patient reminders, follow-ups, and communication
                    that keeps your patients engaged.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> SMS reminders
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> Email automation
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> Appointment confirmations
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>AI Receptionist</CardTitle>
                  <CardDescription>
                    Handle calls 24/7 with an intelligent virtual receptionist
                    that sounds natural and professional.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> 24/7 availability
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> Natural language processing
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> Call analytics
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Secure & Compliant</CardTitle>
                  <CardDescription>
                    Built with healthcare compliance in mind. HIPAA compliant
                    and SOC 2 certified.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> HIPAA compliant
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> Encrypted data
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> Regular audits
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Flag Demo Section */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl">
            <DemoSection />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="demo" className="py-24">
        <div className="container px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Transform Your Practice?
              </h2>
              <p className="text-lg text-muted-foreground">
                Call our AI receptionist demo and experience the future of orthodontic patient management
              </p>
            </div>
            <DemoPhoneCTA />
          </div>
        </div>
      </section>

      {/* Demo Scenarios Section */}
      <DemoScenarios />
    </div>
  );
}
