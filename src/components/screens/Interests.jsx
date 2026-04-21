'use client'
import { Badge } from '../ui'
import { fmtPrice } from '../../lib/utils'

export default function ScreenInterests({ ctx }) {
  const { role, lang, interests, setModal, t } = ctx
  const pt = lang === 'pt'
  const ownerKey = role==='BROKER'?'broker':role==='AGENCY'?'agency':'usuario'
  const myInts = interests.filter(i => i.owner === ownerKey)

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
          {myInts.map(item => (
            <div key={item.id} className="card">
              <div className="card-header">
                <div className="card-title">{lang==='pt'?item.title:item.en}</div>
                <Badge status={item.status} lang={lang} />
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
          ))}
        </div>
      )}
    </div>
  )
}
