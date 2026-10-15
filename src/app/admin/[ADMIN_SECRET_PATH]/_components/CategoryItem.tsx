interface CategoryItemProps {
    color: string;
    value: number;
    heading: string;
  }
  
  const CategoryItem = ({ color, value, heading }: CategoryItemProps) => (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="min-w-0 flex-1">
        <h5 className="truncate text-sm font-medium text-gray-900">{heading}</h5>
      </div>
      <div className="flex-1 max-w-40">
        <div className="h-2 rounded-full bg-gray-100">
          <div
            className="h-full rounded-full"
            style={{
              backgroundColor: color,
              width: `${Math.min(value, 100)}%`,
            }}
          />
        </div>
      </div>
      <span className="inline-flex w-12 justify-end text-sm font-semibold text-gray-700">{value}%</span>
    </div>
  );
  
  export default CategoryItem;