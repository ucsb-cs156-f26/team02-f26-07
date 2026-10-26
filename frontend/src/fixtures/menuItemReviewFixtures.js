const menuItemReviewFixtures = {
  oneReview: {
    id: 2,
    itemId: 1,
    reviewerEmail: "test@email.com",
    stars: 5,
    dateReviewed: "2026-10-26T02:26:53",
    comments: "LOVE PIZZA",
  },
  threeReviews: [
    {
      id: 2,
      itemId: 1,
      reviewerEmail: "test@email.com",
      stars: 5,
      dateReviewed: "2026-10-26T02:26:53",
      comments: "LOVE PIZZA",
    },
    {
      id: 3,
      itemId: 10,
      reviewerEmail: "example@email.com",
      stars: 0,
      dateReviewed: "2026-10-26T02:26:53",
      comments: "HATE THE FISH",
    },
    {
      id: 4,
      itemId: 15,
      reviewerEmail: "fake@email.com",
      stars: 3,
      dateReviewed: "2026-10-26T02:26:53",
      comments: "The tacos were okay",
    },
  ],
};

export { menuItemReviewFixtures };
