import mongoose from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Contact } from './schema/contact.schema';
import { createOne } from 'shared/handlerFactory';
import { CreateContactDto } from './dto/createContact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact.name) private contactModel: mongoose.Model<Contact>,
  ) {}

  async createContact(createContactDto: CreateContactDto): Promise<Contact> {
    const contact = await createOne(this.contactModel, createContactDto);
    if (!contact) {
      throw new BadRequestException('Error while creating doctor');
    }
    return contact;
  }
}
