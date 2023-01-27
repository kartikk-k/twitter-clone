import React, { useEffect, useContext } from 'react'
import AuthContext from 'context/AuthContext'



function TweetsList({ requestFor, requestUser = null, requestTweetId = null }) {   // requestForm options: [ all, user, single ]
    // checking auth and getting logged-in user data
    const { userData, isAuthenticated } = useContext(AuthContext)

    const [tweets, setTweets] = useState()
    const [isTweetsLoading, setIsTweetsLoading] = useState()
    const [isLikedTweetsReady, setIsLikedTweetsReady] = useState()


    useEffect(() => {
        setIsTweetsLoading(true)
        getTweets()
    }, [])

    // get liked tweets of logged in user
    useEffect(() => {
        // no need to get liked tweets if not authenticated
        if (!isAuthenticated) return setIsLikedTweetsReady(true)
        // waiting for tweets to load
        if (isTweetsLoading) return

        getLikedTweetsList()
    }, [tweets])


    // get list of tweets
    const getTweets = async () => {

        // getting tweets as per requestType
        if (requestFor === 'all') {
            let { data, error } = await supabase.from("tweets").select("*").range(0, 9)
        } else if (requestFor === 'user') {
            let { data, error } = await supabase.from("tweets").select("*").eq("user_id", requestUser).range(0, 9)
        } else if (requestFor === 'single') {
            let { data, error } = await supabase.from("tweets").select("*").eq("tweet_id", requestTweetId).range(0, 9)
        }

        // adding isLiked field in all tweets
        if (data) {
            let newData = data.map(tweetData => {
                return { ...tweetData, isLiked: false }
            })

            // setting tweets state
            setTweets(newData)
            setIsTweetsLoading(false)
        } else {
            console.log("error fetching tweets", error)
            setIsTweetsLoading(false)
        }

    }


    // get list of liked tweets
    const getLikedTweetsList = async () => {

        // *********************************
        // make it flexible like get tweets
        // *********************************

        let { data, error } = await supabase.from("liked_tweets").select("tweet_id").match({ user_id: userData.user?.id, })

        if (data) {
            // creating an empty array of liked tweets
            let likedList = []

            // adding liked tweet ids in liked list array
            data.map((obj) => {
                likedList = likedList.concat(obj.tweet_id)
            })

            // setting state of liked tweets
            let updatedTweets = tweets.map(tweet => {
                tweet.isLiked = likedList.some(tweet_id => tweet_id === tweet.id)
                console.log(tweet.isLiked)
                return tweet
            })

            // updating initail value of state with updated list including liked state
            setTweets(updatedTweets)
        }

        setIsLikedTweetsReady(true)
    }


    return (
        <div>
            {isLikedTweetsReady ? (
                <div className='divide-y divide-gray-400'>
                    {tweets != 0 ? tweets.map((tweet, index) => {

                        {/* ************** single tweet to be replaed by mainTweet component ************** */ }

                        return (
                            <div key={index} className='flex py-2 space-x-2'>
                                <img onClick={() => router.push(`/user/${tweet.name}`)} className='w-10 h-10 rounded-full cursor-pointer' src={tweet.profile_img} alt="" />
                                <div>
                                    <div className='flex-row space-y-2'>

                                        {/* user info */}
                                        <div className='flex items-center space-x-2'>
                                            <p className='text-lg'>{tweet.name}</p>
                                            <p className='text-gray-600'>@{tweet.username}</p>
                                        </div>

                                        {/* tweet content */}
                                        <p>{tweet.tweet}</p>

                                        {/* tweet options */}
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
                                            <div className='flex items-center space-x-1 cursor-pointer opacity-70'>
                                                <ShareIcon />
                                            </div>
                                        </div>

                                    </div>

                                </div>
                            </div>
                        )
                    }) : <p>No tweets to show</p>}
                </div>

            ) : <p>getting your tweets ready</p>}
        </div>
    )
}

export default TweetsList