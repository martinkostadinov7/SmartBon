using Data.Interfaces;
using Data.Models;
using Microsoft.EntityFrameworkCore;

namespace Data.Repositories
{
    public class ExpenseRepository(AppDbContext context) : EFRepository<Expense>(context), IExpenseRepository
    {
        public async Task<List<Expense>> GetAll(int userId)
        {
            IQueryable<Expense> query = _dbSet.AsQueryable();

            query = query.Where(e => e.UserId == userId);

            if (!await query.AnyAsync())
                throw new Exception("No entities were found for this user.");

            var expenses = query.ToList();

            return expenses;
        }
    }
}
