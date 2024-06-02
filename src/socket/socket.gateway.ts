import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Booking } from 'src/booking/schema/booking.schema';
import mongoose from 'mongoose';
import { Doctor } from 'src/doctor/schema/doctor.schema';
import { UpdateDoctor } from 'src/update-doctor/schema/updateDoctor.schema';

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
    [key: string]: {
      id: string;
      role: string;
      socket: Socket;
    };
  } = {};

  afterInit() {
    console.log('WebSocket Initialized');
  }
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    client.on('identify', ({ id, role }: { id: string; role: string }) => {
      if (id && role) {
        console.log(`Identified client - ID: ${id}, Role: ${role}`);
        this.clients[client.id] = { id, role, socket: client };
      } else {
        console.error('Invalid identification data', { id, role });
      }
    });

    client.on('removeIdentity', ({ id }: { id: string }) => {
      const clientEntry = Object.entries(this.clients).find(
        ([_, clientData]) => clientData.id === id,
      );

      if (clientEntry) {
        const [clientKey] = clientEntry;
        delete this.clients[clientKey];
        console.log(`Removed client identity - ID: ${id}`);
      } else {
        console.error(`No client found with ID: ${id} to remove.`);
      }
    });
  }

  handleDisconnect(client: Socket) {
    delete this.clients[client.id];
    console.log(`Client disconnected: ${client.id}`);
  }

  // Function to emit a new booking update to the specific patient and doctor
  emitNewBookingUpdate(bookingData: Booking) {
    const userId = bookingData.user._id.toString();
    const doctorId = bookingData.doctor._id.toString();

    // Find and emit to the specific patient and doctor
    Object.values(this.clients).forEach(({ id, role, socket }) => {
      if (
        (role === 'patient' && id === userId) ||
        (role === 'doctor' && id === doctorId)
      ) {
        socket.emit('newBookingUpdate', bookingData);
      }
    });
  }

  // Function to emit updates to a specific doctor
  emitDoctorUpdate(doctorData: Doctor) {
    const doctorId = doctorData._id.toString();

    // Find and emit to the specific  doctor
    Object.values(this.clients).forEach(({ id, role, socket }) => {
      if (role === 'doctor' && id == doctorId) {
        socket.emit('updateDoctor', doctorData);
      }
    });
  }

  // Function to emit booking status updates to the specific patient and doctor
  emitBookingStatus(bookingData: Booking) {
    const userId = bookingData.user._id.toString();
    const doctorId = bookingData.doctor._id.toString();

    // Find and emit to the specific patient and doctor
    Object.values(this.clients).forEach(({ id, role, socket }) => {
      if (
        (role === 'patient' && id === userId) ||
        (role === 'doctor' && id === doctorId)
      ) {
        socket.emit('bookingStatus', {
          bookingId: bookingData._id,
          status: bookingData.status,
        });
      }
    });
  }

  // Function to emit doctor status updates to a specific doctor
  emitDoctorStatus(
    doctorId: mongoose.Types.ObjectId,
    isApproved: string,
    message?: string,
  ) {
    const docId = doctorId.toString();

    // Find and emit to the specific doctor
    Object.values(this.clients).forEach(({ id, role, socket }) => {
      if (role === 'doctor' && id === docId) {
        socket.emit('doctorStatus', { isApproved, message });
      }
    });
  }

  // Function to emit doctor update requests to admin
  emitDoctorRequestToAdmin(updateData: UpdateDoctor) {
    // Find and emit to the admin
    Object.values(this.clients).forEach(({ role, socket }) => {
      if (role === 'admin') {
        socket.emit('updateDoctorToAdmin', updateData);
      }
    });
  }

  // Function to emit logout service to admin
  emitLogoutAdmin() {
    // Find and emit to the admin
    Object.values(this.clients).forEach(({ role, socket }) => {
      if (role === 'admin') {
        socket.emit('logoutAdmin');
      }
    });
  }
}
