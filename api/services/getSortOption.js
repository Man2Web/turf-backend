const getSortOption = (sortOption) => {
  switch (sortOption) {
    case "Featured":
      return "ORDER BY courts.featured DESC";
    case "Price Low - High":
      return "ORDER BY court_details.price ASC";
    case "Price High - Low":
      return "ORDER BY court_details.price DESC";
    default:
      console.log(`Unknown sort option: ${sortOption}`);
      return;
  }
};

module.exports = getSortOption;
