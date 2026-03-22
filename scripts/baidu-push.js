/**
 * 百度主动推送脚本
 * 可单独运行，无需重新构建
 *
 * 使用方法：
 * 1. 设置环境变量：
 *    export SITE_URL=https://your-domain.com
 *    export BAIDU_SITE=your-domain.com
 *    export BAIDU_TOKEN=your_token
 *    export BAIDU_PUSH=true
 *
 * 2. 运行脚本：
 *    node scripts/baidu-push.js
 *
 * 或者在 package.json 中添加：
 *   "scripts": {
 *     "push": "node scripts/baidu-push.js"
 *   }
 * 然后运行：BAIDU_PUSH=true BAIDU_TOKEN=xxx BAIDU_SITE=xxx npm run push
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// 读取搜索数据获取资源列表
const searchPath = path.join(__dirname, '../dist/js/search-data.json');
if (!fs.existsSync(searchPath)) {
  console.error('Error: search-data.json not found. Run "npm run build" first.');
  process.exit(1);
}

const resources = JSON.parse(fs.readFileSync(searchPath, 'utf-8'));

// 配置
const SITE_URL = process.env.SITE_URL || 'https://your-domain.com';
const BAIDU_SITE = process.env.BAIDU_SITE || 'your-domain.com';
const BAIDU_TOKEN = process.env.BAIDU_TOKEN || '';

if (!BAIDU_TOKEN) {
  console.error('Error: BAIDU_TOKEN not set.');
  console.log('Get your token from: https://ziyuan.baidu.com/linksubmit/index');
  process.exit(1);
}

// 分类
const CATEGORIES = [
  { slug: 'mobile-games' },
  { slug: 'pc-games' },
  { slug: 'ps4-games' },
  { slug: 'switch-games' },
  { slug: 'short-drama' }
];

// 构建URL列表
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const urls = [
  `${SITE_URL}/`,
  ...CATEGORIES.map(cat => `${SITE_URL}/category/${cat.slug}.html`)
];

resources.forEach(resource => {
  urls.push(`${SITE_URL}/category/${resource.category}.html#${slugify(resource.name)}`);
});

console.log(`Pushing ${urls.length} URLs to Baidu...`);
console.log(`Site: ${BAIDU_SITE}`);

// 推送到百度
const pushUrl = `http://data.zz.baidu.com/urls?site=${BAIDU_SITE}&token=${BAIDU_TOKEN}`;
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
      console.log('\n=== Baidu Push Result ===');
      if (result.success) {
        console.log(`✓ Success: ${result.success} URLs submitted`);
        if (result.remain) {
          console.log(`✓ Remaining quota: ${result.remain}`);
        }
      }
      if (result.error) {
        console.log(`✗ Error code: ${result.error}`);
        if (result.message) {
          console.log(`✗ Message: ${result.message}`);
        }
      }
      console.log('========================\n');
    } catch (e) {
      console.log('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Request failed: ${e.message}`);
});

req.write(urlBody);
req.end();