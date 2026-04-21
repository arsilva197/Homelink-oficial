'use client'
import { useState } from 'react'
import { Badge } from '../ui'
import { fmtPrice } from '../../lib/utils'

export default function ScreenOpportunities({ ctx }) {
  const { opps, lang, role, openOpp, advanceOpp, retreatOpp, PL } = ctx
  const pt = lang === 'pt'
  const [filter, setFilter] = useState('')

  const filtered = filter ? opps.filter(o => o.status === filter) : opps

  return (
    <div>
      <div className="filter-bar" style={{ marginBottom:14 }}>
        <select className="filter-select" value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="">{pt?'Todos os status':'All statuses'}</option>
          {PL.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
        </select>
        <span className="filter-count">{filtered.length} {pt?'oportunidades':'opportunities'}</span>
      </div>

      <div className="card">
        <table className="data-table">
          <thead><tr>
            <th>ID</th><th>Cadeia</th><th>GMV</th><th>CPS</th>
            <th>{pt?'Corretor':'Broker'}</th><th>Status</th>
            {role==='ADMIN' && <th>{pt?'Ações':'Actions'}</th>}
          </tr></thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} onClick={() => openOpp(o.id)} style={{ cursor:'pointer' }}>
                <td style={{ fontWeight:700, color:'var(--primary)' }}>{o.id}</td>
                <td><span style={{ fontWeight:600, color:'var(--blue)' }}>{o.chain}</span></td>
                <td>{fmtPrice(o.gmv)}</td>
                <td>
                  <span style={{ fontWeight:700, color: o.cps>=0.85?'var(--green)':o.cps>=0.75?'var(--amber)':'var(--red)' }}>
                    {o.cps}
                  </span>
                </td>
                <td style={{ fontSize:12 }}>{o.broker || (pt?'Autônomo':'Autonomous')}</td>
                <td><Badge status={o.status} lang={lang} /></td>
                {role==='ADMIN' && (
                  <td onClick={e=>e.stopPropagation()}>
                    <div style={{ display:'flex', gap:4 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => retreatOpp(o.id)}>←</button>
                      <button className="btn btn-primary btn-sm" onClick={() => advanceOpp(o.id)}>→</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
