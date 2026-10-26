
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import React, {
    createContext,
    useCallback,
    useEffect,
    useState
} from 'react';

import apiEndpoints from '../Utils/apiEndpoints';
import toast from 'react-hot-toast';

export const UserCreditContext = createContext();

export const UserCreditsProvider = ({ children }) => {

    const [credits, setCredits] = useState(5);
    const [loading, setLoading] = useState(false);

    // useAuth() returns an object, so use object destructuring
    const { getToken, isSignedIn } = useAuth();

    // Function to fetch user credits
    const fetchUserCredits = useCallback(async () => {

        if (!isSignedIn) {
            return;
        }

        setLoading(true);

        try {
            const token = await getToken();

            const response = await axios.get(
                apiEndpoints.GET_CREDITS,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

           if(response.status === 200){
             setCredits(response.data.credits);
           }else{
            toast.error("Unable to load credits");
           }

        } catch (error) {
            console.error(
                "Error fetching User credits",
                error
            );
        } finally {
            setLoading(false);
        }

    }, [getToken, isSignedIn]);

    

    useEffect(() => {
        if(isSignedIn){
            fetchUserCredits();
        }
    }, [fetchUserCredits , isSignedIn]);

    const updateCredits = useCallback(newCredits => {
        console.log("Updating the credits" , newCredits);
        setCredits(newCredits);
    }, [])

    const contextValue = {
        credits,
        setCredits,
        fetchUserCredits,
        updateCredits,
    }

    return (

        <UserCreditContext.Provider value={contextValue}>
            {children}
        </UserCreditContext.Provider>
    );
};

export default UserCreditContext;
