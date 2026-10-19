import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Kredensial default admin sekolah
// Dapat dikustomisasi via environment variable jika diperlukan
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
export const AUTH_COOKIE_NAME = "limartime_admin_session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    if (username.trim() !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: "Username atau kata sandi tidak valid. Silakan coba lagi." },
        { status: 401 }
      );
    }

    // Set cookie session
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, "authenticated_admin", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    return NextResponse.json({
      success: true,
      message: "Login berhasil. Selamat datang di Panel Admin LimarTime.",
      user: {
        username: ADMIN_USERNAME,
        role: "Administrator Kurikulum",
        school: "SMP Negeri 1 Ngawi",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
    return NextResponse.json({
      success: true,
      message: "Logout berhasil.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal melakukan logout." },
      { status: 500 }
    );
  }
}
