import AuthContext from 'context/AuthContext'
import TweetContext from 'context/TweetsContext'
import React, { useContext, useState } from 'react'
import { RefreshIcon, CommentIcon, LikeIcon, RetweetIcon, ShareIcon } from './Icons'
import TweetBox from './TweetBox'
import { useRouter } from 'next/router'
import { supabase } from 'utils/supabase'
import { LikesCount } from './LikesCount'

function Feed() {
    const { isAuthenticated, userData, isLoading } = useContext(AuthContext)
    const { tweets, getTweets } = useContext(TweetContext)

    // to update changes on frontend
    const [isLiked, setIsLiked] = useState([])
    const [isLikesCount, setIsLikesCount] = useState([])

    const router = useRouter()

    const handleLike = async (tweetId, tweetIsLiked, likesCount) => {
        if (isAuthenticated) {
            let tweetLikeStatus = isLiked[tweetId] != undefined ? isLiked[tweetId] : tweetIsLiked

            // like the tweet
            if (tweetLikeStatus === false) {
                // reflecting change in UI/frontend before getting response from "database"
                setIsLiked({ ...isLiked, [tweetId]: !isLiked[tweetId] })
                setIsLikesCount({ ...isLikesCount, [tweetId]: likesCount + 1 })

                try {
                    // sending request to database
                    let { data, error } = await supabase
                        .from("liked_tweets")
                        .insert([{
                            tweet_id: tweetId,
                            user_id: userData.user?.id
                        }])

                    // updating count if there is no error liking tweet in database
                    console.log("likes table response: ", data)
                    if (!error) {
                        let { data, error } = await supabase
                            .from("tweets")
                            .update({ likes_count: likesCount + 1 })
                            .eq("id", tweetId)

                        return
                    }

                } catch (error) {
                    // updating UI if there is error in updating tweet
                    setIsLiked({ ...isLiked, [tweetId]: !isLiked[tweetId] })
                    setIsLikesCount({ ...isLikesCount, [tweetId]: isLikesCount[tweetId] - 1 })
                    console.log(error)
                }

            }


            // unlike the tweet
            if (tweetLikeStatus === true) {
                console.log("unlike in action...")
                setIsLiked({ ...isLiked, [tweetId]: !isLiked[tweetId] })
                setIsLikesCount({ ...isLikesCount, [tweetId]: isLikesCount[tweetId] - 1 })

                let { data, error } = await supabase
                    .from("liked_tweets")
                    .delete()
                    .match({ user_id: userData.user?.id, tweet_id: tweetId })

                // decresing like count from tweets table in database
                if (!error) {
                    let unlikeFrom = isLikesCount[tweetId] ? isLikesCount[tweetId] : likesCount
                    let { data, error } = await supabase
                        .from("tweets")
                        .update({ likes_count: unlikeFrom - 1 })
                        .eq("id", tweetId)

                    return
                }
            }
        }
    }

    return (
        <div className='h-screen col-span-8 overflow-auto md:col-span-7 lg:col-span-5'>
            <div className='flex justify-between px-4 mt-4'>
                <h1 className='text-lg font-bold'>Home</h1>
                <div onClick={() => getTweets()}>
                    <RefreshIcon />
                </div>
            </div>

            {/* Tweet box */}
            {isAuthenticated && (
                <TweetBox />
            )}

            <div className='p-2 m-4 border border-gray-300 rounded-md'>
                {tweets ? (
                    <div className='divide-y divide-gray-400'>
                        {tweets && tweets.map((tweet, index) => {
                            return (
                                <div key={index} className='flex py-2 space-x-2'>
                                    <img className='w-10 h-10 rounded-full' src={tweet.profile_img} alt="" />
                                    <div>
                                        <div className='flex-row space-y-2'>
                                            {/* user info */}
                                            <div className='flex items-center space-x-2'>
                                                <p className='text-lg'>{tweet.name}</p>
                                                <p className='text-gray-600'>@{tweet.username}</p>
                                            </div>
                                            {/* tweet content */}
                                            <p>{tweet.tweet}</p>
                                            {/* options */}
                                            <div className='flex justify-start space-x-6'>
                                                <div onClick={() => router.push(`/tweet/${tweet.id}`)} className='flex items-center space-x-1 cursor-pointer'>
                                                    <CommentIcon className={"h-6 w-6 opacity-70 hover:opacity-100 hover:stroke-twitter"} />
                                                    <p className='select-none opacity-70'>{tweet.comments_count}</p>
                                                </div>
                                                <div className='flex items-center space-x-1 cursor-pointer'>
                                                    <RetweetIcon className={"hover:stroke-green-700 hover:opacity-100 opacity-70 w-6 h-6"} />
                                                    <p className='select-none opacity-70'>1</p>
                                                </div>

                                                <div onClick={() => handleLike(tweet.id, tweet.isLiked, tweet.likes_count)} className='flex items-center space-x-1 cursor-pointer'>
                                                    <LikeIcon
                                                        className={tweet.isLiked === true || isLiked[tweet.id] === true ? 'fill-red-600 stroke-red-600 w-6 h-6' : "w-6 h-6 opacity-70 hover:opacity-100 hover:stroke-red-600"}
                                                    />
                                                    <p className='select-none opacity-70'>{isLikesCount[tweet.id] ? isLikesCount[tweet.id] : tweet.likes_count}</p>
                                                </div>
                                                {/* unable to update like icon when coming bacj from expanded tweet */}
                                                {/* {tweets && (
                                                    <LikesCount tweetId={tweet.id} tweetIsLiked={tweet.isLiked} likesCount={tweet.likes_count} />
                                                )} */}
                                                <div className='flex items-center space-x-1 cursor-pointer opacity-70'>
                                                    <ShareIcon />
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : <p>no tweets to show</p>}
            </div>
        </div>
    )
}

export default Feed