// utils/chartHelpers.js

export const getValidDates = (transactions) => {
  return transactions
    .map((tx) => new Date(tx.date))
    .filter((date) => !isNaN(date.getTime()))
    .sort((a, b) => a - b);
};

export const determineInterval = (validDates) => {
  if (validDates.length < 2) return "month";
  const minDate = validDates[0];
  const maxDate = validDates[validDates.length - 1];
  const diffDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) return "day";
  if (diffDays <= 30) return "week";
  return "month";
};

export const formatLabel = (date, interval, showYear) => {
  const options = {
    day: { day: "numeric", month: "short" },
    week: { month: "short", day: "numeric" },
    month: { month: "short" },
  };

  if (showYear) options[interval].year = "2-digit";
  return date.toLocaleDateString("en-US", options[interval]);
};

// utils/chartHelpers.js (continued)

export const transformData = (transactions) => {
  const validDates = getValidDates(transactions);
  if (validDates.length === 0)
    return { chartData: [], interval: "month", showYear: false };

  const minDate = validDates[0];
  const maxDate = validDates[validDates.length - 1];
  const interval = determineInterval(validDates);
  const showYear = minDate.getFullYear() !== maxDate.getFullYear();

  const groups = {};

  transactions.forEach((tx) => {
    const date = new Date(tx.date);
    if (isNaN(date.getTime())) return;

    let groupKey, groupDate;
    switch (interval) {
      case "day":
        groupKey = date.toISOString().split("T")[0];
        groupDate = new Date(date);
        groupDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        groupKey = `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
        groupDate = new Date(weekStart);
        break;
      case "month":
        groupKey = `${date.getFullYear()}-${date.getMonth()}`;
        groupDate = new Date(date.getFullYear(), date.getMonth(), 1);
        break;
    }

    if (!groups[groupKey]) {
      groups[groupKey] = {
        timestamp: groupDate.getTime(),
        value: 0,
        label: formatLabel(groupDate, interval, showYear),
      };
    }
    groups[groupKey].value += tx.amount;
  });

  const chartData = Object.values(groups).sort(
    (a, b) => a.timestamp - b.timestamp
  );

  return { chartData, interval, showYear };
};
