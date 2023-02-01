import React, { useEffect, useState } from 'react'
import { BackIcon, CommentIcon, LikeIcon, RetweetIcon, LocationIcon, CalenderIcon, ImageIcon } from './Icons'
import { useContext } from 'react'
import AuthContext from 'context/AuthContext'
import { useRouter } from 'next/router'
import { supabase } from 'utils/supabase'
import TweetsList from './tweet/TweetsList'
import SingleComment from './comment/SingleComment'
import NewComment from './comment/NewComment'

function TweetDetailed({ id }) {
    let { userData, isAuthenticated } = useContext(AuthContext)
    let router = useRouter()

    const [comments, setComments] = useState()
    const [isCommentLoading, setIsCommentLoading] = useState()
    const [isLikedCommentsReady, setIsLikedCommentsReady] = useState()


    useEffect(() => {
        if (!router.isReady) return

        getTweetComments()
    }, [router.isReady])

    useEffect(() => {
        if (!comments || isCommentLoading) return
        if (!isAuthenticated || !userData.user) return setIsLikedCommentsReady(true)

        getLikedCommentsList()
    }, [isCommentLoading, userData])


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
                                <SingleComment index={index} comment={comment} />

                            )) : <p className='px-2'>No comments on this tweet!</p>}
                        </div>
                    )}

                </div>
            </div>
        )
    }
}

export default TweetDetailed