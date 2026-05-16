import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { SignedIn, SignedOut, RedirectToSignIn, useAuth } from "@clerk/clerk-react"; // 👈 add useAuth
import { useEffect } from "react"; // 👈
import { setTokenGetter } from "./lib/api"; // 👈 adjust path if needed
import AppShell      from "./components/layout/AppShell";
import Dashboard     from "./pages/Dashboard";
import Invoices      from "./pages/Invoices";
import InvoiceDetail from "./pages/InvoiceDetail";
import NewInvoice    from "./pages/NewInvoice";
import EditInvoice   from "./pages/EditInvoice";
import Reminders     from "./pages/Reminders";
import Activity      from "./pages/Activity";
import NotFound      from "./pages/NotFound";
import Landing       from "./pages/LandingPage";

function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}

export default function App() {
  const { getToken } = useAuth(); // 👈

  useEffect(() => {
    setTokenGetter(getToken); // 👈 registers Clerk's getToken with your API client
  }, [getToken]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        expand={false}
        richColors={false}
        closeButton
        toastOptions={{ duration: 4000 }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index                         element={<Dashboard />} />
          <Route path="invoices"               element={<Invoices />} />
          <Route path="invoices/new"           element={<NewInvoice />} />
          <Route path="invoices/:id"           element={<InvoiceDetail />} />
          <Route path="invoices/:id/edit"      element={<EditInvoice />} />
          <Route path="reminders"              element={<Reminders />} />
          <Route path="activity"               element={<Activity />} />
          <Route path="404"                    element={<NotFound />} />
          <Route path="*"                      element={<Navigate to="/dashboard/404" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}