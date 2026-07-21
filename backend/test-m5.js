import { io } from 'socket.io-client';
import * as Y from 'yjs';

const API_URL = 'http://localhost:3000';
let token = '';
let roomId = '';
let fileId = '';

async function runTest() {
  console.log('\n--- MILESTONE 5 TEST: File CRUD and Real-time Editing ---\n');

  try {
    // 1. Login
    console.log('1. Logging in as developer...');
    const loginRes = await fetch(`${API_URL}/api/v1/auth/dev/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'm5-tester@example.com', name: 'M5 Tester' })
    });
    
    if (!loginRes.ok) throw new Error('Login failed');
    const loginData = await loginRes.json();
    token = loginData.data.accessToken;
    console.log('✅ Login successful');

    // 2. Create Room
    console.log('\n2. Creating a test room...');
    const roomRes = await fetch(`${API_URL}/api/v1/rooms`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: 'M5 Test Room', language: 'javascript', isPublic: true })
    });
    const roomData = await roomRes.json();
    if (!roomRes.ok) throw new Error(`Room creation failed: ${JSON.stringify(roomData)}`);
    console.log('roomData:', JSON.stringify(roomData));
    roomId = roomData.data?.room?.id || roomData.data?.id;
    console.log(`✅ Room created with ID: ${roomId}`);

    // 3. Create File
    console.log('\n3. Creating a test file via REST API...');
    const fileRes = await fetch(`${API_URL}/api/v1/rooms/${roomId}/files`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: 'index.js', language: 'javascript', content: '// Initial code' })
    });
    const fileData = await fileRes.json();
    if (!fileRes.ok) throw new Error(`File creation failed: ${JSON.stringify(fileData)}`);
    fileId = fileData.data.file.id;
    console.log(`✅ File created with ID: ${fileId}`);

    // 4. Connect to Socket.IO Editor Namespace
    console.log('\n4. Connecting to Socket.IO (/editor)...');
    const socket = io(`${API_URL}/editor`, {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log(`✅ Socket connected! Socket ID: ${socket.id}`);
      
      // 5. Join Editor Room
      console.log(`\n5. Joining Editor for File: ${fileId}...`);
      socket.emit('editor:join', { roomId, fileId }, (response) => {
        if (!response.success) {
          console.error('❌ Failed to join editor:', response);
          process.exit(1);
        }
        
        console.log('✅ Successfully joined the editor!');
        
        // Initialize local Yjs document with state from server
        const ydoc = new Y.Doc();
        if (response.state) {
            Y.applyUpdate(ydoc, Buffer.from(response.state, 'base64'));
        }
        console.log('📄 Current File Content:', ydoc.getText('content').toString());

        // 6. Make a change
        console.log('\n6. Simulating a code edit...');
        
        // Setup observer to broadcast changes
        ydoc.on('update', (update) => {
          const updateBase64 = Buffer.from(update).toString('base64');
          socket.emit('editor:change', { roomId, fileId, update: updateBase64 }, (ack) => {
            if (ack.success) {
              console.log('✅ Edit acknowledged by server!');
              console.log('📄 Updated Content:', ydoc.getText('content').toString());
              
              // Disconnect after successful test
              setTimeout(() => {
                console.log('\n✅ Test complete! Disconnecting...');
                socket.disconnect();
                process.exit(0);
              }, 1000);
            }
          });
        });

        // Make the actual change
        ydoc.getText('content').insert(16, '\nconsole.log("Hello from M5 Test!");');
      });
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket Connection Error:', err.message);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

runTest();
