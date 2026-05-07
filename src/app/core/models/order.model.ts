export type PricingType = 'Warranty' | 'Branch' | 'Workshop';

export type OrderStatus =
  | 'Created'
  | 'SentToWorkshop'
  | 'InProgress'
  | 'Completed'
  | 'ReceivedFromWorkshop'
  | 'SentToExternal'
  | 'ReceivedFromExternal'
  | 'DeliveredToCustomer'
  | 'Cancelled';

export type AppRole = 'Admin' | 'Branch' | 'Workshop';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
}

export interface Branch {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  isActive: boolean;
}

export interface Workshop {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  isActive: boolean;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  statusName: string;
  note?: string | null;
  actorUserName?: string | null;
  actorRole?: string | null;
  occurredAt: string;
}

export interface RepairOrder {
  id: string;
  code: string;
  customer: Customer;
  branch: Branch;
  workshop?: Workshop | null;
  receivingEmployeeName: string;
  workshopCourierName?: string | null;
  weightBefore: number;
  weightAfter?: number | null;
  imageBeforeUrl?: string | null;
  imageAfterUrl?: string | null;
  pricingType: PricingType;
  price?: number | null;
  receivedAt: string;
  deliveryToWorkshopDate?: string | null;
  completedAt?: string | null;
  deliveredToCustomerAt?: string | null;
  status: OrderStatus;
  statusName: string;
  isExternal: boolean;
  externalProviderName?: string | null;
  notes?: string | null;
  createdAt: string;
  statusHistory: OrderStatusHistoryItem[];
}

export interface OrderStats {
  total: number;
  created: number;
  inProgress: number;
  completed: number;
  delivered: number;
  external: number;
}

export interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  branchId: string;
  receivingEmployeeName: string;
  workshopId?: string | null;
  newWorkshopName?: string;
  workshopCourierName?: string;
  weightBefore: number;
  imageBeforeUrl?: string;
  pricingType: PricingType;
  price?: number;
  deliveryToWorkshopDate?: string;
  notes?: string;
}

export interface WorkshopUpdatePayload {
  status: 'InProgress' | 'Completed';
  price?: number;
  weightAfter?: number;
  imageAfterUrl?: string;
  note?: string;
}

export interface ReceiveFromWorkshopPayload {
  weightAfter?: number;
  imageAfterUrl?: string;
  note?: string;
}

export interface MoveToExternalPayload {
  externalProviderName: string;
  note?: string;
}

export interface ReceiveFromExternalPayload {
  weightAfter?: number;
  imageAfterUrl?: string;
  price?: number;
  note?: string;
}
