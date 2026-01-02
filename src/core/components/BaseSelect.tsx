import {Select, type SelectProps, Spin} from "antd";
import type { DefaultOptionType } from "antd/es/select";
import React, {useEffect, useState} from "react";

interface BaseSelectProps extends Omit<SelectProps, 'options'> {
    fetchOptions: () => Promise<{ label: string; value: any }[]>; // Hàm gọi API
}

const BaseSelect: React.FC<BaseSelectProps> = ({ fetchOptions, ...rest }) => {
    const [options, setOptions] = useState<DefaultOptionType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const loadOptions = async () => {
            try {
                setLoading(true);
                const data = await fetchOptions();
                setOptions(data);
            } catch (error) {
                console.error('Lỗi khi load options:', error);
            } finally {
                setLoading(false);
            }
        };

        loadOptions().then();
    }, [fetchOptions]);

    return (
        <Select
            showSearch
            allowClear
            placeholder="Chọn"
            loading={loading}
            options={options}
            filterOption={(input, option) =>
                (option?.label as string).toLowerCase().includes(input.toLowerCase())
            }
            notFoundContent={loading ? <Spin size="small" /> : 'Không có dữ liệu'}
            {...rest}
        />
    );
};

export default BaseSelect;