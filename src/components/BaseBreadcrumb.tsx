import {Breadcrumb} from "antd";
import {HomeOutlined} from "@ant-design/icons";
import type {BreadcrumbItemType} from "antd/es/breadcrumb/Breadcrumb";
import React from "react";

interface BaseBreadcrumbProps {
    items: Partial<BreadcrumbItemType>[] | undefined;
    extraButton?: React.ReactNode;
}
export const BaseBreadcrumb: React.FC<BaseBreadcrumbProps> = ({items, extraButton}) => {
  return (
      <div className="base-breadcrumb-container">
          <Breadcrumb
              className="base-breadcrumb"
              items={[
                  {
                      href: '',
                      title: <HomeOutlined className="base-breadcrumb-icon"/>,
                  },
                  ...(items ?? [])
              ]}
          />
          {extraButton && (
              <div className="base-breadcrumb-actions">
                  {extraButton}
              </div>
          )}
      </div>
  )
}