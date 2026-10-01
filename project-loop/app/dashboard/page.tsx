// import { redirect } from "next/navigation";
// import LoopDashboard from "./LoopDashboard";
// import { getCurrentUser } from "@/lib/current-user";

// export default async function DashboardPage() {
//   const user = await getCurrentUser();

//   if (!user) {
//     redirect("/auth/login");
//   }

//   const displayName = user.name?.trim() || user.email.split("@")[0] || "there";

//   return (
//     <LoopDashboard
//       userName={displayName}
//       workspaceName={user.workspace.name}
//     />
//   );
// }

import { redirect } from "next/navigation";
import LoopDashboard from "./LoopDashboard";
import { getCurrentUser } from "@/lib/current-user";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const displayName =
    user.name?.trim() || user.email.split("@")[0] || "there";

  return (
    <LoopDashboard
      userName={displayName}
      userRole={user.role}
      workspaceName={user.workspace.name}
    />
  );
}