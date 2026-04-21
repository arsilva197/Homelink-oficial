'use client'
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
export function KpiCard({ label, value, sub, icon, color }) {
  return (
    <div className="kpi" style={{ borderLeft: `3px solid ${color || 'var(--primary)'}` }}>
      <div className="kpi-icon">{icon}</div>
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
    </div>
  )
}

// ── Property Card ─────────────────────────────────────────────
export function PropCard({ prop, index, canManage, showFav, lang='pt', onFavToggle, onClick, onEdit }) {
  const gi = index % PROP_GRADIENTS.length
  const [c1, c2] = PROP_GRADIENTS[gi]
  const icon = PROP_ICONS[index % PROP_ICONS.length]
  const st = prop.status?.toUpperCase()

  return (
    <div className="prop-card" onClick={() => onClick && onClick(prop)}>
      <div className="prop-img" style={{ position:'relative' }}>
        <div style={{
          width:'100%', height:'100%',
          background: `linear-gradient(135deg,${c1},${c2})`,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:'52px'
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
          {prop.chain && (
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

// ── Pipeline Steps ────────────────────────────────────────────
export function PipelineSteps({ stages, currentSi }) {
  return (
    <div className="pipeline-steps">
      {stages.map((stage, i) => (
        <div key={stage} className={`ps-step ${i < currentSi ? 'done' : i === currentSi ? 'active' : ''}`}>
          <div className="ps-dot" />
          <div className="ps-label">{stage.replace('_',' ')}</div>
        </div>
      ))}
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

      {/* CSV Layout Instructions */}
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
