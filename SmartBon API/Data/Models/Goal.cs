namespace Data.Models
{
    public class Goal : IEntity
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public decimal FinalAmount { get; set; }

        public decimal CurrentAmount { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime TargetDate { get; set; }

        public string Icon { get; set; }

        public string ColorHex { get; set; }

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
