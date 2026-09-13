const http = require('http');
const fs = require('fs');

const CONFIG = {
  host: 'localhost',
  port: 3333,
  path: '/',
  totalRequests: 500,
  concurrency: 25
};

function sendRequest() {
  return new Promise((resolve) => {
    const start = process.hrtime();
    const req = http.request({
      host: CONFIG.host,
      port: CONFIG.port,
      path: CONFIG.path,
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const diff = process.hrtime(start);
        const durationMs = (diff[0] * 1e3) + (diff[1] / 1e6);
        resolve({
          statusCode: res.statusCode,
          durationMs,
          sizeBytes: Buffer.byteLength(data),
          success: res.statusCode === 200
        });
      });
    });

    req.on('error', (err) => {
      const diff = process.hrtime(start);
      const durationMs = (diff[0] * 1e3) + (diff[1] / 1e6);
      resolve({
        statusCode: 0,
        durationMs,
        sizeBytes: 0,
        success: false,
        error: err.message
      });
    });

    req.end();
  });
}

async function runHttpBenchmark() {
  console.log('======================================================');
  console.log('START BENCHMARK (HTTP Benchmark)');
  console.log('Target: http://' + CONFIG.host + ':' + CONFIG.port + CONFIG.path);
  console.log('Requests: ' + CONFIG.totalRequests + ' | Concurrency: ' + CONFIG.concurrency);
  console.log('======================================================\n');

  const results = [];
  const startTime = Date.now();
  let completed = 0;

  async function worker() {
    while (completed < CONFIG.totalRequests) {
      completed++;
      const res = await sendRequest();
      results.push(res);
    }
  }

  const workers = [];
  for (let i = 0; i < CONFIG.concurrency; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);
  const totalDurationSec = (Date.now() - startTime) / 1000;

  const successful = results.filter(r => r.success);
  const durations = results.map(r => r.durationMs).sort((a, b) => a - b);
  const totalDurationMs = durations.reduce((a, b) => a + b, 0);

  const avgLatency = (totalDurationMs / durations.length).toFixed(2);
  const minLatency = durations[0].toFixed(2);
  const maxLatency = durations[durations.length - 1].toFixed(2);
  const p50 = durations[Math.floor(durations.length * 0.50)].toFixed(2);
  const p95 = durations[Math.floor(durations.length * 0.95)].toFixed(2);
  const p99 = durations[Math.floor(durations.length * 0.99)].toFixed(2);
  const rps = (results.length / totalDurationSec).toFixed(1);

  console.log('METRICS:');
  console.log('- Total Duration: ' + totalDurationSec.toFixed(2) + ' s');
  console.log('- Success Rate: ' + successful.length + '/' + results.length + ' (' + ((successful.length / results.length) * 100).toFixed(1) + '%)');
  console.log('- RPS: ' + rps + ' req/sec');
  console.log('- Avg Latency: ' + avgLatency + ' ms');
  console.log('- Min Latency: ' + minLatency + ' ms');
  console.log('- Max Latency: ' + maxLatency + ' ms');
  console.log('- p50: ' + p50 + ' ms');
  console.log('- p95: ' + p95 + ' ms');
  console.log('- p99: ' + p99 + ' ms');

  return {
    totalRequests: results.length,
    successfulRequests: successful.length,
    totalDurationSec,
    rps: parseFloat(rps),
    avgLatency: parseFloat(avgLatency),
    minLatency: parseFloat(minLatency),
    maxLatency: parseFloat(maxLatency),
    p50: parseFloat(p50),
    p95: parseFloat(p95),
    p99: parseFloat(p99)
  };
}

function calculateStorageCapacities() {
  console.log('\n======================================================');
  console.log('STORAGE CAPACITY CALCULATION (LocalStorage vs Supabase)');
  console.log('======================================================\n');

  const SIZES = {
    order: 1180,
    customer: 280,
    product: 750,
    magazineSlide: 950
  };

  const LOCAL_STORAGE_BYTES = 5 * 1024 * 1024;
  const maxLocalOrders = Math.floor(LOCAL_STORAGE_BYTES / SIZES.order);
  const maxLocalCustomers = Math.floor(LOCAL_STORAGE_BYTES / SIZES.customer);
  const maxLocalProducts = Math.floor(LOCAL_STORAGE_BYTES / SIZES.product);

  const SUPABASE_FREE_BYTES = 500 * 1024 * 1024;
  const maxSupabaseFreeOrders = Math.floor(SUPABASE_FREE_BYTES / SIZES.order);
  const maxSupabaseFreeCustomers = Math.floor(SUPABASE_FREE_BYTES / SIZES.customer);

  const SUPABASE_PRO_BYTES = 8 * 1024 * 1024 * 1024;
  const maxSupabaseProOrders = Math.floor(SUPABASE_PRO_BYTES / SIZES.order);

  console.log('1. LocalStorage (5 MB):');
  console.log('   - Max Orders: ~' + maxLocalOrders.toLocaleString() + ' orders');
  console.log('   - Max Customers: ~' + maxLocalCustomers.toLocaleString() + ' customers');
  console.log('   - Max Products: ~' + maxLocalProducts.toLocaleString() + ' products');

  console.log('\n2. Supabase Free (500 MB):');
  console.log('   - Max Orders: ~' + maxSupabaseFreeOrders.toLocaleString() + ' orders');
  console.log('   - Max Customers: ~' + maxSupabaseFreeCustomers.toLocaleString() + ' customers');

  console.log('\n3. Supabase Pro (8 GB):');
  console.log('   - Max Orders: ~' + maxSupabaseProOrders.toLocaleString() + ' orders');

  return {
    sizes: SIZES,
    localStorage: {
      capacityBytes: LOCAL_STORAGE_BYTES,
      maxOrders: maxLocalOrders,
      maxCustomers: maxLocalCustomers,
      maxProducts: maxLocalProducts
    },
    supabaseFree: {
      capacityBytes: SUPABASE_FREE_BYTES,
      maxOrders: maxSupabaseFreeOrders,
      maxCustomers: maxSupabaseFreeCustomers
    },
    supabasePro: {
      capacityBytes: SUPABASE_PRO_BYTES,
      maxOrders: maxSupabaseProOrders
    }
  };
}

async function main() {
  const httpBench = await runHttpBenchmark();
  const storageCap = calculateStorageCapacities();

  const report = {
    timestamp: new Date().toISOString(),
    benchmark: httpBench,
    storage: storageCap
  };

  fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/lotus-flowers-store/benchmark_results.json', JSON.stringify(report, null, 2), 'utf8');
  console.log('\nReport written to benchmark_results.json successfully.');
}

main().catch(console.error);
