/**
 * Shared type definitions for Polar products and purchases
 */

/**
 * Product from Polar.sh
 */
export interface Product {
  id: string;
  name: string;
  description: string | null;
  isRecurring: boolean;
  /** @deprecated Use isRecurring instead - kept for backward compatibility */
  is_recurring?: boolean;
  recurringInterval?: string | null;
  prices: ProductPrice[];
}

/**
 * Price configuration for a product
 */
export interface ProductPrice {
  priceAmount?: number;
  recurringInterval?: string | null;
}

/**
 * A user's purchase (subscription or one-time order)
 */
export interface Purchase {
  id?: string;
  status: string;
  productId: string;
  product: Product | null;
}

/**
 * Purchase with a guaranteed product (after filtering nulls)
 */
export type PurchaseWithProduct = Purchase & { product: Product };
