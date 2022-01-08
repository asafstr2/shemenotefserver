const express = require("express");
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const {storage} = require('./cloudineryCfg')
const upload = multer({storage })
const {
  getUserById,
  getAllUsers,
  saveMessageToUser,
  fetchSavedMessages,
  fetchPendingReviews,
  fetchStats,
  fetchUpcoming,
  editUser,
  unsaveMessageToUser,
  registerDeviceForNotification,
  deleteUser
} = require("../handlers/users");

const { administrator, ensureCorrectUser } = require("../midlleware/auth");
//prefix /api/users
router.get("/:id", getUserById);
router.get("/:id/allUsers", ensureCorrectUser, administrator, getAllUsers);
router.post("/:user_id/save", saveMessageToUser);
router.post("/:user_id/notification", registerDeviceForNotification);
router.post("/:user_id/unsave", unsaveMessageToUser);
router.get("/:user_id/saved", fetchSavedMessages);
router.get("/:user_id/pending_reviews", fetchPendingReviews);
router.get("/:user_id/stats", fetchStats);
router.get("/:user_id/upcoming", fetchUpcoming);
router
	.route('/:id/edit')
	.delete(ensureCorrectUser, deleteUser)
	.put(ensureCorrectUser,upload.array('file'),editUser)


module.exports = router;
