import createBaseSlice from './baseSlice';
import { userService } from '../api/services/userService';
import type { CreateUserDto, UpdateUserDto, User } from '../api/types';

const userBaseSlice = createBaseSlice<User, CreateUserDto, UpdateUserDto>(
  'users',
  userService,
);

export const usersSlice = userBaseSlice.slice;
export const usersActions = userBaseSlice.actions;
export default usersSlice.reducer;
