import React from 'react'
import { useRouter } from 'next/router'


function SidebarRow({ Icon, title, url = null }) {
    let router = useRouter()

    return (
        <div onClick={() => router.push(url)} className='flex p-2 mx-2 space-x-4 transition-all rounded-full cursor-pointer max-w-fit duration-400 group hover:bg-gray-200'>
            <div className='transition-transform group-hover:scale-110'>
                {Icon}
            </div>
            <p className='hidden group-hover:text-twitter md:inline lg:text-lg'>{title}</p>
        </div>
    )
}

export default SidebarRow