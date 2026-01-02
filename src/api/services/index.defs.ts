/** Generate by swagger-axios-codegen */
/* eslint-disable */
// @ts-nocheck
import axiosStatic, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

export interface IRequestOptions extends AxiosRequestConfig {
  /**
   * show loading status
   */
  loading?: boolean;
  /**
   * display error message
   */
  showError?: boolean;
  /**
   * indicates whether Authorization credentials are required for the request
   * @default true
   */
  withAuthorization?: boolean;
}

export interface IRequestConfig {
  method?: any;
  headers?: any;
  url?: any;
  data?: any;
  params?: any;
}

// Add options interface
export interface ServiceOptions {
  axios?: AxiosInstance;
  /** only in axios interceptor config*/
  loading: boolean;
  showError: boolean;
}

// Add default options
export const serviceOptions: ServiceOptions = {};

// Instance selector
export function axios(configs: IRequestConfig, resolve: (p: any) => void, reject: (p: any) => void): Promise<any> {
  if (serviceOptions.axios) {
    return serviceOptions.axios
      .request(configs)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  } else {
    throw new Error('please inject yourself instance like axios  ');
  }
}

export function getConfigs(method: string, contentType: string, url: string, options: any): IRequestConfig {
  const configs: IRequestConfig = {
    loading: serviceOptions.loading,
    showError: serviceOptions.showError,
    ...options,
    method,
    url
  };
  configs.headers = {
    ...options.headers,
    'Content-Type': contentType
  };
  return configs;
}

export const basePath = '';

export interface IList<T> extends Array<T> {}
export interface List<T> extends Array<T> {}
export interface IDictionary<TValue> {
  [key: string]: TValue;
}
export interface Dictionary<TValue> extends IDictionary<TValue> {}

export interface IListResult<T> {
  items?: T[];
}

export class ListResultDto<T> implements IListResult<T> {
  items?: T[];
}

export interface IPagedResult<T> extends IListResult<T> {
  totalCount?: number;
  items?: T[];
}

export class PagedResultDto<T = any> implements IPagedResult<T> {
  totalCount?: number;
  items?: T[];
}

// customer definition
// empty

/** CreateUserDto */
export interface CreateUserDto {
  /**  */
  email: string;

  /**  */
  description: string;

  /**  */
  roleId: string;

  /**  */
  password: string;
}

/** PageRequestDto */
export interface PageRequestDto {
  /**  */
  filters: object;

  /**  */
  page: number;

  /**  */
  size: number;
}

/** UpdateUserDto */
export interface UpdateUserDto {
  /**  */
  email?: string;

  /**  */
  description?: string;

  /**  */
  roleId?: string;

  /**  */
  password?: string;
}

/** CreateRoleDto */
export interface CreateRoleDto {
  /**  */
  name: string;

  /**  */
  description: string;
}

/** UpdateRoleDto */
export interface UpdateRoleDto {
  /**  */
  name?: string;

  /**  */
  description?: string;
}

/** LoginDto */
export interface LoginDto {
  /**  */
  email: string;
}

/** RegisterDto */
export interface RegisterDto {
  /**  */
  email: string;
}

/** CreateCampaignDto */
export interface CreateCampaignDto {
  /**  */
  name: string;

  /**  */
  description: string;

  /**  */
  featureImage: string;

  /**  */
  publicResult: boolean;

  /**  */
  startTime: Date;

  /**  */
  endTime: Date;
}

/** UpdateCampaignDto */
export interface UpdateCampaignDto {
  /**  */
  name?: string;

  /**  */
  description?: string;

  /**  */
  featureImage?: string;

  /**  */
  publicResult?: boolean;

  /**  */
  startTime?: Date;

  /**  */
  endTime?: Date;
}

/** ObjectId */
export interface ObjectId {}

/** CreateVoteDto */
export interface CreateVoteDto {
  /**  */
  name: string;

  /**  */
  description: string;

  /**  */
  featureImage: string;

  /**  */
  options: string[];

  /**  */
  renderType: number;

  /**  */
  tags: string[];

  /**  */
  campaignId: ObjectId;

  /**  */
  createdDate: Date;
}

/** UpdateVoteDto */
export interface UpdateVoteDto {
  /**  */
  name?: string;

  /**  */
  description?: string;

  /**  */
  featureImage?: string;

  /**  */
  options?: string[];

  /**  */
  renderType?: number;

  /**  */
  tags?: string[];

  /**  */
  campaignId?: ObjectId;

  /**  */
  createdDate?: Date;
}

/** CreateTransactionDto */
export interface CreateTransactionDto {
  /**  */
  voterId: string;

  /**  */
  choose: number;

  /**  */
  voteId: string;
}

/** PageRequestTransactionDto */
export interface PageRequestTransactionDto {
  /**  */
  filters: object;

  /**  */
  page: number;

  /**  */
  size: number;
}

/** UpdateTransactionDto */
export interface UpdateTransactionDto {
  /**  */
  voterId?: string;

  /**  */
  choose?: number;

  /**  */
  voteId?: string;
}
