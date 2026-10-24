'use client';

import React, { useState } from 'react';

type OrderStage = 'ALLOCATED' | 'PICKED' | 'PACKED' | 'SHIPPED';

interface SimulatedOrder {
  id: string;
  merchant: string;
  sku: string;
  qty: number;
  stage: OrderStage;
  tracking?: string;
}

interface AuditEntry {
  id: string;
  time: string;
  event: string;
  detail: string;
  badgeColor: string;
}

const PRINCIPALS = [
  {
    id: 'tenant-admin',
    name: 'Tenant Admin (Apex 3PL Global)',
    tenantId: 'tnt_01H9APEX3PL',
    role: 'TENANT_ADMIN',
    warehouseScope: 'ALL (WH-EAST-01, WH-WEST-02)',
    merchantScope: 'ALL MERCHANTS',
    rlsContext: "SET LOCAL app.tenant_id = 'tnt_01H9APEX3PL'",
    accessResult: 'ALLOW (200 OK)',
    allowed: true,
    summary: 'Full administrative control across tenant warehouses, merchants, billing ledger, and outbox relay.',
  },
  {
    id: 'wh-operator',
    name: 'Floor Operator (WH-EAST-01)',
    tenantId: 'tnt_01H9APEX3PL',
    role: 'WAREHOUSE_OPERATOR',
    warehouseScope: 'WH-EAST-01 Only',
    merchantScope: 'Assigned Warehouse Orders',
    rlsContext: "SET LOCAL app.tenant_id = 'tnt_01H9APEX3PL'",
    accessResult: 'ALLOW Scoped Floor Ops / DENY Billing & Cross-WH',
    allowed: true,
    summary: 'Can receive ASNs, complete putaway into STORAGE bins, confirm scan-verified picks, and dispatch labels in WH-EAST-01.',
  },
  {
    id: 'merchant-viewer',
    name: 'Merchant Portal User (Veloce Apparel)',
    tenantId: 'tnt_01H9APEX3PL',
    role: 'MERCHANT_USER',
    warehouseScope: 'Read-Only Inventory & Orders',
    merchantScope: 'mrc_VELOCE_01 Only',
    rlsContext: "SET LOCAL app.tenant_id = 'tnt_01H9APEX3PL'",
    accessResult: 'ALLOW Own SKUs & Orders / DENY Other Merchants',
    allowed: true,
    summary: 'Restricted strictly to Veloce Apparel SKUs, order status, and RMA returns; zero visibility into other merchants.',
  },
  {
    id: 'cross-tenant',
    name: 'Unauthorized Cross-Tenant Token (Other 3PL)',
    tenantId: 'tnt_99INTRUDER',
    role: 'TENANT_ADMIN (Foreign Tenant)',
    warehouseScope: 'NONE in tnt_01H9APEX3PL',
    merchantScope: 'NONE in tnt_01H9APEX3PL',
    rlsContext: "SET LOCAL app.tenant_id = 'tnt_99INTRUDER' -- 0 rows visible",
    accessResult: 'DENY (403 FORBIDDEN + RLS Zero-Row Isolation)',
    allowed: false,
    summary: 'Blocked at both Fastify RBAC guard and PostgreSQL FORCE ROW LEVEL SECURITY boundary.',
  },
];

const API_SNIPPETS = [
  {
    key: 'order',
    title: 'Atomic Order Allocation (100-Way Lock)',
    endpoint: 'POST /api/v1/orders',
    request: `{
  "merchantId": "mrc_veloce_01",
  "warehouseId": "wh_east_01",
  "externalOrderRef": "SHOPIFY-98412",
  "lines": [
    { "sku": "SKU-CARBON-PACK", "quantity": 4 }
  ]
}`,
    response: `{
  "orderId": "ord_01J8X9K2P",
  "status": "ALLOCATED",
  "idempotencyKey": "idem_ord_98412",
  "reservation": {
    "sku": "SKU-CARBON-PACK",
    "reservedUnits": 4,
    "availableAfter": 46,
    "invariantVerified": true
  }
}`,
  },
  {
    key: 'asn',
    title: 'Inbound ASN Receive into Quarantine',
    endpoint: 'POST /api/v1/asns/:asnId/receive',
    request: `{
  "receivingBinCode": "RCV-DOCK-01",
  "receivedLines": [
    { "sku": "SKU-CARBON-PACK", "receivedQty": 25, "damagedQty": 0 }
  ]
}`,
    response: `{
  "asnId": "asn_01J8W3M10",
  "status": "RECEIVED_QUARANTINED",
  "putawayTaskId": "put_01J8W3M99",
  "inventoryDelta": {
    "onHandDelta": "+25",
    "quarantinedDelta": "+25",
    "availableDelta": "0 (Awaiting Putaway Verification)"
  }
}`,
  },
  {
    key: 'webhook',
    title: 'HMAC-SHA256 Carrier Tracking Webhook',
    endpoint: 'POST /api/v1/webhooks/carrier/fedex',
    request: `Headers:
  X-Carrier-Signature: sha256=9f86d081884c7d659a2feaa0c55ad015...
  X-Carrier-Timestamp: 1761334800

{
  "eventId": "evt_fedex_88219",
  "trackingNumber": "FX-7749201182",
  "status": "IN_TRANSIT",
  "hub": "MEMPHIS_HUB"
}`,
    response: `{
  "acknowledged": true,
  "replayProtected": true,
  "outboxEventAppended": "out_01J8X9Z88",
  "billingActivityRecorded": "CARRIER_WEBHOOK_PROCESSED"
}`,
  },
];

export default function ControlTowerDemo() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'rbac' | 'api'>('simulator');

  // Inventory state obeying: available = onHand - reserved - quarantined - damaged
  const [onHand, setOnHand] = useState<number>(62);
  const [reserved, setReserved] = useState<number>(8);
  const [quarantined, setQuarantined] = useState<number>(10);
  const [damaged, setDamaged] = useState<number>(2);

  const available = onHand - reserved - quarantined - damaged;
  const invariantValid = available >= 0 && available === onHand - reserved - quarantined - damaged;

  const [orders, setOrders] = useState<SimulatedOrder[]>([
    {
      id: 'ORD-9041',
      merchant: 'Veloce Apparel',
      sku: 'SKU-CARBON-PACK',
      qty: 4,
      stage: 'ALLOCATED',
    },
    {
      id: 'ORD-9042',
      merchant: 'Nordic Gear Co.',
      sku: 'SKU-CARBON-PACK',
      qty: 4,
      stage: 'PICKED',
    },
  ]);

  const [auditFeed, setAuditFeed] = useState<AuditEntry[]>([
    {
      id: 'aud-1',
      time: '14:40:12 UTC',
      event: 'INVENTORY_INVARIANT_VERIFIED',
      detail: 'SKU-CARBON-PACK balance verified (available=42, on_hand=62)',
      badgeColor: '#10b981',
    },
    {
      id: 'aud-2',
      time: '14:41:05 UTC',
      event: 'PICK_TASK_CONFIRMED',
      detail: 'Scan verified bin A-01-R2 for ORD-9042 (4 units)',
      badgeColor: '#38bdf8',
    },
  ]);

  const [selectedPrincipal, setSelectedPrincipal] = useState(PRINCIPALS[0]);
  const [selectedApi, setSelectedApi] = useState(API_SNIPPETS[0]);

  const pushAudit = (event: string, detail: string, badgeColor: string) => {
    const now = new Date().toISOString().slice(11, 19) + ' UTC';
    setAuditFeed((prev) => [
      { id: `${Date.now()}-${Math.random()}`, time: now, event, detail, badgeColor },
      ...prev.slice(0, 5),
    ]);
  };

  const handleReceiveAsn = () => {
    const inboundQty = 10;
    setOnHand((v) => v + inboundQty);
    setQuarantined((v) => v + inboundQty);
    pushAudit(
      'ASN_RECEIVED_QUARANTINED',
      `+10 units received at RCV-DOCK-01 into quarantine (sellable available unchanged at ${available})`,
      '#f59e0b'
    );
  };

  const handleCompletePutaway = () => {
    if (quarantined <= 0) {
      pushAudit('PUTAWAY_SKIPPED', 'Zero quarantined units awaiting putaway.', '#94a3b8');
      return;
    }
    const moveQty = Math.min(10, quarantined);
    setQuarantined((v) => v - moveQty);
    pushAudit(
      'PUTAWAY_COMPLETED',
      `Moved ${moveQty} units from QUARANTINE -> STORAGE bin A-04-S1 (+${moveQty} available)`,
      '#10b981'
    );
  };

  const handleAllocateOrder = () => {
    const orderQty = 4;
    if (available < orderQty) {
      pushAudit(
        'ALLOCATION_REJECTED_CONSERVATION',
        `Prevented oversell: requested ${orderQty} units but only ${available} available.`,
        '#f43f5e'
      );
      return;
    }
    const nextOrderNum = 9043 + orders.length;
    const newOrder: SimulatedOrder = {
      id: `ORD-${nextOrderNum}`,
      merchant: nextOrderNum % 2 === 0 ? 'Nordic Gear Co.' : 'Veloce Apparel',
      sku: 'SKU-CARBON-PACK',
      qty: orderQty,
      stage: 'ALLOCATED',
    };
    setReserved((v) => v + orderQty);
    setOrders((prev) => [newOrder, ...prev]);
    pushAudit(
      'ORDER_ALLOCATED_ATOMIC',
      `Reserved ${orderQty} units for ${newOrder.id} with row-level lock & Idempotency-Key`,
      '#38bdf8'
    );
  };

  const handleAdvanceOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        if (ord.stage === 'ALLOCATED') {
          pushAudit('PICK_SCAN_CONFIRMED', `${ord.id} barcode scan verified at STORAGE bin A-04-S1`, '#38bdf8');
          return { ...ord, stage: 'PICKED' };
        }
        if (ord.stage === 'PICKED') {
          pushAudit('ORDER_PACKED', `${ord.id} carton dimensions & weight verified at PACK-02`, '#818cf8');
          return { ...ord, stage: 'PACKED' };
        }
        if (ord.stage === 'PACKED') {
          const tracking = `FX-${Math.floor(100000000 + Math.random() * 900000000)}`;
          setOnHand((h) => h - ord.qty);
          setReserved((r) => r - ord.qty);
          pushAudit(
            'ORDER_SHIPPED_DISPATCHED',
            `${ord.id} dispatched (${tracking}); -${ord.qty} on_hand, -${ord.qty} reserved, billing metered`,
            '#10b981'
          );
          return { ...ord, stage: 'SHIPPED', tracking };
        }
        return ord;
      })
    );
  };

  const handleResetSimulation = () => {
    setOnHand(62);
    setReserved(8);
    setQuarantined(10);
    setDamaged(2);
    setOrders([
      {
        id: 'ORD-9041',
        merchant: 'Veloce Apparel',
        sku: 'SKU-CARBON-PACK',
        qty: 4,
        stage: 'ALLOCATED',
      },
      {
        id: 'ORD-9042',
        merchant: 'Nordic Gear Co.',
        sku: 'SKU-CARBON-PACK',
        qty: 4,
        stage: 'PICKED',
      },
    ]);
    pushAudit('SIMULATION_RESET', 'Restored baseline warehouse state and ledger counters.', '#38bdf8');
  };

  return (
    <div className="tower-shell">
      <div className="tower-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div className="window-dots" aria-hidden="true">
            <span className="window-dot" style={{ background: '#f43f5e' }} />
            <span className="window-dot" style={{ background: '#f59e0b' }} />
            <span className="window-dot" style={{ background: '#10b981' }} />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0' }}>
            operations-control-tower // WH-EAST-01 (SKU-CARBON-PACK)
          </span>
        </div>

        <div className="tower-tabs" role="tablist" aria-label="Control Tower Views">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'simulator'}
            className={`tower-tab ${activeTab === 'simulator' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulator')}
          >
            1. Live Warehouse & Invariant Simulator
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'rbac'}
            className={`tower-tab ${activeTab === 'rbac' ? 'active' : ''}`}
            onClick={() => setActiveTab('rbac')}
          >
            2. Multi-Tenant RLS & RBAC Scope Tester
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'api'}
            className={`tower-tab ${activeTab === 'api' ? 'active' : ''}`}
            onClick={() => setActiveTab('api')}
          >
            3. Live API Payloads & Webhooks
          </button>
        </div>
      </div>

      <div className="tower-body">
        {activeTab === 'simulator' && (
          <div className="tower-grid">
            {/* Left Column: Inventory Conservation Engine */}
            <div className="panel">
              <div className="panel-title">
                <span>Sellable Inventory Conservation Engine</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    background: invariantValid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.2)',
                    color: invariantValid ? '#34d399' : '#fb7185',
                  }}
                >
                  {invariantValid ? 'INVARIANT LOCKED' : 'VIOLATION'}
                </span>
              </div>

              <div className="invariant-box">
                available ({available}) = on_hand ({onHand}) - reserved ({reserved}) - quarantined ({quarantined}) -
                damaged ({damaged})
              </div>

              <div className="counter-grid">
                <div className="counter-cell" style={{ borderColor: 'rgba(16, 185, 129, 0.45)' }}>
                  <div className="counter-num" style={{ color: '#34d399' }}>
                    {available}
                  </div>
                  <div className="counter-tag">Available</div>
                </div>
                <div className="counter-cell">
                  <div className="counter-num">{onHand}</div>
                  <div className="counter-tag">On Hand</div>
                </div>
                <div className="counter-cell">
                  <div className="counter-num" style={{ color: '#38bdf8' }}>
                    {reserved}
                  </div>
                  <div className="counter-tag">Reserved</div>
                </div>
                <div className="counter-cell">
                  <div className="counter-num" style={{ color: '#f59e0b' }}>
                    {quarantined}
                  </div>
                  <div className="counter-tag">Quarantined</div>
                </div>
                <div className="counter-cell">
                  <div className="counter-num" style={{ color: '#f43f5e' }}>
                    {damaged}
                  </div>
                  <div className="counter-tag">Damaged</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', marginBottom: '1.2rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleReceiveAsn}>
                  + Receive ASN (+10 Quarantined)
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleCompletePutaway}>
                  ✓ Complete Putaway (+10 Available)
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleAllocateOrder}>
                  ⚡ Allocate Order (4 Units)
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleResetSimulation}>
                  ↺ Reset
                </button>
              </div>

              <div style={{ borderTop: '1px solid rgba(148, 163, 184, 0.14)', paddingTop: '0.9rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem' }}>
                  IMMUTABLE MOVEMENT & AUDIT STREAM
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {auditFeed.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        fontSize: '0.78rem',
                        padding: '0.5rem 0.65rem',
                        borderRadius: '0.45rem',
                        background: 'rgba(2, 6, 23, 0.65)',
                        borderLeft: `3px solid ${item.badgeColor}`,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                        <span style={{ color: item.badgeColor }}>{item.event}</span>
                        <span style={{ color: '#64748b', fontFamily: 'monospace' }}>{item.time}</span>
                      </div>
                      <div style={{ color: '#cbd5e1', marginTop: '0.15rem' }}>{item.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Floor Execution Pipeline */}
            <div className="panel">
              <div className="panel-title">
                <span>Outbound Floor Pipeline (Pick → Pack → Ship)</span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{orders.length} Active Orders</span>
              </div>

              <p style={{ fontSize: '0.83rem', color: '#94a3b8', marginBottom: '1rem' }}>
                Advance allocated orders through scan-verified floor picking, carton packing, and idempotent carrier
                label dispatch:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    style={{
                      padding: '0.9rem 1rem',
                      borderRadius: '0.65rem',
                      background: 'rgba(2, 6, 23, 0.7)',
                      border: '1px solid rgba(148, 163, 184, 0.16)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '0.95rem' }}>{ord.id}</span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.55rem',
                            borderRadius: '999px',
                            background:
                              ord.stage === 'SHIPPED'
                                ? 'rgba(16, 185, 129, 0.18)'
                                : ord.stage === 'PACKED'
                                  ? 'rgba(129, 140, 248, 0.2)'
                                  : 'rgba(56, 189, 248, 0.16)',
                            color:
                              ord.stage === 'SHIPPED'
                                 ? '#34d399'
                                : ord.stage === 'PACKED'
                                  ? '#a5b4fc'
                                  : '#38bdf8',
                          }}
                        >
                          {ord.stage}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                        {ord.merchant} • {ord.qty}x {ord.sku}
                        {ord.tracking ? ` • Tracking: ${ord.tracking}` : ''}
                      </div>
                    </div>

                    {ord.stage !== 'SHIPPED' ? (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleAdvanceOrder(ord.id)}
                      >
                        {ord.stage === 'ALLOCATED' && 'Confirm Pick Scan →'}
                        {ord.stage === 'PICKED' && 'Pack Carton →'}
                        {ord.stage === 'PACKED' && 'Dispatch Label & Ship →'}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700 }}>
                        ✓ Dispatched & Metered
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rbac' && (
          <div className="tower-grid">
            <div className="panel">
              <div className="panel-title">
                <span>Select Principal Identity</span>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>Bearer Token + RLS Context</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {PRINCIPALS.map((prin) => (
                  <button
                    key={prin.id}
                    type="button"
                    onClick={() => setSelectedPrincipal(prin)}
                    style={{
                      textAlign: 'left',
                      padding: '0.85rem 1rem',
                      borderRadius: '0.65rem',
                      cursor: 'pointer',
                      background:
                        selectedPrincipal.id === prin.id ? 'rgba(56, 189, 248, 0.14)' : 'rgba(2, 6, 23, 0.6)',
                      border:
                        selectedPrincipal.id === prin.id
                          ? '1px solid rgba(56, 189, 248, 0.5)'
                          : '1px solid rgba(148, 163, 184, 0.15)',
                      color: '#f8fafc',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{prin.name}</div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                      Role: {prin.role} | Tenant: {prin.tenantId}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-title">
                <span>PostgreSQL RLS & Scope Enforcement Result</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '999px',
                    background: selectedPrincipal.allowed ? 'rgba(16, 185, 129, 0.16)' : 'rgba(244, 63, 94, 0.2)',
                    color: selectedPrincipal.allowed ? '#34d399' : '#fb7185',
                  }}
                >
                  {selectedPrincipal.allowed ? 'AUTHORIZED SCOPE' : 'CROSS-TENANT BLOCKED'}
                </span>
              </div>

              <div className="invariant-box" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.35)' }}>
                {selectedPrincipal.rlsContext}
              </div>

              <div style={{ display: 'grid', gap: '0.65rem', fontSize: '0.85rem' }}>
                <div>
                  <strong style={{ color: '#94a3b8' }}>Warehouse Grant Scope: </strong>
                  <span>{selectedPrincipal.warehouseScope}</span>
                </div>
                <div>
                  <strong style={{ color: '#94a3b8' }}>Merchant Grant Scope: </strong>
                  <span>{selectedPrincipal.merchantScope}</span>
                </div>
                <div>
                  <strong style={{ color: '#94a3b8' }}>Policy Verdict: </strong>
                  <span style={{ color: selectedPrincipal.allowed ? '#34d399' : '#fb7185', fontWeight: 700 }}>
                    {selectedPrincipal.accessResult}
                  </span>
                </div>
                <p style={{ color: '#cbd5e1', marginTop: '0.35rem', lineHeight: 1.5 }}>{selectedPrincipal.summary}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="tower-grid">
            <div className="panel">
              <div className="panel-title">
                <span>Interactive Contract Explorer</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Fastify 5 + Idempotency-Key</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {API_SNIPPETS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSelectedApi(item)}
                    style={{
                      textAlign: 'left',
                      padding: '0.85rem 1rem',
                      borderRadius: '0.65rem',
                      cursor: 'pointer',
                      background: selectedApi.key === item.key ? 'rgba(56, 189, 248, 0.14)' : 'rgba(2, 6, 23, 0.6)',
                      border:
                        selectedApi.key === item.key
                          ? '1px solid rgba(56, 189, 248, 0.5)'
                          : '1px solid rgba(148, 163, 184, 0.15)',
                      color: '#f8fafc',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                      {item.endpoint}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-title">
                <span>{selectedApi.endpoint}</span>
                <span className="code-chip">200 OK / Idempotent</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 600 }}>
                REQUEST PAYLOAD
              </div>
              <pre
                style={{
                  background: 'rgba(2, 6, 23, 0.85)',
                  padding: '0.85rem',
                  borderRadius: '0.55rem',
                  fontSize: '0.76rem',
                  color: '#e2e8f0',
                  overflowX: 'auto',
                  marginBottom: '0.85rem',
                  border: '1px solid rgba(148, 163, 184, 0.15)',
                }}
              >
                {selectedApi.request}
              </pre>
              <div style={{ fontSize: '0.76rem', color: '#34d399', marginBottom: '0.3rem', fontWeight: 600 }}>
                DETERMINISTIC RESPONSE
              </div>
              <pre
                style={{
                  background: 'rgba(2, 6, 23, 0.85)',
                  padding: '0.85rem',
                  borderRadius: '0.55rem',
                  fontSize: '0.76rem',
                  color: '#34d399',
                  overflowX: 'auto',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              >
                {selectedApi.response}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
