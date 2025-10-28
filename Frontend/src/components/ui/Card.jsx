import React from 'react';
import './Card.css';

const Card = React.forwardRef(({
  children,
  variant = 'default',
  padding = 'default',
  shadow = 'sm',
  hover = false,
  selected = false,
  className = '',
  onClick,
  ...props
}, ref) => {
  const baseClasses = 'ds-card';
  const variantClasses = `ds-card--${variant}`;
  const paddingClasses = `ds-card--padding-${padding}`;
  const shadowClasses = `ds-card--shadow-${shadow}`;
  const stateClasses = [
    hover && 'ds-card--hover',
    selected && 'ds-card--selected',
    onClick && 'ds-card--clickable'
  ].filter(Boolean).join(' ');

  const cardClasses = [
    baseClasses,
    variantClasses,
    paddingClasses,
    shadowClasses,
    stateClasses,
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  const handleKeyDown = (e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <div
      ref={ref}
      className={cardClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;