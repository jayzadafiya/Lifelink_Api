import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { Booking } from 'src/booking/schema/booking.schema';

@WebSocketGateway(3002, {
  cors: {
    origin: '*',
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private clients: {
    [key: string]: { id: string; role: string; socket: Socket };
  } = {};

  constructor(private readonly socketService: SocketService) {}

  afterInit(server: Server) {
    console.log('WebSocket Initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    client.on('identify', ({ id, role }) => {
      console.log(id, role);
      this.clients[client.id] = { id, role, socket: client };
    });
    console.log(this.clients);
  }

  handleDisconnect(client: Socket) {
    delete this.clients[client.id];
    console.log(`Client disconnected: ${client.id}`);
  }

  emitNewBookingUpdate(bookingData: Booking) {
    const userId = bookingData.user._id.toString();
    const doctorId = bookingData.doctor._id.toString();

    // Find and emit to the specific user and doctor
    Object.values(this.clients).forEach(({ id, role, socket }) => {
      if (
        (role === 'patient' && id === userId) ||
        (role === 'doctor' && id === doctorId)
      ) {
        socket.emit('newBookingUpdate', bookingData);
      }
    });
  }

  emitBookingStatus(bookingData: Booking) {
    const userId = bookingData.user._id.toString();
    const doctorId = bookingData.doctor._id.toString();

    // Find and emit to the specific user and doctor
    Object.values(this.clients).forEach(({ id, role, socket }) => {
      if (
        (role === 'patient' && id === userId) ||
        (role === 'doctor' && id === doctorId)
      ) {
        socket.emit('bookingStatus', {
          booking_id: bookingData._id,
          status: bookingData.status,
        });
      }
    });
  }
}
