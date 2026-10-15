"use client"
import { useEffect } from 'react';
import AdminLayout from './_components/AdminLayout';
import { Toaster } from 'react-hot-toast';

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster />
      <AdminLayout>
        {children}
      </AdminLayout>
    </>
  );
}