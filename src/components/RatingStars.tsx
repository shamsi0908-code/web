import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  reviewsCount?: number;
  size?: number;
  showText?: boolean;
}

export default function RatingStars({ rating, reviewsCount, size = 16, showText = true }: RatingStarsProps) {
  // Clamp rating between 0 and 5
  const clampedRating = Math.max(0, Math.min(5, rating));
  const fullStars = Math.floor(clampedRating);
  const hasHalfStar = clampedRating % 1 >= 0.25 && clampedRating % 1 < 0.75;
  const roundedRating = clampedRating.toFixed(1);

  return (
    <div className="flex items-center gap-1.5 text-yellow-500">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return (
              <Star
                key={i}
                className="fill-current text-yellow-500"
                style={{ width: size, height: size }}
              />
            );
          } else if (i === fullStars && hasHalfStar) {
            // Draw half star using gradients or simply a styled star (filled star is cleaner)
            return (
              <div key={i} className="relative inline-block">
                <Star
                  className="text-gray-300"
                  style={{ width: size, height: size }}
                />
                <div
                  className="absolute top-0 left-0 overflow-hidden"
                  style={{ width: "50%" }}
                >
                  <Star
                    className="fill-current text-yellow-500"
                    style={{ width: size, height: size }}
                  />
                </div>
              </div>
            );
          } else {
            return (
              <Star
                key={i}
                className="text-gray-300"
                style={{ width: size, height: size }}
              />
            );
          }
        })}
      </div>
      {showText && (
        <span className="text-sm font-semibold text-obsidian">
          {roundedRating}
          {reviewsCount !== undefined && (
            <span className="text-xs text-gray-500 font-normal ml-1">
              ({reviewsCount} отзыв{reviewsCount % 10 === 1 && reviewsCount % 100 !== 11 ? "ов" : reviewsCount % 10 >= 2 && reviewsCount % 10 <= 4 && (reviewsCount % 100 < 10 || reviewsCount % 100 >= 20) ? "а" : "ов"})
            </span>
          )}
        </span>
      )}
    </div>
  );
}
