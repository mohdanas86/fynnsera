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
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <Settings className="h-4 w-4 text-gray-600" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-semibold">
          Dashboard Settings
        </div>
        <div className="h-px mx-1 my-1 bg-gray-200" />

        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">AI Insights</p>
              <p className="text-xs text-gray-500">
                Show AI-powered financial insights
              </p>
            </div>
            <Switch
              checked={aiInsightsEnabled}
              onCheckedChange={onToggleAIInsights}
              className="data-[state=checked]:bg-blue-600"
            />
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
