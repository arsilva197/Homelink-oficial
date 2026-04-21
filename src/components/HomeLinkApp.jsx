'use client'
import { useState, useCallback, useEffect } from 'react'
import { PROPS as PROPS_DATA, INTERESTS as INT_DATA, CHAINS, OPPS as OPPS_DATA,
  USERS_DATA, BROKERS_DATA, AGENCIES_DATA, COMM_HISTORY, ALERTS, ROLES } from '../data/mockData'
import { t, navLabel, getNav, navBadge, fmtPrice, fmtN, fmtPct,
  getBadgeClass, getBadgeLabel, PROP_GRADIENTS, PROP_ICONS } from '../lib/utils'
import { Badge, Modal, ToastContainer, PropCard, KpiCard, MetricRow,
  PipelineSteps, ImportModal } from './ui'

// ─── Screen components ───────────────────────────────────────
import ScreenMarketplace from './screens/Marketplace'
import ScreenDashboard from './screens/Dashboard'
import ScreenMyProperties from './screens/MyProperties'
import ScreenInterests from './screens/Interests'
import ScreenOpportunities from './screens/Opportunities'
import ScreenOppDetail from './screens/OppDetail'
import ScreenTransactions from './screens/Transactions'
import ScreenPayments from './screens/Payments'
import ScreenAnalytics from './screens/Analytics'
import ScreenSourcing from './screens/Sourcing'
import ScreenMyBrokers from './screens/MyBrokers'
import ScreenAdminUsers from './screens/AdminUsers'
import ScreenProperties from './screens/Properties'

const PL = ['PENDING_REVIEW','APPROVED','ASSIGNED','IN_NEGOTIATION','CONCRETIZADA','COMMISSION_PENDING','COMMISSION_PAID','CLOSED'];

export default function HomeLinkApp() {
  const [role, setRole] = useState('ADMIN')
  const [lang, setLang] = useState('pt')
  const [theme, setTheme] = useState('light')
  const [screen, setScreen] = useState('marketplace')
  const [props, setProps] = useState(PROPS_DATA)
  const [interests, setInterests] = useState(INT_DATA)
  const [opps, setOpps] = useState(OPPS_DATA)
  const [toasts, setToasts] = useState([])
  const [modal, setModal] = useState(null) // {type, data}
  const [selectedOpp, setSelectedOpp] = useState(null)
  const [demoMode, setDemoMode] = useState(false)

  // Toggle theme on <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toast = useCallback((message, type='info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200)
  }, [])

  const navigate = useCallback((sid) => {
    setScreen(sid)
    if (sid === 'opp-detail') return // keep selectedOpp
  }, [])

  const openOpp = useCallback((oppId) => {
    const o = opps.find(x => x.id === oppId)
    if (o) { setSelectedOpp(o); setScreen('opp-detail') }
  }, [opps])

  const toggleFav = useCallback((propId) => {
    setProps(prev => prev.map(p => p.id === propId ? {...p, fav: !p.fav} : p))
  }, [])

  const switchRole = useCallback((r) => {
    setRole(r)
    setScreen('marketplace')
    toast(t('perfil_ativo', lang) + ': ' + t(r, lang), 'info')
  }, [lang, toast])

  const advanceOpp = useCallback((oppId) => {
    setOpps(prev => prev.map(o => {
      if (o.id !== oppId) return o
      const next = Math.min(o.si + 1, PL.length - 1)
      return { ...o, si: next, status: PL[next] }
    }))
    toast('Oportunidade avançada ✓', 'success')
  }, [toast])

  const retreatOpp = useCallback((oppId) => {
    setOpps(prev => prev.map(o => {
      if (o.id !== oppId) return o
      const prev_si = Math.max(o.si - 1, 0)
      return { ...o, si: prev_si, status: PL[prev_si] }
    }))
  }, [])

  const updateCommStatus = useCallback((oppId, ref, status) => {
    setOpps(prev => prev.map(o => {
      if (o.id !== oppId) return o
      return { ...o, commissions: o.commissions.map(c => c.ref === ref ? {...c, status} : c) }
    }))
  }, [])

  // Shared context passed to all screens
  const ctx = {
    role, lang, theme, props, interests, opps, toasts,
    CHAINS, USERS_DATA, BROKERS_DATA, AGENCIES_DATA, COMM_HISTORY, ALERTS, ROLES, PL,
    navigate, openOpp, toggleFav, switchRole, advanceOpp, retreatOpp, updateCommStatus,
    toast, setModal, setProps, setInterests, setOpps,
    t: (k) => t(k, lang),
    fmtPrice, fmtN, fmtPct,
  }

  // Nav badges
  const getBadge = (id) => navBadge(id, role, opps, props)

  const nav = getNav(role)

  // Current screen renderer
  const renderScreen = () => {
    switch (screen) {
      case 'marketplace':      return <ScreenMarketplace ctx={ctx} />
      case 'dashboard':        return <ScreenDashboard ctx={ctx} />
      case 'properties':       return <ScreenProperties ctx={ctx} />
      case 'my-properties':    return <ScreenMyProperties ctx={ctx} />
      case 'interests':        return <ScreenInterests ctx={ctx} />
      case 'opportunities':    return <ScreenOpportunities ctx={ctx} />
      case 'opp-detail':       return <ScreenOppDetail ctx={ctx} opp={selectedOpp} />
      case 'transactions':     return <ScreenTransactions ctx={ctx} />
      case 'payments':         return <ScreenPayments ctx={ctx} />
      case 'analytics':
      case 'broker-analytics':
      case 'agency-analytics': return <ScreenAnalytics ctx={ctx} />
      case 'sourcing':         return <ScreenSourcing ctx={ctx} />
      case 'my-brokers':       return <ScreenMyBrokers ctx={ctx} />
      case 'admin_users':      return <ScreenAdminUsers ctx={ctx} />
      default:                 return <ScreenMarketplace ctx={ctx} />
    }
  }

  const cfg = ROLES[role] || ROLES.ADMIN
  const userName = lang === 'pt' ? cfg.user_pt : cfg.user_en

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo">Home<span>Link</span></div>
          <div className="logo-sub">Plataforma MVP</div>
          <div className="role-switcher">
            <div className="role-label" id="lbl-perfil">{t('perfil_ativo', lang)}</div>
            <select className="role-select" value={role} onChange={e => switchRole(e.target.value)}>
              <option value="ADMIN">👤 Admin</option>
              <option value="BROKER">🏢 Corretor</option>
              <option value="AGENCY">🏛 Imobiliária</option>
              <option value="USUARIO">🙋 Usuário</option>
            </select>
          </div>
        </div>

        <nav className="sidebar-nav">
          {nav.map(section => (
            <div key={section.section}>
              <div className="nav-section">{t(section.section, lang)}</div>
              {section.items.map(item => {
                const bc = getBadge(item.id)
                return (
                  <div
                    key={item.id}
                    className={`nav-item${screen === item.id ? ' active' : ''}`}
                    onClick={() => navigate(item.id)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {navLabel(item.id, lang)}
                    {bc > 0 && <span className="nav-badge">{bc}</span>}
                  </div>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-chip" id="user-chip">
            <div className="user-avatar" style={{ background: cfg.color }}>
              {userName[0]}
            </div>
            <div className="user-info">
              <strong>{userName}</strong>
              <span className={`badge ${cfg.badge}`} style={{ fontSize:9, padding:'1px 5px' }}>
                {t(role, lang)}
              </span>
            </div>
          </div>
          <div className="sidebar-controls">
            <button
              className={`btn btn-sm ${theme==='dark'?'btn-primary':'btn-secondary'}`}
              onClick={() => setTheme(t => t==='light'?'dark':'light')}
              title="Toggle theme"
            >
              {theme==='dark'?'☀️':'🌙'}
            </button>
            <button
              className={`btn btn-sm ${lang==='en'?'btn-primary':'btn-secondary'}`}
              onClick={() => setLang(l => l==='pt'?'en':'pt')}
              title="Toggle language"
            >
              {lang==='pt'?'EN':'PT'}
            </button>
            <label style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, cursor:'pointer', color:'var(--text3)' }}>
              <input type="checkbox" checked={demoMode} onChange={e => setDemoMode(e.target.checked)} />
              Demo
            </label>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="page-title" id="page-title">{navLabel(screen, lang)}</div>
          </div>
          <div className="topbar-right" id="topbar-actions">
            {screen === 'my-properties' && (role === 'BROKER' || role === 'AGENCY') && (
              <button className="btn btn-secondary btn-sm" onClick={() => setModal({type:'import'})}>
                ⬆ Importar CSV
              </button>
            )}
            {screen === 'properties' && role === 'ADMIN' && (
              <button className="btn btn-primary btn-sm" onClick={() => setModal({type:'import'})}>
                ⬆ Importar CSV
              </button>
            )}
            {screen === 'interests' && (
              <button className="btn btn-primary btn-sm" onClick={() => setModal({type:'addInterest'})}>
                {ctx.t('btn_add_interest')}
              </button>
            )}
            {['analytics','broker-analytics','agency-analytics'].includes(screen) && (
              <button className="btn btn-secondary btn-sm" onClick={() => toast('Exportando...','info')}>
                ⬇ Exportar
              </button>
            )}
            {screen === 'opp-detail' && (
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('opportunities')}>
                ← {lang==='pt'?'Voltar':'Back'}
              </button>
            )}
          </div>
        </div>

        <div className="content">
          {renderScreen()}
        </div>
      </div>

      {/* MODALS */}
      {modal?.type === 'import' && (
        <ImportModal
          lang={lang}
          onClose={() => setModal(null)}
          onImport={() => {
            const cb = document.getElementById('imp-terms')
            if (cb?.checked) {
              setModal(null)
              toast(lang==='pt'?'CSV importado com sucesso (demo)':'CSV imported successfully (demo)', 'success')
            } else {
              toast(lang==='pt'?'Aceite os termos primeiro':'Please accept terms first', 'error')
            }
          }}
        />
      )}

      {modal?.type === 'propDetail' && modal.data && (
        <PropDetailModal prop={modal.data} lang={lang} opps={opps} onClose={() => setModal(null)} onViewOpp={(o) => { setModal(null); openOpp(o.id) }} />
      )}

      {modal?.type === 'addInterest' && (
        <AddInterestModal lang={lang} role={role} onClose={() => setModal(null)}
          onSave={(data) => {
            const ownerKey = role==='BROKER'?'broker':role==='AGENCY'?'agency':'usuario'
            setInterests(prev => [...prev, { id:`INT-${Date.now()}`, owner:ownerKey, status:'ATIVO', ...data }])
            setModal(null)
            toast(lang==='pt'?'Interesse cadastrado ✓':'Interest added ✓','success')
          }}
        />
      )}

      {modal?.type === 'addListing' && (
        <AddListingModal lang={lang} role={role} onClose={() => setModal(null)}
          onSave={(data) => {
            const ownerKey = role==='USUARIO'?'usuario':'outro'
            setProps(prev => [...prev, { id:`PROP-${Date.now()}`, owner:ownerKey, status:'ativo', chain:null, fav:false, reg:new Date().toISOString().slice(0,10), ...data }])
            setModal(null)
            toast(lang==='pt'?'Anúncio publicado ✓':'Listing published ✓','success')
          }}
        />
      )}

      {/* TOASTS */}
      <ToastContainer toasts={toasts} />
    </div>
  )
}

// ── Prop Detail Modal ─────────────────────────────────────────
function PropDetailModal({ prop, lang, opps, onClose, onViewOpp }) {
  const pt = lang === 'pt'
  const gi = 0
  const [c1, c2] = PROP_GRADIENTS[gi]
  const opp = opps.find(o => o.participants.some(p => p.pid === prop.id))

  return (
    <Modal title={lang==='pt'?prop.name:prop.en} onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>{pt?'Fechar':'Close'}</button>
          {opp && <button className="btn btn-primary" onClick={() => onViewOpp(opp)}>{pt?'Ver Transação':'View Transaction'}</button>}
        </>
      }
    >
      <div style={{ height:180, borderRadius:8, marginBottom:14, background:`linear-gradient(135deg,${c1},${c2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:72 }}>
        🏠
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
        <div>
          <div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:1 }}>{pt?'Preço':'Price'}</div>
          <div style={{ fontSize:18, fontWeight:700, color:'var(--blue)' }}>{fmtPrice(prop.price)}</div>
        </div>
        <div>
          <div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:1 }}>Status</div>
          <div style={{ marginTop:2 }}><Badge status={prop.status?.toUpperCase()} lang={lang} /></div>
        </div>
      </div>
      <table className="data-table"><tbody>
        <tr><td style={{ color:'var(--text3)' }}>{pt?'Tipo':'Type'}</td><td>{prop.type}</td></tr>
        <tr><td style={{ color:'var(--text3)' }}>{pt?'Cidade':'City'}</td><td>{prop.city} — {prop.hood}</td></tr>
        <tr><td style={{ color:'var(--text3)' }}>Área</td><td>{prop.size} m²</td></tr>
        <tr><td style={{ color:'var(--text3)' }}>{pt?'Quartos':'Bedrooms'}</td><td>{prop.beds}</td></tr>
        {prop.chain && <tr><td style={{ color:'var(--text3)' }}>Cadeia</td><td><span style={{ fontWeight:600, color:'var(--blue)' }}>{prop.chain}</span></td></tr>}
      </tbody></table>
    </Modal>
  )
}

// ── Add Interest Modal ────────────────────────────────────────
function AddInterestModal({ lang, role, onClose, onSave }) {
  const pt = lang === 'pt'
  const [form, setForm] = useState({ title:'', type:'Apartamento', city:'São Paulo', hood:'', min_p:'', max_p:'', min_size:'', min_beds:1, notes:'' })
  const set = (k,v) => setForm(f => ({...f, [k]:v}))

  return (
    <Modal title={pt?'Novo Interesse de Compra':'New Buy Interest'} onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>{pt?'Cancelar':'Cancel'}</button>
          <button className="btn btn-primary" onClick={() => {
            if (!form.title || !form.city) return
            onSave({ ...form, min_p: Number(form.min_p)||0, max_p: Number(form.max_p)||0, min_size: Number(form.min_size)||0, min_beds: Number(form.min_beds)||0 })
          }}>{pt?'Salvar':'Save'}</button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">{pt?'Título':'Title'}</label>
        <input className="form-input" placeholder={pt?'Ex: Casa em Vila Mariana':'Ex: House in Vila Mariana'} value={form.title} onChange={e=>set('title',e.target.value)} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div className="form-group">
          <label className="form-label">{pt?'Tipo':'Type'}</label>
          <select className="form-select" value={form.type} onChange={e=>set('type',e.target.value)}>
            <option>Apartamento</option><option>Casa</option><option>Terreno</option><option>Comercial</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{pt?'Cidade':'City'}</label>
          <select className="form-select" value={form.city} onChange={e=>set('city',e.target.value)}>
            <option>São Paulo</option><option>Rio de Janeiro</option><option>Belo Horizonte</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{pt?'Preço Mín (R$)':'Min Price (R$)'}</label>
          <input className="form-input" type="number" value={form.min_p} onChange={e=>set('min_p',e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">{pt?'Preço Máx (R$)':'Max Price (R$)'}</label>
          <input className="form-input" type="number" value={form.max_p} onChange={e=>set('max_p',e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">{pt?'Área Mín (m²)':'Min Area (m²)'}</label>
          <input className="form-input" type="number" value={form.min_size} onChange={e=>set('min_size',e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">{pt?'Quartos Mín':'Min Bedrooms'}</label>
          <input className="form-input" type="number" min="0" value={form.min_beds} onChange={e=>set('min_beds',e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">{pt?'Observações':'Notes'}</label>
        <textarea className="form-input" rows={3} value={form.notes} onChange={e=>set('notes',e.target.value)} />
      </div>
    </Modal>
  )
}

// ── Add Listing Modal ─────────────────────────────────────────
function AddListingModal({ lang, role, onClose, onSave }) {
  const pt = lang === 'pt'
  const [form, setForm] = useState({ name:'', en:'', type:'Apartamento', city:'São Paulo', hood:'', price:'', size:'', beds:2, baths:1, park:1 })
  const set = (k,v) => setForm(f => ({...f, [k]:v}))

  return (
    <Modal title={pt?'+ Novo Anúncio':'+ New Listing'} onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>{pt?'Cancelar':'Cancel'}</button>
          <button className="btn btn-primary" onClick={() => {
            if (!form.name || !form.price) return
            onSave({ ...form, price: Number(form.price), size: Number(form.size)||0, beds: Number(form.beds), baths: Number(form.baths), park: Number(form.park) })
          }}>{pt?'Publicar':'Publish'}</button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">{pt?'Título (PT)':'Title (PT)'}</label>
        <input className="form-input" placeholder="Ex: Apto moderno no centro" value={form.name} onChange={e=>set('name',e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">{pt?'Título (EN)':'Title (EN)'}</label>
        <input className="form-input" placeholder="Ex: Modern downtown apt" value={form.en} onChange={e=>set('en',e.target.value)} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div className="form-group">
          <label className="form-label">{pt?'Tipo':'Type'}</label>
          <select className="form-select" value={form.type} onChange={e=>set('type',e.target.value)}>
            <option>Apartamento</option><option>Casa</option><option>Terreno</option><option>Comercial</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{pt?'Cidade':'City'}</label>
          <select className="form-select" value={form.city} onChange={e=>set('city',e.target.value)}>
            <option>São Paulo</option><option>Rio de Janeiro</option><option>Belo Horizonte</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{pt?'Bairro':'Neighborhood'}</label>
          <input className="form-input" value={form.hood} onChange={e=>set('hood',e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">{pt?'Preço (R$)':'Price (R$)'}</label>
          <input className="form-input" type="number" value={form.price} onChange={e=>set('price',e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Área (m²)</label>
          <input className="form-input" type="number" value={form.size} onChange={e=>set('size',e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">{pt?'Quartos':'Bedrooms'}</label>
          <input className="form-input" type="number" min="0" value={form.beds} onChange={e=>set('beds',e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">{pt?'Banheiros':'Bathrooms'}</label>
          <input className="form-input" type="number" min="0" value={form.baths} onChange={e=>set('baths',e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">{pt?'Vagas':'Parking'}</label>
          <input className="form-input" type="number" min="0" value={form.park} onChange={e=>set('park',e.target.value)} />
        </div>
      </div>
    </Modal>
  )
}
