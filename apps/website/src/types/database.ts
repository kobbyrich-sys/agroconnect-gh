export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  company: string | null;
  role: "admin" | "editor" | "customer";
  created_at: string;
  updated_at: string;
};

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  status: "new" | "read" | "replied" | "closed";
  created_at: string;
};

export type Quotation = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  service_interest: string;
  project_details: string;
  preferred_date: string | null;
  status: "pending" | "reviewed" | "approved" | "rejected";
  created_at: string;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  images: string[];
  client: string | null;
  completed_date: string | null;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Testimonial = {
  id: string;
  client_name: string;
  client_title: string | null;
  company: string | null;
  content: string;
  rating: number | null;
  featured: boolean;
  published: boolean;
  created_at: string;
};

export type Service = {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  icon: string | null;
  features: string[];
  order_index: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type InvoiceItem = {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
};

export type Invoice = {
  id: string;
  customer_id: string;
  number: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issued_date: string;
  due_date: string;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  invoice_id: string;
  amount: number;
  method: "cash" | "mobile_money" | "bank_transfer" | "card" | "other";
  reference: string | null;
  status: "pending" | "completed" | "failed" | "refunded";
  paid_at: string;
  notes: string | null;
  created_at: string;
};
