import { LoadingIcon } from 'components/Icons'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { supabase } from 'utils/supabase'

function FollowList({ listType, username }) {

    const [list, setList] = useState()
    const [listData, setListData] = useState()

    const [dataLoading, setDataLoading] = useState()

    let router = useRouter()

    useEffect(() => {
        setDataLoading(true)
        getFollowList()
    }, [])

    // get user's follow list
    const getFollowList = async () => {

        // get followers list
        let { data, error } = await supabase
            .from("follow_list")
            .select("*")
            .match(listType === 'follower' ? {
                user: username,
            } : {
                followed_by: username,
            })

        if (data.length != 0) {
            let newList = []

            // creating list of user to get their profile data
            if (listType === "follower") {
                data.map(profile => {
                    console.log(profile.followed_by)
                    newList.push(profile.followed_by)
                })
                newList = newList.toString()

            } else {
                data.map(profile => {
                    console.log(profile.user)
                    newList.push(profile.user)
                })
                newList = newList.toString()
            }

            setList(newList)
        } else {
            setDataLoading(false)
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

        if (data) {
            setListData(data)
        }
        setDataLoading(false)

    }


    return (
        <div className='py-4'>

            {!dataLoading ? (
                <div>
                    {listData ? listData.map((user, index) => (
                        <div key={index} onClick={() => router.push(user.username)} className='flex p-2 space-x-4 border-b border-gray-300 cursor-pointer'>
                            <img className='w-10 h-10 rounded-full ' src={user.profile_img} alt="profile_img" />
                            <div className='flex justify-between w-full'>
                                <div className='space-y-1'>
                                    <div>
                                        <h1 className='font-bold'>{user.name}</h1>
                                        <p className='text-sm'>@{user.username}</p>
                                    </div>
                                    {/* <p>This is demo bio</p> */}
                                </div>
                                {/* <div>
                                    <button className='px-4 py-1 font-semibold text-white rounded-full bg-twitter'>Follow</button>
                                </div> */}
                            </div>
                        </div>
                    )) :
                        <p className='mt-4 text-center'>No accounts found</p>
                    }
                </div>
            ) :
                <LoadingIcon className="w-8 h-8 mx-auto mt-4 animate-spin" />
            }
        </div>
    )
}

export default FollowList