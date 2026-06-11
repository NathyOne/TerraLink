import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRequestDetail from "./pages/admin/AdminRequestDetail";
import AllRequests from "./pages/admin/AllRequests";
import Assignments from "./pages/admin/Assignments";
import MachineMatching from "./pages/admin/MachineMatching";
import MachinesManagement from "./pages/admin/MachinesManagement";
import Materials from "./pages/admin/Materials";
import SendMessage from "./pages/admin/SendMessage";
import UsersManagement from "./pages/admin/UsersManagement";
import Landing from "./pages/auth/Landing";
import Login from "./pages/auth/Login";
import NotFound from "./pages/auth/NotFound";
import Register from "./pages/auth/Register";
import ConstructionDashboard from "./pages/construction/ConstructionDashboard";
import MyRequests from "./pages/construction/MyRequests";
import ConstructionRequestDetail from "./pages/construction/RequestDetail";
import SubmitRequest from "./pages/construction/SubmitRequest";
import MachineDashboard from "./pages/machine/MachineDashboard";
import MachineForm from "./pages/machine/MachineForm";
import Messages from "./pages/machine/Messages";
import MyMachines from "./pages/machine/MyMachines";
import Profile from "./pages/machine/Profile";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route element={<Layout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/requests" element={<AllRequests />} />
          <Route path="/admin/requests/:id" element={<AdminRequestDetail />} />
          <Route path="/admin/matching" element={<MachineMatching />} />
          <Route path="/admin/users" element={<UsersManagement />} />
          <Route path="/admin/machines" element={<MachinesManagement />} />
          <Route path="/admin/assignments" element={<Assignments />} />
          <Route path="/admin/materials" element={<Materials />} />
          <Route path="/admin/send-message" element={<SendMessage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["construction_owner"]} />}>
        <Route element={<Layout />}>
          <Route path="/construction" element={<ConstructionDashboard />} />
          <Route path="/construction/requests" element={<MyRequests />} />
          <Route path="/construction/requests/new" element={<SubmitRequest />} />
          <Route path="/construction/requests/:id" element={<ConstructionRequestDetail />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["machine_owner"]} />}>
        <Route element={<Layout />}>
          <Route path="/machine" element={<MachineDashboard />} />
          <Route path="/machine/machines" element={<MyMachines />} />
          <Route path="/machine/machines/new" element={<MachineForm />} />
          <Route path="/machine/messages" element={<Messages />} />
          <Route path="/machine/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="/dashboard" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
