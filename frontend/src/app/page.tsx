'use client';

import React from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppTopbar } from '@/components/layout/AppTopbar';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Code2, Sparkles, Play, Search, Terminal, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Phase1TestPage() {
  const presenceDemo = [
    { userId: '1', name: 'Alex Developer', color: '#6366f1' },
    { userId: '2', name: 'Sarah Engineer', color: '#10b981' },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080c14] text-slate-100">
      {/* Sidebar Component */}
      <AppSidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Topbar Component */}
        <AppTopbar
          title="Phase 1 Design Tokens & Primitives Test Showcase"
          breadcrumbs={[{ label: 'System Check' }, { label: 'Phase 1' }]}
          presenceUsers={presenceDemo}
        />

        {/* Command Palette Component */}
        <CommandPalette />

        {/* Scrollable Showcase Canvas */}
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Header Banner */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="primary" pulse>
                    Phase 1 Active
                  </Badge>
                  <Badge variant="success">TypeScript Validated</Badge>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Design System & Component Showcase
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Linear + Vercel + Cursor inspired design tokens, dark surfaces, glowing accents, and core UI primitives.
                </p>
              </div>
              <Button
                variant="glow"
                leftIcon={<Sparkles className="w-4 h-4" />}
                onClick={() => toast.success('Phase 1 Sonner toast container operational!')}
              >
                Test Notification Toast
              </Button>
            </div>
          </div>

          {/* Section 1: Button Variants */}
          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              1. Button Primitives & Magnetic Tap States
            </h2>
            <div className="glass-card p-5 rounded-xl border border-slate-800 flex flex-wrap items-center gap-3">
              <Button variant="primary" leftIcon={<Play className="w-4 h-4" />}>
                Primary Action
              </Button>
              <Button variant="glow" leftIcon={<Sparkles className="w-4 h-4" />}>
                Indigo Cyan Glow
              </Button>
              <Button variant="secondary">Secondary Slate</Button>
              <Button variant="outline">Outline Glass</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="danger">Destructive Action</Button>
              <Button variant="primary" isLoading>
                Loading State
              </Button>
            </div>
          </section>

          {/* Section 2: Badges & Execution Status */}
          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              2. Status Badges & Glow Indicators
            </h2>
            <div className="glass-card p-5 rounded-xl border border-slate-800 flex flex-wrap items-center gap-3">
              <Badge variant="primary" pulse>queued</Badge>
              <Badge variant="info" pulse>running</Badge>
              <Badge variant="success">completed</Badge>
              <Badge variant="danger">failed</Badge>
              <Badge variant="warning">timeout</Badge>
              <Badge variant="outline">v1.4.0</Badge>
            </div>
          </section>

          {/* Section 3: Cards & Grid Layout */}
          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              3. Elevated Cards & Glassmorphism Surfaces
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card interactive>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-indigo-400" />
                    Multi-user Realtime IDE
                  </CardTitle>
                  <CardDescription>Socket.IO Operational Transform sync</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-300">
                    Supports remote cursor overlays, selection highlights, and presence avatars across multiple connected browser sessions.
                  </p>
                </CardContent>
                <CardFooter>
                  <span className="text-[11px] text-slate-500 font-mono">/editor namespace</span>
                  <Badge variant="primary">Active</Badge>
                </CardFooter>
              </Card>

              <Card interactive>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Judge0 Code Execution
                  </CardTitle>
                  <CardDescription>Secure multi-language sandbox</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-300">
                    Executes JavaScript, Python, C++, Java, and Go code snippets asynchronously with real-time stdout/stderr streaming.
                  </p>
                </CardContent>
                <CardFooter>
                  <span className="text-[11px] text-slate-500 font-mono">/compiler namespace</span>
                  <Badge variant="success">Connected</Badge>
                </CardFooter>
              </Card>

              <Card interactive>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    AI Audit Assistant
                  </CardTitle>
                  <CardDescription>Gemini & LLM code reviewer</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-300">
                    Analyzes room source code files for security bugs, performance bottlenecks, and automated refactoring suggestions.
                  </p>
                </CardContent>
                <CardFooter>
                  <span className="text-[11px] text-slate-500 font-mono">/api/v1/ai</span>
                  <Badge variant="warning">Ready</Badge>
                </CardFooter>
              </Card>
            </div>
          </section>

          {/* Section 4: Input & Form Elements */}
          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              4. Inputs & Interactive Search
            </h2>
            <div className="glass-card p-5 rounded-xl border border-slate-800 max-w-xl space-y-4">
              <Input
                label="Room Name"
                placeholder="e.g. Distributed Consensus Demo"
                leftIcon={<Code2 className="w-4 h-4" />}
              />
              <Input
                label="Search Collaborators"
                placeholder="Search by name or email..."
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
          </section>

          {/* Section 5: Skeletons & Empty State */}
          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              5. Loading Skeletons & Empty State Component
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Skeleton Showcase */}
              <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Skeleton Loading Placeholder</h4>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-8 w-20 rounded-md" />
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              </div>

              {/* Empty State Showcase */}
              <EmptyState
                icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />}
                title="Phase 1 Ready for Review"
                description="Press Cmd+K or Ctrl+K anywhere on the screen to launch the Command Palette modal."
                action={
                  <Button
                    variant="outline"
                    onClick={() => {
                      const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
                      document.dispatchEvent(event);
                    }}
                  >
                    Open Command Palette (⌘K)
                  </Button>
                }
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
