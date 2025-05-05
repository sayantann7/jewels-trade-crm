"use client"

import { redirect } from 'next/navigation';
import { useSession } from "next-auth/react";
import { SessionProvider } from 'next-auth/react';

export default function Home() {
  return (
    <SessionProvider>
      <OtherHome />
    </SessionProvider>
  )
}

function OtherHome() {
  const session = useSession();
  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
  return (
    <div>
      <h1>Redirecting...</h1>
    </div>
  )
}