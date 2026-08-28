"use server"

import { redirect } from "next/navigation"

import { signOut } from "@/auth"

export async function signOutToLogin(): Promise<never> {
  await signOut({ redirectTo: "/sign-in" })
  redirect("/sign-in")
}
