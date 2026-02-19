namespace Shared.DTOs.Goals
{
    public class GoalCreateDto
    {
        public string Name { get; set; }

        public string Description { get; set; }

        public decimal FinalAmount { get; set; }

        public DateTime TargetDate { get; set; }

        public string Icon { get; set; }

        public string ColorHex { get; set; }
    }
}
