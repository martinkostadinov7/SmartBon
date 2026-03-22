using Shared.DTOs.Statistics;

namespace Services.Interfaces
{
    public interface IEmailSendingService
    {
        Task SendMonthlyReport(string userEmail, MonthlyReport report);
    }
}
