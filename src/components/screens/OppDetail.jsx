'use client'
import { useState } from 'react'
import { Badge, PipelineSteps, MetricRow, Modal } from '../ui'
import { fmtPrice, fmtN, fmtPct } from '../../lib/utils'

// Due Diligence document list
const DD_DOCS = [
  { key:'matricula',    label:'Matrícula do Imóvel',            desc:'Certidão de matrícula atualizada (máx. 30 dias)' },
  { key:'certidoes',   label:'Certidões Negativas',             desc:'Certidões de ônus, ações e tributos' },
  { key:'iptu',        label:'IPTU',                            desc:'Comprovante de IPTU quitado' },
  { key:'docs',        label:'Documentos Pessoais do Vendedor', desc:'RG, CPF e comprovante de residência' },
  { key:'contrato',    label:'Contrato de Compra e Venda',      desc:'Minuta ou contrato assinado pelas partes' },
  { key:'procuracao',  label:'Procuração (se aplicável)',        desc:'Procuração pública, caso o vendedor atue por representante' },
]

export default function ScreenOppDetail({ ctx, opp }) {
  const { role, props, CHAINS, BROKERS_DATA, AGENCIES_DATA, PL, advanceOpp, retreatOpp,
    updateCommStatus, assignBrokerToOpp, updateOppSplit, navigate, setOpps, toast } = ctx
  const isAdmin = role === 'ADMIN'

  const [showAssign, setShowAssign]   = useState(false)
  const [assignAgency, setAssignAgency] = useState('')
  const [assignBroker, setAssignBroker] = useState('')
  const [editSplit, setEditSplit]     = useState(false)
  const [splitVals, setSplitVals]     = useState(null)
  // dd state: { [oppId]: { [pid]: { ...ddFlags, uploads: { [key]: File[] } } } }
  const [ddState, setDdState]         = useState({})

  if (!opp) return (
    <div className="empty"><div className="icon">📋</div>
      <p>Selecione uma oportunidade.</p>
    </div>
  )

  const chain = CHAINS.find(c => c.id === opp.chain)

  // ── Commission split logic ─────────────────────────────────
  const hasAgency  = !!opp.agency
  const hasBroker  = !!opp.broker
  const isIndependent = hasBroker && !hasAgency   // broker with no agency

  const agencyPct  = opp.split?.agency  || 0
  const brokerPct  = opp.split?.broker  || 0
  const platform   = Math.max(0, 6 - agencyPct - brokerPct)
  const currentSplit = splitVals || { agency: agencyPct, broker: brokerPct }

  // Brokers filtered by selected agency (or all if no agency chosen yet)
  const agencyBrokers = assignAgency
    ? BROKERS_DATA.filter(b => b.agency_id === assignAgency && b.status === 'active')
    : []

  const handleAssign = () => {
    const broker = BROKERS_DATA.find(b => b.id === assignBroker) || null
    const agency = AGENCIES_DATA.find(a => a.id === assignAgency) || null
    if (!broker && !agency) return
    assignBrokerToOpp && assignBrokerToOpp(opp.id, broker, agency)
    // Set default split
    if (agency && !broker) {
      updateOppSplit && updateOppSplit(opp.id, { agency:3, broker:0, platform:3 })
    } else if (!agency && broker) {
      updateOppSplit && updateOppSplit(opp.id, { agency:0, broker:3, platform:3 })
    }
    toast('Atribuição salva ✓', 'success')
    setShowAssign(false)
    setAssignBroker('')
    setAssignAgency('')
  }

  const handleSaveSplit = () => {
    const sum = Number(currentSplit.agency) + Number(currentSplit.broker)
    if (sum > 6) { toast('Total não pode exceder 6%', 'error'); return }
    updateOppSplit && updateOppSplit(opp.id, {
      agency:   Number(currentSplit.agency),
      broker:   Number(currentSplit.broker),
      platform: 6 - Number(currentSplit.agency) - Number(currentSplit.broker)
    })
    toast('Comissão atualizada ✓', 'success')
    setEditSplit(false)
    setSplitVals(null)
  }

  // ── Due Diligence helpers ──────────────────────────────────
  const getDd = (pid) => ddState[opp.id]?.[pid] || {}
  const setDdFlag = (pid, key, val) => {
    setDdState(prev => ({
      ...prev,
      [opp.id]: {
        ...(prev[opp.id] || {}),
        [pid]: { ...(prev[opp.id]?.[pid] || {}), [key]: val }
      }
    }))
  }
  const getDdUploads = (pid, key) => ddState[opp.id]?.[pid]?.uploads?.[key] || []
  const addUpload = (pid, key, files) => {
    setDdState(prev => {
      const current = prev[opp.id]?.[pid]?.uploads?.[key] || []
      return {
        ...prev,
        [opp.id]: {
          ...(prev[opp.id] || {}),
          [pid]: {
            ...(prev[opp.id]?.[pid] || {}),
            uploads: {
              ...(prev[opp.id]?.[pid]?.uploads || {}),
              [key]: [...current, ...Array.from(files).map(f => f.name)]
            }
          }
        }
      }
    })
    toast(`${files.length} arquivo(s) adicionado(s) ✓`, 'success')
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title" style={{ fontSize:16 }}>{opp.id}</div>
            <div style={{ fontSize:12, color:'var(--text3)' }}>
              Cadeia: {opp.chain} · Match: {opp.match_date}
            </div>
          </div>
          <Badge status={opp.status} />
        </div>
        <div className="card-body">
          <div className="kpi-grid" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
            <MetricRow label="GMV" value={fmtPrice(opp.gmv)} />
            <MetricRow label="CPS" value={opp.cps} />
            <MetricRow label="Comissão Total" value={fmtPrice(opp.commission)} />
            <MetricRow label="Participantes" value={opp.participants.length} />
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Pipeline de Progresso</div>
          {isAdmin && (
            <div style={{ display:'flex', gap:6 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => retreatOpp(opp.id)}>← Retroceder</button>
              <button className="btn btn-primary btn-sm" onClick={() => advanceOpp(opp.id)}>Avançar →</button>
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
            <div className="card-title">👤 Corretor & Imobiliária</div>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowAssign(!showAssign)}>
              {opp.broker || opp.agency ? 'Reatribuir' : 'Atribuir'}
            </button>
          </div>
          <div className="card-body">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom: showAssign ? 14 : 0 }}>
              <div style={{ padding:'12px 14px', background:'var(--bg2)', borderRadius:8, border:'1px solid var(--border)' }}>
                <div style={{ fontSize:10.5, color:'var(--text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Corretor</div>
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
                ) : <div style={{ fontSize:12.5, color:'var(--text3)', fontStyle:'italic' }}>Não atribuído</div>}
              </div>
              <div style={{ padding:'12px 14px', background:'var(--bg2)', borderRadius:8, border:'1px solid var(--border)' }}>
                <div style={{ fontSize:10.5, color:'var(--text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Imobiliária</div>
                {opp.agency ? (
                  <>
                    <div style={{ fontSize:13.5, fontWeight:700 }}>{opp.agency}</div>
                    <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>Agência parceira</div>
                  </>
                ) : <div style={{ fontSize:12.5, color:'var(--text3)', fontStyle:'italic' }}>Não atribuída</div>}
              </div>
            </div>

            {showAssign && (
              <div style={{ padding:'14px 16px', background:'var(--bg2)', borderRadius:8, border:'1px solid var(--border)' }}>
                <div style={{ fontSize:12, fontWeight:600, marginBottom:10 }}>
                  Atribuir Imobiliária ou Corretor Independente
                </div>
                {/* Option A: Agency + broker from agency */}
                <div style={{ marginBottom:12, padding:12, background:'var(--bg1)', borderRadius:6, border:'1px solid var(--border)' }}>
                  <div style={{ fontSize:11.5, fontWeight:600, marginBottom:8, color:'var(--primary)' }}>🏛 Opção A — Imobiliária</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    <div className="form-group" style={{ marginBottom:0 }}>
                      <label className="form-label">Imobiliária</label>
                      <select className="form-select" value={assignAgency} onChange={e=>{ setAssignAgency(e.target.value); setAssignBroker('') }}>
                        <option value="">— Nenhuma —</option>
                        {AGENCIES_DATA.filter(a=>a.status==='active').map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                    {assignAgency && (
                      <div className="form-group" style={{ marginBottom:0 }}>
                        <label className="form-label">Corretor da imobiliária</label>
                        <select className="form-select" value={assignBroker} onChange={e=>setAssignBroker(e.target.value)}>
                          <option value="">— Opcional —</option>
                          {agencyBrokers.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize:11, color:'var(--text3)', marginTop:6 }}>
                    Comissão: imobiliária + plataforma (máx. 6% total)
                  </div>
                </div>
                {/* Option B: Independent broker */}
                {!assignAgency && (
                  <div style={{ marginBottom:12, padding:12, background:'var(--bg1)', borderRadius:6, border:'1px solid var(--border)' }}>
                    <div style={{ fontSize:11.5, fontWeight:600, marginBottom:8, color:'var(--blue)' }}>👤 Opção B — Corretor Independente</div>
                    <div className="form-group" style={{ marginBottom:0 }}>
                      <label className="form-label">Corretor Independente</label>
                      <select className="form-select" value={assignBroker} onChange={e=>setAssignBroker(e.target.value)}>
                        <option value="">— Nenhum —</option>
                        {BROKERS_DATA.filter(b=>b.status==='active'&&!b.agency_id).map(b => (
                          <option key={b.id} value={b.id}>{b.name} ({b.creci})</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ fontSize:11, color:'var(--text3)', marginTop:6 }}>
                      Comissão: corretor + plataforma (máx. 6% total)
                    </div>
                  </div>
                )}
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-primary btn-sm" onClick={handleAssign}>
                    💾 Confirmar Atribuição
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setShowAssign(false); setAssignBroker(''); setAssignAgency('') }}>
                    Cancelar
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
          <div className="card-title">💰 Distribuição de Comissão</div>
          {isAdmin && (
            <button className="btn btn-secondary btn-sm" onClick={() => { setEditSplit(!editSplit); setSplitVals({ agency: agencyPct, broker: brokerPct }) }}>
              {editSplit ? 'Cancelar' : 'Editar Split'}
            </button>
          )}
        </div>
        <div className="card-body">
          {!editSplit && (
            <>
              <div style={{ height:12, borderRadius:6, overflow:'hidden', display:'flex', marginBottom:14 }}>
                {agencyPct > 0  && <div style={{ flex:agencyPct,  background:'var(--primary)', transition:'flex 0.4s' }} title={`Imobiliária ${fmtPct(agencyPct)}`} />}
                {brokerPct > 0  && <div style={{ flex:brokerPct,  background:'var(--blue)',    transition:'flex 0.4s' }} title={`Corretor ${fmtPct(brokerPct)}`} />}
                <div style={{ flex: Math.max(platform,0.01), background:'var(--green)', transition:'flex 0.4s' }} title={`Plataforma ${fmtPct(platform)}`} />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:`repeat(${(hasAgency?1:0)+(isIndependent?1:0)+1},1fr)`, gap:12 }}>
                {hasAgency && (
                  <div style={{ textAlign:'center', padding:'14px 12px', background:'linear-gradient(135deg,rgba(99,102,241,.08),rgba(99,102,241,.04))', borderRadius:10, border:'1px solid rgba(99,102,241,.2)' }}>
                    <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:6, textTransform:'uppercase', letterSpacing:1 }}>Imobiliária</div>
                    <div style={{ fontSize:22, fontWeight:800, color:'var(--primary)' }}>{fmtPct(agencyPct)}</div>
                    <div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>{opp.agency}</div>
                    <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{fmtPrice(opp.gmv * agencyPct / 100)}</div>
                  </div>
                )}
                {isIndependent && (
                  <div style={{ textAlign:'center', padding:'14px 12px', background:'linear-gradient(135deg,rgba(49,130,206,.08),rgba(49,130,206,.04))', borderRadius:10, border:'1px solid rgba(49,130,206,.2)' }}>
                    <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:6, textTransform:'uppercase', letterSpacing:1 }}>Corretor Independente</div>
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

              {!hasAgency && !hasBroker && (
                <div style={{ marginTop:10, padding:'8px 12px', background:'rgba(237,137,54,.08)', borderRadius:6, fontSize:12, color:'var(--amber)' }}>
                  ⚠ Nenhum corretor ou imobiliária atribuído. 100% da comissão (6%) vai para a plataforma.
                </div>
              )}
              <div style={{ marginTop:12, padding:'8px 12px', background:'var(--bg2)', borderRadius:6, fontSize:11.5, color:'var(--text3)', display:'flex', justifyContent:'space-between' }}>
                <span>Total da comissão (6%):</span>
                <span style={{ fontWeight:700, color:'var(--primary)' }}>{fmtPrice(opp.commission)}</span>
              </div>
            </>
          )}

          {isAdmin && editSplit && splitVals && (
            <div>
              <div style={{ fontSize:12, color:'var(--text3)', marginBottom:10 }}>
                {hasAgency && !isIndependent && 'Distribua entre imobiliária e plataforma (máx. 6% total).'}
                {isIndependent && 'Distribua entre corretor independente e plataforma (máx. 6% total).'}
                {!hasAgency && !hasBroker && 'Atribua um corretor ou imobiliária antes de editar o split.'}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:12 }}>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">{hasAgency ? 'Imobiliária (%)' : 'Corretor (%)'}</label>
                  <input className="form-input" type="number" step="0.5" min="0" max="6"
                    value={hasAgency ? currentSplit.agency : currentSplit.broker}
                    onChange={e => hasAgency
                      ? setSplitVals(s=>({...s, agency: e.target.value}))
                      : setSplitVals(s=>({...s, broker: e.target.value}))
                    } />
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Plataforma (%)</label>
                  <input className="form-input" type="number" readOnly
                    value={Math.max(0, 6 - Number(currentSplit.agency) - Number(currentSplit.broker))}
                    style={{ background:'var(--bg2)', cursor:'not-allowed', color:'var(--text3)' }} />
                </div>
              </div>
              <div style={{ fontSize:11.5, color: (Number(currentSplit.agency)+Number(currentSplit.broker)) > 6 ? 'var(--red)' : 'var(--text3)', marginBottom:10 }}>
                Soma máxima: 6%. Plataforma recebe o restante.
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-primary btn-sm" onClick={handleSaveSplit}>💾 Salvar</button>
                <button className="btn btn-secondary btn-sm" onClick={() => { setEditSplit(false); setSplitVals(null) }}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Participants + Commissions */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Participantes</div>
          <span className="badge b-approved" style={{ fontSize:10 }}>
            Clique no imóvel para detalhes
          </span>
        </div>
        <div className="card-body">
          <table className="data-table" style={{ marginBottom:14 }}>
            <thead><tr>
              <th>Participante</th><th>Papel</th><th style={{ textAlign:'right' }}>Comissão</th>
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
                      {prop && <div style={{ fontSize:11, color:'var(--text3)' }}>{prop.name}</div>}
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

          {opp.commissions.map(cm => {
            const prop = props.find(x => x.id === cm.pid)
            const part = opp.participants.find(p => p.pid === cm.pid)
            const pName = prop ? prop.name : 'Imóvel'
            // merge stored dd with live ddState
            const ddBase = cm.dd || {}
            const ddLive = getDd(cm.pid)
            return (
              <div key={cm.ref} style={{ padding:14, border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', marginBottom:10, background:'var(--bg2)' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:1, color:'var(--text3)', marginBottom:3 }}>
                      {part?.role_pt || ''}
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
                      <Badge status={cm.status} />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Due Diligence (shown when at DUE_DILIGENCE step or later) */}
      {opp.si >= PL.indexOf('DUE_DILIGENCE') && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">📋 Due Diligence</div>
            <span className="badge b-negotiation" style={{ fontSize:10 }}>
              {opp.commissions.length > 0
                ? `${opp.commissions.length} vendedor(es)`
                : 'Sem vendedores'}
            </span>
          </div>
          <div className="card-body">
            <p style={{ fontSize:12.5, color:'var(--text3)', marginBottom:14 }}>
              O corretor atribuído deve verificar e marcar cada documento abaixo. Documentos podem ser enviados individualmente por item.
            </p>
            {opp.commissions.map(cm => {
              const part = opp.participants.find(p => p.pid === cm.pid)
              return (
                <div key={`dd-${cm.ref}`} style={{ marginBottom:20 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--text1)', marginBottom:10, paddingBottom:6, borderBottom:'2px solid var(--primary)' }}>
                    🏠 {part?.name || '—'} — {props.find(x=>x.id===cm.pid)?.name || cm.pid}
                  </div>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ background:'var(--bg1)' }}>
                        <th style={{ padding:'8px 10px', fontSize:11, textAlign:'left', color:'var(--text3)', fontWeight:600, border:'1px solid var(--border)' }}>Documento</th>
                        <th style={{ padding:'8px 10px', fontSize:11, textAlign:'left', color:'var(--text3)', fontWeight:600, border:'1px solid var(--border)' }}>Descrição</th>
                        <th style={{ padding:'8px 10px', fontSize:11, textAlign:'center', color:'var(--text3)', fontWeight:600, border:'1px solid var(--border)', width:80 }}>Status</th>
                        <th style={{ padding:'8px 10px', fontSize:11, textAlign:'center', color:'var(--text3)', fontWeight:600, border:'1px solid var(--border)', width:120 }}>Arquivo(s)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DD_DOCS.map(doc => {
                        const checked = ddLive[doc.key] ?? ddBase[doc.key] ?? false
                        const uploads = getDdUploads(cm.pid, doc.key)
                        return (
                          <tr key={doc.key} style={{ background: checked ? 'rgba(56,161,105,.05)' : 'transparent' }}>
                            <td style={{ padding:'10px', fontSize:12.5, fontWeight:600, border:'1px solid var(--border)', verticalAlign:'middle' }}>
                              {doc.label}
                            </td>
                            <td style={{ padding:'10px', fontSize:11.5, color:'var(--text3)', border:'1px solid var(--border)', verticalAlign:'middle' }}>
                              {doc.desc}
                            </td>
                            <td style={{ padding:'10px', textAlign:'center', border:'1px solid var(--border)', verticalAlign:'middle' }}>
                              {isAdmin || role === 'BROKER' ? (
                                <label style={{ cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                                  <input type="checkbox" checked={checked}
                                    onChange={e => setDdFlag(cm.pid, doc.key, e.target.checked)} />
                                  <span style={{ fontSize:14 }}>{checked ? '✅' : '❌'}</span>
                                </label>
                              ) : (
                                <span style={{ fontSize:16 }}>{checked ? '✅' : '❌'}</span>
                              )}
                            </td>
                            <td style={{ padding:'10px', textAlign:'center', border:'1px solid var(--border)', verticalAlign:'middle' }}>
                              <div style={{ display:'flex', flexDirection:'column', gap:4, alignItems:'center' }}>
                                {uploads.length > 0 && (
                                  <div style={{ fontSize:10, color:'var(--text3)' }}>
                                    {uploads.map((f,i) => (
                                      <div key={i} style={{ color:'var(--blue)' }}>📎 {f}</div>
                                    ))}
                                  </div>
                                )}
                                {(isAdmin || role === 'BROKER') && (
                                  <>
                                    <input type="file" multiple style={{ display:'none' }}
                                      id={`upload-${cm.pid}-${doc.key}`}
                                      onChange={e => addUpload(cm.pid, doc.key, e.target.files)} />
                                    <label htmlFor={`upload-${cm.pid}-${doc.key}`}
                                      style={{ fontSize:10.5, padding:'3px 8px', background:'var(--primary)', color:'#fff', borderRadius:4, cursor:'pointer', fontWeight:600 }}>
                                      ⬆ Enviar
                                    </label>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {/* Progress bar */}
                  {(() => {
                    const total = DD_DOCS.length
                    const done = DD_DOCS.filter(d => ddLive[d.key] ?? ddBase[d.key] ?? false).length
                    const pct = Math.round(done/total*100)
                    return (
                      <div style={{ marginTop:10 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text3)', marginBottom:4 }}>
                          <span>Progresso: {done}/{total} documentos verificados</span>
                          <span style={{ fontWeight:700, color: done===total?'var(--green)':'var(--text2)' }}>{pct}%</span>
                        </div>
                        <div style={{ height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${pct}%`, background: done===total?'var(--green)':'var(--primary)', transition:'width 0.4s', borderRadius:3 }} />
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
