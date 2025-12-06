import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about our company and product.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-10 p-24">
      {/* TODO: Update this page with your company/product information */}
      <h1 className="text-4xl font-bold">About Us</h1>
      <p>
        Tell your users about your company and product here.
      </p>
    </div>
  );
}
