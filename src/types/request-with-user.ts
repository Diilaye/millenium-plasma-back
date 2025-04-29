import { Request } from 'express';
import { IUser } from '../models/interfaces/user.interface';

export interface RequestWithUser extends Request {
  user?: IUser;
}
