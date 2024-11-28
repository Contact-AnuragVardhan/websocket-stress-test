// loadTest.js
const io = require('socket.io-client');

const numClients = 10;
const clients = [];
const testDuration = 60000; // Test duration in milliseconds (60 seconds)
const messageInterval = 1500; // Interval between messages in milliseconds
const room_name = 'test_room4';
//const url = 'http://localhost:3001'; // URL of the server
const url = 'https://websocket-server-ko7h.onrender.com';

// Global counts
let totalMessagesSent = 0;
let totalMessagesReceived = 0;
let clientsReady = 0;

// Store clients' data
const clientsData = {};

for (let i = 0; i < numClients; i++) {
  const username = `user${i}`;
  clientsData[username] = {
    sentMessages: {}, // Store sent messages with IDs
    receivedMessages: {}, // Store received messages with IDs
    receivedFrom: {},
  };

  const socket = io(url, {
    transports: ['websocket'],
    reconnection: false,
  });

  // Listen for incoming messages
  socket.on('receive_message', (data) => {
    //console.log('************', data);
    const sender = data.author;
    const receiver = username;
    const messageId = data.id || ''; // Assume the message includes a unique ID

    // Ignore messages sent by the client itself
    if (sender !== receiver) {
      totalMessagesReceived++;

      // Track messages received from each sender
      if (!clientsData[receiver].receivedFrom[sender]) {
        clientsData[receiver].receivedFrom[sender] = 1;
      } else {
        clientsData[receiver].receivedFrom[sender]++;
      }

      // Store the received message
      clientsData[receiver].receivedMessages[messageId] = data.message;

      // **Modify validation to exclude "Blackbox" messages**
      if (sender !== 'Blackbox') {
        // Verify the message content
        const expectedMessage = `Hello from ${sender} #${messageId.split('_')[1]}`;
        if (data.message !== expectedMessage) {
          console.error(
            `Mismatch in message content for client ${receiver} from ${sender}. Expected: "${expectedMessage}", Received: "${data.message}"`
          );
        }
      } else {
        // Handle "Blackbox" messages if necessary
        console.log(`Received system message from Blackbox: "${data.message}"`);
      }
    }
  });

  socket.on('connect', () => {
    console.log(`Client ${i} connected as ${username}`);

    socket.on('joined_room', (data) => {
      console.log(`${username} joined room ${data.room}`);

      // Notify when client is ready
      clientsReady++;

      // Start sending messages only when all clients are ready
      if (clientsReady === numClients) {
        console.log('All clients are connected and joined the room. Starting to send messages.');

        clients.forEach(({ socket, username }) => {
          let messageCount = 0;
          const interval = setInterval(() => {
            messageCount++;
            const messageId = `${username}_${messageCount}`;
            const messageContent = `Hello from ${username} #${messageCount}`;

            // Emit the message with a unique ID and content
            socket.emit('send_message', {
              id: messageId,
              room: room_name,
              author: username,
              message: messageContent,
            });

            // Store the sent message
            clientsData[username].sentMessages[messageId] = messageContent;
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
    socket.emit('join_room', { room: room_name, username });
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

  const expectedMessagesPerClient =
    (numClients - 1) * Object.keys(clientsData[`user0`].sentMessages).length;

  for (const [username, data] of Object.entries(clientsData)) {
    console.log(`\nClient: ${username}`);
    console.log(`Messages Sent: ${Object.keys(data.sentMessages).length}`);
    console.log(`Messages Expected to Receive: ${expectedMessagesPerClient}`);

    // Exclude "Blackbox" messages from the actual received messages
    const actualUserMessagesReceived = Object.keys(data.receivedMessages).filter(
      (id) => !id.startsWith('Blackbox')
    ).length;
    console.log(`Messages Actually Received: ${actualUserMessagesReceived}`);

    if (actualUserMessagesReceived < expectedMessagesPerClient) {
      console.log('⚠️  Missing messages detected!');
    } else {
      console.log('✅ All messages received.');
    }

    console.log('Messages Received From:');
    for (const [sender, count] of Object.entries(data.receivedFrom)) {
      console.log(`  - ${sender}: ${count} messages`);
    }

    // Verify received messages
    let discrepancies = 0;
    for (const sender of Object.keys(data.receivedFrom)) {
      // Skip "Blackbox" in discrepancy checks
      if (sender === 'Blackbox') continue;

      const messagesFromSender = data.receivedFrom[sender];

      for (let msgNum = 1; msgNum <= messagesFromSender; msgNum++) {
        const messageId = `${sender}_${msgNum}`;
        const expectedMessage = `Hello from ${sender} #${msgNum}`;
        const receivedMessage = data.receivedMessages[messageId];

        if (receivedMessage !== expectedMessage) {
          discrepancies++;
          console.error(
            `Discrepancy detected for client ${username}: Expected "${expectedMessage}", but received "${receivedMessage}"`
          );
        }
      }
    }

    if (discrepancies > 0) {
      console.log(`⚠️  ${discrepancies} message content discrepancies detected for client ${username}.`);
    } else {
      console.log(`✅ All message contents are correct for client ${username}.`);
    }
  }
}, testDuration + 5000); // Waiting an extra 5 seconds to ensure all messages are processed