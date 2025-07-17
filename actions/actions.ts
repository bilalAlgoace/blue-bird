"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const addTweet = async (prevState: any, formData: FormData) => {
  const title = String(formData.get("title"));
  if(title === "" || title === null || title === undefined) {
    return { error: "Tweet cannot be empty" };
  }

  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  
  if(user) {
    await supabase.from("tweets").insert({ title, user_id: user?.id })
    formData.set("title", "");
  }

  // revalidatePath("/");
  return { success: "Tweet added successfully" };
}


export const fetchTweets = async () => {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: tweets } = await supabase.from("tweets").select("*, profiles(*)");
  return tweets;
}

export const deleteTweet = async (tweetId: string) => {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "User not authenticated" };
  }

  // Check if the tweet belongs to the current user
  const { data: tweet } = await supabase
    .from("tweets")
    .select("user_id")
    .eq("id", tweetId)
    .single();

  if (!tweet || tweet.user_id !== user.id) {
    return { error: "Unauthorized to delete this tweet" };
  }

  await supabase.from("tweets").delete().eq("id", tweetId);
  return { success: "Tweet deleted successfully" };
}

export const updateTweet = async (tweetId: string, title: string) => {
  console.log("SAVING UPDATE")
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "User not authenticated" };
  }

  if (!title || title.trim() === "") {
    return { error: "Tweet cannot be empty" };
  }

  // Check if the tweet belongs to the current user
  const { data: tweet } = await supabase
    .from("tweets")
    .select("user_id")
    .eq("id", tweetId)
    .single();

  if (!tweet || tweet.user_id !== user.id) {
    return { error: "Unauthorized to edit this tweet" };
  }

  await supabase
    .from("tweets")
    .update({ title: title.trim() })
    .eq("id", tweetId);

  return { success: "Tweet updated successfully" };
}