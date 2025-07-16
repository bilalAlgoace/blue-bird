"use client";

import { useState } from "react";
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
          addOptimisticTweet({
            ...tweet,
            likes_count: tweet.likes_count - 1,
            user_has_liked_tweet: !tweet.user_has_liked_tweet,
          });
          await supabase.from("likes").delete().match({ user_id: user.id, tweet_id: tweet.id });
        } else {
          addOptimisticTweet({
            ...tweet,
            likes_count: tweet.likes_count + 1,
            user_has_liked_tweet: !tweet.user_has_liked_tweet,
          });
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
    <button onClick={handleLike} disabled={isLoading} className="cursor-pointer">{tweet.likes_count} Like</button>
  )
}

export default Likes
