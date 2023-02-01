import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { BackIcon, CakeIcon, LoadingIcon, CancelIcon } from './Icons'
import AuthContext from 'context/AuthContext'
import TweetsList from './tweet/TweetsList'
import { supabase } from 'utils/supabase'
import UpdateProfile from './profile/UpdateProfile'
import FollowList from './profile/FollowList'


function Profile({ id }) {
    const { isAuthenticated, userData } = useContext(AuthContext)
    let router = useRouter()

    // to track tab active tab
    const [activeTab, setActiveTab] = useState()
    const [profileData, setProfileData] = useState()
    const [editMode, setEditMode] = useState()
    const [isFollowListActive, setIsFollowListActive] = useState([])
    const [content, setContent] = useState()

    // const


    useEffect(() => {
        if (!router.isReady) return

        setActiveTab('Tweets')
        getUserInfo()

        // creating state for following and followers list 
        setIsFollowListActive({ ...isFollowListActive, ["followers"]: false })
        setIsFollowListActive({ ...isFollowListActive, ["following"]: false })
    }, [router])



    // get user profile data
    const getUserInfo = async () => {
        let { data, error } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("username", id)
            .single()

        if (data) {
            setProfileData(data)
        } else {
            console.log("error fetching profile data")
        }

    }

    // list hedaer
    const ListHeader = ({ heading }) => {
        const handleClose = () => {
            setIsFollowListActive({ ...isFollowListActive, ["followers"]: false })
            setIsFollowListActive({ ...isFollowListActive, ["following"]: false })
        }
        return (
            <div className='sticky top-0 flex items-center justify-between p-2 drop-shadow-lg bg-twitter'>
                <h1 className='text-lg font-semibold text-white'>{heading}</h1>
                <div onClick={() => handleClose}>
                    <CancelIcon className="w-6 h-6 cursor-pointer stroke-2 stroke-white" />
                </div>
            </div>
        )
    }


    return (
        <div className='h-screen col-span-8 overflow-auto md:col-span-7 lg:col-span-5'>
            <div className='mb-14'>

                {/* main nav */}
                <div onClick={() => router.back()} className='sticky top-0 z-30 flex items-center p-4 space-x-2 bg-white border-b cursor-pointer border-b-gray-300 bg-opacity-30 backdrop-blur-md'>
                    <BackIcon />
                    <p className='text-lg font-bold'>Back</p>
                </div>

                {profileData ? (
                    <div>

                        {/* complete user info */}
                        <div className='pb-4 border-b border-b-gray-300'>
                            {/* profile header */}
                            <div className='bg-twitter relative min-h-[150px]'>
                                <div className='absolute bottom-[-56px] px-4'> {/* 112px/2 = 56px */}
                                    {/* profile_img */}
                                    <img className='rounded-full w-28 h-28' src={profileData.profile_img} alt="kartik_k1212" />
                                </div>
                            </div>

                            {/* conditional buttons */}
                            <div className='flex justify-end px-2 py-4'>
                                {userData.user?.identities[0].identity_data.user_name === profileData.username ? (
                                    <button onClick={() => setEditMode(!editMode)} className='px-4 py-2 font-bold border border-gray-500 rounded-full'>Edit profile</button>
                                ) : (
                                    <button className='px-4 py-2 font-bold text-white border rounded-full bg-twitter'>Follow</button>
                                )}

                                {/* edit profile */}
                                {editMode && (
                                    <div className='absolute top-0 left-0 flex justify-center w-screen h-screen sm:items-center'>
                                        <div onClick={() => setEditMode(false)} className='absolute top-0 left-0 z-40 w-screen h-screen bg-black opacity-60'></div>
                                        <UpdateProfile profileData={profileData} />
                                    </div>
                                )}
                            </div>

                            {/* profile info */}
                            <div className='flex-row px-4 space-y-4'>
                                <div>
                                    <h1 className='text-lg font-bold'>{profileData.name}</h1>
                                    <h2 className='text-gray-500'>@{profileData.username}</h2>
                                </div>

                                <div>
                                    {/* bio */}
                                    <p>{profileData.bio != null ? profileData.bio : 'bio not added'}</p>

                                    {/* birth info */}
                                    <div className='flex items-center space-x-2'>
                                        <CakeIcon className="w-5 h-5 stroke-gray-500" />
                                        <p className='text-gray-500'>Born {profileData.birth_date != null ? profileData.birth_date : 'not added'}</p>
                                    </div>
                                </div>

                                {/* followers and following */}
                                <div className='flex space-x-4'>
                                    {/* followers */}
                                    <div>
                                        <div onClick={() => setIsFollowListActive({ ...isFollowListActive, ["followers"]: true })} className='flex space-x-2 cursor-pointer'>
                                            <p className='font-bold'>{profileData.followers != null ? profileData.followers : 0}</p>
                                            <p>Followers</p>
                                        </div>
                                        {isFollowListActive["followers"] && (
                                            <div className='absolute top-0 right-0 flex items-center justify-center w-screen h-screen'>
                                                <div onClick={() => setIsFollowListActive({ ...isFollowListActive, ["followers"]: false })} className='absolute top-0 left-0 z-40 flex items-center justify-center w-screen h-screen bg-black opacity-60'>
                                                </div>
                                                <div className='z-50 overflow-auto bg-white w-[80%] max-w-[350px] sm:h-[80%] rounded-lg '>
                                                    <ListHeader heading="Followers" />
                                                    <FollowList listType="follower" username={userData.user?.identities[0].identity_data.user_name} />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* following */}
                                    <div>
                                        <div onClick={() => setIsFollowListActive({ ...isFollowListActive, ["following"]: true })} className='flex space-x-2 cursor-pointer'>
                                            <p className='font-bold'>{profileData.following != null ? profileData.following : 0}</p>
                                            <p>Following</p>
                                        </div>
                                        {isFollowListActive["following"] && (
                                            <div className='absolute top-0 right-0 flex items-center justify-center w-screen h-screen'>
                                                <div onClick={() => setIsFollowListActive({ ...isFollowListActive, ["following"]: false })} className='absolute top-0 left-0 z-40 w-screen h-screen bg-black opacity-60'>
                                                </div>
                                                <div className='z-50 bg-white overflow-auto w-[80%] max-w-[350px] sm:h-[80%] rounded-md '>
                                                    <ListHeader heading="Following" />
                                                    <FollowList listType="following" username={userData.user?.identities[0].identity_data.user_name} />
                                                </div>
                                            </div>
                                        )}
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
                                <TweetsList requestFor="user" requestUser={id} />
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
                ) : (
                    <div className='flex justify-center mt-10'>
                        <LoadingIcon className="w-8 h-8 animate-spin" />
                    </div>
                )}
            </div>
        </div>
    )
}

export default Profile