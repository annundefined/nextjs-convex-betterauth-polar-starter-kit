interface SimpleCardProps {
  heading: string;
  description: string;
}

/**
 * A simple card component for displaying a heading and description.
 * Used for feature highlights or informational blocks.
 */
export function SimpleCard({ heading, description }: SimpleCardProps) {
  return (
    <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
      <h2 className={`mb-3 text-2xl font-semibold`}>{heading}</h2>
      <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>{description}</p>
    </div>
  );
}
