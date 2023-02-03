import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import Sidebar from 'components/Sidebar'
import Feed from 'components/Feed'
import Widgets from 'components/Widgets'
import { useContext } from 'react'
import AuthContext from 'context/AuthContext'
import LoginFooter from 'components/LoginFooter'


export default function Home() {
  const { isAuthenticated } = useContext(AuthContext)

  return (

    <>
      <div className='max-h-screen mx-auto overflow-hidden max-w-7xl'>
        <Head>
          <title>Twitter</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className='grid grid-cols-9 divide-x divide-gray-200'>
          {/* sidebar */}
          <Sidebar />

          {/* Feed */}
          <Feed />

          {/* Widgets */}
          <Widgets />

          {/* login with twitter */}
          {!isAuthenticated && (
            <LoginFooter />
          )}

        </main>
      </div>
    </>
  )
}
