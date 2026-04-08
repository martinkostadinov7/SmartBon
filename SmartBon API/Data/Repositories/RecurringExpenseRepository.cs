using Data.Interfaces;
using Data.Models;
using Microsoft.EntityFrameworkCore;

namespace Data.Repositories
{
    /// <inheritdoc />
    public class RecurringExpenseRepository(AppDbContext context) : EFRepository<RecurringExpense>(context), IRecurringExpenseRepository
    {
        /// <inheritdoc />
        public async Task<bool> DeleteAllAsync(int userId)
        {
            int rowsAffected = await _dbSet
                .Where(e => e.UserId == userId)
                .ExecuteDeleteAsync();

            return rowsAffected >= 0;
        }

        /// <inheritdoc />
        public async Task<List<RecurringExpense>> GetAllPendingAsync()
        {
            IQueryable<RecurringExpense> query = _dbSet.AsQueryable();
            query.Include(r => r.Expenses);
            query = query
                .Where(re => re.NextExecutionDate <= DateTime.Now);

            var expenses = await query.ToListAsync();

            return expenses;
        }

        /// <inheritdoc />
        public async Task<List<RecurringExpense>> GetAllAsync(int userId)
        {
            IQueryable<RecurringExpense> query = _dbSet.AsQueryable();
            query = query.Include(r => r.Expenses);

            query = query
                .Where(e => e.UserId == userId)
                .OrderByDescending(e => e.StartDate);

            var expenses = await query.ToListAsync();

            return expenses;
        }

        /// <inheritdoc />
        public async Task<RecurringExpense?> GetRecurringExpenseByIdAsync(int id)
        {
            var query = _dbSet.AsQueryable().Include(c => c.Expenses);

            return await query.SingleOrDefaultAsync(x => EF.Property<int>(x, "Id") == id);
        }
    }
}
