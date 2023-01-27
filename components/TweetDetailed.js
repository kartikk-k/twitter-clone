import React, { useEffect, useState } from 'react'
import { BackIcon, CommentIcon, LikeIcon, RetweetIcon } from './Icons'
import { useContext } from 'react'
import AuthContext from 'context/AuthContext'
import { useRouter } from 'next/router'
import { supabase } from 'utils/supabase'
import { ImageIcon, LocationIcon, CalenderIcon } from './Icons'
import { LikesCount } from './LikesCount'
import Popup from './Popup'

function TweetDetailed({ id }) {
    let { userData, isAuthenticated } = useContext(AuthContext)
    let router = useRouter()

    const [tweetData, setTweetData] = useState()
    const [comments, setComments] = useState()
    const [input, setInput] = useState('')

    const [isLoading, setIsLoading] = useState(true)
    const [date, setDate] = useState()
    const [time, setTime] = useState()

    // for maintaining likescount
    const [isLiked, setIsLiked] = useState([])
    const [isLikesCount, setIsLikesCount] = useState([])

    useEffect(() => {
        if (router.isReady) {
            getTweetContent()
        }
    }, [router.isReady])



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

    // getting expanded tweet data
    const getTweetContent = async () => {
        setIsLoading(true)
        let { data, error } = await supabase
            .from("tweets")
            .select("*")
            .eq("id", id)
            .single()

        // processiong response data
        console.log("tweets data: ", data)

        if (isAuthenticated) {
            if (data) {
                let response = await supabase.from("liked_tweets").select("*").match({ "user_id": userData.user.id, tweet_id: data.id }).single()
                console.log("main tweet response: ", response)

                if (response.data) {
                    data.isLiked = true
                } else {
                    data.isLiked = false
                }
            }
        }

        data ? setTweetData(data) : console.log("error fetching tweet: ", error)
        uploadData(data?.created_at)
        getTweetComments()
    }

    // getting expanded tweet comments
    const getTweetComments = async () => {
        let { data, error } = await supabase
            .from("comments")
            .select("*")
            .eq("tweet_id", id)
            .range(0, 9)

        if (data.length != 0) {
            // adding isLiked in all the objects/ comments
            let newData = data.map(tweetData => {
                return { ...tweetData, isLiked: false }
            })
            setComments(newData)

            // checking if the comment is liked or not if authenticated
            if (isAuthenticated) {
                if (userData.user && comments) {
                    getLikedCommentsList()
                }
            } else {
                setIsLoading(false)
            }
        } else {
            setIsLoading(false)
        }

        // data ? setComments(data) : console.log("error fetching comments: ", error)
        setIsLoading(false)

    }
    const getLikedCommentsList = async () => {
        let { data, error } = await supabase.from("liked_comments").select("comment_id").match({ user_id: userData.user?.id })

        // processing data
        console.log("liked tweets", data)
        let likedList = []

        // mapping through liked tweets list to get all the ids of comments that were liked by the user
        data?.map((obj) => {
            likedList = likedList.concat(obj.comment_id)
            console.log("liked list: ", likedList)
        })

        if (comments) {
            let updatedComments = comments.map(comment => {
                comment.isLiked = likedList.some(comment_id => comment_id === comment.id)
                console.log(comment.isLiked)
                return comment
            })
            setComments(updatedComments)
        }

        setIsLoading(false)
    }


    // posting new comment on expanded tweet
    const postComment = async (commentCount, tweetId) => {
        let response = await supabase.from("comments").insert({
            tweet_id: id,
            username: userData.user?.identities[0].identity_data.user_name,
            name: userData.user?.identities[0].identity_data.name,
            profile_img: userData.user?.identities[0].identity_data.avatar_url,
            comment: input,
            likes_count: 0,
            retweet_count: 0
        })

        if (!response.error) {
            let response = await supabase
                .from("tweets")
                .update([{
                    comments_count: commentCount + 1
                }]).eq("id", tweetId)
        }
        // response.error ? console.log("error uploading new comment: ", error) : console.log("comment added succesfully!")
        setInput('')
    }

    const uploadData = (created_at) => {
        if (created_at) {
            // spliting date and time
            created_at = created_at.split("T")

            // setting date
            let date = created_at[0]
            date = date.split("-")
            setDate(`${date[2]}/${date[1]}/${date[0]}`)

            // setting time
            let time = created_at[1]
            time = time.split(".")
            let newTime = time[0].split(":")
            setTime(newTime[0] + ":" + newTime[1])
        }
    }

    return (
        <div className='h-screen col-span-8 overflow-auto md:col-span-7 lg:col-span-5'>
            {isLoading === false ? (
                <div className='mb-14'>
                    {/* header */}
                    <div onClick={() => router.back()} className='sticky top-0 z-40 flex items-center p-4 space-x-2 bg-white border-b cursor-pointer border-b-gray-300 bg-opacity-30 backdrop-blur-md'>
                        <BackIcon />
                        <p>Back</p>
                    </div>

                    {/* tweet detailed content */}
                    {tweetData && (
                        <div className='flex-row p-2 space-y-2 border-t border-gray-300'>
                            {/* tweet header */}
                            <div className='flex items-center space-x-2'>
                                <img className='w-10 h-10 rounded-full' src={tweetData.profile_img} alt="" />
                                <div>
                                    <p>{tweetData.name}</p>
                                    <p className='text-sm text-gray-500'>{tweetData.username}</p>
                                </div>
                            </div>
                            {/* tweet body */}
                            <div>
                                <p className='py-2 text-lg border-b border-b-gray-300'>{tweetData.tweet}</p>
                                {/* tweet date and time */}
                                <div className='flex py-2 space-x-4 border-b border-gray-300'>
                                    <p className='text-sm'>{time}</p>
                                    <p className='text-sm'>{date}</p>
                                </div>
                                {/* options */}
                                <div className='flex py-2 space-x-6 border-b border-b-gray-300 '>
                                    <div className='flex items-center space-x-2'>
                                        <CommentIcon />
                                        <p>{!tweetData.comments_count ? 0 : tweetData.comments_count}</p>
                                    </div>
                                    {/* <div className='flex items-center space-x-2'>
                                        <LikeIcon />
                                        <p>{tweetData.likes_count}</p>
                                    </div> */}
                                    <LikesCount tweetId={tweetData.id} tweetIsLiked={tweetData.isLiked} likesCount={tweetData.likes_count} />
                                    <div className='flex items-center space-x-2'>
                                        <RetweetIcon />
                                        <p>{!tweetData.retweets_count ? 0 : tweetData.retweets_count}</p>
                                    </div>
                                </div>
                            </div>

                            {/* reply area */}
                            {isAuthenticated && (
                                <div className='flex p-2 space-x-2 border border-gray-200 rounded-md shadow-md'>
                                    <img
                                        src={userData.user?.identities[0].identity_data.avatar_url}
                                        alt="profile picture"
                                        className='object-cover w-10 h-10 rounded-full'
                                    />
                                    <div className='flex-1 space-y-4'>
                                        {/* text area */}
                                        <textarea maxLength={255} value={input} onChange={(e) => setInput(e.target.value)} className='w-full text-lg bg-transparent border-b outline-none resize-none h-14 border-b-gray-300' type="text" placeholder="what's in your mind?" />

                                        {/* options */}
                                        <div>
                                            <div className='flex-row items-center justify-between flex-1 sm:flex'>
                                                <div className='flex space-x-2'>
                                                    <div className='transition-transform cursor-pointer hover:scale-125'>
                                                        <ImageIcon />
                                                    </div>
                                                    <div className='transition-transform cursor-pointer hover:scale-125'>
                                                        <CalenderIcon />
                                                    </div>
                                                    <div className='transition-transform cursor-pointer hover:scale-125'>
                                                        <LocationIcon />
                                                    </div>
                                                </div>
                                                <div className='flex items-center justify-between space-x-2'>
                                                    {/* word count */}
                                                    <p>words: {
                                                        input.length
                                                    }/255 </p>
                                                    <button disabled={!input} onClick={() => postComment(tweetData.comments_count, tweetData.id)} className='px-5 py-2 font-bold text-white rounded-full bg-twitter disabled:opacity-60'>Reply</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* comments list */}
                    <h1 className='p-2 text-lg font-bold'>Comments</h1>
                    <div className='p-2 border-t border-gray-300 mb-44'>
                        {/* single comment */}
                        {comments && comments.length != 0 ? comments.map((comment, index) => (
                            <div className='flex py-2 space-x-2 border-b border-gray-300'>
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
                </div>
            ) :
                <p>Getting data...</p>
            }
        </div>
    )
}

export default TweetDetailed