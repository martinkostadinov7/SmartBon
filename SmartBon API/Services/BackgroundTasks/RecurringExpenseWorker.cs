using AutoMapper;
using Data.Interfaces;
using Data.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Services.Interfaces;
using Shared.Enums;

namespace Services.BackgroundTasks
{
    /// <summary>
    /// A background worker service that periodically checks for pending recurring expenses and automatically processes them.
    /// </summary>
    public class RecurringExpenseWorker(IServiceScopeFactory scopeFactory) : BackgroundService
    {
        private readonly TimeSpan _checkInterval = TimeSpan.FromHours(1);

        /// <summary>
        /// Executes the background task. Finds all pending recurring expenses, creates actual expense records, 
        /// updates affected budgets, and schedules the next execution date.
        /// </summary>
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = scopeFactory.CreateScope())
                {
                    var mapper = scope.ServiceProvider.GetRequiredService<IMapper>();
                    var expenseRepository = scope.ServiceProvider.GetRequiredService<IExpenseRepository>();
                    var budgetRepository = scope.ServiceProvider.GetRequiredService<IBudgetRepository>();
                    var recurringRepository = scope.ServiceProvider.GetRequiredService<IRecurringExpenseRepository>();
                    var expenseService = scope.ServiceProvider.GetRequiredService<IExpenseService>();
                    var pendingExpenses = await recurringRepository.GetAllPendingAsync();

                    foreach (var recurring in pendingExpenses)
                    {
                        Expense expense = mapper.Map<Expense>(recurring);
                        expense.Id = 0;
                        expense.ExpenseDate = recurring.NextExecutionDate;
                        expense.RecurringExpenseId = recurring.Id;
                        List<Budget> budgets = await budgetRepository.GetAllAsync();
                        foreach (var budget in budgets)
                        {
                            if ((budget.CategoryIds.Contains(expense.CategoryId) || expense.SubcategoryId != null && budget.SubcategoryIds.Contains(expense.SubcategoryId!.Value)) &&
                                budget.From <= expense.ExpenseDate && budget.To >= expense.ExpenseDate)
                            {
                                budget.CurrentAmount += expense.Cost;
                                await budgetRepository.UpdateAsync(budget);
                            }
                        }

                        recurring.Expenses.Add(expense);
                        await expenseRepository.AddAsync(expense);
                        Console.WriteLine("[Worker] Adding expense");
                        recurring.NextExecutionDate = CalculateNextDate(recurring.NextExecutionDate, recurring.Frequency);
                        await recurringRepository.UpdateAsync(recurring);
                    }
                }
                await Task.Delay(_checkInterval, stoppingToken);
            }
        }

        /// <summary>
        /// Calculates the next execution date for a recurring expense based on its defined frequency.
        /// </summary>
        /// <param name="current">The current execution date.</param>
        /// <param name="frequency">The frequency enum (Daily, Weekly, Monthly, Yearly).</param>
        /// <returns>The calculated next execution date.</returns>
        private DateTime CalculateNextDate(DateTime current, RecurringExpenseFrequency frequency)
        {
            return frequency switch
            {
                RecurringExpenseFrequency.Daily => current.AddDays(1),
                RecurringExpenseFrequency.Weekly => current.AddDays(7),
                RecurringExpenseFrequency.Monthly => current.AddMonths(1),
                RecurringExpenseFrequency.Yearly => current.AddYears(1),
                _ => current.AddMonths(1)
            };
        }
    }
}