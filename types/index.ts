export type ProductStatus = 'wait' | 'active' | 'closed';

interface IAuction {
    status: ProductStatus;
    datetime: string;
    price: number;
    minPrice: number;
    history?: number[];
}


export interface IProductItem {
    id: string;
    title: string;
    about: string;
    description?: string;
    image: string;
}

export type IProduct = IProductItem & IAuction;
export type ProductUpdate = Pick<IProduct, 'id' | 'status' | 'price' | 'history'>;

export type IBasketItem = Pick<IProduct, 'id' | 'title' | 'price'> & {
    isMyBid: boolean
};

export interface IAppState {
  catalog: IProductItem[];
  preview: string;
  basket: string[];
  order: IOrder;
  total: string | number;
  loading: boolean;
}

export interface IProductsList {
  products: IProductItem[];
}

export interface IOrderForm {
  payment?: string;
  address?: string;
  phone?: string;
  email?: string;
  total?: string | number;
}

export interface IOrder extends IOrderForm {
  items: string[];
  payment: string;
  email: string;
  phone: string;
  address: string;
}


export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IOrderResult {
  id: string;
}
