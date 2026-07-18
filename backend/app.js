const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'supersecretpassword',
    database: process.env.DB_NAME || 'seguridad_db',
    port: 5432,
});

const renderHTML = (message = '', comments = []) => {
    const visibleComments = comments.filter(c => c.content && String(c.content).trim());
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aula Virtual — Laboratorio de Seguridad</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        :root {
            --bg-deep: #0f172a;
            --bg-card: rgba(30, 41, 59, 0.72);
            --bg-card-hover: rgba(51, 65, 85, 0.85);
            --border: rgba(148, 163, 184, 0.15);
            --text: #f1f5f9;
            --text-muted: #94a3b8;
            --primary: #6366f1;
            --primary-light: #818cf8;
            --accent: #06b6d4;
            --success: #22c55e;
            --success-bg: rgba(34, 197, 94, 0.12);
            --danger: #f87171;
            --danger-bg: rgba(248, 113, 113, 0.12);
            --shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);
            --radius: 16px;
            --radius-sm: 10px;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Inter', 'Segoe UI', sans-serif;
            background: var(--bg-deep);
            color: var(--text);
            min-height: 100vh;
            overflow-x: hidden;
        }

        .bg-pattern {
            position: fixed;
            inset: 0;
            background:
                radial-gradient(ellipse 80% 50% at 20% -10%, rgba(99, 102, 241, 0.25), transparent),
                radial-gradient(ellipse 60% 40% at 90% 10%, rgba(6, 182, 212, 0.18), transparent),
                radial-gradient(ellipse 50% 30% at 50% 100%, rgba(99, 102, 241, 0.12), transparent);
            pointer-events: none;
            z-index: 0;
        }

        .floating-shapes {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
        }

        .shape {
            position: absolute;
            border-radius: 50%;
            opacity: 0.06;
            animation: float 20s ease-in-out infinite;
        }

        .shape:nth-child(1) { width: 300px; height: 300px; background: var(--primary); top: 10%; left: -5%; animation-delay: 0s; }
        .shape:nth-child(2) { width: 200px; height: 200px; background: var(--accent); top: 60%; right: -3%; animation-delay: -7s; }
        .shape:nth-child(3) { width: 150px; height: 150px; background: var(--primary-light); bottom: 15%; left: 40%; animation-delay: -14s; }

        @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            33% { transform: translateY(-20px) rotate(5deg); }
            66% { transform: translateY(10px) rotate(-3deg); }
        }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(24px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideIn {
            from { opacity: 0; transform: translateX(-12px); }
            to { opacity: 1; transform: translateX(0); }
        }

        @keyframes pulse-soft {
            0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.35); }
            50% { box-shadow: 0 0 0 8px rgba(99, 102, 241, 0); }
        }

        .app-shell {
            position: relative;
            z-index: 1;
            max-width: 1100px;
            margin: 0 auto;
            padding: 24px 20px 48px;
        }

        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 16px;
            padding: 20px 28px;
            background: var(--bg-card);
            backdrop-filter: blur(16px);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            margin-bottom: 28px;
            animation: fadeInUp 0.6s ease-out;
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .brand-icon {
            width: 52px;
            height: 52px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            border-radius: 14px;
            font-size: 1.4rem;
            color: white;
            animation: pulse-soft 3s ease-in-out infinite;
        }

        .brand-text h1 {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 1.35rem;
            font-weight: 700;
            letter-spacing: -0.02em;
        }

        .brand-text p {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-top: 2px;
        }

        .header-badges {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 14px;
            background: rgba(99, 102, 241, 0.15);
            border: 1px solid rgba(99, 102, 241, 0.25);
            border-radius: 999px;
            font-size: 0.78rem;
            font-weight: 500;
            color: var(--primary-light);
            transition: transform 0.25s ease, background 0.25s ease;
        }

        .badge:hover { transform: translateY(-2px); background: rgba(99, 102, 241, 0.22); }
        .badge i { font-size: 0.75rem; }

        .main-grid {
            display: grid;
            grid-template-columns: 1fr 1.15fr;
            gap: 24px;
        }

        @media (max-width: 820px) {
            .main-grid { grid-template-columns: 1fr; }
        }

        .card {
            background: var(--bg-card);
            backdrop-filter: blur(16px);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 28px;
            box-shadow: var(--shadow);
            transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.35s ease, background 0.35s ease;
            animation: fadeInUp 0.6s ease-out backwards;
        }

        .card-login { animation-delay: 0.1s; }
        .card-forum { animation-delay: 0.2s; }

        .card:hover {
            transform: translateY(-4px);
            border-color: rgba(99, 102, 241, 0.3);
            background: var(--bg-card-hover);
        }

        .card-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 22px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border);
        }

        .card-header-icon {
            width: 42px;
            height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius-sm);
            font-size: 1.1rem;
        }

        .card-header-icon.login { background: rgba(99, 102, 241, 0.2); color: var(--primary-light); }
        .card-header-icon.forum { background: rgba(6, 182, 212, 0.2); color: var(--accent); }

        .card-header h2 {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 1.15rem;
            font-weight: 700;
        }

        .card-header span {
            display: block;
            font-size: 0.8rem;
            color: var(--text-muted);
            font-weight: 400;
            margin-top: 2px;
        }

        .form-group {
            margin-bottom: 18px;
        }

        .form-group label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.85rem;
            font-weight: 500;
            color: var(--text-muted);
            margin-bottom: 8px;
        }

        .form-group label i {
            color: var(--primary-light);
            width: 16px;
            text-align: center;
        }

        .input-wrap {
            position: relative;
        }

        .input-wrap i.field-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
            font-size: 0.9rem;
            transition: color 0.25s ease;
            pointer-events: none;
        }

        input[type="text"],
        input[type="password"] {
            width: 100%;
            padding: 13px 14px 13px 42px;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            color: var(--text);
            font-family: inherit;
            font-size: 0.95rem;
            transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
        }

        input[type="text"]:focus,
        input[type="password"]:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
            background: rgba(15, 23, 42, 0.85);
        }

        input:focus + i.field-icon,
        .input-wrap:focus-within i.field-icon {
            color: var(--primary-light);
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            padding: 13px 20px;
            margin-top: 6px;
            border: none;
            border-radius: var(--radius-sm);
            font-family: inherit;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.25s ease, background 0.25s ease;
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--primary), #4f46e5);
            color: white;
            box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(99, 102, 241, 0.45);
        }

        .btn-primary:active { transform: translateY(0); }

        .btn-accent {
            background: linear-gradient(135deg, var(--accent), #0891b2);
            color: white;
            box-shadow: 0 4px 14px rgba(6, 182, 212, 0.35);
        }

        .btn-accent:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(6, 182, 212, 0.4);
        }

        .feedback {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-top: 18px;
            padding: 14px 16px;
            border-radius: var(--radius-sm);
            font-size: 0.88rem;
            line-height: 1.5;
            animation: slideIn 0.4s ease-out;
        }

        .feedback:empty { display: none; }

        .feedback.alert {
            background: var(--danger-bg);
            border: 1px solid rgba(248, 113, 113, 0.3);
            color: var(--danger);
        }

        .feedback.success {
            background: var(--success-bg);
            border: 1px solid rgba(34, 197, 94, 0.3);
            color: var(--success);
        }

        .feedback i { margin-top: 2px; flex-shrink: 0; }

        .comments-list {
            list-style: none;
            margin-top: 20px;
            max-height: 340px;
            overflow-y: auto;
            padding-right: 4px;
        }

        .comments-list::-webkit-scrollbar { width: 6px; }
        .comments-list::-webkit-scrollbar-track { background: transparent; }
        .comments-list::-webkit-scrollbar-thumb {
            background: rgba(148, 163, 184, 0.3);
            border-radius: 999px;
        }

        .comment-item {
            display: flex;
            gap: 14px;
            padding: 16px;
            margin-bottom: 12px;
            background: rgba(15, 23, 42, 0.5);
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
            animation: slideIn 0.45s ease-out backwards;
        }

        .comment-item:hover {
            transform: translateX(4px);
            border-color: rgba(6, 182, 212, 0.25);
            background: rgba(15, 23, 42, 0.7);
        }

        .comment-avatar {
            width: 40px;
            height: 40px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(99, 102, 241, 0.3));
            border-radius: 50%;
            color: var(--accent);
            font-size: 0.95rem;
        }

        .comment-body {
            flex: 1;
            font-size: 0.92rem;
            line-height: 1.55;
            word-break: break-word;
        }

        .empty-forum {
            text-align: center;
            padding: 32px 16px;
            color: var(--text-muted);
        }

        .empty-forum i {
            font-size: 2.5rem;
            margin-bottom: 12px;
            opacity: 0.4;
            display: block;
        }

        .footer-bar {
            margin-top: 28px;
            text-align: center;
            font-size: 0.78rem;
            color: var(--text-muted);
            animation: fadeInUp 0.6s ease-out 0.35s backwards;
        }

        .footer-bar i { color: var(--primary-light); margin-right: 4px; }
    </style>
</head>
<body>
    <div class="bg-pattern"></div>
    <div class="floating-shapes">
        <div class="shape"></div>
        <div class="shape"></div>
        <div class="shape"></div>
    </div>

    <div class="app-shell">
        <header class="header">
            <div class="brand">
                <div class="brand-icon"><i class="fa-solid fa-shield-halved"></i></div>
                <div class="brand-text">
                    <h1>Aula Virtual de Seguridad</h1>
                    <p>Laboratorio de Tecnologías de Seguridad — EPN</p>
                </div>
            </div>
            <div class="header-badges">
                <span class="badge"><i class="fa-solid fa-book-open"></i> Módulo activo</span>
                <span class="badge"><i class="fa-solid fa-users"></i> Foro colaborativo</span>
            </div>
        </header>

        <div class="main-grid">
            <section class="card card-login">
                <div class="card-header">
                    <div class="card-header-icon login"><i class="fa-solid fa-right-to-bracket"></i></div>
                    <div>
                        <h2>Panel de Autenticación</h2>
                        <span>Accede con tus credenciales institucionales</span>
                    </div>
                </div>

                <form action="/login" method="POST">
                    <div class="form-group">
                        <label><i class="fa-solid fa-user"></i> Usuario</label>
                        <div class="input-wrap">
                            <input type="text" name="username" placeholder="Ingresa tu usuario">
                            <i class="fa-solid fa-user field-icon"></i>
                        </div>
                    </div>
                    <div class="form-group">
                        <label><i class="fa-solid fa-lock"></i> Contraseña</label>
                        <div class="input-wrap">
                            <input type="password" name="password" placeholder="Ingresa tu contraseña">
                            <i class="fa-solid fa-lock field-icon"></i>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary">
                        <i class="fa-solid fa-arrow-right-to-bracket"></i> Iniciar Sesión
                    </button>
                </form>

                ${message ? `
                <div class="feedback ${message.includes('Éxito') ? 'success' : 'alert'}">
                    <i class="fa-solid ${message.includes('Éxito') ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i>
                    <span>${message}</span>
                </div>` : ''}
            </section>

            <section class="card card-forum">
                <div class="card-header">
                    <div class="card-header-icon forum"><i class="fa-solid fa-comments"></i></div>
                    <div>
                        <h2>Foro Interno</h2>
                        <span>Comparte dudas y reflexiones con la clase</span>
                    </div>
                </div>

                <form action="/comment" method="POST">
                    <div class="form-group">
                        <label><i class="fa-solid fa-pen-to-square"></i> Dejar un comentario</label>
                        <div class="input-wrap">
                            <input type="text" name="content" autocomplete="off" placeholder="Escribe tu mensaje para el foro...">
                            <i class="fa-solid fa-message field-icon"></i>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-accent">
                        <i class="fa-solid fa-paper-plane"></i> Publicar
                    </button>
                </form>

                ${visibleComments.length > 0 ? `
                <ul class="comments-list">
                    ${visibleComments.map((c, i) => `
                    <li class="comment-item" style="animation-delay: ${i * 0.08}s">
                        <div class="comment-avatar"><i class="fa-solid fa-user-graduate"></i></div>
                        <div class="comment-body">${c.content}</div>
                    </li>`).join('')}
                </ul>
                ` : `
                <div class="empty-forum">
                    <i class="fa-regular fa-comment-dots"></i>
                    <p>Aún no hay comentarios. ¡Sé el primero en participar!</p>
                </div>
                `}
            </section>
        </div>

        <footer class="footer-bar">
            <i class="fa-solid fa-graduation-cap"></i> Recuerda: la ética va ante todo en este laboratorio.
        </footer>
    </div>
</body>
</html>
`;
};

// Ruta principal para cargar la página
app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT content FROM comments');
        res.send(renderHTML('', result.rows));
    } catch (err) {
        res.send(renderHTML('Error conectando a la base de datos', []));
    }
});

// Ruta vulnerable a Inyección SQL
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    
    try {
        console.log('Query ejecutada en la BD:', query); // Mostrar esto en consola suma puntos
        const result = await pool.query(query);
        const commentsResult = await pool.query('SELECT content FROM comments');
        
        if (result.rows.length > 0) {
            const role = result.rows[0].role;
            res.send(renderHTML(`¡Éxito! Bienvenido al sistema. Usuario: ${result.rows[0].username} | Privilegios: ${role}`, commentsResult.rows));
        } else {
            res.send(renderHTML('Acceso denegado: Credenciales incorrectas', commentsResult.rows));
        }
    } catch (err) {
        res.send(renderHTML(`Error de sintaxis SQL: ${err.message}`, []));
    }
});

// Ruta vulnerable a XSS (Rol 3)
app.post('/comment', async (req, res) => {
    const { content } = req.body;
    try {
        await pool.query(`INSERT INTO comments (content) VALUES ('${content}')`);
        res.redirect('/');
    } catch (err) {
        res.redirect('/');
    }
});

app.listen(port, () => {
    console.log(`Servidor de pruebas levantado en http://localhost:${port}`);
});