using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using Shared.DTOs;
using Shared.DTOs.Expenses;
using Shared.DTOs.Expenses.Ranges;
using Shared.DTOs.Expenses.Recurring;

namespace SmartBon_API.Controllers
{
    /// <summary>
    /// API endpoints for managing single expenses, recurring expenses, receipt scanning, and data import/export.
    /// </summary>
    [Route("/api/[controller]")]
    [Authorize]
    [ApiController]
    public class ExpensesController(IExpenseService expenseService) : ControllerBase
    {
        /// <summary> Creates a new standard expense. </summary>
        [HttpPost]
        public async Task<ActionResult<ExpenseReadDto>> CreateExpense(ExpenseCreateDto request)
        {
            ExpenseReadDto result = await expenseService.CreateExpenseAsync(request);
            return CreatedAtAction(nameof(GetExpenseById), new { id = result.Id }, result);
        }

        /// <summary> Creates a new recurring expense template. </summary>
        [HttpPost("recurring")]
        public async Task<ActionResult<RecurringExpenseReadDto>> CreateRecurringExpense(RecurringExpenseCreateDto request)
        {
            RecurringExpenseReadDto result = await expenseService.CreateRecurringExpenseAsync(request);
            return CreatedAtAction(nameof(GetRecurringExpenseById), new { id = result.Id }, result);
        }

        /// <summary> Updates an existing recurring expense template. </summary>
        [HttpPut("recurring/{id}")]
        public async Task<ActionResult<RecurringExpenseReadDto>> UpdateRecurringExpense(int id, RecurringExpenseUpdateDto request)
        {
            RecurringExpenseReadDto result = await expenseService.UpdateRecurringExpenseAsync(id, request);
            return Ok(result);
        }

        /// <summary> Deletes a specific recurring expense template. </summary>
        [HttpDelete("recurring/{id}")]
        public async Task<ActionResult<RecurringExpenseReadDto>> DeleteRecurringExpense(int id)
        {
            RecurringExpenseReadDto result = await expenseService.DeleteRecurringExpenseAsync(id);
            return Ok(result);
        }

        /// <summary> Retrieves all recurring expenses configured by the authenticated user. </summary>
        [HttpGet("recurring")]
        public async Task<ActionResult<List<RecurringExpenseReadDto>>> GetAllRecurringExpenses()
        {
            List<RecurringExpenseReadDto> result = await expenseService.GetAllRecurringExpenses();
            return Ok(result);
        }

        /// <summary> Processes an uploaded receipt image and extracts expense data using OCR/AI. </summary>
        [HttpPost("upload-receipt")]
        public async Task<ActionResult<ExpenseFilledFromImageDto>> ExtractExpenseData([FromForm] IFormFile image)
        {
            ExpenseFilledFromImageDto result = await expenseService.ExtractExpenseDataAsync(image);
            return Ok(result);
        }

        /// <summary> Retrieves a list of expenses filtered and sorted by the provided query parameters. </summary>
        [HttpGet]
        public async Task<ActionResult<List<ExpenseReadDto>>> GetExpensesWithQueryParams([FromQuery] ExpenseQueryParams queryParams)
        {
            List<ExpenseReadDto> result = await expenseService.GetExpensesWithQueryParamsAsync(queryParams);
            return Ok(result);
        }

        /// <summary> Retrieves a specific expense by its unique identifier. </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ExpenseReadDto>> GetExpenseById(int id)
        {
            ExpenseReadDto result = await expenseService.GetExpenseByIdAsync(id);
            return Ok(result);
        }

        /// <summary> Permanently deletes a specific expense. </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ExpenseReadDto>> DeleteExpense(int id)
        {
            ExpenseReadDto result = await expenseService.DeleteExpenseAsync(id);
            return Ok(result);
        }

        /// <summary> Updates the details of an existing standard expense. </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<ExpenseReadDto>> UpdateExpense(int id, [FromBody] ExpenseUpdateDto request)
        {
            ExpenseReadDto result = await expenseService.UpdateExpenseAsync(id, request);
            return Ok(result);
        }

        /// <summary> Retrieves a specified number of the most recently created expenses. </summary>
        [HttpGet("recent/{count}")]
        public async Task<ActionResult<List<ExpenseReadDto>>> GetRecentExpenses(int count)
        {
            List<ExpenseReadDto> result = await expenseService.GetRecentExpensesAsync(count);
            return Ok(result);
        }

        /// <summary> Retrieves the lowest and highest financial amounts from the user's recorded expenses. </summary>
        [HttpGet("costRange")]
        public async Task<ActionResult<CostRangeDto>> GetCostRange()
        {
            CostRangeDto result = await expenseService.GetCostRangeAsync();
            return Ok(result);
        }

        /// <summary> Retrieves the earliest and latest dates from the user's recorded expenses. </summary>
        [HttpGet("dateRange")]
        public async Task<ActionResult<DateRangeDto>> GetDateRange()
        {
            DateRangeDto result = await expenseService.GetDateRangeAsync();
            return Ok(result);
        }

        /// <summary> Exports the user's expenses to a downloadable file format based on the provided filters. </summary>
        [HttpGet("export")]
        public async Task<ActionResult> ExportExpenses([FromQuery] ExpenseQueryParams queryParams)
        {
            ExportFileResultDto result = await expenseService.ExportExpensesAsync(queryParams);
            return File(
                    result.Content,
                    result.ContentType,
                    result.FileName
                );
        }

        /// <summary> Imports a batch of expenses from a provided CSV file. </summary>
        [HttpPost("import")]
        public async Task<ActionResult> ImportExpenses([FromForm] IFormFile csvFile)
        {
            await expenseService.ImportExpensesAsync(csvFile);
            return Ok();
        }

        /// <summary> Retrieves a specific recurring expense template by its unique identifier. </summary>
        [HttpGet("recurring/{id}")]
        public async Task<ActionResult<RecurringExpenseReadDto>> GetRecurringExpenseById(int id)
        {
            RecurringExpenseReadDto result = await expenseService.GetRecurringExpenseById(id);
            return Ok(result);
        }
    }
}