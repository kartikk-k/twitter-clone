import React, { useEffect, useState } from 'react'
import { supabase } from 'utils/supabase'
import { CancelIcon } from 'components/Icons'


function UpdateProfile({ profileData }) {
    const [name, setName] = useState()
    const [bio, setBio] = useState()

    const [birthDay, setBirthDay] = useState()
    const [birthMonth, setBirthMonth] = useState()
    const [birthYear, setBirthYear] = useState()
    const [isValid, setIsValid] = useState()

    useEffect(() => {
        setName(profileData.name)
        setBio(profileData.bio)
    }, [])

    // update user profile if 
    const updateUserProfile = async () => {
        let { data, error } = await supabase
            .from("user_profiles")
            .update([{

            }])
            .eq("id", profileData.id)
            .single()
    }

    const isUpdateValid = () => {
        if (!name) setIsValid(false)
        if (birthDay.parseInt > 31) setIsValid(false)
        if (birthYear.parseInt > 2010 || birthYear.parseInt <= 1910) setIsValid(false)
    }

    return (
        <div className='z-50 overflow-x-hidden max-h-[350px] mt-20 sm:mt-0 overflow-auto rounded-lg bg-twitter flex-rowspace-y-4'>
            {/* header */}
            <div className='flex items-center sticky top-0 px-4 py-2 justify-between min-w-[300px] bg-black bg-opacity-40 backdrop-blur-md'>
                <div className='flex items-center space-x-2'>
                    <div >
                        <CancelIcon className="w-6 h-6 cursor-pointer stroke-2 stroke-white" />
                    </div>
                    <p className='font-semibold text-white'>Edit profile</p>
                </div>
                <button disabled={!isValid} className='px-4 py-1 font-bold bg-white rounded-full disabled:opacity-60'>Save</button>
            </div>

            {/* editable fields */}
            <div className='p-4 space-y-4'>
                {/* name field */}
                <div className='p-2 border border-gray-200 rounded-md'>
                    {name && (
                        <p className='text-xs font-bold text-gray-100'>Name</p>
                    )}
                    <input onChange={(e) => setName(e.target.value)} type="text" value={name} placeholder='Name' className='w-full text-white placeholder-white bg-transparent outline-none' />
                </div>

                {/* bio field */}
                <div className='p-2 border border-gray-200 rounded-md'>
                    {bio && (
                        <p className='text-xs font-bold text-gray-100'>Bio</p>
                    )}
                    <textarea onChange={(e) => setBio(e.target.value)} value={bio} maxLength={155} placeholder='Bio' className='w-full h-12 text-white placeholder-white bg-transparent outline-none resize-none' />
                    {/* <p>limit: {bio.}/155</p> */}
                </div>

                {/* birthday field */}
                <div className='p-2 border border-gray-200 rounded-md'>
                    <p className='text-xs font-bold text-gray-100'>Birthdate</p>

                    <div className='flex justify-between'>
                        {/* date */}
                        <div className='flex-row'>
                            <p className='text-center text-white'>Day</p>
                            <input type="text" inputMode='numeric' maxLength={2} value={birthDay} onChange={(e) => setBirthDay(e.target.value)} className="max-w-[25px] bg-white rounded-md text-center bg-opacity-50 focus:outline-none" />
                        </div>

                        {/* month */}
                        <div className='flex-row'>
                            <p className='text-center text-white'>Month</p>
                            <select className='bg-white bg-opacity-50 rounded-md focus:outline-none' value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} id="cars" name="carlist" form="carform">
                                <option value="Jan">Jan</option>
                                <option value="Feb">Feb</option>
                                <option value="Mar">Mar</option>
                                <option value="Apr">Apr</option>
                                <option value="May">May</option>
                                <option value="Jun">Jun</option>
                                <option value="Jul">Jul</option>
                                <option value="Aug">Aug</option>
                                <option value="Sep">Sep</option>
                                <option value="Oct">Oct</option>
                                <option value="Nov">Nov</option>
                                <option value="Dec">Dec</option>
                            </select>
                        </div>

                        {/* year */}
                        <div className='flex-row'>
                            <p className='text-center text-white'>Year</p>
                            <input value={birthYear} onChange={(e) => setBirthYear(e.target.value)} type="text" maxLength={4} className="max-w-[50px] bg-white rounded-md text-center bg-opacity-50 focus:outline-none" />
                        </div>
                    </div>
                </div>


            </div>

        </div>
    )
}

export default UpdateProfile