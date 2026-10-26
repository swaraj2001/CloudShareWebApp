import { SignedIn, UserButton } from '@clerk/clerk-react'
import { X , Menu, Share2, Wallet } from 'lucide-react';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import SlideMenu from './SlideMenu';
import CreditsDisplay from './CreditsDisplay';
import { useContext } from 'react';
import UserCreditContext from '../Context/UserCreditContext';
const Navbar = ({activeMenu}) => {
    const [openSlideMenu, setOpenSlideMenu ] = useState(false);
    const {credits , fetchUserCredits} = useContext(UserCreditContext);

    useEffect(()=>{
      fetchUserCredits(); 
    }, [fetchUserCredits]);


  return (
    <div className="flex justify-between items-center gap-5 bg-white border-b border border-gray-200/50 backdrop-blur-[2px] py-4 px-4 sm:px-7 sticky top-0 z-30">
      {/* Left Side - Menu button and tittle */}
        <div className = "flex items-center gap-5">
            <button className="block lg:hidden text-black hover:bg-gray-100 p-2 rounded transition-colors" onClick={() => setOpenSlideMenu(!openSlideMenu)}>
                {
                  openSlideMenu ? (
                    <X className="text-2xl"></X>
                  ) :
                  (
                    <Menu className="text-2xl"></Menu>
                    )

                }
            </button>

              <div className="flex items-center gap-2">
                <Share2 className=" text-blue-600"></Share2>
                <span className="text-lg font-medium text-gray-800 truncate">Cloud Share</span> 
              </div>

        </div> 
       {/* Right  Side - Credits and user buttons  */   }
        <SignedIn>
          <div className="flex items-center gap-5">
          <Link to="/subscriptions" className="flex items-center gap-2 text-gray-800 hover:text-blue-600 transition-colors">
            {/* <Wallet className="text-gray-800"></Wallet> */}
            <CreditsDisplay credits = {credits}></CreditsDisplay>
          
          </Link>

            <div className="relative">
              <UserButton/>
            </div>
        </div>
        </SignedIn>

      {/* Mobile Side Menu */}
      {
        openSlideMenu && (
          <div className="fixed top-[73px] left-0 right-0  bg-white border-b border-gray-200 lg:hidden z-20">
            <div className="flex justify-between items-center mb-4"> <SlideMenu activeMenu={activeMenu}></SlideMenu> </div>
            </div>
      )}
    </div>
  );
}

export default Navbar;
