import { AdminUser } from '../models/admin-user.model';
import { TENANTS } from '../constants/tenants.const';

export const MOCK_ADMIN_USER: AdminUser = {
  id: TENANTS[0].adminId,
  name: 'Xavier Ali',
  email: 'xavier@sredio.io',
  role: 'admin',
};
