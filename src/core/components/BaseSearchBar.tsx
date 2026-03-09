import React, { useCallback, useRef } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface BaseSearchBarProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  debounceMs?: number;
  allowClear?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const BaseSearchBar: React.FC<BaseSearchBarProps> = ({
  placeholder = 'Tìm kiếm...',
  onSearch,
  debounceMs = 400,
  allowClear = true,
  className,
  style,
}) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onSearch(value);
      }, debounceMs);
    },
    [onSearch, debounceMs],
  );

  return (
    <Input
      prefix={<SearchOutlined className="text-gray-400" />}
      placeholder={placeholder}
      onChange={handleChange}
      onPressEnter={(e) => onSearch((e.target as HTMLInputElement).value)}
      allowClear={allowClear}
      className={className}
      style={{ minWidth: 260, ...style }}
    />
  );
};

export default BaseSearchBar;
