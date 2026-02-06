-- ============================================
-- TABLE DES TYPES D'UTILISATEURS
-- ============================================
CREATE TABLE IF NOT EXISTS type_user (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- ============================================
-- TABLE DES STATUTS
-- ============================================
CREATE TABLE IF NOT EXISTS status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- ============================================
-- TABLE DES ENTREPRISES
-- ============================================
CREATE TABLE IF NOT EXISTS entreprise (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE
);

-- ============================================
-- TABLE DES UTILISATEURS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    type_user_id INT NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    login_attempts INT DEFAULT 0 CHECK (login_attempts >= 0),
    is_blocked BOOLEAN DEFAULT FALSE,
    blocked_at TIMESTAMP,
    last_login TIMESTAMP,

    CONSTRAINT fk_users_type
        FOREIGN KEY (type_user_id)
        REFERENCES type_user(id)
);

-- ============================================
-- TABLE DES SESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    is_active BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- ============================================
-- TABLE DES SIGNALEMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS signalement (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    status_id INT NOT NULL,
    entreprise_id INT,

    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    description TEXT NOT NULL,

    date_signalement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    surface_area DECIMAL(10, 2),
    budget DECIMAL(15, 2),

    CONSTRAINT fk_signalement_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_signalement_status
        FOREIGN KEY (status_id)
        REFERENCES status(id),

    CONSTRAINT fk_signalement_entreprise
        FOREIGN KEY (entreprise_id)
        REFERENCES entreprise(id)
);

-- ============================================
-- TABLE DES PHOTOS DE SIGNALEMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS signalement_photo (
    id SERIAL PRIMARY KEY,
    signalement_id INT NOT NULL,
    photo_url VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_signalement_photo_signalement
        FOREIGN KEY (signalement_id)
        REFERENCES signalement(id)
        ON DELETE CASCADE
);

-- ============================================
-- HISTORIQUE DES STATUTS DE SIGNALEMENT
-- ============================================
CREATE TABLE IF NOT EXISTS signalement_status (

    id SERIAL PRIMARY KEY,
    signalement_id INT NOT NULL,
    status_id INT NOT NULL,
    changed_by INT,

    date_status TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comment TEXT,

    CONSTRAINT fk_sig_status_signalement
        FOREIGN KEY (signalement_id)
        REFERENCES signalement(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_sig_status_status
        FOREIGN KEY (status_id)
        REFERENCES status(id),

    CONSTRAINT fk_sig_status_user
        FOREIGN KEY (changed_by)
        REFERENCES users(id)
);

-- ============================================
-- TABLE DE LOG DE SYNCHRONISATION
-- ============================================
CREATE TABLE IF NOT EXISTS sync_log (
    id SERIAL PRIMARY KEY,
    user_id INT,

    sync_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    direction VARCHAR(30) NOT NULL,
    records_count INT DEFAULT 0,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,

    CONSTRAINT fk_sync_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT chk_sync_direction
        CHECK (direction IN ('firebase_to_local', 'local_to_firebase')),

    CONSTRAINT chk_sync_status
        CHECK (status IN ('success', 'error', 'partial'))
);

-- ============================================
-- TABLES POUR LA VALIDATION ADMINISTRATIVE
-- ============================================

CREATE TABLE IF NOT EXISTS validation_status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS validation (
    id SERIAL PRIMARY KEY,
    signalement_id INT UNIQUE NOT NULL,
    validation_status_id INT NOT NULL,
    validated_by INT,
    validated_at TIMESTAMP,
    note TEXT,

    CONSTRAINT fk_validation_signalement
        FOREIGN KEY (signalement_id)
        REFERENCES signalement(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_validation_status
        FOREIGN KEY (validation_status_id)
        REFERENCES validation_status(id),

    CONSTRAINT fk_validation_user
        FOREIGN KEY (validated_by)
        REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS validation_history (
    id SERIAL PRIMARY KEY,
    validation_id INT NOT NULL,
    changed_by INT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    from_status_id INT,
    to_status_id INT,
    note TEXT,

    CONSTRAINT fk_vh_validation
        FOREIGN KEY (validation_id)
        REFERENCES validation(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_vh_changed_by
        FOREIGN KEY (changed_by)
        REFERENCES users(id),

    CONSTRAINT fk_vh_from_status
        FOREIGN KEY (from_status_id)
        REFERENCES validation_status(id),

    CONSTRAINT fk_vh_to_status
        FOREIGN KEY (to_status_id)
        REFERENCES validation_status(id)
);

-- Insert initial validation statuses (idempotent)
INSERT INTO validation_status (name, description)
VALUES
  ('PENDING', 'En attente de validation'),
  ('APPROVED', 'Validation acceptée'),
  ('REJECTED', 'Validation rejetée')
ON CONFLICT (name) DO NOTHING;
