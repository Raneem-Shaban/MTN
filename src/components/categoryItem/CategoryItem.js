import React from 'react';

const CategoryItem = ({ name, description, colorClass }) => {
  return (
    <div className={`text-center py-2 px-2 rounded-md text-black font-medium ${colorClass}`}>
      <div className="text-[15px]">{name}</div>
      <div className="text-[12px] text-gray-700">{description}</div>
    </div>
  );
};


export default CategoryItem;
