import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import {
  GetStarted,
  UserLogin,
  CaptainLogin,
  UserHomeScreen,
  CaptainHomeScreen,
  UserProtectedWrapper,
  CaptainProtectedWrapper,
  UserSignup,
  CaptainSignup,
  Login,
  Signup,
  RideHistory,
  UserEditProfile,
  CaptainEditProfile,
  Error,
  ChatScreen,
  VerifyEmail,
  ResetPassword,
  ForgotPassword
} from "./screens/";
import { logger } from "./utils/logger";
import { SocketDataContext } from "./contexts/SocketContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useEffect, useContext } from "react";
import { ChevronLeft, Trash2 } from "lucide-react";
import PageTransition from "./components/transitions/PageTransition";

function App() {
  return (
    <ThemeProvider>
      <div className="w-full h-dvh flex items-center">
        <div className="relative w-full sm:min-w-96 sm:w-96 h-full bg-white overflow-hidden">
        {/* Force Reset Button to clear data */}
        <div className="absolute top-36 -right-11 opacity-20 hover:opacity-100 z-50 flex items-center p-1 PL-0 gap-1 bg-zinc-50 border-2 border-r-0 border-gray-300 hover:-translate-x-11 rounded-l-md transition-all duration-300">
          <ChevronLeft />
          <button className="flex justify-center items-center w-10 h-10 rounded-lg border-2 border-red-300 bg-red-200 text-red-500" onClick={() => {
            alert("This will clear all your data and log you out to fix the app in case it got corrupted. Please confirm to proceed.");
            const confirmation = confirm("Are you sure you want to reset the app?")

            if (confirmation === true) {
              localStorage.clear();
              window.location.reload();
            }
          }}>
            <Trash2 strokeWidth={1.8} width={18} />
          </button>
        </div>

        <BrowserRouter>
          <LoggingWrapper />
          <PageTransition className="w-full h-full">
            <Routes>
              <Route path="/" element={<GetStarted />} />
              <Route
                path="/home"
                element={
                  <UserProtectedWrapper>
                    <UserHomeScreen />
                  </UserProtectedWrapper>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              {/* Legacy routes for backward compatibility */}
              <Route path="/user/login" element={<UserLogin />} />
              <Route path="/user/signup" element={<UserSignup />} />
              <Route
                path="/user/edit-profile"
                element={
                  <UserProtectedWrapper>
                    <UserEditProfile />
                  </UserProtectedWrapper>
                }
              />
              <Route
                path="/user/rides"
                element={
                  <UserProtectedWrapper>
                    <RideHistory />
                  </UserProtectedWrapper>
                }
              />

              <Route
                path="/captain/home"
                element={
                  <CaptainProtectedWrapper>
                    <CaptainHomeScreen />
                  </CaptainProtectedWrapper>
                }
              />
              <Route path="/captain/login" element={<CaptainLogin />} />
              <Route path="/captain/signup" element={<CaptainSignup />} />
              <Route
                path="/captain/edit-profile"
                element={
                  <CaptainProtectedWrapper>
                    <CaptainEditProfile />
                  </CaptainProtectedWrapper>
                }
              />
              <Route
                path="/captain/rides"
                element={
                  <CaptainProtectedWrapper>
                    <RideHistory />
                  </CaptainProtectedWrapper>
                }
              />
              <Route path="/:userType/chat/:rideId" element={<ChatScreen />} />
              <Route path="/:userType/verify-email/" element={<VerifyEmail />} />
              <Route path="/:userType/forgot-password/" element={<ForgotPassword />} />
              <Route path="/:userType/reset-password/" element={<ResetPassword />} />

              <Route path="*" element={<Error />} />
            </Routes>
          </PageTransition>
        </BrowserRouter>
      </div>
      
    </div> 
    </ThemeProvider>
  );
}

export default App;

function LoggingWrapper() {
  const location = useLocation();
  const { socket } = useContext(SocketDataContext);

  useEffect(() => {
    if (socket) {
      logger(socket);
    }
  }, [location.pathname, location.search]);
  return null;
}