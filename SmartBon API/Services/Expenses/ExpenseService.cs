using Data.Interfaces;
using Data.Models;
using Services.Interfaces;
using Shared.DTOs.ExpenseDTOs;
using Shared.Enums;

namespace Services.Expenses
{
    public class ExpenseService(IExpenseRepository expenseRepository) : IExpenseService
    {
        async public Task<ExpenseReadDto> CreateExpense(ExpenseCreateDto dto)
        {
            string title = dto.Title; //todo data validator
            string? description = dto.Description; 
            DateTime expenseDate = dto.ExpenseDate;
            decimal cost = dto.Cost;
            int userId = dto.UserId;
            PaymentType paymentType = dto.PaymentType;

            Expense expense = new Expense(title, description, cost, expenseDate, paymentType, userId); //todo configue mapper
            await expenseRepository.Add(expense);

            ExpenseReadDto readDto = new ExpenseReadDto 
            {
                Id = expense.Id,
                Title = title,
                Description = description,
                Cost = cost,
                ExpenseDate = expenseDate,
                PaymentType = paymentType 
            };
            return readDto;
        }

        async public Task<ExpenseReadDto> GetExpenseById(int id)
        {
            Expense expenseFromDb = await expenseRepository.GetById(id) ?? throw new Exception("Not found"); //todo customised apiexeptons 
            
            ExpenseReadDto readDto = new ExpenseReadDto
            {
                Id = expenseFromDb.Id,
                Title = expenseFromDb.Title,
                Description = expenseFromDb.Description,
                Cost = expenseFromDb.Cost,
                ExpenseDate = expenseFromDb.ExpenseDate,
                PaymentType = expenseFromDb.PaymentType
            };
            return readDto;
        }
        async public Task<ExpenseReadDto> DeleteExpense(int id)
        {
            Expense expenseFromDb = await expenseRepository.GetById(id) ?? throw new Exception("Not found"); 
            await expenseRepository.Delete(expenseFromDb);

            ExpenseReadDto readDto = new ExpenseReadDto
            {
                Id = expenseFromDb.Id,
                Title = expenseFromDb.Title,
                Description = expenseFromDb.Description,
                Cost = expenseFromDb.Cost,
                ExpenseDate = expenseFromDb.ExpenseDate,
                PaymentType = expenseFromDb.PaymentType
            };
            return readDto;
        }
    }
}
