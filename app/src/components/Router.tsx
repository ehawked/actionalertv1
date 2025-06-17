import { Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut } from "@/auth/AuthProvider";
import LegislationList from "./LegislationList";
import LegislationDetail from "./LegislationDetail";
import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";
import LandingPage from "./LandingPage";

export default function Router() {
  return (
    <>
      <SignedOut>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/legislation" element={<LegislationList />} />
          <Route path="/legislation/:id" element={<LegislationDetail />} />
        </Routes>
      </SignedOut>
      <SignedIn>
        <Routes>
          <Route path="/" element={<LegislationList />} />
          <Route path="/legislation" element={<LegislationList />} />
          <Route path="/legislation/:id" element={<LegislationDetail />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </SignedIn>
    </>
  );
}