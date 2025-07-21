import React from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const FavoriteButton = ({ isFavorite, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      type="button"
      className={`flex items-center gap-2 rounded-full font-medium text-sm px-4 py-1.5
        transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-offset-2
        border 
        ${isFavorite 
          ? 'text-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-white)] active:bg-[var(--color-primary-hover)]'
          : 'text-[var(--color-text-muted)] border-[var(--color-text-muted)] hover:bg-[var(--color-text-muted)] hover:text-[var(--color-white)] active:bg-[var(--color-primary)]'}
      `}
      title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
    >
      {isFavorite ? (
        <FaHeart className="w-4 h-4" />
      ) : (
        <FaRegHeart className="w-4 h-4" />
      )}
      <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
    </button>
  );
};

export default FavoriteButton;
