using Shared.DTOs.Expenses;
using Shared.DTOs.Statistics;

namespace Services.Interfaces
{
    public interface IStatisticsService
    {
        public Task<ContributionGraphData> GetContributionGraphAsync();
        public Task<ExpensesLineChart> GetExpensesLineChartAsync(string range);
        public Task<CategoriesPieChart> GetCategoriesPieChartAsync(ExpenseQueryParams expenseQueryParams);
        public Task<PaymentTypePieChart> GetPaymentTypePieChartAsync(ExpenseQueryParams expenseQueryParams);
        public Task<DaysBarChart> GetDaysBarChartAsync();
        public Task<MonthlyReport> GetMonthlyReportAsync();
        public Task<MonthlyReport> GetMonthlyReportAsync(int id);
    }
}
