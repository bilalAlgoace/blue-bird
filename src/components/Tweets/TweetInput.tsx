"use client";

import { useActionState } from "react";
import Image from "next/image";
import { addTweet } from "../../../actions/actions"
import { User } from "@supabase/supabase-js";

const TweetInput = ({ user }: { user: User }) => {
  const [state, formAction] = useActionState(addTweet, null); // Initialize state with null
  return (
    <form action={formAction} className='h-36 border border-gray-800 border-t-0'>
      <div className="h-full flex items-center px-4 py-8">
        <div className="h-12 w-12">
          <Image src={user.user_metadata.avatar_url} alt="user avatarr" width={50} height={50} className="rounded-full" />
        </div>
        <input
          type="text"
          name="title"
          placeholder="What is happening?!"
          className="w-full px-2 bg-inherit flex-1 ml-2 text-2xl leading-loose placeholder-gray-500 border-none border-0 outline-0 focus:outline-none"
        />
        {state?.error && <p style={{ color: 'red' }}>{state.error}</p>}
        <button type="submit" className="d-block self-end py-1 px-2 bg-amber-600 text-white border-none rounded-md cursor-pointer">Tweet</button>
      </div>
    </form>
  )
}

export default TweetInput
