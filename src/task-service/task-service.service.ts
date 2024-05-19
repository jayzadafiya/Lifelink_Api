import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import mongoose from 'mongoose';
import { BookingService } from 'src/booking/booking.service';
import { DoctorService } from 'src/doctor/doctor.service';
import { User } from 'src/user/schema/user.schema';

interface bookingInterface {
  user: User;
  time: string;
  fees: string;
  status: string;
  bookingDate: string;
}

@Injectable()
export class TaskServiceService {
  constructor(
    private bookingService: BookingService,

    private mailService: MailerService,
    private doctorService: DoctorService,
  ) {}

  @Cron('0 0 0 1 * *')
  async handleCron() {
    try {
      const startDate = new Date();
      startDate.setDate(1);
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date();
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);

      const allBookings = await this.bookingService.getAllAppointment(
        startDate.toISOString(),
        endDate.toISOString(),
      );

      const doctorBookings = allBookings.reduce((acc, booking) => {
        const doctorId = booking.doctor._id.toString();
        if (!acc[doctorId]) {
          acc[doctorId] = [];
        }
        acc[doctorId].push(booking);
        return acc;
      }, {});

      for (const [doctorId, bookings] of Object.entries<bookingInterface[]>(
        doctorBookings,
      )) {
        const doctor = await this.doctorService.getDoctorById(
          new mongoose.Types.ObjectId(doctorId),
        );

        const emailContent = this.generateEmailContent(bookings);

        this.mailService.sendMail({
          from: process.env.EMAIL_FROM,
          to: doctor.email,
          subject: 'Monthly Booking Details',
          text: emailContent.text,
          html: emailContent.html,
        });
      }
    } catch (error) {
      console.error('Error making API call:', error);
    }
  }

  generateEmailContent(bookings: bookingInterface[]) {
    const text = bookings
      .map(
        (booking) => `
          Booking Date: ${booking.bookingDate}
          User: ${booking.user.name}
          Time: ${booking.time}
          Fees: ${booking.fees}
          Status: ${booking.status}
        `,
      )
      .join('\n');

    const html = `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px;">Booking Date</th>
            <th style="border: 1px solid #ddd; padding: 8px;">User</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Time</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Fees</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${bookings
            .map(
              (booking) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align:center;">${booking.bookingDate}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align:center;">${booking.user.name}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align:center;">${booking.time}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align:center;">${booking.fees}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align:center;">${booking.status}</td>
              </tr>
            `,
            )
            .join('')}
        </tbody>
      </table>
    `;

    return { text, html };
  }
}
