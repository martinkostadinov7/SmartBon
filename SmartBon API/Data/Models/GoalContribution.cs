namespace Data.Models
{
    public class GoalContribution : IEntity
    {
        public int Id { get; set; }

        public decimal Amount { get; set; }

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
