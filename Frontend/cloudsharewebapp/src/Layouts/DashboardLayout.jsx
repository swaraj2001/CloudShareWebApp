import { useUser } from '@clerk/clerk-react';

import React from 'react';
import Navbar from '../Components/Navbar'
import SlideMenu from '../Components/SlideMenu';
const DashboardLayout = ({children , activeMenu}) => {
    const { user } = useUser();
  return (
    <div>
       <Navbar activeMenu={activeMenu} />
        {
            user && (
                <div className="flex">
                    <div className="max-[1080px]:hidden">
                        {/* Sidebar Component */}
                      <SlideMenu activeMenu={activeMenu}></SlideMenu>
                    </div>
                    <div className="grow mx-4">
                        {children}
                    </div>
                </div>
            )
        }
    </div>
  );
}

export default DashboardLayout;
