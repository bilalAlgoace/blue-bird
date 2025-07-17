"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";


const Likes = ({ tweet, addOptimisticTweet }: { tweet: TweetWithAuthor, addOptimisticTweet: (tweet: TweetWithAuthor) => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLike = async () => {
    setIsLoading(true);
    try {
      const supabase = createClientComponentClient<Database>();

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        if (tweet.user_has_liked_tweet) {
          startTransition(() => {
            addOptimisticTweet({
              ...tweet,
              likes_count: tweet.likes_count - 1,
              user_has_liked_tweet: !tweet.user_has_liked_tweet,
            });
          })
          await supabase.from("likes").delete().match({ user_id: user.id, tweet_id: tweet.id });
        } else {
          startTransition(() => {
            addOptimisticTweet({
              ...tweet,
              likes_count: tweet.likes_count + 1,
              user_has_liked_tweet: !tweet.user_has_liked_tweet,
            });
          })
          await supabase.from("likes").insert({
            tweet_id: tweet.id,
            user_id: user.id,
          });
        }
        router.refresh();
      }
    } catch (error) {
      console.error("LIKES: ", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button onClick={handleLike} disabled={isLoading} className="flex items-center cursor-pointer group">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`group-hover:fill-red-600 group-hover:stroke-red-600 ${tweet.user_has_liked_tweet ? "fill-red-600 stroke-red-600" : "fill-none stroke-gray-500"}`}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
      <span className={`ml-2 text-base group-hover:text-red-600 ${tweet.user_has_liked_tweet ? "text-red-600" : "text-gray-500"}`}>{tweet.likes_count}</span>
    </button>
  )
}

export default Likes
