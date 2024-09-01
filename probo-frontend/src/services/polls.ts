import fetchApi from "@/configs/APIConfig";
export const fetchAllPolls = async () => {
  return fetchApi.get("/user/all-polls");
};

export const vote=async(payload:any)=>{
  return fetchApi.post("/user/vote",payload)
}