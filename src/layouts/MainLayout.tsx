import React from 'react';
import { CartDrawer } from '../components/CartDrawer';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { QuickViewModal } from '../components/QuickViewModal';
import { ToastViewport } from '../components/ToastViewport';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111827]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <QuickViewModal />
      <ToastViewport />
    </div>
  );
}
