'use client'
import { useState, useCallback, useEffect } from 'react'
import { CHAINS, USERS_DATA, BROKERS_DATA, AGENCIES_DATA, COMM_HISTORY, ALERTS, ROLES } from '../data/mockData'
import { t, navLabel, getNav, navBadge, fmtPrice, fmtN, fmtPct,
  getBadgeClass, getBadgeLabel, PROP_GRADIENTS, PROP_ICONS } from '../lib/utils'
import {
  bootstrapData,
  insertProperty, updatePropertyStatus as dbUpdatePropStatus,
  approveProperty as dbApproveProp, rejectProperty as dbRejectProp,
  insertInterest, updateInterest as dbUpdateInterest,
  updateInterestStatus as dbUpdateInterestStatus,
  updateOpportunityPipeline, updateOpportunityAssignment, updateOpportunitySplit,
  updateCommissionStatus as dbUpdateCommStatus,
  MOCK_PROPS, MOCK_INTERESTS, MOCK_OPPS,
} from '../lib/db'
import { isSupabaseEnabled } from '../lib/supabase'
import { Badge, Modal, ToastContainer, PropCard, KpiCard, MetricRow,
  PipelineSteps, ImportModal, PriceRangeSlider, NeighborhoodPicker } from './ui'

// ─── Screen components ───────────────────────────────────────
import ScreenMarketplace from './screens/Marketplace'
import ScreenDashboard from './screens/Dashboard'
import ScreenMyProperties from './screens/MyProperties'
import ScreenInterests from './screens/Interests'
import ScreenOpportunities from './screens/Opportunities'
import ScreenOppDetail from './screens/OppDetail'
import ScreenPayments from './screens/Payments'
import ScreenAnalytics from './screens/Analytics'
import ScreenSourcing from './screens/Sourcing'
import ScreenMyBrokers from './screens/MyBrokers'
import ScreenAdminUsers from './screens/AdminUsers'
import ScreenProperties from './screens/Properties'
import ScreenAdminApprovals from './screens/AdminApprovals'

const PL = ['PENDING_REVIEW','APPROVED','ASSIGNED','IN_NEGOTIATION','DUE_DILIGENCE','CONCRETIZADA','COMMISSION_PENDING','COMMISSION_PAID','CLOSED'];

export default function HomeLinkApp() {
  const [role, setRole] = useState('ADMIN')
  const lang = 'pt'
  const [theme, setTheme] = useState('light')
  const [screen, setScreen] = useState('marketplace')
  const [props, setProps] = useState(MOCK_PROPS)
  const [interests, setInterests] = useState(MOCK_INTERESTS)
  const [opps, setOpps] = useState(MOCK_OPPS)
  const [toasts, setToasts] = useState([])
  const [modal, setModal] = useState(null)
  const [selectedOpp, setSelectedOpp] = useState(null)
  const [demoMode, setDemoMode] = useState(false)
  const [loading, setLoading] = useState(isSupabaseEnabled)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (!isSupabaseEnabled) return
    bootstrapData().then(({ props: p, interests: i, chains: _c, opps: o }) => {
      setProps(p)
      setInterests(i)
      setOpps(o)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const toast = useCallback((message, type='info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200)
  }, [])

  const navigate = useCallback((sid) => {
    setScreen(sid)
    if (sid === 'opp-detail') return
  }, [])

  const openOpp = useCallback((oppId) => {
    const o = opps.find(x => x.id === oppId)
    if (o) { setSelectedOpp(o); setScreen('opp-detail') }
  }, [opps])

  // Keep selectedOpp in sync when opps change
  useEffect(() => {
    if (selectedOpp) {
      const updated = opps.find(o => o.id === selectedOpp.id)
      if (updated) setSelectedOpp(updated)
    }
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
      updateOpportunityPipeline(oppId, next, PL[next])
      return { ...o, si: next, status: PL[next] }
    }))
    toast('Oportunidade avançada ✓', 'success')
  }, [toast])

  const retreatOpp = useCallback((oppId) => {
    setOpps(prev => prev.map(o => {
      if (o.id !== oppId) return o
      const prev_si = Math.max(o.si - 1, 0)
      updateOpportunityPipeline(oppId, prev_si, PL[prev_si])
      return { ...o, si: prev_si, status: PL[prev_si] }
    }))
  }, [])

  const updateCommStatus = useCallback((oppId, ref, status) => {
    setOpps(prev => prev.map(o => {
      if (o.id !== oppId) return o
      return { ...o, commissions: o.commissions.map(c => c.ref === ref ? {...c, status} : c) }
    }))
    dbUpdateCommStatus(ref, status)
  }, [])

  // Toggle property status: pause / activate / remove (cancel)
  const togglePropStatus = useCallback((propId, action) => {
    setProps(prev => prev.map(p => {
      if (p.id !== propId) return p
      const now = new Date().toISOString().slice(0,10)
      const eventMap = { pause: 'Status: Pausado', activate: 'Status: Ativo', remove: 'Status: Cancelado' }
      const statusMap = { pause: 'pausado', activate: 'ativo', remove: 'cancelado' }
      return {
        ...p,
        status: statusMap[action],
        audit: [...(p.audit||[]), { date: now, event: eventMap[action], user: lang==='pt'?'Usuário':'User', type:'status' }]
      }
    }))
    dbUpdatePropStatus(propId, action)
    const msgs = {
      pause: lang==='pt'?'Anúncio pausado':'Listing paused',
      activate: lang==='pt'?'Anúncio reativado':'Listing reactivated',
      remove: lang==='pt'?'Anúncio removido':'Listing removed',
    }
    toast(msgs[action], action==='remove'?'info':'success')
    setModal(null)
  }, [lang, toast])

  // Approve / reject property (admin)
  const approveProp = useCallback((propId) => {
    setProps(prev => prev.map(p => {
      if (p.id !== propId) return p
      const now = new Date().toISOString().slice(0,10)
      return {
        ...p,
        status: 'ativo',
        approval_status: 'approved',
        audit: [...(p.audit||[]), { date:now, event:'Aprovado pelo Admin', user:'Admin Demo', type:'approved' }, { date:now, event:'Status: Ativo', user:'Sistema', type:'status' }]
      }
    }))
    dbApproveProp(propId)
    toast(lang==='pt'?'Anúncio aprovado ✓':'Listing approved ✓', 'success')
  }, [lang, toast])

  const rejectProp = useCallback((propId, reason='') => {
    setProps(prev => prev.map(p => {
      if (p.id !== propId) return p
      const now = new Date().toISOString().slice(0,10)
      return {
        ...p,
        status: 'cancelado',
        approval_status: 'rejected',
        rejection_reason: reason || null,
        audit: [...(p.audit||[]), { date:now, event:`Rejeitado pelo Admin${reason ? ': '+reason : ''}`, user:'Admin Demo', type:'rejected' }]
      }
    }))
    dbRejectProp(propId)
    toast(lang==='pt'?'Anúncio rejeitado':'Listing rejected', 'info')
  }, [lang, toast])

  // Assign broker & agency to opportunity
  const assignBrokerToOpp = useCallback((oppId, broker, agency) => {
    setOpps(prev => prev.map(o => {
      if (o.id !== oppId) return o
      return {
        ...o,
        broker: broker?.name || null,
        broker_id: broker?.id || null,
        agency: agency?.name || null,
        agency_id: agency?.id || null,
      }
    }))
    updateOpportunityAssignment(oppId, broker, agency)
  }, [])

  // Update commission split percentages
  const updateOppSplit = useCallback((oppId, split) => {
    setOpps(prev => prev.map(o => o.id !== oppId ? o : { ...o, split }))
    updateOpportunitySplit(oppId, split)
  }, [])

  // Shared context passed to all screens
  const ctx = {
    role, lang, theme, props, interests, opps, toasts, loading,
    CHAINS, USERS_DATA, BROKERS_DATA, AGENCIES_DATA, COMM_HISTORY, ALERTS, ROLES, PL,
    navigate, openOpp, toggleFav, switchRole,
    advanceOpp, retreatOpp, updateCommStatus,
    togglePropStatus, approveProp, rejectProp, assignBrokerToOpp, updateOppSplit,
    toast, setModal, setProps, setInterests, setOpps,
    dbUpdateInterest, dbUpdateInterestStatus,
    t: (k) => t(k, lang),
    fmtPrice, fmtN, fmtPct,
  }

  const getBadge = (id) => navBadge(id, role, opps, props)
  const nav = getNav(role)

  const renderScreen = () => {
    switch (screen) {
      case 'marketplace':      return <ScreenMarketplace ctx={ctx} />
      case 'dashboard':        return <ScreenDashboard ctx={ctx} />
      case 'properties':       return <ScreenProperties ctx={ctx} />
      case 'my-properties':    return <ScreenMyProperties ctx={ctx} />
      case 'interests':        return <ScreenInterests ctx={ctx} />
      case 'opportunities':    return <ScreenOpportunities ctx={ctx} />
      case 'opp-detail':       return <ScreenOppDetail ctx={ctx} opp={selectedOpp} />
      case 'payments':         return <ScreenPayments ctx={ctx} />
      case 'analytics':
      case 'broker-analytics':
      case 'agency-analytics': return <ScreenAnalytics ctx={ctx} />
      case 'sourcing':         return <ScreenSourcing ctx={ctx} />
      case 'my-brokers':       return <ScreenMyBrokers ctx={ctx} />
      case 'admin_users':      return <ScreenAdminUsers ctx={ctx} />
      case 'admin-approvals':  return <ScreenAdminApprovals ctx={ctx} />
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
            {screen === 'interests' && (
              <button className="btn btn-primary btn-sm" onClick={() => setModal({type:'addInterest'})}>
                {ctx.t('btn_add_interest')}
              </button>
            )}
            {screen === 'my-properties' && (
              <button className="btn btn-primary btn-sm" onClick={() => setModal({type:'addListing'})}>
                {ctx.t('btn_add_listing')}
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
          {loading
            ? <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:16, color:'var(--text3)' }}>
                <div style={{ width:36, height:36, border:'3px solid var(--border)', borderTopColor:'var(--blue)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                <span style={{ fontSize:13 }}>{lang==='pt'?'Carregando dados...':'Loading data...'}</span>
              </div>
            : renderScreen()
          }
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
        <PropDetailModal prop={modal.data} lang={lang} role={role} opps={opps} onClose={() => setModal(null)} onViewOpp={(o) => { setModal(null); openOpp(o.id) }} />
      )}

      {modal?.type === 'addInterest' && (
        <AddInterestModal lang={lang} role={role} onClose={() => setModal(null)}
          onSave={async (data) => {
            const ownerKey = role==='BROKER'?'broker':role==='AGENCY'?'agency':'usuario'
            const newInt = { id:`INT-${Date.now()}`, owner:ownerKey, status:'ATIVO', sourcing_status:'PENDENTE', ...data }
            setInterests(prev => [...prev, newInt])
            setModal(null)
            toast(lang==='pt'?'Interesse cadastrado ✓':'Interest added ✓','success')
            const saved = await insertInterest({ ...newInt, user_id: null })
            if (saved) setInterests(prev => prev.map(i => i.id === newInt.id ? { ...i, id: saved.id } : i))
          }}
        />
      )}

      {modal?.type === 'addListing' && (
        <AddListingModal lang={lang} role={role} onClose={() => setModal(null)}
          onSave={async (data) => {
            if (modal.data) {
              // Edit existing
              setProps(prev => prev.map(p => p.id === modal.data.id ? { ...p, ...data } : p))
              toast(lang==='pt'?'Anúncio atualizado ✓':'Listing updated ✓','success')
            } else {
              // Create new — starts as pending approval
              const ownerKey = role==='USUARIO'?'usuario':'outro'
              const now = new Date().toISOString().slice(0,10)
              const newProp = {
                id:`PROP-${Date.now()}`, owner:ownerKey, status:'pendente',
                chain:null, fav:false, reg:now,
                approval_status:'pending',
                audit:[{ date:now, event:'Anúncio criado — aguardando aprovação', user:ROLES[role]?.user_pt||'Usuário', type:'created' }],
                ...data
              }
              setProps(prev => [...prev, newProp])
              toast(lang==='pt'?'Anúncio enviado para aprovação ⏳':'Listing sent for approval ⏳','info')
              const saved = await insertProperty({ ...newProp, user_id: null })
              if (saved) setProps(prev => prev.map(p => p.id === newProp.id ? { ...p, id: saved.id } : p))
            }
            setModal(null)
          }}
        />
      )}

      {modal?.type === 'confirmRemoveProp' && modal.data && (
        <Modal
          title={lang==='pt'?'Remover Anúncio':'Remove Listing'}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setModal(null)}>{lang==='pt'?'Cancelar':'Cancel'}</button>
              <button className="btn btn-sm" style={{ background:'var(--red)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', padding:'7px 16px', cursor:'pointer', fontWeight:600 }}
                onClick={() => togglePropStatus(modal.data.id, 'remove')}>
                🗑 {lang==='pt'?'Remover':'Remove'}
              </button>
            </>
          }
        >
          <p style={{ fontSize:13.5, color:'var(--text2)', marginBottom:8 }}>
            {lang==='pt'
              ? `Tem certeza que deseja remover o anúncio "${modal.data.name}"?`
              : `Are you sure you want to remove the listing "${modal.data.en || modal.data.name}"?`
            }
          </p>
          <p style={{ fontSize:12, color:'var(--text3)' }}>
            {lang==='pt'?'O anúncio será marcado como cancelado e poderá ser restaurado depois.':'The listing will be marked as cancelled and can be restored later.'}
          </p>
        </Modal>
      )}

      {/* TOASTS */}
      <ToastContainer toasts={toasts} />
    </div>
  )
}

// ── Prop Detail Modal ─────────────────────────────────────────
function PropDetailModal({ prop, lang, role, opps, onClose, onViewOpp }) {
  const pt = lang === 'pt'
  const gi = 0
  const [c1, c2] = PROP_GRADIENTS[gi]
  const icon = PROP_ICONS[0]
  const opp = opps.find(o => o.participants.some(p => p.pid === prop.id))
  const photos = prop.photos || []
  const [photoIdx, setPhotoIdx] = useState(0)
  const creator = prop.audit?.[0]

  return (
    <Modal title={prop.name} onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Fechar</button>
          {opp && <button className="btn btn-primary" onClick={() => onViewOpp(opp)}>Ver Oportunidade →</button>}
        </>
      }
    >
      {/* ── Hero / Carousel ── */}
      <div style={{ height:210, borderRadius:8, marginBottom:14, position:'relative', overflow:'hidden', background:`linear-gradient(135deg,${c1},${c2})`, display:'flex', alignItems:'center', justifyContent:'center' }}>
        {photos.length > 0 ? (
          <>
            <img src={photos[photoIdx]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
              onError={e => { e.target.style.display='none' }} />
            {photos.length > 1 && (
              <>
                <button onClick={() => setPhotoIdx(i => (i - 1 + photos.length) % photos.length)}
                  style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', width:28, height:28, borderRadius:'50%', background:'rgba(0,0,0,.45)', color:'#fff', border:'none', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>‹</button>
                <button onClick={() => setPhotoIdx(i => (i + 1) % photos.length)}
                  style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', width:28, height:28, borderRadius:'50%', background:'rgba(0,0,0,.45)', color:'#fff', border:'none', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>›</button>
                <div style={{ position:'absolute', bottom:8, left:0, right:0, display:'flex', justifyContent:'center', gap:5 }}>
                  {photos.map((_, i) => (
                    <button key={i} onClick={() => setPhotoIdx(i)}
                      style={{ width: i===photoIdx?18:7, height:7, borderRadius:4, background: i===photoIdx?'#fff':'rgba(255,255,255,.55)', border:'none', cursor:'pointer', padding:0, transition:'width .2s' }} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <span style={{ fontSize:72 }}>{icon}</span>
        )}
      </div>

      {/* ── Price ── */}
      <div style={{ fontSize:22, fontWeight:800, color:'var(--blue)', marginBottom:14 }}>{fmtPrice(prop.price)}</div>

      {/* ── Details table ── */}
      <table className="data-table"><tbody>
        <tr><td style={{ color:'var(--text3)', width:120 }}>Tipo</td><td>{prop.type}</td></tr>
        <tr><td style={{ color:'var(--text3)' }}>Localização</td>
          <td>
            {prop.logradouro ? `${prop.logradouro}${prop.numero ? ', '+prop.numero : ''}${prop.complemento ? ' '+prop.complemento : ''} — ` : ''}
            {prop.hood}, {prop.city}{prop.state ? ' / '+prop.state : ''}
          </td>
        </tr>
        <tr><td style={{ color:'var(--text3)' }}>Área</td><td>{prop.size} m²</td></tr>
        {prop.beds > 0 && <tr><td style={{ color:'var(--text3)' }}>Quartos</td><td>{prop.beds}</td></tr>}
        {prop.baths > 0 && <tr><td style={{ color:'var(--text3)' }}>Banheiros</td><td>{prop.baths}</td></tr>}
        {prop.park > 0 && <tr><td style={{ color:'var(--text3)' }}>Vagas</td><td>{prop.park}</td></tr>}
        {prop.chain && role !== 'USUARIO' && <tr><td style={{ color:'var(--text3)' }}>Cadeia</td><td><span style={{ fontWeight:600, color:'var(--blue)' }}>{prop.chain}</span></td></tr>}
        {creator && <tr><td style={{ color:'var(--text3)' }}>Anunciante</td><td style={{ fontSize:12 }}>{creator.user} — {prop.reg}</td></tr>}
      </tbody></table>
    </Modal>
  )
}

// ── Add Interest Modal ────────────────────────────────────────
function AddInterestModal({ lang, role, onClose, onSave }) {
  const [form, setForm] = useState({
    title:'', type:'Apartamento', city:'São Paulo', hoods:[], min_p:300000, max_p:1500000, min_size:'', min_beds:1, notes:''
  })
  const set = (k,v) => setForm(f => ({...f, [k]:v}))

  return (
    <Modal title="Novo Interesse de Compra" onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => {
            if (!form.title || !form.city) return
            onSave({ ...form, hood: form.hoods.join(', '), min_size: Number(form.min_size)||0, min_beds: Number(form.min_beds)||0 })
          }}>Salvar</button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Título</label>
        <input className="form-input" placeholder="Ex: Casa em Vila Mariana" value={form.title} onChange={e=>set('title',e.target.value)} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div className="form-group">
          <label className="form-label">Tipo</label>
          <select className="form-select" value={form.type} onChange={e=>set('type',e.target.value)}>
            <option>Apartamento</option><option>Casa</option><option>Terreno</option><option>Comercial</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Cidade</label>
          <select className="form-select" value={form.city} onChange={e=>{ set('city',e.target.value); set('hoods',[]) }}>
            <option>São Paulo</option><option>Rio de Janeiro</option><option>Belo Horizonte</option>
            <option>Curitiba</option><option>Porto Alegre</option><option>Salvador</option>
            <option>Fortaleza</option><option>Recife</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Bairros de interesse</label>
        <NeighborhoodPicker city={form.city} selected={form.hoods} onChange={v=>set('hoods',v)} />
        {form.hoods.length > 0 && (
          <div style={{ marginTop:6, display:'flex', flexWrap:'wrap', gap:4 }}>
            {form.hoods.map(h => (
              <span key={h} style={{ fontSize:11, padding:'2px 8px', background:'var(--primary)', color:'#fff', borderRadius:10, cursor:'pointer' }}
                onClick={() => set('hoods', form.hoods.filter(x=>x!==h))}>
                {h} ×
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Faixa de Preço (R$)</label>
        <PriceRangeSlider
          minVal={form.min_p} maxVal={form.max_p}
          onMinChange={v=>set('min_p',v)} onMaxChange={v=>set('max_p',v)}
          min={0} max={10000000} step={50000}
          hideInputs
        />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div className="form-group">
          <label className="form-label">Área Mín (m²)</label>
          <input className="form-input" type="number" value={form.min_size} onChange={e=>set('min_size',e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Quartos Mín</label>
          <input className="form-input" type="number" min="0" value={form.min_beds} onChange={e=>set('min_beds',e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Observações</label>
        <textarea className="form-input" rows={3} value={form.notes} onChange={e=>set('notes',e.target.value)} />
      </div>
    </Modal>
  )
}

// helpers for the listing form
function fmtBRL(raw) {
  const n = raw.replace(/\D/g,'')
  if (!n) return ''
  return 'R$ ' + Number(n).toLocaleString('pt-BR')
}
function parseBRL(str) { return Number(str.replace(/\D/g,'')) || 0 }

// ── Add / Edit Listing Modal ──────────────────────────────────
function AddListingModal({ lang, role, onClose, onSave }) {
  const [form, setForm] = useState({
    name:'', type:'Apartamento',
    cep:'', logradouro:'', numero:'', complemento:'',
    city:'', hood:'', state:'',
    priceDisplay:'', size:'', beds:2, baths:1, park:1
  })
  const [photos, setPhotos] = useState([])   // up to 5 object URLs
  const [cepStatus, setCepStatus] = useState('')   // 'loading' | 'ok' | 'error' | ''
  const set = (k,v) => setForm(f => ({...f, [k]:v}))

  const handlePhotoFiles = (files) => {
    const remaining = 5 - photos.length
    if (remaining <= 0) return
    const picked = Array.from(files).slice(0, remaining)
    const urls = picked.map(f => URL.createObjectURL(f))
    setPhotos(prev => [...prev, ...urls])
  }
  const removePhoto = (i) => setPhotos(prev => prev.filter((_,idx) => idx !== i))

  const handleCep = async (raw) => {
    const cep = raw.replace(/\D/g,'')
    set('cep', raw)
    if (cep.length !== 8) { setCepStatus(''); return }
    setCepStatus('loading')
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if (data.erro) { setCepStatus('error'); return }
      setForm(f => ({
        ...f, cep: raw,
        logradouro: data.logradouro || '',
        hood:        data.bairro     || '',
        city:        data.localidade || '',
        state:       data.uf         || '',
      }))
      setCepStatus('ok')
    } catch { setCepStatus('error') }
  }

  return (
    <Modal title="+ Novo Anúncio" onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => {
            if (!form.name || !form.priceDisplay || !form.city) return
            onSave({
              ...form,
              en: form.name,
              price: parseBRL(form.priceDisplay),
              size: Number(form.size)||0,
              beds: Number(form.beds),
              baths: Number(form.baths),
              park: Number(form.park),
              photos,
            })
          }}>Publicar</button>
        </>
      }
    >
      <div style={{ padding:'8px 12px', background:'rgba(237,137,54,.08)', border:'1px solid var(--amber)', borderRadius:6, marginBottom:14, fontSize:12, color:'var(--text2)' }}>
        ℹ️ Após publicar, seu anúncio aguardará aprovação do Admin antes de ficar ativo.
      </div>

      <div className="form-group">
        <label className="form-label">Título do Anúncio</label>
        <input className="form-input" placeholder="Ex: Apartamento moderno no centro" value={form.name} onChange={e=>set('name',e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">Tipo de Imóvel</label>
        <select className="form-select" value={form.type} onChange={e=>set('type',e.target.value)}>
          <option>Apartamento</option><option>Casa</option><option>Terreno</option><option>Comercial</option>
        </select>
      </div>

      {/* CEP lookup */}
      <div className="form-group">
        <label className="form-label">
          CEP {cepStatus === 'loading' && <span style={{ fontSize:10, color:'var(--text3)' }}>🔄 Buscando...</span>}
              {cepStatus === 'ok'      && <span style={{ fontSize:10, color:'var(--green)' }}>✅ Endereço encontrado</span>}
              {cepStatus === 'error'   && <span style={{ fontSize:10, color:'var(--red)' }}>❌ CEP não encontrado</span>}
        </label>
        <input className="form-input" placeholder="00000-000" maxLength={9}
          value={form.cep}
          onChange={e => handleCep(e.target.value.replace(/(\d{5})(\d)/,'$1-$2').slice(0,9))}
        />
      </div>

      {cepStatus === 'ok' && (
        <>
          <div className="form-group">
            <label className="form-label">Logradouro</label>
            <input className="form-input" value={form.logradouro} onChange={e=>set('logradouro',e.target.value)} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="form-group">
              <label className="form-label">Número</label>
              <input className="form-input" placeholder="Ex: 42" value={form.numero} onChange={e=>set('numero',e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Complemento</label>
              <input className="form-input" placeholder="Apto, Bloco..." value={form.complemento} onChange={e=>set('complemento',e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Bairro</label>
              <input className="form-input" value={form.hood} onChange={e=>set('hood',e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Cidade</label>
              <input className="form-input" value={form.city} onChange={e=>set('city',e.target.value)} />
            </div>
          </div>
        </>
      )}

      {/* Price + details */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop: cepStatus === 'ok' ? 0 : 0 }}>
        <div className="form-group" style={{ gridColumn:'1/-1' }}>
          <label className="form-label">Preço</label>
          <input className="form-input" placeholder="R$ 0"
            value={form.priceDisplay}
            onChange={e => set('priceDisplay', fmtBRL(e.target.value))}
            inputMode="numeric"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Área (m²)</label>
          <input className="form-input" type="number" value={form.size} onChange={e=>set('size',e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Quartos</label>
          <input className="form-input" type="number" min="0" value={form.beds} onChange={e=>set('beds',e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Banheiros</label>
          <input className="form-input" type="number" min="0" value={form.baths} onChange={e=>set('baths',e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Vagas</label>
          <input className="form-input" type="number" min="0" value={form.park} onChange={e=>set('park',e.target.value)} />
        </div>
      </div>

      {/* ── Fotos ── */}
      <div className="form-group" style={{ marginTop:4 }}>
        <label className="form-label">
          Fotos do imóvel
          <span style={{ fontWeight:400, color:'var(--text3)', marginLeft:6 }}>({photos.length}/5)</span>
        </label>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
          {Array.from({ length: 5 }).map((_, i) => {
            const url = photos[i]
            return url ? (
              <div key={i} style={{ position:'relative', aspectRatio:'1', borderRadius:6, overflow:'hidden', border:'1px solid var(--border)' }}>
                <img src={url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                <button
                  onClick={() => removePhoto(i)}
                  style={{ position:'absolute', top:3, right:3, width:18, height:18, borderRadius:'50%', background:'rgba(0,0,0,.6)', color:'#fff', border:'none', cursor:'pointer', fontSize:11, lineHeight:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  ×
                </button>
              </div>
            ) : photos.length === i ? (
              <label key={i} style={{ aspectRatio:'1', borderRadius:6, border:'1.5px dashed var(--border)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:20, color:'var(--text3)', gap:4 }}>
                <span>📷</span>
                <span style={{ fontSize:9.5 }}>Adicionar</span>
                <input type="file" accept="image/*" multiple style={{ display:'none' }}
                  onChange={e => handlePhotoFiles(e.target.files)} />
              </label>
            ) : (
              <div key={i} style={{ aspectRatio:'1', borderRadius:6, border:'1px dashed var(--border)', background:'var(--bg2)', opacity:.35 }} />
            )
          })}
        </div>
        <p style={{ fontSize:11, color:'var(--text3)', marginTop:5 }}>
          Até 5 fotos (JPG, PNG ou WEBP). Arraste ou clique no ícone de câmera para adicionar.
        </p>
      </div>
    </Modal>
  )
}
