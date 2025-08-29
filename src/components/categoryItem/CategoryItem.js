import React from 'react';

const CategoryItem = ({ name, colorClass, isSelected }) => {
  return (
    <div
      className={`
        w-full min-w-0 text-center py-2 px-2 rounded-md font-medium
        ${colorClass} ${isSelected ? 'ring-2 ring-blue-500' : ''}
        break-words
        transition-all duration-200
      `}
    >
      <div className="text-[12px] xs:text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] whitespace-normal">
        {name}
      </div>
    </div>
  );
};

export default CategoryItem;
