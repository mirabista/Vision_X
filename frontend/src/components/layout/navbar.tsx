"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { NavbarSkeleton } from "./navbar-skeleton";
import { LoggedInNavbar } from "./logged-in-navbar";
import { LoggedOutNavbar } from "./logged-out-navbar";

export function Navbar() {
  const { user, loading } = useAuth();

  if (loading) {
    return <NavbarSkeleton />;
  }

  return user ? <LoggedInNavbar user={user} /> : <LoggedOutNavbar />;
}