'use client'
import { Badge, MetricRow } from '../ui'
import { fmtPrice, fmtN } from '../../lib/utils'

// ── Analytics (shared for Admin / Broker / Agency) ─────────────────────
export default function ScreenAnalytics({ ctx }) {
  const { role, lang, opps, props, BROKERS_DATA, AGENCIES_DATA } = ctx
  const pt = lang === 'pt'

  const totalGmv = opps.reduce((s,o) => s+o.gmv, 0)
  const totalComm = opps.reduce((s,o) => s+o.commission, 0)
  const byStatus = opps.reduce((acc,o) => { acc[o.status]=(acc[o.status]||0)+1; return acc }, {})
  const byCity = props.reduce((acc,p) => { acc[p.city]=(acc[p.city]||0)+1; return acc }, {})

  const barMax = Math.max(...Object.values(byCity), 1)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div className="kpi-grid">
        <div className="kpi" style={{ borderLeft:'3px solid var(--blue)' }}>
          <div className="kpi-icon">💰</div>
          <div><div className="kpi-label">GMV Total</div><div className="kpi-value">R$ {fmtN(totalGmv/1e6)}M</div></div>
        </div>
        <div className="kpi" style={{ borderLeft:'3px solid var(--primary)' }}>
          <div className="kpi-icon">💳</div>
          <div><div className="kpi-label">{pt?'Comissões':'Commissions'}</div><div className="kpi-value">R$ {fmtN(totalComm/1e3)}k</div></div>
        </div>
        <div className="kpi" style={{ borderLeft:'3px solid var(--green)' }}>
          <div className="kpi-icon">📊</div>
          <div><div className="kpi-label">{pt?'Ticket Médio':'Avg Ticket'}</div><div className="kpi-value">{fmtPrice(totalGmv/(opps.length||1))}</div></div>
        </div>
        <div className="kpi" style={{ borderLeft:'3px solid var(--amber)' }}>
          <div className="kpi-icon">🔗</div>
          <div><div className="kpi-label">{pt?'CPS Médio':'Avg CPS'}</div><div className="kpi-value">{(opps.reduce((s,o)=>s+o.cps,0)/(opps.length||1)).toFixed(2)}</div></div>
        </div>
      </div>

      <div className="grid-2">
        {/* Status funnel */}
        <div className="card">
          <div className="card-header"><div className="card-title">{pt?'Funil por Status':'Status Funnel'}</div></div>
          <div className="card-body">
            {Object.entries(byStatus).map(([status, count]) => (
              <div key={status} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <Badge status={status} lang={lang} />
                <div style={{ flex:1, height:8, background:'var(--border)', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${(count/opps.length)*100}%`, background:'var(--primary)', borderRadius:4 }} />
                </div>
                <span style={{ fontSize:12, fontWeight:700, minWidth:20, color:'var(--text2)' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Props by city */}
        <div className="card">
          <div className="card-header"><div className="card-title">{pt?'Imóveis por Cidade':'Properties by City'}</div></div>
          <div className="card-body">
            {Object.entries(byCity).map(([city, count]) => (
              <div key={city} style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:12.5 }}>
                  <span>{city}</span>
                  <span style={{ fontWeight:700 }}>{count}</span>
                </div>
                <div style={{ height:8, background:'var(--border)', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${(count/barMax)*100}%`, background:'linear-gradient(90deg,var(--blue),var(--primary))', borderRadius:4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top opportunities */}
        <div className="card">
          <div className="card-header"><div className="card-title">{pt?'Top Oportunidades por GMV':'Top Opportunities by GMV'}</div></div>
          <div className="card-body">
            <table className="data-table">
              <thead><tr><th>ID</th><th>GMV</th><th>CPS</th><th>Status</th></tr></thead>
              <tbody>
                {[...opps].sort((a,b)=>b.gmv-a.gmv).slice(0,5).map(o => (
                  <tr key={o.id} onClick={() => ctx.openOpp(o.id)} style={{ cursor:'pointer' }}>
                    <td style={{ fontWeight:600, color:'var(--primary)' }}>{o.id}</td>
                    <td>{fmtPrice(o.gmv)}</td>
                    <td><span style={{ fontWeight:700, color:o.cps>=0.85?'var(--green)':'var(--amber)' }}>{o.cps}</span></td>
                    <td><Badge status={o.status} lang={lang} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {role === 'ADMIN' && (
          <div className="card">
            <div className="card-header"><div className="card-title">{pt?'Performance por Imobiliária':'Agency Performance'}</div></div>
            <div className="card-body">
              <table className="data-table">
                <thead><tr><th>{pt?'Imobiliária':'Agency'}</th><th>{pt?'Opps':'Opps'}</th><th>{pt?'Comissão':'Commission'}</th></tr></thead>
                <tbody>
                  {AGENCIES_DATA.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight:600 }}>{a.name}</td>
                      <td>{a.opps}</td>
                      <td style={{ color:'var(--primary)', fontWeight:600 }}>{fmtPrice(a.commission)}</td>
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
