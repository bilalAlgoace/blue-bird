import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import Login from "@/components/Auth/Login";

export default async function LoginPage() {
  const supabase = await createServerComponentClient<Database>({ cookies });

  const { data: { session } } = await supabase.auth.getSession();

  if(session) {
    redirect("/");
  }

  return (
    <div>
      <Login />
    </div>
  )
}