// Matches com.tnsif.orderdetails.entity.OrderDetails

export interface OrderDetails {
  id?: number;
  dateOfPurchase: string;   // LocalDateTime → ISO string "2025-06-15T10:30:00"
  total: number;            // Double
  customerId: number;       // Long (FK ref Customer)
  paymentMode: string;      // UPI | Card | Cash | NetBanking
  shopId: string;           // Shop String
}

export interface OrderStats {
  total: number;
  revenue: number;
  avgOrder: number;
  uniqueCustomers: number;
}

export type PaymentMode = 'UPI' | 'Card' | 'Cash' | 'NetBanking';

export const PAYMENT_MODES: PaymentMode[] = ['UPI', 'Card', 'Cash', 'NetBanking'];
