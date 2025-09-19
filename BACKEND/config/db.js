import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || "postgres",   // <--- service name, not localhost
  user: process.env.DB_USER || "mark",       // same as POSTGRES_USER in docker-compose
  database: process.env.DB_NAME || "sih",   // same as POSTGRES_DB in docker-compose
  password: process.env.DB_PASSWORD || "secret123", // same as POSTGRES_PASSWORD
  port: process.env.DB_PORT || 5433,
});

export default pool;



/*-- simple_schema.sql
-- Basic DB schema for Digital Krishi Officer (MVP, easy to understand)

-- USERS: farmers, admins, officers
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) UNIQUE,
 
  role VARCHAR(50) DEFAULT 'farmer',  -- 'farmer','admin','officer'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PROFILES: extra info for a user (one row per user)
CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
   name VARCHAR(200),
  village VARCHAR(200),
  district VARCHAR(200),
  preferred_language VARCHAR(10) DEFAULT 'ml', -- 'ml' for Malayalam
  crops TEXT,            -- comma-separated simple list e.g. 'banana,tomato'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- QUERIES: every question a farmer asks
CREATE TABLE queries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  input_type VARCHAR(20) DEFAULT 'text', -- 'text','voice','image'
  text_input TEXT,      -- typed text or final transcript
  image_url TEXT,       -- optional single image URL/path
  crop_hint VARCHAR(100),
  ai_response TEXT,     -- simple text answer from LLM or "see ticket"
  ai_confidence NUMERIC, -- 0.0 - 1.0
  escalate BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- IMAGES: store uploaded images (optional separate table)
CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  query_id INTEGER REFERENCES queries(id) ON DELETE CASCADE,
  url TEXT,
  filename VARCHAR(300),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TICKETS: escalations for experts (linked to a query)
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  query_id INTEGER REFERENCES queries(id) ON DELETE CASCADE,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL, -- farmer
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL, -- officer
  status VARCHAR(30) DEFAULT 'open', -- 'open','in_progress','resolved'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- FEEDBACK: farmer feedback on answers
CREATE TABLE feedback (
  id SERIAL PRIMARY KEY,
  query_id INTEGER REFERENCES queries(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  rating SMALLINT, -- e.g., 1..5
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ADVISORIES: simple knowledge base rows
CREATE TABLE advisories (
  id SERIAL PRIMARY KEY,
  crop VARCHAR(100),
  issue VARCHAR(200),
  advice TEXT,
  source VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT now()
);*/





