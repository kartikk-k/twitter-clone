import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { BackIcon, CakeIcon, LoadingIcon, CancelIcon } from './Icons'
import AuthContext from 'context/AuthContext'
import TweetsList from './tweet/TweetsList'
import { supabase } from 'utils/supabase'
import UpdateProfile from './profile/UpdateProfile'
import FollowList from './profile/FollowList'
import CommentsList from './comment/CommentsList'


function Profile({ id }) {
    const { isAuthenticated, userData } = useContext(AuthContext)
    let router = useRouter()

    // to track tab active tab
    const [activeTab, setActiveTab] = useState()
    const [profileData, setProfileData] = useState()
    const [editMode, setEditMode] = useState()
    const [isFollowListActive, setIsFollowListActive] = useState([])

    const [accountFollowStatus, setAccountFollowStatus] = useState()
    const [followId, setFollowId] = useState()

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


    useEffect(() => {
        if (!router.isReady) return
        if (!isAuthenticated) return

        checkFollow()
    }, [router])


    // check if the user is already followed
    const checkFollow = async () => {
        if(!isAuthenticated) return setAccountFollowStatus(false)

        // follow status can be checked from both follower_list and following_list table
        let { data, error } = await supabase
            .from("follow_list")
            .select("*")
            .match({
                user: id,
                followed_by: userData.user?.identities[0].identity_data.user_name,
            })
            .single()

        if (data) {
            setFollowId(data.id)
            setAccountFollowStatus(true)
            return
        }

        setAccountFollowStatus(false)
    }

    // follow account -- added in following list of logined user and followers list of active profile 
    const followAccount = async () => {
        if(!isAuthenticated) return

        // reflecting change in UI
        setAccountFollowStatus(true)

        // adding record in follow_list table
        let { data, error } = await supabase
            .from("follow_list")
            .insert([{
                user: id,
                followed_by: userData.user?.identities[0].identity_data.user_name
            }])
        
        if (!error) {   
            // updating count in user_profiles table
            let { data, error } = await supabase
            .rpc("follow_account", {
                follower_increase: id, 
                following_increase: userData.user?.identities[0].identity_data.user_name
            })
        } else {
            setAccountFollowStatus(false)
        }
    }

    // unfollow account
    const unfollowAccount = async () => {
        if(!isAuthenticated) return

        // reflecting change in UI
        setAccountFollowStatus(false)

        // adding record in follow_list table
        let { data, error } = await supabase
            .from("follow_list")
            .delete()
            .match({
                user: id,
                followed_by: userData.user?.identities[0].identity_data.user_name
            })
            .single()
        
        if (!error) {
            // updating follow numbers
            let { data, error } = await supabase
            .rpc("unfollow_account", {
                follower_decrease: id,
                following_decrease: userData.user?.identities[0].identity_data.user_name
            })
        } else {   
            setAccountFollowStatus(true)
        }
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
                                    <div>
                                        {accountFollowStatus ? (
                                            <button onClick={() => unfollowAccount()} className='px-4 py-2 font-bold text-black border rounded-full'>Following</button>
                                        ) : (
                                            <button onClick={() => followAccount()} className='px-4 py-2 font-bold text-white border rounded-full bg-twitter'>Follow</button>
                                        )}
                                    </div>

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
                                    {/* <div className='flex items-center space-x-2'>
                                        <CakeIcon className="w-5 h-5 stroke-gray-500" />
                                        <p className='text-gray-500'>Born {profileData.birth_date != null ? profileData.birth_date : 'not added'}</p>
                                    </div> */}
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
                                                    <FollowList listType="follower" username={id} />
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
                                                    <FollowList listType="following" username={id} />
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
                                    <CommentsList requestFor='user' username={id} />
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



// -- follow account
// create function follow_account(follower_increase text, following_increase text) 
// returns void as
// $$
//   -- follower increase
//   update  user_profiles
//   set followers = followers + 1
//   where username = follower_increase;

//   -- following increase
//   update user_profiles
//   set following = following + 1
//   where username = following_increase;
  
// $$ 
// language sql volatile;


// -- unfollow account
// create function unfollow_account(follower_decrease text, following_decrease text) 
// returns void as
// $$
//   -- follower decrease
//   update  user_profiles
//   set followers = followers - 1
//   where username = follower_decrease;

//   -- following decrease
//   update user_profiles
//   set following = following - 1
//   where username = following_decrease;
  
// $$ 
// language sql volatile;