import fetchApi from "@/configs/APIConfig";
export const adminLogin = async (payload: any) => {
  return await fetchApi.post("/admin/login", payload);
};
export const createPoll = async (payload: any) => {
  return await fetchApi.post("/admin/create-poll", payload);
};

export const getPolls = async () => {
  return await fetchApi.get("/admin/get-polls");
};

export const updatePoll = async (payload: any) => {
  return await fetchApi.patch("/admin/update-outcome", payload);
};

export const updateBalances = async (payload: any) => {
  return await fetchApi.post("/admin/transfer-balance", payload);
};
