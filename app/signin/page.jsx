"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Loding from "../dashboard/_components/Loding";
import { toast } from "sonner";

// Define Zod schema for sign in validation
const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(3, { message: "Password must be at least 3 characters" }),
});

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Validate input values with Zod
      const parseResult = signInSchema.safeParse({ email, password });
      if (!parseResult.success) {
        // Flatten field errors and display them
        const { fieldErrors } = parseResult.error.flatten();
        const errorMessages = Object.values(fieldErrors).flat().join(" ");
        setError(errorMessages);
        toast(errorMessages);
        return;
      }

      setIsLoading(true);
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Invalid email or password");
        toast("Invalid email or password");
        setIsLoading(false);
      }
      toast("Signin Successfully");
      router.push("/dashboard");
    } catch (err) {
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loding />;

  return (
    <div className="lg:min-h-screen flex items-center justify-center lg:bg-gray-50">
      <div className="max-w-md w-full p-6 lg:bg-white rounded-lg lg:shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Sign In
        </h1>

        {/* Google Signup Button */}
        <button
          onClick={() =>
            signIn("google", {
              callbackUrl: "/dashboard",
            })
          }
          disabled={isLoading}
          className="w-full bg-white text-gray-700 border border-gray-300 p-2 rounded-md mb-6 hover:bg-gray-100 flex items-center justify-center gap-2 transition-colors"
        >
          <img src="/logo/google.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        {/* OR Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300" />
          <span className="mx-2 text-gray-400 text-sm">or</span>
          <div className="flex-grow border-t border-gray-300" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Sign In"}
          </button>
        </form>

        {/* Google Sign-In Button */}
        {/* <div className="mt-6">
          <button
            onClick={() =>
              signIn("google", {
                callbackUrl: "/dashboard",
              })
            }
            disabled={isLoading}
            className="w-full bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            Sign in with Google
          </button>
        </div> */}

        <p className="mt-4 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
