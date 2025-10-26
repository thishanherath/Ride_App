import { Star, StarHalf } from "lucide-react";

function RatingDisplay({ 
  rating, 
  showNumber = true, 
  showCount = false, 
  size = "md",
  interactive = false,
  onRatingChange = null 
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className={`${sizeClasses[size]} text-yellow-400 fill-current ${
            interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""
          }`}
          onClick={() => interactive && onRatingChange && onRatingChange(i + 1)}
        />
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          className={`${sizeClasses[size]} text-yellow-400 fill-current ${
            interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""
          }`}
          onClick={() => interactive && onRatingChange && onRatingChange(fullStars + 0.5)}
        />
      );
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star
          key={`empty-${i}`}
          className={`${sizeClasses[size]} text-gray-300 ${
            interactive ? "cursor-pointer hover:scale-110 transition-transform hover:text-yellow-300" : ""
          }`}
          onClick={() => interactive && onRatingChange && onRatingChange(fullStars + (hasHalfStar ? 1 : 0) + i + 1)}
        />
      );
    }

    return stars;
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex">
        {renderStars()}
      </div>
      {showNumber && (
        <span className="text-sm font-medium text-gray-700 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
      {showCount && (
        <span className="text-xs text-gray-500 ml-1">
          ({rating.count || 0} reviews)
        </span>
      )}
    </div>
  );
}

export default RatingDisplay;
