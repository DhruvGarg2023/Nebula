const API_URL = 'http://localhost:3000';
let adminToken = '';
let editorToken = '';
let viewerToken = '';
let roomId = '';
let fileId = '';

async function loginUser(email, name) {
  const res = await fetch(`${API_URL}/api/v1/auth/dev/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Login failed for ${email}: ${JSON.stringify(data)}`);
  return data.data.accessToken;
}

async function runTest() {
  console.log('\n=================================================================');
  console.log('--- MILESTONE 10 TEST: AI Code Review & Assistance Subsystem ---');
  console.log('=================================================================\n');

  try {
    // 1. Dev Logins
    console.log('1. Logging in test users...');
    adminToken = await loginUser('v10-admin@example.com', 'V10 Admin User');
    editorToken = await loginUser('v10-editor@example.com', 'V10 Editor User');
    viewerToken = await loginUser('v10-viewer@example.com', 'V10 Viewer User');
    console.log('✅ Logged in Admin, Editor, and Viewer.');

    // 2. Test Synchronous Code Explanation
    console.log('\n2. Testing synchronous Code Explanation (POST /api/v1/ai/explain)...');
    const explainRes = await fetch(`${API_URL}/api/v1/ai/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        sourceCode: 'function add(a, b) { return a + b; }',
        language: 'javascript',
      }),
    });
    const explainData = await explainRes.json();
    if (!explainRes.ok || !explainData.data.explanation) {
      throw new Error(`Code explanation failed: ${JSON.stringify(explainData)}`);
    }
    console.log('✅ Code explanation returned successfully.');

    // 3. Test Synchronous Code Suggestions
    console.log('\n3. Testing synchronous Code Refactoring/Suggestions (POST /api/v1/ai/suggest)...');
    const suggestRes = await fetch(`${API_URL}/api/v1/ai/suggest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        sourceCode: 'var x = 10; var y = 20; console.log(x + y);',
        instruction: 'Use ES6 const and arrow functions',
        language: 'javascript',
      }),
    });
    const suggestData = await suggestRes.json();
    if (!suggestRes.ok || !suggestData.data.suggestion) {
      throw new Error(`Code suggestion failed: ${JSON.stringify(suggestData)}`);
    }
    console.log('✅ Code refactoring suggestion returned successfully.');

    // 4. Create Room & File for Code Review
    console.log('\n4. Admin creating test room and code file...');
    const roomRes = await fetch(`${API_URL}/api/v1/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ name: 'AI Review Test Room', language: 'javascript', isPublic: true }),
    });
    const roomData = await roomRes.json();
    roomId = roomData.data.room?.id || roomData.data.id;

    const fileRes = await fetch(`${API_URL}/api/v1/rooms/${roomId}/files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'app.js',
        language: 'javascript',
        content: `function processPayment(user, amount) {\n  eval("console.log(user)");\n  return amount * 1.1;\n}`,
      }),
    });
    const fileData = await fileRes.json();
    fileId = fileData.data.file?.id || fileData.data.id;
    console.log(`✅ Test room (${roomId}) and file (${fileId}) created.`);

    // 5. Test Asynchronous Code Review Enqueue
    console.log('\n5. Enqueuing Asynchronous AI Code Review (POST /api/v1/rooms/:roomId/ai/review)...');
    const reviewRes = await fetch(`${API_URL}/api/v1/rooms/${roomId}/ai/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ fileId }),
    });
    const reviewData = await reviewRes.json();
    if (reviewRes.status !== 202) {
      throw new Error(`Expected HTTP 202 Accepted for review enqueue, got ${reviewRes.status}: ${JSON.stringify(reviewData)}`);
    }
    const reviewId = reviewData.data.reviewId;
    console.log(`✅ AI code review enqueued successfully with Review ID: ${reviewId}`);

    // 6. Poll for Review Completion
    console.log('\n6. Polling AI Review result endpoint (GET /api/v1/ai/reviews/:reviewId)...');
    let completedReview = null;
    for (let i = 0; i < 10; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const getRes = await fetch(`${API_URL}/api/v1/ai/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const getData = await getRes.json();
      if (getData.data?.review?.status === 'completed') {
        completedReview = getData.data.review;
        break;
      }
    }

    if (!completedReview) {
      throw new Error('AI review job did not complete within 10 seconds');
    }

    console.log(`✅ AI Code Review completed with status '${completedReview.status}'.`);
    console.log(`   Summary: "${completedReview.summary}"`);
    console.log(`   Issues found: ${completedReview.issues.length}`);
    console.log(`   Suggestions count: ${completedReview.suggestions.length}`);

    // 7. Test RBAC Permissions
    console.log('\n7. Testing RBAC permissions (Viewer user requesting code review)...');
    const viewerReviewRes = await fetch(`${API_URL}/api/v1/rooms/${roomId}/ai/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${viewerToken}`,
      },
      body: JSON.stringify({ fileId }),
    });
    if (viewerReviewRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for Viewer code review request, got ${viewerReviewRes.status}`);
    }
    console.log('✅ RBAC check passed: Viewer blocked from requesting code review (403 Forbidden).');

    console.log('\n=================================================================');
    console.log('🎉 MILESTONE 10 TEST PASSED SUCCESSFULLY!');
    console.log('=================================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ MILESTONE 10 TEST FAILED:', err);
    process.exit(1);
  }
}

runTest();
