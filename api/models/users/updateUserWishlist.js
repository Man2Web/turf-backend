const db = require("../../config/database");

const updateUserWishList = async (wishlist, userId) => {
  try {
    const updateWishlistQuery = `
      UPDATE users 
      SET wishlist = $1 
      WHERE id = $2
    `;
    // Execute the query with the correct parameters
    const updateWishlistRes = await db.query(updateWishlistQuery, [
      wishlist,
      userId,
    ]);

    return updateWishlistRes; // Optionally return the result
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = updateUserWishList;
