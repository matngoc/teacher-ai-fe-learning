import React from 'react';
import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

const LAYOUT_PREFIXES = ['super-admin', 'admin', 'user'];

const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'Người dùng',
  roles: 'Roles',
  permissions: 'Phân quyền',
  dictionary: 'Từ điển',
  storage: 'Lưu trữ',
  profile: 'Hồ sơ',
  'change-password': 'Đổi mật khẩu',
};

const BaseBreadcrumb: React.FC = () => {
  const location = useLocation();
  const allSegments = location.pathname.split('/').filter((x) => x);

  // Lấy prefix layout để tạo link trang chủ đúng
  const prefix = LAYOUT_PREFIXES.find((p) => allSegments[0] === p);
  const homeHref = prefix ? `/${prefix}/dashboard` : '/redirect';

  // Bỏ segment layout prefix ra khỏi breadcrumb
  const pathnames = allSegments.filter((seg) => !LAYOUT_PREFIXES.includes(seg));

  const items = [
    {
      title: (
        <Link to={homeHref}>
          <HomeOutlined /> Trang chủ
        </Link>
      ),
    },
    ...pathnames
      .filter((seg) => isNaN(Number(seg)))
      .map((seg, index, arr) => {
        const label = BREADCRUMB_LABELS[seg] || seg;
        const isLast = index === arr.length - 1;
        // Tái tạo full URL với prefix
        const fullUrl = prefix
          ? `/${prefix}/${arr.slice(0, index + 1).join('/')}`
          : '/' + arr.slice(0, index + 1).join('/');
        return {
          title: isLast ? label : <Link to={fullUrl}>{label}</Link>,
        };
      }),
  ];

  return <Breadcrumb items={items} className="mb-4" />;
};

export default BaseBreadcrumb;
