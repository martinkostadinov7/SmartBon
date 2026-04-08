using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using Shared.DTOs.Expenses;
using Shared.DTOs.Statistics;

namespace SmartBon_API.Controllers
{
    /// <summary>
    /// API endpoints for retrieving aggregated statistical data and charts.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("/api/[controller]")]
    public class StatisticsController(IStatisticsService statisticsService) : ControllerBase
    {
        /// <summary> Retrieves data formatted for generating a goal contribution chart. </summary>
        [HttpGet("contributionGraph")]
        public async Task<ActionResult<ContributionGraphData>> ContributionGraph()
        {
            ContributionGraphData result = await statisticsService.GetContributionGraphAsync();
            return Ok(result);
        }

        /// <summary> Retrieves data formatted for a line chart showing expenses over a specified time range. </summary>
        [HttpGet("expensesLineChart")]
        public async Task<ActionResult<ExpensesLineChart>> ExpensesLineChart([FromQuery] string range)
        {
            ExpensesLineChart result = await statisticsService.GetExpensesLineChartAsync(range);
            return Ok(result);
        }

        /// <summary> Retrieves data formatted for a pie chart detailing expenses by category. </summary>
        [HttpGet("categoriesPieChart")]
        public async Task<ActionResult<CategoriesPieChart>> CategoriesPieChart([FromQuery] ExpenseQueryParams queryParams)
        {
            CategoriesPieChart result = await statisticsService.GetCategoriesPieChartAsync(queryParams);
            return Ok(result);
        }

        /// <summary> Retrieves data formatted for a pie chart detailing expenses by payment type. </summary>
        [HttpGet("paymentTypePieChart")]
        public async Task<ActionResult<PaymentTypePieChart>> PaymentTypePieChart([FromQuery] ExpenseQueryParams queryParams)
        {
            PaymentTypePieChart result = await statisticsService.GetPaymentTypePieChartAsync(queryParams);
            return Ok(result);
        }

        /// <summary> Retrieves data formatted for a bar chart showing expenses distributed across days. </summary>
        [HttpGet("daysBarChart")]
        public async Task<ActionResult<DaysBarChart>> DaysBarChart()
        {
            DaysBarChart result = await statisticsService.GetDaysBarChartAsync();
            return Ok(result);
        }

        /// <summary> Generates a comprehensive monthly financial summary report. </summary>
        [HttpGet("monthlyReport")]
        public async Task<ActionResult<MonthlyReport>> MonthlyReport()
        {
            MonthlyReport result = await statisticsService.GetMonthlyReportAsync();
            return Ok(result);
        }
    }
}