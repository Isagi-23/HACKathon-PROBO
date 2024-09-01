import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, TrendingUp, Shield, Coins, WalletMinimal } from "lucide-react";
import Link from "next/link";
import WalletAnimation from "./WalletAnimation";

export default function Component() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Trade Opinions, Not Just Stocks
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Welcome to OpinionX - where your insights become investments.
                  Leverage the power of Web3 to bet on ideas, trends, and future
                  outcomes.
                </p>
              </div>
              <WalletAnimation />
            </div>
          </div>
        </section>
        <section
          className="w-full py-12 md:py-24 lg:py-32 bg-muted"
          id="features"
        >
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
              Key Features
            </h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-3 text-center">
                <Wallet className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Web3 Integration</h3>
                <p className="text-muted-foreground">
                  Seamlessly connect your crypto wallet and start trading
                  opinions.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <TrendingUp className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Real-time Markets</h3>
                <p className="text-muted-foreground">
                  Watch opinion values fluctuate based on real-world events and
                  user sentiment.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <Shield className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Secure Transactions</h3>
                <p className="text-muted-foreground">
                  Enjoy peace of mind with blockchain-backed security for all
                  your trades.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32" id="how-it-works">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
              How It Works
            </h2>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                  1
                </div>
                <h3 className="text-xl font-bold">Connect Wallet</h3>
                <p className="text-muted-foreground">
                  Link your Web3 wallet to start your opinion trading journey.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                  2
                </div>
                <h3 className="text-xl font-bold">Choose Your Opinions</h3>
                <p className="text-muted-foreground">
                  Browse trending topics or create your own opinion market.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                  3
                </div>
                <h3 className="text-xl font-bold">Enjoy</h3>
                <p className="text-muted-foreground">
                  {" "}
                  Earn rewards for accurate predictions.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          className="w-full py-12 md:py-24 lg:py-32 bg-muted"
          id="signup"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Ready to Shape the Future?
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                  Join OpinionX today and start turning your insights into
                  profits.
                </p>
                <p>Stay informed on poll results and winnings.</p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input
                    className="max-w-lg flex-1"
                    placeholder="Enter your email"
                    type="email"
                  />
                  <Button type="submit">Subscribe</Button>
                </form>
                <p className="text-xs text-muted-foreground">
                  By signing up, you agree to our{" "}
                  <Link className="underline underline-offset-2" href="#">
                    Terms & Conditions
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          © 2023 OpinionX. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
