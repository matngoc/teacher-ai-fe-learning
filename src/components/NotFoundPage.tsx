import {Button, Result} from "antd";
import {useNavigate} from "react-router";

const NotFoundPage = () => {
    const navigate = useNavigate();
    return (
        <Result
            status="404"
            title={"Lỗi"}
            subTitle={"Không tìm thấy trang"}
            extra={
                <Button type="primary" onClick={() => navigate('/page')}>
                   Quay lại
                </Button>
            }
        />
    );
};

export default NotFoundPage;