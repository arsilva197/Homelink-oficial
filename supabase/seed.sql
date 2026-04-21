-- ═══════════════════════════════════════════════════════════════
--  HomeLink — Seed Data  (mirrors src/data/mockData.js)
--  Run AFTER migrations 001 and 002.
--  Safe to re-run: uses INSERT ... ON CONFLICT DO NOTHING
-- ═══════════════════════════════════════════════════════════════

-- ── Chains ────────────────────────────────────────────────────
INSERT INTO chains (id, props, cps, gmv, si, status, match_date, participants, bridge) VALUES
  ('CHN-A', 3, 0.87, 2670000, 5, 'COMMISSION_PENDING', '2024-10-15',
   '["Carlos Mendes","Família Souza","Beatriz Lima"]',
   '{"buyer_min":700000,"buyer_max":900000,"seller_ask":850000,"gap":0}'),
  ('CHN-B', 2, 0.79, 1660000, 3, 'IN_NEGOTIATION',    '2024-10-28',
   '["Pedro Alves","Fernanda Costa"]',
   '{"buyer_min":500000,"buyer_max":680000,"seller_ask":720000,"gap":40000}'),
  ('CHN-C', 2, 0.82, 1410000, 1, 'APPROVED',           '2024-11-05',
   '["Roberto Silva","Ana Ferreira"]',
   '{"buyer_min":800000,"buyer_max":950000,"seller_ask":890000,"gap":0}'),
  ('CHN-D', 1, 0.71, 680000,  0, 'PENDING_REVIEW',     '2024-11-20',
   '["Marcos Oliveira"]',
   '{"buyer_min":600000,"buyer_max":750000,"seller_ask":680000,"gap":0}')
ON CONFLICT (id) DO NOTHING;

-- ── Properties ────────────────────────────────────────────────
INSERT INTO properties (id, name, en, type, city, hood, price, size, beds, baths, park,
                        status, chain, owner, fav, reg, approval_status, audit, user_id)
VALUES
  ('PROP-001','Apto Jardins','Jardins Apt','Apartamento','São Paulo','Jardins',
   850000,82,2,2,1,'ativo','CHN-A','usuario',false,'2024-09-15','approved',
   '[{"date":"2024-09-15","event":"Anúncio criado","user":"Carlos Mendes","type":"created"},
     {"date":"2024-09-16","event":"Aprovado pelo Admin","user":"Admin Demo","type":"approved"},
     {"date":"2024-09-16","event":"Status: Ativo","user":"Sistema","type":"status"},
     {"date":"2024-10-15","event":"Incluído em cadeia CHN-A","user":"Sistema","type":"chain"}]',
   NULL),

  ('PROP-002','Casa Perdizes','Perdizes House','Casa','São Paulo','Perdizes',
   1200000,180,3,3,2,'ativo','CHN-A','outro',false,'2024-09-18','approved',
   '[{"date":"2024-09-18","event":"Anúncio criado","user":"João Corretor","type":"created"},
     {"date":"2024-09-19","event":"Aprovado pelo Admin","user":"Admin Demo","type":"approved"},
     {"date":"2024-09-19","event":"Status: Ativo","user":"Sistema","type":"status"},
     {"date":"2024-10-15","event":"Incluído em cadeia CHN-A","user":"Sistema","type":"chain"}]',
   NULL),

  ('PROP-003','Apto Vila Madalena','Vila Madalena','Apartamento','São Paulo','Vila Madalena',
   720000,68,2,1,1,'ativo','CHN-A','outro',true,'2024-09-20','approved',
   '[{"date":"2024-09-20","event":"Anúncio criado","user":"Imobiliária Paulista","type":"created"},
     {"date":"2024-09-21","event":"Aprovado pelo Admin","user":"Admin Demo","type":"approved"},
     {"date":"2024-09-21","event":"Status: Ativo","user":"Sistema","type":"status"},
     {"date":"2024-10-15","event":"Incluído em cadeia CHN-A","user":"Sistema","type":"chain"}]',
   NULL),

  ('PROP-004','Apto Ipanema','Ipanema Apt','Apartamento','Rio de Janeiro','Ipanema',
   1650000,95,3,2,1,'ativo','CHN-B','outro',false,'2024-09-22','approved',
   '[{"date":"2024-09-22","event":"Anúncio criado","user":"João Corretor","type":"created"},
     {"date":"2024-09-23","event":"Aprovado pelo Admin","user":"Admin Demo","type":"approved"},
     {"date":"2024-10-28","event":"Incluído em cadeia CHN-B","user":"Sistema","type":"chain"}]',
   NULL),

  ('PROP-005','Cobertura Leblon','Leblon Penthouse','Apartamento','Rio de Janeiro','Leblon',
   4200000,280,4,4,3,'pausado',NULL,'outro',false,'2024-09-25','approved',
   '[{"date":"2024-09-25","event":"Anúncio criado","user":"RJ Imóveis","type":"created"},
     {"date":"2024-09-26","event":"Aprovado pelo Admin","user":"Admin Demo","type":"approved"},
     {"date":"2024-10-10","event":"Status: Pausado","user":"RJ Imóveis","type":"status"}]',
   NULL),

  ('PROP-006','Apto Savassi','Savassi Apt','Apartamento','Belo Horizonte','Savassi',
   580000,65,2,1,1,'ativo','CHN-B','outro',false,'2024-09-28','approved',
   '[{"date":"2024-09-28","event":"Anúncio criado","user":"BH Prime","type":"created"},
     {"date":"2024-09-29","event":"Aprovado pelo Admin","user":"Admin Demo","type":"approved"},
     {"date":"2024-10-28","event":"Incluído em cadeia CHN-B","user":"Sistema","type":"chain"}]',
   NULL),

  ('PROP-007','Casa Lourdes','Lourdes House','Casa','Belo Horizonte','Lourdes',
   890000,160,3,2,2,'ativo','CHN-C','outro',false,'2024-10-02','approved',
   '[{"date":"2024-10-02","event":"Anúncio criado","user":"BH Prime","type":"created"},
     {"date":"2024-10-03","event":"Aprovado pelo Admin","user":"Admin Demo","type":"approved"},
     {"date":"2024-11-05","event":"Incluído em cadeia CHN-C","user":"Sistema","type":"chain"}]',
   NULL),

  ('PROP-008','Studio Pinheiros','Pinheiros Studio','Apartamento','São Paulo','Pinheiros',
   420000,38,1,1,0,'pausado',NULL,'outro',false,'2024-10-05','approved',
   '[{"date":"2024-10-05","event":"Anúncio criado","user":"João Corretor","type":"created"},
     {"date":"2024-10-06","event":"Aprovado pelo Admin","user":"Admin Demo","type":"approved"},
     {"date":"2024-10-20","event":"Status: Pausado","user":"João Corretor","type":"status"}]',
   NULL),

  ('PROP-009','Apto Botafogo','Botafogo Apt','Apartamento','Rio de Janeiro','Botafogo',
   980000,88,3,2,1,'ativo','CHN-C','outro',true,'2024-10-08','approved',
   '[{"date":"2024-10-08","event":"Anúncio criado","user":"RJ Imóveis","type":"created"},
     {"date":"2024-10-09","event":"Aprovado pelo Admin","user":"Admin Demo","type":"approved"},
     {"date":"2024-11-05","event":"Incluído em cadeia CHN-C","user":"Sistema","type":"chain"}]',
   NULL),

  ('PROP-010','Casa Moema','Moema House','Casa','São Paulo','Moema',
   1450000,220,4,3,2,'ativo',NULL,'usuario',false,'2024-11-08','approved',
   '[{"date":"2024-11-08","event":"Anúncio criado","user":"Carlos Mendes","type":"created"},
     {"date":"2024-11-09","event":"Aprovado pelo Admin","user":"Admin Demo","type":"approved"}]',
   NULL),

  ('PROP-011','Apto Copacabana','Copacabana Apt','Apartamento','Rio de Janeiro','Copacabana',
   680000,70,2,1,1,'ativo','CHN-D','outro',false,'2024-11-10','approved',
   '[{"date":"2024-11-10","event":"Anúncio criado","user":"RJ Imóveis","type":"created"},
     {"date":"2024-11-11","event":"Aprovado pelo Admin","user":"Admin Demo","type":"approved"},
     {"date":"2024-11-20","event":"Incluído em cadeia CHN-D","user":"Sistema","type":"chain"}]',
   NULL),

  ('PROP-012','Sala Comercial SP','SP Commercial','Comercial','São Paulo','Paulista',
   380000,45,0,1,1,'pausado',NULL,'outro',false,'2024-11-15','approved',
   '[{"date":"2024-11-15","event":"Anúncio criado","user":"Imobiliária Paulista","type":"created"},
     {"date":"2024-11-16","event":"Aprovado pelo Admin","user":"Admin Demo","type":"approved"},
     {"date":"2024-11-18","event":"Status: Pausado","user":"Imobiliária Paulista","type":"status"}]',
   NULL),

  ('PROP-013','Apto Consolação','Consolação Apt','Apartamento','São Paulo','Consolação',
   650000,72,2,1,1,'pendente',NULL,'outro',false,'2024-11-22','pending',
   '[{"date":"2024-11-22","event":"Anúncio criado — aguardando aprovação","user":"Novo Vendedor","type":"created"}]',
   NULL),

  ('PROP-014','Casa Alphaville','Alphaville House','Casa','São Paulo','Alphaville',
   1850000,310,4,4,3,'pendente',NULL,'outro',false,'2024-11-23','pending',
   '[{"date":"2024-11-23","event":"Anúncio criado — aguardando aprovação","user":"João Corretor","type":"created"}]',
   NULL)
ON CONFLICT (id) DO NOTHING;

-- ── Interests ─────────────────────────────────────────────────
INSERT INTO interests (id, owner, title, en, type, city, hood, min_p, max_p, min_size, min_beds,
                       notes, status, sourcing_status, user_id)
VALUES
  ('INT-001','usuario','Casa em Vila Mariana','House in Vila Mariana','Casa','São Paulo','Vila Mariana',
   800000,1300000,120,3,'Prefiro condomínio fechado, área de lazer.','ATIVO','PENDENTE',NULL),

  ('INT-002','usuario','Terreno Comercial Paulista','Commercial Land','Comercial','São Paulo','Paulista',
   400000,700000,60,0,'Para montar escritório.','MATCH',NULL,NULL),

  ('INT-003','usuario','Apartamento em Savassi','Apt in Savassi','Apartamento','Belo Horizonte','Savassi',
   450000,650000,55,2,'Andar alto, vaga de garagem.','MATCH',NULL,NULL),

  ('INT-004','usuario','Casa com Quintal em BH','House with Garden','Casa','Belo Horizonte','Lourdes',
   700000,1000000,140,3,'Para família. Quintal obrigatório.','ATIVO','BUSCANDO',NULL),

  ('INT-005','usuario','Studio no Centro SP','Studio Downtown SP','Apartamento','São Paulo','Centro',
   300000,500000,35,1,'Investimento para aluguel.','ATIVO','PENDENTE',NULL),

  ('INT-006','broker','Cobertura no Leblon','Penthouse in Leblon','Apartamento','Rio de Janeiro','Leblon',
   3000000,6000000,200,4,'Para cliente VIP — piscina e terraço obrigatórios.','ATIVO','PENDENTE',NULL),

  ('INT-007','broker','Casa de Alto Padrão em Higienópolis','Luxury House Higienópolis','Casa','São Paulo','Higienópolis',
   2500000,4500000,300,4,'Garagem para 4 carros, área gourmet.','ATIVO','BUSCANDO',NULL),

  ('INT-008','broker','Flat para Investimento','Investment Flat','Apartamento','São Paulo','Consolação',
   400000,700000,40,1,'Portfólio de investimentos — renda passiva.','MATCH',NULL,NULL),

  ('INT-009','agency','Galpão Industrial na Grande SP','Industrial Warehouse Greater SP','Comercial','São Paulo','Santo André',
   2000000,5000000,800,0,'Para cliente logística. Pé-direito alto.','ATIVO','PENDENTE',NULL),

  ('INT-010','agency','Conjunto Comercial na Faria Lima','Office Suite Faria Lima','Comercial','São Paulo','Itaim Bibi',
   1500000,3000000,150,0,'Escritório corporativo.','ATIVO','RESOLVIDO',NULL),

  ('INT-011','agency','Apartamento 3 quartos na Barra','3-bed Apt Barra da Tijuca','Apartamento','Rio de Janeiro','Barra da Tijuca',
   900000,1600000,110,3,'Lazer completo, vaga dupla.','MATCH',NULL,NULL)
ON CONFLICT (id) DO NOTHING;

-- ── Opportunities ─────────────────────────────────────────────
INSERT INTO opportunities (id, chain, status, si, cps, gmv, commission, broker, broker_id,
                            agency, agency_id, split, match_date, participants)
VALUES
  ('OPP-001','CHN-A','COMMISSION_PENDING',5,0.87,2670000,160200,
   'João Corretor','BRK-01','Imobiliária Paulista','AGN-01',
   '{"broker":0,"agency":1.5,"platform":4.5}',
   '2024-10-15 09:32',
   '[{"name":"Carlos Mendes","role_pt":"Vendedor","role_en":"Seller","pid":"PROP-001","cls":"pav-b"},
     {"name":"Família Souza","role_pt":"Comp./Vendedor","role_en":"Buy./Seller","pid":"PROP-002","cls":"pav-b"},
     {"name":"Beatriz Lima","role_pt":"Comprador","role_en":"Buyer","pid":"PROP-003","cls":"pav-a"}]'),

  ('OPP-002','CHN-B','IN_NEGOTIATION',3,0.79,1660000,99600,
   'Maria Corretora','BRK-01','Imobiliária Paulista','AGN-01',
   '{"broker":0,"agency":2,"platform":4}',
   '2024-10-28 14:15',
   '[{"name":"Pedro Alves","role_pt":"Vendedor","role_en":"Seller","pid":"PROP-004","cls":"pav-b"},
     {"name":"Fernanda Costa","role_pt":"Comprador","role_en":"Buyer","pid":"PROP-006","cls":"pav-a"}]'),

  ('OPP-003','CHN-C','APPROVED',1,0.82,1410000,84600,
   NULL,NULL,NULL,NULL,
   '{"broker":0,"agency":0,"platform":6}',
   '2024-11-05 11:00',
   '[{"name":"Roberto Silva","role_pt":"Vendedor","role_en":"Seller","pid":"PROP-007","cls":"pav-b"},
     {"name":"Ana Ferreira","role_pt":"Comprador","role_en":"Buyer","pid":"PROP-009","cls":"pav-a"}]')
ON CONFLICT (id) DO NOTHING;

-- ── Commissions ───────────────────────────────────────────────
INSERT INTO commissions (id, opp_id, seller, pid, amount, status, dd)
VALUES
  ('COM-001-A','OPP-001','Carlos Mendes','PROP-001',51000,'OVERDUE',
   '{"matricula":true,"certidoes":true,"iptu":true,"docs":false}'),

  ('COM-001-B','OPP-001','Família Souza','PROP-002',72000,'PENDING',
   '{"matricula":true,"certidoes":false,"iptu":true,"docs":true}'),

  ('COM-002-A','OPP-002','Pedro Alves','PROP-004',99000,'PENDING',
   '{"matricula":true,"certidoes":true,"iptu":false,"docs":false}'),

  ('COM-003-A','OPP-003','Roberto Silva','PROP-007',53400,'PENDING',
   '{"matricula":false,"certidoes":false,"iptu":false,"docs":false}')
ON CONFLICT (id) DO NOTHING;
