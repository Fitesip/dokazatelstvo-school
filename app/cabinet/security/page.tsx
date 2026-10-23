import { PageTitle } from "@/components/cabinet/Shell";
import { requireUser } from "@/lib/session";
import { ChangePassword, TwoFactorSettings } from "./SecurityForms";

export default async function SecurityPage() {
  const { user } = await requireUser("/cabinet/security");
  return (
    <>
      <PageTitle subtitle={user.email}>Безопасность</PageTitle>
      <TwoFactorSettings enabled={!!user.twoFactorEnabled} />
      <ChangePassword />
    </>
  );
}
