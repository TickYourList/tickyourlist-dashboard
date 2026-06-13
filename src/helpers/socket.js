import { io } from "socket.io-client";

// Same origin the REST API lives on — keep in sync with api_helper.js.
const SOCKET_URL = "https://api.univolenitsolutions.com";
// const SOCKET_URL = "http://localhost:3005";

let socket = null;

/**
 * Lazily create a single shared socket connection for the whole dashboard.
 * Pages call getSocket() and attach their own listeners; we never disconnect on
 * unmount so the connection is reused across navigation.
 */
export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export default getSocket;
