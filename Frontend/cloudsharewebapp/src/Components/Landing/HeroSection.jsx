import React from 'react';
import assets from '../../assets/assets'
const HeroSection = ({ openSignIn, openSignUp }) => {
  return (
    <div>
      <div className='landing-page-content relative'>
        <div className='absolute inset-0 bg-gradient-to-r from-purple-50 to-indigo-50 opacity-80 z-0 pointer-events-none'></div>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 '>
          <div className='pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-28'>
                <div className='text-center'>
                    <h1 className='text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl'>
                       <span className='block'>Share Files Securely with </span>   
                       <span className='block text-indigo-600'>CloudShare</span>
                    </h1>
                    <p className='mt-4 max-w-md mx-auto text- text-lg leading-6 text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl'>
                        Experience the ultimate file sharing solution with CloudShare. Share files securely and effortlessly with our user-friendly platform.
                    </p>
                    <div className='mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center '>
                        <div className='space-y-4 sm:space-y-0 sm:space-x-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5'>
                            <button onClick={()=> openSignUp()} className='px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-500 hover:bg-purple-600 md:px-10 md:py-4 md:text-lg transition-all duration-200 shadow-lg hover:shadow-xl'>
                                Get started
                            </button>
                              <button onClick={()=> openSignIn()} className='px-6 py-3 border border-transparent text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 md:px-10 md:py-4 md:text-lg transition-all duration-200 shadow-lg hover:shadow-xl'>
                                Sign In
                            </button>
                        </div>

                    </div>
                </div>
          </div>
          <div className='relative'>
            <div className='aspect-w-16 rounded-lg overflow-hidden shadow-xl '>
                <img src={assets.dashboard} className='w-full h-full object-cover' alt="CloudShare Dashboard" />
            </div>
            <div className='absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-10 rounded-lg'></div>
          </div>
          <div className='mt-8 text-center'>
            <p className='mt-4 text-base text-gray-500'>
                All your files, accessible anywhere, anytime. CloudShare makes file sharing simple and secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
