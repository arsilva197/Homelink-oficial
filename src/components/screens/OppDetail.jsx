'use client'
import { Badge, PipelineSteps, MetricRow } from '../ui'
import { fmtPrice, fmtN, fmtPct } from '../../lib/utils'

export default function ScreenOppDetail({ ctx, opp }) {
  const { lang, role, props, CHAINS, PL, advanceOpp, retreatOpp, updateCommStatus, navigate } = ctx
  const pt = lang === 'pt'
  const isAdmin = role === 'ADMIN'

  if (!opp) return (
    <div className="empty"><div className="icon">📋</div>
      <p>{pt?'Selecione uma oportunidade.':'Select an opportunity.'}</p>
    </div>
  )

  const chain = CHAINS.find(c => c.id === opp.chain)
  const platform = 6 - (opp.split.agency || 0) - (opp.split.broker || 0)

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
          <div className="card-title">{pt?'Pipeline':'Pipeline'}</div>
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

      {/* Commission Split */}
      <div className="card">
        <div className="card-header"><div className="card-title">{pt?'Distribuição de Comissão':'Commission Split'}</div></div>
        <div className="card-body">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {opp.agency && <div style={{ textAlign:'center', padding:12, background:'var(--bg2)', borderRadius:'var(--radius-sm)' }}>
              <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:4 }}>Imobiliária</div>
              <div style={{ fontSize:18, fontWeight:700, color:'var(--primary)' }}>{fmtPct(opp.split.agency)}</div>
              <div style={{ fontSize:11, color:'var(--text3)' }}>{opp.agency}</div>
            </div>}
            {opp.broker && !opp.agency && <div style={{ textAlign:'center', padding:12, background:'var(--bg2)', borderRadius:'var(--radius-sm)' }}>
              <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:4 }}>Corretor</div>
              <div style={{ fontSize:18, fontWeight:700, color:'var(--blue)' }}>{fmtPct(opp.split.broker)}</div>
              <div style={{ fontSize:11, color:'var(--text3)' }}>{opp.broker}</div>
            </div>}
            <div style={{ textAlign:'center', padding:12, background:'var(--bg2)', borderRadius:'var(--radius-sm)' }}>
              <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:4 }}>Plataforma</div>
              <div style={{ fontSize:18, fontWeight:700, color:'var(--green)' }}>{fmtPct(platform)}</div>
              <div style={{ fontSize:11, color:'var(--text3)' }}>HomeLink</div>
            </div>
          </div>
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
          {/* All participants table */}
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
