import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// Fitur proteksi API: gunakan di setiap route API yang membutuhkan login.
export async function requireUser() {
  const user = await getSession();
  if (!user)
    return {
      user: null,
      response: NextResponse.json(
        { message: "Silakan login." },
        { status: 401 },
      ),
    };
  return { user, response: null };
}
export function errorResponse(error: unknown) {
  console.error(error);
  return NextResponse.json(
    { message: error instanceof Error ? error.message : "Terjadi kesalahan." },
    { status: 400 },
  );
}
