"use client";

import { useEffect, useOptimistic, useState } from "react";
import { useRouter } from "next/navigation";
import Likes from "./Likes";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import { deleteTweet, updateTweet } from "../../../actions/actions";

const Tweets = ({ tweets, currentUserId }: { tweets: TweetWithAuthor[], currentUserId: string }) => {
  const [optimisticTweets, addOptimisticTweet] = useOptimistic<TweetWithAuthor[], TweetWithAuthor>(tweets, (currentOptimisticTweets, newTweet: TweetWithAuthor) => {
    const newOptimisticTweets = [...currentOptimisticTweets];
    const index = newOptimisticTweets.findIndex((tweet) => tweet.id === newTweet.id);
    if (index !== -1) {
      newOptimisticTweets[index] = newTweet;
    }
    return newOptimisticTweets;
  });

  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

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

  const handleEdit = (tweet: TweetWithAuthor) => {
    setEditText(tweet.title);
    setShowEditModal(tweet.id);
    setShowMenu(null);
  };

  const handleSaveEdit = async (tweetId: string) => {
    if (editText.trim() === "") return;
    
    setIsUpdating(tweetId);
    try {
      const result = await updateTweet(tweetId, editText);
      console.log("Update result:", result);
      if (result.success) {
        setShowEditModal(null);
        setEditText("");
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error updating tweet:", error);
      alert("Failed to update tweet");
    }
    setIsUpdating(null);
  };

  const handleCancelEdit = () => {
    setShowEditModal(null);
    setEditText("");
  };

  const handleDelete = async (tweetId: string) => {
    setIsDeleting(tweetId);
    try {
      const result = await deleteTweet(tweetId);
      console.log("Delete result:", result);
      if (result.success) {
        setShowDeleteModal(null);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error deleting tweet:", error);
      alert("Failed to delete tweet");
    }
    setIsDeleting(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(null);
  };

  const toggleMenu = (tweetId: string) => {
    setShowMenu(showMenu === tweetId ? null : tweetId);
  };

  const getCurrentTweet = () => {
    if (showEditModal) {
      return optimisticTweets.find(tweet => tweet.id === showEditModal);
    }
    if (showDeleteModal) {
      return optimisticTweets.find(tweet => tweet.id === showDeleteModal);
    }
    return null;
  };

  const currentTweet = getCurrentTweet();

  return (
    <>
      <div>
        {optimisticTweets?.map((tweet) => {
          const date = new Date(tweet.created_at);
          const formatted = date.toISOString().slice(0, 19).replace("T", " ");
          const isOwner = tweet.user_id === currentUserId;
          const isMenuOpen = showMenu === tweet.id;
          
          return (
            <div key={tweet.id} className="flex border border-gray-800 border-t-0 px-4 py-6">
              <div className="h-12 w-12">
                <Image src={tweet.author.avatar_url} alt="user avatar" width={50} height={50} className="rounded-full" />
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-center">
                  <p className="flex items-center font-bold text-xl mb-6">
                    <span className="font-bold text-white">{tweet.author.full_name}</span>
                    <span className="text-sm text-gray-400 ml-2">@{tweet.author.user_name}</span>
                  </p>
                  {isOwner && (
                    <div className="relative">
                      <button 
                        onClick={() => toggleMenu(tweet.id)}
                        className="text-gray-400 hover:text-white text-xl cursor-pointer p-1"
                      >
                        ⋯
                      </button>
                      {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-32 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
                          <button 
                            onClick={() => handleEdit(tweet)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => {
                              setShowDeleteModal(tweet.id);
                              setShowMenu(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <input className="text-lg mb-2 text-white border-0 outline-0" value={tweet.title} readOnly />
                <p className="text-sm text-gray-400">{formatted}</p>
                <Likes tweet={tweet} addOptimisticTweet={addOptimisticTweet} />
              </div>
            </div>
          )
        })}

        {/* Click outside to close menu */}
        {showMenu && (
          <div 
            className="fixed inset-0 z-5" 
            onClick={() => setShowMenu(null)}
          />
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && currentTweet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Edit Tweet</h3>
            <textarea
              className="w-full p-3 text-white bg-gray-700 border border-gray-600 rounded-md outline-none focus:border-blue-500 resize-none"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={4}
              placeholder="What is happening?!"
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-4">
              <button 
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleSaveEdit(currentTweet.id)}
                disabled={isUpdating === currentTweet.id || editText.trim() === ""}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating === currentTweet.id ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && currentTweet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Delete Tweet</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this tweet? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={handleCancelDelete}
                className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(currentTweet.id)}
                disabled={isDeleting === currentTweet.id}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting === currentTweet.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Tweets
