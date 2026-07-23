const API_URL = 'http://localhost:3000';
let adminToken = '';
let editorToken = '';
let viewerToken = '';
let roomId = '';
let v1Id = '';
let v2Id = '';

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
  console.log('--- MILESTONE 8 TEST: Version History (Snapshots, Diffs & Restores) ---');
  console.log('=================================================================\n');

  try {
    // 1. Dev Logins (Admin, Editor, Viewer)
    console.log('1. Logging in test users...');
    adminToken = await loginUser('v8-admin@example.com', 'V8 Admin User');
    editorToken = await loginUser('v8-editor@example.com', 'V8 Editor User');
    viewerToken = await loginUser('v8-viewer@example.com', 'V8 Viewer User');
    console.log('✅ Logged in Admin, Editor, and Viewer users.');

    // 2. Admin creates a room
    console.log('\n2. Admin creating test room...');
    const roomRes = await fetch(`${API_URL}/api/v1/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ name: 'Version Control Test Room', language: 'javascript', isPublic: true }),
    });
    const roomData = await roomRes.json();
    if (!roomRes.ok) throw new Error(`Room creation failed: ${JSON.stringify(roomData)}`);
    roomId = roomData.data.room?.id || roomData.data.id;
    console.log(`✅ Room created with ID: ${roomId}`);

    // Add Editor and Viewer to room
    const inviteRes = await fetch(`${API_URL}/api/v1/rooms/${roomId}/invites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ role: 'editor' }),
    });
    const inviteData = await inviteRes.json();
    if (!inviteRes.ok) throw new Error(`Invite creation failed for editor: ${JSON.stringify(inviteData)}`);
    const editorInviteToken = inviteData.data?.token || inviteData.data?.invitation?.token;
    if (editorInviteToken) {
      const acceptRes = await fetch(`${API_URL}/api/v1/rooms/invites/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${editorToken}`,
        },
        body: JSON.stringify({ token: editorInviteToken }),
      });
      if (!acceptRes.ok) throw new Error(`Accept invite failed for editor: ${JSON.stringify(await acceptRes.json())}`);
    }

    const viewerInviteRes = await fetch(`${API_URL}/api/v1/rooms/${roomId}/invites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ role: 'viewer' }),
    });
    const viewerInviteData = await viewerInviteRes.json();
    if (!viewerInviteRes.ok) throw new Error(`Invite creation failed for viewer: ${JSON.stringify(viewerInviteData)}`);
    const viewerInviteToken = viewerInviteData.data?.token || viewerInviteData.data?.invitation?.token;
    if (viewerInviteToken) {
      const acceptRes = await fetch(`${API_URL}/api/v1/rooms/invites/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${viewerToken}`,
        },
        body: JSON.stringify({ token: viewerInviteToken }),
      });
      if (!acceptRes.ok) throw new Error(`Accept invite failed for viewer: ${JSON.stringify(await acceptRes.json())}`);
    }
    console.log('✅ Room members set up (Admin, Editor, Viewer).');

    // 3. Create initial files in room
    console.log('\n3. Creating initial files in room...');
    const file1Res = await fetch(`${API_URL}/api/v1/rooms/${roomId}/files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ name: 'index.js', language: 'javascript', content: 'console.log("v1");' }),
    });
    if (!file1Res.ok) throw new Error('File 1 creation failed');

    const file2Res = await fetch(`${API_URL}/api/v1/rooms/${roomId}/files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ name: 'README.md', language: 'markdown', content: '# Version 1 Document' }),
    });
    if (!file2Res.ok) throw new Error('File 2 creation failed');
    console.log('✅ Initial files created: index.js, README.md');

    // 4. Editor creates Version Snapshot V1
    console.log('\n4. Creating Version Snapshot V1...');
    const v1Res = await fetch(`${API_URL}/api/v1/rooms/${roomId}/versions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${editorToken}`,
      },
      body: JSON.stringify({ label: 'v1.0.0', description: 'Initial snapshot release' }),
    });
    const v1Data = await v1Res.json();
    if (!v1Res.ok) throw new Error(`V1 Snapshot creation failed: ${JSON.stringify(v1Data)}`);
    v1Id = v1Data.data.version.id;
    console.log(`✅ Snapshot V1 created successfully. ID: ${v1Id}, Label: ${v1Data.data.version.label}`);

    // 5. Update index.js and add utils.js file
    console.log('\n5. Modifying room files for Version 2...');
    const filesListRes = await fetch(`${API_URL}/api/v1/rooms/${roomId}/files`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const filesListData = await filesListRes.json();
    const indexFile = (filesListData.data?.files || filesListData.data).find((f) => f.name === 'index.js');

    const updateRes = await fetch(`${API_URL}/api/v1/rooms/${roomId}/files/${indexFile.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ content: 'console.log("v2 updated code");\nconsole.log("new line added");' }),
    });
    if (!updateRes.ok) throw new Error(`File update failed: ${JSON.stringify(await updateRes.json())}`);

    await fetch(`${API_URL}/api/v1/rooms/${roomId}/files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ name: 'utils.js', language: 'javascript', content: 'export const add = (a, b) => a + b;' }),
    });
    console.log('✅ Updated index.js and added utils.js');

    // 6. Create Version Snapshot V2
    console.log('\n6. Creating Version Snapshot V2...');
    const v2Res = await fetch(`${API_URL}/api/v1/rooms/${roomId}/versions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ label: 'v2.0.0', description: 'Added utils.js and updated index.js' }),
    });
    const v2Data = await v2Res.json();
    if (!v2Res.ok) throw new Error(`V2 Snapshot creation failed: ${JSON.stringify(v2Data)}`);
    v2Id = v2Data.data.version.id;
    console.log(`✅ Snapshot V2 created successfully. ID: ${v2Id}`);

    // 7. List Versions
    console.log('\n7. Listing version history...');
    const listRes = await fetch(`${API_URL}/api/v1/rooms/${roomId}/versions`, {
      headers: { Authorization: `Bearer ${viewerToken}` },
    });
    const listData = await listRes.json();
    if (!listRes.ok) throw new Error(`List versions failed: ${JSON.stringify(listData)}`);
    console.log(`✅ Version history retrieved: Total versions = ${listData.data.pagination.total}`);
    if (listData.data.versions.length < 2) throw new Error('Expected at least 2 versions');

    // 8. Fetch Version Details for V1
    console.log('\n8. Fetching details for Version V1...');
    const detailsRes = await fetch(`${API_URL}/api/v1/rooms/${roomId}/versions/${v1Id}`, {
      headers: { Authorization: `Bearer ${viewerToken}` },
    });
    const detailsData = await detailsRes.json();
    if (!detailsRes.ok) throw new Error(`Get version details failed: ${JSON.stringify(detailsData)}`);
    console.log(`✅ Version details fetched. File count in V1: ${detailsData.data.version.versionFiles.length}`);

    // 9. Compute Diff between V1 and V2
    console.log('\n9. Computing line-by-line diff between V1 and V2...');
    const diffRes = await fetch(`${API_URL}/api/v1/rooms/${roomId}/versions/${v1Id}/diff?targetVersionId=${v2Id}`, {
      headers: { Authorization: `Bearer ${viewerToken}` },
    });
    const diffData = await diffRes.json();
    if (!diffRes.ok) throw new Error(`Compute diff failed: ${JSON.stringify(diffData)}`);
    console.log('✅ Version diff calculated:');
    console.log(`   - Summary: Added=${diffData.data.diff.summary.filesAdded}, Modified=${diffData.data.diff.summary.filesModified}, Unchanged=${diffData.data.diff.summary.filesUnchanged}`);
    if (diffData.data.diff.summary.filesAdded !== 1 || diffData.data.diff.summary.filesModified !== 1) {
      throw new Error('Diff calculation did not match expected additions/modifications!');
    }

    // 10. Test RBAC Permissions
    console.log('\n10. Testing RBAC permissions on version operations...');
    // Viewer trying to snapshot -> Should fail 403
    const viewerSnapshotRes = await fetch(`${API_URL}/api/v1/rooms/${roomId}/versions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${viewerToken}`,
      },
      body: JSON.stringify({ label: 'Unauthorized' }),
    });
    if (viewerSnapshotRes.status !== 403) {
      throw new Error(`Expected 403 for Viewer creating snapshot, got ${viewerSnapshotRes.status}`);
    }
    console.log('✅ RBAC check 1 passed: Viewer cannot create snapshot (403 Forbidden).');

    // Editor trying to restore -> Should fail 403
    const editorRestoreRes = await fetch(`${API_URL}/api/v1/rooms/${roomId}/versions/${v1Id}/restore`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${editorToken}` },
    });
    if (editorRestoreRes.status !== 403) {
      throw new Error(`Expected 403 for Editor restoring version, got ${editorRestoreRes.status}`);
    }
    console.log('✅ RBAC check 2 passed: Editor cannot restore version (403 Forbidden).');

    // 11. Admin performs Version Restore to V1
    console.log('\n11. Admin restoring room files to Version V1...');
    const restoreRes = await fetch(`${API_URL}/api/v1/rooms/${roomId}/versions/${v1Id}/restore`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const restoreData = await restoreRes.json();
    if (!restoreRes.ok) throw new Error(`Version restore failed: ${JSON.stringify(restoreData)}`);
    console.log('✅ Version V1 successfully restored.');

    // 12. Verify active room files after restore
    console.log('\n12. Verifying restored room active files...');
    const postRestoreFilesRes = await fetch(`${API_URL}/api/v1/rooms/${roomId}/files`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const postRestoreFilesData = await postRestoreFilesRes.json();
    const activeFiles = postRestoreFilesData.data?.files || postRestoreFilesData.data;
    console.log(`✅ Active files after restore: ${activeFiles.map((f) => f.name).join(', ')}`);

    const hasUtils = activeFiles.some((f) => f.name === 'utils.js');
    const restoredIndex = activeFiles.find((f) => f.name === 'index.js');

    if (hasUtils) throw new Error('utils.js should have been removed after restoring to V1 snapshot!');
    if (!restoredIndex || restoredIndex.content !== 'console.log("v1");') {
      throw new Error(`index.js content after restore mismatch! Got: ${restoredIndex?.content}`);
    }

    console.log('✅ Verification successful: Room active files correctly reset to V1 state!');
    console.log('\n=================================================================');
    console.log('🎉 MILESTONE 8 TEST PASSED SUCCESSFULLY!');
    console.log('=================================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ MILESTONE 8 TEST FAILED:', err);
    process.exit(1);
  }
}

runTest();
