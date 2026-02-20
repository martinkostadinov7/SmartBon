using Shared.Enums;

namespace Data.Models
{
    public class Budget : IEntity
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string? Description { get; set; }

        public User User { get; set; }

        public int UserId { get; set; }

        public DateTime From { get; set; }

        public DateTime To { get; set; }

        public BudgetDateRange DateRange { get; set; }

        public decimal Limit { get; set; }

        public decimal CurrentAmount { get; set; }

        public string Icon { get; set; }

        public string ColorHex { get; set; }

        public bool IsActive { get; set; } = false;

        public List<int> CategoryIds { get; set; } = new List<int>();

        public List<int> SubcategoryIds { get; set; } = new List<int>();

        private Budget() {}

        public Budget(string name, string? description, int userId, DateTime from, 
            DateTime to,BudgetDateRange dateRange ,decimal limit, decimal currentAmount, string icon, string colorHex, List<int> categoryIds, List<int> subCategoryIds)
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
