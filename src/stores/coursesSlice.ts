import createBaseSlice from './baseSlice';
import { courseService } from '../api/services/courseService';
import type { Course, CreateCourseDto, UpdateCourseDto } from '../api/types';

const courseBaseSlice = createBaseSlice<Course, CreateCourseDto, UpdateCourseDto>(
  'courses',
  courseService,
);

export const coursesSlice = courseBaseSlice.slice;
export const coursesActions = courseBaseSlice.actions;
export default coursesSlice.reducer;
