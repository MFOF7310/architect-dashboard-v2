export const metadata = {
  title: '🦅 ARCHITECT CG-223 | Neural Dashboard',
  description: 'Supreme Neural Grid Control Panel - BAMAKO_223',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('architect-theme') || 'dark';
                document.documentElement.setAttribute('data-theme', theme);
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <body style={{ margin: 0, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}