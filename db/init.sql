CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    password VARCHAR(50),
    role VARCHAR(20)
);

INSERT INTO users (username, password, role) VALUES 
('admin', 'admin123', 'administrator'),
('juan_lucero', 'password2026', 'student'),
('profesor', 'epn2026A', 'instructor');

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    content TEXT
);

INSERT INTO comments (content) VALUES 
('¡Bienvenidos al laboratorio de Tecnologías de Seguridad!'),
('Recuerden que la ética va ante todo.');