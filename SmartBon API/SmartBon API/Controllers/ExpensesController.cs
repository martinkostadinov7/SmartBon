using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using Shared.DTOs.ExpenseDTOs;
namespace SmartBon_API.Controllers
{
    [Route("/api/[controller]")]
    [ApiController]
    public class ExpensesController(IExpenseService expenseService) : ControllerBase
    {
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<string>> CreateExpense(ExpenseCreateDto request)
        {
            ExpenseReadDto result = await expenseService.CreateExpenseAsync(request);    
            return CreatedAtAction(nameof(GetExpenseById), new { id = result.Id }, result);
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<string>> GetExpenses() // todo imeplemtn parameters for filtering and searching
        {
            List<ExpenseReadDto> result = await expenseService.GetExpensesAsync();
            return Ok(result);
        }   

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<string>> GetExpenseById(int id)
        {
            ExpenseReadDto result = await expenseService.GetExpenseByIdAsync(id);
            return Ok(result);  
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<ActionResult<string>> DeleteExpense(int id)
        {
            ExpenseReadDto result = await expenseService.DeleteExpenseAsync(id);
            return Ok(result);  
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult<string>> UpdateExpense(int id, [FromBody] ExpenseUpdateDto request)
        {
            ExpenseReadDto result = await expenseService.UpdateExpenseAsync(id, request);
            return Ok(result);
        }

        [Authorize]
        [HttpGet("recent/{count}")]
        public async Task<ActionResult<string>> GetRecentExpenses(int count) // todo imeplemtn parameters for filtering and searching
        {
            List<ExpenseReadDto> result = await expenseService.GetRecentExpensesAsync(count);
            return Ok(result);
        }
    }
}
