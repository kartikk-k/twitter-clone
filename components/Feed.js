import AuthContext from 'context/AuthContext'
import TweetContext from 'context/TweetsContext'
import React, { useContext, useState } from 'react'
import { RefreshIcon, CommentIcon, LikeIcon, RetweetIcon, ShareIcon } from './Icons'
import TweetBox from './TweetBox'
import { useRouter } from 'next/router'
import { supabase } from 'utils/supabase'

function Feed() {
    const { isAuthenticated, userData, likedTweets } = useContext(AuthContext)
    const { tweets, getTweets } = useContext(TweetContext)

    const [isLiked, setIsLiked] = useState([])

    const router = useRouter()

    const handleLike = async (id) => {
        if (isAuthenticated) {
            // ...isLiked to create a copy of object & [id] to access the object with specific id
            setIsLiked({ ...isLiked, [id]: !isLiked[id] })

            if (isLiked[id]) {
                // unlike 
                let response = await supabase
                    .from("liked_tweets")
                    .delete()
                    .match({ user_id: userData.user?.id, tweet_id: id })

                console.log("isLiked == true: ", response)

            } if (!isLiked[id]) {
                // like
                let response = await supabase
                    .from("liked_tweets")
                    .insert({
                        tweet_id: id,
                        user_id: userData.user?.id
                    })

                response.error ? console.log("error updating liked tweets: ", error) : console.log("Updated liked tweet successfully!")
                return
            }
        }
    }

    // const checkIsLiked = (tweetId) => {
    //     console.log("tweetID: ", tweetId)
    //     likedTweets.map(tweet => {
    //         console.log("tweet Compared: ", tweet)
    //         if (tweet.id === tweetId) {
    //             setIsLiked({ ...isLiked, [id]: !isLiked[id] })
    //             console.log("already liked!!", tweetId)
    //             return true
    //         } else {
    //             console.log("not liked!!")
    //         }
    //     })
    //     return false
    // }

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

            {/* tweets */}
            {/* {likedTweets && ( */}
            <div className='p-2 m-4 border border-gray-300 rounded-md'>
                {tweets ? (
                    <div className='divide-y divide-gray-400'>
                        {tweets && tweets.map((tweet, index) => {
                            {/* check if the tweet is already liked previously */ }
                            {/* let alreadyLiked = checkIsLiked(tweet.id)
                            console.log(alreadyLiked) */}

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
                                                    <p className='select-none opacity-70'>2</p>
                                                </div>
                                                <div className='flex items-center space-x-1 cursor-pointer'>
                                                    <RetweetIcon className={"hover:stroke-green-700 hover:opacity-100 opacity-70 w-6 h-6"} />
                                                    <p className='select-none opacity-70'>1</p>
                                                </div>
                                                <div onClick={() => handleLike(tweet.id)} className='flex items-center space-x-1 cursor-pointer'>
                                                    <LikeIcon className={isLiked[tweet.id] ? 'fill-red-600 stroke-red-600 w-6 h-6' : "w-6 h-6 opacity-70 hover:opacity-100 hover:stroke-red-600"} />
                                                    <p className='select-none opacity-70'>0</p>
                                                </div>
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
            {/* )} */}

        </div>
    )
}

export default Feed