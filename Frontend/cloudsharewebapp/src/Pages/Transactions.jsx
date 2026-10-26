import React, { useEffect, useState } from 'react';
import DashboardLayout from '../Layouts/DashboardLayout';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import apiEndpoints from '../Utils/apiEndpoints';
import { AlertCircle, Loader2, Receipt } from 'lucide-react';
const Transactions = () => {
  const [transactions , setTransations] = useState([]);
  const [loading , setLoading] = useState(false);
  const [error , setError] = useState(null);
  const {getToken} = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      try{
        setLoading(true);
        const token = await getToken();

        const response = await axios.get(apiEndpoints.GET_TRANSACTIONS, { 
          headers : {
            Authorization : `Bearer ${token}`,
          }
        });
        setTransations(response.data);
        setError(null);


      }catch (error){
        console.error("Error fetching transactions : " , error);
        setError("Error fetching transaction history. Please try again later.");
      }
      finally{
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [getToken]);

  const formatDate = (dateString) => {
    const options = {
      year : "numeric",
      month : "long",
      day : "numeric",
      hour : "2-digit",
      minute : "2-digit", 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  const formatAmount = (amountInPaise) => {
    return `₹${(amountInPaise / 100).toFixed(2)}`;

  }


  return (
     <DashboardLayout activeMenu="Transactions" >
     
       <div className="p-6">
        <div className="flex flex-center gap-2 mb-6">
          <Receipt className='text-blue-600' />
          <h1 className='text-2xl bold'>Transaction History</h1>
        </div>

          { error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
              <AlertCircle size={20} /> 
              <span>{error}</span>
            </div>
          ) }

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className='animate-spin mr-2' size={24} /> 
              <span>Loading Transactions</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="bg bg-gray-50 p-8 rounded-lg text-center">
              <Receipt size={48} className='mx-auto mb-4 text-gray-400' />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No Transactions yet.
              </h3>
              <p className="text-gray-500">
                You haven't made any credit purchases yet. Visit the subscriptions page to buy credits.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 border-b ">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount At</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits Added </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
               {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50"> 

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(transaction.transactionDate)}
                        </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.planId === "premium" ? "Premium Plan" 
                            : transaction.planId === "ultimate" ? "Ultimate Plan" 
                            : "Basic Plan"
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatAmount(transaction.amount)}
                        </td>

                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.creditsAdded}
                        </td>

                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.paymentId ? transaction.paymentId.substring(0 , 12) + "..." : "N/A" }
                        </td>



                  </tr>

               ))}
               
              </tbody>
            </table>
            </div>
          )} 

       </div>
    
    </DashboardLayout>
  );
}

export default Transactions;
