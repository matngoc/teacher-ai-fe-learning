import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';
import SuperAdminLayout from '../core/layout/SuperAdminLayout';
import AdminLayout from '../core/layout/AdminLayout';
import UserLayout from '../core/layout/UserLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import UsersListPage from '../pages/users/UsersListPage';
import RolesListPage from '../pages/roles/RolesListPage';
import PermissionsListPage from '../pages/permissions/PermissionsListPage';
import DictionaryListPage from '../pages/dictionary/DictionaryListPage';
import StoragePage from '../pages/storage/StoragePage';
import ProfilePage from '../pages/auth/ProfilePage';
import ChangePasswordPage from '../pages/auth/ChangePasswordPage';
import NotFoundPage from '../pages/NotFoundPage';
import RoleRedirect from './RoleRedirect';
import CoursesListPage from '../pages/courses/CoursesListPage';
import CoursesViewPage from '../pages/courses/CoursesViewPage';

const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/redirect', element: <RoleRedirect /> },

  // Super Admin routes
  {
    path: '/super-admin',
    element: (
      <PrivateRoute>
        <RoleRoute allowedRoles={['SUPER_ADMIN']}>
          <SuperAdminLayout />
        </RoleRoute>
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/super-admin/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'users', element: <UsersListPage /> },
      { path: 'roles', element: <RolesListPage /> },
      { path: 'permissions', element: <PermissionsListPage /> },
      { path: 'dictionary', element: <DictionaryListPage /> },
      { path: 'storage', element: <StoragePage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'change-password', element: <ChangePasswordPage /> },
    ],
  },

  // Admin routes
  {
    path: '/admin',
    element: (
      <PrivateRoute>
        <RoleRoute allowedRoles={['ADMIN']}>
          <AdminLayout />
        </RoleRoute>
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'courses', element: <CoursesListPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'change-password', element: <ChangePasswordPage /> },
    ],
  },

  // User routes
  {
    path: '/user',
    element: (
      <PrivateRoute>
        <RoleRoute allowedRoles={['USER']}>
          <UserLayout />
        </RoleRoute>
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/user/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'courses', element: <CoursesViewPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'change-password', element: <ChangePasswordPage /> },
    ],
  },

  // Root redirect
  { path: '/', element: <Navigate to="/redirect" replace /> },

  // 404
  { path: '*', element: <NotFoundPage /> },
]);

export default router;
