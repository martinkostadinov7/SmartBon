using Shared.Enums;

namespace Data.Models
{
    /// <summary>
    /// Represents a financial budget limit set for specific categories or subcategories over a defined period.
    /// </summary>
    public class Budget : IEntity
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string? Description { get; set; }

        public User User { get; set; }

        public int UserId { get; set; }

        /// <summary> The start date of the budget period. </summary>
        public DateTime From { get; set; }

        /// <summary> The end date of the budget period. </summary>
        public DateTime To { get; set; }

        /// <summary> Defines the recurring frequency or type of the budget period (e.g., Monthly, Custom). </summary>
        public BudgetDateRange DateRange { get; set; }

        /// <summary> The maximum financial limit allowed for this budget. </summary>
        public decimal Limit { get; set; }

        /// <summary> The total amount currently spent within this budget. </summary>
        public decimal CurrentAmount { get; set; }

        public string Icon { get; set; }

        /// <summary> The hex color code used for UI representation. </summary>
        public string ColorHex { get; set; }

        /// <summary> Indicates whether the budget is currently active and should be tracked. </summary>
        public bool IsActive { get; set; } = false;

        public List<int> CategoryIds { get; set; } = new List<int>();

        public List<int> SubcategoryIds { get; set; } = new List<int>();

        private Budget() { }

        public Budget(string name, string? description, int userId, DateTime from,
            DateTime to, BudgetDateRange dateRange, decimal limit, decimal currentAmount, string icon, string colorHex, List<int> categoryIds, List<int> subCategoryIds)
        {
            Name = name;
            Description = description;
            UserId = userId;
            From = from;
            To = to;
            DateRange = dateRange;
            Limit = limit;
            CurrentAmount = currentAmount;
            Icon = icon;
            ColorHex = colorHex;
            CategoryIds = categoryIds;
            SubcategoryIds = subCategoryIds;
        }
    }
}