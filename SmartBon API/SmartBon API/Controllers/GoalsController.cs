using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using Shared.DTOs.Goals;
using Shared.DTOs.Goals.Contributions;

namespace SmartBon_API.Controllers
{
    /// <summary>
    /// API endpoints for managing user financial goals and tracking goal contributions.
    /// </summary>
    [Authorize]
    [Route("/api/[controller]")]
    [ApiController]
    public class GoalsController(IGoalService goalService, IGoalContributionService goalContributionService) : ControllerBase
    {
        /// <summary> Creates a new financial goal. </summary>
        [HttpPost]
        public async Task<ActionResult<GoalReadDto>> CreateGoal(GoalCreateDto request)
        {
            GoalReadDto result = await goalService.CreateGoalAsync(request);
            return CreatedAtAction(nameof(GetGoalById), new { id = result.Id }, result);
        }

        /// <summary> Retrieves a specific goal by its ID. </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<GoalReadDto>> GetGoalById(int id)
        {
            GoalReadDto result = await goalService.GetGoalByIdAsync(id);
            return Ok(result);
        }

        /// <summary> Retrieves all currently active financial goals. </summary>
        [HttpGet]
        public async Task<ActionResult<List<GoalReadDto>>> GetGoals()
        {
            List<GoalReadDto> result = await goalService.GetActiveGoalsAsync();
            return Ok(result);
        }

        /// <summary> Retrieves all successfully completed (realised) goals. </summary>
        [HttpGet("realised")]
        public async Task<ActionResult<List<GoalReadDto>>> GetRealisedGoals()
        {
            List<GoalReadDto> result = await goalService.GetRealisedGoalsAsync();
            return Ok(result);
        }

        /// <summary> Deletes a specific goal. </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult<GoalReadDto>> DeleteGoal(int id)
        {
            GoalReadDto result = await goalService.DeleteGoalAsync(id);
            return Ok(result);
        }

        /// <summary> Updates the properties of an existing goal. </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<GoalReadDto>> UpdateGoal(int id, [FromBody] GoalUpdateDto request)
        {
            GoalReadDto result = await goalService.UpdateGoalAsync(id, request);
            return Ok(result);
        }

        /// <summary> Adds a monetary contribution towards a specific goal. </summary>
        [HttpPost("{goalId}/contributions")]
        public async Task<ActionResult> CreateGoalContribution(GoalContributionCreateDto request)
        {
            await goalContributionService.CreateGoalContributionAsync(request);
            return Created();
        }

        /// <summary> Removes a contribution from a goal and updates the goal's balance. </summary>
        [HttpDelete("{goalId}/contributions/{id}")]
        public async Task<ActionResult<GoalContributionReadDto>> DeleteGoalContribution(int id)
        {
            GoalContributionReadDto result = await goalContributionService.DeleteGoalContributionAsync(id);
            return Ok(result);
        }

        /// <summary> Modifies an existing contribution and adjusts the goal's overall balance accordingly. </summary>
        [HttpPut("{goalId}/contributions/{id}")]
        public async Task<ActionResult<GoalContributionReadDto>> UpdateGoalContribution(int id, [FromBody] GoalContributionUpdateDto request)
        {
            GoalContributionReadDto result = await goalContributionService.UpdateGoalContributionAsync(id, request);
            return Ok(result);
        }

        /// <summary> Marks an active goal as completed (realised). </summary>
        [HttpPatch("{id}/realise")]
        public async Task<ActionResult> RealiseGoal(int id)
        {
            await goalService.RealiseGoalAsync(id);
            return Ok();
        }
    }
}