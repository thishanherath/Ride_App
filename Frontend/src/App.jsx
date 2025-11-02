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
  LazyRideHistory,
  UserEditProfile,
  CaptainEditProfile,
  Error,
  ChatScreen,
  VerifyEmail,
  ResetPassword,
  ForgotPassword,

  AdminDashboard,
  AdminUsers,
  AdminCaptains,
  MapScreen,
  PaymentMethods,
  PaymentHistory,
  Notifications,
  Messages,
  RateApp,
  Support
} from "./screens/";
import { logger } from "./utils/logger";
import { SocketDataContext } from "./contexts/SocketContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import UserContext from "./contexts/UserContext";
import { useEffect, useContext } from "react";

import PageTransition from "./components/transitions/PageTransition";

function App() {
  return (
    <ThemeProvider>
      <UserContext>
        <div className="w-full min-h-dvh bg-white">
          <div className="relative w-full min-h-full overflow-y-auto">

          <BrowserRouter>
          <LoggingWrapper />
          {/* Temporarily disabled PageTransition to fix navigation issue */}
          <div className="w-full h-full">
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
                    <LazyRideHistory />
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
                    <LazyRideHistory />
                  </CaptainProtectedWrapper>
                }
              />
              <Route path="/:userType/chat/:rideId" element={<ChatScreen />} />
              <Route path="/:userType/verify-email/" element={<VerifyEmail />} />
              <Route path="/:userType/forgot-password/" element={<ForgotPassword />} />
              <Route path="/:userType/reset-password/" element={<ResetPassword />} />

              {/* Admin Routes - No separate login needed, use unified /login */}
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/captains" element={<AdminCaptains />} />

              {/* Payment Routes */}
              <Route
                path="/user/payment"
                element={
                  <UserProtectedWrapper>
                    <PaymentMethods />
                  </UserProtectedWrapper>
                }
              />
              <Route
                path="/captain/payment"
                element={
                  <CaptainProtectedWrapper>
                    <PaymentMethods />
                  </CaptainProtectedWrapper>
                }
              />
              <Route
                path="/user/payment-history"
                element={
                  <UserProtectedWrapper>
                    <PaymentHistory />
                  </UserProtectedWrapper>
                }
              />
              <Route
                path="/captain/payment-history"
                element={
                  <CaptainProtectedWrapper>
                    <PaymentHistory />
                  </CaptainProtectedWrapper>
                }
              />

              {/* Notification Routes */}
              <Route
                path="/user/notifications"
                element={
                  <UserProtectedWrapper>
                    <Notifications />
                  </UserProtectedWrapper>
                }
              />
              <Route
                path="/captain/notifications"
                element={
                  <CaptainProtectedWrapper>
                    <Notifications />
                  </CaptainProtectedWrapper>
                }
              />

              {/* Message Routes */}
              <Route
                path="/user/chat"
                element={
                  <UserProtectedWrapper>
                    <Messages />
                  </UserProtectedWrapper>
                }
              />
              <Route
                path="/captain/chat"
                element={
                  <CaptainProtectedWrapper>
                    <Messages />
                  </CaptainProtectedWrapper>
                }
              />

              {/* Rating Routes */}
              <Route path="/rate-app" element={<RateApp />} />

              {/* Support Routes */}
              <Route path="/support" element={<Support />} />

              {/* Map Routes */}
              <Route path="/map" element={<MapScreen />} />

              <Route path="*" element={<Error />} />
            </Routes>
          </div>
        </BrowserRouter>
        </div>
      </div>
      </UserContext>
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