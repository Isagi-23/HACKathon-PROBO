import fetchApi from "@/configs/APIConfig";
export const fetchAllPolls = async () => {
  return fetchApi.get("/user/all-polls");
};

export const vote = async (payload: any) => {
  return fetchApi.post("/user/vote", payload);
};

export const fetchWalletData = async () => {
  return fetchApi.get("/user/wallet-data");
};

export const initiatePayoutUser = async () => {
  return fetchApi.post("/user/initiate-payout");
};
