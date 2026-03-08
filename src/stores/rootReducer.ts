import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import usersReducer from './usersSlice';
import rolesReducer from './rolesSlice';
import permissionsReducer from './permissionsSlice';
import dictionaryReducer from './dictionarySlice';
import coursesReducer from './coursesSlice';
import lessonsReducer from './lessonsSlice';
import learnerReducer from './learnerSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  users: usersReducer,
  roles: rolesReducer,
  permissions: permissionsReducer,
  dictionary: dictionaryReducer,
  courses: coursesReducer,
  lessons: lessonsReducer,
  learner: learnerReducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
