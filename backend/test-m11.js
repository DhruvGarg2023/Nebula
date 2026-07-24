import { sendNotification } from './src/modules/notification/services.js';

const API_URL = 'http://localhost:3000';
let adminToken = '';
let adminUserId = '';

async function loginUser(email, name) {
  const res = await fetch(`${API_URL}/api/v1/auth/dev/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Login failed for ${email}: ${JSON.stringify(data)}`);
  adminUserId = data.data.user.id;
  return data.data.accessToken;
}

async function runTest() {
  console.log('\n=================================================================');
  console.log('--- MILESTONE 11 TEST: Notifications Subsystem (Real-time & Unread State) ---');
  console.log('=================================================================\n');

  try {
    // 1. Dev Login
    console.log('1. Logging in test user...');
    adminToken = await loginUser('v11-admin@example.com', 'V11 Admin User');
    console.log(`✅ Logged in Admin user (ID: ${adminUserId}).`);

    // 2. Create Test Notifications directly via Notification Service
    console.log('\n2. Creating test notifications across multiple categories...');
    const notif1 = await sendNotification(
      adminUserId,
      'ai_review_complete',
      'AI Code Review Complete',
      'Your AI code review completed with 2 warnings found.',
      '/ai/reviews/123',
      { reviewId: '123' }
    );

    const notif2 = await sendNotification(
      adminUserId,
      'github_push_complete',
      'GitHub Push Succeeded',
      'Successfully pushed commit to octocat/Hello-World (main).',
      '/rooms/456',
      { commitSha: 'abc1234' }
    );

    const notif3 = await sendNotification(
      adminUserId,
      'room_invite',
      'Room Invitation',
      'You have been invited to join Collaborative Room Delta.',
      '/rooms/789/join',
      { roomId: '789' }
    );

    console.log(`✅ Created 3 notifications (IDs: ${notif1.id}, ${notif2.id}, ${notif3.id}).`);

    // 3. Test Unread Count Endpoint
    console.log('\n3. Testing unread notification count badge (GET /api/v1/notifications/unread-count)...');
    const unreadRes = await fetch(`${API_URL}/api/v1/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const unreadData = await unreadRes.json();
    if (!unreadRes.ok || typeof unreadData.data.unreadCount !== 'number') {
      throw new Error(`Failed to fetch unread count: ${JSON.stringify(unreadData)}`);
    }
    console.log(`✅ Unread badge count retrieved: ${unreadData.data.unreadCount}`);
    if (unreadData.data.unreadCount < 3) {
      throw new Error(`Expected at least 3 unread notifications, got ${unreadData.data.unreadCount}`);
    }

    // 4. Test Paginated Notification List
    console.log('\n4. Testing paginated notification list (GET /api/v1/notifications?page=1&limit=10)...');
    const listRes = await fetch(`${API_URL}/api/v1/notifications?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const listData = await listRes.json();
    if (!listRes.ok || !Array.isArray(listData.data.notifications)) {
      throw new Error(`Failed to fetch notifications list: ${JSON.stringify(listData)}`);
    }
    console.log(`✅ Retrieved ${listData.data.notifications.length} notification(s). Total: ${listData.data.pagination.total}`);

    // 5. Test Mark Single Notification as Read
    console.log(`\n5. Marking single notification as read (PATCH /api/v1/notifications/${notif1.id}/read)...`);
    const markOneRes = await fetch(`${API_URL}/api/v1/notifications/${notif1.id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const markOneData = await markOneRes.json();
    if (!markOneRes.ok || !markOneData.data.isRead) {
      throw new Error(`Failed to mark notification as read: ${JSON.stringify(markOneData)}`);
    }
    console.log(`✅ Single notification marked as read. New unread count: ${markOneData.data.unreadCount}`);

    // 6. Test Mark All Notifications as Read
    console.log('\n6. Marking all notifications as read (PATCH /api/v1/notifications/read-all)...');
    const markAllRes = await fetch(`${API_URL}/api/v1/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const markAllData = await markAllRes.json();
    if (!markAllRes.ok || markAllData.data.unreadCount !== 0) {
      throw new Error(`Failed to mark all notifications as read: ${JSON.stringify(markAllData)}`);
    }
    console.log('✅ All notifications marked as read. Unread count reset to 0.');

    // 7. Verify Unread Badge Count Reset
    const postResetRes = await fetch(`${API_URL}/api/v1/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const postResetData = await postResetRes.json();
    if (postResetData.data.unreadCount !== 0) {
      throw new Error(`Expected unreadCount = 0 after markAllRead, got ${postResetData.data.unreadCount}`);
    }
    console.log('✅ Verified unread badge count is 0 after markAllRead.');

    console.log('\n=================================================================');
    console.log('🎉 MILESTONE 11 TEST PASSED SUCCESSFULLY!');
    console.log('=================================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ MILESTONE 11 TEST FAILED:', err);
    process.exit(1);
  }
}

runTest();
