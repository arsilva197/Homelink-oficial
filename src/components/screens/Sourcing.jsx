'use client'
import { useState } from 'react'
import { Badge } from '../ui'
import { fmtPrice } from '../../lib/utils'

// ── Sourcing ───────────────────────────────────────────────────
export function ScreenSourcing({ ctx }) {
  const { lang, interests, toast } = ctx
  const pt = lang === 'pt'
  const unmatched = interests.filter(i => i.status === 'ATIVO')

  return (
    <div>
      <div style={{ padding:'12px 16px', background:'var(--bg2)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', marginBottom:16, fontSize:12.5, color:'var(--text3)' }}>
        💡 {t_local('sourcing_hint', pt)}
      </div>
      {unmatched.length === 0 ? (
        <div className="empty"><div className="icon">✅</div><p>{pt?'Todos os interesses têm match.':'All interests have matches.'}</p></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {unmatched.map(item => (
            <div key={item.id} className="card">
              <div className="card-header">
                <div className="card-title">{pt?item.title:item.en}</div>
                <Badge status="PENDING" lang={lang} />
              </div>
              <div className="card-body">
                <div style={{ display:'flex', gap:12, fontSize:12.5, marginBottom:12 }}>
                  <span>{item.type}</span>·<span>{item.city}</span>·
                  <span>{fmtPrice(item.min_p)} – {fmtPrice(item.max_p)}</span>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => toast(pt?'Busca externa iniciada (demo)':'External search started (demo)','info')}>
                    🔍 {pt?'Buscar Externamente':'Source Externally'}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => toast(pt?'Interesse dispensado':'Interest dismissed','info')}>
                    {pt?'Dispensar':'Dismiss'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function t_local(key, pt) {
  const map = {
    sourcing_hint: {
      pt: 'Compradores cujos interesses não encontraram match. Admin busca externamente e insere o imóvel via M03.',
      en: 'Buyers whose interests found no match. Admin sources externally and inserts the property via M03.'
    }
  }
  return map[key]?.[pt?'pt':'en'] || key
}

// ── My Brokers (Agency) ────────────────────────────────────────
export function ScreenMyBrokers({ ctx }) {
  const { lang, BROKERS_DATA, opps, toast } = ctx
  const pt = lang === 'pt'
  const myBrokers = BROKERS_DATA.filter(b => b.agency_id === 'AGN-01')

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">{pt?'Meus Corretores':'My Brokers'}</div>
          <button className="btn btn-primary btn-sm" onClick={() => toast(pt?'Convidar corretor (demo)':'Invite broker (demo)','info')}>
            + {pt?'Convidar Corretor':'Invite Broker'}
          </button>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead><tr>
              <th>{pt?'Nome':'Name'}</th><th>CRECI</th>
              <th>{pt?'Oportunidades':'Opportunities'}</th>
              <th>{pt?'Comissão':'Commission'}</th><th>Status</th>
            </tr></thead>
            <tbody>
              {myBrokers.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight:600 }}>{b.name}</td>
                  <td style={{ fontFamily:'monospace', fontSize:11 }}>{b.creci}</td>
                  <td>{opps.filter(o=>o.broker_id===b.id).length}</td>
                  <td style={{ color:'var(--primary)', fontWeight:600 }}>{fmtPrice(b.commission||0)}</td>
                  <td><Badge status={b.status} lang={lang} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Admin Users ────────────────────────────────────────────────
export function ScreenAdminUsers({ ctx }) {
  const [tab, setTab] = useState('users')
  const { lang, USERS_DATA, BROKERS_DATA, AGENCIES_DATA, opps, toast } = ctx
  const pt = lang === 'pt'

  const tabs = [
    { id:'users', label: pt?'Usuários':'Users' },
    { id:'brokers', label: pt?'Corretores':'Brokers' },
    { id:'agencies', label: pt?'Imobiliárias':'Agencies' },
  ]

  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {tabs.map(t => (
          <button key={t.id}
            className={`btn btn-sm ${tab===t.id?'btn-primary':'btn-secondary'}`}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="card">
          <table className="data-table">
            <thead><tr>
              <th>{pt?'Nome':'Name'}</th><th>Email</th><th>{pt?'Imóveis':'Props'}</th>
              <th>Matches</th><th>Status</th><th>{pt?'Ações':'Actions'}</th>
            </tr></thead>
            <tbody>
              {USERS_DATA.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight:600 }}>{u.name}</td>
                  <td style={{ fontSize:12, color:'var(--text3)' }}>{u.email}</td>
                  <td>{u.props}</td>
                  <td>{u.matches}</td>
                  <td><Badge status={u.status} lang={lang} /></td>
                  <td>
                    <div style={{ display:'flex', gap:4 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => toast('Editando '+u.name,'info')}>✏</button>
                      <button className="btn btn-secondary btn-sm"
                        style={{ color: u.status==='active'?'var(--red)':'var(--green)' }}
                        onClick={() => toast((u.status==='active'?'Suspendendo ':'Ativando ')+u.name,'info')}>
                        {u.status==='active'?'🚫':'✓'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'brokers' && (
        <div className="card">
          <table className="data-table">
            <thead><tr>
              <th>{pt?'Nome':'Name'}</th><th>CRECI</th><th>{pt?'Imobiliária':'Agency'}</th>
              <th>{pt?'Opps':'Opps'}</th><th>Status</th><th>{pt?'Ações':'Actions'}</th>
            </tr></thead>
            <tbody>
              {BROKERS_DATA.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight:600 }}>{b.name}</td>
                  <td style={{ fontFamily:'monospace', fontSize:11 }}>{b.creci}</td>
                  <td style={{ fontSize:12 }}>{b.agency||'—'}</td>
                  <td>{opps.filter(o=>o.broker_id===b.id).length}</td>
                  <td><Badge status={b.status} lang={lang} /></td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => toast('Editando '+b.name,'info')}>✏</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'agencies' && (
        <div className="card">
          <table className="data-table">
            <thead><tr>
              <th>{pt?'Nome':'Name'}</th><th>{pt?'Corretores':'Brokers'}</th>
              <th>{pt?'Opps':'Opps'}</th><th>{pt?'Comissão':'Commission'}</th>
              <th>Status</th><th>{pt?'Ações':'Actions'}</th>
            </tr></thead>
            <tbody>
              {AGENCIES_DATA.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight:600 }}>{a.name}</td>
                  <td>{a.brokers.length}</td>
                  <td>{opps.filter(o=>o.agency_id===a.id).length}</td>
                  <td style={{ color:'var(--primary)', fontWeight:600 }}>{fmtPrice(a.commission||0)}</td>
                  <td><Badge status={a.status} lang={lang} /></td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => toast('Editando '+a.name,'info')}>✏</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ScreenSourcing
