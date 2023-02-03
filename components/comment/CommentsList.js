import React from 'react'
import { useRouter } from 'next/router'
import { useContext, useState, useEffect } from 'react'
import { supabase } from 'utils/supabase'
import AuthContext from 'context/AuthContext'
import SingleComment from './SingleComment'
import { LoadingIcon } from 'components/Icons'


function CommentsList({ requestFor = "default", id = null, username = null }) {  // requestFor: [ "default", "user" ]
    let { userData, isAuthenticated } = useContext(AuthContext)

    const [comments, setComments] = useState()
    const [isCommentLoading, setIsCommentLoading] = useState()
    const [isLikedCommentsReady, setIsLikedCommentsReady] = useState()


    useEffect(() => {
        getTweetComments()
    }, [])

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
        if (requestFor === "default") {
            let { data, error } = await supabase
                .from("comments")
                .select("*")
                .eq("tweet_id", id)
                .order('id', { ascending: false })
                .range(0, 9)

            data ? updatedCommentData(data) : setIsCommentLoading(false)
        } else if (requestFor === "user") {
            let { data, error } = await supabase
                .from("comments")
                .select("*")
                .eq("username", username)
                .order('id', { ascending: false })
                .range(0, 9)

            console.log(data)

            data ? updatedCommentData(data) : setIsCommentLoading(false)
        }
    }

    // getting like state of comments
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


    if (isLikedCommentsReady) {
        return (
            <div>
                {isLikedCommentsReady ? (
                    <div className='p-2 border-t border-gray-300 mb-44'>
                        {comments ? comments.map((comment, index) => (
                            <SingleComment index={index} comment={comment} />

                        )) : <p className='px-2'>No comments on this tweet!</p>}
                    </div>
                ) :
                    <div className='flex items-center justify-center'>
                        <LoadingIcon className="w-8 h-8 animate-spin" />
                    </div>
                }
            </div>
        )
    } else {
        return (
            <div className='flex justify-center mt-5'>
                <LoadingIcon className="w-8 h-8 animate-spin" />
            </div>
        )
    }
}

export default CommentsList