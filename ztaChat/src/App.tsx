import "./App.css";
import { Routes, Route, Navigate } from "react-router";
import RootApp from "./components/RootApp";
import Auth from "./pages/Auth";
import AppAuthProvider from "./utils/AppAuthProvider";
import FriendRequests from "./pages/FriendRequests";
import Conversations from "./pages/Conversations";
import Home from "./pages/Home";

function App() {
  return (
    <AppAuthProvider>
      <div>
        <Routes>
          <Route path="/auth" element={<Auth />} />

          <Route path="/" element={<RootApp />}>
            <Route index element={<Navigate to="/auth" replace />} />
            <Route path="/home" element={<Home />} />
            <Route
              path="/chat"
              element={<div>Chat Component Placeholder</div>}
            />
            <Route path="/chat/:conversation_id" element={<Conversations />} />
            <Route path="/friend_requests" element={<FriendRequests />} />
          </Route>
        </Routes>
      </div>
    </AppAuthProvider>
  );
}

export default App;
