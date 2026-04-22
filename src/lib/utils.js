// HomeLink — Utility functions

export const BADGE_MAP = {
  PENDING_REVIEW:'b-pending', APPROVED:'b-approved', ASSIGNED:'b-approved',
  IN_NEGOTIATION:'b-negotiation', CONCRETIZADA:'b-concretizada',
  DUE_DILIGENCE:'b-negotiation',
  COMMISSION_PENDING:'b-commission', COMMISSION_PAID:'b-paid',
  CLOSED:'b-closed', CANCELLED:'b-cancelled', OVERDUE:'b-overdue',
  PENDING:'b-pending', PAID:'b-paid',
  ATIVO:'b-active', MATCH:'b-concretizada', PAUSADO:'b-cancelled', CANCELADO:'b-cancelled',
  active:'b-active', suspended:'b-overdue', pending:'b-pending', blocked:'b-cancelled',
  pendente:'b-pending', aprovado:'b-approved', rejeitado:'b-cancelled',
  PENDENTE:'b-pending', BUSCANDO:'b-negotiation', RESOLVIDO:'b-active', DISPENSADO:'b-closed',
};

export const BADGE_LABELS = {
  PENDING_REVIEW:{pt:'Aguardando',en:'Pending'}, APPROVED:{pt:'Aprovado',en:'Approved'},
  ASSIGNED:{pt:'Atribuído',en:'Assigned'}, IN_NEGOTIATION:{pt:'Em Negociação',en:'In Negotiation'},
  CONCRETIZADA:{pt:'Concretizada',en:'Concretized'}, DUE_DILIGENCE:{pt:'Due Diligence',en:'Due Diligence'},
  COMMISSION_PENDING:{pt:'Com. Pendente',en:'Comm. Pending'},
  COMMISSION_PAID:{pt:'Com. Paga',en:'Comm. Paid'}, CLOSED:{pt:'Encerrado',en:'Closed'},
  OVERDUE:{pt:'Vencida',en:'Overdue'}, PENDING:{pt:'Pendente',en:'Pending'}, PAID:{pt:'Paga',en:'Paid'},
  ATIVO:{pt:'Ativo',en:'Active'}, MATCH:{pt:'Match',en:'Match'}, PAUSADO:{pt:'Pausado',en:'Paused'},
  CANCELADO:{pt:'Cancelado',en:'Cancelled'},
  active:{pt:'Ativo',en:'Active'}, suspended:{pt:'Suspenso',en:'Suspended'},
  pending:{pt:'Pendente',en:'Pending'}, blocked:{pt:'Bloqueado',en:'Blocked'},
  pendente:{pt:'Pendente',en:'Pending'}, aprovado:{pt:'Aprovado',en:'Approved'},
  rejeitado:{pt:'Rejeitado',en:'Rejected'},
  PENDENTE:{pt:'Pendente',en:'Pending'}, BUSCANDO:{pt:'Buscando',en:'Searching'},
  RESOLVIDO:{pt:'Resolvido',en:'Resolved'}, DISPENSADO:{pt:'Dispensado',en:'Dismissed'},
};

export function getBadgeClass(s) { return BADGE_MAP[s] || 'b-closed'; }
export function getBadgeLabel(s, lang='pt') {
  return BADGE_LABELS[s] ? BADGE_LABELS[s][lang] : s;
}

export function fmtPrice(v) {
  if (!v && v !== 0) return '—';
  if (v >= 1000000) return 'R$ ' + (v/1000000).toFixed(2).replace(/\.?0+$/, '') + 'M';
  return 'R$ ' + (v/1000).toFixed(0) + 'K';
}

export function fmtN(v) {
  if (!v && v !== 0) return '0';
  if (Math.abs(v) >= 1000) return (v/1000).toFixed(1).replace(/\.?0+$/, '') + 'k';
  return v.toFixed(1).replace(/\.?0+$/, '');
}

export function fmtPct(v) {
  const r = Math.round(v * 4) / 4;
  return r % 1 === 0 ? r.toFixed(0) + '%' : r.toFixed(2).replace(/\.?0+$/, '') + '%';
}

export const T = {
  nav_dashboard:{pt:'Dashboard',en:'Dashboard'},
  nav_marketplace:{pt:'Marketplace',en:'Marketplace'},
  nav_properties:{pt:'Controle de Imóveis',en:'Property Control'},
  nav_my_properties:{pt:'Meus Anúncios',en:'My Listings'},
  nav_interests:{pt:'Meus Interesses',en:'My Interests'},
  nav_opportunities:{pt:'Oportunidades',en:'Opportunities'},
  nav_transactions:{pt:'Transações',en:'Transactions'},
  nav_payments:{pt:'Pagamentos',en:'Payments'},
  nav_analytics:{pt:'Analytics',en:'Analytics'},
  nav_sourcing:{pt:'Sourcing on demand',en:'Sourcing on demand'},
  nav_my_brokers:{pt:'Meus Corretores',en:'My Brokers'},
  nav_agency_analytics:{pt:'Analytics',en:'Analytics'},
  nav_broker_analytics:{pt:'Analytics',en:'Analytics'},
  nav_admin_users:{pt:'Gestão de Usuários',en:'User Management'},
  nav_admin_approvals:{pt:'Aprovações',en:'Approvals'},
  nav_main:{pt:'Principal',en:'Main'},
  nav_ops:{pt:'Operações',en:'Operations'},
  nav_insights:{pt:'Insights',en:'Insights'},
  perfil_ativo:{pt:'Perfil ativo',en:'Active role'},
  ADMIN:{pt:'Admin',en:'Admin'}, BROKER:{pt:'Corretor',en:'Broker'},
  AGENCY:{pt:'Imobiliária',en:'Agency'}, USUARIO:{pt:'Usuário',en:'User'},
  lbl_chain:{pt:'Cadeia',en:'Chain'}, lbl_broker:{pt:'Corretor',en:'Broker'},
  lbl_agency:{pt:'Imobiliária',en:'Agency'}, lbl_status:{pt:'Status',en:'Status'},
  lbl_commission:{pt:'Comissão (6%)',en:'Commission (6%)'},
  lbl_participants:{pt:'Participantes',en:'Participants'},
  lbl_type:{pt:'Tipo',en:'Type'}, lbl_price:{pt:'Preço',en:'Price'},
  lbl_size:{pt:'Área',en:'Area'}, lbl_beds:{pt:'Quartos',en:'Beds'},
  lbl_city:{pt:'Cidade',en:'City'}, lbl_neighborhood:{pt:'Bairro',en:'Neighborhood'},
  btn_save:{pt:'💾 Salvar',en:'💾 Save'}, btn_cancel:{pt:'Cancelar',en:'Cancel'},
  btn_close:{pt:'Fechar',en:'Close'}, btn_back:{pt:'Voltar',en:'Back'},
  btn_add_listing:{pt:'+ Novo Anúncio',en:'+ New Listing'},
  btn_add_interest:{pt:'+ Novo Interesse',en:'+ New Interest'},
  no_listings:{pt:'Nenhum anúncio publicado.',en:'No listings yet.'},
  no_interests:{pt:'Nenhum interesse cadastrado.',en:'No buy interests yet.'},
  interest_hint:{pt:'Descreva o que você procura e o sistema vai buscar os imóveis que atendem às suas expectativas.',en:'Describe what you are looking for and the system will find properties that match your expectations.'},
  demo_label:{pt:'Demo',en:'Demo'},
  import_terms:{pt:'Aceito os termos de comissão de 6%',en:'I accept the 6% commission terms'},
};

export function t(key, lang='pt') {
  return T[key] ? (T[key][lang] || key) : key;
}

export function navLabel(id, lang='pt') {
  const map = {
    marketplace: t('nav_marketplace',lang), dashboard: t('nav_dashboard',lang),
    properties: t('nav_properties',lang), 'my-properties': t('nav_my_properties',lang),
    interests: t('nav_interests',lang), opportunities: t('nav_opportunities',lang),
    transactions: t('nav_transactions',lang), payments: t('nav_payments',lang),
    analytics: t('nav_analytics',lang), sourcing: t('nav_sourcing',lang),
    'my-brokers': t('nav_my_brokers',lang), 'agency-analytics': t('nav_agency_analytics',lang),
    'broker-analytics': t('nav_broker_analytics',lang), admin_users: t('nav_admin_users',lang),
    'admin-approvals': t('nav_admin_approvals',lang),
  };
  return map[id] || id;
}

export function getNav(role) {
  if (role === 'ADMIN') return [
    {section:'nav_main', items:[{id:'marketplace',icon:'🏠'},{id:'dashboard',icon:'⬡'},{id:'properties',icon:'🏘'}]},
    {section:'nav_ops', items:[{id:'admin-approvals',icon:'✅'},{id:'opportunities',icon:'📋'},{id:'payments',icon:'💳'},{id:'sourcing',icon:'🔍'}]},
    {section:'nav_insights', items:[{id:'analytics',icon:'📊'},{id:'admin_users',icon:'👥'}]},
  ];
  if (role === 'BROKER') return [
    {section:'nav_main', items:[{id:'marketplace',icon:'🏠'},{id:'dashboard',icon:'⬡'}]},
    {section:'nav_ops', items:[{id:'my-properties',icon:'🏘'},{id:'interests',icon:'🔍'},{id:'opportunities',icon:'📋'},{id:'transactions',icon:'💼'},{id:'payments',icon:'💳'}]},
    {section:'nav_insights', items:[{id:'broker-analytics',icon:'📊'}]},
  ];
  if (role === 'AGENCY') return [
    {section:'nav_main', items:[{id:'marketplace',icon:'🏠'},{id:'dashboard',icon:'⬡'}]},
    {section:'nav_ops', items:[{id:'my-properties',icon:'🏘'},{id:'interests',icon:'🔍'},{id:'my-brokers',icon:'👥'},{id:'transactions',icon:'💼'},{id:'payments',icon:'💳'}]},
    {section:'nav_insights', items:[{id:'agency-analytics',icon:'📊'}]},
  ];
  // USUARIO — no transactions, no chains
  return [
    {section:'nav_main', items:[{id:'marketplace',icon:'🏠'},{id:'dashboard',icon:'⬡'},{id:'my-properties',icon:'📋'},{id:'interests',icon:'🔍'}]},
  ];
}

export function navBadge(id, role, OPPS, PROPS) {
  if (id === 'transactions') {
    let active = [];
    if (role === 'BROKER') active = OPPS.filter(o => o.broker_id === 'BRK-01' && !['CLOSED','COMMISSION_PAID'].includes(o.status));
    else if (role === 'AGENCY') active = OPPS.filter(o => o.agency_id === 'AGN-01' && !['CLOSED','COMMISSION_PAID'].includes(o.status));
    return active.length;
  }
  if (id === 'opportunities' && role === 'ADMIN') {
    return OPPS.filter(o => o.status === 'PENDING_REVIEW').length;
  }
  if (id === 'admin-approvals' && role === 'ADMIN') {
    return PROPS.filter(p => p.approval_status === 'pending').length;
  }
  return 0;
}

export const PROP_GRADIENTS = [
  ['#667eea','#764ba2'],['#f093fb','#f5576c'],['#4facfe','#00f2fe'],
  ['#43e97b','#38f9d7'],['#fa709a','#fee140'],['#a18cd1','#fbc2eb'],
  ['#fccb90','#d57eeb'],['#a1c4fd','#c2e9fb'],['#fd7043','#ff8a65'],
  ['#26c6da','#00acc1'],['#66bb6a','#43a047'],['#ab47bc','#8e24aa'],
];
export const PROP_ICONS = ['🏢','🏠','🏡','🌃','🏗','🏙','🏘','🌆','🏛','🏬','🏪','🏰'];
