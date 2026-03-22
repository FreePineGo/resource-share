const XLSX = require('xlsx');
const { Eta } = require('eta');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Initialize Eta
const eta = new Eta({
  views: path.join(__dirname, '../template'),
  autoEscape: true,
  cache: false,
  useWith: true
});

// Category mapping
const CATEGORIES = [
  { sheetName: '手机游戏', slug: 'mobile-games', icon: '📱', name: '手机游戏' },
  { sheetName: '电脑游戏', slug: 'pc-games', icon: '💻', name: '电脑游戏' },
  { sheetName: 'PS4游戏', slug: 'ps4-games', icon: '🎮', name: 'PS4游戏' },
  { sheetName: 'SWITCH游戏', slug: 'switch-games', icon: '🕹️', name: 'SWITCH游戏' },
  { sheetName: '短剧资源', slug: 'short-drama', icon: '📺', name: '短剧资源' }
];

// Paths
const PATHS = {
  data: path.join(__dirname, '../data/resources.xlsx'),
  src: path.join(__dirname, '../src'),
  dist: path.join(__dirname, '../dist'),
  images: path.join(__dirname, '../src/images'),
  distImages: path.join(__dirname, '../dist/images')
};

// Warnings collector
const warnings = [];

// Ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Parse date string
function parseDate(dateStr) {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    warnings.push(`Invalid date format: ${dateStr}, using current date`);
    return new Date().toISOString().split('T')[0];
  }
  return dateStr;
}

// Check if cover is local file
function isLocalCover(cover) {
  if (!cover) return false;
  return !cover.startsWith('http://') && !cover.startsWith('https://');
}

// Copy local image to dist
function copyLocalImage(cover) {
  if (!cover || !isLocalCover(cover)) return cover;

  const srcPath = path.join(PATHS.images, cover);
  const destPath = path.join(PATHS.distImages, cover);

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    return `images/${cover}`;
  } else {
    warnings.push(`Local cover image not found: ${cover}`);
    return null;
  }
}

// Read Excel file
function readExcel() {
  if (!fs.existsSync(PATHS.data)) {
    console.error('Error: Excel file not found at', PATHS.data);
    process.exit(1);
  }

  const workbook = XLSX.readFile(PATHS.data);
  const allResources = [];

  CATEGORIES.forEach(cat => {
    const sheet = workbook.Sheets[cat.sheetName];

    if (!sheet) {
      warnings.push(`Sheet not found: ${cat.sheetName}, skipping`);
      return;
    }

    const data = XLSX.utils.sheet_to_json(sheet);

    data.forEach((row, index) => {
      if (!row.name || !row.link) {
        warnings.push(`Row ${index + 2} in ${cat.sheetName}: missing required fields (name/link), skipping`);
        return;
      }

      const cover = copyLocalImage(row.cover);

      allResources.push({
        name: row.name,
        link: row.link,
        code: row.code || null,
        cover: cover,
        size: row.size || null,
        version: row.version || null,
        description: row.description || null,
        updateTime: parseDate(row.updateTime),
        note: row.note || null,
        category: cat.slug,
        categoryName: cat.name,
        icon: cat.icon
      });
    });
  });

  return allResources;
}

// Generate search data
function generateSearchData(resources) {
  const searchPath = path.join(PATHS.dist, 'js/search-data.json');
  fs.writeFileSync(searchPath, JSON.stringify(resources, null, 2));
  console.log(`Generated search data: ${resources.length} items`);
}

// Generate homepage
async function generateHomepage(resources) {
  // Sort by updateTime and get latest 12
  const sorted = [...resources].sort((a, b) => {
    const dateA = a.updateTime ? new Date(a.updateTime) : new Date(0);
    const dateB = b.updateTime ? new Date(b.updateTime) : new Date(0);
    return dateB - dateA;
  });

  const hero = sorted.length > 0 ? sorted[0] : null;
  const latest = sorted.slice(0, 12);

  const html = await eta.render('index', {
    hero,
    latest,
    category: null,
    basePath: ''
  });

  const outputPath = path.join(PATHS.dist, 'index.html');
  fs.writeFileSync(outputPath, html);
  console.log(`Generated homepage with ${latest.length} latest items`);
}

// Generate category pages
async function generateCategoryPages(resources) {
  for (const cat of CATEGORIES) {
    const catResources = resources.filter(r => r.category === cat.slug);

    if (catResources.length === 0) {
      warnings.push(`No resources for category: ${cat.name}`);
    }

    const totalPages = Math.ceil(catResources.length / 20);

    const html = await eta.render('category', {
      category: cat.slug,
      categoryName: cat.name,
      icon: cat.icon,
      resources: catResources,
      totalPages,
      basePath: '../'
    });

    const outputPath = path.join(PATHS.dist, 'category', `${cat.slug}.html`);
    fs.writeFileSync(outputPath, html);
    console.log(`Generated ${cat.name} page: ${catResources.length} items, ${totalPages} pages`);
  }
}

// Copy static assets
function copyStaticAssets() {
  // CSS
  const cssSrc = path.join(PATHS.src, 'css/style.css');
  const cssDest = path.join(PATHS.dist, 'css/style.css');
  if (fs.existsSync(cssSrc)) {
    fs.copyFileSync(cssSrc, cssDest);
    console.log('Copied CSS');
  }

  // JS
  const jsSrc = path.join(PATHS.src, 'js/search.js');
  const jsDest = path.join(PATHS.dist, 'js/search.js');
  if (fs.existsSync(jsSrc)) {
    fs.copyFileSync(jsSrc, jsDest);
    console.log('Copied JS');
  }

  // robots.txt
  const robotsSrc = path.join(PATHS.src, 'robots.txt');
  const robotsDest = path.join(PATHS.dist, 'robots.txt');
  if (fs.existsSync(robotsSrc)) {
    fs.copyFileSync(robotsSrc, robotsDest);
    console.log('Copied robots.txt');
  }
}

// Site URL configuration - change this to your actual domain
const SITE_URL = process.env.SITE_URL || 'https://your-domain.com';

// Generate sitemap.xml
function generateSitemap(resources) {
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

  // Add category pages
  CATEGORIES.forEach(cat => {
    xml += `  <url>
    <loc>${SITE_URL}/category/${cat.slug}.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });

  // Add resource detail pages (using anchor links on category pages)
  resources.forEach(resource => {
    if (resource.updateTime) {
      xml += `  <url>
    <loc>${SITE_URL}/category/${resource.category}.html#${slugify(resource.name)}</loc>
    <lastmod>${resource.updateTime}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    }
  });

  xml += `</urlset>`;

  const sitemapPath = path.join(PATHS.dist, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml);
  console.log(`Generated sitemap.xml with ${resources.length + CATEGORIES.length + 1} URLs`);
}

// Helper function to create URL-safe slugs
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ========================================
// 百度主动推送配置
// ========================================
// 在百度搜索资源平台获取：https://ziyuan.baidu.com/linksubmit/index
// 获取方式：用户中心 -> 站点管理 -> 选择站点 -> 链接提交 -> 主动推送
const BAIDU_PUSH_CONFIG = {
  // 是否启用百度推送（设为 true 启用）
  enabled: process.env.BAIDU_PUSH === 'true' || false,

  // 你的站点域名（不含 http://）
  site: process.env.BAIDU_SITE || 'your-domain.com',

  // 百度推送token（从百度搜索资源平台获取）
  token: process.env.BAIDU_TOKEN || ''
};

// 百度主动推送函数
async function pushToBaidu(resources) {
  if (!BAIDU_PUSH_CONFIG.enabled) {
    console.log('Baidu push is disabled. Set BAIDU_PUSH=true to enable.');
    return;
  }

  if (!BAIDU_PUSH_CONFIG.token) {
    console.log('Warning: BAIDU_TOKEN not set. Skipping Baidu push.');
    console.log('Get your token from: https://ziyuan.baidu.com/linksubmit/index');
    return;
  }

  // 构建要推送的URL列表
  const urls = [
    `${SITE_URL}/`,
    ...CATEGORIES.map(cat => `${SITE_URL}/category/${cat.slug}.html`)
  ];

  // 添加资源页面URL
  resources.forEach(resource => {
    urls.push(`${SITE_URL}/category/${resource.category}.html#${slugify(resource.name)}`);
  });

  console.log(`\nPushing ${urls.length} URLs to Baidu...`);

  // 百度推送API地址
  const pushUrl = `http://data.zz.baidu.com/urls?site=${BAIDU_PUSH_CONFIG.site}&token=${BAIDU_PUSH_CONFIG.token}`;

  return new Promise((resolve, reject) => {
    const urlBody = urls.join('\n');

    const req = http.request(pushUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Content-Length': Buffer.byteLength(urlBody)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.success) {
            console.log(`✓ Baidu push success: ${result.success} URLs submitted`);
            if (result.remain) {
              console.log(`  Remaining quota: ${result.remain}`);
            }
          } else if (result.error) {
            console.log(`✗ Baidu push error: ${result.error}`);
            if (result.message) {
              console.log(`  Message: ${result.message}`);
            }
          }
          resolve(result);
        } catch (e) {
          console.log(`✗ Baidu push response parse error: ${data}`);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.log(`✗ Baidu push request failed: ${e.message}`);
      resolve(null);
    });

    req.write(urlBody);
    req.end();
  });
}

// Main build function
async function build() {
  console.log('Starting build...\n');

  // Ensure directories
  ensureDir(PATHS.dist);
  ensureDir(path.join(PATHS.dist, 'js'));
  ensureDir(path.join(PATHS.dist, 'css'));
  ensureDir(path.join(PATHS.dist, 'images'));
  ensureDir(path.join(PATHS.dist, 'category'));
  ensureDir(PATHS.distImages);

  // Read Excel
  console.log('Reading Excel file...');
  const resources = readExcel();
  console.log(`Total resources: ${resources.length}\n`);

  // Generate files
  console.log('Generating search data...');
  generateSearchData(resources);

  console.log('\nGenerating homepage...');
  await generateHomepage(resources);

  console.log('\nGenerating category pages...');
  await generateCategoryPages(resources);

  console.log('\nCopying static assets...');
  copyStaticAssets();

  // Generate sitemap
  console.log('\nGenerating sitemap...');
  generateSitemap(resources);

  // Push to Baidu
  await pushToBaidu(resources);

  // Report
  console.log('\n' + '='.repeat(50));
  console.log('BUILD COMPLETE');
  console.log('='.repeat(50));
  console.log(`Total resources: ${resources.length}`);

  if (warnings.length > 0) {
    console.log(`\nWarnings (${warnings.length}):`);
    warnings.forEach(w => console.log(`  - ${w}`));
  }

  console.log(`\nOutput directory: ${path.resolve(PATHS.dist)}`);
}

// Run build
build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});