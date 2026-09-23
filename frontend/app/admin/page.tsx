import { redirect } from "next/navigation";

// Short address for staff: /admin -> the dashboard (or the login page first).
export default function AdminShortcut() {
  redirect("/admindashboard");
}
