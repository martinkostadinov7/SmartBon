using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Goals;
using Services.Interfaces;
using Shared.DTOs.Goals;
using Shared.DTOs.Goals.Contributions;

namespace SmartBon_API.Controllers
{
    [Route("/api/[controller]")]
    [ApiController]
    public class GoalsController(IGoalService goalService, IGoalContributionService goalContributionService) : ControllerBase
    {
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<string>> CreateGoal(GoalCreateDto request)
        {
            GoalReadDto result = await goalService.CreateGoalAsync(request);
            return CreatedAtAction(nameof(GetGoalById), new { id = result.Id }, result);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<string>> GetGoalById(int id)
        {
            GoalReadDto result = await goalService.GetGoalByIdAsync(id);
            return Ok(result);
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<string>> GetGoals()
        {
            List<GoalReadDto> result = await goalService.GetGoalsAsync();
            return Ok(result);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<ActionResult<string>> DeleteGoal(int id)
        {
            GoalReadDto result = await goalService.DeleteGoalAsync(id);
            return Ok(result);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult<string>> UpdateGoal(int id, [FromBody] GoalUpdateDto request)
        {
            GoalReadDto result = await goalService.UpdateGoalAsync(id, request);
            return Ok(result);
        }

        [Authorize]
        [HttpPost("{goalId}/contributions")]
        public async Task<ActionResult<string>> CreateGoalContribution(GoalContributionCreateDto request)
        {
            GoalContributionReadDto result = await goalContributionService.CreateGoalContributionAsync(request);
            return Created();
        }

        [Authorize]
        [HttpDelete("{goalId}/contributions/{id}")]
        public async Task<ActionResult<string>> DeleteGoalContribution(int id)
        {
            GoalContributionReadDto result = await goalContributionService.DeleteGoalContributionAsync(id);
            return Ok(result);
        }

        [Authorize]
        [HttpPut("{goalId}/contributions/{id}")]
        public async Task<ActionResult<string>> UpdateGoalContribution(int id, [FromBody] GoalContributionUpdateDto request)
        {
            GoalContributionReadDto result = await goalContributionService.UpdateGoalContributionAsync(id, request);
            return Ok(result);
        }
    }
}
