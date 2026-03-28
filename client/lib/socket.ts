import { io } from 'socket.io-client';

const URL = process.env.NEXT_PUBLIC_SOCKET || 'http://localhost:5000';

export const socket = io(URL, {
  autoConnect: false, // Connect manually when user is authenticated
  transports: ["websocket"],   // ✅ IMPORTANT
  withCredentials: true
});
