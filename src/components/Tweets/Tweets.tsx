"use client";

import { useEffect, useOptimistic } from "react";
import { useRouter } from "next/navigation";
import Likes from "./Likes";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const Tweets = ({ tweets }: { tweets: TweetWithAuthor[] }) => {
 const [optimisticTweets, addOptimisticTweet] = useOptimistic<TweetWithAuthor[], TweetWithAuthor>(tweets, (currentOptimisticTweets, newTweet: TweetWithAuthor) => {
  const newOptimisticTweets = [...currentOptimisticTweets];
  const index = newOptimisticTweets.findIndex((tweet) => tweet.id === newTweet.id);
  if (index !== -1) {
    newOptimisticTweets[index] = newTweet;
  }
  return newOptimisticTweets;
 });
 
 const supabase = createClientComponentClient<Database>();
 const router = useRouter();

 useEffect(() => {
  const channel = supabase.channel('realtime tweets').on("postgres_changes", {
    event: "*",
    schema: "public",
    table: "tweets",
  }, (payload) => {
    console.log("payload", payload);
    router.refresh();
    //window.location.reload();
  }).subscribe();

  return () => {
    supabase.removeChannel(channel);
  }
 }, [supabase, router]);
  
  return (
    <div className="w-full">
      {optimisticTweets?.map((tweet) => {
        const date = new Date(tweet.created_at);
        const formatted = date.toISOString().slice(0, 19).replace("T", " ");
        return (
          <div key={tweet.id} className="space-y-2 border-b border-solid border-gray-300 py-4">
            <p className="flex flex-col font-bold text-xl">{tweet.author.full_name}
              <span className="text-sm text-gray-400">@{tweet.author.user_name}</span>
            </p>
            <p className="text-lg">{tweet.title}</p>
            <p className="text-sm text-gray-400">{formatted}</p>
            <Likes tweet={tweet} addOptimisticTweet={addOptimisticTweet} />
          </div>
        )
      })}
    </div>
  )
}

export default Tweets
