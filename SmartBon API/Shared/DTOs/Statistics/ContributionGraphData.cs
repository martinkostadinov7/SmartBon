namespace Shared.DTOs.Statistics
{
    public class ContributionGraphData
    {
        public List<PointCount> PointsCount { get; set; } = new();

        public List<PointAmount> PointsAmount { get; set; } = new();

        public record PointCount(DateTime Date, int Count);

        public record PointAmount(DateTime Date, decimal Amount);
    }
}
