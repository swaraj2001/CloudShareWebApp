import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { User } from 'lucide-react';
import { SLIDE_MENU_DATA } from '../assets/data';
import { useNavigate } from 'react-router-dom';
const SlideMenu = ({activeMenu}) => {
  const {user} = useUser();
  const navigate = useNavigate();
  return (
    <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50  p-5 sticky top-[61px] z-20">
      <div className="flex flex-col gap-2 items-center justify-center mt-3 mb-7 ">
        {user?.imageUrl ? (
          <img
            src={user.imageUrl || "" }
            alt="User Avatar" className="w-20 h-20 rounded-full gb_slate-400 " />
          ) : ( 
            <User className="w-20 h-20 rounded-full" />
          )}

        <h2 className="text-lg font-semibold text-gray-800">{user?.fullName || ""}</h2>
        
      </div>
      {SLIDE_MENU_DATA.map((item , index) => (
        <button key={`menu_${index}`} className={`flex items-center gap-4 w-full px-6 py-3 text-[15px] rounded-l-lg mb-3 hover:bg-gray-100 rounded-md transition-colors duration-200 cursor-pointer ${activeMenu == item.label ? 'bg-purple-500  text-white font-medium shadow-md hover:bg-purple-600 ' : 'hover:bg-gray-100 '}`}
        onClick={() => navigate(item.path)}>
          <item.icon className="text-xl" />
         {item.label}

        </button>
        )
        )}
    </div>
  );
}

export default SlideMenu;
