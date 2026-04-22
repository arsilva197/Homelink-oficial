'use client'
import { useMemo } from 'react'
import { KpiCard, Badge, MetricRow } from '../ui'
import { fmtPrice, fmtN } from '../../lib/utils'

export default function ScreenDashboard({ ctx }) {
  const { role, props, opps, interests, CHAINS, ALERTS, BROKERS_DATA, AGENCIES_DATA, navigate, openOpp } = ctx

  const myProps = role === 'USUARIO' ? props.filter(p => p.owner === 'usuario')
    : role === 'BROKER' || role === 'AGENCY' ? props.filter(p => p.owner === 'outro')
    : props

  const myOpps = role === 'BROKER' ? opps.filter(o => o.broker_id === 'BRK-01')
    : role === 'AGENCY' ? opps.filter(o => o.agency_id === 'AGN-01')
    : role === 'USUARIO' ? opps.filter(o => {
        const myPids = props.filter(p => p.owner === 'usuario').map(p => p.id)
        return o.participants.some(p => myPids.includes(p.pid))
      })
    : opps

  const totalGmv = myOpps.reduce((s, o) => s + o.gmv, 0)
  const totalComm = myOpps.reduce((s, o) => s + o.commission, 0)
  const activeOpps = myOpps.filter(o => !['CLOSED','COMMISSION_PAID'].includes(o.status))

  const myUserProps = props.filter(p => p.owner === 'usuario')
  const propsInChain = myUserProps.filter(p => p.chain)
  const hasActiveInterest = propsInChain.length > 0

  return (
    <div>
      {/* KPI Grid */}
      <div className="kpi-grid" style={{ marginBottom:20 }}>
        {role === 'ADMIN' && <>
          <KpiCard label="Imóveis Ativos" value={props.filter(p=>p.status==='ativo').length} icon="🏘" color="var(--blue)" onClick={() => navigate('properties')} />
          <KpiCard label="Oportunidades" value={opps.length} icon="📋" color="var(--primary)" onClick={() => navigate('opportunities')} />
          <KpiCard label="GMV Total" value={'R$ '+fmtN(totalGmv/1e6)+'M'} icon="💰" color="var(--green)" onClick={() => navigate('analytics')} />
          <KpiCard label="Comissões" value={'R$ '+fmtN(totalComm/1e3)+'k'} icon="💳" color="var(--amber)" onClick={() => navigate('payments')} />
          <KpiCard label="Corretores" value={BROKERS_DATA.length} icon="🤝" color="#8b5cf6" onClick={() => navigate('admin_users')} />
          <KpiCard label="Imobiliárias" value={AGENCIES_DATA.length} icon="🏛" color="#06b6d4" onClick={() => navigate('admin_users')} />
        </>}
        {role === 'BROKER' && <>
          <KpiCard label="Meus Anúncios" value={myProps.length} icon="🏘" color="var(--blue)" onClick={() => navigate('my-properties')} />
          <KpiCard label="Oportunidades" value={myOpps.length} icon="📋" color="var(--primary)" onClick={() => navigate('opportunities')} />
          <KpiCard label="GMV" value={'R$ '+fmtN(totalGmv/1e6)+'M'} icon="💰" color="var(--green)" onClick={() => navigate('broker-analytics')} />
          <KpiCard label="Comissões" value={'R$ '+fmtN(totalComm/1e3)+'k'} icon="💳" color="var(--amber)" onClick={() => navigate('payments')} />
        </>}
        {role === 'AGENCY' && <>
          <KpiCard label="Anúncios" value={myProps.length} icon="🏘" color="var(--blue)" onClick={() => navigate('my-properties')} />
          <KpiCard label="Corretores" value={BROKERS_DATA.filter(b=>b.agency_id==='AGN-01').length} icon="🤝" color="var(--primary)" onClick={() => navigate('my-brokers')} />
          <KpiCard label="GMV" value={'R$ '+fmtN(totalGmv/1e6)+'M'} icon="💰" color="var(--green)" onClick={() => navigate('agency-analytics')} />
          <KpiCard label="Comissões" value={'R$ '+fmtN(totalComm/1e3)+'k'} icon="💳" color="var(--amber)" onClick={() => navigate('payments')} />
        </>}
        {role === 'USUARIO' && <>
          <KpiCard label="Meus Imóveis" value={myUserProps.length} icon="🏠" color="var(--blue)" onClick={() => navigate('my-properties')} />
          <KpiCard label="Interesses Ativos" value={interests.filter(i=>i.owner==='usuario'&&i.status==='ATIVO').length} icon="🔍" color="var(--primary)" onClick={() => navigate('interests')} />
          <KpiCard label="Imóveis em Destaque" value={propsInChain.length} icon="🔥" color="var(--green)" onClick={() => navigate('my-properties')} />
          <KpiCard label="Matches" value={interests.filter(i=>i.owner==='usuario'&&i.status==='MATCH').length} icon="⚡" color="var(--amber)" onClick={() => navigate('interests')} />
        </>}
      </div>

      <div className="grid-2">
        {/* Left column */}
        {role === 'USUARIO' ? (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Property interest notification */}
            {hasActiveInterest && (
              <div style={{
                background:'linear-gradient(135deg,rgba(56,161,105,.12),rgba(49,130,206,.10))',
                border:'1.5px solid var(--green)',
                borderRadius:'var(--radius)',
                padding:'18px 20px',
                display:'flex', gap:16, alignItems:'flex-start'
              }}>
                <div style={{ fontSize:36, lineHeight:1 }}>🔥</div>
                <div>
                  <div style={{ fontSize:15, fontWeight:700, color:'var(--green)', marginBottom:4 }}>
                    Há interesse no seu imóvel!
                  </div>
                  <div style={{ fontSize:12.5, color:'var(--text2)', lineHeight:1.6, marginBottom:10 }}>
                    {propsInChain.length > 1
                      ? `${propsInChain.length} dos seus imóveis estão sendo apresentados a compradores em potencial.`
                      : 'Um dos seus imóveis está sendo apresentado a compradores em potencial.'
                    } Um corretor está trabalhando para encontrar o melhor negócio para você.
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {propsInChain.map(p => (
                      <div key={p.id}
                        onClick={() => navigate('my-properties')}
                        style={{
                          display:'flex', alignItems:'center', gap:6, cursor:'pointer',
                          background:'var(--bg1)', border:'1px solid var(--border)',
                          borderRadius:6, padding:'4px 10px', fontSize:12
                        }}>
                        <span>🏠</span>
                        <span style={{ fontWeight:600, color:'var(--text1)' }}>{p.name}</span>
                        <span style={{ color:'var(--text3)', fontSize:10.5 }}>{p.hood}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:10, fontSize:11.5, color:'var(--text3)', display:'flex', alignItems:'center', gap:5 }}>
                    <span>💬</span>
                    Um corretor entrará em contato pelo WhatsApp para tratar dos detalhes.
                  </div>
                </div>
              </div>
            )}

            {/* Meus imóveis resumo */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Meus Imóveis</div>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('my-properties')}>
                  Ver todos
                </button>
              </div>
              <div className="card-body">
                {myUserProps.length === 0 ? (
                  <p style={{ color:'var(--text3)', fontSize:13 }}>Nenhum imóvel cadastrado.</p>
                ) : (
                  <table className="data-table">
                    <thead><tr>
                      <th>Imóvel</th><th>Status</th><th>Situação</th>
                    </tr></thead>
                    <tbody>
                      {myUserProps.map(p => (
                        <tr key={p.id} onClick={() => navigate('my-properties')} style={{ cursor:'pointer' }}>
                          <td style={{ fontWeight:600 }}>{p.name}</td>
                          <td><Badge status={p.status?.toUpperCase()} /></td>
                          <td>
                            {p.chain
                              ? <span style={{ fontSize:12, color:'var(--green)', fontWeight:600 }}>🔥 Em destaque</span>
                              : <span style={{ fontSize:11, color:'var(--text3)' }}>—</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Active Opportunities (non-USUARIO) */
          <div className="card">
            <div className="card-header">
              <div className="card-title">Oportunidades Ativas</div>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('opportunities')}>Ver todas</button>
            </div>
            <div className="card-body">
              {activeOpps.length === 0 ? (
                <p style={{ color:'var(--text3)', fontSize:13 }}>Nenhuma oportunidade ativa.</p>
              ) : (
                <table className="data-table">
                  <thead><tr>
                    <th>ID</th><th>Cadeia</th><th>GMV</th><th>Status</th>
                  </tr></thead>
                  <tbody>
                    {activeOpps.map(o => (
                      <tr key={o.id} onClick={() => openOpp(o.id)} style={{ cursor:'pointer' }}>
                        <td style={{ fontWeight:600 }}>{o.id}</td>
                        <td>{o.chain}</td>
                        <td>{fmtPrice(o.gmv)}</td>
                        <td><Badge status={o.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Right column */}
        {role === 'ADMIN' ? (
          <div className="card">
            <div className="card-header"><div className="card-title">⚡ Alertas</div></div>
            <div className="card-body">
              {ALERTS.map(a => (
                <div key={a.id} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'8px 0', borderBottom:'1px solid var(--border)', cursor: a.link?'pointer':'default' }}
                  onClick={() => a.link && navigate(a.link)}>
                  <span style={{ fontSize:16 }}>{a.level==='high'?'🔴':a.level==='medium'?'🟡':'🟢'}</span>
                  <div style={{ fontSize:12.5, color:'var(--text2)' }}>{a.pt}</div>
                </div>
              ))}
            </div>
          </div>
        ) : role === 'USUARIO' ? (
          /* Interests summary for USUARIO */
          <div className="card">
            <div className="card-header">
              <div className="card-title">🔍 Meus Interesses</div>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('interests')}>
                Ver todos
              </button>
            </div>
            <div className="card-body">
              {interests.filter(i=>i.owner==='usuario').length === 0 ? (
                <p style={{ color:'var(--text3)', fontSize:13 }}>Nenhum interesse cadastrado.</p>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {interests.filter(i=>i.owner==='usuario').map(item => (
                    <div key={item.id}
                      onClick={() => navigate('interests')}
                      style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', background:'var(--bg2)', borderRadius:6, border:'1px solid var(--border)', cursor:'pointer' }}>
                      <div>
                        <div style={{ fontSize:12.5, fontWeight:600, color:'var(--text1)' }}>{item.title}</div>
                        <div style={{ fontSize:11, color:'var(--text3)' }}>{item.city} · {item.type}</div>
                      </div>
                      <Badge status={item.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Cadeias Ativas (BROKER / AGENCY) */
          <div className="card">
            <div className="card-header">
              <div className="card-title">Cadeias Ativas</div>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('opportunities')}>Ver todas</button>
            </div>
            <div className="card-body">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Imóveis</th><th>CPS</th><th>Status</th></tr></thead>
                <tbody>
                  {CHAINS.map(c => (
                    <tr key={c.id} onClick={() => navigate('opportunities')} style={{ cursor:'pointer' }}>
                      <td style={{ fontWeight:600, color:'var(--blue)' }}>{c.id}</td>
                      <td>{c.props}</td>
                      <td>{c.cps}</td>
                      <td><Badge status={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
