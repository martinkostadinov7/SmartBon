using AutoMapper;
using Data.Models;
using Shared.DTOs.Goals;
using Shared.DTOs.Goals.Contributions;
namespace Services.Mappings
{
    public class GoalProfile : Profile
    {
        public GoalProfile()
        {
            CreateMap<Goal, GoalReadDto>();
            CreateMap<GoalCreateDto, Goal>();
            CreateMap<GoalUpdateDto, Goal>();

            CreateMap<GoalContribution, GoalContributionReadDto>();
            CreateMap<GoalContributionCreateDto, GoalContribution>();
            CreateMap<GoalContributionUpdateDto, GoalContribution>();
        }
    }
}
