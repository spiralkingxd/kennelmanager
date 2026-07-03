-- ====================================================================
-- KENNELMANAGER PRO - Schema Completo PostgreSQL
-- ====================================================================
-- Compatível com Supabase (funções RLS no schema public)
-- Versão: 1.0.0
-- ====================================================================

-- ####################################################################
-- EXTENSÕES
-- ####################################################################
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ####################################################################
-- TIPOS ENUM (com proteção IF NOT EXISTS via DO block)
-- ####################################################################
-- O PostgreSQL NÃO suporta CREATE TYPE IF NOT EXISTS, então usamos
-- DO $$ blocks com verificação em pg_type para evitar erro 42710.

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'animal_status') THEN CREATE TYPE animal_status AS ENUM ('ACTIVE', 'INACTIVE', 'DECEASED', 'SOLD'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'animal_sex') THEN CREATE TYPE animal_sex AS ENUM ('MALE', 'FEMALE'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'animal_size') THEN CREATE TYPE animal_size AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'GIANT'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'temperament_tag') THEN CREATE TYPE temperament_tag AS ENUM ('DOCILE', 'PLAYFUL', 'RESERVED', 'PROTECTIVE', 'ENERGETIC', 'CALM', 'DOMINANT', 'SOCIABLE', 'INDEPENDENT'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'puppy_status') THEN CREATE TYPE puppy_status AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'RETAINED', 'DEAD'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'litter_birth_type') THEN CREATE TYPE litter_birth_type AS ENUM ('NATURAL', 'CESAREAN'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'insemination_type') THEN CREATE TYPE insemination_type AS ENUM ('NATURAL', 'ARTIFICIAL_FRESH', 'ARTIFICIAL_REFRIGERATED', 'ARTIFICIAL_FROZEN'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_status') THEN CREATE TYPE client_status AS ENUM ('LEAD', 'NEGOTIATING', 'ACTIVE_RESERVATION', 'COMPLETED', 'WAITLIST', 'INACTIVE'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_condition') THEN CREATE TYPE payment_condition AS ENUM ('CASH', 'ENTRY_PLUS_BALANCE', 'INSTALLMENTS'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'installment_status') THEN CREATE TYPE installment_status AS ENUM ('PENDING', 'PAID', 'OVERDUE'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interaction_type') THEN CREATE TYPE interaction_type AS ENUM ('WHATSAPP', 'PHONE', 'EMAIL', 'VISIT', 'SOCIAL_MEDIA', 'OTHER'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exam_type') THEN CREATE TYPE exam_type AS ENUM ('BLOOD_TEST', 'XRAY', 'ULTRASOUND', 'PROGESTERONE', 'OFA', 'BRUCELLOSIS', 'HIP_DYSPLASIA', 'ELBOW_DYSPLASIA', 'OTHER'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'calendar_category') THEN CREATE TYPE calendar_category AS ENUM ('HEALTH', 'REPRODUCTION', 'LITTER', 'FINANCIAL', 'VISIT', 'EXHIBITION', 'MANUAL'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN CREATE TYPE notification_type AS ENUM ('HEALTH_ALERT', 'REPRODUCTION_ALERT', 'FINANCIAL_ALERT', 'SALES_ALERT', 'WAITLIST_MATCH', 'SYSTEM'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN CREATE TYPE user_role AS ENUM ('ADMIN', 'CRIADOR', 'VET', 'COMMERCIAL', 'FINANCIAL', 'READONLY'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN CREATE TYPE document_type AS ENUM ('PEDIGREE', 'CERTIFICATE', 'EXAM_REPORT', 'PURCHASE_CONTRACT', 'SALE_CONTRACT', 'PHOTO', 'OTHER'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cost_category') THEN CREATE TYPE cost_category AS ENUM ('FOOD', 'VET', 'VACCINES', 'DEWORMING', 'EXAMS', 'MEDICATION', 'REPRODUCTION', 'EXHIBITION', 'INFRASTRUCTURE', 'MARKETING', 'LABOR', 'OTHER'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN CREATE TYPE event_type AS ENUM ('VACCINE', 'DEWORMING', 'OTHER'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'entry_type') THEN CREATE TYPE entry_type AS ENUM ('INCOME', 'EXPENSE'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action') THEN CREATE TYPE audit_action AS ENUM ('CREATED', 'UPDATED', 'DELETED', 'VIEWED', 'LOGIN', 'LOGIN_FAILED', 'LOGOUT', 'PASSWORD_RESET'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'litter_status') THEN CREATE TYPE litter_status AS ENUM ('PLANNED', 'CONFIRMED', 'BORN', 'WEANING', 'COMPLETED', 'CANCELED'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'medication_status') THEN CREATE TYPE medication_status AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELED', 'SUSPENDED'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN CREATE TYPE event_status AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELED'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'waitlist_status') THEN CREATE TYPE waitlist_status AS ENUM ('ACTIVE', 'MATCHED', 'COMPLETED', 'EXPIRED', 'CANCELED'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sales_status') THEN CREATE TYPE sales_status AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED'); END IF; END $$;


-- ####################################################################
-- FUNÇÕES RLS (Compatível com Supabase - schema PUBLIC)
-- ####################################################################
-- ⚠️ IMPORTANTE: Foram movidas para public (NÃO auth) porque o schema
-- "auth" no Supabase é reservado e usuários normais não têm permissão.
-- O Supabase já fornece auth.uid() e auth.role() nativos, mas estas
-- funções extraem claims JWT personalizados (sub, role).

CREATE OR REPLACE FUNCTION public.user_role() RETURNS TEXT STABLE AS $$
  SELECT COALESCE(current_setting('request.jwt.claim.role', true), 'READONLY');
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION public.user_id() RETURNS UUID STABLE AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::UUID;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION public.has_role(VARIADIC roles TEXT[]) RETURNS BOOLEAN STABLE AS $$
  SELECT public.user_role() = ANY(roles);
$$ LANGUAGE sql;

-- Função trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ####################################################################
-- TABELA: USERS (Usuários do Sistema)
-- ####################################################################
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  avatar_path TEXT,
  role user_role DEFAULT 'READONLY',
  status user_status DEFAULT 'ACTIVE',
  last_login TIMESTAMPTZ,
  login_attempts INT DEFAULT 0,
  blocked_at TIMESTAMPTZ,
  require_password_change BOOLEAN DEFAULT FALSE,
  is_protected BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'usuarios_editam_eles_mesmos' AND tablename = 'users') THEN
  CREATE POLICY "usuarios_editam_eles_mesmos" ON users
  FOR ALL TO authenticated
  USING ((select user_id()) = id)
  WITH CHECK ((select user_id()) = id);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_tudo_users' AND tablename = 'users') THEN
  CREATE POLICY "admins_tudo_users" ON users
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')));
END IF; END $$;

DROP TRIGGER IF EXISTS set_timestamp_users ON users;
CREATE TRIGGER set_timestamp_users
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();


-- ####################################################################
-- RLS HELPER FUNCTIONS — User isolation for Row Level Security
-- these functions read app-level settings set by the application connection
-- Usage: SET LOCAL app.current_user_id = 'uuid'; SET LOCAL app.is_admin = 'true';
-- ####################################################################
CREATE SCHEMA IF NOT EXISTS app;

CREATE OR REPLACE FUNCTION app.current_user_id() RETURNS UUID AS $$
SELECT NULLIF(current_setting('app.current_user_id', true), '')::UUID;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION app.is_admin() RETURNS BOOLEAN AS $$
SELECT NULLIF(current_setting('app.is_admin', true), '') = 'true';
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- NOTE: app.current_user_id_user_col() and app.current_user_id_uploaded_by() were
-- removed as redundant aliases. Use app.current_user_id() for all app-level user isolation.

-- ####################################################################
-- TABELA: CLIENTS (CRM)
-- ####################################################################
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  secondary_phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  birth_date DATE,
  profession TEXT,
  status client_status DEFAULT 'LEAD',

  notes TEXT,
  how_found_us TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_comercial_clients' AND tablename = 'clients') THEN
  CREATE POLICY "admins_comercial_clients" ON clients
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')) OR (select has_role('COMMERCIAL')));
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'readonly_clients' AND tablename = 'clients') THEN
  CREATE POLICY "readonly_clients" ON clients
  FOR SELECT TO authenticated
  USING ((select app.is_admin()) OR created_by = (select app.current_user_id()));
END IF; END $$;

DROP TRIGGER IF EXISTS set_timestamp_clients ON clients;
CREATE TRIGGER set_timestamp_clients
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);


-- ####################################################################
-- TABELA: ANIMALS (Plantel)
-- ####################################################################
CREATE TABLE IF NOT EXISTS animals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  sex animal_sex NOT NULL,
  size animal_size DEFAULT 'MEDIUM',
  color TEXT,
  weight NUMERIC(5,2),
  birth_date DATE,
  death_date DATE,
  microchip TEXT UNIQUE,
  registration_number TEXT UNIQUE,
  pedigree_number TEXT,
  status animal_status DEFAULT 'ACTIVE',
  temperament temperament_tag[] DEFAULT '{}',
  origin TEXT,
  breeder TEXT,
  purchase_date DATE,
  purchase_price NUMERIC(10,2),
  photo_url TEXT,
  notes TEXT,
  father_id UUID REFERENCES animals(id) ON DELETE SET NULL,
  mother_id UUID REFERENCES animals(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_tudo_animals' AND tablename = 'animals') THEN
  CREATE POLICY "admins_tudo_animals" ON animals
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')));
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vet_comercial_animals' AND tablename = 'animals') THEN
  CREATE POLICY "vet_comercial_animals" ON animals
  FOR ALL TO authenticated
  USING ((select has_role('VET')) OR (select has_role('COMMERCIAL')));
END IF; END $$;

DROP TRIGGER IF EXISTS set_timestamp_animals ON animals;
CREATE TRIGGER set_timestamp_animals
  BEFORE UPDATE ON animals
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE INDEX IF NOT EXISTS idx_animals_status ON animals(status);
CREATE INDEX IF NOT EXISTS idx_animals_breed ON animals(breed);
CREATE INDEX IF NOT EXISTS idx_animals_sex ON animals(sex);
CREATE INDEX IF NOT EXISTS idx_animals_father ON animals(father_id);
CREATE INDEX IF NOT EXISTS idx_animals_mother ON animals(mother_id);


-- ####################################################################
-- TABELA: CLIENT_INTERACTIONS (Histórico de Interações com Clientes)
-- ####################################################################
CREATE TABLE IF NOT EXISTS client_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type interaction_type NOT NULL DEFAULT 'OTHER',
  description TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  follow_up_date DATE,
  follow_up_notes TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE client_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_interactions FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_comercial_interactions' AND tablename = 'client_interactions') THEN
  CREATE POLICY "admins_comercial_interactions" ON client_interactions
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')) OR (select has_role('COMMERCIAL')));
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'read_interactions' AND tablename = 'client_interactions') THEN
  CREATE POLICY "read_interactions" ON client_interactions
  FOR SELECT TO authenticated
  USING ((select app.is_admin()) OR user_id = (select app.current_user_id()));
END IF; END $$;

CREATE INDEX IF NOT EXISTS idx_interactions_client ON client_interactions(client_id);
CREATE INDEX IF NOT EXISTS idx_interactions_date ON client_interactions(date);
CREATE INDEX IF NOT EXISTS idx_interactions_followup ON client_interactions(follow_up_date);


-- ####################################################################
-- TABELA: WAITLIST (Lista de Espera)
-- ####################################################################
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  preferred_breed TEXT,
  preferred_gender animal_sex,
  preferred_color TEXT,
  max_price NUMERIC(10,2),
  notes TEXT,
  status waitlist_status DEFAULT 'ACTIVE',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_comercial_waitlist' AND tablename = 'waitlist') THEN
  CREATE POLICY "admins_comercial_waitlist" ON waitlist
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')) OR (select has_role('COMMERCIAL')));
END IF; END $$;

DROP TRIGGER IF EXISTS set_timestamp_waitlist ON waitlist;
CREATE TRIGGER set_timestamp_waitlist
  BEFORE UPDATE ON waitlist
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE INDEX IF NOT EXISTS idx_waitlist_client ON waitlist(client_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);


-- ####################################################################
-- TABELA: LITTERS (Ninhadas)
-- ####################################################################
CREATE TABLE IF NOT EXISTS litters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mother_id UUID REFERENCES animals(id) ON DELETE SET NULL,
  father_id UUID REFERENCES animals(id) ON DELETE SET NULL,
  mating_date DATE,
  expected_date DATE,
  birth_date DATE,
  birth_type litter_birth_type DEFAULT 'NATURAL',
  total_puppies INT DEFAULT 0,
  male_count INT DEFAULT 0,
  female_count INT DEFAULT 0,
  status litter_status DEFAULT 'PLANNED',
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE litters ENABLE ROW LEVEL SECURITY;
ALTER TABLE litters FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_vet_litters' AND tablename = 'litters') THEN
  CREATE POLICY "admins_vet_litters" ON litters
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')) OR (select has_role('VET')));
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'read_litters' AND tablename = 'litters') THEN
  CREATE POLICY "read_litters" ON litters
  FOR SELECT TO authenticated
  USING ((select app.is_admin()) OR created_by = (select app.current_user_id()));
END IF; END $$;

DROP TRIGGER IF EXISTS set_timestamp_litters ON litters;
CREATE TRIGGER set_timestamp_litters
  BEFORE UPDATE ON litters
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE INDEX IF NOT EXISTS idx_litters_mother ON litters(mother_id);
CREATE INDEX IF NOT EXISTS idx_litters_father ON litters(father_id);
CREATE INDEX IF NOT EXISTS idx_litters_status ON litters(status);


-- ####################################################################
-- TABELA: PUPPIES (Filhotes)
-- ####################################################################
CREATE TABLE IF NOT EXISTS puppies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  litter_id UUID NOT NULL REFERENCES litters(id) ON DELETE CASCADE,
  name TEXT,
  birth_time TIME,
  sex animal_sex NOT NULL,
  color TEXT,
  weight NUMERIC(5,2),
  microchip TEXT UNIQUE,
  registration_number TEXT UNIQUE,
  price NUMERIC(10,2),
  status puppy_status DEFAULT 'AVAILABLE',
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  sale_date DATE,
  sale_notes TEXT,
  photo_url TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE puppies ENABLE ROW LEVEL SECURITY;
ALTER TABLE puppies FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_vet_comercial_puppies' AND tablename = 'puppies') THEN
  CREATE POLICY "admins_vet_comercial_puppies" ON puppies
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')) OR (select has_role('VET')) OR (select has_role('COMMERCIAL')));
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'read_puppies' AND tablename = 'puppies') THEN
  CREATE POLICY "read_puppies" ON puppies
  FOR SELECT TO authenticated
  USING ((select app.is_admin()) OR created_by = (select app.current_user_id()));
END IF; END $$;

DROP TRIGGER IF EXISTS set_timestamp_puppies ON puppies;
CREATE TRIGGER set_timestamp_puppies
  BEFORE UPDATE ON puppies
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE INDEX IF NOT EXISTS idx_puppies_litter ON puppies(litter_id);
CREATE INDEX IF NOT EXISTS idx_puppies_status ON puppies(status);
CREATE INDEX IF NOT EXISTS idx_puppies_client ON puppies(client_id);


-- ####################################################################
-- TABELA: SALES (Vendas - pipeline simplificado)
-- ####################################################################
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  puppy_id UUID REFERENCES puppies(id) ON DELETE SET NULL,
  status sales_status DEFAULT 'PENDING',
  condition payment_condition DEFAULT 'CASH',
  entry_value NUMERIC(10,2),
  total_value NUMERIC(10,2),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_comercial_sales' AND tablename = 'sales') THEN
  CREATE POLICY "admins_comercial_sales" ON sales
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')) OR (select has_role('COMMERCIAL')));
END IF; END $$;

DROP TRIGGER IF EXISTS set_timestamp_sales ON sales;
CREATE TRIGGER set_timestamp_sales
  BEFORE UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE INDEX IF NOT EXISTS idx_sales_client ON sales(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_created_by ON sales(created_by);

-- ####################################################################
-- TABELA: VACCINES (Vacinas)
-- ####################################################################
CREATE TABLE IF NOT EXISTS vaccines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  manufacturer TEXT,
  batch TEXT,
  dose TEXT,
  date DATE NOT NULL,
  next_due_date DATE,
  vet_name TEXT,
  clinic TEXT,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccines FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_vet_vaccines' AND tablename = 'vaccines') THEN
  CREATE POLICY "admins_vet_vaccines" ON vaccines
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')) OR (select has_role('VET')));
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'read_vaccines' AND tablename = 'vaccines') THEN
  CREATE POLICY "read_vaccines" ON vaccines
  FOR SELECT TO authenticated
  USING ((select app.is_admin()) OR created_by = (select app.current_user_id()));
END IF; END $$;

DROP TRIGGER IF EXISTS set_timestamp_vaccines ON vaccines;
CREATE TRIGGER set_timestamp_vaccines
  BEFORE UPDATE ON vaccines
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE INDEX IF NOT EXISTS idx_vaccines_animal ON vaccines(animal_id);
CREATE INDEX IF NOT EXISTS idx_vaccines_nextdue ON vaccines(next_due_date);


-- ####################################################################
-- TABELA: DEWORMING (Vermífugos)
-- ####################################################################
CREATE TABLE IF NOT EXISTS deworming (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  product TEXT NOT NULL,
  active_ingredient TEXT,
  dose TEXT,
  weight_at_date NUMERIC(5,2),
  date DATE NOT NULL,
  next_due_date DATE,
  vet_name TEXT,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE deworming ENABLE ROW LEVEL SECURITY;
ALTER TABLE deworming FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_vet_deworming' AND tablename = 'deworming') THEN
  CREATE POLICY "admins_vet_deworming" ON deworming
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')) OR (select has_role('VET')));
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'read_deworming' AND tablename = 'deworming') THEN
  CREATE POLICY "read_deworming" ON deworming
  FOR SELECT TO authenticated
  USING ((select app.is_admin()) OR created_by = (select app.current_user_id()));
END IF; END $$;

DROP TRIGGER IF EXISTS set_timestamp_deworming ON deworming;
CREATE TRIGGER set_timestamp_deworming
  BEFORE UPDATE ON deworming
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE INDEX IF NOT EXISTS idx_deworming_animal ON deworming(animal_id);
CREATE INDEX IF NOT EXISTS idx_deworming_nextdue ON deworming(next_due_date);


-- ####################################################################
-- TABELA: EXAMS (Exames)
-- ####################################################################
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  type exam_type NOT NULL,
  date DATE NOT NULL,
  result TEXT,
  result_file_url TEXT,
  vet_name TEXT,
  clinic TEXT,
  is_pre_reproduction BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_vet_exams' AND tablename = 'exams') THEN
  CREATE POLICY "admins_vet_exams" ON exams
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')) OR (select has_role('VET')));
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'read_exams' AND tablename = 'exams') THEN
  CREATE POLICY "read_exams" ON exams
  FOR SELECT TO authenticated
  USING ((select app.is_admin()) OR created_by = (select app.current_user_id()));
END IF; END $$;

DROP TRIGGER IF EXISTS set_timestamp_exams ON exams;
CREATE TRIGGER set_timestamp_exams
  BEFORE UPDATE ON exams
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE INDEX IF NOT EXISTS idx_exams_animal ON exams(animal_id);


-- ####################################################################
-- TABELA: MEDICATIONS (Medicamentos)
-- ####################################################################
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dose TEXT,
  route TEXT,
  frequency TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  status medication_status DEFAULT 'ACTIVE',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_vet_medications' AND tablename = 'medications') THEN
  CREATE POLICY "admins_vet_medications" ON medications
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')) OR (select has_role('VET')));
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'read_medications' AND tablename = 'medications') THEN
  CREATE POLICY "read_medications" ON medications
  FOR SELECT TO authenticated
  USING ((select app.is_admin()) OR created_by = (select app.current_user_id()));
END IF; END $$;

DROP TRIGGER IF EXISTS set_timestamp_medications ON medications;
CREATE TRIGGER set_timestamp_medications
  BEFORE UPDATE ON medications
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE INDEX IF NOT EXISTS idx_medications_animal ON medications(animal_id);
CREATE INDEX IF NOT EXISTS idx_medications_status ON medications(status);


-- ####################################################################
-- TABELA: CONSULTATIONS (Consultas Veterinárias)
-- ####################################################################
CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason TEXT NOT NULL,
  diagnosis TEXT,
  treatment TEXT,
  medications TEXT,
  value NUMERIC(10,2),
  vet_name TEXT,
  clinic TEXT,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_vet_consultations' AND tablename = 'consultations') THEN
  CREATE POLICY "admins_vet_consultations" ON consultations
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')) OR (select has_role('VET')));
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'read_consultations' AND tablename = 'consultations') THEN
  CREATE POLICY "read_consultations" ON consultations
  FOR SELECT TO authenticated
  USING ((select app.is_admin()) OR created_by = (select app.current_user_id()));
END IF; END $$;

DROP TRIGGER IF EXISTS set_timestamp_consultations ON consultations;
CREATE TRIGGER set_timestamp_consultations
  BEFORE UPDATE ON consultations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE INDEX IF NOT EXISTS idx_consultations_animal ON consultations(animal_id);


-- ####################################################################
-- TABELA: WEIGHT_HISTORY (Histórico de Peso)
-- ####################################################################
CREATE TABLE IF NOT EXISTS weight_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  weight NUMERIC(5,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE weight_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_history FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_vet_weight' AND tablename = 'weight_history') THEN
  CREATE POLICY "admins_vet_weight" ON weight_history
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')) OR (select has_role('VET')));
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'read_weight' AND tablename = 'weight_history') THEN
  CREATE POLICY "read_weight" ON weight_history
  FOR SELECT TO authenticated
  USING ((select app.is_admin()) OR created_by = (select app.current_user_id()));
END IF; END $$;

CREATE INDEX IF NOT EXISTS idx_weight_animal ON weight_history(animal_id);
CREATE INDEX IF NOT EXISTS idx_weight_date ON weight_history(date);


-- ####################################################################
-- TABELA: HEAT_CYCLES (Ciclos de Cio)
-- ####################################################################
CREATE TABLE IF NOT EXISTS heat_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  intensity TEXT,
  was_mated BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE heat_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE heat_cycles FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_vet_heatcycles' AND tablename = 'heat_cycles') THEN
  CREATE POLICY "admins_vet_heatcycles" ON heat_cycles
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')) OR (select has_role('VET')));
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'read_heatcycles' AND tablename = 'heat_cycles') THEN
  CREATE POLICY "read_heatcycles" ON heat_cycles
  FOR SELECT TO authenticated
  USING ((select app.is_admin()) OR created_by = (select app.current_user_id()));
END IF; END $$;

DROP TRIGGER IF EXISTS set_timestamp_heat_cycles ON heat_cycles;
CREATE TRIGGER set_timestamp_heat_cycles
  BEFORE UPDATE ON heat_cycles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE INDEX IF NOT EXISTS idx_heatcycles_animal ON heat_cycles(animal_id);


-- ####################################################################
-- TABELA: MATINGS (Coberturas/Inseminações)
-- ####################################################################
CREATE TABLE IF NOT EXISTS matings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  female_id UUID REFERENCES animals(id) ON DELETE SET NULL,
  male_id UUID REFERENCES animals(id) ON DELETE SET NULL,
  type insemination_type DEFAULT 'NATURAL',
  date DATE NOT NULL,
  result TEXT,
  litter_id UUID REFERENCES litters(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE matings ENABLE ROW LEVEL SECURITY;
ALTER TABLE matings FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_vet_matings' AND tablename = 'matings') THEN
  CREATE POLICY "admins_vet_matings" ON matings
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')) OR (select has_role('VET')));
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'read_matings' AND tablename = 'matings') THEN
  CREATE POLICY "read_matings" ON matings
  FOR SELECT TO authenticated
  USING ((select app.is_admin()) OR created_by = (select app.current_user_id()));
END IF; END $$;

DROP TRIGGER IF EXISTS set_timestamp_matings ON matings;
CREATE TRIGGER set_timestamp_matings
  BEFORE UPDATE ON matings
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE INDEX IF NOT EXISTS idx_matings_female ON matings(female_id);
CREATE INDEX IF NOT EXISTS idx_matings_male ON matings(male_id);


-- ####################################################################
-- TABELA: GESTATIONS (Gestação)
-- ####################################################################
CREATE TABLE IF NOT EXISTS gestations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,
  mating_id UUID REFERENCES matings(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  expected_birth_date DATE,
  actual_birth_date DATE,
  estimated_puppies INT,
  progress_week INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gestations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gestations FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_vet_gestations' AND tablename = 'gestations') THEN
  CREATE POLICY "admins_vet_gestations" ON gestations
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')) OR (select has_role('VET')));
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'read_gestations' AND tablename = 'gestations') THEN
  CREATE POLICY "read_gestations" ON gestations
  FOR SELECT TO authenticated
  USING ((select app.is_admin()) OR created_by = (select app.current_user_id()));
END IF; END $$;

DROP TRIGGER IF EXISTS set_timestamp_gestations ON gestations;
CREATE TRIGGER set_timestamp_gestations
  BEFORE UPDATE ON gestations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE INDEX IF NOT EXISTS idx_gestations_animal ON gestations(animal_id);
CREATE INDEX IF NOT EXISTS idx_gestations_active ON gestations(is_active);


-- ####################################################################
-- TABELA: FINANCIAL_TRANSACTIONS (Movimentações Financeiras)
-- ####################################################################
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN CREATE TYPE transaction_status AS ENUM ('PAID', 'PENDING', 'OVERDUE', 'CANCELLED'); END IF; END $$;

CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type entry_type NOT NULL,
  category cost_category NOT NULL DEFAULT 'OTHER',
  amount NUMERIC(12,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  status transaction_status DEFAULT 'PAID',
  payment_method TEXT,
  due_date DATE,
  paid_date DATE,
  receipt_url TEXT,
  animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  puppy_id UUID REFERENCES puppies(id) ON DELETE SET NULL,
  litter_id UUID REFERENCES litters(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_financial_transactions' AND tablename = 'financial_transactions') THEN
  CREATE POLICY "admins_financial_transactions" ON financial_transactions
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')) OR (select has_role('FINANCIAL')));
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'read_transactions' AND tablename = 'financial_transactions') THEN
  CREATE POLICY "read_transactions" ON financial_transactions
  FOR SELECT TO authenticated
  USING ((select app.is_admin()) OR created_by = (select app.current_user_id()));
END IF; END $$;

DROP TRIGGER IF EXISTS set_timestamp_transactions ON financial_transactions;
CREATE TRIGGER set_timestamp_transactions
  BEFORE UPDATE ON financial_transactions
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE INDEX IF NOT EXISTS idx_transactions_type ON financial_transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON financial_transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON financial_transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_animal ON financial_transactions(animal_id);
CREATE INDEX IF NOT EXISTS idx_transactions_client ON financial_transactions(client_id);


-- ####################################################################
-- TABELA: INSTALLMENTS (Parcelas)
-- ####################################################################
CREATE TABLE IF NOT EXISTS installments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES financial_transactions(id) ON DELETE CASCADE,
  installment_number INT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  paid_amount NUMERIC(12,2),
  status installment_status DEFAULT 'PENDING',
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_financial_installments' AND tablename = 'installments') THEN
  CREATE POLICY "admins_financial_installments" ON installments
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')) OR (select has_role('FINANCIAL')));
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'read_installments' AND tablename = 'installments') THEN
  CREATE POLICY "read_installments" ON installments
  FOR SELECT TO authenticated
  USING ((select app.is_admin()) OR created_by = (select app.current_user_id()));
END IF; END $$;

DROP TRIGGER IF EXISTS set_timestamp_installments ON installments;
CREATE TRIGGER set_timestamp_installments
  BEFORE UPDATE ON installments
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE INDEX IF NOT EXISTS idx_installments_transaction ON installments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_installments_status ON installments(status);
CREATE INDEX IF NOT EXISTS idx_installments_duedate ON installments(due_date);
CREATE INDEX IF NOT EXISTS idx_installments_created_by ON installments(created_by);


-- ####################################################################
-- TABELA: CALENDAR_EVENTS (Calendário Unificado)
-- ####################################################################
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  end_time TIME,
  category calendar_category NOT NULL DEFAULT 'MANUAL',
  description TEXT,
  is_automatic BOOLEAN DEFAULT FALSE,
  color TEXT,
  status event_status DEFAULT 'PENDING',
  animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'all_read_calendar' AND tablename = 'calendar_events') THEN
  CREATE POLICY "all_read_calendar" ON calendar_events
  FOR SELECT TO authenticated
  USING ((select app.is_admin()) OR created_by = (select app.current_user_id()));
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_calendar' AND tablename = 'calendar_events') THEN
  CREATE POLICY "admins_calendar" ON calendar_events
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')));
END IF; END $$;

DROP TRIGGER IF EXISTS set_timestamp_calendar_events ON calendar_events;
CREATE TRIGGER set_timestamp_calendar_events
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE INDEX IF NOT EXISTS idx_events_date ON calendar_events(date);
CREATE INDEX IF NOT EXISTS idx_events_category ON calendar_events(category);
CREATE INDEX IF NOT EXISTS idx_events_animal ON calendar_events(animal_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON calendar_events(status);


-- ####################################################################
-- TABELA: NOTIFICATIONS (Notificações do Sistema)
-- ####################################################################
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  reference_type TEXT,
  reference_id UUID,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_notifications' AND tablename = 'notifications') THEN
  CREATE POLICY "user_notifications" ON notifications
  FOR ALL TO authenticated
  USING ((select user_id()) = user_id);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_notifications' AND tablename = 'notifications') THEN
  CREATE POLICY "admins_notifications" ON notifications
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')));
END IF; END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);


-- ####################################################################
-- TABELA: DOCUMENTS (Documentos e Arquivos)
-- ####################################################################
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id UUID REFERENCES animals(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type document_type NOT NULL DEFAULT 'OTHER',
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INT,
  mime_type TEXT,
  description TEXT,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_vet_documents' AND tablename = 'documents') THEN
  CREATE POLICY "admins_vet_documents" ON documents
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')) OR (select has_role('VET')));
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'read_documents' AND tablename = 'documents') THEN
  CREATE POLICY "read_documents" ON documents
  FOR SELECT TO authenticated
  USING ((select app.is_admin()) OR uploaded_by = (select app.current_user_id()));
END IF; END $$;

DROP TRIGGER IF EXISTS set_timestamp_documents ON documents;
CREATE TRIGGER set_timestamp_documents
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE INDEX IF NOT EXISTS idx_documents_animal ON documents(animal_id);
CREATE INDEX IF NOT EXISTS idx_documents_client ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);


-- ####################################################################
-- TABELA: MESSAGE_TEMPLATES (Templates de Mensagens)
-- ####################################################################
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  category TEXT,
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_comercial_templates' AND tablename = 'message_templates') THEN
  CREATE POLICY "admins_comercial_templates" ON message_templates
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')) OR (select has_role('COMMERCIAL')));
END IF; END $$;

DROP TRIGGER IF EXISTS set_timestamp_templates ON message_templates;
CREATE TRIGGER set_timestamp_templates
  BEFORE UPDATE ON message_templates
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();


-- ####################################################################
-- TABELA: AUDIT_LOG (Log de Auditoria)
-- ####################################################################
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_audit' AND tablename = 'audit_log') THEN
  CREATE POLICY "admins_audit" ON audit_log
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')));
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'read_audit' AND tablename = 'audit_log') THEN
  CREATE POLICY "read_audit" ON audit_log
  FOR SELECT TO authenticated
  USING ((select app.is_admin()) OR user_id = (select app.current_user_id()));
END IF; END $$;

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);

-- Missing FK indexes
CREATE INDEX IF NOT EXISTS idx_interactions_user ON client_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploader ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_templates_creator ON message_templates(created_by);

-- Composite indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_type_date ON financial_transactions(type, date);
CREATE INDEX IF NOT EXISTS idx_transactions_type_cat ON financial_transactions(type, category);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_puppies_status_litter ON puppies(status, litter_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity_time ON audit_log(entity_type, created_at);


-- ####################################################################
-- TABELA: SYSTEM_CONFIG (Configurações do Sistema)
-- ####################################################################
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_config' AND tablename = 'system_config') THEN
  CREATE POLICY "admins_config" ON system_config
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')));
END IF; END $$;

DROP TRIGGER IF EXISTS set_timestamp_system_config ON system_config;
CREATE TRIGGER set_timestamp_system_config
  BEFORE UPDATE ON system_config
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();


-- ####################################################################
-- SEED DATA - Usuário Admin Padrão
-- ####################################################################
-- Para criar o primeiro admin:
--   1. Gere um hash bcrypt: node -e "require('bcrypt').hash('SENHA_TEMP', 10).then(console.log)"
--   2. Insira: INSERT INTO users (name, email, password_hash, role, status, is_protected, require_password_change)
--      VALUES ('Admin', 'admin@exemplo.com', 'SEU_HASH_AQUI', 'ADMIN', 'ACTIVE', TRUE, TRUE);
--
-- IMPORTANTE: Nunca commite hashes hardcoded no schema.
-- O admin é gerenciado via aplicação com coluna is_protected.


-- ####################################################################
-- SEED DATA - Configurações Iniciais do Sistema
-- ####################################################################
INSERT INTO system_config (key, value, description, updated_by)
SELECT v.key, v.value, v.description, u.id
FROM (VALUES
  ('smtp_config', '{"host": "", "port": 587, "user": "", "pass": "", "from_name": "KennelManager Pro", "from_email": "noreply@kennelmanager.com"}'::jsonb, 'Configuração de email SMTP'),
  ('session_config', '{"timeout_minutes": 30, "max_login_attempts": 5, "lockout_duration_minutes": 15}'::jsonb, 'Configurações de sessão e segurança'),
  ('breed_defaults', '{"default_breed": "", "default_size": "MEDIUM"}'::jsonb, 'Valores padrão para cadastro de animais')
) AS v(key, value, description)
CROSS JOIN (SELECT id FROM users WHERE email = 'admin@admin.com' LIMIT 1) AS u
ON CONFLICT (key) DO NOTHING;


-- ####################################################################
-- VALIDAÇÕES E MANUTENÇÃO
-- ####################################################################

-- Atualizar contagem de filhotes na ninhada quando um filhote é inserido
CREATE OR REPLACE FUNCTION update_litter_puppy_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE litters SET
      total_puppies = (SELECT COUNT(*) FROM puppies WHERE litter_id = NEW.litter_id),
      male_count = (SELECT COUNT(*) FROM puppies WHERE litter_id = NEW.litter_id AND sex = 'MALE'),
      female_count = (SELECT COUNT(*) FROM puppies WHERE litter_id = NEW.litter_id AND sex = 'FEMALE')
    WHERE id = NEW.litter_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE litters SET
      total_puppies = (SELECT COUNT(*) FROM puppies WHERE litter_id = OLD.litter_id),
      male_count = (SELECT COUNT(*) FROM puppies WHERE litter_id = OLD.litter_id AND sex = 'MALE'),
      female_count = (SELECT COUNT(*) FROM puppies WHERE litter_id = OLD.litter_id AND sex = 'FEMALE')
    WHERE id = OLD.litter_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_litter_counts ON puppies;
CREATE TRIGGER trigger_update_litter_counts
  AFTER INSERT OR DELETE OR UPDATE OF sex, litter_id ON puppies
  FOR EACH ROW EXECUTE FUNCTION update_litter_puppy_count();


-- (Trigger de atualização de cliente via funil foi removido na simplificação do pipeline de vendas)


-- ====================================================================
-- CHECK CONSTRAINTS
-- ====================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_amount_positive' AND conrelid = 'financial_transactions'::regclass) THEN
    ALTER TABLE financial_transactions ADD CONSTRAINT chk_amount_positive CHECK (amount > 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_installment_amount' AND conrelid = 'installments'::regclass) THEN
    ALTER TABLE installments ADD CONSTRAINT chk_installment_amount CHECK (amount > 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_installment_number' AND conrelid = 'installments'::regclass) THEN
    ALTER TABLE installments ADD CONSTRAINT chk_installment_number CHECK (installment_number > 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_total_puppies' AND conrelid = 'litters'::regclass) THEN
    ALTER TABLE litters ADD CONSTRAINT chk_total_puppies CHECK (total_puppies >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_puppy_counts' AND conrelid = 'litters'::regclass) THEN
    ALTER TABLE litters ADD CONSTRAINT chk_puppy_counts CHECK (male_count + female_count <= total_puppies);
  END IF;
END $$;


-- ====================================================================
-- CHECK CONSTRAINTS ADICIONAIS
-- ====================================================================
DO $$
BEGIN
  -- animals: weight > 0 quando preenchido
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_animal_weight' AND conrelid = 'animals'::regclass) THEN
    ALTER TABLE animals ADD CONSTRAINT chk_animal_weight CHECK (weight IS NULL OR weight > 0);
  END IF;
  -- animals: death_date > birth_date quando ambos preenchidos
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_animal_dates' AND conrelid = 'animals'::regclass) THEN
    ALTER TABLE animals ADD CONSTRAINT chk_animal_dates CHECK (death_date IS NULL OR birth_date IS NULL OR death_date > birth_date);
  END IF;
  -- puppies: weight > 0 quando preenchido
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_puppy_weight' AND conrelid = 'puppies'::regclass) THEN
    ALTER TABLE puppies ADD CONSTRAINT chk_puppy_weight CHECK (weight IS NULL OR weight > 0);
  END IF;
  -- puppies: price > 0 quando preenchido
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_puppy_price' AND conrelid = 'puppies'::regclass) THEN
    ALTER TABLE puppies ADD CONSTRAINT chk_puppy_price CHECK (price IS NULL OR price > 0);
  END IF;
  -- financial_transactions: status já é ENUM transaction_status — CHECK redundante removido
  -- IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_transaction_status' AND conrelid = 'financial_transactions'::regclass) THEN
  --   ALTER TABLE financial_transactions ADD CONSTRAINT chk_transaction_status CHECK (status IN ('PAID', 'PENDING', 'OVERDUE', 'CANCELLED'));
  -- END IF;
  -- vaccines: next_due_date > date quando ambos preenchidos
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_vaccine_dates' AND conrelid = 'vaccines'::regclass) THEN
    ALTER TABLE vaccines ADD CONSTRAINT chk_vaccine_dates CHECK (next_due_date IS NULL OR date IS NULL OR next_due_date > date);
  END IF;
  -- deworming: next_due_date > date quando ambos preenchidos
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_deworming_dates' AND conrelid = 'deworming'::regclass) THEN
    ALTER TABLE deworming ADD CONSTRAINT chk_deworming_dates CHECK (next_due_date IS NULL OR date IS NULL OR next_due_date > date);
  END IF;
  -- weight_history: weight > 0
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_weight_positive' AND conrelid = 'weight_history'::regclass) THEN
    ALTER TABLE weight_history ADD CONSTRAINT chk_weight_positive CHECK (weight > 0);
  END IF;
END $$;


-- ====================================================================
-- ÍNDICES ADICIONAIS
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_users_created_by ON users(created_by);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_animals_owner_id ON animals(owner_id);
CREATE INDEX IF NOT EXISTS idx_animals_birth_date ON animals(birth_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_due_date ON financial_transactions(due_date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_litter_id ON financial_transactions(litter_id);
CREATE INDEX IF NOT EXISTS idx_client_interactions_client_date ON client_interactions(client_id, date);
CREATE INDEX IF NOT EXISTS idx_exams_type ON exams(type);
CREATE INDEX IF NOT EXISTS idx_sales_completed_at ON sales(completed_at);
CREATE INDEX IF NOT EXISTS idx_message_templates_category ON message_templates(category);
CREATE INDEX IF NOT EXISTS idx_message_templates_is_active ON message_templates(is_active);

-- Índices created_by para tabelas que ainda não possuem
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by);
CREATE INDEX IF NOT EXISTS idx_animals_created_by ON animals(created_by);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_by ON waitlist(created_by);
CREATE INDEX IF NOT EXISTS idx_litters_created_by ON litters(created_by);
CREATE INDEX IF NOT EXISTS idx_puppies_created_by ON puppies(created_by);
CREATE INDEX IF NOT EXISTS idx_vaccines_created_by ON vaccines(created_by);
CREATE INDEX IF NOT EXISTS idx_deworming_created_by ON deworming(created_by);
CREATE INDEX IF NOT EXISTS idx_exams_created_by ON exams(created_by);
CREATE INDEX IF NOT EXISTS idx_medications_created_by ON medications(created_by);
CREATE INDEX IF NOT EXISTS idx_consultations_created_by ON consultations(created_by);
CREATE INDEX IF NOT EXISTS idx_weight_history_created_by ON weight_history(created_by);
CREATE INDEX IF NOT EXISTS idx_heat_cycles_created_by ON heat_cycles(created_by);
CREATE INDEX IF NOT EXISTS idx_matings_created_by ON matings(created_by);
CREATE INDEX IF NOT EXISTS idx_gestations_created_by ON gestations(created_by);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_created_by ON financial_transactions(created_by);
CREATE INDEX IF NOT EXISTS idx_calendar_events_created_by ON calendar_events(created_by);
CREATE INDEX IF NOT EXISTS idx_message_templates_created_by ON message_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_client_interactions_user_id ON client_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);


-- ====================================================================
-- TABELA: LITTER_HEALTH_EVENTS (Vacinas/Vermífugos por Ninhada)
-- ====================================================================
CREATE TABLE IF NOT EXISTS litter_health_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  litter_id UUID NOT NULL REFERENCES litters(id) ON DELETE CASCADE,
  type event_type NOT NULL,
  name TEXT NOT NULL,
  manufacturer TEXT,
  dose TEXT,
  date DATE NOT NULL,
  next_due_date DATE,
  amount NUMERIC(12,2) CHECK (amount IS NULL OR amount > 0),
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE litter_health_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE litter_health_events FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_vet_litter_health_events' AND tablename = 'litter_health_events') THEN
  CREATE POLICY "admins_vet_litter_health_events" ON litter_health_events
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')) OR (select has_role('VET')));
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'read_litter_health_events' AND tablename = 'litter_health_events') THEN
  CREATE POLICY "read_litter_health_events" ON litter_health_events
  FOR SELECT TO authenticated
  USING ((select app.is_admin()) OR created_by = (select app.current_user_id()));
END IF; END $$;

DROP TRIGGER IF EXISTS set_timestamp_litter_health_events ON litter_health_events;
CREATE TRIGGER set_timestamp_litter_health_events
  BEFORE UPDATE ON litter_health_events
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE INDEX IF NOT EXISTS idx_litter_health_events_litter_id ON litter_health_events(litter_id);
CREATE INDEX IF NOT EXISTS idx_litter_health_events_date ON litter_health_events(date DESC);
CREATE INDEX IF NOT EXISTS idx_litter_health_events_created_by ON litter_health_events(created_by);

-- ####################################################################
-- TABELA: REFRESH_TOKENS (Refresh Token Rotation)
-- ####################################################################
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);

ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens FORCE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_own_refresh_tokens' AND tablename = 'refresh_tokens') THEN
  CREATE POLICY "user_own_refresh_tokens" ON refresh_tokens
  FOR ALL TO authenticated
  USING ((select user_id()) = user_id)
  WITH CHECK ((select user_id()) = user_id);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admins_refresh_tokens' AND tablename = 'refresh_tokens') THEN
  CREATE POLICY "admins_refresh_tokens" ON refresh_tokens
  FOR ALL TO authenticated
  USING ((select has_role('ADMIN')));
END IF; END $$;


-- ####################################################################
-- TABELA: PASSWORD_RESET_TOKENS (Reset de Senha)
-- ####################################################################
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens(user_id);


-- ====================================================================
-- MIGRAÇÕES DE SCHEMA
-- ====================================================================

-- Migrate sales.status from TEXT+CHECK to ENUM sales_status
ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_status_check;
ALTER TABLE sales ALTER COLUMN status TYPE sales_status USING status::sales_status;
ALTER TABLE sales ALTER COLUMN status SET DEFAULT 'PENDING';


-- ====================================================================
-- DATA INTEGRITY: NOT NULL + FOREIGN KEY on user-reference columns
-- ====================================================================
-- Safely adds NOT NULL constraints and named FK constraints with
-- ON DELETE RESTRICT to ALL tables that reference users.
-- Uses IF EXISTS / IF NOT EXISTS guards to be idempotent.
-- ====================================================================

-- First: fix the seed admin user's NULL created_by (self-reference)
UPDATE users SET created_by = id WHERE created_by IS NULL;

-- ====================================================================
-- Main DO block: process ALL user-reference columns
-- ====================================================================
DO $$
BEGIN
  -- ==========================================
  -- TABLES WITH created_by COLUMN
  -- ==========================================

  -- --------------------------------------------------
  -- users.created_by
  -- NOTE: Mantém NULLABLE — o primeiro admin não tem criador.
  -- --------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'users_created_by_fkey') THEN
    ALTER TABLE users DROP CONSTRAINT users_created_by_fkey;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_users_created_by') THEN
    ALTER TABLE users ADD CONSTRAINT fk_users_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;

  -- --------------------------------------------------
  -- clients.created_by
  -- --------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'created_by' AND is_nullable = 'YES') THEN
    ALTER TABLE clients ALTER COLUMN created_by SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'clients_created_by_fkey') THEN
    ALTER TABLE clients DROP CONSTRAINT clients_created_by_fkey;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_clients_created_by') THEN
    ALTER TABLE clients ADD CONSTRAINT fk_clients_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;

  -- --------------------------------------------------
  -- animals.created_by
  -- --------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'animals' AND column_name = 'created_by' AND is_nullable = 'YES') THEN
    ALTER TABLE animals ALTER COLUMN created_by SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'animals_created_by_fkey') THEN
    ALTER TABLE animals DROP CONSTRAINT animals_created_by_fkey;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_animals_created_by') THEN
    ALTER TABLE animals ADD CONSTRAINT fk_animals_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;

  -- --------------------------------------------------
  -- waitlist.created_by
  -- --------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'waitlist' AND column_name = 'created_by' AND is_nullable = 'YES') THEN
    ALTER TABLE waitlist ALTER COLUMN created_by SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'waitlist_created_by_fkey') THEN
    ALTER TABLE waitlist DROP CONSTRAINT waitlist_created_by_fkey;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_waitlist_created_by') THEN
    ALTER TABLE waitlist ADD CONSTRAINT fk_waitlist_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;

  -- --------------------------------------------------
  -- litters.created_by
  -- --------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'litters' AND column_name = 'created_by' AND is_nullable = 'YES') THEN
    ALTER TABLE litters ALTER COLUMN created_by SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'litters_created_by_fkey') THEN
    ALTER TABLE litters DROP CONSTRAINT litters_created_by_fkey;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_litters_created_by') THEN
    ALTER TABLE litters ADD CONSTRAINT fk_litters_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;

  -- --------------------------------------------------
  -- puppies.created_by
  -- --------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'puppies' AND column_name = 'created_by' AND is_nullable = 'YES') THEN
    ALTER TABLE puppies ALTER COLUMN created_by SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'puppies_created_by_fkey') THEN
    ALTER TABLE puppies DROP CONSTRAINT puppies_created_by_fkey;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_puppies_created_by') THEN
    ALTER TABLE puppies ADD CONSTRAINT fk_puppies_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;

  -- --------------------------------------------------
  -- sales.created_by
  -- --------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'created_by' AND is_nullable = 'YES') THEN
    ALTER TABLE sales ALTER COLUMN created_by SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'sales_created_by_fkey') THEN
    ALTER TABLE sales DROP CONSTRAINT sales_created_by_fkey;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_sales_created_by') THEN
    ALTER TABLE sales ADD CONSTRAINT fk_sales_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;

  -- --------------------------------------------------
  -- vaccines.created_by
  -- --------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vaccines' AND column_name = 'created_by' AND is_nullable = 'YES') THEN
    ALTER TABLE vaccines ALTER COLUMN created_by SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'vaccines_created_by_fkey') THEN
    ALTER TABLE vaccines DROP CONSTRAINT vaccines_created_by_fkey;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_vaccines_created_by') THEN
    ALTER TABLE vaccines ADD CONSTRAINT fk_vaccines_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;

  -- --------------------------------------------------
  -- deworming.created_by
  -- --------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deworming' AND column_name = 'created_by' AND is_nullable = 'YES') THEN
    ALTER TABLE deworming ALTER COLUMN created_by SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'deworming_created_by_fkey') THEN
    ALTER TABLE deworming DROP CONSTRAINT deworming_created_by_fkey;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_deworming_created_by') THEN
    ALTER TABLE deworming ADD CONSTRAINT fk_deworming_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;

  -- --------------------------------------------------
  -- exams.created_by
  -- --------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exams' AND column_name = 'created_by' AND is_nullable = 'YES') THEN
    ALTER TABLE exams ALTER COLUMN created_by SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'exams_created_by_fkey') THEN
    ALTER TABLE exams DROP CONSTRAINT exams_created_by_fkey;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_exams_created_by') THEN
    ALTER TABLE exams ADD CONSTRAINT fk_exams_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;

  -- --------------------------------------------------
  -- medications.created_by
  -- --------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'created_by' AND is_nullable = 'YES') THEN
    ALTER TABLE medications ALTER COLUMN created_by SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'medications_created_by_fkey') THEN
    ALTER TABLE medications DROP CONSTRAINT medications_created_by_fkey;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_medications_created_by') THEN
    ALTER TABLE medications ADD CONSTRAINT fk_medications_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;

  -- --------------------------------------------------
  -- consultations.created_by
  -- --------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consultations' AND column_name = 'created_by' AND is_nullable = 'YES') THEN
    ALTER TABLE consultations ALTER COLUMN created_by SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'consultations_created_by_fkey') THEN
    ALTER TABLE consultations DROP CONSTRAINT consultations_created_by_fkey;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_consultations_created_by') THEN
    ALTER TABLE consultations ADD CONSTRAINT fk_consultations_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;

  -- --------------------------------------------------
  -- weight_history.created_by
  -- --------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weight_history' AND column_name = 'created_by' AND is_nullable = 'YES') THEN
    ALTER TABLE weight_history ALTER COLUMN created_by SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'weight_history_created_by_fkey') THEN
    ALTER TABLE weight_history DROP CONSTRAINT weight_history_created_by_fkey;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_weight_history_created_by') THEN
    ALTER TABLE weight_history ADD CONSTRAINT fk_weight_history_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;

  -- --------------------------------------------------
  -- heat_cycles.created_by
  -- --------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'heat_cycles' AND column_name = 'created_by' AND is_nullable = 'YES') THEN
    ALTER TABLE heat_cycles ALTER COLUMN created_by SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'heat_cycles_created_by_fkey') THEN
    ALTER TABLE heat_cycles DROP CONSTRAINT heat_cycles_created_by_fkey;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_heat_cycles_created_by') THEN
    ALTER TABLE heat_cycles ADD CONSTRAINT fk_heat_cycles_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;

  -- --------------------------------------------------
  -- matings.created_by
  -- --------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matings' AND column_name = 'created_by' AND is_nullable = 'YES') THEN
    ALTER TABLE matings ALTER COLUMN created_by SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'matings_created_by_fkey') THEN
    ALTER TABLE matings DROP CONSTRAINT matings_created_by_fkey;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_matings_created_by') THEN
    ALTER TABLE matings ADD CONSTRAINT fk_matings_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;

  -- --------------------------------------------------
  -- gestations.created_by
  -- --------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gestations' AND column_name = 'created_by' AND is_nullable = 'YES') THEN
    ALTER TABLE gestations ALTER COLUMN created_by SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'gestations_created_by_fkey') THEN
    ALTER TABLE gestations DROP CONSTRAINT gestations_created_by_fkey;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_gestations_created_by') THEN
    ALTER TABLE gestations ADD CONSTRAINT fk_gestations_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;

  -- --------------------------------------------------
  -- financial_transactions.created_by
  -- --------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'created_by' AND is_nullable = 'YES') THEN
    ALTER TABLE financial_transactions ALTER COLUMN created_by SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'financial_transactions_created_by_fkey') THEN
    ALTER TABLE financial_transactions DROP CONSTRAINT financial_transactions_created_by_fkey;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_financial_transactions_created_by') THEN
    ALTER TABLE financial_transactions ADD CONSTRAINT fk_financial_transactions_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;

  -- --------------------------------------------------
  -- calendar_events.created_by
  -- --------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'created_by' AND is_nullable = 'YES') THEN
    ALTER TABLE calendar_events ALTER COLUMN created_by SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'calendar_events_created_by_fkey') THEN
    ALTER TABLE calendar_events DROP CONSTRAINT calendar_events_created_by_fkey;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_calendar_events_created_by') THEN
    ALTER TABLE calendar_events ADD CONSTRAINT fk_calendar_events_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;

  -- --------------------------------------------------
  -- message_templates.created_by
  -- --------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'message_templates' AND column_name = 'created_by' AND is_nullable = 'YES') THEN
    ALTER TABLE message_templates ALTER COLUMN created_by SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'message_templates_created_by_fkey') THEN
    ALTER TABLE message_templates DROP CONSTRAINT message_templates_created_by_fkey;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_message_templates_created_by') THEN
    ALTER TABLE message_templates ADD CONSTRAINT fk_message_templates_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;

  -- --------------------------------------------------
  -- installments.created_by
  -- --------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'installments_created_by_fkey') THEN
    ALTER TABLE installments DROP CONSTRAINT installments_created_by_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'installments' AND column_name = 'created_by' AND is_nullable = 'YES') THEN
    ALTER TABLE installments ALTER COLUMN created_by SET NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_installments_created_by') THEN
    ALTER TABLE installments ADD CONSTRAINT fk_installments_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;

  -- ==========================================
  -- TABLES WITH EQUIVALENT (non-created_by) COLUMNS
  -- ==========================================

  -- --------------------------------------------------
  -- documents.uploaded_by → fk_documents_uploaded_by
  -- --------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'uploaded_by' AND is_nullable = 'YES') THEN
    ALTER TABLE documents ALTER COLUMN uploaded_by SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'documents_uploaded_by_fkey') THEN
    ALTER TABLE documents DROP CONSTRAINT documents_uploaded_by_fkey;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_documents_uploaded_by') THEN
    ALTER TABLE documents ADD CONSTRAINT fk_documents_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;

  -- --------------------------------------------------
  -- client_interactions.user_id → fk_interactions_user_id
  -- --------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_interactions' AND column_name = 'user_id' AND is_nullable = 'YES') THEN
    ALTER TABLE client_interactions ALTER COLUMN user_id SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'client_interactions_user_id_fkey') THEN
    ALTER TABLE client_interactions DROP CONSTRAINT client_interactions_user_id_fkey;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_interactions_user_id') THEN
    ALTER TABLE client_interactions ADD CONSTRAINT fk_interactions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;

  -- --------------------------------------------------
  -- audit_log.user_id → fk_audit_log_user_id
  -- NULLABLE: eventos como LOGIN_FAILED não têm userId.
  -- ON DELETE SET NULL: se usuário for deletado, manter log.
  -- --------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'audit_log_user_id_fkey') THEN
    ALTER TABLE audit_log DROP CONSTRAINT audit_log_user_id_fkey;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_audit_log_user_id') THEN
    ALTER TABLE audit_log ADD CONSTRAINT fk_audit_log_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;

  -- --------------------------------------------------
  -- system_config.updated_by → fk_config_updated_by
  -- Nota: updated_by mantém-se NULL por padrão (seed data não tem created_by).
  -- ON DELETE SET NULL na definição da coluna, mas aqui usamos RESTRICT
  -- para impedir deleção de usuário que atualizou config.
  -- --------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'system_config_updated_by_fkey') THEN
    ALTER TABLE system_config DROP CONSTRAINT system_config_updated_by_fkey;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_config_updated_by') THEN
    ALTER TABLE system_config ADD CONSTRAINT fk_config_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;

  -- --------------------------------------------------
  -- notifications.user_id → fk_notifications_user_id
  -- NOTE: PK já notifica com ON DELETE CASCADE (linha 932)
  -- --------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'user_id' AND is_nullable = 'YES') THEN
    ALTER TABLE notifications ALTER COLUMN user_id SET NOT NULL;
  END IF;

END $$;


-- ====================================================================
-- MIGRATION: Remover coluna status da tabela clients
-- ====================================================================
DROP INDEX IF EXISTS idx_clients_status;
ALTER TABLE clients DROP COLUMN IF EXISTS status;

-- 2026-06-09: Limpar registros financeiros órfãos (animal/puppy/litter deletados)
DELETE FROM financial_transactions WHERE animal_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM animals WHERE id = animal_id);
DELETE FROM financial_transactions WHERE puppy_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM puppies WHERE id = puppy_id);
DELETE FROM financial_transactions WHERE litter_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM litters WHERE id = litter_id);

-- 2026-06-09: Add litter_id to gestations for bidirectional link
ALTER TABLE gestations ADD COLUMN IF NOT EXISTS litter_id UUID REFERENCES litters(id) ON DELETE SET NULL;

-- 2026-06-09: Add is_available_for_breeding to animals
ALTER TABLE animals ADD COLUMN IF NOT EXISTS is_available_for_breeding BOOLEAN DEFAULT TRUE;

-- ====================================================================
-- UNIQUE CONSTRAINTS
-- ====================================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_heat_cycles_animal_start') THEN
    ALTER TABLE heat_cycles ADD CONSTRAINT uq_heat_cycles_animal_start UNIQUE (animal_id, start_date);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_matings_female_male_date') THEN
    ALTER TABLE matings ADD CONSTRAINT uq_matings_female_male_date UNIQUE (female_id, male_id, date);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_vaccines_animal_name_date') THEN
    ALTER TABLE vaccines ADD CONSTRAINT uq_vaccines_animal_name_date UNIQUE (animal_id, name, date);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_deworming_animal_product_date') THEN
    ALTER TABLE deworming ADD CONSTRAINT uq_deworming_animal_product_date UNIQUE (animal_id, product, date);
  END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS idx_litters_unique_mother_father_birth ON litters(mother_id, father_id, birth_date) WHERE birth_date IS NOT NULL;

-- ====================================================================
-- FIM DO SCHEMA
-- ====================================================================
-- Total: 20 tabelas + 7 tabelas de saúde/reprodução + 3 auxiliares
-- Compatível com: Supabase (RLS via public.*), PostgreSQL 14+
-- ====================================================================
