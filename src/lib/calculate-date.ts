export const calculateDate = (date: Date | undefined) => {
  if (!date) return "";

  const now = new Date();
  const diff = Math.floor(now.getTime() - date.getTime());
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 1) return `${years} years ago`;
  if (years === 1) return "1 year ago";

  if (months > 1) return `${months} months ago`;
  if (months === 1) return "1 month ago";

  if (days > 1) return `${days} days ago`;
  if (days === 1) return "1 day ago";

  if (hours > 1) return `${hours} hours ago`;
  if (hours === 1) return "1 hour ago";

  if (minutes > 0) {
    if (minutes < 5) return "A few minutes ago";
    return `${minutes} minutes ago`;
  }

  if (seconds > 0) {
    if (seconds < 15) return "A few seconds ago";
    return `${seconds} seconds ago`;
  }

  return "Now";
};
