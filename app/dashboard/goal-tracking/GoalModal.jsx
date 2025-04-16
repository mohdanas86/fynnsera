"use client";
import React, { useState } from "react";
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
import { z } from "zod";

// Create Zod schemas with preprocess for numeric fields so that even if values come as strings they are converted.
const goalSchema = z.object({
  title: z.string().nonempty("Title is required"),
  description: z.string().nonempty("Description is required"),
  targetAmount: z.preprocess(
    (val) => Number(val),
    z
      .number({ invalid_type_error: "Target Amount must be a number" })
      .positive("Target Amount must be greater than zero")
  ),
  currentAmount: z.preprocess(
    (val) => Number(val),
    z
      .number({ invalid_type_error: "Current Amount must be a number" })
      .nonnegative("Current Amount must not be negative")
  ),
  image: z
    .string()
    .nonempty("Image URL is required")
    .url("Please provide a valid image URL"),
  status: z.enum(["Active", "Paused", "Completed", "Archived"], {
    errorMap: () => ({ message: "Please select a valid status" }),
  }),
  autoSave: z.boolean(),
});

const simulatorSchema = z.object({
  extraMonthly: z.preprocess(
    (val) => Number(val),
    z
      .number({ invalid_type_error: "Extra Monthly must be a number" })
      .min(0, "Extra Monthly must not be negative")
  ),
});

export default function GoalModal({
  wizardStep,
  setWizardStep,
  newGoal,
  setNewGoal,
  simulator,
  setSimulator,
  addNewGoal,
  setShowAddForm,
}) {
  // Local error state objects for the goal and simulator sections
  const [errors, setErrors] = useState({});
  const [simulatorErrors, setSimulatorErrors] = useState({});

  // Update goal state and clear error as user types
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setNewGoal((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Update simulator state and clear error as user types
  const handleSimulatorFieldChange = (e) => {
    const { name, value } = e.target;
    setSimulator((prev) => ({ ...prev, [name]: value }));
    setSimulatorErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validate all the fields from both sections when trying to submit
  const validateAll = () => {
    let valid = true;
    const newErrors = {};
    const newSimErrors = {};

    const goalResult = goalSchema.safeParse(newGoal);
    if (!goalResult.success) {
      valid = false;
      goalResult.error.errors.forEach((err) => {
        newErrors[err.path[0]] = err.message;
      });
    }

    const simResult = simulatorSchema.safeParse(simulator);
    if (!simResult.success) {
      valid = false;
      simResult.error.errors.forEach((err) => {
        newSimErrors[err.path[0]] = err.message;
      });
    }

    setErrors(newErrors);
    setSimulatorErrors(newSimErrors);
    return valid;
  };

  // When the user clicks the "Submit Goal" button
  const handleSubmitGoal = () => {
    if (validateAll()) {
      // Call the addNewGoal function if all fields pass validation.
      addNewGoal();
    }
  };

  // Disable Next button if any required field is empty
  const isStep1Disabled =
    !newGoal.title ||
    !newGoal.description ||
    !newGoal.targetAmount ||
    !newGoal.currentAmount ||
    !newGoal.image ||
    !newGoal.status;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4 animate-fadeIn">
      <Card className="w-full max-w-lg bg-white rounded-md shadow-2xl overflow-hidden max-h-[80%]">
        {/* Header */}
        <div className="flex justify-between items-center lg:p-4 px-4 pb-4 lg:pt-0 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {wizardStep === 1 ? "Add New Goal" : "Funding & Simulator"}
          </h2>
          <Button
            variant="outline"
            className="rounded-sm p-2 hover:bg-gray-100"
            onClick={() => setShowAddForm(false)}
          >
            <X className="w-5 h-5 text-gray-600" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 lg:pt-6 pt-0 space-y-6 max-h-[80vh] overflow-y-auto">
          {wizardStep === 1 ? (
            <>
              {/* Title Field */}
              <div>
                <Label htmlFor="title" className="mb-1 block font-medium">
                  Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={newGoal.title || ""}
                  onChange={handleFieldChange}
                  className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-[4px]"
                  placeholder="Enter goal title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Description Field */}
              <div>
                <Label htmlFor="description" className="mb-1 block font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newGoal.description || ""}
                  onChange={handleFieldChange}
                  className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-[4px]"
                  placeholder="Enter goal description"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Target Amount Field */}
              <div>
                <Label
                  htmlFor="targetAmount"
                  className="mb-1 block font-medium"
                >
                  Target Amount
                </Label>
                <Input
                  id="targetAmount"
                  name="targetAmount"
                  type="number"
                  value={newGoal.targetAmount || ""}
                  onChange={handleFieldChange}
                  className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-[4px]"
                  placeholder="e.g. 10000"
                />
                {errors.targetAmount && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.targetAmount}
                  </p>
                )}
              </div>

              {/* Current Amount Field */}
              <div>
                <Label
                  htmlFor="currentAmount"
                  className="mb-1 block font-medium"
                >
                  Current Amount
                </Label>
                <Input
                  id="currentAmount"
                  name="currentAmount"
                  type="number"
                  value={newGoal.currentAmount || ""}
                  onChange={handleFieldChange}
                  className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-[4px]"
                  placeholder="e.g. 5000"
                />
                {errors.currentAmount && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.currentAmount}
                  </p>
                )}
              </div>

              {/* Image URL Field */}
              <div>
                <Label htmlFor="image" className="mb-1 block font-medium">
                  Image URL
                </Label>
                <Input
                  id="image"
                  name="image"
                  value={newGoal.image || ""}
                  onChange={handleFieldChange}
                  className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-[4px]"
                  placeholder="https://example.com/image.jpg"
                />
                {errors.image && (
                  <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                )}
              </div>

              {/* Status Field */}
              <div className="w-full">
                <Label htmlFor="status" className="mb-1 block font-medium">
                  Goal Status
                </Label>
                <Select
                  value={newGoal.status || ""}
                  onValueChange={(value) => {
                    setNewGoal((prev) => ({ ...prev, status: value }));
                    setErrors((prev) => ({ ...prev, status: "" }));
                  }}
                >
                  <SelectTrigger className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-[4px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Paused">Paused</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                )}
              </div>

              {/* Next Button */}
              <Button
                onClick={() => setWizardStep(2)}
                disabled={isStep1Disabled}
                className="w-full mt-4 text-white disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-[4px]"
              >
                Next
              </Button>
            </>
          ) : (
            <>
              {/* Simulator and Auto-save Section */}
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="autoSave"
                  name="autoSave"
                  checked={newGoal.autoSave || false}
                  // Use onCheckedChange instead of onChange
                  onCheckedChange={(checked) =>
                    setNewGoal((prev) => ({ ...prev, autoSave: checked }))
                  }
                />
                <Label htmlFor="autoSave" className="font-medium">
                  Enable Auto-Saving
                </Label>
              </div>
              <div>
                <Label
                  htmlFor="extraMonthly"
                  className="mb-1 block font-medium"
                >
                  What-If Simulator: Extra Monthly Saving (₹)
                </Label>
                <Input
                  id="extraMonthly"
                  name="extraMonthly"
                  type="number"
                  value={simulator.extraMonthly || ""}
                  onChange={handleSimulatorFieldChange}
                  className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-[4px]"
                  placeholder="e.g. 100"
                />
                {simulatorErrors.extraMonthly && (
                  <p className="mt-1 text-sm text-red-600">
                    {simulatorErrors.extraMonthly}
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-500">
                This estimate helps calculate how many months it'll take to
                reach your goal with added savings.
              </p>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setWizardStep(1)}
                  className="hover:bg-gray-100 rounded-[2px]"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmitGoal}
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-[2px]"
                >
                  Submit Goal
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
