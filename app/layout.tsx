import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'The Realm of Yaniv Ron — 3D Galactic Command & Control Tower',
  description:
    'Welcome to The Realm of Yaniv Ron: Interactive 3D Spatial Command Center, X-Wing Squadron Telemetry, Imperial March Audio Engine, and Live Holonet Community Wall.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
