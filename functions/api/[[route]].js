// functions/api/[[route]].js

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // --- 1. LOGIN ---
  if (url.pathname === '/api/login' && request.method === 'POST') {
    try {
      const { email, password } = await request.json();
      const hash = await hashPassword(password);
      
      const user = await env.DB.prepare('SELECT * FROM users WHERE email = ? AND password = ?')
        .bind(email, hash).first();

      if (!user) return new Response(JSON.stringify({ error: 'Email ou mot de passe incorrect' }), { status: 401 });

      const token = crypto.randomUUID();
      // Expiration 24h
      const expires = Date.now() + (24 * 60 * 60 * 1000); 
      
      await env.DB.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
        .bind(token, user.id, expires).run();

      return new Response(JSON.stringify({ 
        token, 
        user: { first_name: user.first_name, last_name: user.last_name, service: user.service, email: user.email } 
      }), { status: 200 });
    } catch(e) { return new Response(e.message, { status: 500 }); }
  }

  // --- 2. VERIFICATION TOKEN (Middleware) ---
  // Pour toutes les autres routes API, on vérifie le token
  const token = request.headers.get('Authorization');
  if (!token) return new Response('Unauthorized', { status: 401 });
  
  const session = await env.DB.prepare(`
    SELECT s.*, u.first_name, u.last_name, u.id as uid 
    FROM sessions s 
    JOIN users u ON s.user_id = u.id 
    WHERE s.token = ? AND s.expires_at > ?
  `).bind(token, Date.now()).first();

  if (!session) return new Response('Session expirée', { status: 403 });

  // --- 3. GET INVENTAIRE ---
  if (url.pathname === '/api/inventory' && request.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM inventory ORDER BY id DESC').all();
    return new Response(JSON.stringify(results));
  }

  // --- 4. AJOUT INVENTAIRE ---
  if (url.pathname === '/api/inventory' && request.method === 'POST') {
    const data = await request.json();
    await env.DB.prepare(`
      INSERT INTO inventory (user_id, inv_number, designation, condition, location, category, observations) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(session.uid, data.inv_number, data.designation, data.condition, data.location, data.category, data.observations).run();
    return new Response('Saved', { status: 201 });
  }

  // --- 5. CHANGER PASS ---
  if (url.pathname === '/api/password' && request.method === 'POST') {
    const { newPassword } = await request.json();
    const newHash = await hashPassword(newPassword);
    await env.DB.prepare('UPDATE users SET password = ? WHERE id = ?').bind(newHash, session.uid).run();
    return new Response('Password Updated', { status: 200 });
  }
  
  // --- 6. LOGOUT ---
  if (url.pathname === '/api/logout') {
    await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
    return new Response('Logged out');
  }

  return new Response('Not Found', { status: 404 });
}

// Fonction utilitaire pour le hash
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
