import React from 'react';


const Pricing = ({PricingPlans , openSignUp}) => {
  return (
    <div className='py-16 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <h2 className='text-3xl font-extrabold text-gray-900 sm:text-4xl'>
              Pricing Plans
            </h2>
            <p className='mt-4 max-w-2xl mx-auto text-xl text-gray-500'>
              Choose the plan that best fits your needs and start sharing files effortlessly.
            </p>
          </div>
         
          <div className='mt-16 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8 '>
            {PricingPlans.map((plan, index) => (
              <div key={index} className={`flex flex-col border border-gray-200 rounded-lg shadow-lg  hover:shadow-lg overflow-hidden transition-shadow duration-300 ${plan.popular ? 'border-2 border-purple-500 transform scale-105' : 'border border-gray-200 hover:transform hover:scale-105'}`}>
                <div className={`px-6 py-8 bg-white ${plan.popular ? 'bg-gradient-to-br from-purple-50 to-white' : ''} `}> 
                  <h3 className='text-2xl font-medium text-gray-900'>{plan.name}</h3>
                  {plan.popular && (
                    <span className='inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800'>Popular</span>
                  )}
                  <p className='mt-4 text-sm text-gray-500'>{plan.description}</p>
                  <div className='mt-6 flex items-baseline text-gray-900'>    
                    <span className='text-4xl font-extrabold tracking-tight'>{plan.currency}{plan.price}</span>
                    <span className='ml-1 text-4xl font-semibold'>{plan.period}</span>
                  </div>  
                  
                  <ul className='mt-6 space-y-6 rounded-md'>
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className='flex items-center'>
                        <svg className='h-5 w-5 text-green-500'  fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                        </svg>
                        <span className='ml-2 text-sm text-gray-500'>{feature}</span>
                      </li> 
                    ))}
                    <button onClick={()=>openSignUp()} className={`mt-6 w-full px-4 py-2 text-sm font-medium rounded-md ${plan.popular ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-white text-purple-900 hover:bg-purple-500 hover:text-white border border-purple-600 hover:border-transparent'}`}>
                    {plan.buttonText}
                  </button>   
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}

export default Pricing;
