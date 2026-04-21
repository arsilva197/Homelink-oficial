'use client'
import { useState } from 'react'
import { Badge, PipelineSteps, MetricRow, Modal } from '../ui'
import { fmtPrice, fmtN, fmtPct } from '../../lib/utils'

export default function ScreenOppDetail({ ctx, opp }) {
  const { lang, role, props, CHAINS, BROKERS_DATA, AGENCIES_DATA, PL, advanceOpp, retreatOpp, updateCommStatus, assignBrokerToOpp, navigate, setOpps, toast } = ctx
  const pt = lang === 'pt'
  const isAdmin = role === 'ADMIN'
  const [showAssign, setShowAssign] = useState(false)
  const [assignBroker, setAssignBroker] = useState('')
  const [assignAgency, setAssignAgency] = useState('')
  const [editSplit, setEditSplit] = useState(false)
  const [splitVals, setSplitVals] = useState(null)

  if (!opp) return (
    <div className="empty"><div className="icon">📋</div>
      <p>{pt?'Selecione uma oportunidade.':'Select an opportunity.'}</p>
    </div>
  )

  const chain = CHAINS.find(c => c.id === opp.chain)
  const agencyPct = opp.split?.agency || 0
  const brokerPct = opp.split?.broker || 0
  const platform = 6 - agencyPct - brokerPct
  const currentSplit = splitVals || { agency: agencyPct, broker: brokerPct }

  const handleAssign = () => {
    if (!assignBroker && !assignAgency) return
    const broker = BROKERS_DATA.find(b => b.id === assignBroker)
    const agency = AGENCIES_DATA.find(a => a.id === assignAgency)
    assignBrokerToOpp && assignBrokerToOpp(opp.id, broker || null, agency || null)
    toast(pt?'Atribuição salva ✓':'Assignment saved ✓', 'success')
    setShowAssign(false)
  }

  const handleSaveSplit = () => {
    const sum = Number(currentSplit.agency) + Number(currentSplit.broker)
    if (sum > 6) { toast(pt?'Total não pode exceder 6%':'Total cannot exceed 6%', 'error'); return }
    setOpps && setOpps(prev => prev.map(o => o.id === opp.id ? { ...o, split: { agency: Number(currentSplit.agency), broker: Number(currentSplit.broker), platform: 6 - Number(currentSplit.agency) - Number(currentSplit.broker) } } : o))
    toast(pt?'Comissão atualizada ✓':'Commission updated ✓', 'success')
    setEditSplit(false)
    setSplitVals(null)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title" style={{ fontSize:16 }}>{opp.id}</div>
            <div style={{ fontSize:12, color:'var(--text3)' }}>
              {pt?'Cadeia':'Chain'}: {opp.chain} · Match: {opp.match_date}
            </div>
          </div>
          <Badge status={opp.status} lang={lang} />
        </div>
        <div className="card-body">
          <div className="kpi-grid" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
            <MetricRow label="GMV" value={fmtPrice(opp.gmv)} />
            <MetricRow label="CPS" value={opp.cps} />
            <MetricRow label={pt?'Comissão Total':'Total Commission'} value={fmtPrice(opp.commission)} />
            <MetricRow label={pt?'Participantes':'Participants'} value={opp.participants.length} />
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">{pt?'Pipeline de Progresso':'Progress Pipeline'}</div>
          {isAdmin && (
            <div style={{ display:'flex', gap:6 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => retreatOpp(opp.id)}>← {pt?'Retroceder':'Retreat'}</button>
              <button className="btn btn-primary btn-sm" onClick={() => advanceOpp(opp.id)}>{pt?'Avançar':'Advance'} →</button>
            </div>
          )}
        </div>
        <div className="card-body">
          <PipelineSteps stages={PL} currentSi={opp.si} />
        </div>
      </div>

      {/* Broker / Agency Assignment (ADMIN only) */}
      {isAdmin && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">👤 {pt?'Corretor & Imobiliária':'Broker & Agency'}</div>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowAssign(!showAssign)}>
              {opp.broker || opp.agency ? (pt?'Reatribuir':'Reassign') : (pt?'Atribuir':'Assign')}
            </button>
          </div>
          <div className="card-body">
            {/* Current assignment */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom: showAssign ? 14 : 0 }}>
              <div style={{ padding:'12px 14px', background:'var(--bg2)', borderRadius:8, border:'1px solid var(--border)' }}>
                <div style={{ fontSize:10.5, color:'var(--text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>{pt?'Corretor':'Broker'}</div>
                {opp.broker ? (
                  <>
                    <div style={{ fontSize:13.5, fontWeight:700 }}>{opp.broker}</div>
                    <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{BROKERS_DATA.find(b=>b.id===opp.broker_id)?.creci || '—'}</div>
                    {BROKERS_DATA.find(b=>b.id===opp.broker_id)?.phone && (
                      <a href={`https://wa.me/${BROKERS_DATA.find(b=>b.id===opp.broker_id)?.phone}`} target="_blank" rel="noopener noreferrer"
                        style={{ marginTop:6, display:'inline-flex', alignItems:'center', gap:4, background:'#25d366', color:'#fff', padding:'3px 8px', borderRadius:4, fontSize:11, fontWeight:600, textDecoration:'none' }}>
                        📱 WhatsApp
                      </a>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize:12.5, color:'var(--text3)', fontStyle:'italic' }}>{pt?'Não atribuído':'Not assigned'}</div>
                )}
              </div>
              <div style={{ padding:'12px 14px', background:'var(--bg2)', borderRadius:8, border:'1px solid var(--border)' }}>
                <div style={{ fontSize:10.5, color:'var(--text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>{pt?'Imobiliária':'Agency'}</div>
                {opp.agency ? (
                  <>
                    <div style={{ fontSize:13.5, fontWeight:700 }}>{opp.agency}</div>
                    <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{pt?'Agência parceira':'Partner agency'}</div>
                  </>
                ) : (
                  <div style={{ fontSize:12.5, color:'var(--text3)', fontStyle:'italic' }}>{pt?'Não atribuída':'Not assigned'}</div>
                )}
              </div>
            </div>

            {/* Assignment form */}
            {showAssign && (
              <div style={{ padding:'14px 16px', background:'var(--bg2)', borderRadius:8, border:'1px solid var(--border)' }}>
                <div style={{ fontSize:12, fontWeight:600, marginBottom:10 }}>
                  {pt?'Selecionar Corretor e/ou Imobiliária':'Select Broker and/or Agency'}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">{pt?'Corretor':'Broker'}</label>
                    <select className="form-select" value={assignBroker} onChange={e=>setAssignBroker(e.target.value)}>
                      <option value="">{pt?'— Nenhum —':'— None —'}</option>
                      {BROKERS_DATA.filter(b=>b.status==='active').map(b => (
                        <option key={b.id} value={b.id}>{b.name} ({b.creci})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">{pt?'Imobiliária':'Agency'}</label>
                    <select className="form-select" value={assignAgency} onChange={e=>setAssignAgency(e.target.value)}>
                      <option value="">{pt?'— Nenhuma —':'— None —'}</option>
                      {AGENCIES_DATA.filter(a=>a.status==='active').map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-primary btn-sm" onClick={handleAssign}>
                    💾 {pt?'Confirmar Atribuição':'Confirm Assignment'}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowAssign(false)}>
                    {pt?'Cancelar':'Cancel'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Commission Split */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">💰 {pt?'Distribuição de Comissão':'Commission Distribution'}</div>
          {isAdmin && (
            <button className="btn btn-secondary btn-sm" onClick={() => { setEditSplit(!editSplit); setSplitVals({ agency: agencyPct, broker: brokerPct }) }}>
              {editSplit ? (pt?'Cancelar':'Cancel') : (pt?'Editar Split':'Edit Split')}
            </button>
          )}
        </div>
        <div className="card-body">
          {/* Visual split bars */}
          {!editSplit && (
            <>
              <div style={{ height:12, borderRadius:6, overflow:'hidden', display:'flex', marginBottom:14 }}>
                {agencyPct > 0 && <div style={{ flex:agencyPct, background:'var(--primary)', transition:'flex 0.4s' }} title={`Imobiliária ${fmtPct(agencyPct)}`} />}
                {brokerPct > 0 && <div style={{ flex:brokerPct, background:'var(--blue)', transition:'flex 0.4s' }} title={`Corretor ${fmtPct(brokerPct)}`} />}
                <div style={{ flex:platform, background:'var(--green)', transition:'flex 0.4s' }} title={`Plataforma ${fmtPct(platform)}`} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                {opp.agency && (
                  <div style={{ textAlign:'center', padding:'14px 12px', background:'linear-gradient(135deg,rgba(99,102,241,.08),rgba(99,102,241,.04))', borderRadius:10, border:'1px solid rgba(99,102,241,.2)' }}>
                    <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:6, textTransform:'uppercase', letterSpacing:1 }}>Imobiliária</div>
                    <div style={{ fontSize:22, fontWeight:800, color:'var(--primary)' }}>{fmtPct(agencyPct)}</div>
                    <div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>{opp.agency}</div>
                    <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{fmtPrice(opp.gmv * agencyPct / 100)}</div>
                  </div>
                )}
                {opp.broker && !opp.agency && (
                  <div style={{ textAlign:'center', padding:'14px 12px', background:'linear-gradient(135deg,rgba(49,130,206,.08),rgba(49,130,206,.04))', borderRadius:10, border:'1px solid rgba(49,130,206,.2)' }}>
                    <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:6, textTransform:'uppercase', letterSpacing:1 }}>{pt?'Corretor':'Broker'}</div>
                    <div style={{ fontSize:22, fontWeight:800, color:'var(--blue)' }}>{fmtPct(brokerPct)}</div>
                    <div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>{opp.broker}</div>
                    <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{fmtPrice(opp.gmv * brokerPct / 100)}</div>
                  </div>
                )}
                <div style={{ textAlign:'center', padding:'14px 12px', background:'linear-gradient(135deg,rgba(56,161,105,.08),rgba(56,161,105,.04))', borderRadius:10, border:'1px solid rgba(56,161,105,.2)' }}>
                  <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:6, textTransform:'uppercase', letterSpacing:1 }}>Plataforma</div>
                  <div style={{ fontSize:22, fontWeight:800, color:'var(--green)' }}>{fmtPct(platform)}</div>
                  <div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>HomeLink</div>
                  <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{fmtPrice(opp.gmv * platform / 100)}</div>
                </div>
              </div>
              <div style={{ marginTop:12, padding:'8px 12px', background:'var(--bg2)', borderRadius:6, fontSize:11.5, color:'var(--text3)', display:'flex', justifyContent:'space-between' }}>
                <span>{pt?'Total da comissão (6%):':'Total commission (6%):'}</span>
                <span style={{ fontWeight:700, color:'var(--primary)' }}>{fmtPrice(opp.commission)}</span>
              </div>
            </>
          )}

          {/* Edit split form (admin) */}
          {isAdmin && editSplit && splitVals && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:12 }}>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Imobiliária (%)</label>
                  <input className="form-input" type="number" step="0.5" min="0" max="6" value={currentSplit.agency}
                    onChange={e=>setSplitVals(s=>({...s,agency:e.target.value}))} />
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">{pt?'Corretor (%)':'Broker (%)'}</label>
                  <input className="form-input" type="number" step="0.5" min="0" max="6" value={currentSplit.broker}
                    onChange={e=>setSplitVals(s=>({...s,broker:e.target.value}))} />
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">{pt?'Plataforma (%)':'Platform (%)'}</label>
                  <input className="form-input" type="number" readOnly value={Math.max(0, 6 - Number(currentSplit.agency) - Number(currentSplit.broker))} style={{ background:'var(--bg2)', cursor:'not-allowed', color:'var(--text3)' }} />
                </div>
              </div>
              <div style={{ fontSize:11.5, color: (Number(currentSplit.agency)+Number(currentSplit.broker)) > 6 ? 'var(--red)' : 'var(--text3)', marginBottom:10 }}>
                {pt?'Soma máxima: 6%. Plataforma recebe o restante.':'Max sum: 6%. Platform receives the remainder.'}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-primary btn-sm" onClick={handleSaveSplit}>💾 {pt?'Salvar':'Save'}</button>
                <button className="btn btn-secondary btn-sm" onClick={() => { setEditSplit(false); setSplitVals(null) }}>{pt?'Cancelar':'Cancel'}</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Participants + Commissions */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">{pt?'Participantes':'Participants'}</div>
          <span className="badge b-approved" style={{ fontSize:10 }}>
            {pt?'Clique no imóvel para detalhes':'Click property for details'}
          </span>
        </div>
        <div className="card-body">
          <table className="data-table" style={{ marginBottom:14 }}>
            <thead><tr>
              <th>{pt?'Participante':'Participant'}</th>
              <th>{pt?'Papel':'Role'}</th>
              <th style={{ textAlign:'right' }}>{pt?'Comissão':'Commission'}</th>
            </tr></thead>
            <tbody>
              {opp.participants.map(pp => {
                const prop = props.find(x => x.id === pp.pid)
                const cm = opp.commissions.find(c => c.pid === pp.pid)
                const isSeller = pp.role_pt.includes('Vend')
                return (
                  <tr key={pp.pid}>
                    <td>
                      <div style={{ fontWeight:600, fontSize:12.5 }}>{pp.name}</div>
                      {prop && <div style={{ fontSize:11, color:'var(--text3)' }}>{lang==='pt'?prop.name:prop.en}</div>}
                    </td>
                    <td>
                      <span style={{ fontSize:11.5, background: isSeller?'var(--primary)':'var(--border)', color: isSeller?'var(--bg1)':'var(--text2)', padding:'2px 7px', borderRadius:4 }}>
                        {pp.role_pt}
                      </span>
                    </td>
                    <td style={{ textAlign:'right' }}>
                      {cm
                        ? <span style={{ fontWeight:600, color:'var(--primary)' }}>R$ {fmtN(cm.amount/1e3)}k</span>
                        : <span style={{ color:'var(--text3)', fontSize:11 }}>—</span>
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Commission cards (sellers only) */}
          {opp.commissions.map(cm => {
            const prop = props.find(x => x.id === cm.pid)
            const part = opp.participants.find(p => p.pid === cm.pid)
            const pName = prop ? (lang==='pt'?prop.name:prop.en) : 'Imóvel'
            return (
              <div key={cm.ref} style={{ padding:14, border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', marginBottom:10, background:'var(--bg2)' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:1, color:'var(--text3)', marginBottom:3 }}>
                      {lang==='pt'?(part?.role_pt||''):(part?.role_en||'')}
                    </div>
                    <div style={{ fontSize:14, fontWeight:600, color:'var(--text1)', marginBottom:2 }}>{part?.name || '—'}</div>
                    <div style={{ fontSize:12, color:'var(--text3)' }}>{pName} · Ref: {cm.ref}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:18, fontWeight:700, color:'var(--primary)' }}>R$ {fmtN(cm.amount/1e3)}k</div>
                    {isAdmin ? (
                      <select value={cm.status}
                        onChange={e => updateCommStatus(opp.id, cm.ref, e.target.value)}
                        style={{ marginTop:4, padding:'4px 8px', border:'1px solid var(--border)', borderRadius:4, fontSize:12, background:'var(--bg1)', color:'var(--text1)', cursor:'pointer' }}
                        onClick={e => e.stopPropagation()}>
                        <option value="PENDING">Pendente</option>
                        <option value="PAID">Paga</option>
                        <option value="OVERDUE">Vencida</option>
                      </select>
                    ) : (
                      <Badge status={cm.status} lang={lang} />
                    )}
                  </div>
                </div>
                {/* Due Diligence */}
                <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid var(--border)' }}>
                  <div style={{ fontSize:10.5, textTransform:'uppercase', letterSpacing:1, color:'var(--text3)', marginBottom:6 }}>Due Diligence</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6 }}>
                    {Object.entries(cm.dd).map(([k,v]) => (
                      <div key={k} style={{ textAlign:'center', padding:'6px 4px', background: v?'rgba(56,161,105,.1)':'rgba(229,62,62,.08)', borderRadius:4, border:`1px solid ${v?'var(--green)':'var(--red)'}` }}>
                        <div style={{ fontSize:16 }}>{v?'✅':'❌'}</div>
                        <div style={{ fontSize:9.5, color:'var(--text3)', marginTop:2, textTransform:'capitalize' }}>{k}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
