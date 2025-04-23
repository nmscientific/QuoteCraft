"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { File } from "lucide-react";
import { LayoutDashboard } from "lucide-react";
import { Settings } from "lucide-react";
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <header className="w-full flex items-center justify-center pt-16 pb-8">
        <Image
          src="/logo.png"  // Path to your logo
          alt="QuoteCraft Logo"
          width={200}       // Adjust as needed
          height={50}      // Adjust as needed
        />
      </header>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold">
          Welcome to <span className="text-primary">QuoteCraft</span>
        </h1>

        <div className="mt-6 flex justify-center items-center">
          <p className="text-lg">
            Get started by creating a new quote or managing existing ones.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl w-full">
          <Card className="hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <File className="mr-2 h-5 w-5" />
                Create New Quote
              </CardTitle>
              <CardDescription>Start a new quote from scratch.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => alert('Create New Quote')}>
                Create
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Open Existing Quote
              </CardTitle>
              <CardDescription>Open, edit, and manage saved quotes.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => alert('Open Existing Quote')}>
                Open
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Configure Product List
              </CardTitle>
              <CardDescription>Manage and update product details.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => alert('Configure Product List')}>
                Configure
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="w-full border-t border-secondary p-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} QuoteCraft. All rights reserved.
      </footer>
    </div>
  );
}
