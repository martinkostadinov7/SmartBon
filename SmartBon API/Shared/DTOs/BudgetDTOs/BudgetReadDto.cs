namespace Shared.DTOs.BudgetDTOs
{
    public class BudgetReadDto
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string? Description { get; set; }

        public DateTime From { get; set; }

        public DateTime To { get; set; }

        public decimal Limit { get; set; }

        public decimal CurrentAmount { get; set; }

        public string Icon { get; set; }

        public string ColorHex { get; set; }

        public List<int> CategoryIds { get; set; }

        public List<int>? SubcategoryIds { get; set; }
    }
}
