namespace Shared.DTOs.Statistics
{
    public class CategoriesPieChart
    {
        public List<CategoryChartData> CategoryData { get; set; }

        public List<CategoryChartData> SubcategoryData { get; set; }

        public record CategoryChartData(string Name, decimal Population, string Color, string LegendFontColor, int LegendFontSize);
    }
}
