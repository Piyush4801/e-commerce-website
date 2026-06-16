import React from 'react';
import { Star, StarHalf } from 'lucide-react';

export const StarRating = ({ rating, size = 16 }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.4;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5 text-yellow-500">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} size={size} fill="currentColor" />
      ))}
      {hasHalf && <StarHalf size={size} fill="currentColor" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} size={size} className="text-gray-300 dark:text-gray-600" />
      ))}
      <span className="text-xs font-semibold ml-1 text-gray-500 dark:text-gray-400">
        {rating}
      </span>
    </div>
  );
};

export default StarRating;
