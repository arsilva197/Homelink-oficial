'use client'
import { useState, useMemo } from 'react'
import { PropCard } from '../ui'

export default function ScreenMarketplace({ ctx }) {
  const { props, lang, role, toggleFav, setModal, t } = ctx
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [type, setType] = useState('')
  const [favOnly, setFavOnly] = useState(false)

  const filtered = useMemo(() => {
    return props.filter(p => {
      const st = p.status?.toLowerCase()
      const available = st === 'ativo' || st === 'match' || st === 'in_negotiation'
      const nm = (lang === 'pt' ? p.name : p.en).toLowerCase()
      return available
        && (!search || nm.includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase()))
        && (!city || p.city === city)
        && (!type || p.type === type)
        && (!favOnly || p.fav)
    })
  }, [props, search, city, type, favOnly, lang])

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <h2 style={{ fontSize:17, fontWeight:700, color:'var(--text1)', margin:'0 0 3px' }}>
          {lang==='pt'?'Imóveis Disponíveis para Venda':'Properties Available for Sale'}
        </h2>
        <p style={{ fontSize:12, color:'var(--text3)', margin:0 }}>
          {lang==='pt'?'Todos os imóveis ativos na plataforma HomeLink':'All active listings on the HomeLink platform'}
        </p>
      </div>

      <div className="filter-bar" style={{ flexWrap:'wrap', gap:8, marginBottom:14 }}>
        <input
          className="search-input"
          placeholder={lang==='pt'?'Buscar...':'Search...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="filter-select" value={city} onChange={e => setCity(e.target.value)}>
          <option value="">{lang==='pt'?'Todas as cidades':'All cities'}</option>
          <option>São Paulo</option>
          <option>Rio de Janeiro</option>
          <option>Belo Horizonte</option>
        </select>
        <select className="filter-select" value={type} onChange={e => setType(e.target.value)}>
          <option value="">{lang==='pt'?'Todos os tipos':'All types'}</option>
          <option>Apartamento</option>
          <option>Casa</option>
          <option>Terreno</option>
          <option>Comercial</option>
        </select>
        <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--text2)', cursor:'pointer' }}>
          <input type="checkbox" checked={favOnly} onChange={e => setFavOnly(e.target.checked)} />
          ❤️ {lang==='pt'?'Favoritos':'Favorites'}
        </label>
        <span className="filter-count">{filtered.length} {lang==='pt'?'imóveis':'properties'}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <div className="icon">🏠</div>
          <p>{lang==='pt'?'Nenhum imóvel encontrado.':'No properties found.'}</p>
        </div>
      ) : (
        <div className="prop-grid">
          {filtered.map((p, i) => (
            <PropCard
              key={p.id}
              prop={p}
              index={props.indexOf(p)}
              canManage={false}
              showFav={true}
              lang={lang}
              role={role}
              hideStatus
              onFavToggle={toggleFav}
              onClick={prop => setModal({ type:'propDetail', data:prop })}
            />
          ))}
        </div>
      )}
    </div>
  )
}
