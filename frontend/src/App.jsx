import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

import AppShell      from "./components/layout/AppShell";
import Dashboard     from "./pages/Dashboard";
import Invoices      from "./pages/Invoices";
import InvoiceDetail from "./pages/InvoiceDetail";
import NewInvoice    from "./pages/NewInvoice";
import EditInvoice   from "./pages/EditInvoice";
import Reminders     from "./pages/Reminders";
import Activity      from "./pages/Activity";
import NotFound      from "./pages/NotFound";

// Wrap any route that requires auth
function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}

export default function App() {
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
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index                    element={<Dashboard />} />
          <Route path="invoices"          element={<Invoices />} />
          <Route path="invoices/new"      element={<NewInvoice />} />
          <Route path="invoices/:id"      element={<InvoiceDetail />} />
          <Route path="invoices/:id/edit" element={<EditInvoice />} />
          <Route path="reminders"         element={<Reminders />} />
          <Route path="activity"          element={<Activity />} />
          <Route path="404"               element={<NotFound />} />
          <Route path="*"                 element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}