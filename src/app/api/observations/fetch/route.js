import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const {
      data: { user },
      error: sessionError
    } = await supabase.auth.getUser();

    if (sessionError || !user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const student_id = user.id;

    const { data, error } = await supabase
      .from("observations")
      .select("*")
      .eq("student_id", student_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, observations: data });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
