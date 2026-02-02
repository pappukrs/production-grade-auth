-- Ensure correct database
\c auth_db;



-- users table

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- refresh_token_table

CREATE TABLE refresh_tokens(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL ,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT false,
    replaced_by_token VARCHAR(500),
    CONSTRAINT fk_refresh_token_user 
        FOREIGN KEY (user_id)
         REFERENCES users(id)
         ON DELETE CASCADE

);


--   INDEX FOR THE FASTER QUERIES
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_user_email ON users(email);

