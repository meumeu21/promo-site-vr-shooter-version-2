'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { siteContent } from '@/content/placeholders';
import { Button } from '@/components/ui/button';
interface AppLayoutProps {
  children: ReactNode;
}
const Logo = () => <svg width="50" height="32" viewBox="0 0 87 54" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-500 hover:scale-110">
    <path d="M78.8289 53.9959L65.8448 29.2692H74.9296C76.8426 29.2692 78.4015 27.7103 78.4015 25.7972C78.4015 23.8842 76.8426 22.3253 74.9296 22.3253H61.7094L52.4089 39.9047H44.8545L24.0352 0H31.3168L48.648 33.2173L57.8264 15.874H74.9336C80.4081 15.874 84.861 20.3268 84.861 25.8013C84.861 30.7548 81.214 34.8698 76.4681 35.6106L86.1228 54H78.8329L78.8289 53.9959Z" fill="white" />
    <path d="M22.3294 39.9411H12.5649L0 15.8574H22.3294C28.968 15.8574 34.3692 21.2586 34.3692 27.8972C34.3692 34.5358 28.968 39.937 22.3294 39.937V39.9411ZM16.4682 33.506H22.3294C25.4187 33.506 27.9341 30.9906 27.9341 27.9013C27.9341 24.812 25.4187 22.2966 22.3294 22.2966H10.6193L16.4682 33.506Z" fill="white" />
  </svg>;
export const AppLayout = ({
  children
}: AppLayoutProps) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const leftNav = siteContent.nav.slice(0, 2);
  const rightNav = siteContent.nav.slice(2);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      const menu = document.getElementById('mobile-site-navigation');
      const trigger = document.getElementById('mobile-site-navigation-trigger');

      if (menu?.contains(target) || trigger?.contains(target)) {
        return;
      }

      setIsMobileMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isMobileMenuOpen]);

  const getNavItemClassName = (href: string) => {
    const isActive = href === '/' ? pathname === href : pathname.startsWith(href);
    return `relative font-heading text-[10px] font-bold uppercase tracking-[0.2em] transition-all lg:text-[12px] ${isActive ? 'text-primary' : 'text-slate-300 hover:text-primary'}`;
  };
  return <div className="flex min-h-screen flex-col bg-background text-slate-100">
      <header className="sticky top-4 z-50 flex w-full justify-center px-4">
        <div className="relative w-full max-w-6xl">
          <div className="clip-techno relative flex h-14 items-center border border-white/10 bg-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <nav className="flex h-full w-full items-center justify-between px-4 lg:px-10">
              <ul className="hidden flex-1 items-center justify-center gap-6 md:flex lg:gap-10">
                {leftNav.map(item => <li key={item.href}>
                    <Link href={item.href} className={getNavItemClassName(item.href)}>
                      {item.label}
                    </Link>
                  </li>)}
              </ul>

              <div className="flex shrink-0 items-center justify-center px-4 lg:px-12">
                <Link href="/" aria-label="SHOOTER VR">
                  <Logo />
                </Link>
              </div>

              <div className="flex flex-1 items-center justify-end gap-6 lg:justify-center lg:gap-10">
                <ul className="hidden items-center gap-6 md:flex lg:gap-10">
                  {rightNav.map(item => <li key={item.href}>
                      <Link href={item.href} className={getNavItemClassName(item.href)}>
                        {item.label}
                      </Link>
                    </li>)}
                </ul>

                <Button
                  id="mobile-site-navigation-trigger"
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="border border-primary/30 bg-primary/10 text-primary shadow-[0_0_20px_rgba(13,166,166,0.18)] hover:border-primary/60 hover:bg-primary/20 md:hidden"
                  aria-label={isMobileMenuOpen ? 'Закрыть меню навигации' : 'Открыть меню навигации'}
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-site-navigation"
                  onClick={() => setIsMobileMenuOpen(current => !current)}
                >
                  {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                </Button>
              </div>
            </nav>

            <div className="absolute left-1/2 top-0 h-1 w-32 -translate-x-1/2 rounded-b-full bg-primary/40"></div>
          </div>

          {isMobileMenuOpen ? <div
              id="mobile-site-navigation"
              className="absolute left-0 top-[calc(100%+0.5rem)] z-40 w-full overflow-hidden rounded-2xl border border-white/10 p-3 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:hidden"
            >
              <div className="grid gap-2">
                {siteContent.nav.map(item => {
                const isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);
                return <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 font-heading text-xs font-bold uppercase tracking-[0.2em] transition-all ${isActive ? 'border-primary/60 bg-primary/15 text-primary shadow-[0_0_24px_rgba(13,166,166,0.16)]' : 'border-white/10 bg-white/[0.03] text-slate-200 hover:border-primary/30 hover:bg-white/[0.06] hover:text-primary'}`}
                  >
                    <span>{item.label}</span>
                  </Link>;
              })}
              </div>
            </div> : null}
        </div>
      </header>

      <style jsx global>{`
        .clip-techno {
          clip-path: polygon(
            0% 20%,
            2% 0%,
            48% 0%,
            50% 10%,
            52% 0%,
            98% 0%,
            100% 20%,
            100% 80%,
            98% 100%,
            2% 100%,
            0% 80%
          );
        }
      `}</style>

      <main className="relative w-full">{children}</main>

      <footer className="mt-auto border-t border-white/5 py-12 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 text-center sm:text-left">
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <Link href="/" className="inline-block">
                <Logo />
              </Link>
              <p className="mx-auto max-w-xs font-mono text-sm text-slate-500 sm:mx-0">
                Командный тактический VR-шутер с архивом завершённых матчей, картами, режимами и
                статистикой игроков.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-12 sm:gap-20">
              <div className="space-y-3">
                <h4 className="font-heading text-xs uppercase tracking-widest text-primary">
                  Навигация
                </h4>
                <ul className="space-y-1.5">
                  {siteContent.nav.map(item => <li key={item.href}>
                      <Link href={item.href} className="text-sm text-slate-400 transition-colors hover:text-white">
                        {item.label}
                      </Link>
                    </li>)}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-heading text-xs uppercase tracking-widest text-primary">
                  Контакты
                </h4>
                <ul className="space-y-1.5 font-mono text-sm text-slate-400">
                  <li>8 (800) 555-35-35</li>
                  <li>info@shoter-mvp.ru</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-4 border-t border-white/5 pt-8 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600">
                © {new Date().getFullYear()} SHOOTER VR. Match history ready.
              </p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-amber-400/80">
                Сайт находится в тестовом режиме
              </p>
            </div>
            <div className="flex justify-center gap-6 font-mono text-[10px] uppercase tracking-widest text-slate-600 md:justify-start">
              <span className="cursor-pointer transition-colors hover:text-primary">
                Privacy_Policy
              </span>
              <span className="cursor-pointer transition-colors hover:text-primary">
                Terms_Of_Service
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
