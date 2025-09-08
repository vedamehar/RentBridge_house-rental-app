import React from 'react';

const ReviewStars = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const half = rating - fullStars >= 0.5;

  return (
    <div>
      {[...Array(fullStars)].map((_, i) => (
        <span key={i}>⭐</span>
      ))}
      {half && <span>⭐</span>}
    </div>
  );
};

export default ReviewStars;
