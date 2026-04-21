'use client'
import { useState } from 'react'
import { Badge, Modal } from '../ui'
import { fmtPrice } from '../../lib/utils'

const SOURCING_STATUSES = ['PENDENTE','BUSCANDO','RESOLVIDO','DISPENSADO']

// ── Sourcing on demand ─────────────────────────────────────────
export function ScreenSourcing({ ctx }) {
  const { lang, interests, setInterests, toast } = ctx
  const pt = lang === 'pt'
  const unmatched = interests.filter(i => i.status === 'ATIVO')
  const [expanded, setExpanded] = useState(null)

  const updateSourcingStatus = (id, newStatus) => {
    setInterests(prev => prev.map(i => i.id === id ? { ...i, sourcing_status: newStatus } : i))
    toast(`Status atualizado: ${newStatus}`, 'success')
  }

  const statusColors = {
    PENDENTE: 'var(--amber)', BUSCANDO: 'var(--blue)',
    RESOLVIDO: 'var(--green)', DISPENSADO: 'var(--text3)'
  }
  const statusLabels = {
    PENDENTE:{pt:'Pendente',en:'Pending'}, BUSCANDO:{pt:'Buscando',en:'Searching'},
    RESOLVIDO:{pt:'Resolvido',en:'Resolved'}, DISPENSADO:{pt:'Dispensado',en:'Dismissed'}
  }

  return (
    <div>
      <div style={{ padding:'12px 16px', background:'var(--bg2)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', marginBottom:16, fontSize:12.5, color:'var(--text3)' }}>
        🎯 {pt
          ? 'Interesses que ainda não encontraram match. Admin busca externamente.'
          : 'Interests that have not found a match yet. Admin sources externally.'}
      </div>

      {/* Summary pills */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
        {SOURCING_STATUSES.map(s => {
          const count = unmatched.filter(i => (i.sourcing_status || 'PENDENTE') === s).length
          return (
            <div key={s} style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', background:'var(--bg2)', border:`1.5px solid ${statusColors[s]}`, borderRadius:20, fontSize:11.5 }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:statusColors[s], display:'inline-block' }} />
              <span style={{ fontWeight:600 }}>{statusLabels[s][pt?'pt':'en']}</span>
              <span style={{ color:'var(--text3)' }}>{count}</span>
            </div>
          )
        })}
      </div>

      {unmatched.length === 0 ? (
        <div className="empty"><div className="icon">✅</div><p>{pt?'Todos os interesses têm match.':'All interests have matches.'}</p></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {unmatched.map(item => {
            const ss = item.sourcing_status || 'PENDENTE'
            const isExpanded = expanded === item.id
            return (
              <div key={item.id} className="card" style={{ borderLeft:`3px solid ${statusColors[ss]}` }}>
                {/* Header */}
                <div className="card-header" style={{ cursor:'pointer' }} onClick={() => setExpanded(isExpanded ? null : item.id)}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flex:1 }}>
                    <div className="card-title">{pt?item.title:item.en}</div>
                    <span style={{ fontSize:10.5, color:'var(--text3)' }}>{item.id}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    {/* Status selector */}
                    <select
                      value={ss}
                      onChange={e => { e.stopPropagation(); updateSourcingStatus(item.id, e.target.value) }}
                      onClick={e => e.stopPropagation()}
                      style={{
                        padding:'4px 8px', border:`1.5px solid ${statusColors[ss]}`,
                        borderRadius:6, fontSize:11.5, background:'var(--bg1)',
                        color:statusColors[ss], fontWeight:700, cursor:'pointer'
                      }}
                    >
                      {SOURCING_STATUSES.map(s => (
                        <option key={s} value={s}>{statusLabels[s][pt?'pt':'en']}</option>
                      ))}
                    </select>
                    <span style={{ fontSize:12, color:'var(--text3)' }}>{isExpanded?'▲':'▼'}</span>
                  </div>
                </div>

                {/* Compact info always visible */}
                <div className="card-body" style={{ paddingTop:0 }}>
                  <div style={{ display:'flex', gap:10, fontSize:12.5, color:'var(--text2)', flexWrap:'wrap' }}>
                    <span>📍 {item.city}{item.hood?` · ${item.hood}`:''}</span>
                    <span>🏠 {item.type}</span>
                    <span>💰 {fmtPrice(item.min_p)} – {fmtPrice(item.max_p)}</span>
                  </div>

                  {/* Expanded full details */}
                  {isExpanded && (
                    <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--border)' }}>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12, marginBottom:12 }}>
                        <div>
                          <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:2 }}>ID</div>
                          <div style={{ fontSize:12, fontWeight:600, fontFamily:'monospace' }}>{item.id}</div>
                        </div>
                        <div>
                          <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:2 }}>{pt?'Tipo':'Type'}</div>
                          <div style={{ fontSize:12, fontWeight:600 }}>{item.type}</div>
                        </div>
                        <div>
                          <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:2 }}>{pt?'Cidade':'City'}</div>
                          <div style={{ fontSize:12, fontWeight:600 }}>{item.city}</div>
                        </div>
                        <div>
                          <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:2 }}>{pt?'Bairro':'Neighborhood'}</div>
                          <div style={{ fontSize:12, fontWeight:600 }}>{item.hood||'—'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:2 }}>{pt?'Preço Mín':'Min Price'}</div>
                          <div style={{ fontSize:12, fontWeight:600 }}>{fmtPrice(item.min_p)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:2 }}>{pt?'Preço Máx':'Max Price'}</div>
                          <div style={{ fontSize:12, fontWeight:600 }}>{fmtPrice(item.max_p)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:2 }}>Área Mín</div>
                          <div style={{ fontSize:12, fontWeight:600 }}>{item.min_size}m²</div>
                        </div>
                        <div>
                          <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:2 }}>{pt?'Quartos Mín':'Min Beds'}</div>
                          <div style={{ fontSize:12, fontWeight:600 }}>{item.min_beds}</div>
                        </div>
                        <div>
                          <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:2 }}>Owner</div>
                          <div style={{ fontSize:12, fontWeight:600, textTransform:'capitalize' }}>{item.owner}</div>
                        </div>
                      </div>
                      {item.notes && (
                        <div style={{ fontSize:12, color:'var(--text2)', padding:'8px 10px', background:'var(--bg2)', borderRadius:6, marginBottom:10 }}>
                          📝 {item.notes}
                        </div>
                      )}
                      <div style={{ display:'flex', gap:8 }}>
                        <button className="btn btn-primary btn-sm"
                          onClick={() => { updateSourcingStatus(item.id,'BUSCANDO'); toast(pt?'Busca externa iniciada':'External search started','info') }}>
                          🔍 {pt?'Iniciar Busca':'Start Search'}
                        </button>
                        <button className="btn btn-secondary btn-sm"
                          onClick={() => updateSourcingStatus(item.id,'DISPENSADO')}>
                          {pt?'Dispensar':'Dismiss'}
                        </button>
                        <button className="btn btn-secondary btn-sm" style={{ color:'var(--green)' }}
                          onClick={() => updateSourcingStatus(item.id,'RESOLVIDO')}>
                          ✓ {pt?'Marcar Resolvido':'Mark Resolved'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── My Brokers (Agency) ────────────────────────────────────────
export function ScreenMyBrokers({ ctx }) {
  const { lang, BROKERS_DATA, opps, toast, navigate } = ctx
  const pt = lang === 'pt'
  const myBrokers = BROKERS_DATA.filter(b => b.agency_id === 'AGN-01')
  const [showAddBroker, setShowAddBroker] = useState(false)
  const [newBroker, setNewBroker] = useState({ name:'', creci:'', email:'', phone:'' })
  const set = (k,v) => setNewBroker(f => ({...f,[k]:v}))

  const handleAddBroker = () => {
    if (!newBroker.name || !newBroker.creci) {
      toast(pt?'Preencha nome e CRECI':'Fill name and CRECI', 'error')
      return
    }
    toast(pt?`Corretor ${newBroker.name} adicionado (demo)`:`Broker ${newBroker.name} added (demo)`, 'success')
    setShowAddBroker(false)
    setNewBroker({ name:'', creci:'', email:'', phone:'' })
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">{pt?'Meus Corretores':'My Brokers'}</div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddBroker(true)}>
            + {pt?'Adicionar Corretor':'Add Broker'}
          </button>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead><tr>
              <th>{pt?'Nome':'Name'}</th><th>CRECI</th>
              <th>{pt?'Oportunidades':'Opportunities'}</th>
              <th>{pt?'Comissão':'Commission'}</th><th>Status</th>
              <th>{pt?'Ações':'Actions'}</th>
            </tr></thead>
            <tbody>
              {myBrokers.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight:600 }}>{b.name}</td>
                  <td style={{ fontFamily:'monospace', fontSize:11 }}>{b.creci}</td>
                  <td>{opps.filter(o=>o.broker_id===b.id).length}</td>
                  <td style={{ color:'var(--primary)', fontWeight:600 }}>{fmtPrice(b.commission||0)}</td>
                  <td><Badge status={b.status} lang={lang} /></td>
                  <td>
                    <div style={{ display:'flex', gap:4 }}>
                      <button className="btn btn-secondary btn-sm" style={{ fontSize:10.5 }} onClick={() => toast('Editando '+b.name,'info')}>✏</button>
                      {b.phone && (
                        <a href={`https://wa.me/${b.phone}`} target="_blank" rel="noopener noreferrer"
                          style={{ display:'flex', alignItems:'center', gap:3, background:'#25d366', color:'#fff', padding:'3px 8px', borderRadius:4, fontSize:10.5, fontWeight:600, textDecoration:'none' }}>
                          📱
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Broker Modal */}
      {showAddBroker && (
        <Modal title={pt?'Adicionar Corretor':'Add Broker'} onClose={() => setShowAddBroker(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowAddBroker(false)}>{pt?'Cancelar':'Cancel'}</button>
              <button className="btn btn-primary" onClick={handleAddBroker}>+ {pt?'Adicionar':'Add'}</button>
            </>
          }
        >
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="form-group">
              <label className="form-label">{pt?'Nome Completo':'Full Name'} *</label>
              <input className="form-input" placeholder={pt?'Ex: João da Silva':'Ex: João da Silva'} value={newBroker.name} onChange={e=>set('name',e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">CRECI *</label>
              <input className="form-input" placeholder="Ex: 123456" value={newBroker.creci} onChange={e=>set('creci',e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="corretor@email.com" value={newBroker.email} onChange={e=>set('email',e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{pt?'Telefone (WhatsApp)':'Phone (WhatsApp)'}</label>
              <input className="form-input" placeholder="5511999999999" value={newBroker.phone} onChange={e=>set('phone',e.target.value)} />
            </div>
          </div>
          <div style={{ marginTop:10, padding:'8px 12px', background:'var(--bg2)', borderRadius:6, fontSize:11.5, color:'var(--text3)' }}>
            ℹ️ {pt?'O corretor receberá um e-mail de boas-vindas com as instruções de acesso à plataforma.':'The broker will receive a welcome email with platform access instructions.'}
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── Admin Users ────────────────────────────────────────────────
export function ScreenAdminUsers({ ctx }) {
  const [tab, setTab] = useState('users')
  const { lang, USERS_DATA, BROKERS_DATA, AGENCIES_DATA, opps, toast } = ctx
  const pt = lang === 'pt'

  const tabs = [
    { id:'users', label: pt?'Usuários':'Users' },
    { id:'brokers', label: pt?'Corretores':'Brokers' },
    { id:'agencies', label: pt?'Imobiliárias':'Agencies' },
  ]

  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {tabs.map(t => (
          <button key={t.id}
            className={`btn btn-sm ${tab===t.id?'btn-primary':'btn-secondary'}`}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="card">
          <table className="data-table">
            <thead><tr>
              <th>{pt?'Nome':'Name'}</th><th>Email</th><th>{pt?'Imóveis':'Props'}</th>
              <th>Matches</th><th>Status</th><th>{pt?'Ações':'Actions'}</th>
            </tr></thead>
            <tbody>
              {USERS_DATA.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight:600 }}>{u.name}</td>
                  <td style={{ fontSize:12, color:'var(--text3)' }}>{u.email}</td>
                  <td>{u.props}</td>
                  <td>{u.matches}</td>
                  <td><Badge status={u.status} lang={lang} /></td>
                  <td>
                    <div style={{ display:'flex', gap:4 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => toast('Editando '+u.name,'info')}>✏</button>
                      <button className="btn btn-secondary btn-sm"
                        style={{ color: u.status==='active'?'var(--red)':'var(--green)' }}
                        onClick={() => toast((u.status==='active'?'Suspendendo ':'Ativando ')+u.name,'info')}>
                        {u.status==='active'?'🚫':'✓'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'brokers' && (
        <div className="card">
          <table className="data-table">
            <thead><tr>
              <th>{pt?'Nome':'Name'}</th><th>CRECI</th><th>{pt?'Imobiliária':'Agency'}</th>
              <th>{pt?'Opps':'Opps'}</th><th>Status</th><th>{pt?'Ações':'Actions'}</th>
            </tr></thead>
            <tbody>
              {BROKERS_DATA.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight:600 }}>{b.name}</td>
                  <td style={{ fontFamily:'monospace', fontSize:11 }}>{b.creci}</td>
                  <td style={{ fontSize:12 }}>{b.agency||'—'}</td>
                  <td>{opps.filter(o=>o.broker_id===b.id).length}</td>
                  <td><Badge status={b.status} lang={lang} /></td>
                  <td>
                    <div style={{ display:'flex', gap:4 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => toast('Editando '+b.name,'info')}>✏</button>
                      {b.phone && (
                        <a href={`https://wa.me/${b.phone}`} target="_blank" rel="noopener noreferrer"
                          style={{ display:'flex', alignItems:'center', background:'#25d366', color:'#fff', padding:'3px 7px', borderRadius:4, fontSize:12, textDecoration:'none' }}>
                          📱
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'agencies' && (
        <div className="card">
          <table className="data-table">
            <thead><tr>
              <th>{pt?'Nome':'Name'}</th><th>{pt?'Corretores':'Brokers'}</th>
              <th>{pt?'Opps':'Opps'}</th><th>{pt?'Comissão':'Commission'}</th>
              <th>Status</th><th>{pt?'Ações':'Actions'}</th>
            </tr></thead>
            <tbody>
              {AGENCIES_DATA.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight:600 }}>{a.name}</td>
                  <td>{a.brokers.length}</td>
                  <td>{opps.filter(o=>o.agency_id===a.id).length}</td>
                  <td style={{ color:'var(--primary)', fontWeight:600 }}>{fmtPrice(a.commission||0)}</td>
                  <td><Badge status={a.status} lang={lang} /></td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => toast('Editando '+a.name,'info')}>✏</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ScreenSourcing
