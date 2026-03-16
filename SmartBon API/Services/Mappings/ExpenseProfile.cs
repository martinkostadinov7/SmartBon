using AutoMapper;
using Data.Models;
using Shared.DTOs.Expenses;
using Shared.DTOs.Expenses.Recurring;
public class ExpenseProfile : Profile
{
    public ExpenseProfile()
    {
        CreateMap<Expense, ExpenseReadDto>();
        CreateMap<Expense, ExpenseExportDto>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
            .ForMember(dest => dest.SubcategoryName, opt => opt.MapFrom(src => src.Subcategory.Name));

        CreateMap<ExpenseCreateDto, Expense>();
        CreateMap<ExpenseUpdateDto, Expense>();

        CreateMap<RecurringExpenseCreateDto, RecurringExpense>();
        CreateMap<RecurringExpenseCreateDto, Expense>();

        CreateMap<RecurringExpense, RecurringExpenseReadDto>();
        CreateMap<RecurringExpense, Expense>()
            // Игнорираме Id-то, за да може БД да генерира ново за всеки разход
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            // Казваме на коя дата отговаря разхода (обикновено датата на изпълнение)
            .ForMember(dest => dest.ExpenseDate, opt => opt.MapFrom(src => src.NextExecutionDate))
            // Игнорираме навигационните свойства, за да не се опитва AutoMapper 
            // да ги пресъздава (EF ще се погрижи за тях чрез ID-тата)
            .ForMember(dest => dest.Category, opt => opt.Ignore())
            .ForMember(dest => dest.Subcategory, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.Now));
    }
}
