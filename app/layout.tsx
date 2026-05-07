import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '🦅 ARCHITECT CG-223 | Neural Dashboard',
  description: 'Supreme Neural Grid Control Panel - BAMAKO_223',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('architect-theme') || 'dark';
                document.documentElement.setAttribute('data-theme', theme);
                document.documentElement.style.colorScheme = theme;
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <body style={{ margin: 0, fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}>
        {children}
      </body>
    </html>
  );
}
