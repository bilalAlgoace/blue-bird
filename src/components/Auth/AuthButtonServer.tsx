import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import AuthButton from "./AuthButton"

export const dynamic = "force-dynamic";

export default async function AuthButtonServer() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const { data: { session } } = await supabase.auth.getSession();
  return (
    <AuthButton session={session} />
  )
}
