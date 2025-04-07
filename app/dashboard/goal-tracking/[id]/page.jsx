"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loding from "../../_components/Loding";

export default function GoalDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedGoal, setEditedGoal] = useState({});
  const [contribution, setContribution] = useState("");

  useEffect(() => {
    async function fetchGoal() {
      try {
        const res = await fetch(`/api/goals/${id}`);
        if (!res.ok) throw new Error("Failed to fetch goal details");
        const data = await res.json();
        setGoal(data);
      } catch (error) {
        setErrorMsg("Error fetching goal details");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchGoal();
  }, [id]);

  const progressValue = useMemo(() => {
    if (!goal) return 0;
    return (goal.currentAmount / goal.targetAmount) * 100;
  }, [goal]);

  const handleEditClick = () => {
    setEditedGoal(goal);
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    setEditedGoal({ ...editedGoal, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/goals/${goal._id || goal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editedGoal,
          status: editedGoal.status || goal.status || "Active",
        }),
      });

      if (!res.ok) throw new Error("Failed to update goal");
      const updated = await res.json();
      setGoal(updated);
      setIsEditing(false);
    } catch (error) {
      setErrorMsg("Error updating goal");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;
    try {
      await fetch(`/api/goals/${goal._id || goal.id}`, { method: "DELETE" });
      router.push("/dashboard/goal-tracking");
    } catch {
      setErrorMsg("Error deleting goal");
    }
  };

  const handleAddContribution = async () => {
    if (!contribution || isNaN(contribution)) {
      setErrorMsg("Please enter a valid contribution amount.");
      return;
    }
    const newCurrentAmount =
      parseFloat(goal.currentAmount) + parseFloat(contribution);
    try {
      const res = await fetch(`/api/goals/${goal._id || goal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...goal, currentAmount: newCurrentAmount }),
      });
      if (!res.ok) throw new Error("Failed to add contribution");
      const updated = await res.json();
      setGoal(updated);
      setContribution("");
    } catch (error) {
      setErrorMsg("Error adding contribution");
    }
  };

  const markAsClosed = async () => {
    const updatedGoal = { ...goal, status: "Archived" };
    try {
      const res = await fetch(`/api/goals/${goal._id || goal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedGoal),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      setGoal(updated);
    } catch (error) {
      setErrorMsg("Error updating status");
    }
  };

  if (loading) return <Loding />;
  if (errorMsg)
    return <div className="text-red-500 text-center py-8">{errorMsg}</div>;
  if (!goal) return <div className="text-center py-8">Goal not found.</div>;

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-12 py-6 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/goal-tracking")}
          className="mb-6 bg-slate-50"
        >
          &larr; Back to Goals
        </Button>
        <Card className="border-0 shadow-sm rounded-lg overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 py-4 bg-white">
            {goal.image && (
              <img
                src={goal.image}
                alt={goal.title}
                className="w-24 h-24 object-cover rounded-md"
              />
            )}
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 flex-1">
              {isEditing ? (
                <Input
                  name="title"
                  value={editedGoal.title}
                  onChange={handleInputChange}
                />
              ) : (
                goal.title
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 bg-gray-50 space-y-6">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </Label>
              {isEditing ? (
                <Input
                  name="description"
                  value={editedGoal.description}
                  onChange={handleInputChange}
                  className="w-full"
                />
              ) : (
                <p className="text-gray-800">{goal.description}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Amount
                </Label>
                {isEditing ? (
                  <Input
                    name="currentAmount"
                    type="number"
                    value={editedGoal.currentAmount}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="text-gray-800">
                    ${parseFloat(goal.currentAmount).toLocaleString()}
                  </p>
                )}
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Amount
                </Label>
                {isEditing ? (
                  <Input
                    name="targetAmount"
                    type="number"
                    value={editedGoal.targetAmount}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="text-gray-800">
                    ${parseFloat(goal.targetAmount).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div className="max-w-xs">
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Progress
              </Label>
              <Progress value={progressValue} className="h-3 rounded-full" />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </Label>
              {isEditing ? (
                <select
                  name="status"
                  value={editedGoal.status || goal.status}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full"
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Completed">Completed</option>
                  <option value="Archived">Archived</option>
                </select>
              ) : (
                <span className="text-gray-800">{goal.status || "Active"}</span>
              )}
            </div>

            {isEditing ? (
              <div className="flex flex-wrap gap-3 mt-4">
                <Button onClick={handleUpdate}>Save</Button>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row lg:justify-between gap-4 mt-4">
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleEditClick}>Edit Goal</Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete Goal
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:w-[40%]">
                  <Input
                    placeholder="Add contribution"
                    type="number"
                    value={contribution}
                    onChange={(e) => setContribution(e.target.value)}
                    className="sm:flex-1"
                  />
                  <Button onClick={handleAddContribution}>Add Funds</Button>
                </div>

                {!isEditing && goal.status !== "Archived" && (
                  <Button
                    variant="destructive"
                    onClick={markAsClosed}
                    className="mt-2 w-full sm:w-auto"
                  >
                    Mark as Closed
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
