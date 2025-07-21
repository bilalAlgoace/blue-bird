import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import AuthButtonServer from "@/components/Auth/AuthButtonServer";
import TweetInput from "@/components/Tweets/TweetInput";
import Tweets from "@/components/Tweets/Tweets";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data } = await supabase.from("tweets").select("*, author: profiles(*), likes(*)").order("created_at", { ascending: false });

  const tweets = data?.map((tweet) => (
    {
      ...tweet,
      user_has_liked_tweet: !!tweet.likes.find((like) => like.user_id === session.user.id),
      likes_count: tweet.likes.length,
    }
  )) ?? [];

  return (
    <div className="w-full max-w-xl mx-auto">
      <AuthButtonServer />
      <TweetInput user={session.user} />
      <Tweets tweets={tweets} currentUserId={session.user.id} />
    </div>
  );
}
