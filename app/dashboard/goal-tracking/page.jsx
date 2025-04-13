"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loding from "../_components/Loding";
import Link from "next/link";
import GoalModal from "./GoalModal";
import { Pen, Trash } from "lucide-react";
import { toast } from "sonner";

export default function GoalTracking() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");
  const [simulator, setSimulator] = useState({ extraMonthly: "" });

  const [editingId, setEditingId] = useState(null);
  const [editedGoal, setEditedGoal] = useState({});

  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    targetAmount: "",
    currentAmount: "",
    image: "",
    status: "Active",
    autoSave: false,
  });

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await fetch("/api/goals");
        if (!res.ok) toast.error("Failed to fetch goals");
        const data = await res.json();
        setGoals(data);
      } catch (error) {
        toast.error("Error fetching goals");
        // console.error("Error fetching goals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, []);

  const handleNewGoalChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewGoal((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSimulatorChange = (e) => {
    const { name, value } = e.target;
    setSimulator((prev) => ({ ...prev, [name]: value }));
  };

  const estimateMonths = (goal) => {
    const target = parseFloat(goal.targetAmount);
    const current = parseFloat(goal.currentAmount);
    const extra = parseFloat(simulator.extraMonthly || 0);
    const monthlySaving = target > current ? (target - current) / 12 : 0;
    const newMonthly = monthlySaving + extra;
    if (newMonthly <= 0) return "N/A";
    return Math.ceil((target - current) / newMonthly);
  };

  const addNewGoal = async () => {
    if (
      !newGoal.title ||
      !newGoal.description ||
      !newGoal.targetAmount ||
      !newGoal.currentAmount
    ) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    try {
      // Destructure only allowed fields
      const {
        title,
        description,
        targetAmount,
        currentAmount,
        image,
        status,
        autoSave,
      } = newGoal;

      const payload = {
        title,
        description,
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount),
        image,
        status: status || "Active",
        autoSave: autoSave || false,
      };

      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // const errorData = await response.json();
        toast.error("Failed to add goal");
      }

      const result = await response.json();
      toast.success("✔️ Form submitted successfully:");
      // console.log("User input:", payload);
      // console.log("Server response:", result);

      setGoals((prev) => [...prev, result]);

      setNewGoal({
        title: "",
        description: "",
        targetAmount: "",
        currentAmount: "",
        image: "",
        status: "Active",
        autoSave: false,
      });

      setWizardStep(1);
      setShowAddForm(false);
      setErrorMsg("");
    } catch (err) {
      toast.error("Error adding goal");
      setErrorMsg(err.message);
    }
  };

  const startEditing = (goal) => {
    setEditingId(goal._id || goal.id);
    setEditedGoal({ ...goal });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedGoal((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const updateGoal = async () => {
    try {
      const res = await fetch(`/api/goals/${editedGoal._id || editedGoal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedGoal),
      });

      if (!res.ok) toast.error("Failed to update goal");
      const updated = await res.json();

      setGoals((prev) =>
        prev.map((g) =>
          (g._id || g.id) === (updated._id || updated.id) ? updated : g
        )
      );

      setEditingId(null);
      setEditedGoal({});
    } catch (error) {
      setErrorMsg("Error updating goal");
      toast.error("Error updating goal");
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedGoal({});
  };

  const deleteGoal = async (goalId) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;
    try {
      await fetch(`/api/goals/${goalId}`, { method: "DELETE" });
      setGoals((prev) => prev.filter((g) => (g._id || g.id) !== goalId));
      toast.success("Goal Deleted..");
    } catch (error) {
      setErrorMsg("Error deleting goal");
      toast.error("Error deleting goal");
    }
  };

  const getMilestoneMessage = (goal) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    if (progress >= 75) return "Great work! Almost there!";
    if (progress >= 50) return "Halfway there! Keep it up!";
    if (progress >= 25) return "Good start! You're on your way!";
    return "";
  };

  if (loading) return <Loding />;

  return (
    <div className="container mx-auto lg:px-4 relative">
      {!session || status !== "authenticated" ? (
        <div className="text-center py-8">
          <p className="mb-4">Please Sign In</p>
          <Button onClick={() => router.push("/signin")}>Login</Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
            <h1 className="text-2xl font-bold mb-4 sm:mb-0">Goal Tracking</h1>
            <Button
              onClick={() => {
                setShowAddForm(true);
                setWizardStep(1);
              }}
            >
              Add Goal
            </Button>
          </div>

          {errorMsg && (
            <div className="mb-4 text-center text-red-500">{errorMsg}</div>
          )}

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {goals.map((goal) => {
              const goalId = goal._id || goal.id;
              const progress = (goal.currentAmount / goal.targetAmount) * 100;

              return (
                <Card
                  key={goalId}
                  className="shadow-md rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg lg:flex lg:flex-col lg:justify-between"
                >
                  <CardHeader className="p-4 border-b bg-gradient-to-r from-white to-gray-50">
                    <div className="flex items-start sm:items-center gap-4">
                      {goal.image && (
                        <img
                          src={goal.image}
                          alt={goal.title}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-full border"
                        />
                      )}
                      <div className="flex flex-col gap-1">
                        {editingId === goalId ? (
                          <Input
                            name="title"
                            value={editedGoal.title}
                            onChange={handleEditChange}
                            className="text-lg font-semibold"
                          />
                        ) : (
                          <CardTitle className="text-xl font-bold text-gray-900">
                            {goal.title}
                          </CardTitle>
                        )}
                        <p className="text-gray-600 text-sm sm:text-base bg-gray-50 px-3 py-2 rounded">
                          {goal.description.length > 100
                            ? goal.description.slice(0, 100) + "…"
                            : goal.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-4">
                    {/* Amount & Progress */}
                    <div>
                      {editingId === goalId ? (
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Current Amount</Label>
                            <Input
                              name="currentAmount"
                              type="number"
                              value={editedGoal.currentAmount}
                              onChange={handleEditChange}
                            />
                          </div>
                          <div>
                            <Label>Target Amount</Label>
                            <Input
                              name="targetAmount"
                              type="number"
                              value={editedGoal.targetAmount}
                              onChange={handleEditChange}
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="font-medium text-gray-700">
                            ${parseFloat(goal.currentAmount).toLocaleString()}{" "}
                            <span className="text-gray-400">/</span> $
                            {parseFloat(goal.targetAmount).toLocaleString()}
                          </p>
                          <Progress
                            value={progress}
                            className="h-3 rounded-full mt-1"
                          />
                          {getMilestoneMessage(goal) && (
                            <p className="text-green-600 text-xs italic mt-1">
                              {getMilestoneMessage(goal)}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Status & Estimation */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Status</Label>
                        {editingId === goalId ? (
                          <select
                            name="status"
                            value={editedGoal.status}
                            onChange={handleEditChange}
                            className="border p-2 rounded w-full"
                          >
                            <option value="Active">Active</option>
                            <option value="Paused">Paused</option>
                            <option value="Completed">Completed</option>
                            <option value="Archived">Archived</option>
                          </select>
                        ) : (
                          <p className="text-gray-800">
                            {goal.status || "Active"}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>Estimated Months</Label>
                        <p className="text-gray-800">{estimateMonths(goal)}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    {editingId === goalId ? (
                      <div className="flex gap-3">
                        <Button onClick={updateGoal}>Save</Button>
                        <Button variant="secondary" onClick={cancelEditing}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <div className="grid sm:grid-cols-2 gap-2">
                          <Button
                            onClick={() => startEditing(goal)}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <span>Edit</span>
                            <Pen className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => deleteGoal(goalId)}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <span>Delete</span>
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                        <Link href={`/dashboard/goal-tracking/${goalId}`}>
                          <Button variant={"outline"} className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {showAddForm && (
            <GoalModal
              wizardStep={wizardStep}
              setWizardStep={setWizardStep}
              newGoal={newGoal}
              setNewGoal={setNewGoal}
              simulator={simulator}
              setSimulator={setSimulator}
              addNewGoal={addNewGoal}
              setShowAddForm={setShowAddForm}
              handleNewGoalChange={handleNewGoalChange}
              handleSimulatorChange={handleSimulatorChange}
            />
          )}
        </>
      )}
    </div>
  );
}
