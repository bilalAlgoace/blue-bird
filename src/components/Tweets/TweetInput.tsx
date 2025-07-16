"use client";

import { useActionState } from "react";
import { addTweet } from "../../../actions/actions"

const TweetInput = () => {
  const [state, formAction] = useActionState(addTweet, null); // Initialize state with null
  return (
    <div>
      <form action={formAction} className='flex flex-col gap-y-2 mb-4 w-full border-b border-solid border-gray-300 pb-4'>
        <input
          type="text"
          name="title"
          placeholder="Task Title"
          className="w-full mb-2 p-2 border border-solid border-gray-300 rounded-md"
        />
        {state?.error && <p style={{ color: 'red' }}>{state.error}</p>}
        <button type="submit" className="d-block py-2 px-4 bg-amber-600 text-white border-none rounded-md cursor-pointer">Add Task</button>
      </form>
    </div>
  )
}

export default TweetInput
