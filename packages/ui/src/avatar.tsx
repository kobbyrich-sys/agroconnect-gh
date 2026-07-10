export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

const sizeStyles = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
};

export function Avatar({ src, alt = '', size = 'md', fallback, className = '' }: AvatarProps) {
  const initials = fallback
    ? fallback
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={[
          'rounded-full object-cover border-2 border-gray-200',
          sizeStyles[size],
          className,
        ].join(' ')}
      />
    );
  }

  return (
    <div
      className={[
        'rounded-full bg-emerald-100 text-emerald-700 font-semibold flex items-center justify-center border-2 border-emerald-200',
        sizeStyles[size],
        className,
      ].join(' ')}
    >
      {initials}
    </div>
  );
}
