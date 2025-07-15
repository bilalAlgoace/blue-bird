import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse, type NextRequest } from "next/server";


export async function middleware(request: NextRequest) {
  const res = NextResponse.next();

  const supabase = createMiddlewareClient<Database>({ req: request, res });

  await supabase.auth.getSession();

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};