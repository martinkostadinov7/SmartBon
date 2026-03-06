using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using Shared.DTOs.Expenses;
using Shared.DTOs.Statistics;

namespace SmartBon_API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("/api/[controller]")]
    public class StatisticsController(IStatisticsService statisticsService) : ControllerBase
    {
        [HttpGet("contributionGraph")]
        public async Task<ActionResult<ContributionGraphData>> ContributionGraph()
        {
            ContributionGraphData result = await statisticsService.GetContributionGraphAsync();
            return Ok(result);  
        }

        [HttpGet("expensesLineChart")]
        public async Task<ActionResult<ExpensesLineChart>> ExpensesLineChart([FromQuery] string range)
        {
            ExpensesLineChart result = await statisticsService.GetExpensesLineChartAsync(range);
            return Ok(result);
        }

        [HttpGet("categoriesPieChart")]
        public async Task<ActionResult<CategoriesPieChart>> CategoriesPieChart([FromQuery] ExpenseQueryParams queryParams)
        {
            CategoriesPieChart result = await statisticsService.GetCategoriesPieChartAsync(queryParams);
            return Ok(result);
        }

        [HttpGet("paymentTypePieChart")]
        public async Task<ActionResult<PaymentTypePieChart>> PaymentTypePieChart([FromQuery] ExpenseQueryParams queryParams)
        {
            PaymentTypePieChart result = await statisticsService.GetPaymentTypePieChartAsync(queryParams);
            return Ok(result);
        }

        [HttpGet("daysBarChart")]
        public async Task<ActionResult<DaysBarChart>> DaysBarChart()
        {
            DaysBarChart result = await statisticsService.GetDaysBarChartAsync();
            return Ok(result);
        }

        [HttpGet("monthlyReport")]
        public async Task<ActionResult<MonthlyReport>> MonthlyReport()
        {
            MonthlyReport result = await statisticsService.GetMonthlyReportAsync();
            return Ok(result);
        }
    }
}
