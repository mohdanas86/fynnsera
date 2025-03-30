"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function GoalTracking() {
  const router = useRouter();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    targetAmount: "",
    currentAmount: "",
    image: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch goals from the backend API
  useEffect(() => {
    async function fetchGoals() {
      try {
        const res = await fetch("/api/goals");
        if (!res.ok) throw new Error("Failed to fetch goals");
        const data = await res.json();
        setGoals(data);
      } catch (error) {
        console.error("Error fetching goals:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGoals();
  }, []);

  // Handle input changes for the new goal form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGoal({ ...newGoal, [name]: value });
  };

  // Create a new goal by posting to the backend API
  const addNewGoal = async () => {
    // Validate that required fields are not empty
    if (
      !newGoal.title ||
      !newGoal.description ||
      !newGoal.targetAmount ||
      !newGoal.currentAmount
    ) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    setErrorMsg("");

    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGoal),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || res.statusText || "Unknown error occurred"
        );
      }

      const addedGoal = await res.json();
      setGoals((prev) => [...prev, addedGoal]);
      // Reset new goal form and close modal after submission
      setNewGoal({
        title: "",
        description: "",
        targetAmount: "",
        currentAmount: "",
        image: "",
      });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding goal:", error.message);
      setErrorMsg(error.message);
    }
  };

  // Navigate to the goal detail page
  const viewDetails = (id) => {
    router.push(`/dashboard/goal-tracking/${id}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">Loading...</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Goal Tracking</h1>
        <Button onClick={() => setShowAddForm(true)}>Add Goal</Button>
      </div>
      {errorMsg && (
        <div className="mb-4 text-center text-red-500">{errorMsg}</div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <Card key={goal._id || goal.id} className="shadow-md">
            <CardHeader>
              <div className="flex items-start space-x-4">
                {goal.image && (
                  <img
                    src={goal.image}
                    alt={goal.title}
                    className="w-16 h-16 object-cover rounded-full"
                  />
                )}
                <div>
                  <CardTitle className="text-xl font-semibold">
                    {goal.title}
                  </CardTitle>
                  {/* <p className="text-gray-600">{goal.description}</p> */}
                  <p className="text-gray-600">
                    {goal.description.length > 50
                      ? goal.description.slice(0, 100) + "…"
                      : goal.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-gray-700 font-medium">
                  ${parseFloat(goal.currentAmount).toLocaleString()} / $
                  {parseFloat(goal.targetAmount).toLocaleString()}
                </span>
                <Progress
                  value={(goal.currentAmount / goal.targetAmount) * 100}
                  className="h-2 mt-2"
                />
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => viewDetails(goal._id || goal.id)}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal for adding a new goal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-[#000000b9] bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 shadow-xl">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold">
                Add New Goal
              </CardTitle>
              <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                Close
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newGoal.title}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={newGoal.description}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="targetAmount">Target Amount</Label>
                  <Input
                    id="targetAmount"
                    name="targetAmount"
                    type="number"
                    value={newGoal.targetAmount}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="currentAmount">Current Amount</Label>
                  <Input
                    id="currentAmount"
                    name="currentAmount"
                    type="number"
                    value={newGoal.currentAmount}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    name="image"
                    value={newGoal.image}
                    onChange={handleInputChange}
                  />
                </div>
                <Button onClick={addNewGoal} className="w-full">
                  Submit Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
