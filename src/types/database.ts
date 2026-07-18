export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Profile>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'created_at' | 'updated_at'>
        Update: Partial<Category>
      }
      products: {
        Row: Product
        Insert: Omit<Product, 'created_at' | 'updated_at'>
        Update: Partial<Product>
      }
      product_images: {
        Row: ProductImage
        Insert: Omit<ProductImage, 'created_at'>
        Update: Partial<ProductImage>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'created_at' | 'updated_at'>
        Update: Partial<Order>
      }
      order_items: {
        Row: OrderItem
        Insert: Omit<OrderItem, 'created_at'>
        Update: Partial<OrderItem>
      }
      conversations: {
        Row: Conversation
        Insert: Omit<Conversation, 'created_at' | 'updated_at'>
        Update: Partial<Conversation>
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'created_at'>
        Update: Partial<Message>
      }
      reviews: {
        Row: Review
        Insert: Omit<Review, 'created_at' | 'updated_at'>
        Update: Partial<Review>
      }
      favorites: {
        Row: Favorite
        Insert: Omit<Favorite, 'created_at'>
        Update: Partial<Favorite>
      }
      wallets: {
        Row: Wallet
        Insert: Omit<Wallet, 'created_at' | 'updated_at'>
        Update: Partial<Wallet>
      }
      ledger_entries: {
        Row: LedgerEntry
        Insert: Omit<LedgerEntry, 'created_at'>
        Update: Partial<LedgerEntry>
      }
      withdrawal_requests: {
        Row: WithdrawalRequest
        Insert: Omit<WithdrawalRequest, 'created_at' | 'updated_at'>
        Update: Partial<WithdrawalRequest>
      }
      seller_applications: {
        Row: SellerApplication
        Insert: Omit<SellerApplication, 'created_at' | 'updated_at'>
        Update: Partial<SellerApplication>
      }
    }
    Functions: {
      get_wallet_balance: {
        Args: { wallet_id: string }
        Returns: number
      }
      confirm_payment: {
        Args: { p_order_id: string; p_payment_method: string; p_payment_reference: string; p_platform_fee_rate?: number }
        Returns: Json
      }
      release_payment: {
        Args: { p_order_id: string }
        Returns: Json
      }
      refund_payment: {
        Args: { p_order_id: string }
        Returns: Json
      }
      process_withdrawal: {
        Args: { p_request_id: string; p_new_status: string }
        Returns: Json
      }
    }
  }
}

export type Profile = {
  id: string
  full_name: string
  avatar_url: string | null
  phone: string | null
  role: 'buyer' | 'seller' | 'admin'
  bio: string | null
  payout_method: string | null
  payout_provider: string | null
  payout_account: string | null
  notify_new_order: boolean
  notify_payout: boolean
  location: string | null
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  created_at: string
  updated_at: string
}

export type Product = {
  id: string
  seller_id: string
  category_id: string
  name: string
  slug: string
  description: string
  price: number
  currency: string
  unit: string
  min_order: number
  stock: number
  status: 'active' | 'inactive' | 'draft'
  created_at: string
  updated_at: string
}

export type ProductImage = {
  id: string
  product_id: string
  url: string
  alt: string | null
  sort_order: number
  created_at: string
}

export type Order = {
  id: string
  buyer_id: string
  seller_id: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  total: number
  currency: string
  notes: string | null
  payment_status: 'pending' | 'awaiting_payment' | 'paid' | 'escrow_held' | 'escrow_released' | 'refunded'
  payment_method: string | null
  payment_reference: string | null
  paid_at: string | null
  escrow_held_at: string | null
  escrow_released_at: string | null
  delivered_at: string | null
  platform_fee: number | null
  platform_fee_rate: number | null
  created_at: string
  updated_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total: number
  created_at: string
}

export type Conversation = {
  id: string
  order_id: string | null
  buyer_id: string
  seller_id: string
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read: boolean
  created_at: string
}

export type Review = {
  id: string
  product_id: string
  reviewer_id: string
  rating: number
  content: string | null
  created_at: string
  updated_at: string
}

export type Favorite = {
  id: string
  user_id: string
  product_id: string
  created_at: string
}

export type Wallet = {
  id: string
  user_id: string
  balance: number
  pending_balance: number
  currency: string
  created_at: string
  updated_at: string
}

export type LedgerEntry = {
  id: string
  wallet_id: string
  type: 'payment' | 'escrow_hold' | 'escrow_release' | 'refund' | 'platform_fee' | 'withdrawal' | 'reversal' | 'adjustment' | 'promotional_credit'
  amount: number
  balance_before: number
  balance_after: number
  reference: string | null
  description: string | null
  created_at: string
}

export type WithdrawalRequest = {
  id: string
  wallet_id: string
  amount: number
  method: 'mobile_money' | 'bank_transfer'
  provider: string | null
  account_details: Json
  status: 'pending' | 'approved' | 'processed' | 'rejected'
  processed_at: string | null
  created_at: string
  updated_at: string
}

export type SellerApplication = {
  id: string
  user_id: string
  business_name: string
  business_type: string
  business_address: string
  business_phone: string
  business_email: string
  tax_id: string | null
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by: string | null
  created_at: string
  updated_at: string
}
