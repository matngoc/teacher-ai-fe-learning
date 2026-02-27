import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import usersReducer from './usersSlice';
import rolesReducer from './rolesSlice';
import permissionsReducer from './permissionsSlice';
import dictionaryReducer from './dictionarySlice';
import coursesReducer from './coursesSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  users: usersReducer,
  roles: rolesReducer,
  permissions: permissionsReducer,
  dictionary: dictionaryReducer,
  courses: coursesReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
