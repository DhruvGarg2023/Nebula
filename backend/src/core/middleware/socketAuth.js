import jwt from 'jsonwebtoken';
import config from '../../config/index.js';
import prisma from '../database/prisma.js';

/**
 * Socket.IO middleware to authenticate connections via JWT.
 * Reads the token from the handshake auth payload.
 *
 * @param {import('socket.io').Socket} socket - The socket connection
 * @param {Function} next - The next middleware function
 */
export async function socketAuth(socket, next) {
  try {
    // Extract token from handshake auth, headers, or query string (for tools like Postman)
    const token = socket.handshake.auth?.token 
      || socket.handshake.headers?.authorization?.split(' ')[1]
      || socket.handshake.query?.token;

    if (!token) {
      return next(new Error('Authentication Error: Token missing'));
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Ensure user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return next(new Error('Authentication Error: User not found'));
    }

    // Attach user to socket
    socket.user = user;
    next();
  } catch (error) {
    console.error('SOCKET AUTH ERROR:', error);
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Authentication Error: Token expired'));
    }
    return next(new Error('Authentication Error: Invalid token'));
  }
}
