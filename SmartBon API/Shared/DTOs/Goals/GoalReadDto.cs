using Shared.DTOs.Goals.Contributions;

namespace Shared.DTOs.Goals
{
    public class GoalReadDto
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

        public List<GoalContributionReadDto> Contributions { get; set; } = new List<GoalContributionReadDto>();
    }
}
