import AuthContext from 'context/AuthContext'
import TweetContext from 'context/TweetsContext'
import React, { useContext } from 'react'
import { RefreshIcon, CommentIcon, LikeIcon, RetweetIcon, ShareIcon } from './Icons'
import TweetBox from './TweetBox'
import { useRouter } from 'next/router'

function Feed() {
    const { isAuthenticated } = useContext(AuthContext)
    const { tweets } = useContext(TweetContext)

    const router = useRouter()

    return (
        <div className='h-screen col-span-8 overflow-auto md:col-span-7 lg:col-span-5'>
            <div className='flex justify-between px-4 mt-4'>
                <h1 className='text-lg font-bold'>Home</h1>
                <RefreshIcon />
            </div>

            {/* Tweet box */}
            {isAuthenticated && (
                <TweetBox />
            )}

            {/* tweets */}
            <div className='p-2 m-4 border border-gray-300 rounded-md'>
                {tweets ? (
                    <div className='divide-y divide-gray-400'>
                        {tweets && tweets.map((tweet, index) => (
                            <div className='flex py-2 space-x-2'>
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
                                            <div onClick={() => router.push(`/tweet/${tweet.id}`)} className='flex items-center space-x-1 cursor-pointer opacity-70'>
                                                <CommentIcon />
                                                <p>2</p>
                                            </div>
                                            <div className='flex items-center space-x-1 cursor-pointer opacity-70'>
                                                <RetweetIcon />
                                                <p>1</p>
                                            </div>
                                            <div className='flex items-center space-x-1 cursor-pointer opacity-70'>
                                                <LikeIcon />
                                                <p>0</p>
                                            </div>
                                            <div className='flex items-center space-x-1 cursor-pointer opacity-70'>
                                                <ShareIcon />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p>no tweets to show</p>}
            </div>

        </div>
    )
}

export default Feed