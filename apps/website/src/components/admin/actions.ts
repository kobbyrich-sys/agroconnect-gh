"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateInquiryStatus(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("inquiries").update({ status }).eq("id", id);
  revalidatePath("/admin/inquiries");
}

export async function updateQuotationStatus(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("quotations").update({ status }).eq("id", id);
  revalidatePath("/admin/quotations");
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  await supabase.from("projects").delete().eq("id", id);
  revalidatePath("/admin/projects");
}

export async function deleteTestimonial(id: string) {
  const supabase = await createClient();
  await supabase.from("testimonials").delete().eq("id", id);
  revalidatePath("/admin/testimonials");
}

export async function deleteService(id: string) {
  const supabase = await createClient();
  await supabase.from("services").delete().eq("id", id);
  revalidatePath("/admin/services");
}

export async function updateInvoiceStatus(id: string, status: string) {
  const supabase = await createClient();
  const update: Record<string, any> = { status };
  if (status === "paid") update.paid_at = new Date().toISOString();
  await supabase.from("invoices").update(update).eq("id", id);
  revalidatePath("/admin/invoices");
}

export async function deleteInvoice(id: string) {
  const supabase = await createClient();
  await supabase.from("invoices").delete().eq("id", id);
  revalidatePath("/admin/invoices");
}
