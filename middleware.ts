import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req: Request) {
  const token = await getToken({ req });
  const url = req.nextUrl;

  // إذا لم يكن المستخدم مسجلاً الدخول
  if (!token && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  // منع الحراس من دخول صفحة الإدارة
  if (url.pathname.startsWith("/dashboard/admin") && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard/guards", req.url));
  }

  return NextResponse.next();
}

// تحديد الصفحات التي يمر عليها الميدل وير
export const config = {
  matcher: ["/dashboard/:path*"],
};
