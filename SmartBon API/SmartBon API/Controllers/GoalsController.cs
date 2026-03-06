using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Goals;
using Services.Interfaces;
using Shared.DTOs.Goals;
using Shared.DTOs.Goals.Contributions;

namespace SmartBon_API.Controllers
{
    [Authorize]
    [Route("/api/[controller]")]
    [ApiController]
    public class GoalsController(IGoalService goalService, IGoalContributionService goalContributionService) : ControllerBase
    {
        [HttpPost]
        public async Task<ActionResult<string>> CreateGoal(GoalCreateDto request)
        {
            GoalReadDto result = await goalService.CreateGoalAsync(request);
            return CreatedAtAction(nameof(GetGoalById), new { id = result.Id }, result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<string>> GetGoalById(int id)
        {
            GoalReadDto result = await goalService.GetGoalByIdAsync(id);
            return Ok(result);
        }

        [HttpGet]
        public async Task<ActionResult<string>> GetGoals()
        {
            List<GoalReadDto> result = await goalService.GetActiveGoalsAsync();
            return Ok(result);
        }

        [HttpGet("realised")]
        public async Task<ActionResult<string>> GetRealisedGoals()
        {
            List<GoalReadDto> result = await goalService.GetRealisedGoalsAsync();
            return Ok(result);
        }
        
        [HttpDelete("{id}")]
        public async Task<ActionResult<string>> DeleteGoal(int id)
        {
            GoalReadDto result = await goalService.DeleteGoalAsync(id);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<string>> UpdateGoal(int id, [FromBody] GoalUpdateDto request)
        {
            GoalReadDto result = await goalService.UpdateGoalAsync(id, request);
            return Ok(result);
        }

        [HttpPost("{goalId}/contributions")]
        public async Task<ActionResult<string>> CreateGoalContribution(GoalContributionCreateDto request)
        {
            GoalContributionReadDto result = await goalContributionService.CreateGoalContributionAsync(request);
            return Created();
        }

        [HttpDelete("{goalId}/contributions/{id}")]
        public async Task<ActionResult<string>> DeleteGoalContribution(int id)
        {
            GoalContributionReadDto result = await goalContributionService.DeleteGoalContributionAsync(id);
            return Ok(result);
        }

        [HttpPut("{goalId}/contributions/{id}")]
        public async Task<ActionResult<string>> UpdateGoalContribution(int id, [FromBody] GoalContributionUpdateDto request)
        {
            GoalContributionReadDto result = await goalContributionService.UpdateGoalContributionAsync(id, request);
            return Ok(result);
        }

        [HttpPatch("{id}/realise")]
        public async Task<ActionResult<string>> RealisGoal(int id)
        {
            await goalService.RealiseGoalAsync(id);
            return Ok();
        }
    }
}
