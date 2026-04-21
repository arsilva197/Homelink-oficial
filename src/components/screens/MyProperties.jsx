'use client'
import { useState } from 'react'
import { Badge } from '../ui'
import { fmtPrice, PROP_GRADIENTS, PROP_ICONS } from '../../lib/utils'

export default function ScreenMyProperties({ ctx }) {
  const { role, lang, props, toggleFav, setModal, t, navigate, togglePropStatus, BROKERS_DATA, opps } = ctx
  const pt = lang === 'pt'
  const isBroker = role === 'BROKER'
  const isAgency = role === 'AGENCY'
  const isUsuario = role === 'USUARIO'

  const myProps = (isBroker || isAgency)
    ? props.filter(p => p.owner === 'outro')
    : props.filter(p => p.owner === 'usuario')

  // For USUARIO: find which broker is assigned to each property
  const getBrokerForProp = (propId) => {
    const opp = opps.find(o => o.participants.some(p => p.pid === propId) && o.broker_id)
    if (!opp) return null
    return BROKERS_DATA.find(b => b.id === opp.broker_id) || null
  }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, gap:8, flexWrap:'wrap' }}>
        <div style={{ fontSize:13.5, fontWeight:600, color:'var(--text1)' }}>
          {pt?'Anúncios Cadastrados':'Listed Properties'}
          <span style={{ fontSize:11, fontWeight:400, color:'var(--text3)', marginLeft:8 }}>
            {myProps.filter(p=>p.status==='ativo').length} {pt?'ativos':'active'} · {myProps.filter(p=>p.status==='pausado').length} {pt?'pausados':'paused'}
          </span>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {(isBroker || isAgency) && (
            <button className="btn btn-secondary btn-sm" onClick={() => setModal({type:'import'})}>
              ⬆ {pt?'Importar CSV':'Import CSV'}
            </button>
          )}
          {(isBroker || isAgency) && (
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('interests')}>
              🔍 {pt?'Interesses':'Interests'}
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => setModal({type:'addListing'})}>
            {t('btn_add_listing')}
          </button>
        </div>
      </div>

      {myProps.length === 0 ? (
        <div className="empty">
          <div className="icon">🏠</div>
          <p>{t('no_listings')}</p>
          <button className="btn btn-primary" style={{ marginTop:16 }} onClick={() => setModal({type:'addListing'})}>
            {t('btn_add_listing')}
          </button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {myProps.map((p, i) => {
            const gi = props.indexOf(p) % PROP_GRADIENTS.length
            const [c1, c2] = PROP_GRADIENTS[gi]
            const icon = PROP_ICONS[props.indexOf(p) % PROP_ICONS.length]
            const broker = isUsuario ? getBrokerForProp(p.id) : null
            const isActive = p.status === 'ativo'
            const isPaused = p.status === 'pausado'
            const isCancelled = p.status === 'cancelado'

            return (
              <div key={p.id} className="card" style={{
                borderLeft: `3px solid ${isActive ? 'var(--green)' : isPaused ? 'var(--amber)' : 'var(--red)'}`,
                opacity: isCancelled ? 0.65 : 1
              }}>
                <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                  {/* Thumbnail */}
                  <div style={{
                    width:72, height:72, flexShrink:0, borderRadius:8,
                    background:`linear-gradient(135deg,${c1},${c2})`,
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:28
                  }}>
                    {icon}
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                      <div style={{ fontSize:14, fontWeight:700, color:'var(--text1)' }}>
                        {lang==='pt'?p.name:p.en}
                      </div>
                      <Badge status={p.status?.toUpperCase()} lang={lang} />
                      {p.chain && (
                        <span style={{ background:'var(--blue)', color:'#fff', fontSize:9.5, fontWeight:700, padding:'2px 7px', borderRadius:4 }}>
                          🔥 {p.chain}
                        </span>
                      )}
                      {p.approval_status === 'pending' && (
                        <span style={{ background:'var(--amber)', color:'#fff', fontSize:9.5, fontWeight:700, padding:'2px 7px', borderRadius:4 }}>
                          ⏳ {pt?'Aguardando aprovação':'Pending approval'}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize:12, color:'var(--text3)', marginBottom:6 }}>
                      📍 {p.hood}, {p.city} · {p.type}
                    </div>
                    <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
                      <span style={{ fontSize:15, fontWeight:700, color:'var(--primary)' }}>{fmtPrice(p.price)}</span>
                      <span style={{ fontSize:11.5, color:'var(--text3)' }}>🛏 {p.beds} · 🚿 {p.baths} · 📐 {p.size}m²</span>
                    </div>

                    {/* WhatsApp button for USUARIO when there's a broker */}
                    {isUsuario && broker && (
                      <div style={{ marginTop:8, padding:'8px 10px', background:'rgba(37,211,102,.08)', border:'1px solid rgba(37,211,102,.3)', borderRadius:6, display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:16 }}>💬</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:11.5, fontWeight:600, color:'var(--text1)' }}>
                            {pt?'Seu corretor:':'Your broker:'} {broker.name}
                          </div>
                          <div style={{ fontSize:10.5, color:'var(--text3)' }}>
                            {pt?'Clique para abrir conversa no WhatsApp':'Click to open WhatsApp conversation'}
                          </div>
                        </div>
                        <a
                          href={`https://wa.me/${broker.phone}?text=${encodeURIComponent(pt?`Olá ${broker.name}, sou Carlos Mendes e tenho o imóvel ${lang==='pt'?p.name:p.en} cadastrado na plataforma HomeLink. Gostaria de conversar sobre o processo.`:`Hello ${broker.name}, I'm Carlos Mendes and I have the property ${lang==='pt'?p.name:p.en} on HomeLink platform. I'd like to discuss the process.`)}`}
                          target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ display:'flex', alignItems:'center', gap:5, background:'#25d366', color:'#fff', padding:'6px 12px', borderRadius:6, fontSize:12, fontWeight:600, textDecoration:'none', whiteSpace:'nowrap' }}>
                          <span style={{ fontSize:15 }}>📱</span> WhatsApp
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display:'flex', flexDirection:'column', gap:5, flexShrink:0 }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize:11, minWidth:80 }}
                      onClick={() => setModal({type:'addListing', data:p})}
                      disabled={isCancelled}
                    >
                      ✏ {pt?'Editar':'Edit'}
                    </button>
                    {isActive && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize:11, minWidth:80, color:'var(--amber)' }}
                        onClick={() => togglePropStatus && togglePropStatus(p.id, 'pause')}
                      >
                        ⏸ {pt?'Pausar':'Pause'}
                      </button>
                    )}
                    {isPaused && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize:11, minWidth:80, color:'var(--green)' }}
                        onClick={() => togglePropStatus && togglePropStatus(p.id, 'activate')}
                      >
                        ▶ {pt?'Reativar':'Reactivate'}
                      </button>
                    )}
                    {!isCancelled && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize:11, minWidth:80, color:'var(--red)' }}
                        onClick={() => setModal({type:'confirmRemoveProp', data:p})}
                      >
                        🗑 {pt?'Remover':'Remove'}
                      </button>
                    )}
                    {isCancelled && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize:11, minWidth:80, color:'var(--blue)' }}
                        onClick={() => togglePropStatus && togglePropStatus(p.id, 'activate')}
                      >
                        ↩ {pt?'Restaurar':'Restore'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
