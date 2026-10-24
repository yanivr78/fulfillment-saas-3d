'use client';

import React, { useState, useEffect } from 'react';
import Tilt3DCard from './Tilt3DCard';

export interface RealmPost {
  id: string;
  author: string;
  role: string;
  title: string;
  content: string;
  priority: 'IMPERIAL DECREE' | 'PRIORITY' | 'STANDARD';
  timestamp: string;
  boosts: number;
}

const INITIAL_REALM_POSTS: RealmPost[] = [
  {
    id: 'post-yaniv-1',
    author: 'Yaniv Ron',
    role: 'Supreme Architect of the Realm',
    title: 'Welcome to The Realm of Yaniv Ron — 3D Command & Holonet Wall',
    content:
      'All galactic sectors and 3PL fulfillment nodes are online. Turn up your audio for the Imperial March, watch Red Squadron X-Wings patrol the skies, and leave your transmission on the Realm Wall below!',
    priority: 'IMPERIAL DECREE',
    timestamp: 'Stardate 2026.10 • Command Citadel',
    boosts: 42,
  },
  {
    id: 'post-wedge-2',
    author: 'Commander Wedge Antilles',
    role: 'Rebel X-Wing Pilot',
    title: 'Red Squadron Patrol Report — S-Foils Locked',
    content:
      'Completed high-velocity flyby over High-Bay Storage Racks A-01 through C-04. Twin-ion fusial thrusters nominal and zero inventory oversells detected across the sector.',
    priority: 'PRIORITY',
    timestamp: '12 mins ago • Outer Rim Patrol',
    boosts: 19,
  },
  {
    id: 'post-ops-3',
    author: 'Chief Logistics Officer Vane',
    role: '3PL Control Tower Operator',
    title: 'ASN Quarantine & AMR Putaway Telemetry',
    content:
      'Autonomous mobile robots completed 100-way concurrent order allocation under PostgreSQL RLS isolation. The 3D Digital Twin is locked at 60 FPS.',
    priority: 'STANDARD',
    timestamp: '28 mins ago • Sector WH-EAST-01',
    boosts: 11,
  },
];

const STORAGE_KEY = 'realm_of_yaniv_ron_posts_v1';

export default function RealmPostWall() {
  const [posts, setPosts] = useState<RealmPost[]>(INITIAL_REALM_POSTS);
  const [author, setAuthor] = useState('');
  const [role, setRole] = useState('Galactic Commander');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'IMPERIAL DECREE' | 'PRIORITY' | 'STANDARD'>('IMPERIAL DECREE');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [justPostedBanner, setJustPostedBanner] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPosts(parsed);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const savePosts = (updated: RealmPost[]) => {
    setPosts(updated);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newPost: RealmPost = {
      id: `post-${Date.now()}`,
      author: author.trim() || 'Anonymous Holonet Traveler',
      role,
      title: title.trim(),
      content: content.trim(),
      priority,
      timestamp: `Just now • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      boosts: 1,
    };

    const updated = [newPost, ...posts];
    savePosts(updated);

    setTitle('');
    setContent('');
    setJustPostedBanner(`Transmission "${newPost.title}" published to The Realm of Yaniv Ron! X-Wing Squadron scrambled!`);
    window.setTimeout(() => setJustPostedBanner(null), 4000);

    // Trigger celebratory X-Wing flyby with spacecraft sound!
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('realm:xwing-flyby'));
    }
  };

  const handleBoost = (id: string) => {
    const updated = posts.map((p) => (p.id === id ? { ...p, boosts: p.boosts + 1 } : p));
    savePosts(updated);
  };

  const visiblePosts = filterPriority === 'ALL' ? posts : posts.filter((p) => p.priority === filterPriority);

  const getPriorityBadgeStyle = (prio: RealmPost['priority']) => {
    if (prio === 'IMPERIAL DECREE') {
      return {
        background: 'rgba(244, 63, 94, 0.18)',
        border: '1px solid rgba(244, 63, 94, 0.5)',
        color: '#fda4af',
      };
    }
    if (prio === 'PRIORITY') {
      return {
        background: 'rgba(245, 158, 11, 0.18)',
        border: '1px solid rgba(245, 158, 11, 0.5)',
        color: '#fcd34d',
      };
    }
    return {
      background: 'rgba(56, 189, 248, 0.16)',
      border: '1px solid rgba(56, 189, 248, 0.4)',
      color: '#38bdf8',
    };
  };

  return (
    <div className="realm-wall-grid">
      {/* Left Column: Form to Post Stuff to The Realm of Yaniv Ron */}
      <div className="panel" style={{ border: '1px solid rgba(56, 189, 248, 0.35)' }}>
        <div className="panel-title">
          <span style={{ fontSize: '1.05rem', color: '#f8fafc' }}>📡 Broadcast to The Realm of Yaniv Ron</span>
          <span className="holo-badge" style={{ fontSize: '0.68rem' }}>
            LIVE HOLONET FORM
          </span>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.1rem' }}>
          Publish a decree, squadron status report, or message directly onto the Realm Wall. Posting automatically
          scrambles an X-Wing flyby!
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label
                htmlFor="realm-author"
                style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.3rem' }}
              >
                YOUR NAME / CALLSIGN
              </label>
              <input
                id="realm-author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Yaniv Ron / Red Leader"
                className="realm-input"
              />
            </div>

            <div>
              <label
                htmlFor="realm-role"
                style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.3rem' }}
              >
                GALACTIC ROLE / TITLE
              </label>
              <select
                id="realm-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="realm-input"
              >
                <option value="Galactic Commander">Galactic Commander</option>
                <option value="Supreme Architect of the Realm">Supreme Architect of the Realm</option>
                <option value="Rebel X-Wing Pilot">Rebel X-Wing Pilot</option>
                <option value="Imperial Fleet Admiral">Imperial Fleet Admiral</option>
                <option value="3PL Control Tower Operator">3PL Control Tower Operator</option>
                <option value="Visitor to the Realm">Visitor to the Realm</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
            <div>
              <label
                htmlFor="realm-title"
                style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.3rem' }}
              >
                TRANSMISSION SUBJECT *
              </label>
              <input
                id="realm-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Headline for your post on the Realm..."
                className="realm-input"
              />
            </div>

            <div>
              <label
                htmlFor="realm-priority"
                style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.3rem' }}
              >
                CLASSIFICATION
              </label>
              <select
                id="realm-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as RealmPost['priority'])}
                className="realm-input"
              >
                <option value="IMPERIAL DECREE">IMPERIAL DECREE</option>
                <option value="PRIORITY">PRIORITY</option>
                <option value="STANDARD">STANDARD</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="realm-content"
              style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.3rem' }}
            >
              MESSAGE / HOLONET CONTENT *
            </label>
            <textarea
              id="realm-content"
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your message to post onto The Realm of Yaniv Ron..."
              className="realm-input"
              style={{ resize: 'vertical' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
            🚀 Publish Post to The Realm & Scramble X-Wings
          </button>

          {justPostedBanner && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '0.55rem',
                background: 'rgba(16, 185, 129, 0.16)',
                border: '1px solid rgba(16, 185, 129, 0.45)',
                color: '#34d399',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              ✓ {justPostedBanner}
            </div>
          )}
        </form>
      </div>

      {/* Right Column: Dedicated Live Feed of User Posts */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>
            Showing {visiblePosts.length} Transmissions in The Realm
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['ALL', 'IMPERIAL DECREE', 'PRIORITY', 'STANDARD'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilterPriority(f)}
                className={`btn btn-sm ${filterPriority === f ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.72rem', padding: '0.32rem 0.65rem' }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {visiblePosts.map((post) => (
            <Tilt3DCard
              key={post.id}
              className="panel"
              intensity={6}
              glowColor={
                post.priority === 'IMPERIAL DECREE'
                  ? 'rgba(244, 63, 94, 0.25)'
                  : 'rgba(56, 189, 248, 0.22)'
              }
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                  marginBottom: '0.5rem',
                }}
              >
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '0.18rem 0.55rem',
                      borderRadius: '999px',
                      marginRight: '0.55rem',
                      ...getPriorityBadgeStyle(post.priority),
                    }}
                  >
                    {post.priority}
                  </span>
                  <strong style={{ fontSize: '1.05rem', color: '#f8fafc' }}>{post.title}</strong>
                </div>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontFamily: 'monospace' }}>
                  {post.timestamp}
                </span>
              </div>

              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: '0.55rem 0 0.9rem', lineHeight: 1.55 }}>
                {post.content}
              </p>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid rgba(148, 163, 184, 0.14)',
                  paddingTop: '0.65rem',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ color: '#94a3b8' }}>
                  Posted by <strong style={{ color: '#38bdf8' }}>{post.author}</strong> •{' '}
                  <span>{post.role}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleBoost(post.id)}
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.28rem 0.65rem' }}
                >
                  ⚡ Force Boost ({post.boosts})
                </button>
              </div>
            </Tilt3DCard>
          ))}
        </div>
      </div>
    </div>
  );
}
