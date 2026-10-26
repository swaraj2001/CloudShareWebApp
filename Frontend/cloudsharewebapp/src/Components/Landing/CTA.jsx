import React from 'react';

const CTA = ({ openSignUp }) => {
  return (
    <div className='bg-purple-600'>
        <div className='max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:flex lg:items-center lg:justify-between lg:py-16 lg:px-8'>
            <h2 className='text-3xl font-extrabold tracking-tight text-white sm:text-4xl'>
                <span className='block'>Ready to dive in?</span>
                <span className='block text-purple-200'>Start your free trial today.</span>
            </h2>
            <div className='mt-8 flex lg:mt-0 lg:flex-shrink-0'>
                <div className='inline-flex rounded-md shadow'>
                    <button
                        onClick={()=>openSignUp()}
                        type='button'
                        className='inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-purple-600 bg-white hover:transform hover:scale-105' >
                        Sign up for free
                    </button>
                </div>
              </div>

        </div>

    </div>
  );
}

export default CTA;
