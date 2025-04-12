
import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt, 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };
  
  return (
    <div className={cn(
      'relative flex-shrink-0 rounded-full overflow-hidden', 
      sizeClasses[size],
      className
    )}>
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover"
        onError={(e) => {
          // If image fails to load, display initials
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (context) {
            const size = target.width;
            canvas.width = size;
            canvas.height = size;
            
            // Background
            context.fillStyle = '#6B7AF7';
            context.fillRect(0, 0, size, size);
            
            // Text
            const initials = alt.split(' ')
              .map(name => name.charAt(0))
              .join('')
              .toUpperCase()
              .substring(0, 2);
              
            context.font = `${size/2}px Arial`;
            context.fillStyle = 'white';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(initials, size/2, size/2);
            
            target.src = canvas.toDataURL();
          }
        }}
      />
    </div>
  );
};

export default Avatar;
