"use client";

import { ReactNode } from "react";
import { User, Shield, KeyRound } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[564px] flex bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* Left Section */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white px-16">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome</h1>
          <p className="text-lg text-blue-100 mb-10">
            Create your account and start your journey with us
          </p>

          <div className="flex justify-center gap-10 text-blue-100">
            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <User size={22} className="text-gray-600 dark:text-gray-300" />
              </div>
              <p className="text-sm">Profile</p>
            </div>

            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <Shield size={22} className="text-gray-600 dark:text-gray-300" />
              </div>
              <p className="text-sm">Security</p>
            </div>

            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <KeyRound size={22} className="text-gray-600 dark:text-gray-300" />
              </div>
              <p className="text-sm">Access</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
