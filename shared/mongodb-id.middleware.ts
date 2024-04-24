import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class MongoDBIdMiddleware implements NestMiddleware {
  /**
   * Middleware to validate MongoDB ObjectIds.
   * Ensures that the 'id' parameter in the request is a valid MongoDB ObjectId.
   * If the 'id' is invalid, it throws a BadRequestException.
   */

  use(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID');
    }

    next();
  }
}
