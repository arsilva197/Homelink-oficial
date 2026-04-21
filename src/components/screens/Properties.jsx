'use client'
import { useState, useMemo } from 'react'
import { Badge } from '../ui'
import { fmtPrice } from '../../lib/utils'

const AUDIT_ICONS = { created:'🆕', approved:'✅', status:'🔄', chain:'🔗', rejected:'❌' }

export default function ScreenProperties({ ctx }) {
  const { props, lang, setModal, role, approveProp, rejectProp, togglePropStatus, navigate } = ctx
  const pt = lang === 'pt'
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [approval, setApproval] = useState('')
  const [chain, setChain] = useState('')
  const [expandedAudit, setExpandedAudit] = useState(null)

  const filtered = useMemo(() => props.filter(p => {
    const nm = (lang==='pt'?p.name:p.en).toLowerCase()
    const matchSearch = !search || nm.includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase()) || p.hood.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())
    const matchCity = !city || p.city === city
    const matchType = !type || p.type === type
    const matchStatus = !status || p.status === status
    const matchApproval = !approval || p.approval_status === approval
    const matchChain = !chain || (chain === 'yes' ? !!p.chain : !p.chain)
    return matchSearch && matchCity && matchType && matchStatus && matchApproval && matchChain
  }), [props, search, city, type, status, approval, chain, lang])

  const hasFilters = search || city || type || status || approval || chain
  const pendingCount = props.filter(p => p.approval_status === 'pending').length

  return (
    <div>
      {pendingCount > 0 && (
        <div style={{
          display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
          background:'rgba(237,137,54,.1)', border:'1px solid var(--amber)',
          borderRadius:'var(--radius-sm)', marginBottom:14, cursor:'pointer'
        }} onClick={() => navigate('admin-approvals')}>
          <span style={{ fontSize:18 }}>⏳</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:600 }}>{pt?`${pendingCount} anúncio(s) aguardando aprovação`:`${pendingCount} listing(s) awaiting approval`}</div>
            <div style={{ fontSize:11.5, color:'var(--text3)' }}>{pt?'Clique para ir para Aprovações':'Click to go to Approvals'}</div>
          </div>
          <span style={{ color:'var(--primary)', fontSize:14 }}>→</span>
        </div>
      )}

      {/* Filters */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:8, marginBottom:14 }}>
        <input className="search-input" placeholder={pt?'Buscar...':'Search...'} value={search} onChange={e=>setSearch(e.target.value)} />
        <select className="filter-select" value={city} onChange={e=>setCity(e.target.value)}>
          <option value="">{pt?'Todas cidades':'All cities'}</option>
          <option>São Paulo</option><option>Rio de Janeiro</option><option>Belo Horizonte</option>
        </select>
        <select className="filter-select" value={type} onChange={e=>setType(e.target.value)}>
          <option value="">{pt?'Todos tipos':'All types'}</option>
          <option>Apartamento</option><option>Casa</option><option>Terreno</option><option>Comercial</option>
        </select>
        <select className="filter-select" value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="">{pt?'Todos status':'All statuses'}</option>
          <option value="ativo">{pt?'Ativo':'Active'}</option>
          <option value="pausado">{pt?'Pausado':'Paused'}</option>
          <option value="pendente">{pt?'Pendente':'Pending'}</option>
          <option value="cancelado">{pt?'Cancelado':'Cancelled'}</option>
        </select>
        <select className="filter-select" value={approval} onChange={e=>setApproval(e.target.value)}>
          <option value="">{pt?'Todas aprovações':'All approvals'}</option>
          <option value="approved">{pt?'Aprovado':'Approved'}</option>
          <option value="pending">{pt?'Pendente':'Pending'}</option>
          <option value="rejected">{pt?'Rejeitado':'Rejected'}</option>
        </select>
        <select className="filter-select" value={chain} onChange={e=>setChain(e.target.value)}>
          <option value="">{pt?'Todas cadeias':'All chains'}</option>
          <option value="yes">{pt?'Em cadeia':'In chain'}</option>
          <option value="no">{pt?'Sem cadeia':'No chain'}</option>
        </select>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <span style={{ fontSize:12, color:'var(--text3)' }}>
          {pt?'Exibindo':'Showing'} {filtered.length} {pt?'de':'of'} {props.length} {pt?'imóveis':'properties'}
          {hasFilters && <button style={{ marginLeft:8, fontSize:11, color:'var(--primary)', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }} onClick={() => { setSearch(''); setCity(''); setType(''); setStatus(''); setApproval(''); setChain('') }}>{pt?'Limpar filtros':'Clear filters'}</button>}
        </span>
        <button className="btn btn-primary btn-sm" onClick={() => setModal({type:'import'})}>
          ⬆ {pt?'Importar CSV':'Import CSV'}
        </button>
      </div>

      <div className="card">
        <div style={{ overflowX:'auto' }}>
          <table className="data-table">
            <thead><tr>
              <th style={{ minWidth:180 }}>{pt?'Imóvel':'Property'}</th>
              <th>{pt?'Tipo':'Type'}</th>
              <th>{pt?'Cidade / Bairro':'City / Hood'}</th>
              <th>{pt?'Preço':'Price'}</th>
              <th>Área</th>
              <th>Status</th>
              <th>{pt?'Aprovação':'Approval'}</th>
              <th>Cadeia</th>
              <th>{pt?'Trilha':'Audit'}</th>
              <th>{pt?'Ações':'Actions'}</th>
            </tr></thead>
            <tbody>
              {filtered.map(p => (
                <>
                  <tr key={p.id} style={{ cursor:'pointer' }}>
                    <td onClick={() => setModal({type:'propDetail',data:p})}>
                      <div style={{ fontWeight:600, fontSize:12.5 }}>{lang==='pt'?p.name:p.en}</div>
                      <div style={{ fontSize:10.5, color:'var(--text3)', fontFamily:'monospace' }}>{p.id}</div>
                      <div style={{ fontSize:10.5, color:'var(--text3)' }}>{pt?'Criado:':'Created:'} {p.reg}</div>
                    </td>
                    <td>{p.type}</td>
                    <td>{p.city}<br/><span style={{ fontSize:11, color:'var(--text3)' }}>{p.hood}</span></td>
                    <td style={{ fontWeight:600 }}>{fmtPrice(p.price)}</td>
                    <td>{p.size}m²</td>
                    <td>
                      <Badge status={p.status?.toUpperCase()} lang={lang} />
                      {p.status !== 'cancelado' && (
                        <div style={{ marginTop:4, display:'flex', gap:3 }}>
                          {p.status === 'ativo' && <button className="btn btn-secondary btn-sm" style={{ fontSize:9.5, padding:'1px 5px' }} onClick={e=>{e.stopPropagation();togglePropStatus&&togglePropStatus(p.id,'pause')}}>⏸</button>}
                          {p.status === 'pausado' && <button className="btn btn-secondary btn-sm" style={{ fontSize:9.5, padding:'1px 5px', color:'var(--green)' }} onClick={e=>{e.stopPropagation();togglePropStatus&&togglePropStatus(p.id,'activate')}}>▶</button>}
                        </div>
                      )}
                    </td>
                    <td>
                      {p.approval_status === 'pending' ? (
                        <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                          <span style={{ fontSize:10.5, background:'var(--amber)', color:'#fff', fontWeight:700, padding:'2px 6px', borderRadius:4, display:'inline-block' }}>
                            ⏳ {pt?'Pendente':'Pending'}
                          </span>
                          <div style={{ display:'flex', gap:3 }}>
                            <button className="btn btn-sm" style={{ fontSize:9.5, padding:'2px 6px', background:'var(--green)', color:'#fff', border:'none', borderRadius:4, cursor:'pointer' }}
                              onClick={e=>{e.stopPropagation();approveProp&&approveProp(p.id)}}>✓ {pt?'Aprovar':'Approve'}</button>
                            <button className="btn btn-sm" style={{ fontSize:9.5, padding:'2px 6px', background:'var(--red)', color:'#fff', border:'none', borderRadius:4, cursor:'pointer' }}
                              onClick={e=>{e.stopPropagation();rejectProp&&rejectProp(p.id)}}>✗</button>
                          </div>
                        </div>
                      ) : p.approval_status === 'approved' ? (
                        <span style={{ fontSize:10.5, color:'var(--green)', fontWeight:600 }}>✅ {pt?'Aprovado':'Approved'}</span>
                      ) : (
                        <span style={{ fontSize:10.5, color:'var(--red)', fontWeight:600 }}>❌ {pt?'Rejeitado':'Rejected'}</span>
                      )}
                    </td>
                    <td>
                      {p.chain
                        ? <span style={{ fontWeight:600, color:'var(--blue)' }}>{p.chain}</span>
                        : <span style={{ color:'var(--text3)', fontSize:11 }}>—</span>}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize:10.5, padding:'3px 8px' }}
                        onClick={e=>{e.stopPropagation();setExpandedAudit(expandedAudit===p.id?null:p.id)}}
                      >
                        {expandedAudit===p.id?'▲':'▼'} {pt?'Trilha':'Trail'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                        <button className="btn btn-secondary btn-sm" style={{ fontSize:10.5, padding:'2px 7px' }}
                          onClick={e=>{e.stopPropagation();setModal({type:'addListing',data:p})}}>
                          ✏
                        </button>
                        {p.status !== 'cancelado' && (
                          <button className="btn btn-secondary btn-sm" style={{ fontSize:10.5, padding:'2px 7px', color:'var(--red)' }}
                            onClick={e=>{e.stopPropagation();togglePropStatus&&togglePropStatus(p.id,'remove')}}>
                            🗑
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {/* Audit trail expansion */}
                  {expandedAudit === p.id && (
                    <tr key={`${p.id}-audit`}>
                      <td colSpan={10} style={{ padding:'0 0 0 24px', background:'var(--bg2)' }}>
                        <div style={{ padding:'12px 16px' }}>
                          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1, color:'var(--text3)', marginBottom:10 }}>
                            📋 {pt?'Trilha de Auditoria':'Audit Trail'} — {lang==='pt'?p.name:p.en}
                          </div>
                          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                            {(p.audit || []).map((ev, idx) => (
                              <div key={idx} style={{ display:'flex', gap:10, alignItems:'flex-start', fontSize:12 }}>
                                <span style={{ fontSize:14, lineHeight:1.4 }}>{AUDIT_ICONS[ev.type] || '📌'}</span>
                                <div>
                                  <span style={{ color:'var(--text3)', fontFamily:'monospace', marginRight:8 }}>{ev.date}</span>
                                  <span style={{ fontWeight:600, color:'var(--text1)' }}>{ev.event}</span>
                                  <span style={{ color:'var(--text3)', marginLeft:6, fontSize:11 }}>— {ev.user}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
