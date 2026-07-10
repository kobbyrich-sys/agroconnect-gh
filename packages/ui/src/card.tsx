export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

export function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  onClick,
}: CardProps) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={[
        'bg-white rounded-xl border border-gray-200 shadow-sm',
        paddingStyles[padding],
        hover ? 'transition-all duration-200 hover:shadow-md hover:border-gray-300' : '',
        onClick ? 'cursor-pointer text-left w-full' : '',
        className,
      ].join(' ')}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}
