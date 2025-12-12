using AutoMapper;
using Data.Interfaces;
using Data.Models;
using Services.Interfaces;
using Shared.DTOs.CategoryDTOs;
using Shared.DTOs.ExpenseDTOs;

namespace Services.Expenses
{
    public class ExpenseService(IUserAccessor user, IExpenseRepository expenseRepository, IMapper mapper) : IExpenseService
    {
        async public Task<ExpenseReadDto> CreateExpense(ExpenseCreateDto dto)
        {
            Expense expense = mapper.Map<Expense>(dto);
            expense.UserId = user.Id;
            await expenseRepository.Add(expense);
            
            return mapper.Map<ExpenseReadDto>(expense);
        }

        async public Task<List<ExpenseReadDto>> GetExpenses()
        {
            List<Expense> expensesFromDb = await expenseRepository.GetAll(user.Id) ?? throw new Exception("Not found"); //todo customised apiexeptons 

            return mapper.Map<List<ExpenseReadDto>>(expensesFromDb);
        }

        async public Task<ExpenseReadDto> GetExpenseById(int id)
        {
            Expense expenseFromDb = await expenseRepository.GetById(id, [ x => x.Category, x => x.Subcategory ]) ?? throw new Exception("Not found"); //todo customised apiexeptons 
            if (expenseFromDb.UserId != user.Id)
            {
                throw new Exception("User has no access to this content!");
            }
            CategoryReadDto category = mapper.Map<CategoryReadDto>(expenseFromDb.Category);
            SubcategoryReadDto subcategory = mapper.Map<SubcategoryReadDto>(expenseFromDb.Subcategory);
            ExpenseReadDto readDto = mapper.Map<ExpenseReadDto>(expenseFromDb);
            return readDto;
        }


        async public Task<ExpenseReadDto> DeleteExpense(int id)
        {
            Expense expenseFromDb = await expenseRepository.GetById(id) ?? throw new Exception("Not found");

            if (expenseFromDb.UserId != user.Id)
            {
                throw new Exception("User has no access to this content!");
            }
            await expenseRepository.Delete(expenseFromDb);

            ExpenseReadDto readDto = mapper.Map<ExpenseReadDto>(expenseFromDb);
            return readDto;
        }
    }
}
