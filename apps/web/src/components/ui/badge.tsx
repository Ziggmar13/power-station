import { clsx } from 'clsx'

type BadgeVariant = 'green' | 'red' | 'gray' | 'yellow'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
}

const variantClasses: Record<BadgeVariant, string> = {
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-gray-100 text-gray-600',
  yellow: 'bg-yellow-100 text-yellow-700',
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        variantClasses[variant],
      )}
    >
      <span
        className={clsx('h-1.5 w-1.5 rounded-full', {
          'bg-green-500': variant === 'green',
          'bg-red-500': variant === 'red',
          'bg-gray-400': variant === 'gray',
          'bg-yellow-500': variant === 'yellow',
        })}
      />
      {children}
    </span>
  )
}
