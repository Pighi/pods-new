import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Read request data
    const { plant_id, flower_color, flower_size, petals_count, notes, photo_base64 } = await req.json();

    // Get current logged-in user
    const {
      data: { user },
      error: sessionError
    } = await supabase.auth.getUser();

    if (sessionError || !user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const student_id = user.id;

    // Upload photo to Supabase Storage
    let photo_url = null;
    if (photo_base64) {
      const fileName = `${Date.now()}_photo.png`;
      const { data, error: uploadError } = await supabase.storage
        .from("observations")
        .upload(fileName, Buffer.from(photo_base64, "base64"), {
          contentType: "image/png",
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { publicUrl } = supabase.storage.from("observations").getPublicUrl(fileName);
      photo_url = publicUrl;
    }

    // Insert observation into database
    const { data, error } = await supabase.from("observations").insert([
      {
        plant_id,
        student_id,
        flower_color,
        flower_size,
        petals_count,
        notes,
        photo_url
      }
    ]);

    if (error) throw error;

    return NextResponse.json({ success: true, observation: data[0] });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
