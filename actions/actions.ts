"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { revalidatePath } from "next/cache";
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