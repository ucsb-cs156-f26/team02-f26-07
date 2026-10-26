const recommendationRequestFixtures = {
  oneRecommendationRequest: {
    id: 1,
    requesterEmail: "student@ucsb.edu",
    professorEmail: "professor@ucsb.edu",
    explanation: "BS/MS program",
    dateRequested: "2026-09-30T09:00:00",
    dateNeeded: "2026-10-31T23:59:00",
    done: true,
  },
  threeRecommendationRequests: [
    {
      id: 1,
      requesterEmail: "student1.email@ucsb.edu",
      professorEmail: "professor1.email@ucsb.edu",
      explanation: "MS program at Stanford",
      dateRequested: "2026-01-01T07:31:00",
      dateNeeded: "2026-03-15T23:59:00",
      done: true,
    },
    {
      id: 2,
      requesterEmail: "student2@umail.ucsb.edu",
      professorEmail: "professor2@cs.ucsb.edu",
      explanation: "PhD program at CMU",
      dateRequested: "2026-02-04T15:16:00",
      dateNeeded: "2026-06-01T23:59:00",
      done: true,
    },
    {
      id: 3,
      requesterEmail: "firstlast3@ucsb.edu",
      professorEmail: "prof3@cs.ucsb.edu",
      explanation: "Internship recommendation letter",
      dateRequested: "2026-10-19T10:49:00",
      dateNeeded: "2027-01-15T23:59:00",
      done: false,
    },
  ],
};

export { recommendationRequestFixtures };
