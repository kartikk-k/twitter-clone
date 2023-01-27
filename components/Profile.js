import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { BackIcon, CakeIcon } from './Icons'
import AuthContext from 'context/AuthContext'


function Profile({ id }) {
    const { isAuthenticated, userData } = useContext(AuthContext)
    let router = useRouter()

    const [activeTab, setActiveTab] = useState()
    const [content, setContent] = useState()

    useEffect(() => {
        setActiveTab('Tweets')
    }, [])





    return (
        <div className='h-screen col-span-8 overflow-auto md:col-span-7 lg:col-span-5'>
            <div className='mb-14'>

                {/* main nav */}
                <div onClick={() => router.back()} className='sticky top-0 z-40 flex items-center p-4 space-x-2 bg-white border-b cursor-pointer border-b-gray-300 bg-opacity-30 backdrop-blur-md'>
                    <BackIcon />
                    <p className='text-lg font-bold'>{id}</p>
                </div>

                {/* complete user info */}
                <div className='pb-4 border-b border-b-gray-300'>
                    {/* profile header */}
                    <div className='bg-twitter relative min-h-[150px]'>
                        <div className='absolute bottom-[-56px] px-4'> {/* 112px/2 = 56px */}
                            {/* profile_img */}
                            <img className='rounded-full w-28 h-28' src={"https://pbs.twimg.com/profile_images/1482104678976753665/OsgSEJKk_400x400.jpg"} alt="kartik_k1212" />
                        </div>
                    </div>

                    {/* conditional buttons */}
                    <div className='flex justify-end px-2 py-4'>
                        <button className='px-4 py-2 font-bold border border-gray-500 rounded-full'>Edit profile</button>
                    </div>

                    {/* profile info */}
                    <div className='flex-row px-4 space-y-4'>
                        <div>
                            <h1 className='text-lg font-bold'>{id}</h1>
                            <h2 className='text-gray-500'>@kartik_builds</h2>
                        </div>

                        <div>
                            {/* bio */}
                            <p>Twitter clone demo bio</p>

                            {/* birth info */}
                            <div className='flex items-center space-x-2'>
                                <CakeIcon className="w-5 h-5 stroke-gray-500" />
                                <p className='text-gray-500'>Born December 12, 2003</p>
                            </div>
                        </div>

                        {/* followers and following */}
                        <div className='flex space-x-4'>
                            <div className='flex space-x-2'>
                                <p className='font-bold'>298</p>
                                <p>Following</p>
                            </div>
                            <div className='flex space-x-2'>
                                <p className='font-bold'>298</p>
                                <p>Following</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* profile nav */}
                <div className='flex justify-between px-4 border-b border-b-gray-300'>
                    <button onClick={() => { activeTab != 'Tweets' ? setActiveTab('Tweets') : '' }} className={`px-2 py-4 font-semibold ${activeTab === 'Tweets' ? 'text-gray-900 border-b-4 border-twitter' : 'text-gray-600'} `}>Tweets</button>
                    <button onClick={() => { activeTab != 'Replies' ? setActiveTab('Replies') : '' }} className={`px-2 py-4 font-semibold ${activeTab === 'Replies' ? 'text-gray-900 border-b-4 border-twitter' : 'text-gray-600'} `}>Replies</button>
                    <button onClick={() => { activeTab != 'Likes' ? setActiveTab('Likes') : '' }} className={`px-2 py-4 font-semibold ${activeTab === 'Likes' ? 'text-gray-900 border-b-4 border-twitter' : 'text-gray-600'} `}>Likes</button>
                </div>

                {/* main content */}
                {(activeTab === 'Tweets') ?
                    <div>
                        {/* tweets */}
                        <p>Tweets</p>
                    </div>

                    : (activeTab === 'Replies') ?
                        <div>
                            {/* Replies */}
                            <p>Replies</p>
                        </div>

                        : <div>
                            {/* Likes */}
                            <p>Likes</p>
                        </div>
                }
            </div>


        </div>
    )
}

export default Profile