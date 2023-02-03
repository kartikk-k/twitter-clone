import React, { useState, useContext, useEffect } from 'react'
import AuthContext from 'context/AuthContext'
import { LikeIcon, RetweetIcon } from 'components/Icons'
import { supabase } from 'utils/supabase'
import { useRouter } from 'next/router'

function SingleComment({ comment }) {

    const { userData, isAuthenticated } = useContext(AuthContext)

    const [isLiked, setIsLiked] = useState()
    const [isLikesCount, setIsLikesCount] = useState()

    let router = useRouter()

    useEffect(() => {
        if (!comment) return
        setIsLiked(comment.isLiked)
        setIsLikesCount(comment.likes_count)
    }, [comment])


    const handleLike = async (commentId, commentIsLiked, likesCount) => {
        if (isAuthenticated) {
            let commentLikeStatus = isLiked != undefined ? isLiked : commentIsLiked

            // like the comment
            if (commentLikeStatus === false) {
                // reflecting change in UI/frontend before getting response from "database"
                setIsLiked(!isLiked)
                setIsLikesCount(likesCount + 1)


                // making record in liked comments table 
                let { data, error } = await supabase
                    .from("liked_comments")
                    .insert([{
                        comment_id: commentId,
                        user_id: userData.user?.id
                    }])

                // updating count if there is no error liking tweet in database
                if (!error) {
                    let { data, error } = await supabase
                        .from("comments")
                        .update({ likes_count: likesCount + 1 })
                        .eq("id", commentId)

                    return
                } else {
                    // updating UI if there is error in updating tweet
                    setIsLiked(!isLiked)
                    setIsLikesCount(likesCount - 1)
                }

            }


            // unlike the comment
            if (commentLikeStatus === true) {
                console.log("unlike in action...")
                setIsLiked(!isLiked)
                setIsLikesCount(isLikesCount - 1)

                // return

                let { data, error } = await supabase
                    .from("liked_comments")
                    .delete()
                    .match({ user_id: userData.user?.id, comment_id: commentId })

                // decresing like count from tweets table in database
                if (!error) {
                    let unlikeFrom = isLikesCount ? isLikesCount : likesCount
                    let { data, error } = await supabase
                        .from("comments")
                        .update({ likes_count: unlikeFrom - 1 })
                        .eq("id", commentId)

                    return
                } else {
                    // updating UI if there is error in updating tweet
                    setIsLiked(!isLiked)
                    setIsLikesCount(likesCount + 1)
                }
            }
        }
    }

    return (
        <div className='flex py-2 space-x-2 border-b border-gray-300'>
            <img className='w-10 h-10 rounded-full' src={comment.profile_img} alt="" />
            <div>
                <div>
                    <p>{comment.name}</p>
                    <p className='text-sm text-gray-500'>{comment.username}</p>
                </div>
                <p onClick={() => router.push(`/tweet/${comment.tweet_id}`)} className="cursor-pointer" >{comment.comment}</p>
                {/* stats */}
                <div className='flex space-x-6'>
                    <div onClick={() => handleLike(comment.id, comment.isLiked, comment.likes_count)} className='flex space-x-2 cursor-pointer'>
                        <LikeIcon
                            className={isLiked === true ? 'fill-red-600 stroke-red-600 w-6 h-6' : "w-6 h-6 opacity-70 hover:opacity-100 hover:stroke-red-600"}
                        />
                        <p>{isLikesCount ? isLikesCount : comment.likes_count}</p>
                    </div>
                    <div className='flex space-x-2'>
                        <RetweetIcon />
                        <p>{comment.retweet_count ? comment.retweet_count : 0}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SingleComment