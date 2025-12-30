import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
import Search from "./pages/Search";
import PostItem from "./pages/PostItem";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import HowItWorks from "./pages/HowItWorks";
import SuccessStories from "./pages/SuccessStories";
import ItemDetails from "./pages/ItemDetails";
import MyFinds from "./pages/MyFinds";
import MyClaims from "./pages/MyClaims";
import Organizations from "./pages/Organizations";
import OrgAdmin from "./pages/OrgAdmin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<Search />} />
            <Route path="/post-item" element={<PostItem />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/my-finds" element={<MyFinds />} />
            <Route path="/my-claims" element={<MyClaims />} />
            <Route path="/organizations" element={<Organizations />} />
            <Route path="/org-admin/:orgId" element={<OrgAdmin />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/success-stories" element={<SuccessStories />} />
            <Route path="/item/:id" element={<ItemDetails />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
