import React, { useEffect, useState } from 'react'
import { BackIcon, CommentIcon, LikeIcon, RetweetIcon } from './Icons'
import { useContext } from 'react'
import AuthContext from 'context/AuthContext'
import { useRouter } from 'next/router'
import { supabase } from 'utils/supabase'
import { ImageIcon, LocationIcon, CalenderIcon } from './Icons'
import { LikesCount } from './LikesCount'
import Popup from './Popup'
import TweetsList from './tweet/TweetsList'

function TweetDetailed({ id }) {
    let { userData, isAuthenticated } = useContext(AuthContext)
    let router = useRouter()

    const [comments, setComments] = useState()
    const [isCommentLoading, setIsCommentLoading] = useState()
    const [isLikedCommentsReady, setIsLikedCommentsReady] = useState()

    // for maintaining likescount
    const [isLiked, setIsLiked] = useState([])
    const [isLikesCount, setIsLikesCount] = useState([])

    useEffect(() => {
        if (!router.isReady) return

        getTweetComments()
    }, [router.isReady])

    useEffect(() => {
        if (!comments || isCommentLoading) return
        if (!isAuthenticated || !userData.user) return setIsLikedCommentsReady(true)

        getLikedCommentsList()
    }, [isCommentLoading, userData])



    // handle like on comments
    const handleLike = async (commentId, commentIsLiked, likesCount) => {
        if (isAuthenticated) {
            let commentLikeStatus = isLiked[commentId] != undefined ? isLiked[commentId] : commentIsLiked

            // like the comment
            if (commentLikeStatus === false) {
                // reflecting change in UI/frontend before getting response from "database"
                setIsLiked({ ...isLiked, [commentId]: !isLiked[commentId] })
                setIsLikesCount({ ...isLikesCount, [commentId]: likesCount + 1 })

                // return
                try {
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
                    }

                } catch (error) {
                    // updating UI if there is error in updating tweet
                    setIsLiked({ ...isLiked, [commentId]: !isLiked[commentId] })
                    setIsLikesCount({ ...isLikesCount, [commentId]: isLikesCount[commentId] - 1 })
                    console.log(error)
                }

            }


            // unlike the comment
            if (commentLikeStatus === true) {
                console.log("unlike in action...")
                setIsLiked({ ...isLiked, [commentId]: !isLiked[commentId] })
                setIsLikesCount({ ...isLikesCount, [commentId]: isLikesCount[commentId] - 1 })

                // return

                let { data, error } = await supabase
                    .from("liked_comments")
                    .delete()
                    .match({ user_id: userData.user?.id, comment_id: commentId })

                // decresing like count from tweets table in database
                if (!error) {
                    let unlikeFrom = isLikesCount[commentId] ? isLikesCount[commentId] : likesCount
                    let { data, error } = await supabase
                        .from("comments")
                        .update({ likes_count: unlikeFrom - 1 })
                        .eq("id", commentId)

                    return
                }
            }
        }
    }

    // getting tweet's comment
    const getTweetComments = async () => {
        // setIsCommentLoading(true)

        // adding isLiked attribute to all comments
        const updatedCommentData = (data) => {
            let newData = data.map(commentData => {
                return { ...commentData, isLiked: false }
            })
            setComments(newData)
            setIsCommentLoading(false)
        }

        // getting comments from database
        let { data, error } = await supabase
            .from("comments")
            .select("*")
            .eq("tweet_id", id)
            .order('id', { ascending: false })
            .range(0, 9)

        data ? updatedCommentData(data) : setIsCommentLoading(false)
    }

    const getLikedCommentsList = async () => {
        console.log("getting liked comment list")
        let comments_list = []

        comments.map(comment => {
            return comments_list = comments_list.concat(comment.id)
        })

        comments_list = comments_list.toString()

        // finally setting state of comment is liked or not
        const processLikedComments = (data) => {
            let likedList = []

            // creating an array of liked comment's id
            data.map(liked_comment => {
                likedList = likedList.concat(liked_comment.comment_id)
            })

            let updatedComments = comments.map(comment => {
                comment.isLiked = likedList.some(comment_id => comment_id === comment.id)
                return comment
            })

            // updating values of comments
            setComments(updatedComments)
        }

        // fetching list of liked comments form database
        let { data, error } = await supabase
            .from("liked_comments")
            .select("*")
            .filter("comment_id", "in", `(${comments_list})`)
            .eq("user_id", userData.user.id)

        if (data) processLikedComments(data)

        setIsLikedCommentsReady(true)
    }

    if (!router.isReady) {
        return (
            <p>Loading...</p>
        )
    } else {
        return (
            <div className='h-screen col-span-8 overflow-auto md:col-span-7 lg:col-span-5'>
                <div className='mb-14'>
                    {/* header */}
                    <div onClick={() => router.back()} className='sticky top-0 z-40 flex items-center p-4 space-x-2 bg-white border-b cursor-pointer border-b-gray-300 bg-opacity-30 backdrop-blur-md'>
                        <BackIcon />
                        <p>Back</p>
                    </div>

                    <TweetsList requestFor="single" requestTweetId={id} />

                    {/* comments list */}
                    <h1 className='p-2 text-lg font-bold'>Comments</h1>
                    {isLikedCommentsReady && (
                        <div className='p-2 border-t border-gray-300 mb-44'>
                            {/* single comment */}
                            {comments ? comments.map((comment, index) => (
                                <div key={index} className='flex py-2 space-x-2 border-b border-gray-300'>
                                    <img className='w-10 h-10 rounded-full' src={comment.profile_img} alt="" />
                                    <div>
                                        <div>
                                            <p>{comment.name}</p>
                                            <p className='text-sm text-gray-500'>{comment.username}</p>
                                        </div>
                                        <p>{comment.comment}</p>
                                        {/* stats */}
                                        <div className='flex space-x-6'>
                                            <div onClick={() => handleLike(comment.id, comment.isLiked, comment.likes_count)} className='flex space-x-2 cursor-pointer'>
                                                <LikeIcon
                                                    className={comment.isLiked === true || isLiked[comment.id] === true ? 'fill-red-600 stroke-red-600 w-6 h-6' : "w-6 h-6 opacity-70 hover:opacity-100 hover:stroke-red-600"}
                                                />
                                                <p>{isLikesCount[comment.id] ? isLikesCount[comment.id] : comment.likes_count}</p>
                                            </div>
                                            <div className='flex space-x-2'>
                                                <RetweetIcon />
                                                <p>{comment.retweet_count ? comment.retweet_count : 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : <p className='px-2'>No comments on this tweet!</p>}
                        </div>
                    )}

                </div>
            </div>
        )
    }
}

export default TweetDetailed