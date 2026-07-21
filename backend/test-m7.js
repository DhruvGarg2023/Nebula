import { io } from 'socket.io-client';

const API_URL = 'http://localhost:3000';
let token = '';
let roomId = '';
let fileId = '';

async function runTest() {
  console.log('\n--- MILESTONE 7 TEST: Code Execution Engine (BullMQ + Worker + WebSockets) ---\n');

  try {
    // 1. Dev Login
    console.log('1. Logging in as developer...');
    const loginRes = await fetch(`${API_URL}/api/v1/auth/dev/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'compiler-tester@example.com', name: 'Compiler Tester' }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error('Login failed');
    token = loginData.data.accessToken;
    console.log('✅ Login successful.');

    // 2. Create Room
    console.log('\n2. Creating a test room...');
    const roomRes = await fetch(`${API_URL}/api/v1/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: 'Compiler Test Room', language: 'javascript', isPublic: true }),
    });
    const roomData = await roomRes.json();
    if (!roomRes.ok) throw new Error(`Room creation failed: ${JSON.stringify(roomData)}`);
    roomId = roomData.data.room?.id || roomData.data.id;
    console.log(`✅ Room created with ID: ${roomId}`);

    // 3. Connect to /compiler socket namespace
    console.log('\n3. Connecting to /compiler socket namespace...');
    const socket = io(`${API_URL}/compiler`, { auth: { token } });

    await new Promise((resolve) => socket.on('connect', resolve));
    console.log(`✅ Socket connected! Socket ID: ${socket.id}`);

    // Join compiler channel for room
    await new Promise((resolve) => socket.emit('compiler:join', { roomId }, resolve));
    console.log('✅ Joined compiler room stream.');

    // Set up real-time stream listeners
    let receivedStdout = '';
    socket.on('compiler:stdout', (data) => {
      console.log(`📡 [STREAM STDOUT] Job ${data.jobId}: ${data.chunk}`);
      receivedStdout += data.chunk;
    });

    socket.on('compiler:stderr', (data) => {
      console.log(`📡 [STREAM STDERR] Job ${data.jobId}: ${data.chunk}`);
    });

    // 4. Test JavaScript Code Execution
    console.log('\n4. Submitting JavaScript code execution job...');
    const jsSource = 'console.log("Hello from Milestone 7 Compiler!");';

    const jsDonePromise = new Promise((resolve) => {
      socket.on('compiler:done', (res) => resolve(res));
    });

    const execRes = await fetch(`${API_URL}/api/v1/rooms/${roomId}/compiler/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ language: 'javascript', sourceCode: jsSource }),
    });
    const execData = await execRes.json();
    if (!execRes.ok) throw new Error(`Execution request failed: ${JSON.stringify(execData)}`);
    console.log(`✅ Job enqueued with ID: ${execData.data.job.id}`);

    const jsResult = await jsDonePromise;
    console.log('✅ JS Job Completed with result:', jsResult);
    if (!receivedStdout.includes('Hello from Milestone 7 Compiler!')) {
      throw new Error('Streaming stdout did not contain expected message!');
    }

    // 5. Test Python Code Execution
    console.log('\n5. Submitting Python code execution job...');
    const pySource = 'print("Python execution in BullMQ worker success!")';
    const pyDonePromise = new Promise((resolve) => {
      socket.once('compiler:done', (res) => resolve(res));
    });

    await fetch(`${API_URL}/api/v1/rooms/${roomId}/compiler/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ language: 'python', sourceCode: pySource }),
    });

    const pyResult = await pyDonePromise;
    console.log('✅ Python Job Completed with result:', pyResult);

    // 6. Test Execution Timeout (Infinite Loop Protection)
    console.log('\n6. Submitting Infinite Loop snippet (Testing 5s Timeout Protection)...');
    const timeoutSource = 'while(true) {}';
    const timeoutDonePromise = new Promise((resolve) => {
      socket.once('compiler:done', (res) => resolve(res));
    });

    await fetch(`${API_URL}/api/v1/rooms/${roomId}/compiler/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ language: 'javascript', sourceCode: timeoutSource }),
    });

    const timeoutResult = await timeoutDonePromise;
    console.log('✅ Timeout Job Completed with status:', timeoutResult.status);
    if (timeoutResult.status !== 'timeout') {
      throw new Error(`Expected job status to be 'timeout', but received '${timeoutResult.status}'`);
    }

    // 7. Fetch Execution History via REST API
    console.log('\n7. Fetching Compiler Job History via REST API...');
    const historyRes = await fetch(`${API_URL}/api/v1/rooms/${roomId}/compiler/jobs?limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const historyData = await historyRes.json();
    if (!historyRes.ok) throw new Error(`Fetch jobs failed: ${JSON.stringify(historyData)}`);

    console.log(`✅ Returned ${historyData.data.jobs.length} compiler job records from database.`);

    socket.disconnect();
    console.log('\n✅ MILESTONE 7 VERIFICATION SUCCESSFUL!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Milestone 7 Test Failed:', error);
    process.exit(1);
  }
}

runTest();
