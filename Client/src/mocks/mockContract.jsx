const mockContract = {
  methods: {
    getAgentInfo: () => ({
      call: async () => ({
        remainingBudget: "5000000000000000000",
        inCooldown: false,
      }),
    }),
    togglePause: () => ({
      send: async () => true,
    }),
  },
  events: {
    PurchaseReceipt: () => ({
      on: (type, cb) => {
        if (type === "data") {
          setTimeout(() => {
            cb({
              returnValues: {
                _amount: "120000000000000000",
                _purpose: "Cloud API credits",
              },
            });
          }, 3000);
        }
        return { unsubscribe: () => {} };
      },
    }),
  },
};

export default mockContract;
