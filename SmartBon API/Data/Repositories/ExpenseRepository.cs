using Data.Interfaces;
using Data.Models;
using Microsoft.EntityFrameworkCore;
using Shared.DTOs.ExpenseDTOs;
using Shared.DTOs.ExpenseDTOs.QueryParams;
using Shared.DTOs.ExpenseDTOs.Ranges;
using Shared.Enums;

namespace Data.Repositories
{
    public class ExpenseRepository(AppDbContext context) : EFRepository<Expense>(context), IExpenseRepository
    {
        public async Task<List<Expense>> GetAllAsync(int userId)
        {
            IQueryable<Expense> query = _dbSet.AsQueryable();

            query = query
                .Where(e => e.UserId == userId)
                .OrderByDescending(e => e.ExpenseDate);

            var expenses = await query.ToListAsync();

            return expenses;
        }

        public async Task<CostRangeDto> GetCostRangeAsync(int userId)
        {
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

        public async Task<DateRangeDto> GetDateRangeAsync(int userId)
        {
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

                if (categoryIds != null && categoryIds.Any())
                {
                    query = query.Where(e => categoryIds.Contains(e.CategoryId));
                }

                if (subcategoryIds != null && subcategoryIds.Any())
                {
                    query = query.Where(e => e.SubcategoryId != null && subcategoryIds.Contains(e.SubcategoryId.Value));
                }

                if (startDate != null) query = query.Where(e => e.ExpenseDate > startDate);    
                if (endDate != null) query = query.Where(e => e.ExpenseDate < endDate);
                if (fromCost != null) query = query.Where(e => e.Cost > fromCost);
                if (toCost != null) query = query.Where(e => e.Cost < toCost);

                if (paymentTypes != null && paymentTypes.Any())
                {
                    query = query.Where(e => paymentTypes.Contains(e.PaymentType));
                }
            }

            if (queryParams.SortParams != null)
            {
                ExpenseSortParams sortParams = queryParams.SortParams;
                bool descending = sortParams.Descending;
                SortBy sortBy = sortParams.Sortby;

                switch (sortBy)
                {
                    case SortBy.Title:
                        query = descending ? query.OrderByDescending(e => e.Title) : query.OrderBy(e => e.Title);
                        break;
                    case SortBy.Cost:
                        query = descending ? query.OrderByDescending(e => e.Cost) : query.OrderBy(e => e.Cost);
                        break;
                    case SortBy.Date:
                        query = descending ? query.OrderByDescending(e => e.ExpenseDate) : query.OrderBy(e => e.ExpenseDate);
                        break;
                    default:
                        break;
                }
            }
            else
            {
                query = query.OrderByDescending(e => e.ExpenseDate);
            }

            return await query.ToListAsync();
        }

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
