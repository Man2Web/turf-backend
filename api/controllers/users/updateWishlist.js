const {
  checkUserExistsWithId,
} = require("../../models/users/checkUserExistsWithId");
const updateUserWishList = require("../../models/users/updateUserWishlist");

const updateWishlist = async (req, res) => {
  const { id } = req.params;
  // console.log(id);

  const userExists = checkUserExistsWithId(id);

  if (userExists.length === 0) {
    res.status(404).json({ message: "User does not exist" });
  }

  await updateUserWishList(req.body.wishList, id);

  res.status(200).json({ message: "User wislist updated" });

  // console.log(req.body);
};

module.exports = updateWishlist;
