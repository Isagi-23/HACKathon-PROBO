import { type ClassValue, clsx } from "clsx";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const decodeToken = (token: string) => {
  if (!token) {
    return false;
  }
  try {
    const decodedToken = jwtDecode<JwtPayload & { adminId: string }>(token);
    if (decodedToken?.adminId) {
      console.log(decodedToken);
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return err;
  }
};
