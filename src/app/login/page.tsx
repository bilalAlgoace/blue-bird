import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import Login from "@/components/Auth/Login";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const { data: { session } } = await supabase.auth.getSession();

  if(session) {
    redirect("/");
  }

  return (
    <div className="h-full w-full">
      <Login />
    </div>
  )
}