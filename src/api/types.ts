// Common types used across the application

/** Envelope chung của tất cả API response trước khi interceptor unwrap */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

/** Cấu trúc page response sau khi đã unwrap (res.data = phần data bên trong) */
export interface PageData<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface PageRequest {
  page?: number;
  size?: number;
  keyword?: string;
}

export interface PageResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export interface BaseEntity {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

// Auth types
export interface User extends BaseEntity {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'LOCKED' | 'DELETED';
  roles?: Role[];
  motivation?: string;
  englishLevel?: string;
  favouriteTopic?: string;
  age?: number;
  job?: string;
}

export interface Role extends BaseEntity {
  name: string;
  description?: string;
  isSystem?: boolean;
  permissions?: Permission[];
}

export interface Permission extends BaseEntity {
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface LoginDto {
  username: string;
  password: string;
  deviceInfo?: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// User types
export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roleIds?: number[];
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  status?: 'ACTIVE' | 'LOCKED' | 'DELETED';
  roleIds?: number[];
}

export interface UserPageDto extends PageRequest {
  status?: 'ACTIVE' | 'LOCKED' | 'DELETED';
}

// Role types
export interface CreateRoleDto {
  name: string;
  description?: string;
  isSystem?: boolean;
  permissionIds?: number[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissionIds?: number[];
}

export interface AssignPermissionsDto {
  permissionIds: number[];
}

export interface CreatePermissionDto {
  name: string;
  resource: string;
  action: string;
  description?: string;
}

// Dictionary types
export type DictionaryType = 'MOTIVATION' | 'ENGLISH_LEVEL' | 'FAVOURITE_TOPIC';

export interface Dictionary extends BaseEntity {
  key: string;
  value: string;
  type?: DictionaryType;
  description?: string;
}

export interface CreateDictionaryDto {
  key: string;
  value: string;
  type?: DictionaryType;
  description?: string;
}

export interface UpdateDictionaryDto {
  value?: string;
  description?: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  motivation?: string;
  englishLevel?: string;
  favouriteTopic?: string;
  age?: number;
  job?: string;
  avatarUrl?: string;
}

// Course types
export type CourseLevel = 'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE' | 'UPPER_INTERMEDIATE' | 'ADVANCED';

export interface Course extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  level?: CourseLevel;
  imageUrl?: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface CreateCourseDto {
  name: string;
  code: string;
  description?: string;
  level?: CourseLevel;
  imageUrl?: string;
  isActive?: boolean;
}

export interface UpdateCourseDto {
  name?: string;
  description?: string;
  level?: CourseLevel;
  imageUrl?: string;
  isActive?: boolean;
}

export interface CourseFilterDto {
  keyword?: string;
  level?: CourseLevel;
  isActive?: boolean;
  page?: number;
  size?: number;
}

// Lesson types
export interface Lesson extends BaseEntity {
  courseId: number
  code: string
  name: string
  description?: string
  taskChain?: string
  generationParams?: string
  providerName?: string
  systemPrompt?: string
  formatOutput?: string
  isActive: boolean
  isDeleted?: boolean
  learningStatus?: string
  progressPercent?: number
  course?: {
    id: number
    name: string
    code: string
    description?: string
    level?: string
    imageUrl?: string
    isActive: boolean
  }
}

export interface CreateLessonDto {
  courseId: number;
  code: string;
  name: string;
  description?: string;
  taskChain?: string;
  generationParams?: string;
  providerName?: string;
  systemPrompt?: string;
  formatOutput?: string;
  isActive?: boolean;
}

export interface UpdateLessonDto {
  courseId?: number;
  name?: string;
  description?: string;
  taskChain?: string;
  generationParams?: string;
  providerName?: string;
  systemPrompt?: string;
  formatOutput?: string;
  isActive?: boolean;
}

export interface LessonFilterDto {
  keyword?: string;
  courseId?: number;
  isActive?: boolean;
  page?: number;
  size?: number;
}

// Lesson History types
export type LessonHistoryStatus = 'in_progress' | 'completed' | 'paused';

export interface LessonHistory extends BaseEntity {
  lessonId: number;
  userId: number;
  startedAt?: string;
  finishedAt?: string;
  progressPercent: number;
  status: LessonHistoryStatus;
  note?: string;
}

export interface CreateLessonHistoryDto {
  lessonId: number;
  userId: number;
  startedAt?: string;
  finishedAt?: string;
  progressPercent?: number;
  status?: LessonHistoryStatus;
  note?: string;
}

export interface UpdateLessonHistoryDto {
  startedAt?: string;
  finishedAt?: string;
  progressPercent?: number;
  status?: LessonHistoryStatus;
  note?: string;
}

export interface LessonHistoryFilterDto {
  page?: number;
  size?: number;
  keyword?: string;
  lessonId?: number;
  userId?: number;
  status?: LessonHistoryStatus;
}

// Storage types
export interface StorageFile extends BaseEntity {
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url?: string;
}
