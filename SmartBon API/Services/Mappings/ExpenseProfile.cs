using AutoMapper;
using Data.Models;
using Shared.DTOs.Expenses;
public class ExpenseProfile : Profile
{
    public ExpenseProfile()
    {
        CreateMap<Expense, ExpenseReadDto>();
        CreateMap<ExpenseCreateDto, Expense>();
        CreateMap<ExpenseUpdateDto, Expense>();
    }
}
