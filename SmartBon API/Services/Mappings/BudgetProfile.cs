using AutoMapper;
using Data.Models;
using Shared.DTOs.BudgetDTOs;
namespace Services.Mappings
{
    public class BudgetProfile : Profile
    {
        public BudgetProfile()
        {
            CreateMap<Budget, BudgetReadDto>();
            CreateMap<BudgetCreateDto, Budget>();
            CreateMap<BudgetUpdateDto, Budget>();
        }
    }
}
