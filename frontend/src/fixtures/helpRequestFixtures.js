const helpRequestFixtures = {
  oneHelpRequest: {
    id: 1,
    requesterEmail: "derekflippo@ucsb.edu",
    teamId: "f26-07",
    tableOrBreakoutRoom: "7",
    requestTime: "2026-10-20T14:15:00",
    explanation: "Need help with Swagger-ui",
    solved: false,
  },
  threeHelpRequests: [
    {
      id: 1,
      requesterEmail: "derekflippo@ucsb.edu",
      teamId: "f26-07",
      tableOrBreakoutRoom: "7",
      requestTime: "2026-10-20T14:15:00",
      explanation: "Need help with Swagger-ui",
      solved: false,
    },
    {
      id: 2,
      requesterEmail: "derekflippo@ucsb.edu",
      teamId: "f26-03",
      tableOrBreakoutRoom: "3",
      requestTime: "2026-10-21T10:30:00",
      explanation: "Dokku deployment failed",
      solved: true,
    },
    {
      id: 3,
      requesterEmail: "derekflippo@ucsb.edu",
      teamId: "f26-11",
      tableOrBreakoutRoom: "11",
      requestTime: "2026-10-22T16:45:00",
      explanation: "npm install not working",
      solved: false,
    },
  ],
};

export { helpRequestFixtures };
