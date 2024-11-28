module.exports = {
    beforeScenario: async (context) => {
      context.ws = new WebSocket(context.config.target.replace('http', 'ws'));
      context.connected = false;
  
      return new Promise((resolve, reject) => {
        context.ws.on('open', () => {
          context.connected = true;
          resolve();
        });
  
        context.ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        });
  
        context.ws.on('close', () => {
          context.connected = false;
          console.warn('WebSocket connection closed');
        });
      });
    },
    afterScenario: async (context) => {
      if (context.ws.readyState === WebSocket.OPEN) {
        context.ws.close();
      }
    },
    send: async (context, message) => {
      return new Promise((resolve) => {
        if (context.connected) {
          context.ws.send(JSON.stringify(message), resolve);
        } else {
          console.warn('Message not sent, WebSocket disconnected:', message);
          resolve();
        }
      });
    },
  };
  