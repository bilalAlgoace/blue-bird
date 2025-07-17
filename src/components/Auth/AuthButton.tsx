"use client";

import { Session, createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

const AuthButton = ({ session } : { session: Session | null }) => {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();


  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: "http://localhost:3000/api/auth/callback",
      },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <div className="flex justify-between items-center border px-4 py-8 border-gray-800 border-t-0">
      <h1 className="text-2xl font-bold text-blue-600">Blue Bird</h1>
      {session ? (
        <button onClick={handleSignOut} className="bg-red-700 text-white py-2 px-4 rounded-md cursor-pointer">Logout</button>
      ) : (
        <button onClick={handleSignIn} className="bg-amber-500 text-white py-2 px-4 rounded-md cursor-pointer">Login</button>
      )}
    </div>
  )
}

export default AuthButton
