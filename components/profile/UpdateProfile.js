import React, { useEffect, useState } from 'react'
import { supabase } from 'utils/supabase'
import { CancelIcon } from 'components/Icons'


function UpdateProfile({ profileData }) {
    // const [name, setName] = useState()
    const [bio, setBio] = useState()
    const [isValid, setIsValid] = useState()


    useEffect(() => {
        // setName(profileData.name)
        setBio(profileData.bio)
    }, [])

    // update user profile
    const updateUserProfile = async () => {
        setSaved(true)
        let { data, error } = await supabase
            .from("user_profiles")
            .update({
                bio: bio
            })
            .eq("id", profileData.id)
            .single()
    }

    // checking everytime chnages happen
    useEffect(() => {
        isUpdateValid()
    }, [bio])

    const isUpdateValid = () => {
        if (bio && bio != profileData.bio && bio != '') {
            setIsValid(true)
        } else {
            setIsValid(false)
        }
    }

    return (
        <div className='z-50 mt-20 overflow-auto overflow-x-hidden rounded-lg sm:mt-0 flex-rowspace-y-4'>
            <div className='rounded-lg bg-twitter flex-rowspace-y-4'>
                {/* header */}


                <div className='flex items-center sticky top-0 px-4 py-2 justify-between min-w-[300px] bg-black shadow-md bg-opacity-40 border-b'>
                    <div className='flex items-center space-x-2'>
                        <div >
                            <CancelIcon className="w-6 h-6 cursor-pointer stroke-2 stroke-white" />
                        </div>
                        <p className='font-semibold text-white'>Edit profile</p>
                    </div>
                    <button disabled={!isValid} onClick={updateUserProfile} className='px-4 py-1 font-bold bg-white rounded-full disabled:opacity-60'>Save</button>
                </div>

                {/* editable fields */}
                <div className='p-4 space-y-4'>
                    {/* name field */}
                    {/* <div className='p-2 border border-gray-200 rounded-md'>
                        {name && (
                            <p className='text-xs font-bold text-gray-100'>Name</p>
                        )}
                        <input onChange={(e) => setName(e.target.value)} type="text" value={name} placeholder='Name' className='w-full text-white placeholder-white bg-transparent outline-none' />
                    </div> */}

                    {/* bio field */}
                    <div className='p-2 border border-gray-200 rounded-md'>
                        {bio && (
                            <p className='text-xs font-bold text-gray-100'>Bio</p>
                        )}
                        <textarea onChange={(e) => setBio(e.target.value)} value={bio} maxLength={155} placeholder='Bio' className='w-full h-12 text-white placeholder-white bg-transparent outline-none resize-none' />
                    </div>
                </div>
            </div>

        </div>
    )
}

export default UpdateProfile