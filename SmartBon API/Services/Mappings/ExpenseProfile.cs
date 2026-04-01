using AutoMapper;
using Data.Models;
using Shared.DTOs.Expenses;
using Shared.DTOs.Expenses.Recurring;
public class ExpenseProfile : Profile
{
    public ExpenseProfile()
    {
        CreateMap<Expense, ExpenseReadDto>();
        CreateMap<Expense, ExpenseExportImportDto>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
            .ForMember(dest => dest.SubcategoryName, opt => opt.MapFrom(src => src.Subcategory.Name));

        CreateMap<ExpenseExportImportDto, Expense>()
           .ForMember(dest => dest.CategoryId, opt => opt.Ignore())
           .ForMember(dest => dest.SubcategoryId, opt => opt.Ignore())
            .ForMember(dest => dest.Category, opt => opt.Ignore())
           .ForMember(dest => dest.Subcategory, opt => opt.Ignore());

        CreateMap<ExpenseCreateDto, Expense>();
        CreateMap<ExpenseUpdateDto, Expense>();

        CreateMap<RecurringExpenseCreateDto, RecurringExpense>();
        CreateMap<RecurringExpenseCreateDto, Expense>();
        
        CreateMap<RecurringExpenseUpdateDto, RecurringExpense>();

        CreateMap<RecurringExpense, RecurringExpenseReadDto>();
        CreateMap<RecurringExpense, Expense>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.ExpenseDate, opt => opt.MapFrom(src => src.NextExecutionDate))
            .ForMember(dest => dest.Category, opt => opt.Ignore())
            .ForMember(dest => dest.Subcategory, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.Now));
    }
}
