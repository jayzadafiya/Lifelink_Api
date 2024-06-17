import { Body, Controller, Post } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/createContact.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Controller('contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,

    private mailService: MailerService,
  ) {}

  @Post('/')
  async create(@Body() createContactDto: CreateContactDto) {
    const { email, message, subject } = createContactDto;
    const contact = this.contactService.createContact(createContactDto);

    if (contact) {
      this.mailService.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Query Received',
        text: `Your query has been received with this Subject: ${subject} and message: ${message} .`,
      });
    }
    return contact;
  }
}
