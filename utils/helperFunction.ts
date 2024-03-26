import * as bcrypt from 'bcryptjs';

export const bcryptPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, parseInt(process.env.SALT));
};
