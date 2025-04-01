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

  // useMemo to calculate progress percentage only when goal changes
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
        body: JSON.stringify(editedGoal),
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

  if (loading) return <Loding />;
  if (errorMsg)
    return <div className="text-red-500 text-center py-8">{errorMsg}</div>;
  if (!goal) return <div className="text-center py-8">Goal not found.</div>;

  return (
    <div className="min-h-screen  flex flex-col items-center lg:p-4">
      <div className="w-full">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/goal-tracking")}
          className="mb-6 bg-slate-50"
        >
          &larr; Back to Goals
        </Button>
        <Card className="border-0 shadow-none rounded-lg overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row items-center gap-4 p-6 py-2 bg-white">
            {goal.image && (
              <img
                src={goal.image}
                alt={goal.title}
                className="w-24 h-24 object-cover rounded-md"
              />
            )}
            <CardTitle className="text-3xl font-bold text-gray-900 flex-1">
              {isEditing ? (
                <Input
                  name="title"
                  value={editedGoal.title}
                  onChange={handleInputChange}
                  className="text-3xl font-bold"
                />
              ) : (
                goal.title
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2 bg-gray-50 space-y-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-800">
                    ${goal.currentAmount.toLocaleString()}
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
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-800">
                    ${goal.targetAmount.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <div className="w-[200px]">
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Progress
              </Label>
              <Progress value={progressValue} className="h-3 rounded-full" />
            </div>
            {isEditing ? (
              <div className="flex space-x-4 mt-4">
                <Button onClick={handleUpdate}>Save</Button>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex space-x-4 mt-4">
                <Button onClick={handleEditClick}>Edit Goal</Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete Goal
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
