using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using Shared.DTOs.Budgets;

namespace SmartBon_API.Controllers
{
    /// <summary>
    /// API endpoints for managing financial budgets.
    /// </summary>
    [Authorize]
    [Route("/api/[controller]")]
    [ApiController]
    public class BudgetsController(IBudgetService budgetService) : ControllerBase
    {
        /// <summary> Creates a new budget. </summary>
        [HttpPost]
        public async Task<ActionResult<BudgetReadDto>> CreateBudget(BudgetCreateDto request)
        {
            BudgetReadDto result = await budgetService.CreateBudgetAsync(request);
            return CreatedAtAction(nameof(GetBudgetById), new { id = result.Id }, result);
        }

        /// <summary> Retrieves a specific budget by its unique identifier. </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<BudgetReadDto>> GetBudgetById(int id)
        {
            BudgetReadDto result = await budgetService.GetBudgetByIdAsync(id);
            return Ok(result);
        }

        /// <summary> Retrieves all currently active budgets for the authenticated user. </summary>
        [HttpGet()]
        public async Task<ActionResult<List<BudgetReadDto>>> GetActiveBudgets()
        {
            List<BudgetReadDto> result = await budgetService.GetActiveBudgetsAsync();
            return Ok(result);
        }

        /// <summary> Retrieves all archived (past) budgets for the authenticated user. </summary>
        [HttpGet("archived")]
        public async Task<ActionResult<List<BudgetReadDto>>> GetArchivedBudgets()
        {
            List<BudgetReadDto> result = await budgetService.GetArchivedBudgetsAsync();
            return Ok(result);
        }

        /// <summary> Permanently deletes a specific budget. </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult<BudgetReadDto>> DeleteBudget(int id)
        {
            BudgetReadDto result = await budgetService.DeleteBudgetAsync(id);
            return Ok(result);
        }

        /// <summary> Updates the details of an existing budget. </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<BudgetReadDto>> UpdateBudget(int id, [FromBody] BudgetUpdateDto request)
        {
            BudgetReadDto result = await budgetService.UpdateBudgetAsync(id, request);
            return Ok(result);
        }

        /// <summary> Marks an active budget as archived. </summary>
        [HttpPatch("{id}/archive")]
        public async Task<ActionResult> ArchiveBudget(int id)
        {
            await budgetService.ArchiveBudgetAsync(id);
            return Ok();
        }
    }
}