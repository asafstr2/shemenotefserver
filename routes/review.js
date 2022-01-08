const router = require("express").Router();

const { createReview, fetchUserReviews } = require("../handlers/review");
//prefix: /api/reviews

router.post("/", createReview);
router.get("/:uid", fetchUserReviews);

module.exports = router;
