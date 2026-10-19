import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "../login/route";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME);

    if (!sessionCookie || sessionCookie.value !== "authenticated_admin") {
      return NextResponse.json({
        authenticated: false,
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        username: "admin",
        role: "Administrator Kurikulum",
        school: "SMP Negeri 1 Ngawi",
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}
