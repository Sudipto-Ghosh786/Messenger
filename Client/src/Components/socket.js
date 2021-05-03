import io from 'socket.io-client';

// const SERVER = 'https://online-messenger-server.herokuapp.com/';
const SERVER = 'http://localhost:8080/';

export const socket = io(SERVER, { transports: ['websocket', 'polling', 'flashsocket'] });
