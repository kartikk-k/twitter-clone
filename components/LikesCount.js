const { useEffect, useState, useContext } = require("react")
import AuthContext from "context/AuthContext"
import TweetContext from "context/TweetsContext"
import { supabase } from "utils/supabase"
import { LikeIcon } from "./Icons"

export const LikesCount = ({ tweetId, tweetIsLiked, likesCount }) => {
    const { isAuthenticated, userData } = useContext(AuthContext)

    const [isLiked, setIsLiked] = useState([])
    const [isLikesCount, setIsLikesCount] = useState([])

    const handleLike = async () => {
        if (isAuthenticated) {
            let tweetLikeStatus = isLiked[tweetId] != undefined ? isLiked[tweetId] : tweetIsLiked

            // like the tweet
            if (tweetLikeStatus === false) {
                // reflecting change in UI/frontend before getting response from "database"
                setIsLiked({ ...isLiked, [tweetId]: !isLiked[tweetId] })
                setIsLikesCount({ ...isLikesCount, [tweetId]: likesCount + 1 })

                // return

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

                // return

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
        <div>
            <div onClick={() => handleLike(tweetId, tweetIsLiked, likesCount)} className='flex items-center space-x-1 cursor-pointer'>
                <LikeIcon
                    className={tweetIsLiked || isLiked[tweetId] ? 'fill-red-600 stroke-red-600 w-6 h-6' : "w-6 h-6 opacity-70 hover:opacity-100 hover:stroke-red-600"}
                />
                <p className='select-none opacity-70'>{isLikesCount[tweetId] ? isLikesCount[tweetId] : likesCount}</p>
            </div>
        </div>
    )
}