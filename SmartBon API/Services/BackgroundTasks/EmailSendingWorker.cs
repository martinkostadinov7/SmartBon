using Data.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Services.Interfaces;
using Shared.DTOs.Statistics;

namespace Services.BackgroundTasks
{
    public class EmailSendingWorker(IServiceScopeFactory scopeFactory) : BackgroundService
    {
        private readonly TimeSpan _checkInterval = TimeSpan.FromDays(30);

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = scopeFactory.CreateScope())
                    {
                        var userService = scope.ServiceProvider.GetRequiredService<IUserService>();

                        List<User> users = await userService.GetAllUsersForMonthlyReportAsync();

                        foreach (var user in users)
                        {
                            if (stoppingToken.IsCancellationRequested) break;

                            // СЪЗДАВАЙ SCOPE ТУК, ВЪТРЕ В ЦИКЪЛА
                            using (var emailScope = scopeFactory.CreateScope())
                            {
                                var statisticsService = emailScope.ServiceProvider.GetRequiredService<IStatisticsService>();
                                var emailSendingService = emailScope.ServiceProvider.GetRequiredService<IEmailSendingService>();

                                try
                                {
                                    MonthlyReport monthlyReport = await statisticsService.GetMonthlyReportAsync(user.Id);
                                    if (monthlyReport != null)
                                    {
                                        await emailSendingService.SendMonthlyReport(user.Email, monthlyReport);
                                        await Task.Delay(3000, stoppingToken);
                                    }
                                }
                                catch (Exception ex)
                                {
                                    Console.WriteLine($"Error for user {user.Id}: {ex.Message}");
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                     Console.WriteLine($"Critical worker error: {ex.Message}");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }
        }
    }
}
