export type ProductCategory =
  | 'Running'
  | 'Lifestyle'
  | 'Basketball'
  | 'Training'
  | 'Streetwear'
  | 'Casual'
  | 'Premium'
  | 'Limited Edition';

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  description: string;
  price: number;
  sale_price: number | null;
  image_url: string;
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  stock: number;
  badge: string | null;
  rating: number;
  created_at: string;
}

export interface ProductInput {
  name: string;
  brand: string;
  category: ProductCategory;
  description: string;
  price: number;
  sale_price: number | null;
  image_url: string;
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  stock: number;
  badge: string | null;
  rating: number;
}

export interface CartItem {
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

export interface OrderItem {
  product_id: string;
  name: string;
  brand: string;
  image_url: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  user_id: string | null;
  customer_name: string;
  email: string;
  phone: string;
  delivery_address: string;
  city: string;
  order_items: OrderItem[];
  total_amount: number;
  payment_method: 'Cash on Delivery';
  status: OrderStatus;
  created_at: string;
}

export interface CreateOrderInput {
  user_id: string | null;
  customer_name: string;
  email: string;
  phone: string;
  delivery_address: string;
  city: string;
  order_items: OrderItem[];
  total_amount: number;
  payment_method: 'Cash on Delivery';
}

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'popularity';

export interface FilterState {
  search: string;
  category: string;
  brand: string;
  size: string;
  color: string;
  maxPrice: number;
  onlySale: boolean;
  onlyNew: boolean;
  sort: SortOption;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}
