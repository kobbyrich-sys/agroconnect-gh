import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, phone, company, service_interest, project_details, preferred_date } = body;

  if (!name || !email || !phone || !service_interest || !project_details) {
    return NextResponse.json(
      { error: "Name, email, phone, service interest, and project details are required." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("quotations").insert({
    name,
    email,
    phone,
    company: company || null,
    service_interest,
    project_details,
    preferred_date: preferred_date || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
