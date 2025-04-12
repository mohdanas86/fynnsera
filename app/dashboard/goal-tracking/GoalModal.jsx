"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

export default function GoalModal({
  wizardStep,
  setWizardStep,
  newGoal,
  setNewGoal,
  simulator,
  setSimulator,
  addNewGoal,
  setShowAddForm,
  handleNewGoalChange,
  handleSimulatorChange,
}) {
  return (
    <div className="fixed inset-0 z-50 bg-[var(--model-bg)] flex items-center justify-center px-4 animate-fadeIn">
      <Card className="w-full max-w-lg bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 pt-0 border-b">
          <h2 className="text-xl font-semibold">
            {wizardStep === 1 ? "Add New Goal" : "Funding & Simulator"}
          </h2>
          <Button
            variant="outline"
            className="rounded-md"
            onClick={() => setShowAddForm(false)}
          >
            <X />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {wizardStep === 1 ? (
            <>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={newGoal.title}
                  onChange={handleNewGoalChange}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newGoal.description}
                  onChange={handleNewGoalChange}
                />
              </div>

              <div>
                <Label htmlFor="targetAmount">Target Amount</Label>
                <Input
                  id="targetAmount"
                  name="targetAmount"
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={handleNewGoalChange}
                />
              </div>

              <div>
                <Label htmlFor="currentAmount">Current Amount</Label>
                <Input
                  id="currentAmount"
                  name="currentAmount"
                  type="number"
                  value={newGoal.currentAmount}
                  onChange={handleNewGoalChange}
                />
              </div>

              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  name="image"
                  value={newGoal.image}
                  onChange={handleNewGoalChange}
                />
              </div>

              <div>
                <Label htmlFor="status">Goal Status</Label>
                <Select
                  value={newGoal.status}
                  onValueChange={(value) =>
                    handleNewGoalChange({
                      target: { name: "status", value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Paused">Paused</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => setWizardStep(2)} className="w-full mt-4">
                Next
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="autoSave"
                  name="autoSave"
                  checked={newGoal.autoSave}
                  onCheckedChange={(checked) =>
                    handleNewGoalChange({
                      target: { name: "autoSave", value: checked },
                    })
                  }
                />
                <Label htmlFor="autoSave">Enable Auto-Saving</Label>
              </div>

              <div>
                <Label htmlFor="extraMonthly">
                  What-If Simulator: Extra Monthly Saving (₹)
                </Label>
                <Input
                  id="extraMonthly"
                  name="extraMonthly"
                  type="number"
                  value={simulator.extraMonthly}
                  onChange={handleSimulatorChange}
                  placeholder="e.g. 100"
                />
              </div>

              <p className="text-sm text-gray-500">
                This estimate helps calculate how many months it'll take to
                reach your goal with added savings.
              </p>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setWizardStep(1)}>
                  Back
                </Button>
                <Button onClick={addNewGoal}>Submit Goal</Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
