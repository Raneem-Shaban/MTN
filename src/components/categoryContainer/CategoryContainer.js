import React, { useState } from 'react';
import { FiRotateCcw, FiXCircle } from 'react-icons/fi';
import { FaDice } from "react-icons/fa";
import CategoryItem from '../categoryItem/CategoryItem';
import { motion, AnimatePresence } from "framer-motion";

const CategoryContainer = ({
  categories = [],
  onResetAll,
  isResetting,
  onCategoryDrop,
  onRandomAssign,
  selectedCategories,
  setSelectedCategories
}) => {

  const toggleCategorySelection = (category) => {
    setSelectedCategories((prev) =>
      prev.some((c) => c.id === category.id)
        ? prev.filter((c) => c.id !== category.id)
        : [...prev, category]
    );
  };


  return (
    <div className="fixed top-16 right-0 h-[calc(100vh-64px)] w-32 bg-[var(--color-bg)] shadow-md z-50 flex flex-col transition-all duration-300">

      {/* Header */}
      <div className="flex flex-col items-center justify-center py-3 border-b">
        <h2 className="text-lg text-[var(--color-text-main)] font-semibold text-center">Categories</h2>

        <div className="mt-2 flex flex-col items-center space-y-2 w-full">
          <div className="flex w-full justify-center">
            {selectedCategories.length > 0 && (
              <button
                onClick={() => setSelectedCategories([])}
                className="flex items-center gap-1 text-xs sm:text-sm md:text-base font-medium px-1 py-1 rounded-md text-[var(--color-danger)] hover:text-[var(--color-primary-hover)] hover:bg-[var(--color-light-gray)]"
                title="Clear selected"
              >
                <FiXCircle className="text-sm sm:text-base" /> Clear
              </button>
            )}

            <button
              onClick={onResetAll}
              className="flex items-center gap-1 text-xs sm:text-sm md:text-base font-medium px-1 py-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-dark-gray)] hover:bg-[var(--color-light-gray)]"
              title="Reset all"
            >
              <FiRotateCcw className={`text-base ${isResetting ? 'animate-spin' : ''}`} /> Reset
            </button>
          </div>

          <button
            onClick={onRandomAssign}
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            className='px-1 py-1 rounded-md text-[var(--color-random)] hover:text-[var(--color-random-hover)] hover:bg-[var(--color-light-gray)]'
          >
            <FaDice /> Random
          </button>

        </div>
      </div>

      {/* Category List */}
      <div
        className="flex-1 overflow-y-auto space-y-3 p-3"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const categoryIdsRaw = e.dataTransfer.getData('categoryIds');
          if (!categoryIdsRaw) return;

          let categoryIds = [];
          try {
            categoryIds = JSON.parse(categoryIdsRaw);
          } catch (err) {
            console.error('Invalid categoryIds:', categoryIdsRaw);
            return;
          }

          if (onCategoryDrop) {
            categoryIds.forEach((id) => onCategoryDrop(id));
          }

          // Clear the selected categories after drop
          setSelectedCategories((prev) =>
            prev.filter((c) => !categoryIds.includes(c.id))
          );
        }}
      >
        <AnimatePresence>
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              layoutId={`cat-${cat.id}`}
              draggable
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onDragStart={(e) => {
                // اختر العناصر المحددة إذا العنصر ضمن التحديد، أو العنصر نفسه
                const draggingCategories = selectedCategories.some((c) => c.id === cat.id)
                  ? selectedCategories
                  : [cat];

                e.dataTransfer.setData(
                  'categoryIds',
                  JSON.stringify(draggingCategories.map((c) => c.id))
                );
              }}
              onClick={() => toggleCategorySelection(cat)}
              className={`cursor-pointer transition-transform duration-300 ${selectedCategories.some((c) => c.id === cat.id) ? 'ring-2 ring-blue-500' : ''
                }`}
            >
              <CategoryItem
                name={cat.name}
                weight={cat.weight}   // أرسل الوزن
                isSelected={selectedCategories.some((c) => c.id === cat.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CategoryContainer;
