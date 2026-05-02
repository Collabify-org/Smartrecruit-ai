import { lsGet, lsSet, lsRemove } from "./storage";

export type User = { email: string; name: string };

export function getUser(): User | null {
  return lsGet<User | null>("user", null);
}
export function signIn(email: string, name?: string) {
  const u: User = { email, name: name || email.split("@")[0] };
  lsSet("user", u);
  return u;
}
export function signOut() {
  lsRemove("user");
}
export function isAuthed() {
  return !!getUser();
}
