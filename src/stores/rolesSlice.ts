import createBaseSlice from './baseSlice';
import { roleService } from '../api/services/roleService';
import type { CreateRoleDto, Role, UpdateRoleDto } from '../api/types';

const roleBaseSlice = createBaseSlice<Role, CreateRoleDto, UpdateRoleDto>(
  'roles',
  roleService,
);

export const rolesSlice = roleBaseSlice.slice;
export const rolesActions = roleBaseSlice.actions;
export default rolesSlice.reducer;
