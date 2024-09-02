"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, RocketIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import useMutate from "@/lib/helperHooks.ts/useMutate";
import { adminLogin } from "@/services/admin";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/utils";

export default function AdminLogin() {
  const [showAlert, setShowAlert] = useState(false); 
  const { toast } = useToast();
  const router = useRouter();
  const { mutate: login ,isLoading} = useMutate(adminLogin, {
    onSuccess: (data) => {
      toast({
        title: "Login Successful",
        description: "You have successfully logged in",
        className: "bg-emerald-500",
        duration: 3000,
      });
      localStorage.setItem("token", data?.data?.token);
      router.push("/admin/dashboard");
    },
  });
  async function onSubmit(event: React.SyntheticEvent) {
    console.log("here");
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    const email = data.get("email")?.toString();
    console.log(email);
    const password = data.get("password")?.toString();
    if (email && password) {
      console.log(email, password);
      await login({ email, password });
    }
  }

  const handleAlert = () => {
    setShowAlert(true); // Show alert when the button is clicked
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      const isAdmin = decodeToken(localStorage.getItem("token") ?? "");
      if (isAdmin) {
        router.push("/admin/dashboard");
      }
    }
  }, []);

  return (
    <Card className="w-[350px] container mt-6">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Admin Login</CardTitle>
        <CardDescription>
          Enter your email and password to login
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        <form onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2 mt-4">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              disabled={isLoading}
            />
          </div>
          <Button className="w-full mt-6" type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
        {showAlert && (
          <Alert className="mt-4 bg-slate-400">
            <RocketIcon className="h-4 w-4 " color="#bc3838" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>WILL BE ADDING SOON ....</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <p className="px-8 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Button variant={"link"} onClick={handleAlert}>
            Sign up
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
