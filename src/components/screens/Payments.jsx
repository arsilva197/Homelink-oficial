'use client'
import { useState } from 'react'
import { Badge } from '../ui'
import { fmtPrice, fmtN } from '../../lib/utils'

// ── Status badge helper ───────────────────────────────────────
function PayBadge({ status }) {
  const map = {
    PAID:    { label:'Pago',     color:'var(--green)',   bg:'rgba(56,161,105,.12)' },
    PENDING: { label:'Pendente', color:'var(--amber)',   bg:'rgba(237,137,54,.12)' },
    OVERDUE: { label:'Vencido',  color:'var(--red)',     bg:'rgba(229,62,62,.12)'  },
  }
  const s = map[status] || map.PENDING
  return (
    <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:4,
      color:s.color, background:s.bg, border:`1px solid ${s.color}33` }}>
      {s.label}
    </span>
  )
}

// ── Tab button ────────────────────────────────────────────────
function Tab({ active, onClick, icon, label, badge }) {
  return (
    <button onClick={onClick} style={{
      padding:'8px 16px', border:'none', cursor:'pointer', fontSize:13, fontWeight:active?700:400,
      color: active ? 'var(--primary)' : 'var(--text3)',
      borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
      background:'transparent', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap',
    }}>
      {icon} {label}
      {badge > 0 && (
        <span style={{ fontSize:10, fontWeight:700, background:'var(--red)', color:'#fff',
          padding:'1px 5px', borderRadius:10, marginLeft:2 }}>{badge}</span>
      )}
    </button>
  )
}

// ── KPI mini card ─────────────────────────────────────────────
function PayKpi({ label, value, color, icon }) {
  return (
    <div className="kpi" style={{ borderLeft:`3px solid ${color}` }}>
      <div className="kpi-icon">{icon}</div>
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value" style={{ color }}>{value}</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────

export default function ScreenPayments({ ctx }) {
  const { role, opps } = ctx
  const [tab, setTab] = useState('imovel')
  const [bankEdit, setBankEdit] = useState(false)
  const [bankData, setBankData] = useState({
    pix:'12.345.678/0001-99', bank:'Itaú', branch:'1234',
    account:'56789-0', name:'HomeLink Soluções',
  })

  // ── Filter opps by role ────────────────────────────────────
  const myOpps = role === 'ADMIN'  ? opps
    : role === 'BROKER'  ? opps.filter(o => o.broker_id  === 'BRK-01')
    : role === 'AGENCY'  ? opps.filter(o => o.agency_id  === 'AGN-01')
    : []

  // ── Event 1 — Pagamento do Imóvel (Comprador → Vendedor) ───
  const allPropertyPay = myOpps.flatMap(o =>
    (o.property_payments || []).map(p => ({ ...p, opp_id: o.id }))
  )
  const ppPending = allPropertyPay.filter(p => p.status === 'PENDING').reduce((s,p)=>s+p.amount, 0)
  const ppPaid    = allPropertyPay.filter(p => p.status === 'PAID').reduce((s,p)=>s+p.amount, 0)
  const ppOverdue = allPropertyPay.filter(p => p.status === 'OVERDUE').reduce((s,p)=>s+p.amount, 0)

  // ── Event 2 — Comissão Integral 6% (Vendedor → Agente) ────
  const allCommissions = myOpps.flatMap(o =>
    (o.commissions || []).map(c => ({ ...c, opp_id: o.id }))
  )
  const cmPending = allCommissions.filter(c => c.status === 'PENDING').reduce((s,c)=>s+c.amount, 0)
  const cmPaid    = allCommissions.filter(c => c.status === 'PAID').reduce((s,c)=>s+c.amount, 0)
  const cmOverdue = allCommissions.filter(c => c.status === 'OVERDUE').reduce((s,c)=>s+c.amount, 0)

  // ── Event 3 — Repasse à HomeLink (Agente → Plataforma) ────
  const allRepasse = myOpps.flatMap(o =>
    (o.platform_repasse || []).map(r => ({ ...r, opp_id: o.id }))
  )
  const rpPending = allRepasse.filter(r => r.status === 'PENDING').reduce((s,r)=>s+r.amount, 0)
  const rpPaid    = allRepasse.filter(r => r.status === 'PAID').reduce((s,r)=>s+r.amount, 0)
  const rpOverdue = allRepasse.filter(r => r.status === 'OVERDUE').reduce((s,r)=>s+r.amount, 0)

  const overdueCount = allCommissions.filter(c=>c.status==='OVERDUE').length
    + allRepasse.filter(r=>r.status==='OVERDUE').length

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* ── Tabs ── */}
      <div className="card" style={{ padding:0 }}>
        <div style={{ display:'flex', borderBottom:'1px solid var(--border)', overflowX:'auto', padding:'0 16px' }}>
          <Tab active={tab==='imovel'}   onClick={()=>setTab('imovel')}
            icon="🏠" label="Pagamento do Imóvel" />
          <Tab active={tab==='comissao'} onClick={()=>setTab('comissao')}
            icon="💼" label="Comissão da Venda (6%)" badge={allCommissions.filter(c=>c.status==='OVERDUE').length} />
          <Tab active={tab==='repasse'}  onClick={()=>setTab('repasse')}
            icon="💸" label="Repasse à HomeLink" badge={allRepasse.filter(r=>r.status==='OVERDUE').length} />
          {role === 'ADMIN' && (
            <Tab active={tab==='bank'} onClick={()=>setTab('bank')} icon="🏦" label="Dados Bancários" />
          )}
        </div>

        {/* ── Tab 1: Pagamento do Imóvel ── */}
        {tab === 'imovel' && (
          <div style={{ padding:16 }}>
            <div style={{ marginBottom:12, padding:'10px 14px', background:'var(--bg2)', borderRadius:8, fontSize:12.5, color:'var(--text3)', lineHeight:1.6 }}>
              <strong style={{ color:'var(--text1)' }}>Pagamento do Imóvel</strong> — O comprador efetua o pagamento do valor acordado diretamente ao vendedor.
              Este evento é registrado na plataforma como confirmação da transação imobiliária.
            </div>
            <div className="kpi-grid" style={{ marginBottom:16 }}>
              <PayKpi label="Pendente" value={fmtPrice(ppPending)} color="var(--amber)" icon="⏳" />
              <PayKpi label="Pago"     value={fmtPrice(ppPaid)}    color="var(--green)" icon="✅" />
              {ppOverdue > 0 && <PayKpi label="Vencido" value={fmtPrice(ppOverdue)} color="var(--red)" icon="🔴" />}
            </div>
            {allPropertyPay.length === 0 ? (
              <p style={{ color:'var(--text3)', fontSize:13, margin:0 }}>Nenhum pagamento de imóvel registrado.</p>
            ) : (
              <table className="data-table">
                <thead><tr>
                  <th>Ref</th><th>Imóvel</th><th>Comprador → Vendedor</th><th>Oport.</th><th>Valor</th><th>Vencimento</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {allPropertyPay.map(p => (
                    <tr key={p.ref}>
                      <td style={{ fontFamily:'monospace', fontSize:11 }}>{p.ref}</td>
                      <td style={{ fontWeight:600 }}>{p.property_name}</td>
                      <td style={{ fontSize:12 }}>
                        <span style={{ color:'var(--blue)', fontWeight:600 }}>{p.buyer}</span>
                        <span style={{ color:'var(--text3)', margin:'0 5px' }}>→</span>
                        <span>{p.seller}</span>
                      </td>
                      <td style={{ color:'var(--primary)', fontWeight:600, fontSize:12 }}>{p.opp_id}</td>
                      <td style={{ fontWeight:700 }}>{fmtPrice(p.amount)}</td>
                      <td style={{ fontSize:11.5, color:'var(--text3)' }}>{p.due_date}</td>
                      <td><PayBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Tab 2: Comissão da Venda ── */}
        {tab === 'comissao' && (
          <div style={{ padding:16 }}>
            <div style={{ marginBottom:12, padding:'10px 14px', background:'var(--bg2)', borderRadius:8, fontSize:12.5, color:'var(--text3)', lineHeight:1.6 }}>
              <strong style={{ color:'var(--text1)' }}>Comissão Integral da Venda (6%)</strong> — Após receber o valor do imóvel,
              o vendedor repassa a comissão de 6% sobre o valor de venda à imobiliária ou corretor responsável pela intermediação.
            </div>
            <div className="kpi-grid" style={{ marginBottom:16 }}>
              <PayKpi label="A Receber" value={fmtPrice(cmPending)} color="var(--amber)" icon="⏳" />
              <PayKpi label="Recebido"  value={fmtPrice(cmPaid)}    color="var(--green)" icon="✅" />
              {cmOverdue > 0 && <PayKpi label="Vencido" value={fmtPrice(cmOverdue)} color="var(--red)" icon="🔴" />}
            </div>
            {allCommissions.length === 0 ? (
              <p style={{ color:'var(--text3)', fontSize:13, margin:0 }}>Nenhuma comissão encontrada.</p>
            ) : (
              <table className="data-table">
                <thead><tr>
                  <th>Ref</th><th>Vendedor (paga)</th><th>{role==='ADMIN'?'Destinatário':'Destinatário'}</th><th>Oport.</th><th>Valor</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {allCommissions.map(c => {
                    const opp = myOpps.find(o => o.id === c.opp_id)
                    const recipient = opp?.agency || opp?.broker || 'HomeLink'
                    return (
                      <tr key={c.ref}>
                        <td style={{ fontFamily:'monospace', fontSize:11 }}>{c.ref}</td>
                        <td style={{ fontWeight:600 }}>{c.seller}</td>
                        <td style={{ color:'var(--primary)', fontWeight:600, fontSize:12 }}>{recipient}</td>
                        <td style={{ color:'var(--blue)', fontWeight:600, fontSize:12 }}>{c.opp_id}</td>
                        <td style={{ fontWeight:700 }}>{fmtPrice(c.amount)}</td>
                        <td><PayBadge status={c.status} /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Tab 3: Repasse à HomeLink ── */}
        {tab === 'repasse' && (
          <div style={{ padding:16 }}>
            <div style={{ marginBottom:12, padding:'10px 14px', background:'var(--bg2)', borderRadius:8, fontSize:12.5, color:'var(--text3)', lineHeight:1.6 }}>
              <strong style={{ color:'var(--text1)' }}>Repasse à HomeLink</strong> — A imobiliária ou corretor tem até
              <strong style={{ color:'var(--primary)' }}> 5 dias úteis</strong> para repassar à plataforma o percentual acordado
              sobre a comissão recebida do vendedor.
            </div>
            <div className="kpi-grid" style={{ marginBottom:16 }}>
              <PayKpi label="A Repassar" value={fmtPrice(rpPending)} color="var(--amber)" icon="⏳" />
              <PayKpi label="Repassado"  value={fmtPrice(rpPaid)}    color="var(--green)" icon="✅" />
              {rpOverdue > 0 && <PayKpi label="Vencido" value={fmtPrice(rpOverdue)} color="var(--red)" icon="🔴" />}
            </div>
            {allRepasse.length === 0 ? (
              <p style={{ color:'var(--text3)', fontSize:13, margin:0 }}>Nenhum repasse encontrado.</p>
            ) : (
              <table className="data-table">
                <thead><tr>
                  <th>Ref</th><th>Pagador</th><th>Prazo (dias úteis)</th><th>Oport.</th><th>Vencimento</th><th>Valor</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {allRepasse.map(r => (
                    <tr key={r.ref}>
                      <td style={{ fontFamily:'monospace', fontSize:11 }}>{r.ref}</td>
                      <td style={{ fontWeight:600 }}>{r.payer}</td>
                      <td style={{ textAlign:'center' }}>
                        <span style={{ fontSize:12, fontWeight:700, color:'var(--primary)' }}>
                          {r.deadline_days} dias úteis
                        </span>
                      </td>
                      <td style={{ color:'var(--blue)', fontWeight:600, fontSize:12 }}>{r.opp_id}</td>
                      <td style={{ fontSize:11.5, color: r.status==='OVERDUE'?'var(--red)':'var(--text3)' }}>
                        {r.due_date}
                      </td>
                      <td style={{ fontWeight:700 }}>{fmtPrice(r.amount)}</td>
                      <td><PayBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Tab 4: Dados Bancários (admin only) ── */}
        {tab === 'bank' && role === 'ADMIN' && (
          <div style={{ padding:16 }}>
            <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:12 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setBankEdit(!bankEdit)}>
                {bankEdit ? '💾 Salvar' : '✏ Editar'}
              </button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[
                ['PIX (CNPJ)', 'pix'],
                ['Nome da Conta', 'name'],
                ['Banco', 'bank'],
                ['Agência', 'branch'],
                ['Conta', 'account'],
              ].map(([label, key]) => (
                <div key={key}>
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
        )}
      </div>

      {/* ── Resumo consolidado (admin) ── */}
      {role === 'ADMIN' && (
        <div className="card">
          <div className="card-header"><div className="card-title">📊 Visão Consolidada — Todos os Fluxos</div></div>
          <div className="card-body">
            <table className="data-table">
              <thead><tr>
                <th>Oportunidade</th>
                <th>Valor Imóvel(is)</th>
                <th>Comissão 6%</th>
                <th>Repasse Plataforma</th>
                <th>Responsável</th>
                <th>Status Pipeline</th>
              </tr></thead>
              <tbody>
                {myOpps.map(o => {
                  const totalPropPay = (o.property_payments||[]).reduce((s,p)=>s+p.amount, 0)
                  const totalComm    = (o.commissions||[]).reduce((s,c)=>s+c.amount, 0)
                  const totalRepasse = (o.platform_repasse||[]).reduce((s,r)=>s+r.amount, 0)
                  return (
                    <tr key={o.id}>
                      <td style={{ fontWeight:700, color:'var(--primary)' }}>{o.id}</td>
                      <td style={{ fontWeight:600 }}>{fmtPrice(totalPropPay)}</td>
                      <td>{fmtPrice(totalComm)}</td>
                      <td style={{ color:'var(--green)', fontWeight:600 }}>{fmtPrice(totalRepasse)}</td>
                      <td style={{ fontSize:12 }}>{o.agency || o.broker || <span style={{color:'var(--text3)'}}>—</span>}</td>
                      <td><Badge status={o.status} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
