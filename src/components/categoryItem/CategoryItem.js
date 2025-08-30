import React from 'react';
import { getColorByWeight } from '../../utils/colorUtils';

const CategoryItem = ({ name, weight, isSelected }) => {
  const bgColor = getColorByWeight(weight);

  return (
    <div
      className={`
        relative
        w-full min-w-0 text-center py-2 px-2 rounded-md font-medium
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        break-words transition-all duration-200
        group
      `}
      style={{ backgroundColor: bgColor, color: '#fff' }}
    >
      {/* الاسم */}
      <div className="text-[12px] xs:text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] whitespace-normal">
        {name}
      </div>

      {/* Tooltip الوزن */}
      <div
        className="
          absolute bottom-full left-1/2 -translate-x-1/2 mb-1
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          text-xs bg-black text-white rounded-md px-2 py-1 pointer-events-none
          whitespace-nowrap
        "
      >
        Weight: {weight}
      </div>
    </div>
  );
};

export default CategoryItem;
