"use client";

import { useTheme } from "@/lib/theme-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className={cn(
        "sticky top-0 z-50 w-full border-b transition-shadow duration-200",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        isScrolled && "shadow-sm"
      )}>
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                AMock
              </span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link
                href="/"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                首页
              </Link>
              <Link
                href="/mock"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Mock管理
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
              <span className="sr-only">切换主题</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto">
        <div className="container">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/your-username"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                GitHub
              </a>
              <span className="text-muted-foreground">•</span>
              <a
                href="https://openai.com"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                OpenAI
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with ❤️ using Next.js and shadcn/ui
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 