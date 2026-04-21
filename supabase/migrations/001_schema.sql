-- ═══════════════════════════════════════════════════════════════
--  HomeLink — Migration 001: Initial Schema
--  Run this first in your Supabase SQL Editor (or via supabase db push)
-- ═══════════════════════════════════════════════════════════════

-- ── Extensions ────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Helper: auto-update updated_at ────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════════════════
--  TABLE: properties
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS properties (
  id               TEXT        PRIMARY KEY,
  name             TEXT        NOT NULL,
  en               TEXT,
  type             TEXT        NOT NULL CHECK (type IN ('Apartamento','Casa','Terreno','Comercial')),
  city             TEXT        NOT NULL,
  hood             TEXT,
  price            NUMERIC(14,2) NOT NULL CHECK (price >= 0),
  size             NUMERIC(10,2),
  beds             SMALLINT    DEFAULT 0 CHECK (beds >= 0),
  baths            SMALLINT    DEFAULT 0 CHECK (baths >= 0),
  park             SMALLINT    DEFAULT 0 CHECK (park >= 0),
  status           TEXT        NOT NULL DEFAULT 'pendente'
                               CHECK (status IN ('ativo','pausado','pendente','cancelado')),
  chain            TEXT,                    -- references chains(id), soft FK
  owner            TEXT        NOT NULL DEFAULT 'usuario'
                               CHECK (owner IN ('usuario','outro')),
  fav              BOOLEAN     NOT NULL DEFAULT false,
  reg              DATE        NOT NULL DEFAULT CURRENT_DATE,
  approval_status  TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (approval_status IN ('pending','approved','rejected')),
  audit            JSONB       NOT NULL DEFAULT '[]'::jsonb,
  user_id          UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS properties_city_idx       ON properties(city);
CREATE INDEX IF NOT EXISTS properties_type_idx       ON properties(type);
CREATE INDEX IF NOT EXISTS properties_status_idx     ON properties(status);
CREATE INDEX IF NOT EXISTS properties_approval_idx   ON properties(approval_status);
CREATE INDEX IF NOT EXISTS properties_owner_idx      ON properties(owner);
CREATE INDEX IF NOT EXISTS properties_user_idx       ON properties(user_id);
CREATE INDEX IF NOT EXISTS properties_chain_idx      ON properties(chain);

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ══════════════════════════════════════════════════════════════
--  TABLE: interests
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS interests (
  id               TEXT        PRIMARY KEY,
  owner            TEXT        NOT NULL DEFAULT 'usuario'
                               CHECK (owner IN ('usuario','broker','agency')),
  title            TEXT        NOT NULL,
  en               TEXT,
  type             TEXT        NOT NULL CHECK (type IN ('Apartamento','Casa','Terreno','Comercial')),
  city             TEXT        NOT NULL,
  hood             TEXT,
  min_p            NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (min_p >= 0),
  max_p            NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (max_p >= 0),
  min_size         NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (min_size >= 0),
  min_beds         SMALLINT    NOT NULL DEFAULT 0 CHECK (min_beds >= 0),
  notes            TEXT,
  status           TEXT        NOT NULL DEFAULT 'ATIVO'
                               CHECK (status IN ('ATIVO','MATCH','PAUSADO','CANCELADO')),
  sourcing_status  TEXT        CHECK (sourcing_status IN ('PENDENTE','BUSCANDO','RESOLVIDO','DISPENSADO')),
  user_id          UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS interests_owner_idx    ON interests(owner);
CREATE INDEX IF NOT EXISTS interests_status_idx   ON interests(status);
CREATE INDEX IF NOT EXISTS interests_city_idx     ON interests(city);
CREATE INDEX IF NOT EXISTS interests_user_idx     ON interests(user_id);

CREATE TRIGGER interests_updated_at
  BEFORE UPDATE ON interests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ══════════════════════════════════════════════════════════════
--  TABLE: chains
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS chains (
  id           TEXT        PRIMARY KEY,
  props        SMALLINT    NOT NULL DEFAULT 0 CHECK (props >= 0),
  cps          NUMERIC(5,4) CHECK (cps BETWEEN 0 AND 1),
  gmv          NUMERIC(16,2),
  si           SMALLINT    NOT NULL DEFAULT 0,
  status       TEXT        NOT NULL DEFAULT 'PENDING_REVIEW',
  match_date   TEXT,
  participants JSONB       NOT NULL DEFAULT '[]'::jsonb,
  bridge       JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chains_status_idx ON chains(status);

CREATE TRIGGER chains_updated_at
  BEFORE UPDATE ON chains
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ══════════════════════════════════════════════════════════════
--  TABLE: opportunities
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS opportunities (
  id           TEXT        PRIMARY KEY,
  chain        TEXT        REFERENCES chains(id) ON DELETE SET NULL,
  status       TEXT        NOT NULL DEFAULT 'PENDING_REVIEW',
  si           SMALLINT    NOT NULL DEFAULT 0,
  cps          NUMERIC(5,4),
  gmv          NUMERIC(16,2),
  commission   NUMERIC(14,2),
  broker       TEXT,
  broker_id    TEXT,
  agency       TEXT,
  agency_id    TEXT,
  split        JSONB       NOT NULL DEFAULT '{"broker":0,"agency":0,"platform":6}'::jsonb,
  match_date   TEXT,
  participants JSONB       NOT NULL DEFAULT '[]'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS opportunities_chain_idx     ON opportunities(chain);
CREATE INDEX IF NOT EXISTS opportunities_status_idx    ON opportunities(status);
CREATE INDEX IF NOT EXISTS opportunities_broker_idx    ON opportunities(broker_id);
CREATE INDEX IF NOT EXISTS opportunities_agency_idx    ON opportunities(agency_id);

CREATE TRIGGER opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ══════════════════════════════════════════════════════════════
--  TABLE: commissions
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS commissions (
  id         TEXT        PRIMARY KEY,         -- e.g. COM-001-A
  opp_id     TEXT        NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  seller     TEXT,
  pid        TEXT,                            -- property id (soft FK)
  amount     NUMERIC(14,2),
  status     TEXT        NOT NULL DEFAULT 'PENDING'
                         CHECK (status IN ('PENDING','PAID','OVERDUE')),
  dd         JSONB       NOT NULL DEFAULT
               '{"matricula":false,"certidoes":false,"iptu":false,"docs":false}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS commissions_opp_idx    ON commissions(opp_id);
CREATE INDEX IF NOT EXISTS commissions_status_idx ON commissions(status);
CREATE INDEX IF NOT EXISTS commissions_pid_idx    ON commissions(pid);

CREATE TRIGGER commissions_updated_at
  BEFORE UPDATE ON commissions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
