-- ============================================
-- BASE DE DATOS: CHESS APP
-- ============================================

CREATE DATABASE IF NOT EXISTS chess_db;
USE chess_db;

-- ============================================
-- TABLA: USUARIO
-- ============================================

CREATE TABLE usuario (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP NULL,
    elo INT DEFAULT 1000
);

-- ============================================
-- TABLA: ESTADISTICAS (1:1 con usuario)
-- ============================================

CREATE TABLE estadisticas (
    usuario_id CHAR(36) PRIMARY KEY,
    partidas_ganadas INT DEFAULT 0,
    partidas_perdidas INT DEFAULT 0,
    partidas_tablas INT DEFAULT 0,
    
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
        ON DELETE CASCADE
);

-- ============================================
-- TABLA: PARTIDA
-- ============================================

CREATE TABLE partida (
    id CHAR(36) PRIMARY KEY,
    jugador_blancas CHAR(36) NOT NULL,
    jugador_negras CHAR(36) NULL,
    
    jugador_actual CHAR(36)  NULL,
    ganador CHAR(36) NULL,
    turno CHAR(36) NOT NULL,    
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP NULL,

    FOREIGN KEY (jugador_blancas) REFERENCES usuario(id),
    FOREIGN KEY (jugador_negras) REFERENCES usuario(id),
    FOREIGN KEY (ganador) REFERENCES usuario(id)
);

-- ============================================
-- TABLA: MOVIMIENTOS
-- ============================================

CREATE TABLE movimiento (
    id CHAR(36) PRIMARY KEY,
    partida_id CHAR(36) NOT NULL,
    numero_movimiento INT NOT NULL,
    
    pieza VARCHAR(20),
    casilla_inicio VARCHAR(5),
    casilla_llegada VARCHAR(5),
    
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (partida_id) REFERENCES partida(id)
        ON DELETE CASCADE
);

-- ============================================
-- TABLA: HISTORIAL PARTIDAS
-- ============================================

CREATE TABLE historial_partidas (
    id CHAR(36) PRIMARY KEY,
    partida_id CHAR(36) NOT NULL,
    guardado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (partida_id) REFERENCES partida(id)
        ON DELETE CASCADE
);

-- ============================================
-- TABLA: AMISTAD
-- ============================================

CREATE TABLE amistad (
    id CHAR(36) PRIMARY KEY,
    usuario_id CHAR(36) NOT NULL,
    amigo_id CHAR(36) NOT NULL,
    
    estado ENUM('pendiente', 'aceptado', 'bloqueado') DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
        ON DELETE CASCADE,
    FOREIGN KEY (amigo_id) REFERENCES usuario(id)
        ON DELETE CASCADE,

    UNIQUE (usuario_id, amigo_id)
);

-- ============================================
-- TABLA: INVITACIONES DE PARTIDA
-- ============================================

CREATE TABLE invitacion_partida (
    id CHAR(36) PRIMARY KEY,
    emisor_id CHAR(36) NOT NULL,
    receptor_id CHAR(36) NOT NULL,
    
    estado ENUM('pendiente', 'aceptada', 'rechazada') DEFAULT 'pendiente',
    partida_id CHAR(36) NULL,
    
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (emisor_id) REFERENCES usuario(id)
        ON DELETE CASCADE,
    FOREIGN KEY (receptor_id) REFERENCES usuario(id)
        ON DELETE CASCADE,
    FOREIGN KEY (partida_id) REFERENCES partida(id)
        ON DELETE SET NULL
);

