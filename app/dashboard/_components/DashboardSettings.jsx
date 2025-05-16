"use client";

import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings } from "lucide-react";

function DashboardSettings({ aiInsightsEnabled, onToggleAIInsights }) {
  return (
    <DropdownMenu>
      {" "}
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gray-100 hover:bg-gray-200 flex-shrink-0"
        >
          <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 sm:w-56">
        <div className="px-2 py-1.5 text-sm font-semibold">
          Dashboard Settings
        </div>
        <div className="h-px mx-1 my-1 bg-gray-200" />

        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between">
            {" "}
            <div className="space-y-0.5 w-[60%]">
              <p className="text-sm font-medium">AI Insights</p>
              <p className="text-xs text-gray-500">
                Show AI-powered financial insights
              </p>
            </div>
            <div className="flex items-center justify-end">
              <Switch
                checked={aiInsightsEnabled}
                onCheckedChange={onToggleAIInsights}
              />
            </div>
          </div>
        </div>

        <div className="h-px mx-1 my-1 bg-gray-200" />

        <DropdownMenuGroup>
          <DropdownMenuItem className="text-xs cursor-pointer px-2 py-1.5 rounded-sm hover:bg-gray-100">
            Customize Dashboard Layout
          </DropdownMenuItem>

          <DropdownMenuItem className="text-xs cursor-pointer px-2 py-1.5 rounded-sm hover:bg-gray-100">
            Reset Dashboard to Default
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DashboardSettings;
