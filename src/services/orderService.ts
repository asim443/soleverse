import { requireSupabase } from '../lib/supabase';
import { CreateOrderInput, Order, OrderItem, OrderStatus } from '../types';

function normalizeOrder(row: Record<string, unknown>): Order {
  const items = Array.isArray(row.order_items) ? (row.order_items as OrderItem[]) : [];
  return {
    id: String(row.id),
    user_id: row.user_id ? String(row.user_id) : null,
    customer_name: String(row.customer_name),
    email: String(row.email),
    phone: String(row.phone),
    delivery_address: String(row.delivery_address),
    city: String(row.city),
    order_items: items,
    total_amount: Number(row.total_amount),
    payment_method: 'Cash on Delivery',
    status: (row.status as OrderStatus) ?? 'Pending',
    created_at: String(row.created_at ?? new Date().toISOString()),
  };
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const client = requireSupabase();
  const orderId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const payload = {
    id: orderId,
    user_id: input.user_id,
    customer_name: input.customer_name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    delivery_address: input.delivery_address.trim(),
    city: input.city.trim(),
    order_items: input.order_items,
    total_amount: Number(input.total_amount.toFixed(2)),
    payment_method: input.payment_method,
    status: 'Pending' as OrderStatus,
  };

  // Insert without .select() so guest COD checkout stays compliant with strict SELECT RLS
  // (where guests cannot query the orders table, only authenticated owners & admins can).
  const { error } = await client.from('orders').insert(payload);

  if (error) {
    throw new Error(`Order submission failed: ${error.message}`);
  }

  return {
    ...payload,
    created_at: createdAt,
  };
}

export async function fetchUserOrders(userId: string): Promise<Order[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load your order history: ${error.message}`);
  }

  return (data ?? []).map((row) => normalizeOrder(row as Record<string, unknown>));
}

export async function fetchAdminOrders(): Promise<Order[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load store orders: ${error.message}`);
  }

  return (data ?? []).map((row) => normalizeOrder(row as Record<string, unknown>));
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update order status: ${error.message}`);
  }

  return normalizeOrder(data as Record<string, unknown>);
}
