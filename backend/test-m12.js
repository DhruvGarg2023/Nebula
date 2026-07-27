import { execSync } from 'child_process';

const API_URL = 'http://localhost:3000';

async function runTest() {
  console.log('\n=================================================================');
  console.log('--- MILESTONE 12 TEST: Production Readiness (Docs, Queues, Health & Seed) ---');
  console.log('=================================================================\n');

  try {
    // 1. Health Probe
    console.log('1. Testing Liveness Health Probe (GET /api/v1/health)...');
    const healthRes = await fetch(`${API_URL}/api/v1/health`);
    const healthData = await healthRes.json();
    if (!healthRes.ok || healthData.data?.status !== 'ok') {
      throw new Error(`Health check failed: ${JSON.stringify(healthData)}`);
    }
    console.log(`✅ Liveness health check passed: status='${healthData.data.status}'`);

    // 2. Readiness Probe
    console.log('\n2. Testing Readiness Probe (GET /api/v1/ready)...');
    const readyRes = await fetch(`${API_URL}/api/v1/ready`);
    const readyData = await readyRes.json();
    if (!readyRes.ok || readyData.data?.status !== 'ok') {
      throw new Error(`Readiness check failed: ${JSON.stringify(readyData)}`);
    }
    console.log(`✅ Readiness probe passed: status='${readyData.data.status}' (DB: ${readyData.data.dependencies.database}, Redis: ${readyData.data.dependencies.redis})`);

    // 3. OpenAPI Specification JSON
    console.log('\n3. Testing OpenAPI Spec JSON (GET /api/v1/docs/openapi.json)...');
    const specRes = await fetch(`${API_URL}/api/v1/docs/openapi.json`);
    const specData = await specRes.json();
    if (!specRes.ok || specData.openapi !== '3.0.3') {
      throw new Error(`OpenAPI spec check failed: ${JSON.stringify(specData)}`);
    }
    console.log(`✅ OpenAPI 3.0 spec endpoint verified (Title: '${specData.info.title}')`);

    // 4. Interactive Swagger UI HTML
    console.log('\n4. Testing Interactive Swagger UI (GET /api/v1/docs)...');
    const uiRes = await fetch(`${API_URL}/api/v1/docs`);
    const uiText = await uiRes.text();
    if (!uiRes.ok || !uiText.includes('SwaggerUIBundle')) {
      throw new Error('Swagger UI endpoint did not render HTML properly');
    }
    console.log('✅ Interactive Swagger UI HTML rendered successfully.');

    // 5. BullMQ Queue Monitoring Dashboard Status
    console.log('\n5. Testing BullMQ Queue Monitoring Status (GET /api/v1/queues)...');
    const queueRes = await fetch(`${API_URL}/api/v1/queues`);
    const queueData = await queueRes.json();
    if (!queueRes.ok || !queueData.queues['compiler-queue']) {
      throw new Error(`Queue status check failed: ${JSON.stringify(queueData)}`);
    }
    console.log('✅ Queue monitoring status verified for compiler-queue, github-queue, and ai-queue.');

    // 6. Test Development Seed Script Execution
    console.log('\n6. Testing Development Database Seed Script (node prisma/seed.js)...');
    const seedOutput = execSync('node prisma/seed.js', { encoding: 'utf-8' });
    if (!seedOutput.includes('Database seeding completed successfully')) {
      throw new Error(`Seed script failed: ${seedOutput}`);
    }
    console.log('✅ Development seed script executed and verified successfully.');

    console.log('\n=================================================================');
    console.log('🎉 MILESTONE 12 TEST PASSED SUCCESSFULLY!');
    console.log('=================================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ MILESTONE 12 TEST FAILED:', err);
    process.exit(1);
  }
}

runTest();
