namespace Shared.DTOs.Goals.Contributions
{
    public class GoalContributionCreateDto
    {
        public decimal Amount { get; set; }

        public DateTime DateTime { get; set; }

        public int GoalId { get; set; }
    }
}
