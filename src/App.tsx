import { App as AntdApp, ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import './App.css';
import AuthInitializer from './core/components/AuthInitializer';

function App() {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#4f46e5',
          borderRadius: 8,
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
        },
      }}
    >
      <AntdApp>
        <AuthInitializer>
          <RouterProvider router={router} />
        </AuthInitializer>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
