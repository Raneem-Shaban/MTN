import PropTypes from 'prop-types';
import clsx from 'clsx';

const buttonStyles = {
  secondary: {
    border: 'border border-[var(--color-secondary)]',
    text: 'text-[var(--color-secondary)]',
    hover: 'hover:bg-[var(--color-secondary)] hover:text-white',
  },
  danger: {
    border: 'border border-[var(--color-danger)]',
    text: 'text-[var(--color-danger)]',
    hover: 'hover:bg-[var(--color-danger)] hover:text-white',
  },
};

const OutlineButton = ({ title, color = 'secondary', onClick }) => {
  const styles = buttonStyles[color] || buttonStyles.secondary;

  return (
    <button
      onClick={onClick} 
      className={clsx(
        'rounded-full font-medium text-sm',
        'px-2 py-1 md:px-4 md:py-1.5',
        'transition-all duration-200 ease-in-out',
        'transform hover:scale-105 active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-secondary)]',
        styles.border,
        styles.text,
        styles.hover
      )}
    >
      {title}
    </button>
  );
};

OutlineButton.propTypes = {
  title: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['secondary', 'danger']),
  onClick: PropTypes.func,
};

export default OutlineButton;
