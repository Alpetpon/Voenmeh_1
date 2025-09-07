import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 active:scale-95',
        destructive:
          'bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 hover:shadow-lg hover:shadow-destructive/25 active:scale-95',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-ring active:scale-95',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md active:scale-95',
        ghost:
          'hover:bg-accent hover:text-accent-foreground active:scale-95',
        link:
          'text-primary underline-offset-4 hover:underline active:scale-95',
        glass:
          'glass text-foreground hover:bg-white/20 dark:hover:bg-black/20 shadow-glass active:scale-95',
        gradient:
          'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/25 active:scale-95',
        floating:
          'bg-background shadow-xl border-0 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 active:scale-95',
      },
      size: {
        default: 'h-12 px-6 py-3',
        sm: 'h-10 px-4 py-2 text-xs',
        lg: 'h-14 px-8 py-4 text-base',
        xl: 'h-16 px-10 py-5 text-lg',
        icon: 'h-12 w-12',
        'icon-sm': 'h-10 w-10',
        'icon-lg': 'h-14 w-14',
      },
      animation: {
        none: '',
        pulse: 'animate-pulse-glow',
        bounce: 'hover:animate-bounce-gentle',
        glow: 'hover:animate-pulse-glow',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animation: 'none',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation,
    asChild = false, 
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    // Упрощенная версия без сложных проверок для asChild
    if (asChild && React.isValidElement(children)) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, animation, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }
    
    return (
      <button
        className={cn(buttonVariants({ variant, size, animation, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="loading-dots mr-2">
            <div style={{ '--i': 1 } as React.CSSProperties} />
            <div style={{ '--i': 2 } as React.CSSProperties} />
            <div style={{ '--i': 3 } as React.CSSProperties} />
          </div>
        )}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants }; 