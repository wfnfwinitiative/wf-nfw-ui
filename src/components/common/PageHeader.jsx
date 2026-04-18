export function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-4 md:mb-6">
      <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-red-800 dark:text-red-200 mb-1 md:mb-1">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm md:text-base text-gray-600 dark:text-red-400 mb-4">
          {subtitle}
        </p>
      )}
    </div>
  );
}