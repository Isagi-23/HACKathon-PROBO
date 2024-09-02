"use client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Define the type for the API function
type ApiFunction<T> = () => Promise<T>;

// Define the type for options
interface UseQueryOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  enabled?: boolean;
  showToast?: boolean;
}

// Define the type for the hook result
interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: any;
  refetch: () => void;
  isRefetching: boolean;
  isSuccess: boolean;
}

const useQuery = <T>(
  apiFunction: ApiFunction<T>,
  {
    onSuccess = () => {},
    onError = () => {},
    enabled = true,
    showToast = true,
  }: UseQueryOptions<T> = {}
): UseQueryResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<any>(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const { toast } = useToast();

  const [reload, setReload] = useState(0);

  const refetch = () => setReload((prev) => prev + 1);
console.log(enabled)
  useEffect(() => {
    const fetchData = async () => {
      console.log("called using useQuery", enabled);
      setIsLoading(true);
      reload > 0 && setIsRefetching(true);
      setIsError(false);
      setError(null);
      try {
        const res = await apiFunction();
        setIsSuccess(true);
        setData(res);
        if (onSuccess) {
          onSuccess(res);
        }
      } catch (error: any) {
        setIsError(true);
        setError(error);
        if (showToast) {
          toast({
            title:
              (error?.response?.data?.message as string) ||
              (error.message as string) ||
              (error.response?.message as string),
            variant: "destructive",
          });
        }
        if (onError) {
          onError(error);
        }
      } finally {
        setIsLoading(false);
        setIsRefetching(false);
      }
    };
    if (enabled) {
      console.log("gere", enabled);
      fetchData();
    }
  }, [reload, enabled]);

  return { data, isLoading, isError, error, refetch, isRefetching, isSuccess };
};

export default useQuery;
