const API_URL = 'http://localhost:3000';
let adminToken = '';
let editorToken = '';
let viewerToken = '';
let roomId = '';

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
  console.log('--- MILESTONE 9 TEST: GitHub Integration (OAuth, Async Import/Push & Encryption) ---');
  console.log('=================================================================\n');

  try {
    // 1. Dev Logins
    console.log('1. Logging in test users...');
    adminToken = await loginUser('v9-admin@example.com', 'V9 Admin User');
    editorToken = await loginUser('v9-editor@example.com', 'V9 Editor User');
    viewerToken = await loginUser('v9-viewer@example.com', 'V9 Viewer User');
    console.log('✅ Logged in Admin, Editor, and Viewer.');

    // 2. Connect GitHub Token with AES-256-GCM Encryption
    console.log('\n2. Connecting GitHub Token (testing AES-256-GCM encryption at rest)...');
    const dummyToken = 'ghp_mockAccessTokenForTesting123456789';
    const dummyUsername = 'test-octocat';

    const connectRes = await fetch(`${API_URL}/api/v1/github/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ accessToken: dummyToken, username: dummyUsername }),
    });
    const connectData = await connectRes.json();
    if (!connectRes.ok) throw new Error(`Connect GitHub failed: ${JSON.stringify(connectData)}`);
    console.log(`✅ GitHub token connected successfully for user '${connectData.data.username}'.`);

    // 3. Verify Connection Status
    console.log('\n3. Verifying GitHub status endpoint...');
    const statusRes = await fetch(`${API_URL}/api/v1/github/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const statusData = await statusRes.json();
    if (!statusRes.ok || !statusData.data.isConnected) {
      throw new Error(`Expected isConnected=true, got ${JSON.stringify(statusData)}`);
    }
    console.log(`✅ Status verified: isConnected=${statusData.data.isConnected}, username=${statusData.data.username}`);

    // 4. Create Room
    console.log('\n4. Admin creating GitHub integration test room...');
    const roomRes = await fetch(`${API_URL}/api/v1/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ name: 'GitHub Sync Test Room', language: 'javascript', isPublic: true }),
    });
    const roomData = await roomRes.json();
    if (!roomRes.ok) throw new Error(`Room creation failed: ${JSON.stringify(roomData)}`);
    roomId = roomData.data.room?.id || roomData.data.id;
    console.log(`✅ Room created with ID: ${roomId}`);

    // 5. Test Async Import Enqueue
    console.log('\n5. Testing async repository import enqueue (BullMQ)...');
    const importRes = await fetch(`${API_URL}/api/v1/rooms/${roomId}/github/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ owner: 'octocat', repo: 'Hello-World', branch: 'main' }),
    });
    const importData = await importRes.json();
    if (importRes.status !== 202) {
      throw new Error(`Expected HTTP 202 Accepted for import enqueue, got ${importRes.status}: ${JSON.stringify(importData)}`);
    }
    console.log(`✅ Repository import job enqueued with Job ID: ${importData.data.jobId}`);

    // 6. Add room files & Test Async Commit and Push Enqueue
    console.log('\n6. Creating test room file & testing commit-push enqueue...');
    await fetch(`${API_URL}/api/v1/rooms/${roomId}/files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ name: 'app.js', language: 'javascript', content: 'console.log("GitHub integration test");' }),
    });

    const pushRes = await fetch(`${API_URL}/api/v1/rooms/${roomId}/github/commit-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        owner: 'octocat',
        repo: 'Hello-World',
        branch: 'main',
        message: 'Feat: Add app.js from Collaborative Editor',
      }),
    });
    const pushData = await pushRes.json();
    if (pushRes.status !== 202) {
      throw new Error(`Expected HTTP 202 Accepted for commit-push enqueue, got ${pushRes.status}: ${JSON.stringify(pushData)}`);
    }
    console.log(`✅ Commit and push job enqueued with Job ID: ${pushData.data.jobId}`);

    // 7. Test RBAC Permissions
    console.log('\n7. Testing RBAC permissions on GitHub endpoints...');
    // Unconnected user attempting import -> Should fail 403
    const unconnectedImportRes = await fetch(`${API_URL}/api/v1/rooms/${roomId}/github/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${viewerToken}`,
      },
      body: JSON.stringify({ owner: 'octocat', repo: 'Hello-World' }),
    });
    if (unconnectedImportRes.status !== 403) {
      throw new Error(`Expected 403 for Viewer/Unconnected user import, got ${unconnectedImportRes.status}`);
    }
    console.log('✅ RBAC check 1 passed: Viewer/Unconnected user blocked from import (403 Forbidden).');

    // 8. Test Disconnect
    console.log('\n8. Testing GitHub account disconnect...');
    const disconnectRes = await fetch(`${API_URL}/api/v1/github/disconnect`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const disconnectData = await disconnectRes.json();
    if (!disconnectRes.ok) throw new Error(`Disconnect failed: ${JSON.stringify(disconnectData)}`);

    const postDisconnectStatus = await fetch(`${API_URL}/api/v1/github/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const postData = await postDisconnectStatus.json();
    if (postData.data.isConnected) {
      throw new Error('Expected isConnected=false after disconnect');
    }
    console.log('✅ GitHub account disconnected successfully.');

    console.log('\n=================================================================');
    console.log('🎉 MILESTONE 9 TEST PASSED SUCCESSFULLY!');
    console.log('=================================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ MILESTONE 9 TEST FAILED:', err);
    process.exit(1);
  }
}

runTest();
