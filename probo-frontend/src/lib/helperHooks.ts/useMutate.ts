import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Define the type for the API function with a payload
type ApiFunction<T, P = any> = (payload: P) => Promise<T>;

// Define the type for options
interface UseMutateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  showToast?: boolean;
}

// Define the type for the hook result
interface UseMutateResult<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: any;
  mutate: (payload: any) => Promise<T | null>;
}

const useMutate = <T, P = any>(
  apiFunction: ApiFunction<T, P>,
  { onSuccess = () => {}, onError = () => {}, showToast = true }: UseMutateOptions<T> = {}
): UseMutateResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const mutate = async (payload: P): Promise<T | null> => {
    setIsError(false);
    setError(null);
    try {
      setIsLoading(true);
      const res = await apiFunction(payload);
      setData(res);
      onSuccess(res);
      return res;
    } catch (err: any) {
      setIsError(true);
      if (showToast) {
        toast({
          title:
            (err?.response?.data?.message as string) ||
            (err.message as string) ||
            (err.response?.message as string),
          variant: "destructive",
        });
      }
      setError(err);
      onError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, isError, error, mutate };
};

export default useMutate;
