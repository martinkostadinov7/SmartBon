using AutoMapper;
using Data.Models;
using Shared.DTOs.ExpenseDTOs;
public class ExpenseProfile : Profile
{
    public ExpenseProfile()
    {
        CreateMap<Expense, ExpenseReadDto>();
        CreateMap<ExpenseCreateDto, Expense>();
        CreateMap<ExpenseUpdateDto, Expense>();
    }
}
