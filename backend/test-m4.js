import { io } from 'socket.io-client';

const BASE_URL = 'http://localhost:3000';

async function testMilestone4() {
  try {
    console.log('1. Logging in as developer...');
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/dev/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'm4-test@example.com', name: 'M4 Tester' })
    });
    const loginData = await loginRes.json();
    
    if (!loginData.success) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }
    
    const token = loginData.data.accessToken;
    console.log('✅ Login successful, obtained JWT token.\n');

    console.log('2. Creating a test room...');
    const roomRes = await fetch(`${BASE_URL}/api/v1/rooms`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: 'M4 Test Room', description: 'Testing sockets' })
    });
    const roomData = await roomRes.json();
    const roomId = roomData.data.id;
    console.log(`✅ Room created successfully with ID: ${roomId}\n`);

    console.log('3. Connecting to Socket.IO (/collaboration namespace)...');
    
    const socket = io(`${BASE_URL}/collaboration`, {
      auth: {
        token: token
      }
    });

    socket.on('connect', () => {
      console.log(`✅ Socket connected successfully! Socket ID: ${socket.id}\n`);
      
      console.log(`4. Attempting to join Room: ${roomId}...`);
      socket.emit('join_room', { roomId }, (response) => {
        if (response.success) {
          console.log(`✅ Successfully joined the room!`);
          console.log(`👥 Current Room Presence:`, response.presence);
          
          console.log('\n5. Sending heartbeat...');
          socket.emit('heartbeat', { roomId });
          console.log('✅ Heartbeat sent.');

          setTimeout(() => {
            console.log('\n6. Leaving room and disconnecting...');
            socket.emit('leave_room', { roomId });
            socket.disconnect();
            console.log('✅ Test complete! You can press Ctrl+C to exit.');
            process.exit(0);
          }, 2000);
          
        } else {
          console.error(`❌ Failed to join room:`, response.error);
          process.exit(1);
        }
      });
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket Connection Error:', err.message);
      process.exit(1);
    });

    socket.on('user_joined', (data) => {
      console.log(`📢 [Event] User joined room:`, data);
    });

    socket.on('user_left', (data) => {
      console.log(`📢 [Event] User left room:`, data);
    });

  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testMilestone4();
