namespace Data.Models
{
    /// <summary>
    /// Represents a user's financial saving goal.
    /// </summary>
    public class Goal : IEntity
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        /// <summary> The target monetary amount the user wants to save. </summary>
        public decimal FinalAmount { get; set; }

        /// <summary> The current amount saved towards the goal. </summary>
        public decimal CurrentAmount { get; set; }

        public DateTime StartDate { get; set; }

        /// <summary> The deadline by which the user aims to complete the goal. </summary>
        public DateTime TargetDate { get; set; }

        public string Icon { get; set; }

        public string ColorHex { get; set; }

        /// <summary> Indicates if the goal is currently ongoing. </summary>
        public bool IsActive { get; set; } = true;

        public int UserId { get; set; }
        public User User { get; set; }

        public List<GoalContribution> Contributions { get; set; } = new List<GoalContribution>();

        private Goal() { }

        public Goal(string name, string description, decimal finalAmount, decimal currentAmount, string icon, string colorHex, int userId)
        {
            Icon = icon;
            ColorHex = colorHex;
            Name = name;
            Description = description;
            FinalAmount = finalAmount;
            CurrentAmount = currentAmount;
            UserId = userId;
        }
    }
}