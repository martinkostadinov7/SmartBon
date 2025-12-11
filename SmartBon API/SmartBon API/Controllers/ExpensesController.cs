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
            ExpenseReadDto result = await expenseService.CreateExpense(request);    
            return CreatedAtAction(nameof(GetExpenseById), new { id = result.Id }, result);
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<string>> GetExpenses() // todo imeplemtn parameters for filtering and searching
        {
            List<ExpenseReadDto> result = await expenseService.GetExpenses();
            return Ok(result);
        }   

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<string>> GetExpenseById(int id)
        {
            ExpenseReadDto result = await expenseService.GetExpenseById(id);
            return Ok(result);  
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<ActionResult<string>> DeleteExpense(int id)
        {
            ExpenseReadDto result = await expenseService.DeleteExpense(id);
            return Ok(result);  
        }
    }
}
