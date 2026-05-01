export const getLast6MonthsBuckets = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const result = [];
  const currentDate = new Date();
  
  // Set to the first day of the current month to avoid edge cases (e.g. Feb 30th)
  currentDate.setDate(1);

  // We want the last 6 months including the current one, so we loop from 5 down to 0
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentDate.getTime());
    d.setMonth(currentDate.getMonth() - i);
    result.push({
      name: months[d.getMonth()],
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }

  return result;
};
