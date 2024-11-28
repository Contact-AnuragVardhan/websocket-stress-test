Expected Output like :
Client 0 connected as user0
Client 1 connected as user1
Client 2 connected as user2
Client 3 connected as user3
Client 4 connected as user4
user3 joined room test-room
user4 joined room test-room
user0 joined room test-room
user1 joined room test-room
user2 joined room test-room
All clients are connected and joined the room. Starting to send messages.
Client 0 (user0) disconnected
Client 1 (user1) disconnected
Client 2 (user2) disconnected
Client 3 (user3) disconnected
Client 4 (user4) disconnected

=== Test Complete ===

Total Messages Sent: 195
Total Messages Received: 799

Client: user0
Messages Sent: 39
Messages Expected to Receive: 156
Messages Actually Received: 161
✅ All messages received.
Messages Received From:
  - Blackbox: 5 messages
  - user1: 39 messages
  - user2: 39 messages
  - user3: 39 messages
  - user4: 39 messages

Client: user1
Messages Sent: 39
Messages Expected to Receive: 156
Messages Actually Received: 161
✅ All messages received.
Messages Received From:
  - Blackbox: 5 messages
  - user0: 39 messages
  - user2: 39 messages
  - user3: 39 messages
  - user4: 39 messages

Client: user2
Messages Sent: 39
Messages Expected to Receive: 156
Messages Actually Received: 161
✅ All messages received.
Messages Received From:
  - Blackbox: 5 messages
  - user0: 39 messages
  - user1: 39 messages
  - user3: 39 messages
  - user4: 39 messages

Client: user3
Messages Sent: 39
Messages Expected to Receive: 156
Messages Actually Received: 158
✅ All messages received.
Messages Received From:
  - user0: 39 messages
  - user1: 39 messages
  - user2: 39 messages
  - Blackbox: 2 messages
  - user4: 39 messages

Client: user4
Messages Sent: 39
Messages Expected to Receive: 156
Messages Actually Received: 158
✅ All messages received.
Messages Received From:
  - user0: 39 messages
  - user1: 39 messages
  - user2: 39 messages
  - Blackbox: 2 messages
  - user3: 39 messages