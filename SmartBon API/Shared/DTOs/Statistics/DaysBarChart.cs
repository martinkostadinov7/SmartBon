namespace Shared.DTOs.Statistics
{
    public class DaysBarChart
    {
        public List<string> Labels { get; set; }
        public List<Dataset> Datasets { get; set; }

        public record Dataset(List<decimal> Data);
    }
}
