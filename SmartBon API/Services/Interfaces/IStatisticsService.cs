using Shared.DTOs.Expenses;
using Shared.DTOs.Statistics;

namespace Services.Interfaces
{
    /// <summary>
    /// Service responsible for generating various statistical reports and charts based on user financial data.
    /// </summary>
    public interface IStatisticsService
    {
        /// <summary> Generates data for a contribution graph (often used to visualize savings or goal progress over time). </summary>
        public Task<ContributionGraphData> GetContributionGraphAsync();

        /// <summary> Generates data for a line chart visualizing expenses over a specified time range. </summary>
        public Task<ExpensesLineChart> GetExpensesLineChartAsync(string range);

        /// <summary> Generates data for a pie chart breaking down expenses by category, based on filter parameters. </summary>
        public Task<CategoriesPieChart> GetCategoriesPieChartAsync(ExpenseQueryParams expenseQueryParams);

        /// <summary> Generates data for a pie chart breaking down expenses by payment method. </summary>
        public Task<PaymentTypePieChart> GetPaymentTypePieChartAsync(ExpenseQueryParams expenseQueryParams);

        /// <summary> Generates data for a bar chart visualizing expenses distributed by days. </summary>
        public Task<DaysBarChart> GetDaysBarChartAsync();

        /// <summary> Generates a comprehensive monthly financial report for the currently authenticated user. </summary>
        public Task<MonthlyReport> GetMonthlyReportAsync();

        /// <summary> Generates a comprehensive monthly financial report for a specific user ID (used by background workers). </summary>
        public Task<MonthlyReport> GetMonthlyReportAsync(int id);
    }
}   