import { socketAuth } from './src/core/middleware/socketAuth.js';

async function run() {
  try {
    const loginRes = await fetch('http://localhost:3000/api/v1/auth/dev/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', name: 'Test User' })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.accessToken;
    console.log("Token generated:", token);

    const mockSocket = {
      handshake: {
        auth: { token: token },
        headers: {},
        query: {}
      }
    };

    let nextCalled = false;
    let nextErr = null;
    await socketAuth(mockSocket, (err) => {
      nextCalled = true;
      nextErr = err;
    });

    console.log("Next called:", nextCalled);
    console.log("Next error:", nextErr);
    console.log("Socket user:", mockSocket.user);

  } catch(e) {
    console.error(e);
  }
}

run();
