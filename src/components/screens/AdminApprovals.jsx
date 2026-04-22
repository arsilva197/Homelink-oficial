'use client'
import { useState } from 'react'
import { Badge, Modal } from '../ui'
import { fmtPrice, PROP_GRADIENTS, PROP_ICONS } from '../../lib/utils'

const AUDIT_ICONS = { created:'🆕', approved:'✅', status:'🔄', chain:'🔗', rejected:'❌' }

export default function ScreenAdminApprovals({ ctx }) {
  const { lang, props, approveProp, rejectProp, toast } = ctx
  const pt = lang === 'pt'

  const [tab, setTab] = useState('pending')
  const [detailProp, setDetailProp] = useState(null)   // full-screen detail
  const [rejectModal, setRejectModal] = useState(null) // {prop}
  const [rejectReason, setRejectReason] = useState('')

  const pending  = props.filter(p => p.approval_status === 'pending')
  const approved = props.filter(p => p.approval_status === 'approved')
  const rejected = props.filter(p => p.approval_status === 'rejected')

  const tabs = [
    { id:'pending',  label:`Aguardando (${pending.length})`  },
    { id:'approved', label:`Aprovados (${approved.length})`  },
    { id:'rejected', label:`Rejeitados (${rejected.length})` },
  ]

  const items = tab === 'pending' ? pending : tab === 'approved' ? approved : rejected

  function handleReject(p) {
    if (!rejectReason.trim()) {
      toast('Informe o motivo da rejeição', 'error')
      return
    }
    rejectProp && rejectProp(p.id, rejectReason.trim())
    toast(`Anúncio "${p.name}" rejeitado`, 'info')
    setRejectModal(null)
    setRejectReason('')
  }

  // ── Detail overlay ─────────────────────────────────────────
  if (detailProp) {
    const p = detailProp
    const gi = props.indexOf(p) % PROP_GRADIENTS.length
    const [c1, c2] = PROP_GRADIENTS[gi]
    const icon = PROP_ICONS[props.indexOf(p) % PROP_ICONS.length]
    const photos = p.photos || []
    const [photoIdx, setPhotoIdx] = useState(0)
    const creator = p.audit?.[0]

    return (
      <div>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setDetailProp(null)}>← Voltar</button>
          <div style={{ fontSize:16, fontWeight:700, color:'var(--text1)' }}>{p.name}</div>
          <span style={{ fontSize:11, fontFamily:'monospace', color:'var(--text3)' }}>{p.id}</span>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {/* Left — photos + details */}
          <div>
            {/* Hero */}
            <div style={{ height:220, borderRadius:10, overflow:'hidden', position:'relative', background:`linear-gradient(135deg,${c1},${c2})`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
              {photos.length > 0 ? (
                <>
                  <img src={photos[photoIdx]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}
                    onError={e => e.target.style.display='none'} />
                  {photos.length > 1 && (
                    <>
                      <button onClick={() => setPhotoIdx(i => (i-1+photos.length)%photos.length)}
                        style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', width:28, height:28, borderRadius:'50%', background:'rgba(0,0,0,.45)', color:'#fff', border:'none', cursor:'pointer', fontSize:16 }}>‹</button>
                      <button onClick={() => setPhotoIdx(i => (i+1)%photos.length)}
                        style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', width:28, height:28, borderRadius:'50%', background:'rgba(0,0,0,.45)', color:'#fff', border:'none', cursor:'pointer', fontSize:16 }}>›</button>
                      <div style={{ position:'absolute', bottom:8, left:0, right:0, display:'flex', justifyContent:'center', gap:5 }}>
                        {photos.map((_,i) => (
                          <button key={i} onClick={() => setPhotoIdx(i)}
                            style={{ width:i===photoIdx?18:7, height:7, borderRadius:4, background:i===photoIdx?'#fff':'rgba(255,255,255,.55)', border:'none', cursor:'pointer', padding:0 }} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <span style={{ fontSize:64 }}>{icon}</span>
              )}
            </div>

            {/* Price */}
            <div style={{ fontSize:24, fontWeight:800, color:'var(--blue)', marginBottom:12 }}>{fmtPrice(p.price)}</div>

            {/* Specs */}
            <table className="data-table"><tbody>
              <tr><td style={{ color:'var(--text3)', width:130 }}>Tipo</td><td>{p.type}</td></tr>
              <tr><td style={{ color:'var(--text3)' }}>Localização</td>
                <td>
                  {p.logradouro ? `${p.logradouro}${p.numero?', '+p.numero:''} — ` : ''}
                  {p.hood}, {p.city}{p.state?' / '+p.state:''}
                  {p.cep ? <span style={{ fontSize:11, color:'var(--text3)', marginLeft:6 }}>CEP {p.cep}</span> : null}
                </td>
              </tr>
              <tr><td style={{ color:'var(--text3)' }}>Área</td><td>{p.size} m²</td></tr>
              {p.beds > 0 && <tr><td style={{ color:'var(--text3)' }}>Quartos</td><td>{p.beds}</td></tr>}
              {p.baths > 0 && <tr><td style={{ color:'var(--text3)' }}>Banheiros</td><td>{p.baths}</td></tr>}
              {p.park > 0 && <tr><td style={{ color:'var(--text3)' }}>Vagas</td><td>{p.park}</td></tr>}
            </tbody></table>
          </div>

          {/* Right — submitter + audit + actions */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {/* Submitter */}
            {creator && (
              <div style={{ padding:'12px 14px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8 }}>
                <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:.8, color:'var(--text3)', marginBottom:8 }}>👤 Anunciante</div>
                <div style={{ fontSize:14, fontWeight:700, color:'var(--text1)' }}>{creator.user}</div>
                <div style={{ fontSize:11.5, color:'var(--text3)', marginTop:2 }}>Submetido em {p.reg}</div>
              </div>
            )}

            {/* Status */}
            <div style={{ padding:'12px 14px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8 }}>
              <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:.8, color:'var(--text3)', marginBottom:8 }}>Status</div>
              <Badge status={p.approval_status} />
              {p.rejection_reason && (
                <div style={{ marginTop:8, fontSize:12, color:'var(--red)', padding:'6px 10px', background:'rgba(229,62,62,.07)', borderRadius:6, borderLeft:'3px solid var(--red)' }}>
                  <strong>Motivo:</strong> {p.rejection_reason}
                </div>
              )}
            </div>

            {/* Actions */}
            {p.approval_status === 'pending' && (
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-sm" style={{ flex:1, background:'var(--green)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', padding:'10px', cursor:'pointer', fontWeight:700 }}
                  onClick={() => { approveProp && approveProp(p.id); toast(`Anúncio "${p.name}" aprovado ✓`, 'success'); setDetailProp(null) }}>
                  ✅ Aprovar
                </button>
                <button className="btn btn-secondary btn-sm" style={{ flex:1, color:'var(--red)', padding:'10px', fontWeight:700 }}
                  onClick={() => { setDetailProp(null); setRejectModal(p) }}>
                  ✗ Rejeitar com motivo
                </button>
              </div>
            )}
            {p.approval_status === 'rejected' && (
              <button className="btn btn-sm" style={{ background:'var(--green)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', padding:'8px 16px', cursor:'pointer', fontWeight:600 }}
                onClick={() => { approveProp && approveProp(p.id); toast(`"${p.name}" aprovado`, 'success'); setDetailProp(null) }}>
                ↩ Aprovar mesmo assim
              </button>
            )}

            {/* Audit trail */}
            <div style={{ padding:'12px 14px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8 }}>
              <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:.8, color:'var(--text3)', marginBottom:8 }}>📋 Histórico</div>
              {(p.audit || []).map((ev, idx) => (
                <div key={idx} style={{ display:'flex', gap:8, alignItems:'flex-start', padding:'5px 0', borderBottom: idx < (p.audit?.length||0)-1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize:13 }}>{AUDIT_ICONS[ev.type] || '📌'}</span>
                  <div style={{ fontSize:11.5 }}>
                    <span style={{ color:'var(--text3)', fontFamily:'monospace', marginRight:6 }}>{ev.date}</span>
                    <span style={{ fontWeight:600, color:'var(--text1)' }}>{ev.event}</span>
                    <span style={{ color:'var(--text3)', marginLeft:6 }}>— {ev.user}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rejection reason modal */}
        {rejectModal && (
          <Modal title={`Rejeitar: ${rejectModal.name}`} onClose={() => { setRejectModal(null); setRejectReason('') }}
            footer={
              <>
                <button className="btn btn-secondary" onClick={() => { setRejectModal(null); setRejectReason('') }}>Cancelar</button>
                <button className="btn btn-sm" style={{ background:'var(--red)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', padding:'8px 18px', cursor:'pointer', fontWeight:700 }}
                  onClick={() => handleReject(rejectModal)}>
                  ✗ Confirmar Rejeição
                </button>
              </>
            }
          >
            <p style={{ fontSize:13, color:'var(--text2)', marginBottom:10 }}>
              Informe o motivo da rejeição. O anunciante poderá visualizar este motivo e re-submeter o anúncio corrigido.
            </p>
            <textarea className="form-input" rows={4} placeholder="Ex: Fotos insuficientes, preço fora da faixa de mercado, endereço incompleto..."
              value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              style={{ resize:'vertical' }}
            />
          </Modal>
        )}
      </div>
    )
  }

  // ── List view ──────────────────────────────────────────────
  const PropRow = ({ p }) => {
    const gi = props.indexOf(p) % PROP_GRADIENTS.length
    const [c1, c2] = PROP_GRADIENTS[gi]
    const icon = PROP_ICONS[props.indexOf(p) % PROP_ICONS.length]
    const photos = p.photos || []

    return (
      <div className="card" style={{
        marginBottom:12, cursor:'pointer',
        borderLeft: `4px solid ${p.approval_status === 'pending' ? 'var(--amber)' : p.approval_status === 'approved' ? 'var(--green)' : 'var(--red)'}`
      }}
        onClick={() => setDetailProp(p)}
      >
        <div style={{ display:'flex', gap:14, alignItems:'flex-start', padding:'14px 16px' }}>
          {/* Thumbnail */}
          <div style={{
            width:72, height:72, flexShrink:0, borderRadius:8, overflow:'hidden',
            background:`linear-gradient(135deg,${c1},${c2})`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:28
          }}>
            {photos[0] ? (
              <img src={photos[0]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}
                onError={e => { e.target.style.display='none' }} />
            ) : icon}
          </div>

          {/* Info */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
              <div style={{ fontSize:14, fontWeight:700, color:'var(--text1)' }}>{p.name}</div>
              <span style={{ fontSize:10.5, color:'var(--text3)', fontFamily:'monospace' }}>{p.id}</span>
            </div>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', fontSize:12, color:'var(--text2)', marginBottom:6 }}>
              <span>🏠 {p.type}</span>
              <span>📍 {p.hood}, {p.city}</span>
              <span style={{ fontWeight:700, color:'var(--primary)' }}>{fmtPrice(p.price)}</span>
              <span>📐 {p.size}m²</span>
              {p.beds > 0 && <span>🛏 {p.beds}</span>}
            </div>
            <div style={{ fontSize:11, color:'var(--text3)' }}>
              📅 Cadastrado em {p.reg}
              {p.rejection_reason && (
                <span style={{ marginLeft:10, color:'var(--red)' }}>⚠ Motivo: {p.rejection_reason.slice(0,60)}{p.rejection_reason.length>60?'...':''}</span>
              )}
            </div>
          </div>

          {/* Quick action + status */}
          <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
            <Badge status={p.approval_status} />
            {tab === 'pending' && (
              <div style={{ display:'flex', gap:6 }} onClick={e => e.stopPropagation()}>
                <button className="btn btn-sm" style={{ background:'var(--green)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', fontSize:11, padding:'5px 10px', cursor:'pointer', fontWeight:600 }}
                  onClick={() => { approveProp && approveProp(p.id); toast(`"${p.name}" aprovado ✓`, 'success') }}>
                  ✅ Aprovar
                </button>
                <button className="btn btn-secondary btn-sm" style={{ fontSize:11, color:'var(--red)' }}
                  onClick={() => setRejectModal(p)}>
                  ✗ Rejeitar
                </button>
              </div>
            )}
            <span style={{ fontSize:11, color:'var(--primary)' }}>Ver detalhes →</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Summary banner */}
      {pending.length > 0 ? (
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'rgba(237,137,54,.1)', border:'1px solid var(--amber)', borderRadius:'var(--radius-sm)', marginBottom:20 }}>
          <span style={{ fontSize:22 }}>⏳</span>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:'var(--text1)' }}>
              {pending.length} novo(s) anúncio(s) aguardando sua aprovação
            </div>
            <div style={{ fontSize:12, color:'var(--text3)' }}>Clique em cada anúncio para revisar todos os detalhes antes de aprovar ou rejeitar</div>
          </div>
        </div>
      ) : (
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'rgba(56,161,105,.08)', border:'1px solid var(--green)', borderRadius:'var(--radius-sm)', marginBottom:20 }}>
          <span style={{ fontSize:22 }}>✅</span>
          <div style={{ fontSize:13, color:'var(--text2)' }}>Nenhum anúncio pendente. Tudo em dia!</div>
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
          <p>Nenhum anúncio nesta categoria.</p>
        </div>
      ) : (
        <div>{items.map(p => <PropRow key={p.id} p={p} />)}</div>
      )}

      {/* Rejection reason modal (from list view) */}
      {rejectModal && !detailProp && (
        <Modal title={`Rejeitar: ${rejectModal.name}`} onClose={() => { setRejectModal(null); setRejectReason('') }}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => { setRejectModal(null); setRejectReason('') }}>Cancelar</button>
              <button className="btn btn-sm" style={{ background:'var(--red)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', padding:'8px 18px', cursor:'pointer', fontWeight:700 }}
                onClick={() => handleReject(rejectModal)}>
                ✗ Confirmar Rejeição
              </button>
            </>
          }
        >
          <p style={{ fontSize:13, color:'var(--text2)', marginBottom:10 }}>
            Informe o motivo da rejeição. O anunciante poderá visualizar este motivo e re-submeter o anúncio corrigido.
          </p>
          <textarea className="form-input" rows={4} placeholder="Ex: Fotos insuficientes, preço fora da faixa de mercado, endereço incompleto..."
            value={rejectReason} onChange={e => setRejectReason(e.target.value)}
            style={{ resize:'vertical' }}
          />
        </Modal>
      )}
    </div>
  )
}
