'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from "@/components/ui/use-toast";

import { ThemeProvider } from "next-themes";

export default function RootProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
