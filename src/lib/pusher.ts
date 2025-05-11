import Pusher from 'pusher-js';
import { Server as PusherServerType } from 'socket.io';

// Initialize Pusher client for the browser
export const pusherClient = typeof window !== 'undefined' 
  ? new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
      forceTLS: true,
    })
  : null;

// For server-side Pusher, we'll use Socket.IO instead
// This will be initialized in the API route that needs it
export let PusherServer: PusherServerType | null = null;

export const initPusherServer = (server: any) => {
  if (!PusherServer) {
    const io = new PusherServerType(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
    
    PusherServer = io;
    
    // Setup authentication for private channels
    io.use((socket, next) => {
      const userId = socket.handshake.auth.userId;
      if (!userId) {
        return next(new Error('Authentication error'));
      }
      
      // Attach user ID to socket for later use
      socket.data.userId = userId;
      next();
    });
    
    // Handle connections
    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.data.userId}`);
      
      // Join user to their private channel
      socket.join(`private-user-${socket.data.userId}`);
      
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.data.userId}`);
      });
    });
  }
  
  return PusherServer;
}; 