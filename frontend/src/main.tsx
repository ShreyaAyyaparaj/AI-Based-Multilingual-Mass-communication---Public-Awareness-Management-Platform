import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const API = 'http://localhost:5000/api';

type Tab = 'Dashboard' | 'Recipients' | 'Audiences' | 'Campaigns' | 'Templates';

type ModalType = 'recipient' | 'audience' | 'campaign' | 'template' | 'profile' | null;

const navItems: { key: Tab; label: string; icon: string }[] = [
  { key: 'Dashboard', label: 'Dashboard', icon: '▦' },
  { key: 'Recipients', label: 'Recipients', icon: '♙' },
  { key: 'Audiences', label: 'Audiences', icon: '◈' },
  { key: 'Campaigns', label: 'Campaigns', icon: '◉' },
  { key: 'Templates', label: 'Templates', icon: '▤' },
];

const emptyRecipient = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  age: '',
  gender: '',
  state: 'Karnataka',
  district: '',
  city: '',
  language: 'Kannada',
  occupation: '',
  status: 'ACTIVE',
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [admin, setAdmin] = useState<any>(() => {
    try { return JSON.parse(localStorage.getItem('admin') || 'null'); } catch { return null; }
  });
  const [tab, setTab] = useState<Tab>('Dashboard');
  const [login, setLogin] = useState({ email: 'admin@communication.com', password: 'Admin@123' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const [aiStudioCampaign, setAiStudioCampaign] = useState<any>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiNotice, setAiNotice] = useState('');
  const [aiPage, setAiPage] = useState<'generated' | 'quality'>('generated');
  const [aiQuality, setAiQuality] = useState<any>(null);
  const [aiQualityLoading, setAiQualityLoading] = useState(false);
  const [aiConfig, setAiConfig] = useState({
    scenario: '',
    tone: 'Informative',
    audience_id: '',
    location: 'All selected locations',
    languages: ['English'],
    channels: ['SMS'],
    usePreferredLanguages: true,
  });

  const [stats, setStats] = useState({ recipients: 0, audiences: 0, campaigns: 0, templates: 0 });
  const [recipients, setRecipients] = useState<any[]>([]);
  const [audiences, setAudiences] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState('');

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const request = async (path: string, options: RequestInit = {}) => {
    const headers = { ...authHeaders, ...(options.headers || {}) };
    const r = await fetch(API + path, { ...options, headers });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.message || 'Request failed');
    return data;
  };

  const load = async (target = tab) => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [s, c, a, r, t] = await Promise.all([
        request('/stats'),
        request('/campaigns'),
        request('/audiences'),
        request('/recipients'),
        request('/templates'),
      ]);
      setStats(s);
      setCampaigns(c);
      setAudiences(a);
      setRecipients(r);
      setTemplates(t);
    } catch (e: any) {
      if (String(e.message).toLowerCase().includes('invalid token') || String(e.message).toLowerCase().includes('authentication')) {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        setToken('');
        setAdmin(null);
      }
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) load(tab);
  }, [token, tab]);

  const doLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const r = await fetch(API + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(login),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || 'Login failed');
      localStorage.setItem('token', d.token);
      localStorage.setItem('admin', JSON.stringify(d.admin));
      setAdmin(d.admin);
      setToken(d.token);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setToken('');
    setAdmin(null);
  };

  const openModal = (type: ModalType, data: any = null) => {
    setError('');
    setNotice('');
    setEditing(data ?? (
      type === 'recipient' ? { ...emptyRecipient } :
      type === 'audience' ? { name: '', description: '' } :
      type === 'campaign' ? { name: '', description: '', status: 'DRAFT', audience_id: '', scenario: '', location: '', languages: ['English'], channels: ['SMS'], tone: 'Informative' } :
      type === 'template' ? { title: '', template_type: 'Awareness', channel: 'SMS', content: '' } :
      type === 'profile' ? { ...admin } : null
    ));
    setModal(type);
  };

  const closeModal = () => {
    setModal(null);
    setEditing(null);
  };

  const saveEntity = async (kind: ModalType) => {
    try {
      if (kind === 'recipient') {
        const id = editing.recipient_id;
        await request(id ? `/recipients/${id}` : '/recipients', {
          method: id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editing),
        });
        closeModal();
        setNotice(id ? 'Recipient updated successfully.' : 'Recipient added successfully.');
        await load('Recipients');
      }

      if (kind === 'audience') {
        const id = editing.audience_id;
        await request(id ? `/audiences/${id}` : '/audiences', {
          method: id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editing),
        });
        closeModal();
        setNotice(id ? 'Audience updated successfully.' : 'Audience created successfully.');
        await load('Audiences');
      }

      if (kind === 'campaign') {
        const id = editing.campaign_id;
        const saved = await request(id ? `/campaigns/${id}` : '/campaigns', {
          method: id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editing.name,
            description: editing.scenario || editing.description,
            status: editing.status || 'DRAFT',
          }),
        });
        const campaignId = id || saved.campaign_id;
        if (editing.audience_id) {
          await request(`/campaigns/${campaignId}/audience`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audience_id: Number(editing.audience_id) }),
          });
        }
        await request(`/campaigns/${campaignId}/ai-config`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenario: editing.scenario || editing.description || editing.name,
            location: editing.location || '',
            tone: editing.tone || 'Informative',
            languages: editing.languages?.length ? editing.languages : ['English'],
            channels: editing.channels?.length ? editing.channels : ['SMS'],
            usePreferredLanguages: editing.usePreferredLanguages !== false,
          }),
        });
        closeModal();
        await load('Campaigns');
        const selectedAudience = audiences.find((a: any) => Number(a.audience_id) === Number(editing.audience_id));
        openAiStudio({
          campaign_id: campaignId,
          name: editing.name,
          description: editing.scenario || editing.description,
          status: editing.status || 'DRAFT',
          audience: selectedAudience?.name || 'General Public',
          audience_id: editing.audience_id || '',
          scenario: editing.scenario || editing.description || '',
          location: editing.location || 'All selected locations',
          languages: editing.languages || ['English'],
          channels: editing.channels || ['SMS'],
          tone: editing.tone || 'Informative',
        });
        setNotice(id ? 'Campaign updated. AI communication is ready to review.' : 'Campaign created. AI communication is ready to generate.');
      }

      if (kind === 'template') {
        const id = editing.template_id;
        await request(id ? `/templates/${id}` : '/templates', {
          method: id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editing),
        });
        closeModal();
        setNotice(id ? 'Template updated successfully.' : 'Template created successfully.');
        await load('Templates');
      }

      if (kind === 'profile') {
        const updated = await request('/admin/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ full_name: editing.full_name, email: editing.email }),
        });
        localStorage.setItem('admin', JSON.stringify(updated.admin));
        setAdmin(updated.admin);
        closeModal();
        setNotice('Administrator profile updated successfully.');
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  const removeRecipient = async (id: number) => {
    if (!confirm('Deactivate this recipient?')) return;
    try {
      await request(`/recipients/${id}`, { method: 'DELETE' });
      setNotice('Recipient deactivated.');
      await load('Recipients');
    } catch (e: any) { setError(e.message); }
  };

  const removeAudience = async (id: number) => {
    if (!confirm('Delete this audience?')) return;
    try {
      await request(`/audiences/${id}`, { method: 'DELETE' });
      setNotice('Audience deleted.');
      await load('Audiences');
    } catch (e: any) { setError(e.message); }
  };

  const removeCampaign = async (id: number) => {
    if (!confirm('Delete this campaign?')) return;
    try {
      await request(`/campaigns/${id}`, { method: 'DELETE' });
      setNotice('Campaign deleted.');
      await load('Campaigns');
    } catch (e: any) { setError(e.message); }
  };


  const openAiStudio = async (campaign: any) => {
    const matchedAudience = audiences.find((a: any) => Number(a.audience_id) === Number(campaign.audience_id)) || audiences.find((a: any) => a.name === campaign.audience);
    let storedConfig: any = null;
    try {
      if (campaign.campaign_id) {
        const response = await request(`/campaigns/${campaign.campaign_id}/ai-config`);
        storedConfig = response.config;
      }
    } catch {
      storedConfig = null;
    }
    setAiStudioCampaign({ ...campaign, audience_id: matchedAudience?.audience_id || campaign.audience_id || '' });
    setAiResult(null);
    setAiNotice('');
    setAiQuality(null);
    setAiPage('generated');
    setAiConfig({
      scenario: storedConfig?.scenario || campaign.scenario || campaign.description || campaign.name || '',
      tone: storedConfig?.tone || campaign.tone || 'Informative',
      audience_id: matchedAudience?.audience_id || campaign.audience_id || '',
      location: storedConfig?.location || campaign.location || 'All selected locations',
      languages: storedConfig?.languages?.length ? storedConfig.languages : (campaign.languages?.length ? campaign.languages : ['English']),
      channels: storedConfig?.channels?.length ? storedConfig.channels : (campaign.channels?.length ? campaign.channels : ['SMS']),
      usePreferredLanguages: storedConfig?.usePreferredLanguages !== false && campaign.usePreferredLanguages !== false,
    });
  };

  const closeAiStudio = () => {
    setAiStudioCampaign(null);
    setAiResult(null);
    setAiNotice('');
    setAiQuality(null);
    setAiPage('generated');
  };

  const generateAiContent = async () => {
    if (!aiStudioCampaign) return;
    setAiGenerating(true);
    setAiNotice('');
    setError('');
    try {
      const selectedAudience = audiences.find((a: any) => Number(a.audience_id) === Number(aiConfig.audience_id));
      const result = await request('/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign: aiStudioCampaign.name,
          scenario: aiConfig.scenario,
          audience: selectedAudience?.name || aiStudioCampaign.audience || 'General Public',
          audience_id: aiConfig.audience_id ? Number(aiConfig.audience_id) : null,
          location: aiConfig.location,
          tone: aiConfig.tone,
          languages: aiConfig.languages,
          channels: aiConfig.channels,
          usePreferredLanguages: aiConfig.usePreferredLanguages,
        }),
      });
      setAiResult(result);
      const generatedLanguages = Object.keys(result.localizedContent || {});
      if (generatedLanguages.length) setAiConfig((current: any) => ({ ...current, languages: generatedLanguages }));
      setAiNotice(result.notice || `Generated with ${result.model || 'gemini-2.5-flash'}. Review the localized versions before approval.`);
      setAiPage('generated');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAiGenerating(false);
    }
  };

  const runAiQualityCheck = async () => {
    if (!aiStudioCampaign || !aiResult) return;
    setAiQualityLoading(true);
    setError('');
    try {
      const selectedAudience = audiences.find((a: any) => Number(a.audience_id) === Number(aiConfig.audience_id));
      const result = await request('/ai/quality-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign: aiStudioCampaign.name,
          scenario: aiConfig.scenario,
          audience: selectedAudience?.name || aiStudioCampaign.audience || 'General Public',
          location: aiConfig.location,
          tone: aiConfig.tone,
          languages: aiConfig.languages,
          channels: aiConfig.channels,
          content: aiResult.localizedContent || {},
          baseContent: aiResult.baseContent || '',
        }),
      });
      setAiQuality(result);
      setAiPage('quality');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAiQualityLoading(false);
    }
  };

  const toggleAiArrayValue = (key: 'languages' | 'channels', value: string) => {
    setAiConfig((current: any) => {
      const exists = current[key].includes(value);
      const next = exists ? current[key].filter((x: string) => x !== value) : [...current[key], value];
      return { ...current, [key]: next.length ? next : current[key] };
    });
  };

  const seedRegionalAudiences = async () => {
    try {
      const result = await request('/admin/seed-regional-audiences', { method: 'POST' });
      setNotice(result.message || 'Regional audiences are ready.');
      await load('Audiences');
    } catch (e: any) { setError(e.message); }
  };

  const removeTemplate = async (id: number) => {
    if (!confirm('Delete this communication template?')) return;
    try {
      await request(`/templates/${id}`, { method: 'DELETE' });
      setNotice('Template deleted.');
      await load('Templates');
    } catch (e: any) { setError(e.message); }
  };

  const filteredRecipients = recipients.filter((r) =>
    `${r.first_name} ${r.last_name} ${r.email || ''} ${r.phone || ''}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredAudiences = audiences.filter((a) =>
    `${a.name} ${a.description || ''}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredCampaigns = campaigns.filter((c) =>
    `${c.name} ${c.description || ''} ${c.status || ''}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredTemplates = templates.filter((t) =>
    `${t.title} ${t.template_type} ${t.content}`.toLowerCase().includes(search.toLowerCase())
  );

  if (!token) {
    return (
      <div className="login-shell">
        <div className="login-brand-panel">
          <div className="brand">
            <div className="brand-mark">S</div>
            <div>
              <strong>SAMVAAD</strong>
              <small>Multilingual Public Communication</small>
            </div>
          </div>
          <div className="login-hero">
            <span className="eyebrow">PUBLIC COMMUNICATION, SIMPLIFIED</span>
            <h1>Connect communities.<br />Communicate without language barriers.</h1>
            <p>Plan inclusive public communications, organize audiences and prepare campaigns across the languages your community speaks.</p>
            <div className="hero-tags">
              <span>✦ Multilingual by design</span>
              <span>◉ Built for public service</span>
              <span>✧ AI-ready workflows</span>
            </div>
          </div>
        </div>
        <div className="login-panel">
          <form className="login-card" onSubmit={doLogin}>
            <div className="lock-icon">⌑</div>
            <span className="eyebrow dark">ADMIN PORTAL</span>
            <h2>Welcome back</h2>
            <p>Sign in to manage your communication workspace.</p>
            <label>Email address</label>
            <input value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} />
            <label>Password</label>
            <input type="password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
            <button className="primary full">Sign in <span>→</span></button>
            {error && <div className="error">{error}</div>}
            <small className="demo">Demo: admin@communication.com / Admin@123</small>
          </form>
        </div>
      </div>
    );
  }

  const pageMeta: Record<Tab, { eyebrow: string; title: string; subtitle: string }> = {
    Dashboard: { eyebrow: 'OVERVIEW', title: 'Dashboard', subtitle: 'Monitor your public communication workspace at a glance.' },
    Recipients: { eyebrow: 'AUDIENCE MANAGEMENT', title: 'Recipients', subtitle: 'Manage the individuals who receive public-awareness communications.' },
    Audiences: { eyebrow: 'AUDIENCE MANAGEMENT', title: 'Audiences', subtitle: 'Organize recipients into reusable communication groups.' },
    Campaigns: { eyebrow: 'COMMUNICATION', title: 'Campaigns', subtitle: 'Create and manage public awareness campaigns.' },
    Templates: { eyebrow: 'COMMUNICATION', title: 'Templates', subtitle: 'Create and manage reusable communication templates.' },
  };

  return (
    <div className="portal">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">S</div>
          <div>
            <strong>SAMVAAD</strong>
            <small>Multilingual Public Communication</small>
          </div>
        </div>

        <div className="nav-section">
          <span>OVERVIEW</span>
          <button className={tab === 'Dashboard' ? 'nav-item active' : 'nav-item'} onClick={() => { closeAiStudio(); setTab('Dashboard'); setSearch(''); }}>
            <i>▦</i> Dashboard
          </button>
        </div>

        <div className="nav-section">
          <span>COMMUNICATION</span>
          {navItems.filter(x => ['Campaigns', 'Templates'].includes(x.key)).map(item => (
            <button key={item.key} className={tab === item.key ? 'nav-item active' : 'nav-item'} onClick={() => { closeAiStudio(); setTab(item.key); setSearch(''); }}>
              <i>{item.icon}</i> {item.label}
            </button>
          ))}
        </div>

        <div className="nav-section">
          <span>AUDIENCE</span>
          {navItems.filter(x => ['Recipients', 'Audiences'].includes(x.key)).map(item => (
            <button key={item.key} className={tab === item.key ? 'nav-item active' : 'nav-item'} onClick={() => { closeAiStudio(); setTab(item.key); setSearch(''); }}>
              <i>{item.icon}</i> {item.label}
            </button>
          ))}
        </div>

        <div className="sidebar-bottom">
          <button className="profile-card" onClick={() => openModal('profile')}>
            <div className="avatar">{(admin?.full_name || 'S').charAt(0).toUpperCase()}</div>
            <div>
              <strong>{admin?.full_name || 'System Admin'}</strong>
              <small>{admin?.email || 'Administrator'}</small>
            </div>
            <span>⋮</span>
          </button>
          <button className="logout-link" onClick={logout}>↪ Logout</button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="topbar-spacer" />
          <div className="top-actions">
            <div className="global-search">⌕ <input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <button className="icon-btn" title="Help">?</button>
            <button className="icon-btn" title="Notifications">♢</button>
            <button className="mini-avatar" onClick={() => openModal('profile')}>{(admin?.full_name || 'S').charAt(0).toUpperCase()}</button>
          </div>
        </header>

        <main className="content">
          <div className="page-heading">
            <div>
              <span className="eyebrow dark">{pageMeta[tab].eyebrow}</span>
              <h1>{pageMeta[tab].title}</h1>
              <p>{pageMeta[tab].subtitle}</p>
            </div>
            <div className="heading-actions">
              {tab === 'Recipients' && <button className="outline-btn">⇧ Import CSV</button>}
              {tab === 'Recipients' && <button className="primary" onClick={() => openModal('recipient')}>＋ Add Recipient</button>}
              {tab === 'Audiences' && <><button className="outline-btn" onClick={seedRegionalAudiences}>＋ Add regional audiences</button><button className="primary" onClick={() => openModal('audience')}>＋ Create Audience</button></>}
              {tab === 'Campaigns' && <button className="primary" onClick={() => openModal('campaign')}>＋ Create Campaign</button>}
              {tab === 'Templates' && <button className="primary" onClick={() => openModal('template')}>＋ New Template</button>}
            </div>
          </div>

          {error && <div className="error banner">{error}</div>}
          {notice && <div className="notice banner">{notice}<button onClick={() => setNotice('')}>×</button></div>}

          {aiStudioCampaign ? (
            <CommunicationComposer
              campaign={aiStudioCampaign}
              audiences={audiences}
              config={aiConfig}
              setConfig={setAiConfig}
              result={aiResult}
              notice={aiNotice}
              generating={aiGenerating}
              onGenerate={generateAiContent}
              onBack={closeAiStudio}
              onToggle={toggleAiArrayValue}
              page={aiPage}
              setPage={setAiPage}
              quality={aiQuality}
              qualityLoading={aiQualityLoading}
              onQualityCheck={runAiQualityCheck}
            />
          ) : loading ? <div className="loading-card">Loading your workspace…</div> : (
            <>
              {tab === 'Dashboard' && (
                <Dashboard stats={stats} campaigns={campaigns} audiences={audiences} onNavigate={setTab} />
              )}

              {tab === 'Recipients' && (
                <section className="panel">
                  <div className="panel-toolbar">
                    <div>
                      <h2>All Recipients</h2>
                      <p>{filteredRecipients.length} of {recipients.length} recipients</p>
                    </div>
                    <span className="count-pill">{recipients.filter(r => r.status === 'ACTIVE').length} active</span>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>NAME</th><th>EMAIL</th><th>PHONE</th><th>LANGUAGE</th><th>LOCATION</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
                      <tbody>
                        {filteredRecipients.map(r => (
                          <tr key={r.recipient_id}>
                            <td><strong>{r.first_name} {r.last_name}</strong></td>
                            <td>{r.email || '—'}</td>
                            <td>{r.phone || '—'}</td>
                            <td>{r.language || '—'}</td>
                            <td>{[r.city, r.state].filter(Boolean).join(', ') || '—'}</td>
                            <td><span className={`status ${String(r.status).toLowerCase()}`}>{r.status}</span></td>
                            <td className="actions"><button title="Edit" onClick={() => openModal('recipient', { ...r })}>✎</button><button title="Deactivate" className="danger-icon" onClick={() => removeRecipient(r.recipient_id)}>♢</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {tab === 'Audiences' && (
                <section className="panel">
                  <div className="panel-toolbar"><div><h2>Audience Groups</h2><p>Reusable groups for targeted campaigns.</p></div><span className="count-pill">{audiences.length} audience{audiences.length === 1 ? '' : 's'}</span></div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>NAME</th><th>DESCRIPTION</th><th>RECIPIENTS</th><th>CREATED</th><th>ACTIONS</th></tr></thead>
                      <tbody>
                        {filteredAudiences.map(a => (
                          <tr key={a.audience_id}>
                            <td><strong>{a.name}</strong></td><td>{a.description || '—'}</td><td><span className="member-number">{a.members}</span></td><td>{a.created_at ? new Date(a.created_at).toLocaleDateString('en-GB') : '—'}</td>
                            <td className="actions"><button onClick={() => openModal('audience', { ...a })}>✎</button><button className="danger-icon" onClick={() => removeAudience(a.audience_id)}>♢</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {tab === 'Campaigns' && (
                <section className="panel">
                  <div className="panel-toolbar"><div><h2>Campaigns</h2><p>Review published campaigns, drafts and communication plans.</p></div><span className="count-pill">{campaigns.length} campaign{campaigns.length === 1 ? '' : 's'}</span></div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>CAMPAIGN</th><th>AUDIENCE</th><th>STATUS</th><th>DESCRIPTION</th><th>ACTIONS</th></tr></thead>
                      <tbody>
                        {filteredCampaigns.map(c => (
                          <tr key={c.campaign_id}>
                            <td><strong>{c.name}</strong></td><td>{c.audience || 'Not assigned'}</td><td><span className={`status ${String(c.status).toLowerCase()}`}>{c.status}</span></td><td>{c.description || '—'}</td>
                            <td className="actions campaign-actions"><button className="ai-action" onClick={() => openAiStudio(c)}>Open Composer</button><button title="Edit campaign" onClick={() => openModal('campaign', { ...c, scenario: c.description || '', audience_id: audiences.find(a => a.name === c.audience)?.audience_id || '', location: 'All selected locations', languages: ['English'], channels: ['SMS'], tone: 'Informative' })}>✎</button><button title="Delete campaign" className="danger-icon" onClick={() => removeCampaign(c.campaign_id)}>♢</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {tab === 'Templates' && (
                <section className="panel">
                  <div className="panel-toolbar"><div><h2>Communication Templates</h2><p>Reusable SMS messages for awareness, education, emergencies and reminders.</p></div><span className="count-pill">{templates.length} templates</span></div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>TITLE</th><th>TYPE</th><th>CHANNEL</th><th>CONTENT</th><th>ACTIONS</th></tr></thead>
                      <tbody>
                        {filteredTemplates.map(t => (
                          <tr key={t.template_id}>
                            <td><strong>{t.title}</strong></td><td><span className="tag">{t.template_type}</span></td><td><span className="tag soft">{t.channel}</span></td><td className="template-content">{t.content}</td>
                            <td className="actions"><button onClick={() => openModal('template', { ...t })}>✎</button><button className="danger-icon" onClick={() => removeTemplate(t.template_id)}>♢</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </section>

      {modal && <Modal type={modal} editing={editing} setEditing={setEditing} audiences={audiences} onSave={() => saveEntity(modal)} onClose={closeModal} />}
    </div>
  );
}


function ScoreBar({ label, score, detail, compact = false }: any) {
  const safe = Math.max(0, Math.min(100, Number(score ?? 0)));
  return (
    <div className={`score-item ${compact ? 'compact' : ''}`}>
      <div className="score-head"><span>{label}</span><strong>{safe}%</strong></div>
      <div className="score-track"><div className="score-fill" style={{ width: `${safe}%` }} /></div>
      {detail && <small>{detail}</small>}
    </div>
  );
}

function CommunicationComposer({ campaign, audiences, config, setConfig, result, notice, generating, onGenerate, onBack, onToggle, page, setPage, quality, qualityLoading, onQualityCheck }: any) {
  const [previewChannel, setPreviewChannel] = useState(config.channels[0] || 'SMS');
  const [previewLanguage, setPreviewLanguage] = useState(config.languages[0] || 'English');
  const languages = ['English', 'Tamil', 'Telugu', 'Kannada', 'Hindi', 'Malayalam'];
  const channels = ['SMS', 'WhatsApp'];
  const selectedAudience = audiences.find((a: any) => Number(a.audience_id) === Number(config.audience_id));
  const localized = result?.localizedContent || {};
  const activeLanguage = localized[previewLanguage] ? previewLanguage : Object.keys(localized)[0] || 'English';
  const previewText = result?.channelVersions?.[previewChannel]?.[activeLanguage] || localized[activeLanguage] || result?.baseContent || '';
  const personalization = Number(result?.personalizationScore ?? 0);
  const toneOptimization = Number(result?.toneOptimizationScore ?? 0);

  if (page === 'quality' && result) {
    const q = quality || {};
    const overall = Number(q.overallScore ?? 0);
    return (
      <section className="communication-composer">
        <div className="composer-head">
          <div>
            <span className="eyebrow dark">AI QUALITY & COMPLIANCE</span>
            <h1>{campaign.name} · Validation</h1>
            <p>Validate the generated communication before it can move to the distribution stage. This review combines Gemini evaluation with NLP-assisted checks.</p>
          </div>
          <button className="outline-btn" onClick={() => setPage('generated')}>← Back to Generated Content</button>
        </div>

        <div className="quality-hero panel">
          <div className="quality-score-circle"><strong>{overall}</strong><span>/ 100</span></div>
          <div className="quality-summary">
            <span className="eyebrow dark">OVERALL QUALITY SCORE</span>
            <h2>{overall >= 85 ? 'Ready for admin review' : overall >= 70 ? 'Review recommended' : 'Needs improvement'}</h2>
            <p>{q.summary || 'Quality and compliance checks have been completed for the generated content.'}</p>
            <div className="quality-badges"><span>Gemini evaluation</span><span>spaCy + Indic NLP checks</span><span>{Object.keys(localized).length} language versions</span></div>
          </div>
        </div>

        <div className="quality-grid">
          <section className="panel quality-panel">
            <div className="section-title"><div><span className="eyebrow dark">QUALITY DIMENSIONS</span><h2>Communication quality</h2></div><span className="tag">0–100</span></div>
            <div className="score-list">
              <ScoreBar label="Grammar" score={q.grammarScore} detail={q.grammarNote} />
              <ScoreBar label="Clarity" score={q.clarityScore} detail={q.clarityNote} />
              <ScoreBar label="Tone appropriateness" score={q.toneScore} detail={q.toneNote} />
              <ScoreBar label="Factual accuracy" score={q.factualAccuracyScore} detail={q.factualNote} />
              <ScoreBar label="Sensitive content" score={q.sensitiveContentScore} detail={q.sensitiveNote} />
              <ScoreBar label="Compliance" score={q.complianceScore} detail={q.complianceNote} />
            </div>
          </section>

          <section className="panel quality-panel">
            <div className="section-title"><div><span className="eyebrow dark">NLP ASSISTANCE</span><h2>Language analysis</h2></div><span className="tag soft">LOCAL CHECKS</span></div>
            <div className="nlp-metrics">
              <div><strong>{q.nlp?.sentenceCount ?? '—'}</strong><span>sentences analysed</span></div>
              <div><strong>{q.nlp?.tokenCount ?? '—'}</strong><span>tokens analysed</span></div>
              <div><strong>{q.nlp?.flagCount ?? 0}</strong><span>language flags</span></div>
            </div>
            <div className="nlp-engine-note"><strong>spaCy + Indic NLP Library</strong><p>Used for sentence/token analysis and Indian-language text normalization support. Semantic quality, factuality and compliance are evaluated by Gemini.</p></div>
            {q.flags?.length ? <div className="quality-flags"><strong>Review flags</strong>{q.flags.map((flag: string, i: number) => <div key={i}>• {flag}</div>)}</div> : <div className="quality-pass">✓ No critical review flags detected</div>}
          </section>
        </div>

        <section className="panel quality-panel">
          <div className="section-title"><div><span className="eyebrow dark">LOCALIZED VALIDATION</span><h2>Language versions</h2></div><span className="count-pill">Review before approval</span></div>
          <div className="quality-language-grid">
            {Object.entries(localized).map(([lang, text]: any) => (
              <article key={lang} className="quality-language-card"><div><strong>{lang}</strong><span>{q.languageScores?.[lang] != null ? `${q.languageScores[lang]}% quality` : 'Generated version'}</span></div><p>{text}</p></article>
            ))}
          </div>
        </section>

        <div className="approval-bar quality-approval"><div><strong>Admin decision</strong><span>Approve only after reviewing the overall score, language versions and any flagged content.</span></div><button className="outline-btn" onClick={() => setPage('generated')}>Edit generated content</button><button className="primary" disabled={overall < 70}>Approve & Continue</button></div>
      </section>
    );
  }

  return (
    <section className="communication-composer">
      <div className="composer-head">
        <div>
          <span className="eyebrow dark">GENERATED CONTENT</span>
          <h1>{campaign.campaign_id ? campaign.name : 'Create communication'}</h1>
          <p>Generate review-ready multilingual communication from the administrator's scenario, then inspect personalization and tone optimization before moving to quality validation.</p>
        </div>
        <button className="outline-btn" onClick={onBack}>← Back to Campaigns</button>
      </div>

      <div className="composer-grid">
        <section className="panel composer-form">
          <div className="section-title"><div><span className="eyebrow dark">CAMPAIGN BRIEF</span><h2>Communication context</h2></div><span className="tag">GEMINI AI</span></div>
          <label className="form-field"><span>Scenario / communication brief</span><textarea rows={7} value={config.scenario} onChange={e => setConfig({ ...config, scenario: e.target.value })} placeholder="Describe what is happening, what people need to know and what action they should take." /></label>
          <div className="form-grid">
            <label className="form-field"><span>Target audience</span><select value={config.audience_id} onChange={e => setConfig({ ...config, audience_id: e.target.value })}><option value="">General Public</option>{audiences.map((a: any) => <option key={a.audience_id} value={a.audience_id}>{a.name} ({a.members} recipients)</option>)}</select></label>
            <label className="form-field"><span>Location / city</span><input value={config.location} onChange={e => setConfig({ ...config, location: e.target.value })} placeholder="Chennai, Tamil Nadu" /></label>
          </div>
          <div className="form-grid">
            <label className="form-field"><span>Tone</span><select value={config.tone} onChange={e => setConfig({ ...config, tone: e.target.value })}><option>Informative</option><option>Friendly</option><option>Urgent</option><option>Encouraging</option><option>Professional</option></select></label>
            <div className="form-field"><span>Recipients</span><div className="recipient-summary"><strong>{selectedAudience?.members ?? 'All eligible'}</strong><small>{selectedAudience ? `${selectedAudience.name} members` : 'based on the selected audience'}</small></div></div>
          </div>
          <div className="preferred-language-toggle"><label><input type="checkbox" checked={config.usePreferredLanguages !== false} onChange={e => setConfig({ ...config, usePreferredLanguages: e.target.checked })} /> Use each recipient's preferred language when preparing the final message</label><small>{config.usePreferredLanguages !== false ? 'Audience language distribution will guide the localized versions.' : 'The selected language chips will be used for generation.'}</small></div>
          <div className="choice-block"><span>Generate in languages</span><div className="choice-row">{languages.map(lang => <button type="button" key={lang} className={`choice-chip ${config.languages.includes(lang) ? 'selected' : ''}`} onClick={() => onToggle('languages', lang)}>{config.languages.includes(lang) ? '✓ ' : ''}{lang}</button>)}</div></div>
          <div className="choice-block"><span>Delivery format</span><div className="choice-row">{channels.map(channel => <button type="button" key={channel} className={`choice-chip ${config.channels.includes(channel) ? 'selected' : ''}`} onClick={() => { setPreviewChannel(channel); onToggle('channels', channel); }}>{config.channels.includes(channel) ? '✓ ' : ''}{channel}</button>)}</div></div>
          <button className="primary ai-generate-btn" onClick={onGenerate} disabled={generating || !config.scenario.trim()}>{generating ? 'Generating content…' : 'Generate Communication'}</button>
          {result && <div className="ai-provider-note">Generated with {result.model || 'gemini-2.5-flash'}. Review the localized versions before approval.</div>}
          {notice && !result && <div className="ai-provider-note">{notice}</div>}
        </section>

        <section className="panel generated-panel">
          <div className="section-title"><div><span className="eyebrow dark">AI OUTPUT</span><h2>{result ? 'Generated communication' : 'Ready for generation'}</h2></div>{result && <span className="status active">Generated</span>}</div>
          {!result ? <div className="ai-empty"><div>✦</div><h3>Your communication will appear here</h3><p>Enter the scenario, select the audience, languages and channels, then generate the final drafts.</p></div> : (
            <>
              <div className="generated-meta"><span>{result.provider || 'Google Gemini'}</span><span>{result.recipientCount ?? 'All'} recipients</span><span>{Object.keys(localized).length} languages</span><span>{config.channels.join(' + ')}</span></div>
              {result.languageDistribution && <div className="language-distribution"><strong>Recipient language distribution</strong><div>{Object.entries(result.languageDistribution).map(([lang, count]: any) => <span key={lang}>{lang} <b>{count}</b></span>)}</div></div>}

              <div className="ai-insight-grid">
                <article className="ai-insight-card"><div className="insight-title"><span>Audience personalization</span><strong>{personalization}%</strong></div><div className="score-track"><div className="score-fill" style={{ width: `${personalization}%` }} /></div><p>{result.personalizationSummary || 'Content is adapted to the selected audience, location and recipient language preferences.'}</p></article>
                <article className="ai-insight-card"><div className="insight-title"><span>Sentiment & tone optimization</span><strong>{toneOptimization}%</strong></div><div className="score-track"><div className="score-fill" style={{ width: `${toneOptimization}%` }} /></div><p>{result.toneOptimizationSummary || `Message tone is optimized for ${config.tone.toLowerCase()} public communication.`}</p></article>
              </div>

              <div className="language-results">{Object.entries(localized).map(([lang, text]: any) => <article className="localized-card" key={lang}><div className="localized-head"><strong>{lang}</strong><span>Localized version</span></div><p>{text}</p></article>)}</div>
              <div className="preview-switcher"><strong>Delivery preview</strong><div className="preview-controls"><div>{Object.keys(localized).map((lang: string) => <button key={lang} className={activeLanguage === lang ? 'active' : ''} onClick={() => setPreviewLanguage(lang)}>{lang}</button>)}</div><div>{config.channels.map((channel: string) => <button key={channel} className={previewChannel === channel ? 'active' : ''} onClick={() => setPreviewChannel(channel)}>{channel}</button>)}</div></div></div>
              <div className="delivery-previews">
                {previewChannel === 'WhatsApp' && <div className="device-preview whatsapp-preview"><div className="device-top">WhatsApp · Preview</div><div className="chat-area"><div className="chat-bubble">{previewText}<small>10:42 ✓✓</small></div></div></div>}
                {previewChannel === 'SMS' && <div className="device-preview sms-preview"><div className="device-top">Messages · Preview</div><div className="sms-recipient">+91 XXXXX XXXXX</div><div className="sms-bubble"><strong>{campaign.name}</strong><p>{previewText}</p><small>Now · {activeLanguage}</small></div></div>}
              </div>
              <div className="approval-bar"><div><strong>Next: AI Quality & Compliance</strong><span>Review the generated multilingual content first. The next page evaluates grammar, clarity, tone, factual accuracy, sensitive content and compliance.</span></div><button className="primary" onClick={onQualityCheck} disabled={qualityLoading}>{qualityLoading ? 'Running quality check…' : 'Continue to AI Quality & Compliance →'}</button></div>
            </>
          )}
        </section>
      </div>
    </section>
  );
}

function Dashboard({ stats, campaigns, audiences, onNavigate }: any) {
  const active = campaigns.find((c: any) => c.status === 'ACTIVE') || campaigns[0];
  return (
    <>
      <div className="welcome-row">
        <div><h2>Welcome back, System Admin</h2><p>Here's what's happening with your communication platform.</p></div>
        <span className="date-chip">Public Communication Workspace</span>
      </div>
      <div className="stat-grid">
        {[
          ['Recipients', stats.recipients, '♙', 'Manage people'],
          ['Audiences', stats.audiences, '◈', 'Target groups'],
          ['Campaigns', stats.campaigns, '◉', 'Communication plans'],
          ['Templates', stats.templates, '▤', 'Reusable messages'],
        ].map(([name, value, icon, helper]) => (
          <button className="stat-card" key={String(name)} onClick={() => onNavigate(name as Tab)}>
            <div className="stat-icon">{icon}</div><div><span>{name}</span><strong>{value}</strong><small>{helper}</small></div><b>→</b>
          </button>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel campaign-highlight">
          <div className="section-title"><div><span className="eyebrow dark">CURRENT CAMPAIGN</span><h2>{active?.name || 'No campaigns yet'}</h2></div>{active && <span className={`status ${String(active.status).toLowerCase()}`}>{active.status}</span>}</div>
          {active ? <><p>{active.description || 'Public awareness campaign configured for your selected audience.'}</p><div className="campaign-meta"><div><span>Target audience</span><strong>{active.audience || 'Not assigned'}</strong></div><div><span>Campaign ID</span><strong>#{active.campaign_id}</strong></div></div></> : <p>Create your first campaign to get started.</p>}
        </section>
        <section className="panel quick-panel">
          <div className="section-title"><div><span className="eyebrow dark">QUICK ACTIONS</span><h2>Manage workspace</h2></div></div>
          <button onClick={() => onNavigate('Recipients')}>Manage recipients <span>→</span></button>
          <button onClick={() => onNavigate('Audiences')}>Manage audiences <span>→</span></button>
          <button onClick={() => onNavigate('Campaigns')}>Manage campaigns <span>→</span></button>
          <button onClick={() => onNavigate('Templates')}>Manage templates <span>→</span></button>
        </section>
      </div>
      <section className="panel milestone-panel">
        <div><span className="eyebrow dark">WORKSPACE STATUS</span><h2>Communication workspace is ready</h2><p>Manage recipients, audience groups, campaigns and reusable communication templates.</p></div>
        <div className="progress-ring">✓</div>
      </section>
    </>
  );
}

function Modal({ type, editing, setEditing, audiences, onSave, onClose }: any) {
  const title = type === 'recipient' ? (editing?.recipient_id ? 'Edit Recipient' : 'Add Recipient') :
    type === 'audience' ? (editing?.audience_id ? 'Edit Audience' : 'Create Audience') :
    type === 'campaign' ? (editing?.campaign_id ? 'Edit Campaign' : 'Create Campaign') :
    type === 'template' ? (editing?.template_id ? 'Edit Template' : 'New Template') : 'Administrator Profile';

  const field = (key: string, label: string, type = 'text') => (
    <label className="form-field"><span>{label}</span><input type={type} value={editing?.[key] ?? ''} onChange={e => setEditing({ ...editing, [key]: e.target.value })} /></label>
  );

  return (
    <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card">
        <div className="modal-header"><div><span className="eyebrow dark">ADMIN MANAGEMENT</span><h2>{title}</h2></div><button className="close-btn" onClick={onClose}>×</button></div>

        {type === 'recipient' && <div className="form-grid">
          {field('first_name', 'First name')}{field('last_name', 'Last name')}{field('email', 'Email', 'email')}{field('phone', 'Phone')}
          {field('age', 'Age', 'number')}{field('gender', 'Gender')}{field('state', 'State')}{field('district', 'District')}
          {field('city', 'City')}{field('language', 'Language')}{field('occupation', 'Occupation')}
          <label className="form-field"><span>Status</span><select value={editing.status || 'ACTIVE'} onChange={e => setEditing({ ...editing, status: e.target.value })}><option>ACTIVE</option><option>INACTIVE</option></select></label>
        </div>}

        {type === 'audience' && <div className="form-grid single">{field('name', 'Audience name')}{field('description', 'Description')}</div>}

        {type === 'campaign' && <div className="form-grid single">
          {field('name', 'Campaign name')}
          <label className="form-field"><span>What is happening?</span><textarea rows={7} value={editing.scenario || editing.description || ''} onChange={e => setEditing({ ...editing, scenario: e.target.value, description: e.target.value })} placeholder="Describe the situation, what people need to know and what action they should take." /></label>
          <label className="form-field"><span>Target audience</span><select value={editing.audience_id || ''} onChange={e => setEditing({ ...editing, audience_id: e.target.value })}><option value="">Select an audience</option>{audiences.map((a: any) => <option key={a.audience_id} value={a.audience_id}>{a.name} ({a.members})</option>)}</select></label>
          <label className="form-field"><span>Location / city</span><input value={editing.location || ''} onChange={e => setEditing({ ...editing, location: e.target.value })} placeholder="Chennai, Tamil Nadu" /></label>
          <label className="form-field"><span>Tone</span><select value={editing.tone || 'Informative'} onChange={e => setEditing({ ...editing, tone: e.target.value })}><option>Informative</option><option>Friendly</option><option>Urgent</option><option>Encouraging</option><option>Professional</option></select></label>
          <div className="form-field"><span>Languages</span><div className="choice-row">{['English','Tamil','Telugu','Kannada','Hindi','Malayalam'].map(lang => <button type="button" key={lang} className={`choice-chip ${editing.languages?.includes(lang) ? 'selected' : ''}`} onClick={() => setEditing({ ...editing, languages: editing.languages?.includes(lang) ? editing.languages.filter((x: string) => x !== lang) : [...(editing.languages || []), lang] })}>{editing.languages?.includes(lang) ? '✓ ' : ''}{lang}</button>)}</div></div>
          <div className="form-field"><span>Delivery channels</span><div className="choice-row">{['SMS','WhatsApp'].map(channel => <button type="button" key={channel} className={`choice-chip ${editing.channels?.includes(channel) ? 'selected' : ''}`} onClick={() => setEditing({ ...editing, channels: editing.channels?.includes(channel) ? editing.channels.filter((x: string) => x !== channel) : [...(editing.channels || []), channel] })}>{editing.channels?.includes(channel) ? '✓ ' : ''}{channel}</button>)}</div></div>
          <label className="form-field"><span>Status</span><select value={editing.status || 'DRAFT'} onChange={e => setEditing({ ...editing, status: e.target.value })}><option>DRAFT</option><option>ACTIVE</option><option>COMPLETED</option></select></label>
        </div>}

        {type === 'template' && <div className="form-grid single">
          {field('title', 'Template title')}
          <label className="form-field"><span>Template type</span><select value={editing.template_type || 'Awareness'} onChange={e => setEditing({ ...editing, template_type: e.target.value })}><option>Awareness</option><option>Education</option><option>Emergency</option><option>Reminder</option><option>General</option></select></label>
          <label className="form-field"><span>Channel</span><select value={editing.channel || 'SMS'} onChange={e => setEditing({ ...editing, channel: e.target.value })}><option>SMS</option></select></label>
          <label className="form-field"><span>Message content</span><textarea rows={6} value={editing.content || ''} onChange={e => setEditing({ ...editing, content: e.target.value })} /></label>
        </div>}

        {type === 'profile' && <div className="profile-edit">
          <div className="profile-hero"><div className="large-avatar">{(editing?.full_name || 'S').charAt(0).toUpperCase()}</div><div><h3>{editing?.full_name || 'System Admin'}</h3><p>Administrator</p></div></div>
          {field('full_name', 'Full name')}{field('email', 'Email', 'email')}
          <div className="profile-note">Your administrator account controls the communication workspace and its managed records.</div>
        </div>}

        <div className="modal-footer"><button className="outline-btn" onClick={onClose}>Cancel</button><button className="primary" onClick={onSave}>{type === 'campaign' ? 'Save & Open AI Composer' : 'Save changes'}</button></div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);