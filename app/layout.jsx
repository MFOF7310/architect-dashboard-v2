export const metadata = {
  title: 'ARCHITECT CG-223',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0a0a0a', color: '#fff', fontFamily: 'monospace' }}>
        {children}
      </body>
    </html>
  );
}