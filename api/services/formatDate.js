const formatDate = (isoString) => {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0"); // Get day and pad with 0 if needed
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Get month (0-indexed) and pad
  const year = date.getFullYear(); // Get full year
  return `${day}/${month}/${year}`; // Format as DD/MM/YYYY
};

module.exports = formatDate;
