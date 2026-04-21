'use client'
import { useState, useMemo } from 'react'
import { Badge } from '../ui'
import { fmtPrice } from '../../lib/utils'

export default function ScreenProperties({ ctx }) {
  const { props, lang, setModal } = ctx
  const pt = lang === 'pt'
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [type, setType] = useState('')

  const filtered = useMemo(() => props.filter(p => {
    const nm = (lang==='pt'?p.name:p.en).toLowerCase()
    return (!search || nm.includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase()))
      && (!city || p.city === city)
      && (!type || p.type === type)
  }), [props, search, city, type, lang])

  return (
    <div>
      <div className="filter-bar" style={{ marginBottom:14 }}>
        <input className="search-input" placeholder={pt?'Buscar imóvel...':'Search property...'} value={search} onChange={e=>setSearch(e.target.value)} />
        <select className="filter-select" value={city} onChange={e=>setCity(e.target.value)}>
          <option value="">{pt?'Todas as cidades':'All cities'}</option>
          <option>São Paulo</option><option>Rio de Janeiro</option><option>Belo Horizonte</option>
        </select>
        <select className="filter-select" value={type} onChange={e=>setType(e.target.value)}>
          <option value="">{pt?'Todos os tipos':'All types'}</option>
          <option>Apartamento</option><option>Casa</option><option>Terreno</option><option>Comercial</option>
        </select>
        <span className="filter-count">{pt?'Exibindo':'Showing'} {filtered.length}</span>
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr>
            <th>{pt?'Imóvel':'Property'}</th><th>{pt?'Tipo':'Type'}</th><th>{pt?'Cidade':'City'}</th>
            <th>{pt?'Preço':'Price'}</th><th>Área</th><th>Status</th><th>Cadeia</th>
          </tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} onClick={() => setModal({type:'propDetail',data:p})} style={{ cursor:'pointer' }}>
                <td style={{ fontWeight:600 }}>{lang==='pt'?p.name:p.en}</td>
                <td>{p.type}</td>
                <td>{p.city} — {p.hood}</td>
                <td>{fmtPrice(p.price)}</td>
                <td>{p.size}m²</td>
                <td><Badge status={p.status?.toUpperCase()} lang={lang} /></td>
                <td>{p.chain ? <span style={{ fontWeight:600, color:'var(--blue)' }}>{p.chain}</span> : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
