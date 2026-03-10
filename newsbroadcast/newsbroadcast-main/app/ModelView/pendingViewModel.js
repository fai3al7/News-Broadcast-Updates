// PostViewModel.js
import { useState, useEffect } from "react";
import {
  fetchUnapprovedPosts,
  approvePost,
  rejectPost,
} from "../Model/postModel.js";
import { getAuth } from "firebase/auth";

export const usePostsViewModel = () => {
 
  const adminUid = getAuth().currentUser?.uid; // Get the admin's UID

  useEffect(() => {
    const fetchPosts = async () => {
      const unsubscribe = fetchUnapprovedPosts();

      // Cleanup when the component unmounts
      return () => unsubscribe();
    };
    fetchPosts();
  }, []);

  const approve = async (postId, postData,setPosts) => {
    await approvePost(adminUid, postId, postData);
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  };

  const reject = async (postId, postData,setPosts) => {
    await rejectPost(adminUid, postId, postData);
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  };

  return {
  
    approve,
    reject,
  };
};
