import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'NexusOps 3PL — Multi-Tenant Fulfillment & Warehouse Control Tower',
  description:
    'Enterprise multi-tenant 3PL fulfillment, warehouse bin management, conservation-locked inventory, ASN receiving, scan-verified picking, carrier webhooks, and event-metered billing.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
