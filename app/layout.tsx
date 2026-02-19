import './globals.css';
import { ReactNode } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';

export const metadata = {
  title: 'Provider Dashboard',
  description: 'Provider panel for appointment management',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
       className="bg-gray-100 bg-black text-gray-900">
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            draggable
            theme="colored"
          />
      </body>
    </html>
  );
}
