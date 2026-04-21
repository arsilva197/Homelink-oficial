'use client'
import { PropCard } from '../ui'

export default function ScreenMyProperties({ ctx }) {
  const { role, lang, props, toggleFav, setModal, t, navigate } = ctx
  const pt = lang === 'pt'
  const isBroker = role === 'BROKER'
  const isAgency = role === 'AGENCY'
  const canManage = !isBroker

  const myProps = (isBroker || isAgency)
    ? props.filter(p => p.owner === 'outro')
    : props.filter(p => p.owner === 'usuario')

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, gap:8, flexWrap:'wrap' }}>
        <div style={{ fontSize:13.5, fontWeight:600, color:'var(--text1)' }}>
          {pt?'Anúncios Cadastrados':'Listed Properties'}
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
          {canManage && (
            <button className="btn btn-primary btn-sm" onClick={() => setModal({type:'addListing'})}>
              {t('btn_add_listing')}
            </button>
          )}
        </div>
      </div>

      {myProps.length === 0 ? (
        <div className="empty">
          <div className="icon">🏠</div>
          <p>{t('no_listings')}</p>
          {canManage && (
            <button className="btn btn-primary" style={{ marginTop:16 }} onClick={() => setModal({type:'addListing'})}>
              {t('btn_add_listing')}
            </button>
          )}
        </div>
      ) : (
        <div className="prop-grid">
          {myProps.map((p, i) => (
            <PropCard
              key={p.id}
              prop={p}
              index={props.indexOf(p)}
              canManage={canManage}
              showFav={false}
              lang={lang}
              onClick={prop => setModal({type:'propDetail', data:prop})}
              onEdit={prop => setModal({type:'addListing', data:prop})}
            />
          ))}
        </div>
      )}
    </div>
  )
}
