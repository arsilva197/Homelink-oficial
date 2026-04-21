// HomeLink Platform — Mock Data

export const ROLES = {
  ADMIN:   { user_pt:'Admin Demo', user_en:'Admin Demo', color:'#e53e3e', badge:'b-overdue' },
  BROKER:  { user_pt:'João Corretor', user_en:'John Broker', color:'#3182ce', badge:'b-approved' },
  AGENCY:  { user_pt:'Imobiliária Paulista', user_en:'Paulista Agency', color:'#38a169', badge:'b-active' },
  USUARIO: { user_pt:'Carlos Mendes', user_en:'Carlos Mendes', color:'#805ad5', badge:'b-negotiation' },
};

export const PROPS = [
  {id:'PROP-001',name:'Apto Jardins',en:'Jardins Apt',type:'Apartamento',city:'São Paulo',hood:'Jardins',price:850000,size:82,beds:2,baths:2,park:1,status:'ativo',chain:'CHN-A',owner:'usuario',fav:false,reg:'2024-09-15',
   approval_status:'approved',
   audit:[
     {date:'2024-09-15',event:'Anúncio criado',user:'Carlos Mendes',type:'created'},
     {date:'2024-09-16',event:'Aprovado pelo Admin',user:'Admin Demo',type:'approved'},
     {date:'2024-09-16',event:'Status: Ativo',user:'Sistema',type:'status'},
     {date:'2024-10-15',event:'Incluído em cadeia CHN-A',user:'Sistema',type:'chain'},
   ]},
  {id:'PROP-002',name:'Casa Perdizes',en:'Perdizes House',type:'Casa',city:'São Paulo',hood:'Perdizes',price:1200000,size:180,beds:3,baths:3,park:2,status:'ativo',chain:'CHN-A',owner:'outro',fav:false,reg:'2024-09-18',
   approval_status:'approved',
   audit:[
     {date:'2024-09-18',event:'Anúncio criado',user:'João Corretor',type:'created'},
     {date:'2024-09-19',event:'Aprovado pelo Admin',user:'Admin Demo',type:'approved'},
     {date:'2024-09-19',event:'Status: Ativo',user:'Sistema',type:'status'},
     {date:'2024-10-15',event:'Incluído em cadeia CHN-A',user:'Sistema',type:'chain'},
   ]},
  {id:'PROP-003',name:'Apto Vila Madalena',en:'Vila Madalena',type:'Apartamento',city:'São Paulo',hood:'Vila Madalena',price:720000,size:68,beds:2,baths:1,park:1,status:'ativo',chain:'CHN-A',owner:'outro',fav:true,reg:'2024-09-20',
   approval_status:'approved',
   audit:[
     {date:'2024-09-20',event:'Anúncio criado',user:'Imobiliária Paulista',type:'created'},
     {date:'2024-09-21',event:'Aprovado pelo Admin',user:'Admin Demo',type:'approved'},
     {date:'2024-09-21',event:'Status: Ativo',user:'Sistema',type:'status'},
     {date:'2024-10-15',event:'Incluído em cadeia CHN-A',user:'Sistema',type:'chain'},
   ]},
  {id:'PROP-004',name:'Apto Ipanema',en:'Ipanema Apt',type:'Apartamento',city:'Rio de Janeiro',hood:'Ipanema',price:1650000,size:95,beds:3,baths:2,park:1,status:'ativo',chain:'CHN-B',owner:'outro',fav:false,reg:'2024-09-22',
   approval_status:'approved',
   audit:[
     {date:'2024-09-22',event:'Anúncio criado',user:'João Corretor',type:'created'},
     {date:'2024-09-23',event:'Aprovado pelo Admin',user:'Admin Demo',type:'approved'},
     {date:'2024-09-23',event:'Status: Ativo',user:'Sistema',type:'status'},
     {date:'2024-10-28',event:'Incluído em cadeia CHN-B',user:'Sistema',type:'chain'},
   ]},
  {id:'PROP-005',name:'Cobertura Leblon',en:'Leblon Penthouse',type:'Apartamento',city:'Rio de Janeiro',hood:'Leblon',price:4200000,size:280,beds:4,baths:4,park:3,status:'pausado',chain:null,owner:'outro',fav:false,reg:'2024-09-25',
   approval_status:'approved',
   audit:[
     {date:'2024-09-25',event:'Anúncio criado',user:'RJ Imóveis',type:'created'},
     {date:'2024-09-26',event:'Aprovado pelo Admin',user:'Admin Demo',type:'approved'},
     {date:'2024-09-26',event:'Status: Ativo',user:'Sistema',type:'status'},
     {date:'2024-10-10',event:'Status: Pausado',user:'RJ Imóveis',type:'status'},
   ]},
  {id:'PROP-006',name:'Apto Savassi',en:'Savassi Apt',type:'Apartamento',city:'Belo Horizonte',hood:'Savassi',price:580000,size:65,beds:2,baths:1,park:1,status:'ativo',chain:'CHN-B',owner:'outro',fav:false,reg:'2024-09-28',
   approval_status:'approved',
   audit:[
     {date:'2024-09-28',event:'Anúncio criado',user:'BH Prime',type:'created'},
     {date:'2024-09-29',event:'Aprovado pelo Admin',user:'Admin Demo',type:'approved'},
     {date:'2024-09-29',event:'Status: Ativo',user:'Sistema',type:'status'},
     {date:'2024-10-28',event:'Incluído em cadeia CHN-B',user:'Sistema',type:'chain'},
   ]},
  {id:'PROP-007',name:'Casa Lourdes',en:'Lourdes House',type:'Casa',city:'Belo Horizonte',hood:'Lourdes',price:890000,size:160,beds:3,baths:2,park:2,status:'ativo',chain:'CHN-C',owner:'outro',fav:false,reg:'2024-10-02',
   approval_status:'approved',
   audit:[
     {date:'2024-10-02',event:'Anúncio criado',user:'BH Prime',type:'created'},
     {date:'2024-10-03',event:'Aprovado pelo Admin',user:'Admin Demo',type:'approved'},
     {date:'2024-10-03',event:'Status: Ativo',user:'Sistema',type:'status'},
     {date:'2024-11-05',event:'Incluído em cadeia CHN-C',user:'Sistema',type:'chain'},
   ]},
  {id:'PROP-008',name:'Studio Pinheiros',en:'Pinheiros Studio',type:'Apartamento',city:'São Paulo',hood:'Pinheiros',price:420000,size:38,beds:1,baths:1,park:0,status:'pausado',chain:null,owner:'outro',fav:false,reg:'2024-10-05',
   approval_status:'approved',
   audit:[
     {date:'2024-10-05',event:'Anúncio criado',user:'João Corretor',type:'created'},
     {date:'2024-10-06',event:'Aprovado pelo Admin',user:'Admin Demo',type:'approved'},
     {date:'2024-10-06',event:'Status: Ativo',user:'Sistema',type:'status'},
     {date:'2024-10-20',event:'Status: Pausado',user:'João Corretor',type:'status'},
   ]},
  {id:'PROP-009',name:'Apto Botafogo',en:'Botafogo Apt',type:'Apartamento',city:'Rio de Janeiro',hood:'Botafogo',price:980000,size:88,beds:3,baths:2,park:1,status:'ativo',chain:'CHN-C',owner:'outro',fav:true,reg:'2024-10-08',
   approval_status:'approved',
   audit:[
     {date:'2024-10-08',event:'Anúncio criado',user:'RJ Imóveis',type:'created'},
     {date:'2024-10-09',event:'Aprovado pelo Admin',user:'Admin Demo',type:'approved'},
     {date:'2024-10-09',event:'Status: Ativo',user:'Sistema',type:'status'},
     {date:'2024-11-05',event:'Incluído em cadeia CHN-C',user:'Sistema',type:'chain'},
   ]},
  {id:'PROP-010',name:'Casa Moema',en:'Moema House',type:'Casa',city:'São Paulo',hood:'Moema',price:1450000,size:220,beds:4,baths:3,park:2,status:'ativo',chain:null,owner:'usuario',fav:false,reg:'2024-11-08',
   approval_status:'approved',
   audit:[
     {date:'2024-11-08',event:'Anúncio criado',user:'Carlos Mendes',type:'created'},
     {date:'2024-11-09',event:'Aprovado pelo Admin',user:'Admin Demo',type:'approved'},
     {date:'2024-11-09',event:'Status: Ativo',user:'Sistema',type:'status'},
   ]},
  {id:'PROP-011',name:'Apto Copacabana',en:'Copacabana Apt',type:'Apartamento',city:'Rio de Janeiro',hood:'Copacabana',price:680000,size:70,beds:2,baths:1,park:1,status:'ativo',chain:'CHN-D',owner:'outro',fav:false,reg:'2024-11-10',
   approval_status:'approved',
   audit:[
     {date:'2024-11-10',event:'Anúncio criado',user:'RJ Imóveis',type:'created'},
     {date:'2024-11-11',event:'Aprovado pelo Admin',user:'Admin Demo',type:'approved'},
     {date:'2024-11-11',event:'Status: Ativo',user:'Sistema',type:'status'},
     {date:'2024-11-20',event:'Incluído em cadeia CHN-D',user:'Sistema',type:'chain'},
   ]},
  {id:'PROP-012',name:'Sala Comercial SP',en:'SP Commercial',type:'Comercial',city:'São Paulo',hood:'Paulista',price:380000,size:45,beds:0,baths:1,park:1,status:'pausado',chain:null,owner:'outro',fav:false,reg:'2024-11-15',
   approval_status:'approved',
   audit:[
     {date:'2024-11-15',event:'Anúncio criado',user:'Imobiliária Paulista',type:'created'},
     {date:'2024-11-16',event:'Aprovado pelo Admin',user:'Admin Demo',type:'approved'},
     {date:'2024-11-16',event:'Status: Ativo',user:'Sistema',type:'status'},
     {date:'2024-11-18',event:'Status: Pausado',user:'Imobiliária Paulista',type:'status'},
   ]},
  {id:'PROP-013',name:'Apto Consolação',en:'Consolação Apt',type:'Apartamento',city:'São Paulo',hood:'Consolação',price:650000,size:72,beds:2,baths:1,park:1,status:'pendente',chain:null,owner:'outro',fav:false,reg:'2024-11-22',
   approval_status:'pending',
   audit:[
     {date:'2024-11-22',event:'Anúncio criado — aguardando aprovação',user:'Novo Vendedor',type:'created'},
   ]},
  {id:'PROP-014',name:'Casa Alphaville',en:'Alphaville House',type:'Casa',city:'São Paulo',hood:'Alphaville',price:1850000,size:310,beds:4,baths:4,park:3,status:'pendente',chain:null,owner:'outro',fav:false,reg:'2024-11-23',
   approval_status:'pending',
   audit:[
     {date:'2024-11-23',event:'Anúncio criado — aguardando aprovação',user:'João Corretor',type:'created'},
   ]},
];

export const INTERESTS = [
  {id:'INT-001',owner:'usuario',title:'Casa em Vila Mariana',en:'House in Vila Mariana',type:'Casa',city:'São Paulo',hood:'Vila Mariana',min_p:800000,max_p:1300000,min_size:120,min_beds:3,notes:'Prefiro condomínio fechado, área de lazer.',status:'ATIVO',sourcing_status:'PENDENTE'},
  {id:'INT-002',owner:'usuario',title:'Terreno Comercial Paulista',en:'Commercial Land',type:'Comercial',city:'São Paulo',hood:'Paulista',min_p:400000,max_p:700000,min_size:60,min_beds:0,notes:'Para montar escritório.',status:'MATCH',sourcing_status:null},
  {id:'INT-003',owner:'usuario',title:'Apartamento em Savassi',en:'Apt in Savassi',type:'Apartamento',city:'Belo Horizonte',hood:'Savassi',min_p:450000,max_p:650000,min_size:55,min_beds:2,notes:'Andar alto, vaga de garagem.',status:'MATCH',sourcing_status:null},
  {id:'INT-004',owner:'usuario',title:'Casa com Quintal em BH',en:'House with Garden',type:'Casa',city:'Belo Horizonte',hood:'Lourdes',min_p:700000,max_p:1000000,min_size:140,min_beds:3,notes:'Para família. Quintal obrigatório.',status:'ATIVO',sourcing_status:'BUSCANDO'},
  {id:'INT-005',owner:'usuario',title:'Studio no Centro SP',en:'Studio Downtown SP',type:'Apartamento',city:'São Paulo',hood:'Centro',min_p:300000,max_p:500000,min_size:35,min_beds:1,notes:'Investimento para aluguel.',status:'ATIVO',sourcing_status:'PENDENTE'},
  {id:'INT-006',owner:'broker',title:'Cobertura no Leblon',en:'Penthouse in Leblon',type:'Apartamento',city:'Rio de Janeiro',hood:'Leblon',min_p:3000000,max_p:6000000,min_size:200,min_beds:4,notes:'Para cliente VIP — piscina e terraço obrigatórios.',status:'ATIVO',sourcing_status:'PENDENTE'},
  {id:'INT-007',owner:'broker',title:'Casa de Alto Padrão em Higienópolis',en:'Luxury House Higienópolis',type:'Casa',city:'São Paulo',hood:'Higienópolis',min_p:2500000,max_p:4500000,min_size:300,min_beds:4,notes:'Garagem para 4 carros, área gourmet.',status:'ATIVO',sourcing_status:'BUSCANDO'},
  {id:'INT-008',owner:'broker',title:'Flat para Investimento',en:'Investment Flat',type:'Apartamento',city:'São Paulo',hood:'Consolação',min_p:400000,max_p:700000,min_size:40,min_beds:1,notes:'Portfólio de investimentos — renda passiva.',status:'MATCH',sourcing_status:null},
  {id:'INT-009',owner:'agency',title:'Galpão Industrial na Grande SP',en:'Industrial Warehouse Greater SP',type:'Comercial',city:'São Paulo',hood:'Santo André',min_p:2000000,max_p:5000000,min_size:800,min_beds:0,notes:'Para cliente logística. Pé-direito alto.',status:'ATIVO',sourcing_status:'PENDENTE'},
  {id:'INT-010',owner:'agency',title:'Conjunto Comercial na Faria Lima',en:'Office Suite Faria Lima',type:'Comercial',city:'São Paulo',hood:'Itaim Bibi',min_p:1500000,max_p:3000000,min_size:150,min_beds:0,notes:'Escritório corporativo.',status:'ATIVO',sourcing_status:'RESOLVIDO'},
  {id:'INT-011',owner:'agency',title:'Apartamento 3 quartos na Barra',en:'3-bed Apt Barra da Tijuca',type:'Apartamento',city:'Rio de Janeiro',hood:'Barra da Tijuca',min_p:900000,max_p:1600000,min_size:110,min_beds:3,notes:'Lazer completo, vaga dupla.',status:'MATCH',sourcing_status:null},
];

export const CHAINS = [
  {id:'CHN-A',props:3,cps:0.87,gmv:2670000,si:5,status:'COMMISSION_PENDING',match_date:'2024-10-15',participants:['Carlos Mendes','Família Souza','Beatriz Lima'],bridge:{buyer_min:700000,buyer_max:900000,seller_ask:850000,gap:0}},
  {id:'CHN-B',props:2,cps:0.79,gmv:1660000,si:3,status:'IN_NEGOTIATION',match_date:'2024-10-28',participants:['Pedro Alves','Fernanda Costa'],bridge:{buyer_min:500000,buyer_max:680000,seller_ask:720000,gap:40000}},
  {id:'CHN-C',props:2,cps:0.82,gmv:1410000,si:1,status:'APPROVED',match_date:'2024-11-05',participants:['Roberto Silva','Ana Ferreira'],bridge:{buyer_min:800000,buyer_max:950000,seller_ask:890000,gap:0}},
  {id:'CHN-D',props:1,cps:0.71,gmv:680000,si:0,status:'PENDING_REVIEW',match_date:'2024-11-20',participants:['Marcos Oliveira'],bridge:{buyer_min:600000,buyer_max:750000,seller_ask:680000,gap:0}},
];

export const PL = ['PENDING_REVIEW','APPROVED','ASSIGNED','IN_NEGOTIATION','CONCRETIZADA','COMMISSION_PENDING','COMMISSION_PAID','CLOSED'];

export const OPPS = [
  {id:'OPP-001',chain:'CHN-A',status:'COMMISSION_PENDING',si:5,cps:0.87,gmv:2670000,commission:160200,
   broker:'João Corretor',broker_id:'BRK-01',agency:'Imobiliária Paulista',agency_id:'AGN-01',
   split:{broker:0,agency:1.5,platform:4.5},match_date:'2024-10-15 09:32',
   participants:[
     {name:'Carlos Mendes',role_pt:'Vendedor',role_en:'Seller',pid:'PROP-001',cls:'pav-b'},
     {name:'Família Souza',role_pt:'Comp./Vendedor',role_en:'Buy./Seller',pid:'PROP-002',cls:'pav-b'},
     {name:'Beatriz Lima',role_pt:'Comprador',role_en:'Buyer',pid:'PROP-003',cls:'pav-a'},
   ],
   commissions:[
     {seller:'Carlos Mendes',pid:'PROP-001',ref:'COM-001-A',amount:51000,status:'OVERDUE',dd:{matricula:true,certidoes:true,iptu:true,docs:false}},
     {seller:'Família Souza',pid:'PROP-002',ref:'COM-001-B',amount:72000,status:'PENDING',dd:{matricula:true,certidoes:false,iptu:true,docs:true}},
   ]},
  {id:'OPP-002',chain:'CHN-B',status:'IN_NEGOTIATION',si:3,cps:0.79,gmv:1660000,commission:99600,
   broker:'Maria Corretora',broker_id:'BRK-01',agency:'Imobiliária Paulista',agency_id:'AGN-01',
   split:{broker:0,agency:2,platform:4},match_date:'2024-10-28 14:15',
   participants:[
     {name:'Pedro Alves',role_pt:'Vendedor',role_en:'Seller',pid:'PROP-004',cls:'pav-b'},
     {name:'Fernanda Costa',role_pt:'Comprador',role_en:'Buyer',pid:'PROP-006',cls:'pav-a'},
   ],
   commissions:[
     {seller:'Pedro Alves',pid:'PROP-004',ref:'COM-002-A',amount:99000,status:'PENDING',dd:{matricula:true,certidoes:true,iptu:false,docs:false}},
   ]},
  {id:'OPP-003',chain:'CHN-C',status:'APPROVED',si:1,cps:0.82,gmv:1410000,commission:84600,
   broker:null,broker_id:null,agency:null,agency_id:null,
   split:{broker:0,agency:0,platform:6},match_date:'2024-11-05 11:00',
   participants:[
     {name:'Roberto Silva',role_pt:'Vendedor',role_en:'Seller',pid:'PROP-007',cls:'pav-b'},
     {name:'Ana Ferreira',role_pt:'Comprador',role_en:'Buyer',pid:'PROP-009',cls:'pav-a'},
   ],
   commissions:[
     {seller:'Roberto Silva',pid:'PROP-007',ref:'COM-003-A',amount:53400,status:'PENDING',dd:{matricula:false,certidoes:false,iptu:false,docs:false}},
   ]},
];

export const USERS_DATA = [
  {id:'USR-001',name:'Carlos Mendes',email:'carlos@email.com',role:'USUARIO',status:'active',reg:'2024-08-10',props:2,matches:1},
  {id:'USR-002',name:'Ana Lima',email:'ana@email.com',role:'USUARIO',status:'active',reg:'2024-08-15',props:1,matches:1},
  {id:'USR-003',name:'Roberto Pereira',email:'roberto@email.com',role:'USUARIO',status:'active',reg:'2024-09-01',props:3,matches:0},
  {id:'USR-004',name:'Fernanda Santos',email:'fernanda@email.com',role:'USUARIO',status:'suspended',reg:'2024-09-10',props:0,matches:0},
  {id:'USR-005',name:'Marcos Oliveira',email:'marcos@email.com',role:'USUARIO',status:'pending',reg:'2024-10-20',props:1,matches:0},
];

export const BROKERS_DATA = [
  {id:'BRK-01',name:'João Corretor',creci:'12345',agency:'Imobiliária Paulista',agency_id:'AGN-01',phone:'5511991234567',status:'active',opps:2,commission:96000},
  {id:'BRK-02',name:'Maria Corretora',creci:'67890',agency:'RJ Imóveis',agency_id:'AGN-02',phone:'5521992345678',status:'active',opps:1,commission:0},
  {id:'BRK-03',name:'Paulo Agente',creci:'54321',agency:'BH Prime',agency_id:'AGN-03',phone:'5531993456789',status:'active',opps:0,commission:0},
  {id:'BRK-04',name:'Lucas Autônomo',creci:'11111',agency:null,agency_id:null,phone:'5511994567890',status:'active',opps:0,commission:0},
  {id:'BRK-05',name:'Ana Independente',creci:'22222',agency:null,agency_id:null,phone:'5511995678901',status:'pending',opps:0,commission:0},
];

export const AGENCIES_DATA = [
  {id:'AGN-01',name:'Imobiliária Paulista',brokers:['BRK-01'],status:'active',opps:2,commission:24900},
  {id:'AGN-02',name:'RJ Imóveis',brokers:['BRK-02'],status:'active',opps:0,commission:0},
  {id:'AGN-03',name:'BH Prime',brokers:['BRK-03'],status:'active',opps:0,commission:0},
];

export const COMM_HISTORY = {
  'COM-001-A':[
    {date:'2024-10-16',event:'Comissão gerada',amount:51000,type:'generated'},
    {date:'2024-10-25',event:'Notificação enviada ao vendedor',amount:null,type:'notify'},
    {date:'2024-11-01',event:'Prazo venceu — OVERDUE',amount:null,type:'overdue'},
  ],
  'COM-001-B':[
    {date:'2024-10-16',event:'Comissão gerada',amount:72000,type:'generated'},
    {date:'2024-10-20',event:'Confirmação de recebimento',amount:null,type:'notify'},
  ],
};

export const ALERTS = [
  {id:'A1',level:'high',pt:'OPP-001 — Comissão vencida há 8 dias.',en:'OPP-001 — Commission overdue 8 days.',link:'OPP-001'},
  {id:'A2',level:'medium',pt:'PROP-009 — Geocoding pendente.',en:'PROP-009 — Geocoding pending.',link:'PROP-009'},
  {id:'A3',level:'low',pt:'BRK-05 — Validação CRECI pendente.',en:'BRK-05 — CRECI validation pending.',link:'BRK-05'},
  {id:'A4',level:'high',pt:'2 novos anúncios aguardando aprovação.',en:'2 new listings awaiting approval.',link:'admin-approvals'},
];

export const PROP_GRADIENTS = [
  ['#667eea','#764ba2'],['#f093fb','#f5576c'],['#4facfe','#00f2fe'],
  ['#43e97b','#38f9d7'],['#fa709a','#fee140'],['#a18cd1','#fbc2eb'],
  ['#fccb90','#d57eeb'],['#a1c4fd','#c2e9fb'],['#fd7043','#ff8a65'],
  ['#26c6da','#00acc1'],['#66bb6a','#43a047'],['#ab47bc','#8e24aa'],
];

export const PROP_ICONS = ['🏢','🏠','🏡','🌃','🏗','🏙','🏘','🌆','🏛','🏬','🏪','🏰'];
