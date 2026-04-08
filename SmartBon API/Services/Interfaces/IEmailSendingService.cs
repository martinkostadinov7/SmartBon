using Shared.DTOs.Statistics;

namespace Services.Interfaces
{
    /// <summary>
    /// Service responsible for dispatching emails to users.
    /// </summary>
    public interface IEmailSendingService
    {
        /// <summary> Sends an automated monthly financial report to a specific user email. </summary>
        Task SendMonthlyReport(string userEmail, MonthlyReport report);
    }
}