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
  ForgotPassword,
  AdminLogin,
  AdminDashboard,
  AdminUsers,
  MapScreen
} from "./screens/";
import { logger } from "./utils/logger";
import { SocketDataContext } from "./contexts/SocketContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useEffect, useContext } from "react";

import PageTransition from "./components/transitions/PageTransition";

function App() {
  return (
    <ThemeProvider>
      <div className="w-full min-h-dvh bg-white">
        <div className="relative w-full min-h-full overflow-y-auto">


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

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />

              {/* Map Routes */}
              <Route path="/map" element={<MapScreen />} />

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