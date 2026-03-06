namespace Shared.DTOs.Statistics
{
    public class PaymentTypePieChart
    {
        public List<PaymentTypeData> PaymentTypePieChartData { get; set; }

        public record PaymentTypeData(string Name, decimal Population, string Color, string LegendFontColor, int LegendFontSize);

    }
}
