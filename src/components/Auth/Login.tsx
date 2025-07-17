"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const Login = () => {
  const supabase = createClientComponentClient<Database>();

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${location.origin}/api/auth/callback`,
      },
    });
  }

  return (
    <div className="flex flex-col justify-center items-center gap-4 h-screen">
      <h1 className="text-4xl font-bold text-amber-500">Blue Bird</h1>
      <button onClick={handleSignIn} className="bg-amber-500 text-white py-2 px-4 rounded-md cursor-pointer">Login</button>
    </div>
  )
}

export default Login
