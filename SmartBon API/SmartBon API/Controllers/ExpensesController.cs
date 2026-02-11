using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using Shared.DTOs.ExpenseDTOs;
using Shared.DTOs.ExpenseDTOs.Ranges;
namespace SmartBon_API.Controllers
{
    [Route("/api/[controller]")]
    [ApiController]
    public class ExpensesController(IExpenseService expenseService) : ControllerBase
    {
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<ExpenseReadDto>> CreateExpense(ExpenseCreateDto request)
        {
            ExpenseReadDto result = await expenseService.CreateExpenseAsync(request);    
            return CreatedAtAction(nameof(GetExpenseById), new { id = result.Id }, result);
        }


        [Authorize]
        [HttpPost("upload-receipt")]
        public async Task<ActionResult<ExpenseFilledFromImageDto>> ExtractExpenseData(IFormFile image)
        {
            ExpenseFilledFromImageDto result = await expenseService.ExtractExpenseDataAsync(image);
            return result;
        }


        [Authorize]
        [HttpGet]
        public async Task<ActionResult<List<ExpenseReadDto>>> GetExpensesWithQueryParams([FromQuery] ExpenseQueryParams queryParams) 
        {
            List<ExpenseReadDto> result = await expenseService.GetExpensesWithQueryParamsAsync(queryParams);
            return Ok(result);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<ExpenseReadDto>> GetExpenseById(int id)
        {
            ExpenseReadDto result = await expenseService.GetExpenseByIdAsync(id);
            return Ok(result);  
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<ActionResult<ExpenseReadDto>> DeleteExpense(int id)
        {
            ExpenseReadDto result = await expenseService.DeleteExpenseAsync(id);
            return Ok(result);  
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult<ExpenseReadDto>> UpdateExpense(int id, [FromBody] ExpenseUpdateDto request)
        {
            ExpenseReadDto result = await expenseService.UpdateExpenseAsync(id, request);
            return Ok(result);
        }

        [Authorize]
        [HttpGet("recent/{count}")]
        public async Task<ActionResult<List<ExpenseReadDto>>> GetRecentExpenses(int count)
        {
            List<ExpenseReadDto> result = await expenseService.GetRecentExpensesAsync(count);
            return Ok(result);
        }

        [Authorize]
        [HttpGet("costRange")]
        public async Task<ActionResult<CostRangeDto>> GetCostRange()  
        {
            CostRangeDto result = await expenseService.GetCostRangeAsync();
            return Ok(result);
        }

        [Authorize]
        [HttpGet("dateRange")]
        public async Task<ActionResult<DateRangeDto>> GetDateRange()
        {
            DateRangeDto result = await expenseService.GetDateRangeAsync();
            return Ok(result);
        }
    }
}
