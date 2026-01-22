using AutoMapper;
using Data.Interfaces;
using Data.Models;
using Services.Interfaces;
using Shared.ApiExceptions;
using Shared.DTOs.ExpenseDTOs;

namespace Services.Expenses
{
    public class ExpenseService(IUserAccessor user, IExpenseRepository expenseRepository, IMapper mapper) : IExpenseService
    {
        public async Task<ExpenseReadDto> CreateExpenseAsync(ExpenseCreateDto dto)
        {
            Expense expense = mapper.Map<Expense>(dto);
            expense.CreatedAt = DateTime.Now;
            expense.UserId = user.Id;
            await expenseRepository.AddAsync(expense);
            
            return mapper.Map<ExpenseReadDto>(expense);
        }

        public async Task<List<ExpenseReadDto>> GetExpensesAsync()
        {
            List<Expense> expensesFromDb = await expenseRepository.GetAllAsync(user.Id);

            return mapper.Map<List<ExpenseReadDto>>(expensesFromDb);
        }

        public async Task<ExpenseReadDto> GetExpenseByIdAsync(int id)
        {
            Expense expenseFromDb = await expenseRepository.GetByIdAsync(id) ?? throw new NotFoundException($"Expense with id {id} was not found");  
            if (expenseFromDb.UserId != user.Id)
            {
                throw new UnauthorizedException("User has no access to this content!");
            }
            return mapper.Map<ExpenseReadDto>(expenseFromDb);
        }


        public async Task<ExpenseReadDto> DeleteExpenseAsync(int id)
        {
            Expense expenseFromDb = await expenseRepository.GetByIdAsync(id) ?? throw new NotFoundException($"Expense with id {id} was not found");

            if (expenseFromDb.UserId != user.Id)
            {
                throw new UnauthorizedException("User has no access to this content!");
            }
            await expenseRepository.DeleteAsync(expenseFromDb);

            return mapper.Map<ExpenseReadDto>(expenseFromDb);
        }

        public async Task<ExpenseReadDto> UpdateExpenseAsync(int id, ExpenseUpdateDto dto)
        {
            Expense expenseFromDb = await expenseRepository.GetByIdAsync(id) ?? throw new NotFoundException($"Expense with id {id} was not found");

            if (expenseFromDb.UserId != user.Id)
            {
                throw new UnauthorizedException("User has no access to this content!");
            }

            mapper.Map(dto, expenseFromDb);

            await expenseRepository.UpdateAsync(expenseFromDb);

            return mapper.Map<ExpenseReadDto>(expenseFromDb);
        }

        public async Task<List<ExpenseReadDto>> GetRecentExpensesAsync(int count)
        {
            List<Expense> expensesFromDb = await expenseRepository.GetRecentExpensesAsync(user.Id, count);

            return mapper.Map<List<ExpenseReadDto>>(expensesFromDb);
        }
    }
}
