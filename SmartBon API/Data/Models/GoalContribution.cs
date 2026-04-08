namespace Data.Models
{
    /// <summary>
    /// Represents a single monetary deposit towards a specific financial goal.
    /// </summary>
    public class GoalContribution : IEntity
    {
        public int Id { get; set; }

        /// <summary> The amount contributed. </summary>
        public decimal Amount { get; set; }

        /// <summary> The date and time the contribution was made. </summary>
        public DateTime DateTime { get; set; }

        public int GoalId { get; set; }
        public Goal Goal { get; set; }

        private GoalContribution() { }

        public GoalContribution(decimal amount, DateTime dateTime, int goalId)
        {
            Amount = amount;
            DateTime = dateTime;
            GoalId = goalId;
        }
    }
}