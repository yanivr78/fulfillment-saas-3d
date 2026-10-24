import React from 'react';
import Warehouse3DScene from './components/Warehouse3DScene';
import ControlTowerDemo from './components/ControlTowerDemo';
import Tilt3DCard from './components/Tilt3DCard';
import StarWarsAudioAndXWingEngine from './components/StarWarsAudioAndXWingEngine';
import RealmPostWall from './components/RealmPostWall';

interface MetricCard {
  label: string;
  value: string;
  detail: string;
}

const SUMMARY_METRICS: MetricCard[] = [
  {
    label: 'The Realm of Yaniv Ron • 3D Twin',
    value: '12 High-Bay Racks • X-Wing Patrol',
    detail: 'Real-time 60fps 3D volumetric rack ledger guarded by Red Squadron X-Wing flybys & Imperial March audio',
  },
  {
    label: 'Sellable Inventory Conservation',
    value: 'available = on_hand - reserved - quarantined - damaged',
    detail: 'Immutable movement ledger with idempotency keys and row-locked reservations',
  },
  {
    label: 'Holonet Community Broadcast Wall',
    value: 'Live Realm Post Form & Feed',
    detail: 'Visitors and commanders can post transmissions directly onto the dedicated Realm Wall',
  },
  {
    label: 'Outbound Order & Starfighter Pipeline',
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
    tag: 'Galactic Soundtrack & Starfighters',
    title: 'Imperial March Synth & X-Wing Squadron Flybys',
    description:
      'Launches with a polyphonic Web Audio synthesizer playing the Star Wars Imperial March while 3D X-Wings streak across the viewport with Doppler twin-ion turbine roar and quad laser cannon blasts.',
  },
  {
    tag: 'Interactive Holonet Wall',
    title: 'Live Realm Post Form & Community Feed',
    description:
      'Publish decrees, status updates, and messages directly to The Realm of Yaniv Ron. Every new post triggers an immediate X-Wing celebratory flyby.',
  },
  {
    tag: 'Spatial Digital Twin',
    title: 'Interactive 3D High-Bay & AMR Telemetry',
    description:
      'Orbit, zoom, and inspect every multi-tier storage rack and autonomous robot in real time with volumetric bin state visualization and orbital laser allocation beams.',
  },
  {
    tag: 'Zero-Oversell Guarantee',
    title: 'Mathematical Inventory Conservation',
    description:
      'Every warehouse SKU balance enforces available = on_hand - reserved - quarantined - damaged >= 0 inside serialized row locks with mandatory Idempotency-Key deduplication.',
  },
  {
    tag: 'Defense-in-Depth Isolation',
    title: 'Dual-Layer Tenant & PostgreSQL RLS',
    description:
      'Requests are authorized at the Fastify RBAC guard by merchant/warehouse grants and enforced in PostgreSQL via FORCE ROW LEVEL SECURITY (app.tenant_id).',
  },
  {
    tag: 'Cryptographic Edge Security',
    title: 'HMAC-SHA256 Carrier Webhooks & Outbox',
    description:
      'Timestamp-windowed replay protection and HMAC signature verification feed an immutable transactional outbox with consumer-deduplicated relay.',
  },
];

const PRICING_TIERS = [
  {
    name: 'Outer Rim Outpost',
    price: '$490',
    period: '/month',
    subtitle: 'For emerging fulfillment centers joining The Realm of Yaniv Ron.',
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
    name: 'Imperial Citadel Control Tower',
    price: '$1,490',
    period: '/month',
    subtitle: 'For high-volume multi-node 3PL networks requiring real-time 3D telemetry & X-Wing escort.',
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
    name: 'Sovereign Core Sector',
    price: 'Custom',
    period: 'deployment',
    subtitle: 'Single-tenant VPC or on-premise hardware for regulated galactic operators.',
    featured: false,
    highlights: [
      'Dedicated PostgreSQL Cluster with Custom RLS Policies',
      'Hardware Barcode Scanner, AMR & WMS ERP Bridges',
      'Custom SLA (99.995%) & 24/7 Principal Engineer Channel',
      'Zero-Cloud Local AI Review & Compliance Gate',
      'Full Source & Migration Auditability',
    ],
    cta: 'Post on the Realm Wall',
  },
];

export default function Home() {
  return (
    <div>
      {/* Star Wars Imperial March Audio Synthesizer + Periodic 3D X-Wing Flyby Engine */}
      <StarWarsAudioAndXWingEngine />

      {/* Navigation */}
      <nav className="navbar" aria-label="Primary Navigation">
        <div className="container navbar-inner">
          <div className="brand">
            <span className="brand-mark">YR</span>
            <span>The Realm of Yaniv Ron</span>
          </div>

          <div className="nav-links">
            <a href="#spatial-twin">3D Digital Twin</a>
            <a href="#realm-wall">Post to the Realm</a>
            <a href="#control-tower">Control Tower</a>
            <a href="#capabilities">3D Architecture</a>
            <a href="#pricing">Tiers</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="status-pill">
              <span className="status-dot" />
              Imperial March & X-Wings Active
            </span>
            <a href="#realm-wall" className="btn btn-primary btn-sm">
              Post on the Realm Wall
            </a>
          </div>
        </div>
      </nav>

      <main className="container">
        {/* Hero Section */}
        <header className="hero">
          <div className="hero-badge">
            <span>⚔️ Welcome to The Realm of Yaniv Ron • Imperial March Audio + X-Wing Squadron Patrol</span>
          </div>
          <h1 className="hero-title">
            The Realm of <span className="gradient-text">Yaniv Ron</span>
          </h1>
          <p className="hero-subtitle">
            Experience the interactive 60fps 3D Galactic Warehouse & Fulfillment Command Citadel. Listen to the Star
            Wars Imperial March on launch, watch X-Wing starfighters streak across the skies with twin-ion turbine &
            laser cannon audio, and post your own transmissions to the Realm Wall below.
          </p>

          <div className="hero-actions">
            <a href="#realm-wall" className="btn btn-primary">
              📡 Post a Message to The Realm ↓
            </a>
            <a href="#spatial-twin" className="btn btn-secondary">
              🌐 Orbit 3D Command Citadel
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
              Galactic Invariants & 3D Telemetry (Hover Cards to Tilt in 3D)
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

        {/* Dedicated User Post Form & Community Wall Section */}
        <section id="realm-wall" className="section" aria-labelledby="realm-wall-heading">
          <div className="section-header">
            <div className="section-eyebrow">Holonet Community Dispatch</div>
            <h2 id="realm-wall-heading" className="section-title">
              The Realm of Yaniv Ron — Public Transmission Wall
            </h2>
            <p className="section-desc">
              Use the form below to publish decrees, messages, or squadron dispatches directly onto the website. Every
              new post scrambles an X-Wing squadron flyby with spacecraft sounds!
            </p>
          </div>

          <RealmPostWall />
        </section>

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
              Six 3D Pillars of The Realm of Yaniv Ron
            </h2>
            <p className="section-desc">
              Every card below responds in 3D perspective space—combining Star Wars audio-visual immersion with
              deterministic multi-tenant 3PL architecture.
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
            <div className="section-eyebrow">Galactic 3PL Economics</div>
            <h2 id="pricing-heading" className="section-title">
              Scale Across The Realm of Yaniv Ron
            </h2>
            <p className="section-desc">
              Start small with an Outer Rim warehouse node and expand seamlessly to a full Imperial Citadel Control
              Tower.
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
                  href="#realm-wall"
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
          padding: '2.5rem 0 5rem',
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
            <strong style={{ color: '#e2e8f0' }}>The Realm of Yaniv Ron</strong> • 3D Spatial Command Citadel, Imperial
            March Synth & X-Wing Squadron Telemetry
          </div>
          <div>Repository: yanivr78/the-realm-of-yaniv-ron • Built with Next.js, TypeScript & Web Audio API</div>
        </div>
      </footer>
    </div>
  );
}
