import { Button, Card, Row, Col, Typography, Space, Carousel } from 'antd';
import {
  RobotOutlined,
  SoundOutlined,
  MessageOutlined,
  BookOutlined,
  MobileOutlined,
  AppleOutlined,
  AndroidOutlined,
  RocketOutlined,
  StarOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import './style.css';

const { Title, Paragraph, Text } = Typography;

const HomePage = () => {
  const features = [
    {
      icon: <SoundOutlined className="feature-icon" />,
      title: "Học với giọng nói",
      description: "Giao tiếp tự nhiên bằng giọng nói với AI giáo viên Hana. Luyện phát âm và nghe hiểu một cách tự nhiên nhất."
    },
    {
      icon: <MessageOutlined className="feature-icon" />,
      title: "Trò chuyện thông minh",
      description: "Hội thoại thông minh với AI được tối ưu hóa cho học ngôn ngữ. Nhận phản hồi và sửa lỗi tức thời."
    },
    {
      icon: <BookOutlined className="feature-icon" />,
      title: "Bài học cá nhân hóa",
      description: "Nội dung học tập được tùy chỉnh theo trình độ và mục tiêu của từng học viên."
    },
    {
      icon: <RobotOutlined className="feature-icon" />,
      title: "AI tiên tiến",
      description: "Sử dụng công nghệ AI và machine learning hiện đại nhất để mang đến trải nghiệm học tập tối ưu."
    }
  ];

  const solutions = [
    {
      icon: <RocketOutlined />,
      title: "Học mọi lúc mọi nơi",
      description: "Truy cập bài học 24/7 trên mọi thiết bị. Linh hoạt học theo lịch trình của bạn."
    },
    {
      icon: <TrophyOutlined />,
      title: "Tiến độ rõ ràng",
      description: "Theo dõi tiến độ học tập chi tiết với báo cáo và thống kê trực quan."
    },
    {
      icon: <StarOutlined />,
      title: "Hiệu quả cao",
      description: "Phương pháp học được chứng minh giúp tăng 3x tốc độ tiếp thu kiến thức."
    }
  ];

  const carouselItems = [
    {
      title: "CHÀO MỪNG ĐẾN VỚI HANA",
      subtitle: "Giáo viên AI thông minh cho học ngôn ngữ",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      title: "HỌC TẬP THÔNG MINH HƠN",
      subtitle: "Trải nghiệm học tập hiện đại và hiệu quả",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      title: "TIẾN BỘ MỖI NGÀY",
      subtitle: "Theo dõi và cải thiện kỹ năng của bạn",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Carousel Section */}
      <section className="hero-section">
        <Carousel autoplay autoplaySpeed={5000} effect="fade">
          {carouselItems.map((item, index) => (
            <div key={index}>
              <div className="carousel-slide" style={{ background: item.gradient }}>
                <div className="carousel-content">
                  <div className={"flex justify-center"}>
                    <img src={"/favicon.png"} className="hero-robot-icon" />
                  </div>

                  <Title level={1} className="hero-title">{item.title}</Title>
                  <Paragraph className="hero-subtitle">{item.subtitle}</Paragraph>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <Title level={2}>TÍNH NĂNG NỔI BẬT</Title>
          <Paragraph className="section-description">
            Hana mang đến trải nghiệm học tập toàn diện với các tính năng tiên tiến
          </Paragraph>
        </div>
        <Row gutter={[32, 32]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card className="feature-card" hoverable>
                <div className="feature-icon-wrapper">
                  {feature.icon}
                </div>
                <Title level={4} className="feature-title">{feature.title}</Title>
                <Paragraph className="feature-description">
                  {feature.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* Solutions Section */}
      <section className="solutions-section">
        <div className="section-header">
          <Title level={2}>GIẢI PHÁP CHÍNH</Title>
          <Paragraph className="section-description">
            Hệ thống được thiết kế để giải quyết mọi nhu cầu học tập của bạn
          </Paragraph>
        </div>
        <Row gutter={[24, 24]}>
          {solutions.map((solution, index) => (
            <Col xs={24} md={8} key={index}>
              <Card className="solution-card">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div className="solution-icon">{solution.icon}</div>
                  <Title level={4}>{solution.title}</Title>
                  <Paragraph>{solution.description}</Paragraph>
                  <Button type="link" className="solution-link">
                    Xem chi tiết →
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* Download Section */}
      <section className="download-section">
        <div className="download-content">
          <MobileOutlined className="download-icon" />
          <Title level={2} className="download-title">TẢI ỨNG DỤNG</Title>
          <Paragraph className="download-description">
            Trải nghiệm học tập tốt nhất trên thiết bị di động của bạn
          </Paragraph>
          <Space size="large" className="download-buttons">
            <Button
              type="primary"
              size="large"
              icon={<AppleOutlined />}
              className="download-btn"
            >
              App Store
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<AndroidOutlined />}
              className="download-btn download-btn-android"
            >
              Google Play
            </Button>
          </Space>
        </div>
      </section>
    </div>
  );
};

export default HomePage;