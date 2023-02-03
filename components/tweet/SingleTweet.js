import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { CommentIcon, LikeIcon, LoadingIcon, RetweetIcon, ShareIcon } from '../Icons'
import { useContext } from 'react'
import AuthContext from 'context/AuthContext'
import { supabase } from 'utils/supabase'

function SingleTweet({ tweet, requestFor, date = null, time = null }) {
    const { userData, isAuthenticated } = useContext(AuthContext)

    const [isLiked, setIsLiked] = useState()
    const [isLikesCount, setIsLikesCount] = useState()


    let router = useRouter()

    useEffect(() => {
        if (!tweet) return
        setIsLiked(tweet.isLiked)
        setIsLikesCount(tweet.likes_count)
    }, [tweet])

    // handle like and unlike of a tweet
    const handleLike = async (tweetId, tweetIsLiked, likesCount) => {

        if (!isAuthenticated) {
            alert(`Login to like the tweet!`)
            return
        }

        // only able to perform action if authenticated
        if (isAuthenticated) {

            // checking if action is performed after data is set
            let tweetLikeStatus = isLiked != undefined ? isLiked : tweetIsLiked

            // like the tweet
            if (tweetLikeStatus === false) {
                // reflecting change in UI/frontend
                setIsLiked(true)
                setIsLikesCount(likesCount + 1)


                // sending request to database
                let { data, error } = await supabase
                    .from("liked_tweets")
                    .insert([{
                        tweet_id: tweetId,
                        user_id: userData.user?.id
                    }])

                // updating count if there is no error liking tweet in database
                if (!error) {
                    let { data, error } = await supabase
                        .from("tweets")
                        .update({ likes_count: likesCount + 1 })
                        .eq("id", tweetId)

                    return
                } else {
                    // updating UI if there is error in updating tweet
                    setIsLiked(!isLiked)
                    setIsLikesCount(likesCount - 1)
                }

            }

            // unlike the tweet
            if (tweetLikeStatus === true) {

                // reflecting change in UI
                setIsLiked(false)
                setIsLikesCount(likesCount - 1)

                let { data, error } = await supabase
                    .from("liked_tweets")
                    .delete()
                    .match({ user_id: userData.user?.id, tweet_id: tweetId })

                // decresing like count from tweets table in database
                if (!error) {
                    let unlikeFrom = isLikesCount ? isLikesCount : likesCount
                    let { data, error } = await supabase
                        .from("tweets")
                        .update({ likes_count: unlikeFrom - 1 })
                        .eq("id", tweetId)

                    return
                } else {
                    // updating UI if there is error in updating tweet
                    setIsLiked(!isLiked)
                    setIsLikesCount(likesCount + 1)
                }
            }
        }
    }

    const retweet = async (tweet) => {
        if (!isAuthenticated) return

        // adding retweet as a new tweet in database
        let { data, error } = await supabase
            .from("tweets")
            .insert([{
                tweet: tweet.tweet,
                user_id: userData.user?.id,
                username: tweet.username,
                name: tweet.name,
                likes_count: 0,
                comments_count: 0,
                profile_img: tweet.profile_img,
                is_retweeted: true,
                retweet_id: tweet.id,
                retweet_name: tweet.name,
                retweet_username: tweet.username,
                profile_img: userData.user?.identities[0].identity_data.avatar_url
            }])

        // updating the retweet count of the original tweet
    }


    return (
        <div className='p-2 pb-0 space-x-2 '>
            <div>
                <div className='flex-row'>

                    {/* user info */}
                    <div className='flex space-x-2'>
                        <img onClick={() => router.push(`/user/${tweet.username}`)} className='w-10 h-10 rounded-full cursor-pointer' src={tweet.profile_img} alt="" />

                        <div className='flex-row justify-between'>
                            <p className='text-lg'>{tweet.name}</p>
                            <p className='text-xs text-gray-600'>@{tweet.username}</p>
                        </div>
                    </div>

                    {/* tweet content */}
                    <div className={requestFor === 'single' ? 'border-b border-gray-300 py-2' : 'py-2 flex space-x-2'}>
                        <div className={requestFor === 'single' ? '' : 'w-10 h-1'}></div>
                        <p className={requestFor === 'single' ? 'text-lg' : ''}>{tweet.tweet}</p>
                    </div>

                    {/* upload date and time only for detailed tweet */}
                    {requestFor === 'single' && (
                        <div className='flex py-2 space-x-4 border-b border-gray-300'>
                            <p className='text-sm'>{time}</p>
                            <p className='text-sm'>{date}</p>
                        </div>
                    )}

                    {/* tweet options */}
                    <div className={requestFor === 'single' ? 'py-2 border-b border-gray-300' : 'flex space-x-2'}>
                        <div className={requestFor === 'single' ? '' : 'w-10 h-1'}></div>

                        <div className='flex justify-start space-x-6'>
                            <div onClick={() => router.push(`/tweet/${tweet.id}`)} className='flex items-center space-x-1 cursor-pointer'>
                                <CommentIcon className={"h-6 w-6 opacity-70 hover:opacity-100 hover:stroke-twitter"} />
                                <p className='select-none opacity-70'>{tweet.comments_count}</p>
                            </div>
                            <div className='flex items-center space-x-1 cursor-pointer'>
                                <RetweetIcon onClick={() => retweet(tweet)} className={"hover:stroke-green-700 hover:opacity-100 opacity-70 w-6 h-6"} />
                                <p className='select-none opacity-70'>1</p>
                            </div>

                            <div onClick={() => handleLike(tweet.id, tweet.isLiked, tweet.likes_count)} className='flex items-center space-x-1 cursor-pointer'>
                                <LikeIcon
                                    className={isLiked === true ? 'fill-red-600 stroke-red-600 w-6 h-6' : "w-6 h-6 fill-none opacity-70 hover:opacity-100 hover:stroke-red-600"}
                                />
                                <p className='select-none opacity-70'>{isLikesCount ? isLikesCount : tweet.likes_count}</p>
                            </div>

                            <div className='flex items-center space-x-1 cursor-pointer opacity-70'>
                                <ShareIcon />
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}

export default SingleTweet