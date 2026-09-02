const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const pool = require('./db');
require('dotenv').config();
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const app = express();
app.use(cors());
app.use(express.json());

function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query(
      'SELECT * FROM admins WHERE email=? AND is_active=1',
      [email]
    );
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });

    const admin = rows[0];
    const ok =
      crypto.createHash('sha256').update(password).digest('hex') === admin.password_hash;

    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { admin_id: admin.admin_id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      admin: {
        admin_id: admin.admin_id,
        full_name: admin.full_name,
        email: admin.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/stats', auth, async (req, res) => {
  try {
    const [[recipients]] = await pool.query('SELECT COUNT(*) count FROM recipients');
    const [[audiences]] = await pool.query('SELECT COUNT(*) count FROM audiences');
    const [[campaigns]] = await pool.query('SELECT COUNT(*) count FROM campaigns');
    const [[templates]] = await pool.query('SELECT COUNT(*) count FROM communication_templates');

    res.json({
      recipients: recipients.count,
      audiences: audiences.count,
      campaigns: campaigns.count,
      templates: templates.count,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- ADMIN PROFILE ---------------- */

app.get('/api/admin/profile', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT admin_id, full_name, email, is_active, created_at FROM admins WHERE admin_id=?',
      [req.user.admin_id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Administrator not found' });
    res.json({ admin: rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/admin/profile', auth, async (req, res) => {
  try {
    const { full_name, email } = req.body;
    if (!full_name || !email) return res.status(400).json({ message: 'Name and email are required' });

    await pool.query(
      'UPDATE admins SET full_name=?, email=? WHERE admin_id=?',
      [full_name, email, req.user.admin_id]
    );

    const [rows] = await pool.query(
      'SELECT admin_id, full_name, email, is_active, created_at FROM admins WHERE admin_id=?',
      [req.user.admin_id]
    );

    res.json({ admin: rows[0] });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'That email is already in use.' });
    res.status(400).json({ message: err.message });
  }
});

/* ---------------- RECIPIENTS ---------------- */

app.get('/api/recipients', auth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM recipients ORDER BY recipient_id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/recipients', auth, async (req, res) => {
  try {
    const {
      first_name, last_name, email, phone, age, gender,
      state, district, city, language, occupation
    } = req.body;

    const [r] = await pool.query(
      `INSERT INTO recipients
       (first_name,last_name,email,phone,age,gender,state,district,city,language,occupation)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [first_name, last_name, email || null, phone || null, age || null, gender || null,
       state, district || null, city || null, language || null, occupation || null]
    );

    res.status(201).json({ recipient_id: r.insertId });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/recipients/:id', auth, async (req, res) => {
  try {
    const {
      first_name, last_name, email, phone, age, gender,
      state, district, city, language, occupation, status
    } = req.body;

    await pool.query(
      `UPDATE recipients SET first_name=?,last_name=?,email=?,phone=?,age=?,gender=?,
       state=?,district=?,city=?,language=?,occupation=?,status=? WHERE recipient_id=?`,
      [first_name, last_name, email || null, phone || null, age || null, gender || null,
       state, district || null, city || null, language || null, occupation || null,
       status || 'ACTIVE', req.params.id]
    );

    res.json({ message: 'Recipient updated' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/recipients/:id', auth, async (req, res) => {
  try {
    await pool.query(
      'UPDATE recipients SET status="INACTIVE" WHERE recipient_id=?',
      [req.params.id]
    );
    res.json({ message: 'Recipient deactivated' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ---------------- AUDIENCES ---------------- */

app.get('/api/audiences', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.audience_id, a.name, a.description, a.created_at,
             COUNT(am.recipient_id) members
      FROM audiences a
      LEFT JOIN audience_members am ON a.audience_id=am.audience_id
      GROUP BY a.audience_id, a.name, a.description, a.created_at
      ORDER BY a.audience_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/audiences', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Audience name is required' });

    const [r] = await pool.query(
      'INSERT INTO audiences (name, description) VALUES (?, ?)',
      [name, description || null]
    );

    res.status(201).json({ audience_id: r.insertId });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/audiences/:id', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Audience name is required' });

    await pool.query(
      'UPDATE audiences SET name=?, description=? WHERE audience_id=?',
      [name, description || null, req.params.id]
    );

    res.json({ message: 'Audience updated' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/audiences/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM audiences WHERE audience_id=?', [req.params.id]);
    res.json({ message: 'Audience deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ---------------- CAMPAIGNS ---------------- */

app.get('/api/campaigns', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.campaign_id, c.name, c.description, c.status, c.created_at,
             a.audience_id, a.name audience
      FROM campaigns c
      LEFT JOIN campaign_audiences ca ON c.campaign_id=ca.campaign_id
      LEFT JOIN audiences a ON ca.audience_id=a.audience_id
      ORDER BY c.campaign_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/campaigns', auth, async (req, res) => {
  try {
    const { name, description, status } = req.body;
    if (!name) return res.status(400).json({ message: 'Campaign name is required' });

    const [r] = await pool.query(
      'INSERT INTO campaigns (name, description, status) VALUES (?, ?, ?)',
      [name, description || null, status || 'DRAFT']
    );

    res.status(201).json({ campaign_id: r.insertId });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/campaigns/:id', auth, async (req, res) => {
  try {
    const { name, description, status } = req.body;
    if (!name) return res.status(400).json({ message: 'Campaign name is required' });

    await pool.query(
      'UPDATE campaigns SET name=?, description=?, status=? WHERE campaign_id=?',
      [name, description || null, status || 'DRAFT', req.params.id]
    );

    res.json({ message: 'Campaign updated' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/campaigns/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM campaigns WHERE campaign_id=?', [req.params.id]);
    res.json({ message: 'Campaign deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/campaigns/:id/audience', auth, async (req, res) => {
  try {
    const { audience_id } = req.body;
    if (!audience_id) return res.status(400).json({ message: 'Audience is required' });

    await pool.query(
      'DELETE FROM campaign_audiences WHERE campaign_id=?',
      [req.params.id]
    );

    await pool.query(
      'INSERT INTO campaign_audiences (campaign_id, audience_id) VALUES (?, ?)',
      [req.params.id, audience_id]
    );

    res.json({ message: 'Campaign audience updated' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ---------------- TEMPLATES ---------------- */

app.get('/api/templates', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM communication_templates ORDER BY template_id'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/templates', auth, async (req, res) => {
  try {
    const { title, template_type, channel, content } = req.body;
    if (!title || !template_type || !content) {
      return res.status(400).json({ message: 'Title, type and content are required' });
    }

    const [r] = await pool.query(
      `INSERT INTO communication_templates (title, template_type, channel, content)
       VALUES (?, ?, ?, ?)`,
      [title, template_type, channel || 'SMS', content]
    );

    res.status(201).json({ template_id: r.insertId });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/templates/:id', auth, async (req, res) => {
  try {
    const { title, template_type, channel, content } = req.body;
    if (!title || !template_type || !content) {
      return res.status(400).json({ message: 'Title, type and content are required' });
    }

    await pool.query(
      `UPDATE communication_templates
       SET title=?, template_type=?, channel=?, content=?
       WHERE template_id=?`,
      [title, template_type, channel || 'SMS', content, req.params.id]
    );

    res.json({ message: 'Template updated' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/templates/:id', auth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM communication_templates WHERE template_id=?',
      [req.params.id]
    );
    res.json({ message: 'Template deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.listen(process.env.PORT || 5000, () =>
  console.log(`Backend running on http://localhost:${process.env.PORT || 5000}`)
);

