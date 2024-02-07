import React from 'react'
import MaxWidthWrapper from './MaxWidthWrapper'
import Link from 'next/link'
import { buttonVariants } from './ui/button'
import
{
    LoginLink,
    RegisterLink,
    getKindeServerSession,
} from '@kinde-oss/kinde-auth-nextjs/server'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

import UserAccountNav from './UserAccountNav';

const Navbar = () =>
{
    const { getUser } = getKindeServerSession()
    const user = getUser()
    
    return (
        <nav className='sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all'>
            <MaxWidthWrapper>
                <div className='flex h-14 items-center justify-between border-b border-zinc-200'>
                    <div className="flex flex-row justify-items-start items-center">
                        <Image
                            src='/bot-head.png'
                            alt='Robo'
                            width={ 0 }
                            height={ 0 }
                            sizes="80vw"
                            quality={ 100 }
                            style={ { width: '15%', height: 'auto' } }
                            className='p-2 sm:p-8 md:p-14'
                        />
                        <Link
                            href='/'
                            className='flex z-40 font-semibold'>
                            PDFAssistantX.
                        </Link>
                    </div>

                    { /*todo: add mobile navbar*/ }

                    <div className='hidden items-center space-x-4 sm:flex'>
                        { !user ? (
                            <>
                                {/* <Link
                                    href='/pricing'
                                    className={ buttonVariants( {
                                        variant: 'ghost',
                                        size: 'sm',
                                    } ) }>
                                    Pricing
                                </Link> */}
                                <LoginLink
                                    className={ buttonVariants( {
                                        variant: 'ghost',
                                        size: 'sm',
                                    } ) }>
                                    SignIn
                                </LoginLink>
                                {/* <RegisterLink
                                    className={ buttonVariants( {
                                        size: 'lg',
                                    } ) }>
                                    Get started
                                    <ArrowRight className='ml-1.5 h-5 w-8' />
                                </RegisterLink> */}
                            </>
                        ) : (
                            <>
                                <Link
                                    href='/dashboard'
                                    className={ buttonVariants( {
                                        variant: 'ghost',
                                        size: 'sm',
                                    } ) }>
                                    Dashboard
                                </Link>

                                <UserAccountNav
                                    name={
                                        !user.given_name || !user.family_name
                                            ? 'Your Account'
                                            : `${ user.given_name } ${ user.family_name }`
                                    }
                                    email={ user.email ?? '' }
                                    imageUrl={ user.picture ?? '' }
                                />
                            </>
                        ) }
                    </div>

                </div>
            </MaxWidthWrapper>
        </nav>
    )
}

export default Navbar