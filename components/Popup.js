import React, { useEffect, useState } from 'react'
import { CancelIcon } from './Icons'

function Popup({ message }) {
    const [isOpen, setIsOpen] = useState(true)

    useEffect(() => {
        if (isOpen) {
            popup()
        }

        // closing
        let timeout = setTimeout(setIsOpen(false), 4000)
        clearTimeout(timeout)
    }, [])

    const popup = () => {
        return (
            <div className='fixed px-4 py-2 bg-green-300 rounded-md flex justify-between items-center min-w-[200px] top-5 right-5'>
                <p>{message}</p>
                <CancelIcon className="stroke-green-700" />
            </div>
        )
    }

    // return (
    //     // <div className='fixed px-4 py-2 bg-green-300 rounded-md flex justify-between items-center min-w-[200px] top-5 right-5'>
    //     //     <p>{message}</p>
    //     //     <CancelIcon className="stroke-green-700" />
    //     // </div>
    // )
}

export default Popup