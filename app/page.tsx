import React from 'react';
import Warehouse3DScene from './components/Warehouse3DScene';
import ControlTowerDemo from './components/ControlTowerDemo';
import Tilt3DCard from './components/Tilt3DCard';

interface MetricCard {
  label: string;
  value: string;
  detail: string;
}

const SUMMARY_METRICS: MetricCard[] = [
  {
    label: '3D Spatial Digital Twin & RLS',
    value: '12 Racks • 4 AMRs • Live RLS Lens',
    detail: 'Real-time 60fps 3D volumetric rack ledger with tenant-isolated PostgreSQL RLS filtering',
  },
  {
    label: 'Sellable Inventory Conservation',
    value: 'available = on_hand - reserved - quarantined - damaged',
    detail: 'Immutable movement ledger with idempotency keys and row-locked reservations',
  },
  {
    label: 'Inbound ASN & AMR Putaway',
    value: 'ASN -> Quarantine -> 3D Putaway',
    detail: 'Received units stay quarantined until autonomous scan-verified putaway into STORAGE bins',
  },
  {
    label: 'Outbound Order & Carrier Pipeline',
    value: 'ALLOCATED -> PICKED -> PACKED -> SHIPPED',
    detail: '100-way concurrent allocation protection + HMAC-verified carrier webhooks',
  },
];

const WORKFLOW_MODULES = [
  {
    phase: 'P1',
    name: 'Identity, Multi-Tenancy & RBAC',
    endpoints: 'GET /api/v1/me, GET /api/v1/tenants/current, POST/GET /api/v1/merchants',
    status: 'Active',
  },
  {
    phase: 'P2',
    name: 'Warehouses, 3D Bins, Catalog & ASN Receiving',
    endpoints:
      'POST/GET /api/v1/warehouses, POST/GET /api/v1/skus, POST /api/v1/asns, POST /api/v1/putaway-tasks/:id/complete',
    status: 'Active',
  },
  {
    phase: 'P3',
    name: 'Orders, Atomic Reservations & Concurrency Control',
    endpoints:
      'POST/GET /api/v1/orders, POST /api/v1/orders/:id/cancel, GET /api/v1/inventory/availability',
    status: 'Active',
  },
  {
    phase: 'P4',
    name: 'Floor Picking, Packing & Carrier Label Dispatch',
    endpoints:
      'GET /api/v1/pick-tasks, POST /api/v1/pick-tasks/:id/confirm, POST /api/v1/orders/:id/pack, POST /api/v1/orders/:id/ship',
    status: 'Active',
  },
  {
    phase: 'P5-P6',
    name: 'Returns (RMA), Webhooks, Dashboards & Audit Ledger',
    endpoints:
      'POST /api/v1/returns, POST /api/v1/returns/:id/inspect, POST /api/v1/webhooks/carrier/:provider, GET /api/v1/dashboard/metrics, GET /api/v1/audit/events',
    status: 'Active',
  },
];

const BENTO_FEATURES = [
  {
    tag: 'Zero-Oversell Guarantee',
    title: 'Mathematical Inventory Conservation',
    description:
      'Every warehouse SKU balance enforces available = on_hand - reserved - quarantined - damaged >= 0 inside serialized row locks with mandatory Idempotency-Key deduplication.',
  },
  {
    tag: 'Spatial Digital Twin',
    title: 'Interactive 3D High-Bay & AMR Telemetry',
    description:
      'Orbit, zoom, and inspect every multi-tier storage rack and autonomous robot in real time with volumetric bin state visualization and orbital laser allocation beams.',
  },
  {
    tag: 'Defense-in-Depth Isolation',
    title: 'Dual-Layer Tenant & PostgreSQL RLS',
    description:
      'Requests are authorized at the Fastify RBAC guard by merchant/warehouse grants and enforced in PostgreSQL via FORCE ROW LEVEL SECURITY (app.tenant_id).',
  },
  {
    tag: 'Inbound Quality Gate',
    title: 'Quarantine-First ASN Receiving',
    description:
      'Dock receipts increment on_hand and quarantined simultaneously—preventing premature order allocation until floor operators scan-verify putaway into STORAGE bins.',
  },
  {
    tag: 'Cryptographic Edge Security',
    title: 'HMAC-SHA256 Carrier Webhooks & Outbox',
    description:
      'Timestamp-windowed replay protection and HMAC signature verification feed an immutable transactional outbox with consumer-deduplicated relay.',
  },
  {
    tag: 'Automated 3PL Monetization',
    title: 'Event-Metered Activity Billing',
    description:
      'Every storage putaway, pick confirmation, label dispatch, and RMA inspection automatically records auditable tenant/merchant billing ledger events.',
  },
];

const PRICING_TIERS = [
  {
    name: 'Growth 3PL Node',
    price: '$490',
    period: '/month',
    subtitle: 'For emerging fulfillment centers scaling multi-merchant 3D operations.',
    featured: false,
    highlights: [
      'Up to 2 Warehouse Facilities & 15 Merchants',
      '3D Spatial Rack Visualizer & Conservation Ledger',
      'ASN Quarantine & Guided Putaway',
      'Standard Carrier Webhooks (FedEx, UPS, USPS, DHL)',
      'Immutable Audit Trail (90-Day Retention)',
    ],
    cta: 'Launch 3D Twin',
  },
  {
    name: 'Enterprise 3D Control Tower',
    price: '$1,490',
    period: '/month',
    subtitle: 'For high-volume multi-node 3PL networks requiring real-time 3D telemetry & billing automation.',
    featured: true,
    highlights: [
      'Unlimited Warehouses, 3D Storage Bins & AMR Fleet',
      '100-Way Concurrent Order Reservation Engine',
      'PostgreSQL RLS + Scoped Warehouse/Merchant RBAC',
      'Transactional Outbox Relay & Event-Metered 3PL Billing',
      'RMA Returns Disposition & 7-Year Audit Retention',
    ],
    cta: 'Explore 3D Control Tower',
  },
  {
    name: 'Dedicated Sovereign Cloud',
    price: 'Custom',
    period: 'deployment',
    subtitle: 'Single-tenant VPC or on-premise hardware for regulated logistics operators.',
    featured: false,
    highlights: [
      'Dedicated PostgreSQL Cluster with Custom RLS Policies',
      'Hardware Barcode Scanner, AMR & WMS ERP Bridges',
      'Custom SLA (99.995%) & 24/7 Principal Engineer Channel',
      'Zero-Cloud Local AI Review & Compliance Gate',
      'Full Source & Migration Auditability',
    ],
    cta: 'Contact Architecture Team',
  },
];

export default function Home() {
  return (
    <div>
      {/* Navigation */}
      <nav className="navbar" aria-label="Primary Navigation">
        <div className="container navbar-inner">
          <div className="brand">
            <span className="brand-mark">3D</span>
            <span>NexusOps 3D • Fulfillment Twin</span>
          </div>

          <div className="nav-links">
            <a href="#spatial-twin">3D Digital Twin</a>
            <a href="#control-tower">Control Tower Simulator</a>
            <a href="#capabilities">3D Architecture</a>
            <a href="#api-surface">API Surface</a>
            <a href="#pricing">Pricing</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="status-pill">
              <span className="status-dot" />
              3D Spatial Engine Live
            </span>
            <a href="#spatial-twin" className="btn btn-primary btn-sm">
              Enter 3D Warehouse
            </a>
          </div>
        </div>
      </nav>

      <main className="container">
        {/* Hero Section */}
        <header className="hero">
          <div className="hero-badge">
            <span>🌐 Interactive 3D Spatial Digital Twin • Multi-Tenant 3PL Control Tower</span>
          </div>
          <h1 className="hero-title">
            Spatial 3D Warehouse & <span className="gradient-text">Fulfillment Control Tower</span>
          </h1>
          <p className="hero-subtitle">
            Orbit your live 3D warehouse floor in 60fps, inspect volumetric high-bay storage bins under PostgreSQL
            Row-Level Security, dispatch autonomous mobile robots, and trigger 100-way atomic order allocations.
          </p>

          <div className="hero-actions">
            <a href="#spatial-twin" className="btn btn-primary">
              Interact with 3D Digital Twin ↓
            </a>
            <a href="#control-tower" className="btn btn-secondary">
              Open RBAC & Webhook Console
            </a>
          </div>

          {/* Interactive 3D Digital Twin Stage */}
          <section id="spatial-twin" aria-label="Interactive 3D Warehouse Digital Twin" style={{ textAlign: 'left' }}>
            <Warehouse3DScene />
          </section>

          {/* Summary Metrics / Platform Invariants with 3D Tilt Cards */}
          <section id="invariants" aria-labelledby="metrics-heading" style={{ textAlign: 'left', marginTop: '2rem' }}>
            <h2
              id="metrics-heading"
              style={{
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#38bdf8',
                marginBottom: '1rem',
                fontWeight: 700,
              }}
            >
              3D Spatial Invariants & Deterministic Controls (Hover to Tilt in 3D)
            </h2>
            <div className="kpi-strip">
              {SUMMARY_METRICS.map((card) => (
                <Tilt3DCard key={card.label} className="kpi-card" intensity={12}>
                  <h3 style={{ fontSize: '0.88rem', color: '#94a3b8', fontWeight: 600 }}>{card.label}</h3>
                  <p
                    style={{
                      margin: '0.45rem 0',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      color: '#f8fafc',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    }}
                  >
                    {card.value}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: '#64748b' }}>{card.detail}</p>
                </Tilt3DCard>
              ))}
            </div>
          </section>
        </header>

        {/* Interactive Control Tower Section */}
        <section id="control-tower" className="section" aria-labelledby="tower-heading">
          <div className="section-header">
            <div className="section-eyebrow">Interactive Protocol Sandbox</div>
            <h2 id="tower-heading" className="section-title">
              Operations Control Tower, RBAC Scope & Webhook Console
            </h2>
            <p className="section-desc">
              Step orders through Pick → Pack → Ship, switch PostgreSQL RLS principals, and inspect signed carrier
              webhook payloads.
            </p>
          </div>

          <ControlTowerDemo />
        </section>

        {/* Architectural Capabilities 3D Bento Grid */}
        <section id="capabilities" className="section" aria-labelledby="bento-heading">
          <div className="section-header">
            <div className="section-eyebrow">Engineered for High-Trust Logistics</div>
            <h2 id="bento-heading" className="section-title">
              Six 3D Pillars of Deterministic Fulfillment
            </h2>
            <p className="section-desc">
              Every card below responds in 3D perspective space—built from the ground up to eliminate race conditions,
              cross-tenant leakage, and unbilled warehouse activity.
            </p>
          </div>

          <div className="bento-grid">
            {BENTO_FEATURES.map((feat) => (
              <Tilt3DCard key={feat.title} className="bento-card" intensity={10}>
                <span className="bento-tag">{feat.tag}</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>{feat.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{feat.description}</p>
              </Tilt3DCard>
            ))}
          </div>
        </section>

        {/* Implemented Service Capabilities & API Surface */}
        <section id="api-surface" className="section" aria-labelledby="modules-heading">
          <div className="section-header">
            <div className="section-eyebrow">Verified Backend Contracts</div>
            <h2 id="modules-heading" className="section-title">
              Implemented Service Capabilities & API Surface
            </h2>
            <p className="section-desc">
              Every endpoint is protected by bearer principal resolution, scoped RBAC guards, and idempotency keys on
              state-mutating operations.
            </p>
          </div>

          <div
            style={{
              background: 'rgba(15, 23, 42, 0.78)',
              border: '1px solid rgba(148, 163, 184, 0.14)',
              borderRadius: '0.95rem',
              overflowX: 'auto',
            }}
          >
            <table className="api-table">
              <thead>
                <tr>
                  <th>Phase</th>
                  <th>Capability</th>
                  <th>Protected Endpoints</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {WORKFLOW_MODULES.map((mod) => (
                  <tr key={mod.phase}>
                    <td style={{ fontWeight: 700, color: '#38bdf8' }}>{mod.phase}</td>
                    <td style={{ fontWeight: 600 }}>{mod.name}</td>
                    <td>
                      <span className="code-chip">{mod.endpoints}</span>
                    </td>
                    <td style={{ color: '#34d399', fontWeight: 700 }}>{mod.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pricing Section with 3D Tilt Cards */}
        <section id="pricing" className="section" aria-labelledby="pricing-heading">
          <div className="section-header">
            <div className="section-eyebrow">Predictable 3PL Economics</div>
            <h2 id="pricing-heading" className="section-title">
              Scale From Single 3D Warehouse to Global Fulfillment Network
            </h2>
            <p className="section-desc">
              Start small with a single warehouse digital twin and expand seamlessly as your merchant volume grows.
            </p>
          </div>

          <div className="pricing-grid">
            {PRICING_TIERS.map((tier) => (
              <Tilt3DCard
                key={tier.name}
                className={`pricing-card ${tier.featured ? 'featured' : ''}`}
                intensity={8}
                glowColor={tier.featured ? 'rgba(56, 189, 248, 0.35)' : 'rgba(148, 163, 184, 0.2)'}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{tier.name}</h3>
                    {tier.featured && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '999px',
                          background: 'rgba(56, 189, 248, 0.18)',
                          color: '#38bdf8',
                        }}
                      >
                        MOST POPULAR
                      </span>
                    )}
                  </div>
                  <div className="price-amount">
                    {tier.price}
                    <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#94a3b8' }}> {tier.period}</span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>{tier.subtitle}</p>

                  <ul className="feature-list">
                    {tier.highlights.map((item) => (
                      <li key={item} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <span style={{ color: '#34d399', fontWeight: 800 }}>✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href="#spatial-twin"
                  className={`btn ${tier.featured ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '100%' }}
                >
                  {tier.cta}
                </a>
              </Tilt3DCard>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(148, 163, 184, 0.14)',
          padding: '2.5rem 0',
          marginTop: '3rem',
          color: '#64748b',
          fontSize: '0.85rem',
        }}
      >
        <div
          className="container"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}
        >
          <div>
            <strong style={{ color: '#e2e8f0' }}>NexusOps 3D — Spatial Fulfillment Digital Twin</strong> • Multi-Tenant
            3PL Infrastructure
          </div>
          <div>Repository: yanivr78/fulfillment-saas-3d • Built with Next.js, TypeScript & HTML5 3D Canvas</div>
        </div>
      </footer>
    </div>
  );
}
