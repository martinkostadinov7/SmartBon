using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using Shared.DTOs.Budgets;

namespace SmartBon_API.Controllers
{
    [Route("/api/[controller]")]
    [ApiController]
    public class BudgetsController(IBudgetService budgetService) : ControllerBase
    {
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<string>> CreateBudget(BudgetCreateDto request)
        {
            BudgetReadDto result = await budgetService.CreateBudgetAsync(request);
            return CreatedAtAction(nameof(GetBudgetById), new { id = result.Id }, result);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<string>> GetBudgetById(int id)
        {
            BudgetReadDto result = await budgetService.GetBudgetByIdAsync(id);
            return Ok(result);
        }

        [Authorize]
        [HttpGet()]
        public async Task<ActionResult<string>> GetActiveBudgets()
        {
            List<BudgetReadDto> result = await budgetService.GetActiveBudgetsAsync();
            return Ok(result);
        }

        [Authorize]
        [HttpGet("archived")]
        public async Task<ActionResult<string>> GetArchivedBudgets()
        {
            List<BudgetReadDto> result = await budgetService.GetArchivedBudgetsAsync();
            return Ok(result);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<ActionResult<string>> DeleteBudget(int id)
        {
            BudgetReadDto result = await budgetService.DeleteBudgetAsync(id);
            return Ok(result);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult<string>>UpdateBudget(int id, [FromBody] BudgetUpdateDto request)
        {
            BudgetReadDto result = await budgetService.UpdateBudgetAsync(id, request);
            return Ok(result);
        }

        [Authorize]
        [HttpPatch("{id}/archive")]
        public async Task<ActionResult<string>> GetArchivedBudgets(int id)
        {
            await budgetService.ArchiveBudgetAsync(id);
            return Ok();
        }
    }
}
