'use client'
import { useState } from 'react'
import { getBadgeClass, getBadgeLabel, fmtPrice, PROP_GRADIENTS, PROP_ICONS } from '../lib/utils'

// ── Badge ──────────────────────────────────────────────────────
export function Badge({ status, lang='pt' }) {
  return (
    <span className={`badge ${getBadgeClass(status)}`}>
      {getBadgeLabel(status, lang)}
    </span>
  )
}

// ── Metric Row ────────────────────────────────────────────────
export function MetricRow({ label, value }) {
  return (
    <div className="metric-row">
      <span className="metric-name">{label}</span>
      <span className="metric-value">{value}</span>
    </div>
  )
}

// ── KPI Card ──────────────────────────────────────────────────
export function KpiCard({ label, value, sub, icon, color, onClick }) {
  return (
    <div className="kpi" onClick={onClick}
      style={{ borderLeft: `3px solid ${color || 'var(--primary)'}`, cursor: onClick ? 'pointer' : 'default', transition:'transform 0.15s, box-shadow 0.15s' }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 4px 14px rgba(0,0,0,.12)' } }}
      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}
    >
      <div className="kpi-icon">{icon}</div>
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
        {onClick && <div style={{ fontSize:9.5, color:'var(--text4)', marginTop:2 }}>Ver detalhes →</div>}
      </div>
    </div>
  )
}

// ── Property Card ─────────────────────────────────────────────
export function PropCard({ prop, index, canManage, showFav, lang='pt', role, onFavToggle, onClick, onEdit }) {
  const gi = index % PROP_GRADIENTS.length
  const [c1, c2] = PROP_GRADIENTS[gi]
  const icon = PROP_ICONS[index % PROP_ICONS.length]
  const st = prop.status?.toUpperCase()

  return (
    <div className="prop-card" onClick={() => onClick && onClick(prop)}>
      <div className="prop-img" style={{ position:'relative' }}>
        {prop.photos?.[0] ? (
          <img src={prop.photos[0]} alt={prop.name}
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}
          />
        ) : null}
        <div style={{
          width:'100%', height:'100%',
          background: `linear-gradient(135deg,${c1},${c2})`,
          display: prop.photos?.[0] ? 'none' : 'flex',
          alignItems:'center', justifyContent:'center', fontSize:'52px'
        }}>{icon}</div>
        {showFav && (
          <span
            onClick={e => { e.stopPropagation(); onFavToggle && onFavToggle(prop.id) }}
            style={{ position:'absolute', top:8, left:8, cursor:'pointer', fontSize:17, filter:'drop-shadow(0 1px 2px rgba(0,0,0,.4))' }}
          >
            {prop.fav ? '❤️' : '🤍'}
          </span>
        )}
        <div className="prop-img-badge">
          <Badge status={st} lang={lang} />
          {prop.chain && role !== 'USUARIO' && (
            <span style={{ marginLeft:3, background:'var(--blue)', color:'#fff', fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:4 }}>
              {prop.chain}
            </span>
          )}
        </div>
      </div>
      <div className="prop-body">
        <div className="prop-name">{lang==='pt' ? prop.name : prop.en}</div>
        <div className="prop-loc">📍 {prop.hood}, {prop.city}</div>
        <div className="prop-price">{fmtPrice(prop.price)}</div>
        <div className="prop-meta">
          <span>🛏 {prop.beds}{lang==='pt'?' qts':' bds'}</span>
          <span>🚿 {prop.baths}{lang==='pt'?' bnh':' bth'}</span>
          <span>📐 {prop.size}m²</span>
          {prop.park > 0 && <span>🚗 {prop.park}</span>}
        </div>
        {canManage && (
          <div style={{ display:'flex', gap:6, marginTop:8, paddingTop:8, borderTop:'1px solid var(--border)' }}>
            <button className="btn btn-secondary btn-sm"
              onClick={e => { e.stopPropagation(); onEdit && onEdit(prop) }}
              style={{ flex:1, fontSize:11 }}>
              {lang==='pt'?'Editar':'Edit'}
            </button>
            <button className="btn btn-secondary btn-sm"
              onClick={e => { e.stopPropagation() }}
              style={{ fontSize:11 }}>
              {prop.status?.toLowerCase()==='ativo'?'⏸':'▶'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────
export function Modal({ title, children, footer, onClose }) {
  if (!title && !children) return null
  return (
    <div id="modal-overlay" onClick={e => { if(e.target.id==='modal-overlay') onClose?.() }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}>
      <div className="modal" style={{ width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto' }}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────
export function ToastContainer({ toasts }) {
  return (
    <div className="toast-wrap" id="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type} show`}>{t.message}</div>
      ))}
    </div>
  )
}

// ── Pipeline Steps (improved visual layout) ───────────────────
const STAGE_LABELS = {
  PENDING_REVIEW:     { pt:'Aguardando\nRevisão',  icon:'⏳' },
  APPROVED:           { pt:'Aprovado',             icon:'✅' },
  ASSIGNED:           { pt:'Atribuído',            icon:'👤' },
  IN_NEGOTIATION:     { pt:'Em\nNegociação',       icon:'🤝' },
  CONCRETIZADA:       { pt:'Concretizada',         icon:'🏆' },
  DUE_DILIGENCE:      { pt:'Due\nDiligence',       icon:'📋' },
  COMMISSION_PENDING: { pt:'Comissão\nPendente',   icon:'💳' },
  COMMISSION_PAID:    { pt:'Comissão\nPaga',       icon:'💰' },
  CLOSED:             { pt:'Encerrado',            icon:'🔒' },
}

export function PipelineSteps({ stages, currentSi }) {
  return (
    <div style={{ overflowX:'auto', paddingBottom:4 }}>
      <div style={{ display:'flex', alignItems:'flex-start', minWidth: stages.length * 100, position:'relative', paddingTop:8 }}>
        {stages.map((stage, i) => {
          const isDone = i < currentSi
          const isActive = i === currentSi
          const meta = STAGE_LABELS[stage] || { pt: stage.replace(/_/g,' '), en: stage.replace(/_/g,' '), icon:'📌' }
          const dotColor = isDone ? 'var(--green)' : isActive ? 'var(--primary)' : 'var(--border)'
          const textColor = isDone ? 'var(--green)' : isActive ? 'var(--primary)' : 'var(--text4)'

          return (
            <div key={stage} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', position:'relative', minWidth:80 }}>
              {/* Connector line left */}
              {i > 0 && (
                <div style={{
                  position:'absolute', top:18, right:'50%', left:'-50%', height:2,
                  background: isDone ? 'var(--green)' : 'var(--border)', zIndex:0,
                  transition:'background 0.3s'
                }} />
              )}

              {/* Circle */}
              <div style={{
                width:36, height:36, borderRadius:'50%', position:'relative', zIndex:1,
                background: isActive ? 'var(--primary)' : isDone ? 'var(--green)' : 'var(--bg2)',
                border: `2.5px solid ${dotColor}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:16, transition:'all 0.3s',
                boxShadow: isActive ? '0 0 0 4px rgba(99,102,241,.2)' : 'none'
              }}>
                {isDone ? (
                  <span style={{ fontSize:16, color:'#fff' }}>✓</span>
                ) : (
                  <span style={{ fontSize:isActive?16:14, filter: isActive?'none':'grayscale(0.6)' }}>
                    {meta.icon}
                  </span>
                )}
              </div>

              {/* Label */}
              <div style={{
                marginTop:8, fontSize:9.5, fontWeight: isActive ? 700 : 500,
                color: textColor, textAlign:'center', lineHeight:1.35,
                whiteSpace:'pre-line', maxWidth:72
              }}>
                {meta.pt || meta.en || stage}
              </div>

              {/* Step number */}
              <div style={{ fontSize:8.5, color:'var(--text4)', marginTop:2 }}>
                {i+1}/{stages.length}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Price Range Slider ────────────────────────────────────────
export function PriceRangeSlider({ minVal, maxVal, onMinChange, onMaxChange, step=50000, min=0, max=10000000, hideInputs=false }) {
  const fmtBRL = v => {
    if (!v && v !== 0) return 'R$ 0'
    if (v >= 1000000) return 'R$ ' + (v/1000000).toFixed(1).replace(/\.?0+$/,'') + 'M'
    if (v >= 1000) return 'R$ ' + (v/1000).toFixed(0) + 'k'
    return 'R$ ' + v
  }
  const minPct = ((minVal - min) / (max - min)) * 100
  const maxPct = ((maxVal - min) / (max - min)) * 100

  return (
    <div style={{ padding:'4px 0 8px' }}>
      {/* Labels */}
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:12 }}>
        <span style={{ fontWeight:700, color:'var(--primary)' }}>{fmtBRL(minVal)}</span>
        <span style={{ fontWeight:700, color:'var(--primary)' }}>{fmtBRL(maxVal)}</span>
      </div>
      {/* Track */}
      <div style={{ position:'relative', height:6, marginBottom:12 }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:6, background:'var(--border)', borderRadius:3 }} />
        <div style={{ position:'absolute', top:0, left:`${minPct}%`, right:`${100-maxPct}%`, height:6, background:'var(--primary)', borderRadius:3 }} />
        {/* Min thumb */}
        <input type="range" min={min} max={max} step={step} value={minVal}
          onChange={e => { const v = Math.min(Number(e.target.value), maxVal - step); onMinChange(v) }}
          style={{ position:'absolute', width:'100%', height:6, appearance:'none', background:'transparent', cursor:'pointer', pointerEvents:'all', margin:0, padding:0, top:0 }}
        />
        {/* Max thumb */}
        <input type="range" min={min} max={max} step={step} value={maxVal}
          onChange={e => { const v = Math.max(Number(e.target.value), minVal + step); onMaxChange(v) }}
          style={{ position:'absolute', width:'100%', height:6, appearance:'none', background:'transparent', cursor:'pointer', pointerEvents:'all', margin:0, padding:0, top:0 }}
        />
      </div>
      {/* Manual inputs */}
      {!hideInputs && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:6, alignItems:'center' }}>
          <input className="form-input" type="number" value={minVal} step={step} min={min} max={maxVal - step}
            onChange={e => onMinChange(Math.max(min, Math.min(Number(e.target.value), maxVal - step)))}
            style={{ fontSize:12, padding:'5px 8px' }} placeholder="Mín" />
          <span style={{ fontSize:11, color:'var(--text3)' }}>até</span>
          <input className="form-input" type="number" value={maxVal} step={step} min={minVal + step} max={max}
            onChange={e => onMaxChange(Math.min(max, Math.max(Number(e.target.value), minVal + step)))}
            style={{ fontSize:12, padding:'5px 8px' }} placeholder="Máx" />
        </div>
      )}
    </div>
  )
}

// ── Neighborhood Multi-Select ─────────────────────────────────
export const HOODS_BY_CITY = {
  'São Paulo': ['Jardins','Vila Madalena','Moema','Pinheiros','Consolação','Paulista','Higienópolis','Alphaville','Itaim Bibi','Centro','Bela Vista','Perdizes','Vila Mariana','Tatuapé','Lapa','Saúde','Campo Belo','Brooklin'],
  'Rio de Janeiro': ['Ipanema','Leblon','Copacabana','Botafogo','Barra da Tijuca','Flamengo','Tijuca','Santa Teresa','Glória','Centro','Recreio','Jacarepaguá','Urca'],
  'Belo Horizonte': ['Savassi','Lourdes','Funcionários','Buritis','Belvedere','Pampulha','Centro','Santo Antônio','Mangabeiras','Cidade Nova','Serra'],
  'Curitiba': ['Batel','Água Verde','Bigorrilho','Centro','Alto da Glória','Champagnat','Ecoville','Mercês','Ahú'],
  'Porto Alegre': ['Moinhos de Vento','Bela Vista','Petrópolis','Bom Fim','Centro','Higienópolis','Auxiliadora','Boa Vista'],
  'Salvador': ['Barra','Ondina','Rio Vermelho','Pituba','Graça','Vitória','Itaigara','Costa Azul'],
  'Fortaleza': ['Meireles','Aldeota','Iracema','Cocó','Varjota','Guararapes','Fátima'],
  'Recife': ['Boa Viagem','Graças','Casa Forte','Derby','Espinheiro','Aflitos','Torre'],
}

export function NeighborhoodPicker({ city, selected, onChange }) {
  const [open, setOpen] = useState(false)
  const hoods = HOODS_BY_CITY[city] || []
  const toggle = (h) => {
    if (selected.includes(h)) onChange(selected.filter(x => x !== h))
    else onChange([...selected, h])
  }
  if (!hoods.length) return null
  return (
    <div style={{ position:'relative' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ padding:'8px 10px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', cursor:'pointer', fontSize:13, background:'var(--bg1)', display:'flex', justifyContent:'space-between', alignItems:'center' }}
      >
        <span style={{ color: selected.length ? 'var(--text1)' : 'var(--text3)' }}>
          {selected.length === 0 ? 'Selecione bairros...' : selected.length === 1 ? selected[0] : `${selected.length} bairros selecionados`}
        </span>
        <span style={{ fontSize:10, color:'var(--text3)' }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'var(--bg1)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', zIndex:200, maxHeight:200, overflowY:'auto', boxShadow:'0 4px 16px rgba(0,0,0,.15)' }}>
          {hoods.map(h => (
            <label key={h} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 12px', cursor:'pointer', fontSize:13, borderBottom:'1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.background='var(--bg2)'}
              onMouseLeave={e => e.currentTarget.style.background=''}>
              <input type="checkbox" checked={selected.includes(h)} onChange={() => toggle(h)} style={{ cursor:'pointer' }} />
              {h}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

// ── CSV Import Modal ──────────────────────────────────────────
export function ImportModal({ lang='pt', onClose, onImport }) {
  const pt = lang === 'pt'
  return (
    <Modal
      title={pt ? 'Importar Imóveis — CSV' : 'Import Properties — CSV'}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>{pt?'Cancelar':'Cancel'}</button>
          <button className="btn btn-primary" onClick={onImport}>⬆ {pt?'Importar':'Import'}</button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">{pt?'Arquivo CSV':'CSV File'}</label>
        <input type="file" accept=".csv" className="form-input" id="csv-file-input" />
      </div>
      <div className="form-group">
        <label className="form-label">{pt?'Modo de Importação':'Import Mode'}</label>
        <select className="form-select">
          <option value="INSERT_ONLY">{pt?'Inserir apenas novos':'Insert new only'}</option>
          <option value="UPSERT">{pt?'Inserir e atualizar':'Insert & update'}</option>
          <option value="REPLACE_ALL">{pt?'Substituir todos':'Replace all'}</option>
        </select>
      </div>
      <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer', marginTop:4 }}>
        <input type="checkbox" id="imp-terms" /> {pt?'Aceito os termos de comissão de 6%':'I accept the 6% commission terms'}
      </label>

      <div style={{ marginTop:14, padding:12, background:'var(--bg2)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)' }}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1, color:'var(--text3)', marginBottom:8 }}>
          📋 {pt?'Layout do Arquivo CSV':'CSV File Layout'}
        </div>
        <div style={{ fontSize:11, color:'var(--text2)', lineHeight:1.8, fontFamily:'monospace' }}>
          <b>{pt?'Colunas obrigatórias':'Required columns'}:</b><br/>
          {pt?'titulo, tipo, cidade, bairro, preco, area_m2':'title, type, city, neighborhood, price, area_sqm'}<br/><br/>
          <b>{pt?'Colunas opcionais':'Optional columns'}:</b><br/>
          {pt?'quartos, banheiros, vagas, status, descricao':'bedrooms, bathrooms, parking, status, description'}<br/><br/>
          <b>{pt?'Valores aceitos — tipo':'Accepted values — type'}:</b><br/>
          Apartamento | Casa | Terreno | Comercial<br/><br/>
          <b>{pt?'Exemplo de linha':'Sample row'}:</b><br/>
          <span style={{ color:'var(--primary)' }}>
            {pt?'Apto Centro,Apartamento,São Paulo,Centro,450000,65,2,1,1,ativo':'Downtown Apt,Apartamento,São Paulo,Centro,450000,65,2,1,1,ativo'}
          </span>
        </div>
        <div style={{ marginTop:8, fontSize:10.5, color:'var(--text3)' }}>
          ⚠ {pt?'Primeira linha deve ser o cabeçalho. Separador: vírgula. Encoding: UTF-8.':'First row must be the header. Separator: comma. Encoding: UTF-8.'}
        </div>
      </div>
    </Modal>
  )
}
