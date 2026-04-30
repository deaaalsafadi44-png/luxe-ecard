import { redirect } from "next/navigation";

/** Invitation creation is done from the couple portal after sign-up. */
export default function AdminDeprecatedRedirect() {
  redirect("/couple/login");
}
