import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Landing from './Pages/Landing'
import Dashboard from './Pages/Dashboard'
import Upload from './Pages/Upload'
import MyFiles from './Pages/MyFiles'
import PublicFileView from './Pages/PublicFileView'
import Subscription from './Pages/Subscription'
import Transactions from './Pages/Transactions'
import { RedirectToSignIn, SignedIn , SignedOut } from '@clerk/clerk-react'
import { Toaster } from 'react-hot-toast'
import { UserCreditsProvider } from './Context/UserCreditContext'

const App = () => {
  return (
    <UserCreditsProvider>

    
      <BrowserRouter>
      <Toaster/>
        <Routes>
          <Route path="/" element={<Landing/>} />
          <Route path="/dashboard" element={
            <>
              <SignedIn><Dashboard/></SignedIn>
              <SignedOut> <RedirectToSignIn/> </SignedOut>
            </>
          } />
          <Route path="/upload" element={
            <>
              <SignedIn><Upload/></SignedIn>
              <SignedOut> <RedirectToSignIn/> </SignedOut>
            </>
            } />
          <Route path="/my-files" element={
            <>
              <SignedIn><MyFiles/></SignedIn>
              <SignedOut> <RedirectToSignIn/> </SignedOut>
            </>
          } />  
            <Route path="/subscriptions" element={
            <>
              <SignedIn><Subscription/></SignedIn>
              <SignedOut> <RedirectToSignIn/> </SignedOut>
            </>
            } />
            <Route path="/transactions" element={
              <>
              <SignedIn><Transactions/></SignedIn>
              <SignedOut> <RedirectToSignIn/> </SignedOut>
            </>
            } />
            <Route
                path="/files/:fileId"
                element={<PublicFileView />}
              />
            
            {/* <Route path="/*" element={<RedirectToSignIn/>} /> */}
        </Routes>
      </BrowserRouter>
     </UserCreditsProvider>
  )
}

export default App
