import React, {useEffect} from 'react';
import { DatePicker, Form, Row, Col } from 'antd';
import type { FormInstance } from 'antd/es/form';
import dayjs from 'dayjs';

const { Item } = Form;

interface BaseDateRangeProps {
    form: FormInstance;
    startName?: string;
    endName?: string;
    startLabel?: string;
    endLabel?: string;
    required?: boolean;
    disabled?: boolean;
    defaultDays?: number;
    showTime?: boolean;
}

const BaseDateRange: React.FC<BaseDateRangeProps> = ({
                                                         form,
                                                         startName = 'startTime',
                                                         endName = 'endTime',
                                                         startLabel = 'Từ ngày',
                                                         endLabel = 'Đến ngày',
                                                         required = false,
                                                         disabled = false,
                                                         defaultDays = 7,
                                                         showTime = false,
                                                     }) => {
    useEffect(() => {
        const values = form.getFieldsValue([startName, endName]);
        const startValue = values[startName];
        const endValue = values[endName];

        const start = startValue ? dayjs(startValue) : dayjs().subtract(defaultDays, 'day').startOf('day');
        const end = endValue ? dayjs(endValue) : dayjs().endOf('day');

        form.setFieldsValue({
            [startName]: start,
            [endName]: end,
        });
    }, [form, startName, endName, defaultDays]);

    const disabledEndDate = (end: dayjs.Dayjs) => {
        const start = form?.getFieldValue(startName);
        if (!start || !end) return false;
        return end.isBefore(start, 'day');
    };

    const handleStartChange = (value: dayjs.Dayjs | null) => {
        const end = form?.getFieldValue(endName);
        if (end && value && end.isBefore(value)) {
            form?.setFieldValue(endName, null);
        }
    };

    return (
        <Row gutter={16}>
            <Col span={12}>
                <Item
                    label={startLabel}
                    name={startName}
                    rules={
                        required
                            ? [{ required: true, message: `Vui lòng chọn ${startLabel.toLowerCase()}` }]
                            : []
                    }
                >
                    <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                        disabled={disabled}
                        onChange={handleStartChange}
                        placeholder="Chọn ngày bắt đầu"
                        showTime={showTime ? { format: 'HH:mm' } : false}
                    />
                </Item>
            </Col>
            <Col span={12}>
                <Item
                    label={endLabel}
                    name={endName}
                    rules={[
                        ...(required
                            ? [{ required: true, message: `Vui lòng chọn ${endLabel.toLowerCase()}` }]
                            : []),
                        {
                            validator: (_, value) => {
                                const start = form.getFieldValue(startName);
                                if (value && start && value.isBefore(start)) {
                                    return Promise.reject(
                                        new Error('Ngày kết thúc không được nhỏ hơn ngày bắt đầu')
                                    );
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}
                >
                    <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                        disabledDate={disabledEndDate}
                        disabled={disabled}
                        showTime={showTime ? { format: 'HH:mm' } : false}
                        placeholder="Chọn ngày kết thúc"
                    />
                </Item>
            </Col>
        </Row>
    );
};

export default BaseDateRange;
