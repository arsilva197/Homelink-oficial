'use client'
import { useState } from 'react'
import { Badge } from '../ui'
import { fmtPrice, PROP_GRADIENTS, PROP_ICONS } from '../../lib/utils'

const AUDIT_ICONS = { created:'🆕', approved:'✅', status:'🔄', chain:'🔗', rejected:'❌' }

export default function ScreenAdminApprovals({ ctx }) {
  const { lang, props, approveProp, rejectProp, toast } = ctx
  const pt = lang === 'pt'

  const [tab, setTab] = useState('pending')
  const [expandedAudit, setExpandedAudit] = useState(null)

  const pending = props.filter(p => p.approval_status === 'pending')
  const approved = props.filter(p => p.approval_status === 'approved')
  const rejected = props.filter(p => p.approval_status === 'rejected')

  const tabs = [
    { id:'pending', label: pt?`Aguardando (${pending.length})`:`Pending (${pending.length})` },
    { id:'approved', label: pt?`Aprovados (${approved.length})`:`Approved (${approved.length})` },
    { id:'rejected', label: pt?`Rejeitados (${rejected.length})`:`Rejected (${rejected.length})` },
  ]

  const items = tab === 'pending' ? pending : tab === 'approved' ? approved : rejected

  const PropRow = ({ p }) => {
    const gi = props.indexOf(p) % PROP_GRADIENTS.length
    const [c1, c2] = PROP_GRADIENTS[gi]
    const icon = PROP_ICONS[props.indexOf(p) % PROP_ICONS.length]
    const isExpanded = expandedAudit === p.id

    return (
      <div className="card" style={{
        marginBottom:12,
        borderLeft: `4px solid ${p.approval_status === 'pending' ? 'var(--amber)' : p.approval_status === 'approved' ? 'var(--green)' : 'var(--red)'}`
      }}>
        <div style={{ display:'flex', gap:14, alignItems:'flex-start', padding:'14px 16px' }}>
          {/* Thumbnail */}
          <div style={{
            width:64, height:64, flexShrink:0, borderRadius:8,
            background:`linear-gradient(135deg,${c1},${c2})`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:26
          }}>
            {icon}
          </div>

          {/* Info */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:10, flexWrap:'wrap', marginBottom:6 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:'var(--text1)' }}>{lang==='pt'?p.name:p.en}</div>
                <div style={{ fontSize:11, color:'var(--text3)', fontFamily:'monospace' }}>{p.id} · {pt?'Cadastrado em':'Created on'} {p.reg}</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', fontSize:12, color:'var(--text2)', marginBottom:8 }}>
              <span>🏠 {p.type}</span>
              <span>📍 {p.hood}, {p.city}</span>
              <span style={{ fontWeight:700, color:'var(--primary)' }}>{fmtPrice(p.price)}</span>
              <span>📐 {p.size}m²</span>
              {p.beds > 0 && <span>🛏 {p.beds}</span>}
              {p.baths > 0 && <span>🚿 {p.baths}</span>}
            </div>

            {/* Audit trail toggle */}
            <button
              className="btn btn-secondary btn-sm"
              style={{ fontSize:11, marginBottom:0 }}
              onClick={() => setExpandedAudit(isExpanded ? null : p.id)}
            >
              📋 {pt?'Trilha de auditoria':'Audit trail'} {isExpanded?'▲':'▼'}
            </button>

            {isExpanded && (
              <div style={{ marginTop:10, padding:'10px 12px', background:'var(--bg2)', borderRadius:6, border:'1px solid var(--border)' }}>
                <div style={{ fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:1, color:'var(--text3)', marginBottom:8 }}>
                  {pt?'Histórico de eventos':'Event history'}
                </div>
                {(p.audit || []).map((ev, idx) => (
                  <div key={idx} style={{ display:'flex', gap:8, alignItems:'flex-start', padding:'4px 0', borderBottom: idx < (p.audit?.length||0)-1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontSize:13 }}>{AUDIT_ICONS[ev.type] || '📌'}</span>
                    <div style={{ fontSize:11.5 }}>
                      <span style={{ color:'var(--text3)', fontFamily:'monospace', marginRight:6 }}>{ev.date}</span>
                      <span style={{ fontWeight:600, color:'var(--text1)' }}>{ev.event}</span>
                      <span style={{ color:'var(--text3)', marginLeft:6 }}>— {ev.user}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          {tab === 'pending' && (
            <div style={{ display:'flex', flexDirection:'column', gap:6, flexShrink:0 }}>
              <button
                className="btn btn-sm"
                style={{ background:'var(--green)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', fontSize:12, fontWeight:600, padding:'7px 14px', cursor:'pointer', whiteSpace:'nowrap' }}
                onClick={() => { approveProp && approveProp(p.id); toast(pt?`Anúncio "${lang==='pt'?p.name:p.en}" aprovado ✓`:`Listing "${lang==='pt'?p.name:p.en}" approved ✓`, 'success') }}
              >
                ✅ {pt?'Aprovar':'Approve'}
              </button>
              <button
                className="btn btn-secondary btn-sm"
                style={{ fontSize:12, color:'var(--red)' }}
                onClick={() => { rejectProp && rejectProp(p.id); toast(pt?`Anúncio rejeitado`:`Listing rejected`, 'info') }}
              >
                ✗ {pt?'Rejeitar':'Reject'}
              </button>
            </div>
          )}
          {tab === 'approved' && (
            <div style={{ fontSize:12, color:'var(--green)', fontWeight:600, whiteSpace:'nowrap' }}>✅ {pt?'Aprovado':'Approved'}</div>
          )}
          {tab === 'rejected' && (
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <div style={{ fontSize:12, color:'var(--red)', fontWeight:600 }}>❌ {pt?'Rejeitado':'Rejected'}</div>
              <button
                className="btn btn-secondary btn-sm"
                style={{ fontSize:11, color:'var(--green)' }}
                onClick={() => { approveProp && approveProp(p.id) }}
              >
                ↩ {pt?'Aprovar mesmo assim':'Approve anyway'}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Summary banner */}
      {pending.length > 0 && (
        <div style={{
          display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
          background:'rgba(237,137,54,.1)', border:'1px solid var(--amber)',
          borderRadius:'var(--radius-sm)', marginBottom:20
        }}>
          <span style={{ fontSize:22 }}>⏳</span>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:'var(--text1)' }}>
              {pt ? `${pending.length} novo(s) anúncio(s) aguardando sua aprovação` : `${pending.length} new listing(s) awaiting your approval`}
            </div>
            <div style={{ fontSize:12, color:'var(--text3)' }}>
              {pt?'Revise cada anúncio e clique em Aprovar ou Rejeitar':'Review each listing and click Approve or Reject'}
            </div>
          </div>
        </div>
      )}
      {pending.length === 0 && (
        <div style={{
          display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
          background:'rgba(56,161,105,.08)', border:'1px solid var(--green)',
          borderRadius:'var(--radius-sm)', marginBottom:20
        }}>
          <span style={{ fontSize:22 }}>✅</span>
          <div style={{ fontSize:13, color:'var(--text2)' }}>
            {pt?'Nenhum anúncio pendente. Tudo em dia!':'No pending listings. All up to date!'}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {tabs.map(tab_ => (
          <button key={tab_.id}
            className={`btn btn-sm ${tab===tab_.id?'btn-primary':'btn-secondary'}`}
            onClick={() => setTab(tab_.id)}>
            {tab_.label}
          </button>
        ))}
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <div className="empty">
          <div className="icon">{tab==='pending'?'📋':tab==='approved'?'✅':'❌'}</div>
          <p>{pt?'Nenhum anúncio nesta categoria.':'No listings in this category.'}</p>
        </div>
      ) : (
        <div>
          {items.map(p => <PropRow key={p.id} p={p} />)}
        </div>
      )}
    </div>
  )
}
