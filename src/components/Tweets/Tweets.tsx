"use client";

import { useEffect, useOptimistic } from "react";
import { useRouter } from "next/navigation";
import Likes from "./Likes";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";

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
    const tweetsChannel = supabase.channel('realtime tweets').on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "tweets",
    }, (payload) => {
      console.log("payload", payload);
      router.refresh();
      //window.location.reload();
    }).subscribe();
    const likesChannel = supabase.channel('realtime likes').on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "likes",
    }, (payload) => {
      console.log("payload", payload);
      router.refresh();
      //window.location.reload();
    }).subscribe();

    return () => {
      supabase.removeChannel(tweetsChannel);
      supabase.removeChannel(likesChannel);
    }
  }, [supabase, router]);

  return (
    <div >
      {optimisticTweets?.map((tweet) => {
        const date = new Date(tweet.created_at);
        const formatted = date.toISOString().slice(0, 19).replace("T", " ");
        return (
          <div key={tweet.id} className="flex border border-gray-800 border-t-0 px-4 py-6">
            <div className="h-12 w-12">
              <Image src={tweet.author.avatar_url} alt="user avatar" width={50} height={50} className="rounded-full" />
            </div>
            <div className="ml-4">
              <p className="flex items-center font-bold text-xl mb-6">
                <span className="font-bold text-white">{tweet.author.full_name}</span>
                <span className="text-sm text-gray-400 ml-2">@{tweet.author.user_name}</span>
              </p>
              <p className="text-lg mb-2 text-white">{tweet.title}</p>
              <p className="text-sm text-gray-400">{formatted}</p>
              <Likes tweet={tweet} addOptimisticTweet={addOptimisticTweet} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Tweets
