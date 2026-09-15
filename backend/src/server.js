const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const pool = require('./db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

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



/* ---------------- GEMINI AI COMMUNICATION ENGINE ---------------- */

async function ensureMilestone2Tables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS campaign_ai_configs (
      campaign_id INT PRIMARY KEY,
      scenario TEXT NOT NULL,
      location VARCHAR(255) NULL,
      tone VARCHAR(80) DEFAULT 'Informative',
      languages JSON NULL,
      channels JSON NULL,
      use_preferred_languages BOOLEAN DEFAULT TRUE,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_campaign_ai_config_campaign
        FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id) ON DELETE CASCADE
    )
  `);
  const [columns] = await pool.query(`
    SELECT COUNT(*) count FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'campaign_ai_configs' AND COLUMN_NAME = 'use_preferred_languages'
  `);
  if (Number(columns[0].count) === 0) {
    await pool.query('ALTER TABLE campaign_ai_configs ADD COLUMN use_preferred_languages BOOLEAN DEFAULT TRUE');
  }
}

function cleanJsonText(text) {
  const trimmed = String(text || '').trim();
  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  return trimmed;
}

function extractGeminiText(data) {
  return (data?.candidates || [])
    .flatMap(candidate => candidate?.content?.parts || [])
    .map(part => part?.text || '')
    .join('\n')
    .trim();
}

function parseGeminiJson(text) {
  const cleaned = cleanJsonText(text);
  try { return JSON.parse(cleaned); }
  catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error('Gemini returned an invalid structured response');
  }
}

app.get('/api/campaigns/:id/ai-config', auth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM campaign_ai_configs WHERE campaign_id=?', [req.params.id]);
    if (!rows.length) return res.json({ config: null });
    const row = rows[0];
    res.json({ config: { ...row, languages: JSON.parse(row.languages || '[]'), channels: JSON.parse(row.channels || '[]'), usePreferredLanguages: row.use_preferred_languages !== 0 } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/campaigns/:id/ai-config', auth, async (req, res) => {
  try {
    const { scenario, location, tone, languages, channels, usePreferredLanguages } = req.body || {};
    if (!scenario?.trim()) return res.status(400).json({ message: 'Scenario is required' });
    const safeLanguages = Array.isArray(languages) && languages.length ? languages : ['English'];
    const safeChannels = Array.isArray(channels) && channels.length ? channels : ['SMS'];
    await pool.query(
      `INSERT INTO campaign_ai_configs (campaign_id, scenario, location, tone, languages, channels, use_preferred_languages)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE scenario=VALUES(scenario), location=VALUES(location), tone=VALUES(tone), languages=VALUES(languages), channels=VALUES(channels), use_preferred_languages=VALUES(use_preferred_languages)`,
      [req.params.id, scenario.trim(), location || null, tone || 'Informative', JSON.stringify(safeLanguages), JSON.stringify(safeChannels), usePreferredLanguages !== false]
    );
    res.json({ message: 'AI campaign configuration saved' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/audiences/:id/recipients', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.recipient_id, r.first_name, r.last_name, r.phone, r.email, r.language, r.state, r.district, r.city
      FROM recipients r
      INNER JOIN audience_members am ON am.recipient_id=r.recipient_id
      WHERE am.audience_id=? AND r.status='ACTIVE'
      ORDER BY r.recipient_id
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/admin/seed-regional-audiences', auth, async (req, res) => {
  const groups = [
    ['Tamil Nadu Residents', 'Tamil Nadu public-awareness recipients'],
    ['Chennai Residents', 'Major city audience for Chennai'],
    ['Kanchipuram Residents', 'Major city audience for Kanchipuram'],
    ['Thanjavur Residents', 'Major city audience for Thanjavur'],
    ['Tiruchirappalli Residents', 'Major city audience for Tiruchirappalli'],
    ['Coimbatore Residents', 'Major city audience for Coimbatore'],
    ['Madurai Residents', 'Major city audience for Madurai'],
    ['Salem Residents', 'Major city audience for Salem'],
    ['Tirunelveli Residents', 'Major city audience for Tirunelveli'],
    ['Vellore Residents', 'Major city audience for Vellore'],
    ['Erode Residents', 'Major city audience for Erode'],
    ['Kerala Residents', 'Kerala public-awareness recipients'],
    ['Karnataka Residents', 'Karnataka public-awareness recipients'],
  ];
  try {
    for (const [name, description] of groups) {
      await pool.query('INSERT INTO audiences (name, description) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM audiences WHERE name=?)', [name, description, name]);
    }
    const [rows] = await pool.query('SELECT a.audience_id, a.name, a.description, COUNT(am.recipient_id) members FROM audiences a LEFT JOIN audience_members am ON a.audience_id=am.audience_id GROUP BY a.audience_id ORDER BY a.audience_id');
    res.json({ message: 'Regional audiences are ready', audiences: rows });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/ai/generate-content', auth, async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ message: 'Gemini is not configured. Add GEMINI_API_KEY to backend/.env and restart the backend.' });
    }

    const { campaign, scenario, audience, audience_id, location, tone, languages, channels, usePreferredLanguages } = req.body || {};
    if (!campaign || !scenario || !audience || !tone) {
      return res.status(400).json({ message: 'Campaign, scenario, audience and tone are required' });
    }

    let selectedLanguages = Array.isArray(languages) && languages.length ? languages : ['English'];
    const selectedChannels = Array.isArray(channels) && channels.length ? channels : ['SMS'];

    let recipientCount = null;
    let languageDistribution = {};
    if (audience_id) {
      const [[row]] = await pool.query(`SELECT COUNT(*) count FROM audience_members am INNER JOIN recipients r ON r.recipient_id=am.recipient_id WHERE am.audience_id=? AND r.status='ACTIVE'`, [audience_id]);
      recipientCount = Number(row.count);
      const [languageRows] = await pool.query(`SELECT COALESCE(NULLIF(TRIM(r.language), ''), 'English') language, COUNT(*) count FROM audience_members am INNER JOIN recipients r ON r.recipient_id=am.recipient_id WHERE am.audience_id=? AND r.status='ACTIVE' GROUP BY COALESCE(NULLIF(TRIM(r.language), ''), 'English') ORDER BY count DESC`, [audience_id]);
      languageDistribution = Object.fromEntries(languageRows.map(row => [row.language, Number(row.count)]));
      if (usePreferredLanguages && Object.keys(languageDistribution).length) {
        selectedLanguages = Object.keys(languageDistribution);
      }
    }

    const prompt = `You are SAMVAAD's public-awareness communication engine. Create safe, factual, natural and actionable public communication from the administrator's scenario. Do not invent statistics, medical claims, government schemes, contact numbers, dates or facts that are not in the scenario. Preserve the intended meaning across languages.

CAMPAIGN: ${campaign}
SCENARIO: ${scenario}
AUDIENCE: ${audience}
LOCATION: ${location || 'Not specified'}
TONE: ${tone}
CHANNELS: ${selectedChannels.join(', ')}
LANGUAGES: ${selectedLanguages.join(', ')}
RECIPIENT COUNT: ${recipientCount ?? 'All eligible recipients'}

Return ONLY valid JSON with this shape:
{
  "baseContent": "English master communication",
  "localizedContent": { "English": "...", "Tamil": "..." },
  "channelVersions": { "SMS": { "English": "..." }, "WhatsApp": { "English": "..." } },
  "personalizationScore": 0,
  "personalizationSummary": "...",
  "toneOptimizationScore": 0,
  "toneOptimizationSummary": "...",
  "qualityNotes": ["brief note"]
}

Rules:
1. Generate a clear master communication that directly addresses the scenario and audience.
2. Generate a natural, meaning-preserving version for EVERY requested language. Do not transliterate unless the language itself normally uses that script.
3. For SMS, keep each version concise and practical. For WhatsApp, allow a more detailed but still readable message.
4. Keep proper nouns, numbers and actionable instructions consistent across translations.
5. Do not include headings, hashtags or emojis inside the messages.
6. Score audience personalization from 0-100 based on how well the message reflects the selected audience, location, scenario and preferred-language distribution.
7. Score sentiment and tone optimization from 0-100 based on whether the emotional framing is appropriate for the requested tone and public-awareness context.
8. Do not claim that translation is 100% accurate; instead, make it review-ready and note any terminology concern in qualityNotes.`;

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.35, maxOutputTokens: 8000 },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error?.message || 'Gemini content generation failed');
    }

    const raw = extractGeminiText(data);
    if (!raw) throw new Error('Gemini returned an empty response');
    const result = parseGeminiJson(raw);

    return res.json({
      ...result,
      provider: 'Google Gemini',
      model,
      recipientCount,
      languageDistribution,
      notice: `Generated with ${model}. Review the localized versions before approval.`,
    });
  } catch (err) {
    res.status(502).json({ message: err.message || 'Gemini generation failed' });
  }
});


function runNlpQuality(text, language) {
  return new Promise((resolve) => {
    const script = path.join(__dirname, '..', 'nlp_service', 'quality_check.py');
    const child = spawn(process.platform === 'win32' ? 'python' : 'python3', [script], { stdio: ['pipe', 'pipe', 'ignore'] });
    let output = '';
    let settled = false;
    const finish = (value) => { if (!settled) { settled = true; resolve(value); } };
    child.stdout.on('data', chunk => { output += chunk.toString(); });
    child.on('error', () => finish(null));
    child.on('close', code => {
      if (code !== 0) return finish(null);
      try { finish(JSON.parse(output)); } catch { finish(null); }
    });
    child.stdin.end(JSON.stringify({ text: String(text || ''), language: language || 'English' }));
    setTimeout(() => { try { child.kill(); } catch {} finish(null); }, 8000);
  });
}

app.post('/api/ai/quality-check', auth, async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ message: 'Gemini is not configured. Add GEMINI_API_KEY to backend/.env and restart the backend.' });
    }
    const { campaign, scenario, audience, location, tone, languages, content, baseContent } = req.body || {};
    if (!campaign || !scenario || !audience || !content || !Object.keys(content).length) {
      return res.status(400).json({ message: 'Campaign, scenario, audience and generated content are required' });
    }

    const nlpResults = {};
    for (const [language, text] of Object.entries(content)) {
      const nlp = await runNlpQuality(text, language);
      if (nlp) nlpResults[language] = nlp;
    }
    const allText = Object.values(content).join('\n\n');
    const prompt = `You are SAMVAAD's AI quality and compliance evaluator for public-awareness communication.

Campaign: ${campaign}
Scenario: ${scenario}
Audience: ${audience}
Location: ${location || 'Not specified'}
Requested tone: ${tone || 'Informative'}
Languages: ${(languages || []).join(', ')}

Evaluate the generated content below. Do not invent facts while evaluating. Treat unsupported claims, fabricated statistics, unsafe medical/legal claims, discriminatory language, harassment, fear-inducing wording without scenario support, privacy violations, or instructions that could create public harm as compliance/sensitivity risks.

Generated content:
${allText}

Return ONLY valid JSON:
{
  "grammarScore": 0,
  "clarityScore": 0,
  "toneScore": 0,
  "factualAccuracyScore": 0,
  "sensitiveContentScore": 0,
  "complianceScore": 0,
  "summary": "short decision-oriented summary",
  "grammarNote": "...",
  "clarityNote": "...",
  "toneNote": "...",
  "factualNote": "...",
  "sensitiveNote": "...",
  "complianceNote": "...",
  "languageScores": { "English": 0 },
  "flags": ["only important review flags"]
}

Scoring rules: 90-100 excellent, 75-89 good with minor review, 60-74 review needed, below 60 needs revision. Score factual accuracy conservatively: only claims supported by the scenario should receive high scores. Sensitive content and compliance are risk scores where 100 means no concerning content detected. Keep flags empty when there are no material issues.`;

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.15, maxOutputTokens: 5000 },
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message || 'Gemini quality evaluation failed');
    const evaluated = parseGeminiJson(extractGeminiText(data));
    const dimensions = ['grammarScore','clarityScore','toneScore','factualAccuracyScore','sensitiveContentScore','complianceScore'];
    const normalized = {};
    for (const key of dimensions) normalized[key] = Math.max(0, Math.min(100, Number(evaluated[key] ?? 0)));
    const overallScore = Math.round(dimensions.reduce((sum, key) => sum + normalized[key], 0) / dimensions.length);
    const nlp = nlpResults[Object.keys(content)[0]] || null;
    res.json({
      ...evaluated,
      ...normalized,
      overallScore,
      nlp: nlp || { sentenceCount: 0, tokenCount: 0, flagCount: 0, engine: 'spaCy + Indic NLP Library' },
      nlpByLanguage: nlpResults,
      engine: `Gemini ${model} + spaCy + Indic NLP Library`,
    });
  } catch (err) {
    res.status(502).json({ message: err.message || 'AI quality and compliance check failed' });
  }
});

(async () => {
  try {
    await ensureMilestone2Tables();
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Backend running on http://localhost:${process.env.PORT || 5000}`)
    );
  } catch (err) {
    console.error('Backend startup failed:', err.message);
    process.exit(1);
  }
})();
