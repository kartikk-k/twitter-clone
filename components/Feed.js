import AuthContext from 'context/AuthContext'
import TweetContext from 'context/TweetsContext'
import React, { useContext, useEffect, useState } from 'react'
import { RefreshIcon, CommentIcon, LikeIcon, RetweetIcon, ShareIcon } from './Icons'
import { useRouter } from 'next/router'
import { supabase } from 'utils/supabase'
import NewTweetBox from './tweet/NewTweetBox'
import TweetsList from './tweet/TweetsList'

function Feed() {
    const { isAuthenticated } = useContext(AuthContext)
    // const { tweets, getTweets } = useContext(TweetContext)

    // to update changes on frontend
    // const [isLiked, setIsLiked] = useState([])
    // const [isLikesCount, setIsLikesCount] = useState([])

    // const handleLike = async (tweetId, tweetIsLiked, likesCount) => {
    //     if (isAuthenticated) {
    //         let tweetLikeStatus = isLiked[tweetId] != undefined ? isLiked[tweetId] : tweetIsLiked

    //         // like the tweet
    //         if (tweetLikeStatus === false) {
    //             // reflecting change in UI/frontend before getting response from "database"
    //             setIsLiked({ ...isLiked, [tweetId]: !isLiked[tweetId] })
    //             setIsLikesCount({ ...isLikesCount, [tweetId]: likesCount + 1 })

    //             try {
    //                 // sending request to database
    //                 let { data, error } = await supabase
    //                     .from("liked_tweets")
    //                     .insert([{
    //                         tweet_id: tweetId,
    //                         user_id: userData.user?.id
    //                     }])

    //                 // updating count if there is no error liking tweet in database
    //                 console.log("likes table response: ", data)
    //                 if (!error) {
    //                     let { data, error } = await supabase
    //                         .from("tweets")
    //                         .update({ likes_count: likesCount + 1 })
    //                         .eq("id", tweetId)

    //                     return
    //                 }

    //             } catch (error) {
    //                 // updating UI if there is error in updating tweet
    //                 setIsLiked({ ...isLiked, [tweetId]: !isLiked[tweetId] })
    //                 setIsLikesCount({ ...isLikesCount, [tweetId]: isLikesCount[tweetId] - 1 })
    //                 console.log(error)
    //             }

    //         }


    //         // unlike the tweet
    //         if (tweetLikeStatus === true) {
    //             console.log("unlike in action...")
    //             setIsLiked({ ...isLiked, [tweetId]: !isLiked[tweetId] })
    //             setIsLikesCount({ ...isLikesCount, [tweetId]: isLikesCount[tweetId] - 1 })

    //             let { data, error } = await supabase
    //                 .from("liked_tweets")
    //                 .delete()
    //                 .match({ user_id: userData.user?.id, tweet_id: tweetId })

    //             // decresing like count from tweets table in database
    //             if (!error) {
    //                 let unlikeFrom = isLikesCount[tweetId] ? isLikesCount[tweetId] : likesCount
    //                 let { data, error } = await supabase
    //                     .from("tweets")
    //                     .update({ likes_count: unlikeFrom - 1 })
    //                     .eq("id", tweetId)

    //                 return
    //             }
    //         }
    //     }
    // }

    return (
        <div className='h-screen col-span-8 overflow-auto md:col-span-7 lg:col-span-5'>

            {/* Navbar */}
            <div className='sticky top-0 z-40 flex justify-between px-4 py-4 bg-white border-b cursor-pointer border-b-gray-300 bg-opacity-30 backdrop-blur-md'>
                <h1 className='text-lg font-bold'>Home</h1>
                <div onClick={() => getTweets()}>
                    <RefreshIcon />
                </div>
            </div>

            {/* Tweet box */}
            {isAuthenticated && (
                <NewTweetBox />
            )}

            {/* Tweets list */}
            <TweetsList requestFor="all" />
        </div>
    )
}

export default Feed