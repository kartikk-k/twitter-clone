import { LoadingIcon } from 'components/Icons'
import React, { useEffect, useState } from 'react'
import { supabase } from 'utils/supabase'

function FollowList({ listType, username }) {

    const [list, setList] = useState()
    const [listData, setListData] = useState()


    useEffect(() => {
        getFollowList()
    }, [])

    // get user's follow list
    const getFollowList = async () => {
        let { data, error } = await supabase
            .from(`${listType}_list`)
            .select(listType === 'follower' ? 'followed_by' : 'following_to')
            .eq("user", username)

        if (data) {
            let newList = []
            // mapping through data to get array of followers/following users
            data.map(item => {
                newList.push(listType === 'follower' ? item.followed_by : item.following_to)
            })
            setList(newList.toString())
        }

    }

    // to get list data once list is fetched
    useEffect(() => {
        if (!list) return

        getFollowListData()
    }, [list])

    // get list user data from user profiles table
    const getFollowListData = async () => {

        let { data, error } = await supabase
            .from("user_profiles")
            .select("*")
            .filter("username", "in", `(${list})`)

        if (data) setListData(data)
    }


    return (
        <div className='py-4'>
            <div className='flex p-2 space-x-4 border-b border-gray-300'>
                <img className='w-10 h-10 rounded-full ' src="https://pbs.twimg.com/profile_images/1482104678976753665/OsgSEJKk_normal.jpg" alt="profile_img" />
                <div className='flex justify-between w-full'>
                    <div className='space-y-1'>
                        <div>
                            <h1 className='font-bold'>Kartik K</h1>
                            <p className='text-sm'>@kartik_k1212</p>
                        </div>
                        <p>This is demo bio</p>
                    </div>

                    {/* ***** updating button behaviour using conditions ***** */}
                    <div>
                        <button className='px-4 py-1 font-semibold text-white rounded-full bg-twitter'>Follow</button>
                    </div>
                </div>
            </div>


            {listData ? listData.map((user, index) => (
                <div key={index} className='flex p-2 space-x-4 border-b border-gray-300'>
                    <img className='w-10 h-10 rounded-full ' src={user.profile_img} alt="profile_img" />
                    <div className='flex justify-between w-full'>
                        <div className='space-y-1'>
                            <div>
                                <h1 className='font-bold'>{user.name}</h1>
                                <p className='text-sm'>@{user.username}</p>
                            </div>
                            <p>This is demo bio</p>
                        </div>
                        <div>
                            <button className='px-4 py-1 font-semibold text-white rounded-full bg-twitter'>Follow</button>
                        </div>
                    </div>
                </div>
            )) :
                <LoadingIcon className="w-8 h-8 mx-auto mt-4 animate-spin" />
            }
        </div>
    )
}

export default FollowList