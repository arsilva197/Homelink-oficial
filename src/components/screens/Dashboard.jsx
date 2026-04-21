'use client'
import { useMemo } from 'react'
import { KpiCard, Badge, MetricRow } from '../ui'
import { fmtPrice, fmtN } from '../../lib/utils'

export default function ScreenDashboard({ ctx }) {
  const { role, lang, props, opps, interests, CHAINS, ALERTS, BROKERS_DATA, AGENCIES_DATA, t, navigate } = ctx
  const pt = lang === 'pt'

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

  // For USUARIO: detect which of their properties are in active chains
  const myUserProps = props.filter(p => p.owner === 'usuario')
  const propsInChain = myUserProps.filter(p => p.chain)
  const hasActiveInterest = propsInChain.length > 0

  return (
    <div>
      {/* KPI Grid */}
      <div className="kpi-grid" style={{ marginBottom:20 }}>
        {role === 'ADMIN' && <>
          <KpiCard label={pt?'Imóveis Ativos':'Active Properties'} value={props.filter(p=>p.status==='ativo').length} icon="🏘" color="var(--blue)" />
          <KpiCard label={pt?'Oportunidades':'Opportunities'} value={opps.length} icon="📋" color="var(--primary)" />
          <KpiCard label={pt?'GMV Total':'Total GMV'} value={'R$ '+fmtN(totalGmv/1e6)+'M'} icon="💰" color="var(--green)" />
          <KpiCard label={pt?'Comissões':'Commissions'} value={'R$ '+fmtN(totalComm/1e3)+'k'} icon="💳" color="var(--amber)" />
          <KpiCard label={pt?'Corretores':'Brokers'} value={BROKERS_DATA.length} icon="🤝" color="#8b5cf6" />
          <KpiCard label={pt?'Imobiliárias':'Agencies'} value={AGENCIES_DATA.length} icon="🏛" color="#06b6d4" />
        </>}
        {role === 'BROKER' && <>
          <KpiCard label={pt?'Meus Anúncios':'My Listings'} value={myProps.length} icon="🏘" color="var(--blue)" />
          <KpiCard label={pt?'Oportunidades':'Opportunities'} value={myOpps.length} icon="📋" color="var(--primary)" />
          <KpiCard label={pt?'GMV':'GMV'} value={'R$ '+fmtN(totalGmv/1e6)+'M'} icon="💰" color="var(--green)" />
          <KpiCard label={pt?'Comissões':'Commissions'} value={'R$ '+fmtN(totalComm/1e3)+'k'} icon="💳" color="var(--amber)" />
        </>}
        {role === 'AGENCY' && <>
          <KpiCard label={pt?'Anúncios':'Listings'} value={myProps.length} icon="🏘" color="var(--blue)" />
          <KpiCard label={pt?'Corretores':'Brokers'} value={BROKERS_DATA.filter(b=>b.agency_id==='AGN-01').length} icon="🤝" color="var(--primary)" />
          <KpiCard label={pt?'GMV':'GMV'} value={'R$ '+fmtN(totalGmv/1e6)+'M'} icon="💰" color="var(--green)" />
          <KpiCard label={pt?'Comissões':'Commissions'} value={'R$ '+fmtN(totalComm/1e3)+'k'} icon="💳" color="var(--amber)" />
        </>}
        {role === 'USUARIO' && <>
          <KpiCard label={pt?'Meus Imóveis':'My Properties'} value={myProps.length} icon="🏠" color="var(--blue)" />
          <KpiCard label={pt?'Interesses Ativos':'Active Interests'} value={interests.filter(i=>i.owner==='usuario'&&i.status==='ATIVO').length} icon="🔍" color="var(--primary)" />
          <KpiCard label={pt?'Imóveis em Destaque':'Properties in Focus'} value={propsInChain.length} icon="🔥" color="var(--green)" />
          <KpiCard label={pt?'Matches':'Matches'} value={interests.filter(i=>i.owner==='usuario'&&i.status==='MATCH').length} icon="⚡" color="var(--amber)" />
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
                    {pt ? 'Há interesse no seu imóvel!' : 'There is interest in your property!'}
                  </div>
                  <div style={{ fontSize:12.5, color:'var(--text2)', lineHeight:1.6, marginBottom:10 }}>
                    {pt
                      ? `${propsInChain.length > 1 ? `${propsInChain.length} dos seus imóveis estão` : 'Um dos seus imóveis está'} sendo apresentado${propsInChain.length > 1 ? 's' : ''} a compradores em potencial. Um corretor está trabalhando para encontrar o melhor negócio para você.`
                      : `${propsInChain.length > 1 ? `${propsInChain.length} of your properties are` : 'One of your properties is'} being presented to potential buyers. A broker is working to find the best deal for you.`
                    }
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {propsInChain.map(p => (
                      <div key={p.id} style={{
                        display:'flex', alignItems:'center', gap:6,
                        background:'var(--bg1)', border:'1px solid var(--border)',
                        borderRadius:6, padding:'4px 10px', fontSize:12
                      }}>
                        <span>🏠</span>
                        <span style={{ fontWeight:600, color:'var(--text1)' }}>{lang==='pt'?p.name:p.en}</span>
                        <span style={{ color:'var(--text3)', fontSize:10.5 }}>{p.hood}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:10, fontSize:11.5, color:'var(--text3)', display:'flex', alignItems:'center', gap:5 }}>
                    <span>💬</span>
                    {pt
                      ? 'Um corretor entrará em contato pelo WhatsApp para tratar dos detalhes.'
                      : 'A broker will contact you via WhatsApp to discuss the details.'
                    }
                  </div>
                </div>
              </div>
            )}

            {/* Meus imóveis resumo */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">{pt?'Meus Imóveis':'My Properties'}</div>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('my-properties')}>
                  {pt?'Ver todos':'View all'}
                </button>
              </div>
              <div className="card-body">
                {myUserProps.length === 0 ? (
                  <p style={{ color:'var(--text3)', fontSize:13 }}>{pt?'Nenhum imóvel cadastrado.':'No properties yet.'}</p>
                ) : (
                  <table className="data-table">
                    <thead><tr>
                      <th>{pt?'Imóvel':'Property'}</th><th>Status</th><th>{pt?'Destaque':'Focus'}</th>
                    </tr></thead>
                    <tbody>
                      {myUserProps.map(p => (
                        <tr key={p.id}>
                          <td style={{ fontWeight:600 }}>{lang==='pt'?p.name:p.en}</td>
                          <td><Badge status={p.status?.toUpperCase()} lang={lang} /></td>
                          <td>
                            {p.chain
                              ? <span style={{ fontSize:12, color:'var(--green)', fontWeight:600 }}>🔥 {pt?'Em destaque':'In focus'}</span>
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
              <div className="card-title">{pt?'Oportunidades Ativas':'Active Opportunities'}</div>
            </div>
            <div className="card-body">
              {activeOpps.length === 0 ? (
                <p style={{ color:'var(--text3)', fontSize:13 }}>{pt?'Nenhuma oportunidade ativa.':'No active opportunities.'}</p>
              ) : (
                <table className="data-table">
                  <thead><tr>
                    <th>ID</th><th>{pt?'Cadeia':'Chain'}</th><th>GMV</th><th>Status</th>
                  </tr></thead>
                  <tbody>
                    {activeOpps.map(o => (
                      <tr key={o.id} onClick={() => ctx.openOpp(o.id)} style={{ cursor:'pointer' }}>
                        <td style={{ fontWeight:600 }}>{o.id}</td>
                        <td>{o.chain}</td>
                        <td>{fmtPrice(o.gmv)}</td>
                        <td><Badge status={o.status} lang={lang} /></td>
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
            <div className="card-header"><div className="card-title">⚡ {pt?'Alertas':'Alerts'}</div></div>
            <div className="card-body">
              {ALERTS.map(a => (
                <div key={a.id} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'8px 0', borderBottom:'1px solid var(--border)', cursor: a.link?'pointer':'default' }}
                  onClick={() => a.link && navigate(a.link)}>
                  <span style={{ fontSize:16 }}>{a.level==='high'?'🔴':a.level==='medium'?'🟡':'🟢'}</span>
                  <div style={{ fontSize:12.5, color:'var(--text2)' }}>{pt?a.pt:a.en}</div>
                </div>
              ))}
            </div>
          </div>
        ) : role === 'USUARIO' ? (
          /* Interests summary for USUARIO */
          <div className="card">
            <div className="card-header">
              <div className="card-title">🔍 {pt?'Meus Interesses':'My Interests'}</div>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('interests')}>
                {pt?'Ver todos':'View all'}
              </button>
            </div>
            <div className="card-body">
              {interests.filter(i=>i.owner==='usuario').length === 0 ? (
                <p style={{ color:'var(--text3)', fontSize:13 }}>{pt?'Nenhum interesse cadastrado.':'No interests yet.'}</p>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {interests.filter(i=>i.owner==='usuario').map(item => (
                    <div key={item.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', background:'var(--bg2)', borderRadius:6, border:'1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize:12.5, fontWeight:600, color:'var(--text1)' }}>{lang==='pt'?item.title:item.en}</div>
                        <div style={{ fontSize:11, color:'var(--text3)' }}>{item.city} · {item.type}</div>
                      </div>
                      <Badge status={item.status} lang={lang} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Cadeias Ativas (BROKER / AGENCY) */
          <div className="card">
            <div className="card-header"><div className="card-title">{pt?'Cadeias Ativas':'Active Chains'}</div></div>
            <div className="card-body">
              <table className="data-table">
                <thead><tr><th>ID</th><th>{pt?'Imóveis':'Props'}</th><th>CPS</th><th>Status</th></tr></thead>
                <tbody>
                  {CHAINS.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight:600, color:'var(--blue)' }}>{c.id}</td>
                      <td>{c.props}</td>
                      <td>{c.cps}</td>
                      <td><Badge status={c.status} lang={lang} /></td>
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
