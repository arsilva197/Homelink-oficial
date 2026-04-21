'use client'
import { useMemo } from 'react'
import { KpiCard, Badge, MetricRow } from '../ui'
import { fmtPrice, fmtN } from '../../lib/utils'

export default function ScreenDashboard({ ctx }) {
  const { role, lang, props, opps, interests, CHAINS, ALERTS, BROKERS_DATA, AGENCIES_DATA, t } = ctx
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
          <KpiCard label={pt?'Interesses':'Interests'} value={interests.filter(i=>i.owner==='usuario').length} icon="🔍" color="var(--primary)" />
          <KpiCard label={pt?'Transações':'Transactions'} value={myOpps.length} icon="💼" color="var(--green)" />
          <KpiCard label={pt?'Em Negociação':'In Negotiation'} value={activeOpps.length} icon="⚡" color="var(--amber)" />
        </>}
      </div>

      <div className="grid-2">
        {/* Active Opportunities */}
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

        {/* Alerts (Admin) / Recent Props (others) */}
        {role === 'ADMIN' ? (
          <div className="card">
            <div className="card-header"><div className="card-title">⚡ {pt?'Alertas':'Alerts'}</div></div>
            <div className="card-body">
              {ALERTS.map(a => (
                <div key={a.id} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:16 }}>{a.level==='high'?'🔴':a.level==='medium'?'🟡':'🟢'}</span>
                  <div style={{ fontSize:12.5, color:'var(--text2)' }}>{pt?a.pt:a.en}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
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
