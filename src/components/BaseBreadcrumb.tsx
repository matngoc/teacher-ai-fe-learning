import {Breadcrumb, Divider} from "antd";
import {HomeOutlined} from "@ant-design/icons";
import type {BreadcrumbItemType} from "antd/es/breadcrumb/Breadcrumb";
import React from "react";

interface BaseBreadcrumbProps {
    items: Partial<BreadcrumbItemType>[] | undefined;
    extraButton?: React.ReactNode;
}
export const BaseBreadcrumb: React.FC<BaseBreadcrumbProps> = ({items, extraButton}) => {
  return (
      <>
          <div className={"w-full flex justify-between"}>
              <Breadcrumb
                  style={{fontSize: "1rem", fontWeight: 500}}
                  items={[
                      {
                          href: '',
                          title: <HomeOutlined style={{fontSize: "1rem"}}/>,
                      },
                      ...(items ?? [])
                  ]}
              />
              {
                  extraButton && (
                      extraButton
                  )
              }
          </div>
          <Divider style={{marginTop: 8, marginBottom: 16}} />
      </>
  )
}