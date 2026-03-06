using Shared.Enums;

namespace Shared.DTOs.Statistics
{
    public class MonthlyReport
    {
        public string MonthName { get; set; }
        public int TotalTransactionsCount { get; set; }
        public int TotalCountDifference { get; set; }
        public decimal TotalSpent { get; set; }
        public decimal TotalSpentDifference { get; set; }
        public decimal PercentageChange { get; set; }
        public int NoSpendDaysCount { get; set; }
        public decimal AverageSpentPerDay { get; set; }
        public int TopCategoryId { get; set; }
        public decimal TopAmount { get; set; }
        public DateTime MostExpensiveDay { get; set; }
        public decimal MostExpensiveDayAmount { get; set; }
        public PaymentType PreferredPaymentMethod { get; set; }
    }
}
