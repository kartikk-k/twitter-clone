import React, { useEffect, useState } from 'react'
import { BackIcon, CommentIcon, LikeIcon, RetweetIcon } from './Icons'
import { useContext } from 'react'
import AuthContext from 'context/AuthContext'
import { useRouter } from 'next/router'
import { supabase } from 'utils/supabase'
import { ImageIcon, LocationIcon, CalenderIcon } from './Icons'

function TweetDetailed({ id }) {
    let { userData } = useContext(AuthContext)
    let router = useRouter()

    const [tweetData, setTweetData] = useState()
    const [comments, setComments] = useState()
    const [input, setInput] = useState('')
    // const [commentMode, setCommentMode] = useState(false)
    const [date, setDate] = useState()
    const [time, setTime] = useState()

    useEffect(() => {
        if (router.isReady) {
            getTweetContent()
            getTweetComments()
        }
    }, [router.isReady])


    // getting expanded tweet data
    const getTweetContent = async () => {
        let { data, error } = await supabase
            .from("Tweets")
            .select("*")
            .eq("id", id)
            .single()

        // processiong response data
        console.log(data)
        data ? setTweetData(data) : console.log("error fetching tweet: ", error)
        uploadData(data?.created_at)
    }

    // getting expanded tweet comments
    const getTweetComments = async () => {
        let { data, error } = await supabase
            .from("Comments")
            .select("*")
            .eq("tweet_id", id)
            .range(0, 9)

        // processing data
        console.log(data)
        data ? setComments(data) : console.log("error fetching comments: ", error)
    }


    // posting new comment on expanded tweet
    const createComment = async () => {
        let response = await supabase.from("Comments").insert({
            tweet_id: id,
            username: userData.user?.identities[0].identity_data.user_name,
            name: userData.user?.identities[0].identity_data.name,
            profile_img: userData.user?.identities[0].identity_data.avatar_url,
            comment: input
        })

        response.error ? console.log("error uploading new comment: ", error) : console.log("comment added succesfully!")
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
            <div className='mb-14'>
                {/* header */}
                <div onClick={() => router.back()} className='sticky top-0 flex items-center p-4 space-x-2 bg-white border-b cursor-pointer border-b-gray-300 bg-opacity-30 backdrop-blur-md'>
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
                                <div className='flex items-center space-x-2'>
                                    <LikeIcon />
                                    <p>{tweetData.likes_count}</p>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RetweetIcon />
                                    <p>{!tweetData.retweets_count ? 0 : tweetData.retweets_count}</p>
                                </div>
                            </div>
                        </div>

                        {/* reply area */}
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
                                            <button disabled={!input} onClick={createComment} className='px-5 py-2 font-bold text-white rounded-full bg-twitter disabled:opacity-60'>Reply</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* comments list */}
                <h1 className='p-2 text-lg font-bold'>Comments</h1>
                {comments ? (
                    <div className='p-2 border-t border-gray-300'>
                        {/* single comment */}
                        {comments.map((comment, index) => (
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
                                        <div className='flex space-x-2'>
                                            <LikeIcon />
                                            <p>{comment.likes_count ? comment.likes_count : 0}</p>
                                        </div>
                                        <div className='flex space-x-2'>
                                            <RetweetIcon />
                                            <p>{comment.retweet_count ? comment.retweet_count : 0}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                ) : <p>No comments on this tweet!</p>}

            </div>

        </div>
    )
}

export default TweetDetailed