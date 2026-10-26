import React from 'react'
import HeroSection from '../Components/Landing/HeroSection'
import Features from '../Components/Landing/Features'
import Pricing from '../Components/Landing/Pricing'
import Testimonials from '../Components/Landing/Testimonials'
import CTA from '../Components/Landing/CTA'
import Footer from '../Components/Landing/Footer'
import { features } from '../assets/data'
import { pricingPlans as PricingPlans } from '../assets/PricingPlans'
import { testimonials} from '../assets/TestimonialsData'
import { useClerk, useUser } from '@clerk/clerk-react';
import { useNavigate  } from 'react-router-dom'
import { useEffect } from 'react';
const Landing = () => {
  const {openSignIn , openSignUp} = useClerk();
  const {isSignedIn} = useUser();
  const navigate = useNavigate();
  useEffect(()=>{
    if(isSignedIn){
      navigate('/dashboard');
    }
  }, [isSignedIn, navigate]);

  return (
    <div className='landing-page bg-gradient-to-b from-gray-50 to-gray-100'>
      {/* Hero Section */}
      <HeroSection openSignIn={openSignIn} openSignUp={openSignUp} />
      {/* Features Section */}
      <Features features={features} />   
      {/* Pricing Section */}
      <Pricing PricingPlans={PricingPlans} openSignUp={openSignUp} />
      {/* Testimonials Section */}
      <Testimonials testimonials={testimonials}/>
      {/* CTA Section */}
      <CTA openSignUp={openSignUp}/>      
      {/* Footer Section */}    
      <Footer/>
    </div>
  )
}

export default Landing
