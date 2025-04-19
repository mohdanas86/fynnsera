import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import Progress from "@/components/Progress";

const FinancialInsightsCard = ({ insights }) => {
  // Helper function to format dates safely
  const formatDate = (dateString) => {
    try {
      return dateString ? format(parseISO(dateString), "MMM dd, yyyy") : "N/A";
    } catch {
      return "Invalid date";
    }
  };
  // Safely extract data with fallbacks
  const spendingPatterns = insights?.spendingPatterns || {};
  const financialTips = insights?.financialTips || {};
  const timeBasedSummaries = insights?.timeBasedSummaries || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-0"
    >
      {/* Main Insights Card */}
      <div className="shadow-none bg-transparent">
        <div className="space-y-6">
          {/* Spending Patterns Section */}
          {spendingPatterns && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b-2 pb-2">
                Spending Patterns
              </h3>

              <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
                <div className="grid md:grid-cols-1 gap-4">
                  {/* Most Frequent Category */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-500">
                      Most Frequent
                    </h4>
                    {spendingPatterns.mostFrequentCategory ? (
                      <>
                        <p className="text-xl font-bold mt-1">
                          {spendingPatterns.mostFrequentCategory.name}
                        </p>
                        <div className="flex justify-between mt-2 text-sm">
                          <span>
                            {spendingPatterns.mostFrequentCategory.count}{" "}
                            transactions
                          </span>
                          <span className="font-medium">
                            {formatINR(
                              spendingPatterns.mostFrequentCategory.totalAmount
                            )}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-400 mt-2">No data available</p>
                    )}
                  </div>

                  {/* Highest Spend Category */}
                  <Card className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-500">
                      Highest Spend
                    </h4>
                    {spendingPatterns.highestSpendCategory ? (
                      <>
                        <p className="text-xl font-bold mt-1">
                          {spendingPatterns.highestSpendCategory.name}
                        </p>
                        <div className="mt-2">
                          <Progress
                            value={
                              spendingPatterns.highestSpendCategory
                                .percentageOfTotal || 0
                            }
                            className="h-2 bg-blue-100"
                            indicatorClassName="bg-blue-600"
                          />
                          <div className="flex justify-between mt-1 text-sm">
                            <span>
                              {Math.round(
                                spendingPatterns.highestSpendCategory
                                  .percentageOfTotal || 0
                              )}
                              % of total
                            </span>
                            <span className="font-medium">
                              {formatINR(
                                spendingPatterns.highestSpendCategory
                                  .totalAmount
                              )}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-400 mt-2">No data available</p>
                    )}
                  </Card>
                </div>

                {/* Recurring Expenses */}
                <div>
                  {spendingPatterns.recurringExpenses?.length > 0 && (
                    <Card className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-3">
                        Recurring Expenses
                      </h4>
                      <div className="space-y-3">
                        {spendingPatterns.recurringExpenses.map(
                          (expense, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center"
                            >
                              <div>
                                <p className="font-medium">
                                  {expense.merchant}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {expense.frequency}
                                </p>
                              </div>
                              <Badge
                                variant="destructive"
                                className="px-3 py-1"
                              >
                                {formatINR(expense.totalAmount)}
                              </Badge>
                            </div>
                          )
                        )}
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Financial Tips Section */}
          {financialTips && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b-2 pb-2">
                Actionable Advice
              </h3>

              <div className="grid md:grid-cols-3 gap-4">
                {/* Budgeting Advice */}
                {financialTips.budgetingAdvice && (
                  <Card className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
                    <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Budgeting
                    </h4>
                    <div className="prose mt-2 text-sm">
                      <ReactMarkdown>
                        {financialTips.budgetingAdvice}
                      </ReactMarkdown>
                    </div>
                  </Card>
                )}

                {/* Savings Opportunities */}
                {financialTips.savingsOpportunities && (
                  <Card className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
                    <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      Savings
                    </h4>
                    <div className="prose mt-2 text-sm">
                      <ReactMarkdown>
                        {financialTips.savingsOpportunities}
                      </ReactMarkdown>
                    </div>
                  </Card>
                )}

                {/* Specific Warnings */}
                {financialTips.specificWarnings && (
                  <Card className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-amber-500">
                    <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-amber-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      Watch Out
                    </h4>
                    <div className="prose mt-2 text-sm">
                      <ReactMarkdown>
                        {financialTips.specificWarnings}
                      </ReactMarkdown>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Time-Based Summaries */}
          {timeBasedSummaries && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b-2 pb-2">
                Time Analysis
              </h3>

              <div className="grid md:grid-cols-3 gap-4">
                {/* Weekly Summary */}
                <Card className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="text-sm font-medium text-gray-500">
                    This Week
                  </h4>
                  {timeBasedSummaries.weekly ? (
                    <>
                      <p className="text-2xl font-bold mt-2">
                        {formatINR(timeBasedSummaries.weekly.totalSpent)}
                      </p>
                      <p className="text-sm mt-1 text-gray-600">
                        {timeBasedSummaries.weekly.topCategory}
                      </p>
                      <Badge
                        variant={
                          timeBasedSummaries.weekly.cashFlow?.includes(
                            "Surplus"
                          )
                            ? "default"
                            : "destructive"
                        }
                        className="mt-2"
                      >
                        {timeBasedSummaries.weekly.cashFlow}
                      </Badge>
                    </>
                  ) : (
                    <p className="text-gray-400 mt-2">No weekly data</p>
                  )}
                </Card>

                {/* Monthly Summary */}
                <Card className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="text-sm font-medium text-gray-500">
                    This Month
                  </h4>
                  {timeBasedSummaries.monthly ? (
                    <>
                      <p className="text-2xl font-bold mt-2">
                        {formatINR(timeBasedSummaries.monthly.totalSpent)}
                      </p>
                      {timeBasedSummaries.monthly.savingsRate && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Savings Rate</p>
                          <Progress
                            value={
                              parseFloat(
                                String(
                                  timeBasedSummaries?.monthly?.savingsRate || ""
                                ).replace("%", "")
                              ) || 0
                            }
                            className="h-2 mt-1 bg-green-100"
                            indicatorClassName="bg-green-600"
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-400 mt-2">No monthly data</p>
                  )}
                </Card>

                {/* Trends */}
                <Card className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="text-sm font-medium text-gray-500">
                    Key Trends
                  </h4>
                  {timeBasedSummaries.trends?.p2pTransfers ? (
                    <div className="mt-2 space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">P2P Net Flow</p>
                        <p className="font-medium">
                          {timeBasedSummaries.trends.p2pTransfers.netFlow}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Top Counterparties
                        </p>
                        <div className="space-y-1 mt-1">
                          {timeBasedSummaries.trends.p2pTransfers.primaryCounterparties?.map(
                            (cp, i) => (
                              <p key={i} className="text-xs">
                                {cp}
                              </p>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 mt-2">No trend data</p>
                  )}
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Anomalies Section */}
      {spendingPatterns.anomalies?.length > 0 && (
        <Card className="border shadow-sm rounded-lg bg-red-50">
          <CardHeader className="px-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <CardTitle className="lg:text-xl text-lg font-bold text-red-800">
                Unusual Activity Detected
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-4">
            <div className="space-y-4">
              {spendingPatterns.anomalies.map((anomaly, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row gap-4 p-3 bg-white rounded-lg shadow-sm"
                >
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium">{anomaly.description}</p>
                      <Badge variant="destructive">
                        {formatINR(anomaly.amount)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(parseISO(anomaly.date), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{anomaly.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

// Helper function to format INR values
const formatINR = (value) => {
  if (typeof value !== "number") return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace("₹", "₹ ");
};

export default FinancialInsightsCard;
