import createBaseSlice from './baseSlice';
import { lessonService } from '../api/services/lessonService';
import type { Lesson, CreateLessonDto, UpdateLessonDto } from '../api/types';

const lessonBaseSlice = createBaseSlice<Lesson, CreateLessonDto, UpdateLessonDto>(
  'lessons',
  lessonService,
);

export const lessonsSlice = lessonBaseSlice.slice;
export const lessonsActions = lessonBaseSlice.actions;
export default lessonsSlice.reducer;
