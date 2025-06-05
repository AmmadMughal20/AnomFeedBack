'use client'
import { Button } from '@/components/ui/button'
import { User } from 'next-auth'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

const Navbar = () =>
{
    const { data: session } = useSession()

    const user: User = session?.user as User

    return (
        <nav className='p-4 md:p-6 shadow-md'>
            <div className='container mx-auto flex flex-col md:flex-row items-center justify-between'>
                <Link href='/' className='text-xl font-bold mb-4 md:mb:0'>Mystry Message</Link>
                {
                    session ? (<span className='mr-4'>
                        Welcome, {user.name || user.email}!
                        <Button onClick={() => signOut()} variant='outline' size='sm' className='w-full md:w-auto'>
                            Sign Out
                        </Button>
                    </span>) : (
                        <Link href='/sign-in' className='w-full md:w-auto'>
                            <Button>
                                Login
                            </Button>
                        </Link>
                    )
                }
            </div>
        </nav>
    )
}

export default Navbar