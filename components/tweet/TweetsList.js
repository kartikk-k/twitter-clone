import React, { useEffect, useContext, useState } from 'react'
import { supabase } from 'utils/supabase'
import AuthContext from 'context/AuthContext'
import { CommentIcon, LikeIcon, LoadingIcon, RetweetIcon, ShareIcon } from '../Icons'
import { useRouter } from 'next/router'
import NewComment from './NewComment'



function TweetsList({ requestFor, requestUser = null, requestTweetId = null }) {   // requestForm options: [ all, user, single ]
    // checking auth and getting logged-in user data
    const { userData, isAuthenticated } = useContext(AuthContext)

    let router = useRouter()

    const [tweets, setTweets] = useState()
    const [isLiked, setIsLiked] = useState([])
    const [isLikesCount, setIsLikesCount] = useState([])
    const [isTweetsLoading, setIsTweetsLoading] = useState()
    const [isLikedTweetsReady, setIsLikedTweetsReady] = useState()

    const [data, setDate] = useState([])
    const [time, setTime] = useState([])


    useEffect(() => {
        setIsLiked([])
        setIsLikesCount([])

        setIsTweetsLoading(true)
        getTweets()
    }, [])

    // get liked tweets of logged in user
    useEffect(() => {
        if (!tweets || isTweetsLoading) return
        if (!isAuthenticated || !userData.user) return setIsLikedTweetsReady(true)

        getLikedTweetsList()
    }, [isTweetsLoading, userData])


    // get list of tweets
    const getTweets = async () => {
        // adding isLiked field in all tweets once tweets is ready
        const updateTweetData = (data) => {
            let newData = data.map(tweetData => {
                return { ...tweetData, isLiked: false }
            })

            // setting tweets state
            setTweets(newData)
            setIsTweetsLoading(false)
        }

        // getting tweets as per requestType
        if (requestFor === 'all') {
            let { data, error } = await supabase
                .from("tweets")
                .select("*")
                .order('id', { ascending: false })
                .range(0, 9)

            data ? updateTweetData(data) : setIsTweetsLoading(false)

        } else if (requestFor === 'user') {
            let { data, error } = await supabase
                .from("tweets")
                .select("*")
                .eq("user_id", requestUser)
                .order('id', { ascending: false })
                .range(0, 9)

            data ? updateTweetData(data) : setIsTweetsLoading(false)

        } else if (requestFor === 'single') {
            let { data, error } = await supabase
                .from("tweets")
                .select("*")
                .eq("id", requestTweetId)
                .range(0, 1)

            if (data) {
                updateTweetData(data)

                // this will be map once to set upload data 
                data.map(tweet => {
                    uploadData(tweet.created_at, tweet.id)
                })
            } else {
                setIsTweetsLoading(false)
            }

        }
    }

    // get list of liked tweets
    const getLikedTweetsList = async () => {
        // getting all the tweets to be checked for liked status
        let tweets_list = []

        tweets.map(tweet => {
            return tweets_list = tweets_list.concat(tweet.id)
        })

        tweets_list = tweets_list.toString()

        // finally setting status of tweet if liked
        const processLikedTweets = (data) => {
            let likedList = []

            // creating an array of liked tweet's id
            data.map(liked_tweet => {
                likedList = likedList.concat(liked_tweet.tweet_id)
            })

            let updatedTweets = tweets.map(tweet => {
                tweet.isLiked = likedList.some(tweet_id => tweet_id === tweet.id)
                return tweet
            })

            // updating state of tweets
            setTweets(updatedTweets)
        }

        let { data, error } = await supabase
            .from("liked_tweets")
            .select("tweet_id")
            .filter('tweet_id', 'in', `(${tweets_list})`)
            .eq("user_id", userData.user.id)

        if (data) processLikedTweets(data)

        setIsLikedTweetsReady(true)
    }

    // handle like and unlike of a tweet
    const handleLike = async (tweetId, tweetIsLiked, likesCount) => {

        // only able to perform action if authenticated
        if (isAuthenticated) {

            // checking if action is performed after data is set
            let tweetLikeStatus = isLiked[tweetId] != undefined ? isLiked[tweetId] : tweetIsLiked

            // like the tweet
            if (tweetLikeStatus === false) {
                // reflecting change in UI/frontend
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

                // reflecting change in UI
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

    // to get upload date and time for detailed tweet
    const uploadData = (created_at, tweetId) => {
        if (created_at) {
            // spliting date and time
            created_at = created_at.split("T")

            // setting date
            let date = created_at[0]
            date = date.split("-")
            // ...date to create a copy of object & [tweetid] to access the object with unique id
            setDate({ ...date, [tweetId]: `${date[2]}/${date[1]}/${date[0]}` })

            // setting time
            let time = created_at[1]
            time = time.split(".")
            let newTime = time[0].split(":")
            setTime({ ...time, [tweetId]: newTime[0] + ":" + newTime[1] })
        }
    }



    return (
        <div className={requestFor === 'single' ? 'py-2' : 'border-b mb-32 border-gray-300'}>

            {requestFor != 'single' && (
                <h1 className='p-2 text-lg font-bold'>Tweets</h1>
            )}

            {isLikedTweetsReady ? (
                <div className='divide-y divide-gray-300'>
                    {tweets && tweets != 0 ? tweets.map((tweet, index) => {

                        return (
                            <div key={index} className='p-2 space-x-2 '>
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
                                                <p className='text-sm'>{time[tweet.id]}</p>
                                                <p className='text-sm'>{data[tweet.id]}</p>
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

                                    {/* comment box */}
                                    {requestFor === 'single' && isAuthenticated && (
                                        <NewComment tweetId={tweet.id} commentCount={tweet.comments_count} />
                                    )}

                                </div>
                            </div>
                        )
                    }) : <p>No tweets to show</p>}
                </div>

            ) : <div className='flex items-center justify-center h-full'>
                <LoadingIcon className="w-8 h-8 animate-spin" />
            </div>}
        </div>
    )
}

export default TweetsList