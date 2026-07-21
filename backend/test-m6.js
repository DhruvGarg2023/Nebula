import { io } from 'socket.io-client';

const API_URL = 'http://localhost:3000';
let tokenUser1 = '';
let tokenUser2 = '';
let roomId = '';

async function runTest() {
  console.log('\n--- MILESTONE 6 TEST: Real-Time Chat & History ---\n');

  try {
    // 1. Log in User 1 & User 2
    console.log('1. Logging in User 1 and User 2...');
    const res1 = await fetch(`${API_URL}/api/v1/auth/dev/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice@example.com', name: 'Alice' }),
    });
    const data1 = await res1.json();
    tokenUser1 = data1.data.accessToken;

    const res2 = await fetch(`${API_URL}/api/v1/auth/dev/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bob@example.com', name: 'Bob' }),
    });
    const data2 = await res2.json();
    tokenUser2 = data2.data.accessToken;

    console.log('✅ Logged in both Alice and Bob successfully.');

    // 2. Create Room with User 1
    console.log('\n2. Creating a test room...');
    const roomRes = await fetch(`${API_URL}/api/v1/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenUser1}`,
      },
      body: JSON.stringify({ name: 'M6 Chat Room', language: 'javascript', isPublic: true }),
    });
    const roomData = await roomRes.json();
    if (!roomRes.ok) throw new Error(`Room creation failed: ${JSON.stringify(roomData)}`);
    roomId = roomData.data.room?.id || roomData.data.id;
    console.log(`✅ Room created with ID: ${roomId}`);

    // 3. Connect User 1 & User 2 to /chat socket namespace
    console.log('\n3. Connecting sockets to /chat namespace...');
    const socket1 = io(`${API_URL}/chat`, { auth: { token: tokenUser1 } });
    const socket2 = io(`${API_URL}/chat`, { auth: { token: tokenUser2 } });

    await Promise.all([
      new Promise((resolve) => socket1.on('connect', resolve)),
      new Promise((resolve) => socket2.on('connect', resolve)),
    ]);
    console.log('✅ Both sockets connected to /chat namespace.');

    // 4. Join room in chat namespace
    console.log('\n4. Joining chat room for both sockets...');
    await Promise.all([
      new Promise((resolve) => socket1.emit('chat:join', { roomId }, resolve)),
      new Promise((resolve) => socket2.emit('chat:join', { roomId }, resolve)),
    ]);
    console.log('✅ Both sockets joined chat room.');

    // 5. Test typing indicators and message sending
    console.log('\n5. Testing real-time messaging & XSS sanitization...');

    const receivePromise = new Promise((resolve) => {
      socket2.on('chat:receive', (msg) => {
        console.log(`📩 User 2 received message: [${msg.type}] ${msg.user?.name || 'System'}: ${msg.content}`);
        if (msg.type === 'USER') {
          resolve(msg);
        }
      });
    });

    // User 1 sends message containing HTML / XSS tag
    const testMessageContent = 'Hello <script>alert("xss")</script> World!';
    socket1.emit('chat:send', { roomId, content: testMessageContent }, (ack) => {
      if (!ack.success) {
        console.error('❌ Failed to send message:', ack);
        process.exit(1);
      }
      console.log('✅ User 1 message sent & acknowledged by server.');
    });

    const receivedMsg = await receivePromise;

    // Verify XSS sanitization
    if (receivedMsg.content.includes('<script>')) {
      throw new Error('XSS Sanitization failed! Message contained unescaped script tag.');
    }
    console.log('✅ XSS Sanitization confirmed: Content sanitized to:', receivedMsg.content);

    // 6. Fetch Chat History via REST API
    console.log('\n6. Fetching chat history via REST API...');
    const historyRes = await fetch(`${API_URL}/api/v1/rooms/${roomId}/messages?limit=10`, {
      headers: {
        Authorization: `Bearer ${tokenUser1}`,
      },
    });
    const historyData = await historyRes.json();
    if (!historyRes.ok) throw new Error(`Fetch history failed: ${JSON.stringify(historyData)}`);

    console.log(`✅ History fetched successfully. Returned ${historyData.data.messages.length} message(s).`);
    console.log('Latest message in history:', historyData.data.messages[0]);

    // Clean up
    socket1.disconnect();
    socket2.disconnect();
    console.log('\n✅ MILESTONE 6 VERIFICATION SUCCESSFUL!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Milestone 6 Test Failed:', error);
    process.exit(1);
  }
}

runTest();
