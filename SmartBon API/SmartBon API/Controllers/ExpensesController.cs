using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using Shared.DTOs;
using Shared.DTOs.Expenses;
using Shared.DTOs.Expenses.Ranges;
using Shared.DTOs.Expenses.Recurring;
namespace SmartBon_API.Controllers
{
    [Route("/api/[controller]")]
    [ApiController]
    public class ExpensesController(IExpenseService expenseService) : ControllerBase
    {
        [HttpPost]
        public async Task<ActionResult<ExpenseReadDto>> CreateExpense(ExpenseCreateDto request)
        {
            ExpenseReadDto result = await expenseService.CreateExpenseAsync(request);    
            return CreatedAtAction(nameof(GetExpenseById), new { id = result.Id }, result);
        }

        [HttpPost("recurring")]
        public async Task<ActionResult<ExpenseReadDto>> CreateRecurringExpense(RecurringExpenseCreateDto request)
        {
            ExpenseReadDto result = await expenseService.CreateRecurringExpenseAsync(request);
            return CreatedAtAction(nameof(GetExpenseById), new { id = result.Id }, result);
        }

        [HttpGet("recurring")]
        public async Task<ActionResult<List<RecurringExpenseReadDto>>> GetAllRecurringExpenses()
        {
            List<RecurringExpenseReadDto> result = await expenseService.GetAllRecurringExpenses();
            return result;
        }

        [HttpPost("upload-receipt")]
        public async Task<ActionResult<ExpenseFilledFromImageDto>> ExtractExpenseData([FromForm] IFormFile image)
        {
            ExpenseFilledFromImageDto result = await expenseService.ExtractExpenseDataAsync(image);
            return result;
        }


        [HttpGet]
        public async Task<ActionResult<List<ExpenseReadDto>>> GetExpensesWithQueryParams([FromQuery] ExpenseQueryParams queryParams) 
        {
            List<ExpenseReadDto> result = await expenseService.GetExpensesWithQueryParamsAsync(queryParams);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ExpenseReadDto>> GetExpenseById(int id)
        {
            ExpenseReadDto result = await expenseService.GetExpenseByIdAsync(id);
            return Ok(result);  
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ExpenseReadDto>> DeleteExpense(int id)
        {
            ExpenseReadDto result = await expenseService.DeleteExpenseAsync(id);
            return Ok(result);  
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ExpenseReadDto>> UpdateExpense(int id, [FromBody] ExpenseUpdateDto request)
        {
            ExpenseReadDto result = await expenseService.UpdateExpenseAsync(id, request);
            return Ok(result);
        }

        [HttpGet("recent/{count}")]
        public async Task<ActionResult<List<ExpenseReadDto>>> GetRecentExpenses(int count)
        {
            List<ExpenseReadDto> result = await expenseService.GetRecentExpensesAsync(count);
            return Ok(result);
        }

        [HttpGet("costRange")]
        public async Task<ActionResult<CostRangeDto>> GetCostRange()  
        {
            CostRangeDto result = await expenseService.GetCostRangeAsync();
            return Ok(result);
        }

        [HttpGet("dateRange")]
        public async Task<ActionResult<DateRangeDto>> GetDateRange()
        {
            DateRangeDto result = await expenseService.GetDateRangeAsync();
            return Ok(result);
        }

        [HttpGet("export")]
        public async Task<ActionResult<ExportFileResultDto>> ExportExpenses([FromQuery] ExpenseQueryParams queryParams)
        {
            ExportFileResultDto result = await expenseService.ExportExpensesAsync(queryParams);
            return File(
                    result.Content,
                    result.ContentType,
                    result.FileName
                );
        }

        [HttpPost("import")]
        public async Task<ActionResult<ExportFileResultDto>> ImportExpenses([FromForm] IFormFile csvFile)
        {
            await expenseService.ImportExpensesAsync(csvFile);
            return Ok();
        }
    }
}
