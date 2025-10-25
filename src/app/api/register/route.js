import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { email, password, name, role } = await req.json();

    // Supabase Auth signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role } // store name & role in user_metadata
      }
    });

    if (error) throw error;

    return NextResponse.json({ success: true, user: data.user });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
