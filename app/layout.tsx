import "./globals.css";
import { ReactNode } from "react";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata = {
  title: "Provider Dashboard",
  description: "Provider panel for appointment management",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="
          bg-gray-100 text-gray-900
          dark:bg-gray-950 dark:text-gray-100
          transition-colors duration-300
        "
      >
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </ThemeProvider>

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
