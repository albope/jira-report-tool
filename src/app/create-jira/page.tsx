"use client";

import HeaderNav from "@/components/HeaderNav";
import FooterNav from "@/components/FooterNav";
import CreateJiraForm from "@/components/CreateJiraForm";

export default function CreateJiraPage() {
  return (
    <>
      <HeaderNav />

      <main className="pt-20 min-h-screen bg-gray-50">
        <CreateJiraForm />
      </main>

      <FooterNav />
    </>
  );
}