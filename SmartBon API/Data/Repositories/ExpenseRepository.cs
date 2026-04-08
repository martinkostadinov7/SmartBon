using Data.Interfaces;
using Data.Models;
using Microsoft.EntityFrameworkCore;
using Shared.DTOs.Expenses;
using Shared.DTOs.Expenses.QueryParams;
using Shared.DTOs.Expenses.Ranges;
using Shared.Enums;

namespace Data.Repositories
{
    public class ExpenseRepository(AppDbContext context) : EFRepository<Expense>(context), IExpenseRepository
    {
        /// <inheritdoc />
        public async Task AddRangeAsync(List<Expense> expenses)
        {
            _dbSet.AddRange(expenses);
            _context.SaveChanges();
        }

        /// <inheritdoc />
        public async Task<bool> DeleteAllAsync(int userId)
        {
            int rowsAffected = await _dbSet
                .Where(e => e.UserId == userId)
                .ExecuteDeleteAsync();

            return rowsAffected >= 0;
        }

        /// <inheritdoc />
        public async Task<List<Expense>> GetAllAsync(int userId)
        {
            IQueryable<Expense> query = _dbSet.AsQueryable();

            query = query
                .Where(e => e.UserId == userId)
                .OrderByDescending(e => e.ExpenseDate);

            var expenses = await query.ToListAsync();

            return expenses;
        }

        /// <inheritdoc />
        public async Task<CostRangeDto> GetCostRangeAsync(int userId)
        {
            if (!_dbSet.Where(e => e.UserId == userId).Any())
            {
                return new CostRangeDto {  Lowest = 0, Highest = 0};
            }
            decimal lowest = await _dbSet
                .Where(e => e.UserId == userId)
                .MinAsync(e => e.Cost);

            decimal highest = await _dbSet
                .Where(e => e.UserId == userId)
                .MaxAsync(e => e.Cost);
            
            CostRangeDto costRange = new CostRangeDto();
            costRange.Highest = highest;
            costRange.Lowest = lowest;

            return costRange;
        }

        /// <inheritdoc />
        public async Task<DateRangeDto> GetDateRangeAsync(int userId)
        {
            if (!_dbSet.Where(e => e.UserId == userId).Any())
            {
                return new DateRangeDto { Earliest = DateTime.Now, Latest = DateTime.Now};
            }
            DateTime earliest = await _dbSet
                .Where(e => e.UserId == userId)
                .MinAsync(e => e.ExpenseDate);

            DateTime latest = await _dbSet
                .Where(e => e.UserId == userId)
                .MaxAsync(e => e.ExpenseDate);

            DateRangeDto dateRange = new DateRangeDto();
            dateRange.Latest = latest;
            dateRange.Earliest = earliest;

            return dateRange;
        }


        /// <inheritdoc />
        public async Task<List<Expense>> GetExpensesFromQueryAsync(int userId, ExpenseQueryParams queryParams)
        {
            IQueryable<Expense> query = _dbSet
                .Include(s => s.Category)
                .Include(s => s.Subcategory)
                .AsQueryable();

            query = query.Where(e => e.UserId == userId);

            if (queryParams.Search != null) query = query.Where(e => e.Title.Contains(queryParams.Search) || (e.Description != null && e.Description.Contains(queryParams.Search)));

            if (queryParams.FilterParams != null)
            {
                ExpenseFilterParams filterParams = queryParams.FilterParams;

                List<int>? categoryIds = filterParams.CategoryIds;
                List<int>? subcategoryIds = filterParams.SubcategoryIds;
                DateTime? startDate = filterParams.StartDate;
                DateTime? endDate = filterParams.EndDate;
                decimal? fromCost = filterParams.FromCost;
                decimal? toCost = filterParams.ToCost;
                List<PaymentType>? paymentTypes = filterParams.PaymentTypes;
                Currency? currency = filterParams.Currency; 

                if (categoryIds != null && categoryIds.Any())
                {
                    query = query.Where(e => categoryIds.Contains(e.CategoryId));
                }

                if (subcategoryIds != null && subcategoryIds.Any())
                {
                    query = query.Where(e => e.SubcategoryId != null && subcategoryIds.Contains(e.SubcategoryId.Value));
                }

                if (startDate != null) query = query.Where(e => e.ExpenseDate >= startDate);    
                if (endDate != null) query = query.Where(e => e.ExpenseDate <= endDate);
                if (fromCost != null) query = query.Where(e => e.Cost >= fromCost);
                if (toCost != null) query = query.Where(e => e.Cost <= toCost);

                if (paymentTypes != null && paymentTypes.Any())
                {
                    query = query.Where(e => paymentTypes.Contains(e.PaymentType));
                }

                if (currency != null)
                {
                    query = query.Where(e => e.Currency == currency);
                }
            }

            ExpenseSortParams sortParams = queryParams.SortParams;
            bool descending = sortParams.Descending;
            SortBy sortBy = sortParams.Sortby;

            switch (sortBy)
            {
                case SortBy.Title:
                    query = descending ? 
                        query.OrderByDescending(e => e.Title).ThenByDescending(e => e.ExpenseDate) : 
                        query.OrderBy(e => e.Title).ThenByDescending(e => e.ExpenseDate);
                    break;
                case SortBy.Cost:
                    query = descending ? 
                        query.OrderByDescending(e => e.Cost).ThenByDescending(e => e.ExpenseDate) : 
                        query.OrderBy(e => e.Cost).ThenByDescending(e => e.ExpenseDate);
                    break;
                case SortBy.Date:
                    query = descending ? 
                        query.OrderByDescending(e => e.ExpenseDate).ThenByDescending(e => e.ExpenseDate) : 
                        query.OrderBy(e => e.ExpenseDate).ThenByDescending(e => e.ExpenseDate);
                    break;
                default:
                    break;
            }

            string? afterValue = queryParams.AfterValue;
            DateTime? afterDate = queryParams.AfterDate;

            if (!string.IsNullOrEmpty(queryParams.AfterValue) && queryParams.AfterDate.HasValue)
            {
                switch (sortBy)
                {
                    case SortBy.Title:
                        string title = afterValue!;
                        query = descending ?
                            query.Where(e => e.Title.CompareTo(afterValue) < 0 || (e.Title == afterValue && e.ExpenseDate < afterDate)) :
                            query.Where(e => e.Title.CompareTo(afterValue) > 0 || (e.Title == afterValue && e.ExpenseDate < afterDate));
                        break;
                    case SortBy.Cost:
                        decimal afterCost = decimal.Parse(afterValue!);
                        query = descending ?
                            query.Where(e => e.Cost < afterCost || (e.Cost == afterCost && e.ExpenseDate < afterDate)) :
                            query.Where(e => e.Cost > afterCost || (e.Cost == afterCost && e.ExpenseDate < afterDate));
                        break;
                    case SortBy.Date:
                        var thresholdDate = descending ? afterDate : afterDate!.Value.AddMilliseconds(1);
                        query = descending ?
                            query.Where(e => e.ExpenseDate < thresholdDate) :
                            query.Where(e => e.ExpenseDate > thresholdDate);
                        break;
                }
            }
            if (queryParams.PageSize != null)
            {
                return await query
                    .Take(queryParams.PageSize.Value)
                    .ToListAsync();
            }

            return await query.ToListAsync();
        }

        /// <inheritdoc />
        public async Task<List<Expense>> GetRecentExpensesAsync(int userId, int count)
        {
            IQueryable<Expense> query = _dbSet.AsQueryable();

            query = query
                .Where(e => e.UserId == userId)
                .OrderByDescending(e => e.ExpenseDate)
                .Take(count);

            var expenses = await query.ToListAsync();

            return expenses;
        }
    }
}
