import React, { useState, useEffect } from 'react';
import { FiRotateCcw, FiXCircle } from 'react-icons/fi';
import CategoryItem from '../categoryItem/CategoryItem';
import '../../App.css';

const CategoryContainer = ({ categories = [], onReturnCategory, onResetAll, hasAssignedCategories, isResetting }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);

  const toggleCategorySelection = (category) => {
  setSelectedCategories((prev) =>
    prev.some((cat) => cat.name === category.name)
      ? prev.filter((cat) => cat.name !== category.name)
      : [...prev, category]
  );
};


  const handleDragStart = (e, category) => {
  const dragging = selectedCategories.length > 0 ? selectedCategories : [category];
  e.dataTransfer.setData('text/categories', JSON.stringify(dragging));

  const ghost = document.createElement('div');
  ghost.innerHTML = `${dragging.length} selected`;
  ghost.style.position = 'absolute';
  ghost.style.top = '-9999px';
  document.body.appendChild(ghost);
  e.dataTransfer.setDragImage(ghost, 0, 0);
  setTimeout(() => document.body.removeChild(ghost), 0);
};


  const handleDrop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('category-from-trainer');
    if (data) {
      const { cat, trainer } = JSON.parse(data);
      onReturnCategory(trainer, cat);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Clear selection after drop anywhere
  useEffect(() => {
    const clearOnDrop = () => setSelectedCategories([]);
    window.addEventListener('drop', clearOnDrop);
    return () => window.removeEventListener('drop', clearOnDrop);
  }, []);

  const colorCycle = ['bg-category-one', 'bg-category-two', 'bg-category-three'];

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="flex fixed top-16 right-0 h-[calc(100vh-64px)] w-24 sm:w-28 md:w-32 bg-[var(--color-bg)] shadow-md z-50 flex-col"
    >
      <div className="flex flex-col items-center justify-center p-3 border-b">
        <h2 className="text-lg font-semibold text-center">Categories</h2>

        <div className="mt-2 flex space-x-2">
          {selectedCategories.length > 0 && (
            <button
              onClick={() => setSelectedCategories([])}
              className="flex items-center text-[13px] text-red-500 hover:text-red-600 transition"
              title="Clear selected"
            >
              <FiXCircle className="mr-1 text-sm" />
              Clear
            </button>
          )}

          {onResetAll && hasAssignedCategories && (
            <button
              onClick={onResetAll}
              className="flex items-center text-[13px] text-gray-600 hover:text-black transition"
              title="Reset all"
            >
              <FiRotateCcw className={`mr-1 text-base ${isResetting ? 'animate-spin' : ''}`} />
              Reset
            </button>
          )}
        </div>
      </div>


      <div className="flex-1 overflow-y-auto space-y-3 p-3">
        {categories.map((cat, index) => (
          <div
            key={cat.name}
            draggable
            onDragStart={(e) => handleDragStart(e, cat)}
            onClick={() => toggleCategorySelection(cat)}
            className={`cursor-pointer ${selectedCategories.includes(cat) ? 'ring-2 ring-blue-500 bg-blue-100' : ''}`}
            style={{ opacity: selectedCategories.includes(cat) ? 0.7 : 1 }}
          >
            <CategoryItem
              name={cat.name}
              description={cat.description}
              colorClass={colorCycle[index % colorCycle.length]}
            />
          </div>
        ))}

      </div>
    </div>
  );
};

export default CategoryContainer;
