import React, { useState, useRef } from 'react';
import { Pencil } from 'lucide-react';
import CategoryItem from '../categoryItem/CategoryItem';
import TrainerSelectModal from '../modals/TrainerSelectModal';
import '../../App.css';
import { API_BASE_URL } from '../../constants/constants';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const TrainerInTask = ({ name, delegationName, tasks, allTrainers, trainerId, onCategoryAssigned, selectedCategories,
  setSelectedCategories, totalWeight }) => {
  const categories = tasks.map((cat) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    ownerName: cat.owner?.name || name,
    weight: cat.weight || 0,
  }));

  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(delegationName || '');
  const [justDropped, setJustDropped] = useState(false);
  const modalRef = useRef(null);


  const colorCycle = [
    'bg-[var(--color-category-one)]',
    'bg-[var(--color-category-two)]',
    'bg-[var(--color-category-three)]'
  ];

  return (
    <motion.div
      className={`w-44 h-80 rounded-2xl 
                  bg-[var(--color-trainer-task)] 
                  border border-[var(--color-border)] 
                  p-4 text-center shadow-md 
                  transition-transform duration-300 
                  overflow-y-auto`}
      animate={justDropped ? { scale: 1.05 } : { scale: 1 }}
      transition={{ duration: 0.3 }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={async (e) => {
        e.preventDefault();
        const categoryIds = JSON.parse(e.dataTransfer.getData("categoryIds"));
        if (!categoryIds || categoryIds.length === 0) return;

        try {
          const token = localStorage.getItem("token");
          await axios.post(
            `${API_BASE_URL}/api/bulktasks`,
            { category_ids: categoryIds, owner_id: trainerId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success("Categories assigned successfully");

          if (onCategoryAssigned) {
            categoryIds.forEach(id => onCategoryAssigned(id, trainerId));
          }

          // Clear the selected categories after successful drop
          setSelectedCategories(prev =>
            prev.filter(cat => !categoryIds.includes(cat.id))
          );

          setJustDropped(true);
          setTimeout(() => setJustDropped(false), 600);

        } catch (error) {
          console.error("Error assigning categories:", error);
          toast.error("Failed to assign categories");
        }
      }}
    >
      {/* Header */}
      <div className="flex flex-col items-center mb-3">
        <div className="w-12 h-12 rounded-full 
                        bg-[var(--color-secondary)] 
                        flex items-center justify-center 
                        text-[var(--color-white)] font-bold shadow-sm">
          {name[0]}
        </div>
        <h3 className="text-lg font-semibold text-[var(--color-text-main)] mt-2">{name}</h3>
        <p className="text-sm text-[var(--color-text-muted)]">
          Total Weight: {tasks.reduce((sum, cat) => sum + (cat.weight || 0), 0)}
        </p>

      </div>

      {/* Delegation */}
      <div className="flex items-center justify-between 
                      bg-[var(--color-surface)] 
                      px-3 py-2 rounded-lg mb-4">
        <span className="text-sm text-[var(--color-text-muted)] truncate">
          {selected || 'No Delegation'}
        </span>
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Edit Delegation"
          className="p-1.5 rounded-full 
                    border border-[var(--color-border)] 
                    bg-[var(--color-white)] shadow-sm 
                    text-[var(--color-secondary)] 
                    hover:text-[var(--color-secondary-hover)] 
                    hover:bg-[var(--color-light-gray)] transition"
        >
          <Pencil size={16} />
        </button>
      </div>

      {isOpen && (
        <TrainerSelectModal
          allTrainers={allTrainers}
          selected={allTrainers.find(t => t.name === selected)}
          onSelect={async (trainer) => {
            setSelected(trainer.name);

            try {
              const token = localStorage.getItem('token');
              await axios.post(
                `${API_BASE_URL}/api/updateProfile/${trainerId}`,
                { delegation_id: trainer.id },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              toast.success(`Delegation updated to ${trainer.name}`);
            } catch (error) {
              console.error("Error updating delegation:", error);
              toast.error("Failed to update delegation");
            }
          }}
          onClose={() => setIsOpen(false)}
        />
      )}

      {/* Categories */}
      <div className="space-y-3">
        <AnimatePresence>
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              layoutId={`cat-${cat.id}`}  // ← هنا
              draggable
              onDragStart={(e) =>
                e.dataTransfer.setData('categoryIds', JSON.stringify([cat.id]))
              }
              className="cursor-pointer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.3 }}
            >
              <CategoryItem
                name={cat.name}
                ownerName={cat.ownerName}
                description={cat.description}
                weight={cat.weight} 
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TrainerInTask;
