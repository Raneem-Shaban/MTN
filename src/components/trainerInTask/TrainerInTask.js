import React, { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react'; 
import CategoryItem from '../categoryItem/CategoryItem';
import TrainerSelectModal from '../modals/TrainerSelectModal';
import '../../App.css';

const TrainerInTask = ({ name, delegationName, categories, isResetting, allTrainers }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(delegationName || '');
  const [justDropped, setJustDropped] = useState(false);
  const modalRef = useRef(null);

  const colorCycle = ['bg-category-one', 'bg-category-two', 'bg-category-three'];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div
      onDragOver={handleDragOver}
      className={`w-36 h-full rounded-lg bg-[var(--color-trainer-task)] p-4 text-center shadow-md transition-transform duration-300 ${justDropped ? 'scale-105 bg-green-100' : ''
        }`}
    >
      <div className="flex flex-col h-full">
        <h3 className="text-lg font-semibold text-[var(--color-text-main)] mb-2">{name}</h3>
        <div className="border-t border-white my-2" />

        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] text-[var(--color-text-main)]">{selected || 'No Delegation'}</span>
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Edit Delegation"
            className="p-1.5 rounded-full border border-[var(--color-border)] bg-white shadow-sm hover:bg-blue-100 transition text-blue-600 hover:text-blue-800"
          >
            <Pencil size={16} />
          </button>
        </div>

        {isOpen && (
          <TrainerSelectModal
            allTrainers={allTrainers}
            selected={selected}
            onSelect={setSelected}
            onClose={() => setIsOpen(false)}
          />
        )}

        <div className="border-t border-white my-3" />

        <div className="space-y-3 mb-3">
          {categories.map((cat, index) => (
            <div
              key={cat.name}
              className={`cursor-pointer ${isResetting ? 'animate-pulse' : ''}`}
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
    </div>
  );
};

export default TrainerInTask;
