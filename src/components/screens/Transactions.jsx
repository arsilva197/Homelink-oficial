'use client'
import { Badge } from '../ui'
import { fmtPrice, fmtN } from '../../lib/utils'

export default function ScreenTransactions({ ctx }) {
  const { role, lang, opps, props, openOpp } = ctx
  const pt = lang === 'pt'

  let myOpps = []
  if (role === 'ADMIN') myOpps = opps
  else if (role === 'BROKER') myOpps = opps.filter(o => o.broker_id === 'BRK-01')
  else if (role === 'AGENCY') myOpps = opps.filter(o => o.agency_id === 'AGN-01')
  else {
    const myPids = props.filter(p => p.owner === 'usuario').map(p => p.id)
    myOpps = opps.filter(o => o.participants.some(p => myPids.includes(p.pid)))
  }

  const active = myOpps.filter(o => !['CLOSED','COMMISSION_PAID'].includes(o.status))
  const closed = myOpps.filter(o => ['CLOSED','COMMISSION_PAID'].includes(o.status))

  if (!myOpps.length) return (
    <div className="empty"><div className="icon">💼</div>
      <p>{pt?'Nenhuma transação encontrada.':'No transactions found.'}</p>
    </div>
  )

  const TxnCard = ({ o }) => {
    const myPids = role === 'USUARIO' ? props.filter(p => p.owner === 'usuario').map(p => p.id) : []
    const relevantComms = role === 'USUARIO'
      ? o.commissions.filter(cm => myPids.includes(cm.pid))
      : o.commissions
    const showComm = role !== 'USUARIO' || relevantComms.length > 0
    const totalComm = relevantComms.reduce((s, c) => s + c.amount, 0)
    const isActive = !['CLOSED','COMMISSION_PAID'].includes(o.status)

    return (
      <div className="card" onClick={() => openOpp(o.id)}
        style={{ cursor:'pointer', borderLeft:`3px solid ${isActive?'var(--primary)':'var(--border)'}` }}>
        <div className="card-header">
          <div className="card-title">
            {o.id}
            <span style={{ fontSize:11, fontWeight:400, color:'var(--text3)', marginLeft:6 }}>
              {pt?'Cadeia':'Chain'}: {o.chain}
            </span>
          </div>
          <Badge status={o.status} lang={lang} />
        </div>
        <div className="card-body">
          <div style={{ display:'grid', gridTemplateColumns:`1fr 1fr${showComm?' 1fr':''}`, gap:12 }}>
            <div>
              <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:2 }}>GMV</div>
              <div style={{ fontSize:15, fontWeight:700 }}>R$ {fmtN(o.gmv/1e6)}M</div>
              <div style={{ fontSize:11, color:'var(--text3)' }}>CPS: {o.cps}</div>
            </div>
            <div>
              <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:2 }}>{pt?'Participantes':'Participants'}</div>
              <div style={{ fontSize:15, fontWeight:700 }}>{o.participants.length}</div>
              <div style={{ fontSize:11, color:'var(--text3)' }}>{pt?'Match em':'Match on'}: {o.match_date.slice(0,10)}</div>
            </div>
            {showComm && (
              <div>
                <div style={{ fontSize:10.5, color:'var(--text3)', marginBottom:2 }}>{pt?'Comissão':'Commission'}</div>
                <div style={{ fontSize:15, fontWeight:700, color:'var(--primary)' }}>R$ {fmtN(totalComm/1e3)}k</div>
                <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:2 }}>
                  {relevantComms.map(c => <Badge key={c.ref} status={c.status} lang={lang} />)}
                </div>
              </div>
            )}
          </div>
          <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid var(--border)', fontSize:11.5, color:'var(--text3)' }}>
            {pt?'Clique para ver detalhes da transação':'Click to see transaction details'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {active.length > 0 && <>
        <div style={{ fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:1, color:'var(--primary)' }}>
          {pt?'Ativas':'Active'}
        </div>
        {active.map(o => <TxnCard key={o.id} o={o} />)}
      </>}
      {closed.length > 0 && <>
        <div style={{ fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:1, color:'var(--text3)', marginTop:8 }}>
          {pt?'Concluídas':'Closed'}
        </div>
        {closed.map(o => <TxnCard key={o.id} o={o} />)}
      </>}
    </div>
  )
}
