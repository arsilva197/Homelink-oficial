'use client'
import { useState } from 'react'
import { Badge, PipelineSteps, MetricRow, Modal } from '../ui'
import { fmtPrice, fmtN, fmtPct } from '../../lib/utils'

// ── Due Diligence — grupos de documentos ─────────────────────
const DD_GROUPS = [
  {
    id:    'imovel',
    label: 'Documentos do Imóvel',
    icon:  '🏠',
    scope: 'seller',   // displayed once per seller (commission)
    docs: [
      { key:'matricula',  label:'Matrícula do Imóvel',    desc:'Certidão de matrícula atualizada (máx. 30 dias)' },
      { key:'certidoes',  label:'Certidões Negativas',    desc:'Certidões de ônus, ações reais e tributárias' },
      { key:'iptu',       label:'IPTU',                   desc:'Comprovante de IPTU quitado do exercício' },
    ],
  },
  {
    id:    'vendedor',
    label: 'Documentos do Vendedor',
    icon:  '🧾',
    scope: 'seller',
    docs: [
      { key:'id_vendedor',    label:'Identidade (RG/CPF)',         desc:'Documento de identidade e CPF do vendedor' },
      { key:'res_vendedor',   label:'Comprovante de Residência',   desc:'Conta de luz, água ou telefone (máx. 90 dias)' },
      { key:'estado_civil',   label:'Estado Civil / Certidão',     desc:'Certidão de casamento, divórcio ou óbito, se aplicável' },
      { key:'procuracao',     label:'Procuração (se aplicável)',   desc:'Procuração pública, se representado por terceiro' },
    ],
  },
  {
    id:    'comprador',
    label: 'Documentos do Comprador',
    icon:  '👤',
    scope: 'buyer',    // displayed once per buyer participant
    docs: [
      { key:'id_comprador',   label:'Identidade (RG/CPF)',         desc:'Documento de identidade e CPF do comprador' },
      { key:'renda',          label:'Comprovante de Renda',        desc:'Holerites, declaração IR ou extratos bancários (últimos 3 meses)' },
      { key:'res_comprador',  label:'Comprovante de Residência',   desc:'Conta de luz, água ou telefone (máx. 90 dias)' },
    ],
  },
  {
    id:    'contrato',
    label: 'Contrato',
    icon:  '📝',
    scope: 'global',   // displayed once per opp
    docs: [
      { key:'contrato',  label:'Contrato de Compra e Venda', desc:'Minuta ou contrato assinado pelas partes' },
      { key:'laudo',     label:'Laudo de Avaliação',          desc:'Laudo do imóvel emitido por perito habilitado (opcional)' },
    ],
  },
]

// ── Pipeline permission helper ───────────────────────────────
// Admin: all stages including CLOSED
// Broker / Agency: ASSIGNED onwards, cannot mark CLOSED (last index)
function canMovePipeline(role, opp, PL) {
  if (role === 'ADMIN') return true
  if (role === 'BROKER' || role === 'AGENCY') {
    const assignedIdx = PL.indexOf('ASSIGNED')
    const closedIdx   = PL.indexOf('CLOSED')
    return opp.si >= assignedIdx && opp.si < closedIdx - 1
  }
  return false
}

function canAdvance(role, opp, PL) {
  if (!canMovePipeline(role, opp, PL)) return false
  const closedIdx = PL.indexOf('CLOSED')
  if (role !== 'ADMIN' && opp.si >= closedIdx - 1) return false  // broker/agency stop before CLOSED
  return opp.si < PL.length - 1
}

function canRetreat(role, opp, PL) {
  if (!canMovePipeline(role, opp, PL)) return false
  const assignedIdx = PL.indexOf('ASSIGNED')
  if (role !== 'ADMIN' && opp.si <= assignedIdx) return false  // broker/agency can't go before ASSIGNED
  return opp.si > 0
}

// ── DD row component ─────────────────────────────────────────
function DdRow({ doc, checked, uploads, canEdit, onToggle, onUpload }) {
  return (
    <tr style={{ background: checked ? 'rgba(56,161,105,.05)' : 'transparent' }}>
      <td style={{ padding:'9px 10px', fontSize:12.5, fontWeight:600, border:'1px solid var(--border)', verticalAlign:'middle' }}>
        {doc.label}
      </td>
      <td style={{ padding:'9px 10px', fontSize:11.5, color:'var(--text3)', border:'1px solid var(--border)', verticalAlign:'middle' }}>
        {doc.desc}
      </td>
      <td style={{ padding:'9px 10px', textAlign:'center', border:'1px solid var(--border)', verticalAlign:'middle', width:72 }}>
        {canEdit ? (
          <label style={{ cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
            <input type="checkbox" checked={checked} onChange={e => onToggle(e.target.checked)} style={{ cursor:'pointer' }} />
            <span style={{ fontSize:14 }}>{checked ? '✅' : '⬜'}</span>
          </label>
        ) : (
          <span style={{ fontSize:16 }}>{checked ? '✅' : '❌'}</span>
        )}
      </td>
      <td style={{ padding:'9px 10px', textAlign:'center', border:'1px solid var(--border)', verticalAlign:'middle', width:130 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:3, alignItems:'center' }}>
          {uploads.map((f, i) => (
            <div key={i} style={{ fontSize:10, color:'var(--blue)', maxWidth:110, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              📎 {f}
            </div>
          ))}
          {canEdit && (
            <>
              <input type="file" multiple style={{ display:'none' }} id={`up-${doc.key}`}
                onChange={e => onUpload(e.target.files)} />
              <label htmlFor={`up-${doc.key}`}
                style={{ fontSize:10.5, padding:'3px 8px', background:'var(--primary)', color:'#fff', borderRadius:4, cursor:'pointer', fontWeight:600 }}>
                ⬆ Enviar
              </label>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

// ── Grouped DD table ─────────────────────────────────────────
function DdGroupTable({ group, entityKey, ddLive, ddBase, canEdit, onFlag, onUpload }) {
  const total = group.docs.length
  const done  = group.docs.filter(d => ddLive[d.key] ?? ddBase?.[d.key] ?? false).length
  const pct   = Math.round(done / total * 100)
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
        <div style={{ fontSize:12, fontWeight:700, color:'var(--text2)' }}>
          {group.icon} {group.label}
        </div>
        <div style={{ fontSize:11, color: done === total ? 'var(--green)' : 'var(--text3)' }}>
          {done}/{total} {done === total ? '✓' : ''}
        </div>
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr style={{ background:'var(--bg2)' }}>
            <th style={{ padding:'7px 10px', fontSize:10.5, textAlign:'left', color:'var(--text3)', fontWeight:600, border:'1px solid var(--border)' }}>Documento</th>
            <th style={{ padding:'7px 10px', fontSize:10.5, textAlign:'left', color:'var(--text3)', fontWeight:600, border:'1px solid var(--border)' }}>Descrição</th>
            <th style={{ padding:'7px 10px', fontSize:10.5, textAlign:'center', color:'var(--text3)', fontWeight:600, border:'1px solid var(--border)', width:72 }}>OK?</th>
            <th style={{ padding:'7px 10px', fontSize:10.5, textAlign:'center', color:'var(--text3)', fontWeight:600, border:'1px solid var(--border)', width:130 }}>Arquivo</th>
          </tr>
        </thead>
        <tbody>
          {group.docs.map(doc => (
            <DdRow key={doc.key}
              doc={doc}
              checked={ddLive[doc.key] ?? ddBase?.[doc.key] ?? false}
              uploads={(ddLive.uploads || {})[doc.key] || []}
              canEdit={canEdit}
              onToggle={v => onFlag(doc.key, v)}
              onUpload={files => onUpload(doc.key, files)}
            />
          ))}
        </tbody>
      </table>
      {/* mini progress */}
      <div style={{ height:3, background:'var(--border)', borderRadius:2, marginTop:4, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background: done===total?'var(--green)':'var(--primary)', transition:'width 0.4s', borderRadius:2 }} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────

export default function ScreenOppDetail({ ctx, opp }) {
  const { role, props, CHAINS, BROKERS_DATA, AGENCIES_DATA, PL, advanceOpp, retreatOpp,
    updateCommStatus, assignBrokerToOpp, updateOppSplit, navigate, setOpps, toast } = ctx
  const isAdmin = role === 'ADMIN'

  const [showAssign, setShowAssign]   = useState(false)
  const [assignAgency, setAssignAgency] = useState('')
  const [assignBroker, setAssignBroker] = useState('')
  const [editSplit, setEditSplit]     = useState(false)
  const [splitVals, setSplitVals]     = useState(null)
  // ddState[oppId][entityKey] = { [docKey]: bool, uploads: { [docKey]: string[] } }
  const [ddState, setDdState]         = useState({})

  if (!opp) return (
    <div className="empty"><div className="icon">📋</div>
      <p>Selecione uma oportunidade.</p>
    </div>
  )

  // ── Commission split logic ─────────────────────────────────
  const hasAgency     = !!opp.agency
  const hasBroker     = !!opp.broker
  const isIndependent = hasBroker && !hasAgency

  const agencyPct  = opp.split?.agency  || 0
  const brokerPct  = opp.split?.broker  || 0
  const platform   = Math.max(0, 6 - agencyPct - brokerPct)
  const currentSplit = splitVals || { agency: agencyPct, broker: brokerPct }

  const agencyBrokers = assignAgency
    ? BROKERS_DATA.filter(b => b.agency_id === assignAgency && b.status === 'active')
    : []

  const handleAssign = () => {
    const broker = BROKERS_DATA.find(b => b.id === assignBroker) || null
    const agency = AGENCIES_DATA.find(a => a.id === assignAgency) || null
    if (!broker && !agency) return
    assignBrokerToOpp && assignBrokerToOpp(opp.id, broker, agency)
    if (agency && !broker) updateOppSplit && updateOppSplit(opp.id, { agency:3, broker:0, platform:3 })
    else if (!agency && broker) updateOppSplit && updateOppSplit(opp.id, { agency:0, broker:3, platform:3 })
    toast('Atribuição salva ✓', 'success')
    setShowAssign(false); setAssignBroker(''); setAssignAgency('')
  }

  const handleSaveSplit = () => {
    const sum = Number(currentSplit.agency) + Number(currentSplit.broker)
    if (sum > 6) { toast('Total não pode exceder 6%', 'error'); return }
    updateOppSplit && updateOppSplit(opp.id, {
      agency: Number(currentSplit.agency), broker: Number(currentSplit.broker),
      platform: 6 - Number(currentSplit.agency) - Number(currentSplit.broker)
    })
    toast('Comissão atualizada ✓', 'success')
    setEditSplit(false); setSplitVals(null)
  }

  // ── DD helpers ─────────────────────────────────────────────
  const getDdLive = (entityKey) => ddState[opp.id]?.[entityKey] || {}
  const setDdFlag = (entityKey, docKey, val) => setDdState(prev => ({
    ...prev,
    [opp.id]: { ...(prev[opp.id]||{}),
      [entityKey]: { ...(prev[opp.id]?.[entityKey]||{}), [docKey]: val }
    }
  }))
  const addUpload = (entityKey, docKey, files) => setDdState(prev => {
    const cur = prev[opp.id]?.[entityKey]?.uploads?.[docKey] || []
    return {
      ...prev,
      [opp.id]: { ...(prev[opp.id]||{}),
        [entityKey]: { ...(prev[opp.id]?.[entityKey]||{}),
          uploads: { ...(prev[opp.id]?.[entityKey]?.uploads||{}),
            [docKey]: [...cur, ...Array.from(files).map(f=>f.name)]
          }
        }
      }
    }
  })

  // Who can edit DD: admin or the assigned broker / agency user
  const canEditDd = isAdmin || role === 'BROKER' || role === 'AGENCY'

  // Pipeline move permissions
  const showAdvance = canAdvance(role, opp, PL)
  const showRetreat = canRetreat(role, opp, PL)
  const showPipelineControls = showAdvance || showRetreat

  // DD threshold: show when at IN_NEGOTIATION (index 3) or beyond
  const ddThreshold = PL.indexOf('DUE_DILIGENCE')
  const showDd = opp.si >= PL.indexOf('IN_NEGOTIATION')

  // Buyers for DD
  const buyers  = opp.participants.filter(p => !p.role_pt.includes('Vend'))
  const sellers = opp.participants.filter(p =>  p.role_pt.includes('Vend'))

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
          {showPipelineControls && (
            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
              {role !== 'ADMIN' && (
                <span style={{ fontSize:10.5, color:'var(--text3)', marginRight:4 }}>
                  {role === 'BROKER' ? '👤 Corretor' : '🏛 Imobiliária'}
                </span>
              )}
              {showRetreat && (
                <button className="btn btn-secondary btn-sm" onClick={() => retreatOpp(opp.id)}>← Retroceder</button>
              )}
              {showAdvance && (
                <button className="btn btn-primary btn-sm" onClick={() => advanceOpp(opp.id)}>Avançar →</button>
              )}
              {isAdmin && !showRetreat && !showAdvance && (
                <span style={{ fontSize:11, color:'var(--text3)' }}>Transação encerrada</span>
              )}
            </div>
          )}
          {!showPipelineControls && !isAdmin && (
            <span style={{ fontSize:11, color:'var(--text3)' }}>
              {opp.si < PL.indexOf('ASSIGNED') ? 'Aguardando atribuição pelo Admin' : 'Apenas Admin pode encerrar'}
            </span>
          )}
        </div>
        <div className="card-body">
          <PipelineSteps stages={PL} currentSi={opp.si} />
          {/* Permission hint */}
          {(role === 'BROKER' || role === 'AGENCY') && opp.si >= PL.indexOf('ASSIGNED') && (
            <div style={{ marginTop:10, padding:'7px 12px', background:'rgba(99,102,241,.06)', borderRadius:6, fontSize:11.5, color:'var(--text3)' }}>
              ℹ️ Você pode avançar até <strong>Comissão Paga</strong>. Apenas o Admin pode marcar como <strong>Encerrado</strong>.
            </div>
          )}
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
                  <button className="btn btn-primary btn-sm" onClick={handleAssign}>💾 Confirmar Atribuição</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setShowAssign(false); setAssignBroker(''); setAssignAgency('') }}>Cancelar</button>
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
                {agencyPct > 0  && <div style={{ flex:agencyPct,  background:'var(--primary)', transition:'flex 0.4s' }} />}
                {brokerPct > 0  && <div style={{ flex:brokerPct,  background:'var(--blue)',    transition:'flex 0.4s' }} />}
                <div style={{ flex:Math.max(platform,0.01), background:'var(--green)', transition:'flex 0.4s' }} />
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
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
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
                  <input className="form-input" readOnly type="number"
                    value={Math.max(0, 6 - Number(currentSplit.agency) - Number(currentSplit.broker))}
                    style={{ background:'var(--bg2)', cursor:'not-allowed', color:'var(--text3)' }} />
                </div>
              </div>
              <div style={{ fontSize:11.5, color:(Number(currentSplit.agency)+Number(currentSplit.broker))>6?'var(--red)':'var(--text3)', marginBottom:10 }}>
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
                      <span style={{ fontSize:11.5, background:isSeller?'var(--primary)':'var(--border)', color:isSeller?'var(--bg1)':'var(--text2)', padding:'2px 7px', borderRadius:4 }}>
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
            return (
              <div key={cm.ref} style={{ padding:14, border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', marginBottom:10, background:'var(--bg2)' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:1, color:'var(--text3)', marginBottom:3 }}>{part?.role_pt||''}</div>
                    <div style={{ fontSize:14, fontWeight:600, color:'var(--text1)', marginBottom:2 }}>{part?.name||'—'}</div>
                    <div style={{ fontSize:12, color:'var(--text3)' }}>{prop?.name||cm.pid} · Ref: {cm.ref}</div>
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
                    ) : <Badge status={cm.status} />}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Due Diligence */}
      {showDd && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">📋 Due Diligence</div>
            {opp.si < ddThreshold && (
              <span style={{ fontSize:10.5, color:'var(--amber)', fontWeight:600 }}>
                ⚠ Disponível a partir de "Due Diligence" no pipeline
              </span>
            )}
          </div>
          <div className="card-body">
            {opp.si < ddThreshold && (
              <p style={{ fontSize:12.5, color:'var(--text3)', margin:0 }}>
                Avance o pipeline para a etapa <strong>Due Diligence</strong> para habilitar a verificação de documentos.
              </p>
            )}

            {opp.si >= ddThreshold && (
              <>
                <p style={{ fontSize:12.5, color:'var(--text3)', marginBottom:16 }}>
                  O corretor atribuído verifica e coleta os documentos abaixo. Use os checkboxes para confirmar cada item e o botão <strong>Enviar</strong> para anexar os arquivos.
                </p>

                {/* ── Por Vendedor: Imóvel + Vendedor ── */}
                {opp.commissions.map(cm => {
                  const part = opp.participants.find(p => p.pid === cm.pid)
                  const entityKey = `seller_${cm.pid}`
                  const ddLive = getDdLive(entityKey)
                  return (
                    <div key={entityKey} style={{ marginBottom:20, paddingBottom:16, borderBottom:'2px solid var(--border)' }}>
                      <div style={{ fontSize:13.5, fontWeight:700, color:'var(--text1)', marginBottom:12 }}>
                        🏠 {part?.name || '—'} — {props.find(x=>x.id===cm.pid)?.name || cm.pid}
                      </div>
                      {DD_GROUPS.filter(g => g.scope === 'seller').map(group => (
                        <DdGroupTable key={group.id} group={group} entityKey={entityKey}
                          ddLive={ddLive} ddBase={cm.dd}
                          canEdit={canEditDd}
                          onFlag={(docKey, val) => setDdFlag(entityKey, docKey, val)}
                          onUpload={(docKey, files) => addUpload(entityKey, docKey, files)}
                        />
                      ))}
                    </div>
                  )
                })}

                {/* ── Por Comprador ── */}
                {buyers.map(buyer => {
                  const entityKey = `buyer_${buyer.pid || buyer.name}`
                  const ddLive = getDdLive(entityKey)
                  return (
                    <div key={entityKey} style={{ marginBottom:20, paddingBottom:16, borderBottom:'2px solid var(--border)' }}>
                      <div style={{ fontSize:13.5, fontWeight:700, color:'var(--text1)', marginBottom:12 }}>
                        👤 {buyer.name} — Comprador
                      </div>
                      {DD_GROUPS.filter(g => g.scope === 'buyer').map(group => (
                        <DdGroupTable key={group.id} group={group} entityKey={entityKey}
                          ddLive={ddLive} ddBase={{}}
                          canEdit={canEditDd}
                          onFlag={(docKey, val) => setDdFlag(entityKey, docKey, val)}
                          onUpload={(docKey, files) => addUpload(entityKey, docKey, files)}
                        />
                      ))}
                    </div>
                  )
                })}

                {/* ── Contrato (global) ── */}
                {DD_GROUPS.filter(g => g.scope === 'global').map(group => {
                  const entityKey = `global_${opp.id}`
                  const ddLive = getDdLive(entityKey)
                  return (
                    <DdGroupTable key={group.id} group={group} entityKey={entityKey}
                      ddLive={ddLive} ddBase={{}}
                      canEdit={canEditDd}
                      onFlag={(docKey, val) => setDdFlag(entityKey, docKey, val)}
                      onUpload={(docKey, files) => addUpload(entityKey, docKey, files)}
                    />
                  )
                })}

                {/* Overall progress */}
                {(() => {
                  const allDocs = DD_GROUPS.flatMap(g => g.docs)
                  const entities = [
                    ...opp.commissions.map(cm => ({ key:`seller_${cm.pid}`, base:cm.dd })),
                    ...buyers.map(b => ({ key:`buyer_${b.pid||b.name}`, base:{} })),
                    { key:`global_${opp.id}`, base:{} },
                  ]
                  let total=0, done=0
                  entities.forEach(({ key, base }) => {
                    const live = getDdLive(key)
                    const entityGroups = DD_GROUPS.filter(g =>
                      key.startsWith('seller') ? g.scope === 'seller' :
                      key.startsWith('buyer')  ? g.scope === 'buyer'  : g.scope === 'global'
                    )
                    entityGroups.forEach(g => {
                      g.docs.forEach(d => {
                        total++
                        if (live[d.key] ?? base?.[d.key] ?? false) done++
                      })
                    })
                  })
                  const pct = total ? Math.round(done/total*100) : 0
                  return (
                    <div style={{ marginTop:8, padding:'12px 16px', background:'var(--bg2)', borderRadius:8, border:'1px solid var(--border)' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12.5, marginBottom:8 }}>
                        <span style={{ fontWeight:600 }}>Progresso Geral da Due Diligence</span>
                        <span style={{ fontWeight:700, color: done===total?'var(--green)':'var(--primary)' }}>{done}/{total} ({pct}%)</span>
                      </div>
                      <div style={{ height:8, background:'var(--border)', borderRadius:4, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${pct}%`, background: done===total?'var(--green)':'var(--primary)', transition:'width 0.4s', borderRadius:4 }} />
                      </div>
                      {done === total && (
                        <div style={{ marginTop:8, fontSize:12, color:'var(--green)', fontWeight:600 }}>
                          ✅ Todos os documentos verificados! Pronto para avançar.
                        </div>
                      )}
                    </div>
                  )
                })()}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
