'use client'
import { useState } from 'react'
import { Badge, Modal } from '../ui'
import { fmtPrice } from '../../lib/utils'

export default function ScreenInterests({ ctx }) {
  const { role, lang, interests, setModal, setInterests, t, toast } = ctx
  const pt = lang === 'pt'
  const ownerKey = role==='BROKER'?'broker':role==='AGENCY'?'agency':'usuario'
  const myInts = interests.filter(i => i.owner === ownerKey)

  const [editItem, setEditItem] = useState(null)

  const handleStatus = (id, action) => {
    setInterests(prev => prev.map(i => {
      if (i.id !== id) return i
      if (action === 'pause') return { ...i, status: 'PAUSADO' }
      if (action === 'activate') return { ...i, status: 'ATIVO' }
      if (action === 'remove') return { ...i, status: 'CANCELADO' }
      return i
    }))
    const msgs = { pt:{ pause:'Interesse pausado', activate:'Interesse reativado', remove:'Interesse removido' }, en:{ pause:'Interest paused', activate:'Interest reactivated', remove:'Interest removed' } }
    toast(msgs[pt?'pt':'en'][action], action==='remove'?'info':'success')
  }

  const handleEdit = (updated) => {
    setInterests(prev => prev.map(i => i.id === updated.id ? { ...i, ...updated } : i))
    setEditItem(null)
    toast(pt?'Interesse atualizado ✓':'Interest updated ✓', 'success')
  }

  const activeInts = myInts.filter(i => i.status !== 'CANCELADO')
  const cancelledInts = myInts.filter(i => i.status === 'CANCELADO')

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <p style={{ fontSize:12.5, color:'var(--text3)', margin:0 }}>{t('interest_hint')}</p>
      </div>

      {myInts.length === 0 ? (
        <div className="empty">
          <div className="icon">🔍</div>
          <p>{t('no_interests')}</p>
          <button className="btn btn-primary" style={{ marginTop:16 }} onClick={() => setModal({type:'addInterest'})}>
            {t('btn_add_interest')}
          </button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {activeInts.map(item => {
            const isPaused = item.status === 'PAUSADO'
            return (
              <div key={item.id} className="card" style={{ opacity: isPaused ? 0.75 : 1, borderLeft:`3px solid ${isPaused ? 'var(--amber)' : item.status === 'MATCH' ? 'var(--green)' : 'var(--primary)'}` }}>
                <div className="card-header">
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    <div className="card-title">{lang==='pt'?item.title:item.en}</div>
                    {isPaused && <span style={{ fontSize:10, color:'var(--amber)', fontWeight:600 }}>⏸ {pt?'Pausado':'Paused'}</span>}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <Badge status={item.status} lang={lang} />
                    {/* Action buttons */}
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize:10.5, padding:'3px 8px' }}
                      onClick={() => setEditItem(item)}
                      title={pt?'Editar':'Edit'}
                    >✏</button>
                    {!isPaused && item.status !== 'MATCH' && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize:10.5, padding:'3px 8px', color:'var(--amber)' }}
                        onClick={() => handleStatus(item.id, 'pause')}
                        title={pt?'Pausar':'Pause'}
                      >⏸</button>
                    )}
                    {isPaused && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize:10.5, padding:'3px 8px', color:'var(--green)' }}
                        onClick={() => handleStatus(item.id, 'activate')}
                        title={pt?'Reativar':'Reactivate'}
                      >▶</button>
                    )}
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize:10.5, padding:'3px 8px', color:'var(--red)' }}
                      onClick={() => handleStatus(item.id, 'remove')}
                      title={pt?'Remover':'Remove'}
                    >🗑</button>
                  </div>
                </div>
                <div className="card-body">
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:10 }}>
                    <div>
                      <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:2 }}>{pt?'Tipo':'Type'}</div>
                      <div style={{ fontSize:13, fontWeight:600 }}>{item.type}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:2 }}>{pt?'Cidade':'City'}</div>
                      <div style={{ fontSize:13, fontWeight:600 }}>{item.city}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:2 }}>{pt?'Bairro':'Neighborhood'}</div>
                      <div style={{ fontSize:13, fontWeight:600 }}>{item.hood||'—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:2 }}>{pt?'Faixa de Preço':'Price Range'}</div>
                      <div style={{ fontSize:13, fontWeight:600 }}>{fmtPrice(item.min_p)} – {fmtPrice(item.max_p)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:2 }}>Área Mín.</div>
                      <div style={{ fontSize:13, fontWeight:600 }}>{item.min_size}m²</div>
                    </div>
                    <div>
                      <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:2 }}>{pt?'Quartos Mín.':'Min Beds'}</div>
                      <div style={{ fontSize:13, fontWeight:600 }}>{item.min_beds}</div>
                    </div>
                  </div>
                  {item.notes && (
                    <div style={{ fontSize:12, color:'var(--text3)', borderTop:'1px solid var(--border)', paddingTop:8 }}>
                      📝 {item.notes}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Cancelled / removed interests */}
          {cancelledInts.length > 0 && (
            <div>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:1, color:'var(--text3)', margin:'8px 0 8px' }}>
                {pt?'Removidos':'Removed'}
              </div>
              {cancelledInts.map(item => (
                <div key={item.id} className="card" style={{ opacity:0.5, marginBottom:8, borderLeft:'3px solid var(--text4)' }}>
                  <div className="card-header">
                    <div className="card-title" style={{ textDecoration:'line-through', color:'var(--text3)' }}>{lang==='pt'?item.title:item.en}</div>
                    <div style={{ display:'flex', gap:6 }}>
                      <Badge status={item.status} lang={lang} />
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize:10.5, padding:'3px 8px', color:'var(--blue)' }}
                        onClick={() => handleStatus(item.id, 'activate')}
                      >↩ {pt?'Restaurar':'Restore'}</button>
                    </div>
                  </div>
                  <div className="card-body" style={{ padding:'6px 0 0' }}>
                    <div style={{ fontSize:11.5, color:'var(--text3)' }}>{item.type} · {item.city} · {fmtPrice(item.min_p)} – {fmtPrice(item.max_p)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Interest Modal */}
      {editItem && (
        <EditInterestModal
          lang={lang}
          item={editItem}
          onClose={() => setEditItem(null)}
          onSave={handleEdit}
        />
      )}
    </div>
  )
}

function EditInterestModal({ lang, item, onClose, onSave }) {
  const pt = lang === 'pt'
  const [form, setForm] = useState({
    title: item.title, en: item.en || '', type: item.type, city: item.city,
    hood: item.hood || '', min_p: item.min_p, max_p: item.max_p,
    min_size: item.min_size, min_beds: item.min_beds, notes: item.notes || ''
  })
  const set = (k,v) => setForm(f => ({...f, [k]:v}))

  return (
    <Modal title={pt?'Editar Interesse':'Edit Interest'} onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>{pt?'Cancelar':'Cancel'}</button>
          <button className="btn btn-primary" onClick={() => {
            if (!form.title || !form.city) return
            onSave({ ...item, ...form, min_p: Number(form.min_p)||0, max_p: Number(form.max_p)||0, min_size: Number(form.min_size)||0, min_beds: Number(form.min_beds)||0 })
          }}>{pt?'Salvar':'Save'}</button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">{pt?'Título (PT)':'Title (PT)'}</label>
        <input className="form-input" value={form.title} onChange={e=>set('title',e.target.value)} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div className="form-group">
          <label className="form-label">{pt?'Tipo':'Type'}</label>
          <select className="form-select" value={form.type} onChange={e=>set('type',e.target.value)}>
            <option>Apartamento</option><option>Casa</option><option>Terreno</option><option>Comercial</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{pt?'Cidade':'City'}</label>
          <select className="form-select" value={form.city} onChange={e=>set('city',e.target.value)}>
            <option>São Paulo</option><option>Rio de Janeiro</option><option>Belo Horizonte</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{pt?'Bairro':'Neighborhood'}</label>
          <input className="form-input" value={form.hood} onChange={e=>set('hood',e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">{pt?'Área Mín (m²)':'Min Area (m²)'}</label>
          <input className="form-input" type="number" value={form.min_size} onChange={e=>set('min_size',e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">{pt?'Preço Mín (R$)':'Min Price (R$)'}</label>
          <input className="form-input" type="number" value={form.min_p} onChange={e=>set('min_p',e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">{pt?'Preço Máx (R$)':'Max Price (R$)'}</label>
          <input className="form-input" type="number" value={form.max_p} onChange={e=>set('max_p',e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">{pt?'Quartos Mín':'Min Bedrooms'}</label>
          <input className="form-input" type="number" min="0" value={form.min_beds} onChange={e=>set('min_beds',e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">{pt?'Observações':'Notes'}</label>
        <textarea className="form-input" rows={3} value={form.notes} onChange={e=>set('notes',e.target.value)} />
      </div>
    </Modal>
  )
}
