'use client'
import { useState } from 'react'
import { Badge, MetricRow } from '../ui'
import { fmtPrice, fmtN, fmtPct } from '../../lib/utils'

export default function ScreenPayments({ ctx }) {
  const { role, lang, opps, COMM_HISTORY } = ctx
  const pt = lang === 'pt'
  const [bankEdit, setBankEdit] = useState(false)
  const [bankData, setBankData] = useState({ pix:'12.345.678/0001-99', bank:'Itaú', branch:'1234', account:'56789-0', name:'HomeLink Soluções' })

  const allComms = opps.flatMap(o => o.commissions.map(c => ({ ...c, opp_id:o.id, opp:o })))
  const myComms = role === 'ADMIN' ? allComms
    : role === 'BROKER' ? allComms.filter(c => c.opp.broker_id === 'BRK-01')
    : role === 'AGENCY' ? allComms.filter(c => c.opp.agency_id === 'AGN-01')
    : []

  const totalPending = myComms.filter(c => c.status === 'PENDING').reduce((s,c) => s+c.amount, 0)
  const totalOverdue = myComms.filter(c => c.status === 'OVERDUE').reduce((s,c) => s+c.amount, 0)
  const totalPaid = myComms.filter(c => c.status === 'PAID').reduce((s,c) => s+c.amount, 0)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Summary KPIs */}
      <div className="kpi-grid">
        <div className="kpi" style={{ borderLeft:'3px solid var(--amber)' }}>
          <div className="kpi-icon">⏳</div>
          <div>
            <div className="kpi-label">{pt?'Pendente':'Pending'}</div>
            <div className="kpi-value">{fmtPrice(totalPending)}</div>
          </div>
        </div>
        <div className="kpi" style={{ borderLeft:'3px solid var(--red)' }}>
          <div className="kpi-icon">🔴</div>
          <div>
            <div className="kpi-label">{pt?'Vencida':'Overdue'}</div>
            <div className="kpi-value">{fmtPrice(totalOverdue)}</div>
          </div>
        </div>
        <div className="kpi" style={{ borderLeft:'3px solid var(--green)' }}>
          <div className="kpi-icon">✅</div>
          <div>
            <div className="kpi-label">{pt?'Pago':'Paid'}</div>
            <div className="kpi-value">{fmtPrice(totalPaid)}</div>
          </div>
        </div>
      </div>

      {/* Commission Table */}
      <div className="card">
        <div className="card-header"><div className="card-title">{pt?'Comissões':'Commissions'}</div></div>
        <div className="card-body">
          {myComms.length === 0 ? (
            <p style={{ color:'var(--text3)', fontSize:13 }}>{pt?'Nenhuma comissão encontrada.':'No commissions found.'}</p>
          ) : (
            <table className="data-table">
              <thead><tr>
                <th>Ref</th><th>{pt?'Vendedor':'Seller'}</th><th>{pt?'Oport.':'Opp.'}</th>
                <th>{pt?'Valor':'Amount'}</th><th>Status</th>
              </tr></thead>
              <tbody>
                {myComms.map(c => (
                  <tr key={c.ref}>
                    <td style={{ fontFamily:'monospace', fontSize:11 }}>{c.ref}</td>
                    <td>{c.seller}</td>
                    <td style={{ color:'var(--blue)', fontWeight:600 }}>{c.opp_id}</td>
                    <td style={{ fontWeight:700, color:'var(--primary)' }}>{fmtPrice(c.amount)}</td>
                    <td><Badge status={c.status} lang={lang} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Banking Panel */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">🏦 {pt?'Dados Bancários':'Banking Details'}</div>
          <button className="btn btn-secondary btn-sm" onClick={() => setBankEdit(!bankEdit)}>
            {bankEdit ? (pt?'💾 Salvar':'💾 Save') : (pt?'✏ Editar':'✏ Edit')}
          </button>
        </div>
        <div className="card-body">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              ['PIX (CNPJ)', 'pix'],
              [pt?'Nome da Conta':'Account Name', 'name'],
              [pt?'Banco':'Bank', 'bank'],
              [pt?'Agência':'Branch', 'branch'],
              [pt?'Conta':'Account', 'account'],
            ].map(([label, key]) => (
              <div key={key} className="banking-field">
                <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:3 }}>{label}</div>
                {bankEdit ? (
                  <input className="form-input" style={{ padding:'4px 8px', fontSize:13 }}
                    value={bankData[key]} onChange={e => setBankData(d => ({...d, [key]:e.target.value}))} />
                ) : (
                  <div style={{ fontSize:13.5, fontWeight:600, color:'var(--text1)' }}>{bankData[key]}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commission History */}
      {Object.keys(COMM_HISTORY).length > 0 && (
        <div className="card">
          <div className="card-header"><div className="card-title">{pt?'Histórico de Eventos':'Event History'}</div></div>
          <div className="card-body">
            {Object.entries(COMM_HISTORY).map(([ref, events]) => (
              <div key={ref} style={{ marginBottom:14 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--text3)', marginBottom:6, fontFamily:'monospace' }}>{ref}</div>
                {events.map((ev, i) => (
                  <div key={i} className="pmt-row" style={{ display:'flex', gap:12, padding:'6px 0', borderBottom:'1px solid var(--border)', fontSize:12 }}>
                    <div style={{ color:'var(--text3)', minWidth:80 }}>{ev.date}</div>
                    <div style={{ flex:1, color:'var(--text2)' }}>{ev.event}</div>
                    {ev.amount && <div style={{ fontWeight:600, color:'var(--primary)' }}>{fmtPrice(ev.amount)}</div>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
