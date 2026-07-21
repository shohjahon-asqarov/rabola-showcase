import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import AppLayout from "@/components/AppLayout";
import LandingPage from "./pages/LandingPage";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import AddPostPage from "./pages/AddPostPage";
import AdminPage from "./pages/AdminPage";
import GroupsPage from "./pages/GroupsPage";
import GroupDetailPage from "./pages/GroupDetailPage";
import CreateGroupPage from "./pages/CreateGroupPage";
import PostDetailPage from "./pages/PostDetailPage";
import NotificationsPage from "./pages/NotificationsPage";
import TopRatingPage from "./pages/TopRatingPage";
import WelcomePage from "./pages/WelcomePage";
import SitesPage from "./pages/SitesPage";
import TeachersPage from "./pages/TeachersPage";
import StatsPage from "./pages/StatsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Navbar />
            <AppLayout>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/feed" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/edit" element={<EditProfilePage />} />
                <Route path="/add-post" element={<AddPostPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/groups" element={<GroupsPage />} />
                <Route path="/groups/create" element={<CreateGroupPage />} />
                <Route path="/groups/:id" element={<GroupDetailPage />} />
                <Route path="/post/:id" element={<PostDetailPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/top" element={<TopRatingPage />} />
                <Route path="/sites" element={<SitesPage />} />
                <Route path="/teachers" element={<TeachersPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/welcome" element={<WelcomePage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
