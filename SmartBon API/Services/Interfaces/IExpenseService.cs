using Microsoft.AspNetCore.Http;
using Shared.DTOs;
using Shared.DTOs.Expenses;
using Shared.DTOs.Expenses.Ranges;
using Shared.DTOs.Expenses.Recurring;

namespace Services.Interfaces
{
    /// <summary>
    /// Core service for managing single expenses, recurring expenses, and related file operations (import/export/scan).
    /// </summary>
    public interface IExpenseService
    {
        /// <summary> Creates a new standard expense. </summary>
        Task<ExpenseReadDto> CreateExpenseAsync(ExpenseCreateDto dto);

        /// <summary> Creates a new recurring expense template. </summary>
        Task<RecurringExpenseReadDto> CreateRecurringExpenseAsync(RecurringExpenseCreateDto dto);

        /// <summary> Updates an existing recurring expense template. </summary>
        Task<RecurringExpenseReadDto> UpdateRecurringExpenseAsync(int id, RecurringExpenseUpdateDto dto);

        /// <summary> Retrieves all recurring expenses for the current user. </summary>
        Task<List<RecurringExpenseReadDto>> GetAllRecurringExpenses();

        /// <summary> Retrieves a specific expense by its ID. </summary>
        Task<ExpenseReadDto> GetExpenseByIdAsync(int id);

        /// <summary> Retrieves all standard expenses for the current user. </summary>
        Task<List<ExpenseReadDto>> GetExpensesAsync();

        /// <summary> Retrieves a filtered list of expenses based on provided query parameters. </summary>
        Task<List<ExpenseReadDto>> GetExpensesWithQueryParamsAsync(ExpenseQueryParams queryParams);

        /// <summary> Deletes a specific expense. </summary>
        Task<ExpenseReadDto> DeleteExpenseAsync(int id);

        /// <summary> Updates an existing expense. </summary>
        Task<ExpenseReadDto> UpdateExpenseAsync(int id, ExpenseUpdateDto dto);

        /// <summary> Retrieves the most recent expenses added by the user. </summary>
        /// <param name="count">The maximum number of expenses to return.</param>
        Task<List<ExpenseReadDto>> GetRecentExpensesAsync(int count);

        /// <summary> Retrieves the minimum and maximum cost values among the user's expenses. </summary>
        Task<CostRangeDto> GetCostRangeAsync();

        /// <summary> Retrieves the earliest and latest dates among the user's expenses. </summary>
        Task<DateRangeDto> GetDateRangeAsync();

        /// <summary> Processes an uploaded receipt image and extracts expense data using OCR/AI. </summary>
        Task<ExpenseFilledFromImageDto> ExtractExpenseDataAsync(IFormFile image);

        /// <summary> Exports a filtered list of expenses to a downloadable file format (e.g., CSV/Excel). </summary>
        Task<ExportFileResultDto> ExportExpensesAsync(ExpenseQueryParams queryParams);

        /// <summary> Imports a batch of expenses from an uploaded CSV file. </summary>
        Task<bool> ImportExpensesAsync(IFormFile csvFile);

        /// <summary> Retrieves a specific recurring expense template by its ID. </summary>
        Task<RecurringExpenseReadDto> GetRecurringExpenseById(int id);

        /// <summary> Deletes a recurring expense template. </summary>
        Task<RecurringExpenseReadDto> DeleteRecurringExpenseAsync(int id);
    }
}