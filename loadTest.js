// loadTest.js
const io = require('socket.io-client');

const numClients = 5;
const clients = [];
const testDuration = 60000; // Test duration in milliseconds (60 seconds)
const messageInterval = 1500; // Interval between messages in milliseconds

// Global counts
let totalMessagesSent = 0;
let totalMessagesReceived = 0;
let clientsReady = 0;

// Store clients' data
const clientsData = {};

for (let i = 0; i < numClients; i++) {
  const username = `user${i}`;
  clientsData[username] = {
    sentMessages: 0,
    receivedMessages: 0,
    receivedFrom: {},
  };

  const socket = io('http://localhost:3001', {
    transports: ['websocket'],
    reconnection: false,
  });

  // Listen for incoming messages
  socket.on('receive_message', (data) => {
    const sender = data.author;
    const receiver = username;

    // Ignore messages sent by the client itself
    if (sender !== receiver) {
      clientsData[receiver].receivedMessages++;
      totalMessagesReceived++;

      // Track messages received from each sender
      if (!clientsData[receiver].receivedFrom[sender]) {
        clientsData[receiver].receivedFrom[sender] = 1;
      } else {
        clientsData[receiver].receivedFrom[sender]++;
      }
    }
  });

  socket.on('connect', () => {
    console.log(`Client ${i} connected as ${username}`);

    // Set up listeners before emitting events
    socket.on('joined_room', (data) => {
      console.log(`${username} joined room ${data.room}`);

      // Notify when client is ready
      clientsReady++;

      // Start sending messages only when all clients are ready
      if (clientsReady === numClients) {
        console.log('All clients are connected and joined the room. Starting to send messages.');

        // Start sending messages for all clients
        clients.forEach(({ socket, username }) => {
          const interval = setInterval(() => {
            const message = `Hello from ${username}`;
            socket.emit('send_message', {
              room: 'test-room',
              author: username,
              message,
            });
            clientsData[username].sentMessages++;
            totalMessagesSent++;
          }, messageInterval);

          // Stop after test duration
          setTimeout(() => {
            clearInterval(interval);
            socket.disconnect();
          }, testDuration);
        });
      }
    });

    socket.emit('user_connected', { username });
    socket.emit('join_room', { room: 'test-room', username });
  });

  socket.on('disconnect', () => {
    console.log(`Client ${i} (${username}) disconnected`);
  });

  clients.push({ socket, username });
}

// After all clients have disconnected, generate the report
setTimeout(() => {
  console.log('\n=== Test Complete ===\n');
  console.log('Total Messages Sent:', totalMessagesSent);
  console.log('Total Messages Received:', totalMessagesReceived);

  const expectedMessagesPerClient = (numClients - 1) * clientsData[`user0`].sentMessages;

  for (const [username, data] of Object.entries(clientsData)) {
    console.log(`\nClient: ${username}`);
    console.log(`Messages Sent: ${data.sentMessages}`);
    console.log(`Messages Expected to Receive: ${expectedMessagesPerClient}`);
    console.log(`Messages Actually Received: ${data.receivedMessages}`);

    if (data.receivedMessages < expectedMessagesPerClient) {
      console.log('⚠️  Missing messages detected!');
    } else {
      console.log('✅ All messages received.');
    }

    console.log('Messages Received From:');
    for (const [sender, count] of Object.entries(data.receivedFrom)) {
      console.log(`  - ${sender}: ${count} messages`);
    }
  }
}, testDuration + 5000); // Wait an extra 5 seconds to ensure all messages are processed
