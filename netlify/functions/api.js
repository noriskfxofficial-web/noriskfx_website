const crypto = require('crypto');

let connectLambda, getStore;

try {
  ({ connectLambda, getStore } = require('@netlify/blobs'));
} catch (e) {
  connectLambda = null;
  getStore = null;
}

const STORE_NAME = process.env.BLOB_STORE || 'noriskfx-v20';
const DB_KEY = 'database.json';

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_EXPIRES_SECONDS = Number(process.env.JWT_EXPIRES_SECONDS || 60 * 60 * 8);

const API_VERSION = 'v20.2-resource-progress-fix';

function now() {
  return new Date().toISOString();
}

function id() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clone(v) {
  return JSON.parse(JSON.stringify(v || {}));
}

function resourceId(item, index) {
  if (item && item.id) return String(item.id);

  const base = String(
    (item && (item.title || item.name || item.url || item.fileName)) ||
      `resource-${index + 1}`
  )
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return base || `resource-${index + 1}`;
}

function json(statusCode, data) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
      'X-Content-Type-Options': 'nosniff',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS'
    },
    body: JSON.stringify(data)
  };
}

function body(event) {
  try {
    return JSON.parse(
      event.isBase64Encoded
        ? Buffer.from(event.body || '', 'base64').toString('utf8')
        : event.body || '{}'
    );
  } catch (e) {
    return {};
  }
}

function safe(a, b) {
  const A = Buffer.from(String(a || ''));
  const B = Buffer.from(String(b || ''));

  return A.length === B.length && crypto.timingSafeEqual(A, B);
}

function b64(v) {
  return Buffer.from(v).toString('base64url');
}

function sign(payload) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET missing');

  const data = b64(
    JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + JWT_EXPIRES_SECONDS
    })
  );

  const sig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest('base64url');

  return `${data}.${sig}`;
}

function verify(token) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET missing');
  if (!token || !token.includes('.')) throw new Error('Missing token');

  const [data, sig] = token.split('.');

  const expected = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest('base64url');

  if (!safe(sig, expected)) throw new Error('Invalid token');

  const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));

  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Expired token');
  }

  return payload;
}

function auth(event, role) {
  const h = event.headers.authorization || event.headers.Authorization || '';
  const user = verify(h.startsWith('Bearer ') ? h.slice(7) : '');

  if (role && user.role !== role) throw new Error('Unauthorized');

  return user;
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto
    .pbkdf2Sync(String(password), salt, 120000, 32, 'sha256')
    .toString('hex');

  return `${salt}:${hash}`;
}

function checkPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;

  const [salt, hash] = stored.split(':');

  return safe(hashPassword(password, salt).split(':')[1], hash);
}

const defaultContent = {
  settings: {
    supportEmail: 'noriskfxofficial@gmail.com',
    whatsapp: '+961 76 524 340'
  },
  site: {
    home: {
      hero: {
        title: 'واجهة أدوات تشبه غرف التداول الاحترافية',
        lead:
          'كل ما تحتاجه لإدارة قراراتك بثقة واحتراف: بيانات لحظية، موارد تعليمية، أدوات متقدمة، وبوابة عملاء مخصصة لك.'
      },
      calendar: {
        title: 'الأجندة الاقتصادية المباشرة'
      },
      learning: {
        title: 'تعلّم. طبّق. طوّر.'
      }
    }
  },
  collections: {
    services: [
      {
        title: 'مؤشرات TradingView',
        body:
          'مؤشرات احترافية وتنبيهات ذكية تساعدك تقرأ السوق بوضوح وتحوّل الفكرة إلى خطة.',
        icon: 'line-chart',
        image: 'nrfx-service-tradingview.png',
        cta: 'استكشف المؤشرات'
      },
      {
        title: 'أتمتة MT4 / MT5',
        body:
          'روبوتات تداول وخبراء مستشارين لأتمتة الاستراتيجيات وتنفيذ الصفقات بكفاءة.',
        icon: 'bot',
        image: 'nrfx-service-mt5.png',
        cta: 'اكتشف حلول الأتمتة'
      },
      {
        title: 'مجتمع المتداولين',
        body: 'مجتمع نشط لمشاركة الخبرات، مناقشة الفرص، والتعلم من محترفين.',
        icon: 'users',
        image: 'nrfx-service-community.png',
        cta: 'انضم للمجتمع'
      },
      {
        title: 'إدارة المخاطر',
        body: 'أدوات لحساب المخاطر، حجم الصفقات، ونسبة العائد إلى المخاطرة.',
        icon: 'shield-check',
        image: 'nrfx-service-risk.png',
        cta: 'احسب مخاطرك'
      },
      {
        title: 'تحليلات الأسواق',
        body: 'تحليلات يومية شاملة ونظرة فنية وأساسية وتحديثات لأهم الأسواق.',
        icon: 'bar-chart',
        image: 'nrfx-service-analysis.png',
        cta: 'عرض التحليلات'
      },
      {
        title: 'أكاديمية No Risk FX',
        body: 'دروس تعليمية احترافية ودورات متدرجة من المبتدئ إلى المتقدم.',
        icon: 'graduation-cap',
        image: 'nrfx-service-academy.png',
        cta: 'ابدأ التعلم الآن'
      }
    ],
    learning: [
      {
        title: 'الأساسيات',
        body: 'تعرف على الأسواق وأدوات التداول والمصطلحات الأساسية.'
      },
      {
        title: 'التحليل الفني',
        body: 'تعلم قراءة الشارت، الاتجاهات، الدعوم والمقاومات.'
      },
      {
        title: 'إدارة المخاطر',
        body: 'إدارة رأس المال، حجم الصفقة، ونسبة المخاطرة.'
      },
      {
        title: 'التطبيق العملي',
        body: 'تطبيق الاستراتيجيات في بيئة واقعية وتطوير خطة تداول.'
      }
    ]
  },
  pages: {}
};

const defaultPortal = {
  announcements: [
    {
      id: id(),
      title: 'Weekly Market Outlook — May 18, 2026',
      body: 'Key levels, macro catalysts, and scenarios to watch. Educational only.',
      date: now()
    },
    {
      id: id(),
      title: 'Platform resources updated',
      body: 'New risk management checklist and weekly routine are available.',
      date: now()
    }
  ],
  resources: [
    {
      id: id(),
      title: 'Weekly Market Routine',
      type: 'Guide',
      body: 'A step-by-step framework to start each week with clarity and focus.',
      url: 'academy.html',
      level: 'Beginner'
    },
    {
      id: id(),
      title: 'Risk Management Checklist',
      type: 'PDF',
      body: 'Essential checklist to protect capital and manage risk like a professional.',
      url: 'risk-disclosure.html',
      size: '2.4 MB'
    },
    {
      id: id(),
      title: 'Trading Psychology Guide',
      type: 'Guide',
      body: 'Build discipline and a calmer decision-making routine.',
      url: 'academy.html',
      level: 'Intermediate'
    },
    {
      id: id(),
      title: 'Economic Calendar Briefing',
      type: 'PDF',
      body: 'Key events, data releases and weekly market impact outlook.',
      url: 'index.html#weekly-news',
      level: 'Weekly Update'
    },
    {
      id: id(),
      title: 'Platform Setup Guide',
      type: 'Guide',
      body: 'Step-by-step instructions to set up and optimize your trading platform.',
      url: 'services.html',
      level: 'All levels'
    },
    {
      id: id(),
      title: 'Smart Strategy Breakdown',
      type: 'Video',
      body: 'A structured educational breakdown of a market scenario.',
      url: 'market-analysis.html',
      level: 'Advanced'
    }
  ],
  tickets: []
};

function defaultDb() {
  return {
    content: clone(defaultContent),
    portal: clone(defaultPortal),
    users: [],
    leads: [],
    updatedAt: now(),
    version: 22
  };
}

async function store(event) {
  if (connectLambda) connectLambda(event);

  return getStore
    ? getStore({
        name: STORE_NAME,
        consistency: 'strong'
      })
    : null;
}

async function readDb(event) {
  let db = null;

  try {
    const s = await store(event);
    if (s) db = await s.get(DB_KEY, { type: 'json' });
  } catch (e) {}

  if (!db) db = global.__NRFX_DB || defaultDb();

  db.content = {
    ...clone(defaultContent),
    ...clone(db.content || {}),
    settings: {
      ...defaultContent.settings,
      ...((db.content || {}).settings || {})
    }
  };

  db.portal = {
    ...clone(defaultPortal),
    ...clone(db.portal || {})
  };

  db.portal.resources = Array.isArray(db.portal.resources)
    ? db.portal.resources
    : clone(defaultPortal.resources);

  db.portal.resources = db.portal.resources.map((item, index) => ({
    ...item,
    id: resourceId(item, index)
  }));

  db.portal.announcements = Array.isArray(db.portal.announcements)
    ? db.portal.announcements
    : clone(defaultPortal.announcements);

  db.portal.announcements = db.portal.announcements.map((item, index) => ({
    ...item,
    id: item.id || `announcement-${index + 1}`
  }));

  db.portal.tickets = Array.isArray(db.portal.tickets) ? db.portal.tickets : [];
  db.users = Array.isArray(db.users) ? db.users : [];

  const validResourceIds = new Set(db.portal.resources.map((r) => r.id));

  db.users = db.users.map((u) => ({
    ...u,
    completedResources: Array.isArray(u.completedResources)
      ? u.completedResources.filter((rid) => validResourceIds.has(rid))
      : []
  }));

  return db;
}

async function writeDb(event, db) {
  db.updatedAt = now();
  db.version = 22;

  try {
    const s = await store(event);
    if (s) await s.setJSON(DB_KEY, db);
  } catch (e) {}

  global.__NRFX_DB = db;

  return db;
}

function route(event) {
  let p = event.path || '/';

  p = p
    .replace(/^\/\.netlify\/functions\/api\/?/, '/')
    .replace(/^\/api\/?/, '/');

  if (!p.startsWith('/')) p = '/' + p;

  return p.replace(/\/+$/, '') || '/';
}

exports.handler = async (event) => {
  const method = event.httpMethod || 'GET';
  const path = route(event);

  if (method === 'OPTIONS') return json(204, {});

  try {
    if (method === 'GET' && path === '/health') {
      return json(200, {
        ok: true,
        service: 'No Risk FX API',
        version: API_VERSION,
        storage: getStore ? 'netlify-blobs' : 'memory',
        adminPasswordFromEnv: Boolean(process.env.ADMIN_PASSWORD),
        jwtSecretFromEnv: Boolean(process.env.JWT_SECRET),
        adminPasswordLength: ADMIN_PASSWORD.length,
        jwtSecretLength: JWT_SECRET.length,
        blobStore: STORE_NAME,
        time: now()
      });
    }

    if (method === 'GET' && path === '/debug/routes') {
      return json(200, {
        ok: true,
        version: API_VERSION,
        routes: [
          'GET /api/health',
          'GET /api/public/content',
          'POST /api/auth/login',
          'POST /api/client/register',
          'POST /api/client/login',
          'GET /api/client/dashboard',
          'POST /api/client/progress',
          'POST /api/client/tickets',
          'GET /api/admin/content',
          'PUT /api/admin/content',
          'GET /api/admin/portal',
          'PUT /api/admin/portal'
        ],
        time: now()
      });
    }

    if (method === 'GET' && path === '/public/content') {
      const db = await readDb(event);
      return json(200, db.content);
    }

    if (method === 'POST' && path === '/auth/login') {
      const b = body(event);

      if (!ADMIN_PASSWORD || !JWT_SECRET) {
        return json(500, {
          error: 'ADMIN_PASSWORD/JWT_SECRET not configured'
        });
      }

      if (
        String(b.username || '') !== ADMIN_USER ||
        !safe(String(b.password || b.pin || ''), ADMIN_PASSWORD)
      ) {
        return json(401, { error: 'Invalid credentials' });
      }

      return json(200, {
        token: sign({
          sub: 'admin',
          role: 'admin',
          username: ADMIN_USER
        }),
        user: {
          username: ADMIN_USER,
          role: 'admin'
        }
      });
    }

    if (method === 'POST' && path === '/client/register') {
      const b = body(event);
      const db = await readDb(event);

      const email = String(b.email || '').toLowerCase().trim();

      if (!email || !b.password) {
        return json(400, {
          error: 'Email and password required'
        });
      }

      if (db.users.some((u) => u.email === email)) {
        return json(409, {
          error: 'User already exists'
        });
      }

      const user = {
        id: id(),
        email,
        name: String(b.name || email),
        passwordHash: hashPassword(b.password),
        plan: 'Client',
        completedResources: [],
        createdAt: now()
      };

      db.users.push(user);
      await writeDb(event, db);

      return json(200, {
        token: sign({
          sub: user.id,
          role: 'client',
          email
        }),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan
        }
      });
    }

    if (method === 'POST' && path === '/client/login') {
      const b = body(event);
      const db = await readDb(event);

      const email = String(b.email || '').toLowerCase().trim();
      const user = db.users.find((u) => u.email === email);

      if (!user || !checkPassword(b.password, user.passwordHash)) {
        return json(401, {
          error: 'Invalid credentials'
        });
      }

      return json(200, {
        token: sign({
          sub: user.id,
          role: 'client',
          email
        }),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan
        }
      });
    }

    if (path.startsWith('/client/')) {
      const u = auth(event, 'client');
      const db = await readDb(event);
      const user = db.users.find((x) => x.id === u.sub);

      if (!user) return json(401, { error: 'User not found' });

      user.completedResources = Array.isArray(user.completedResources)
        ? user.completedResources
        : [];

      const resourceTotal = (db.portal.resources || []).length;

      const validCompleted = user.completedResources.filter((rid) =>
        (db.portal.resources || []).some((r) => r.id === rid)
      );

      if (validCompleted.length !== user.completedResources.length) {
        user.completedResources = validCompleted;
        await writeDb(event, db);
      }

      const progress = {
        completedResources: user.completedResources,
        completed: user.completedResources.length,
        total: resourceTotal,
        percent: resourceTotal
          ? Math.round((user.completedResources.length / resourceTotal) * 100)
          : 0
      };

      if (method === 'GET' && path === '/client/dashboard') {
        return json(200, {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            plan: user.plan,
            completedResources: user.completedResources
          },
          progress,
          portal: db.portal,
          tickets: db.portal.tickets.filter((t) => t.userId === user.id)
        });
      }

      if (method === 'POST' && path === '/client/progress') {
        const b = body(event);
        const receivedResourceId = String(b.resourceId || '');

        const resource = (db.portal.resources || []).find(
          (r) => r.id === receivedResourceId
        );

        if (!resource) {
          return json(404, {
            error: 'Resource not found',
            receivedResourceId,
            availableResourceIds: (db.portal.resources || []).map((r) => r.id)
          });
        }

        const set = new Set(user.completedResources);

        if (b.completed === false) set.delete(resource.id);
        else set.add(resource.id);

        user.completedResources = [...set];

        await writeDb(event, db);

        const total = (db.portal.resources || []).length;

        return json(200, {
          completedResources: user.completedResources,
          completed: user.completedResources.length,
          total,
          percent: total
            ? Math.round((user.completedResources.length / total) * 100)
            : 0
        });
      }

      if (method === 'POST' && path === '/client/tickets') {
        const b = body(event);

        const ticket = {
          id: id(),
          userId: user.id,
          userEmail: user.email,
          subject: String(b.subject || 'Support request'),
          message: String(b.message || ''),
          status: 'Open',
          createdAt: now(),
          source: 'client-portal'
        };

        db.portal.tickets.unshift(ticket);
        await writeDb(event, db);

        return json(200, ticket);
      }
    }

    if (path.startsWith('/admin')) {
      auth(event, 'admin');

      const db = await readDb(event);

      if (method === 'GET' && path === '/admin/content') {
        return json(200, db.content);
      }

      if (method === 'PUT' && path === '/admin/content') {
        db.content = body(event);
        await writeDb(event, db);
        return json(200, db.content);
      }

      if (method === 'GET' && path === '/admin/portal') {
        return json(200, {
          portal: db.portal,
          users: db.users.map(({ passwordHash, ...u }) => u),
          leads: db.leads
        });
      }

      if (method === 'PUT' && path === '/admin/portal') {
        const b = body(event);

        db.portal = b.portal || db.portal;
        db.leads = b.leads || db.leads;

        db.portal.resources = Array.isArray(db.portal.resources)
          ? db.portal.resources.map((item, index) => ({
              ...item,
              id: resourceId(item, index)
            }))
          : [];

        await writeDb(event, db);

        return json(200, {
          portal: db.portal,
          users: db.users.map(({ passwordHash, ...u }) => u),
          leads: db.leads
        });
      }

      if (method === 'GET' && path === '/admin/export') {
        return json(200, db);
      }
    }

    return json(404, {
      error: 'Not found',
      path
    });
  } catch (e) {
    const isAuthError = /token|unauth|expired|invalid/i.test(e.message);

    return json(isAuthError ? 401 : 500, {
      error: isAuthError ? 'Unauthorized' : 'Server error',
      detail: e.message
    });
  }
};
