import LoginMessage from "@/components/LoginMessage";
import { SimpleCard } from "@/components/SimpleCard";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center p-24">
      <div>
        <h1 className="text-6xl font-bold text-center">
          Undefined Starter Kit
        </h1>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left mt-12 gap-4">
        <SimpleCard
          heading="Convex"
          description="A reactive, real-time backend-as-a-service. It handles your database, file storage, and server functions with end-to-end type safety."
        />
        <SimpleCard
          heading="Next.js 15"
          description="The latest React Framework with App Router, Server Components, and Server Actions for building high-performance web applications."
        />
        <SimpleCard
          heading="Resend"
          description="Modern email API for developers. Send transactional emails, verification emails, and manage your email infrastructure with ease."
        />
        <SimpleCard
          heading="Better Auth"
          description="Complete user authentication with email/password and social logins. Includes email verification, password reset, and account management."
        />
        <SimpleCard
          heading="Polar.sh"
          description="The merchant of record for developers. Handle subscriptions, one-time payments, and digital products with ease."
        />
        <SimpleCard
          heading="Tailwind CSS"
          description="A utility-first CSS framework for rapidly building custom user interfaces without leaving your JSX/HTML."
        />
      </div>

      <LoginMessage />
    </main>
  );
}
