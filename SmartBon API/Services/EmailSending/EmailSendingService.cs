using FluentEmail.Core;
using Services.Interfaces;
using Shared.DTOs.Statistics;

namespace Services.EmailSending
{
    public class EmailSendingService(IFluentEmail _mailer) : IEmailSendingService
    {
        public async Task SendMonthlyReport(string userEmail, MonthlyReport report)
        {
            // Определяме цвят според промяната (червено за ръст, зелено за спад в разходите)
            string trendColor = report.PercentageChange > 0 ? "#e74c3c" : "#2ecc71";
            string trendText = report.PercentageChange > 0 ? "повече" : "по-малко";

            string emailHtml = $@"
    <div style='font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;'>
        <h2 style='color: #2c3e50; text-align: center;'>📊 Месечен отчет за {report.MonthName}</h2>
        <p>Здравей! Ето обобщение на твоите финанси за изминалия месец:</p>
        
        <div style='background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;'>
            <p style='margin: 5px 0;'>💰 <strong>Общо похарчени:</strong> {report.TotalSpent:N2} лв.</p>
            <p style='margin: 5px 0; color: {trendColor};'>
                <strong>Промяна:</strong> {Math.Abs(report.PercentageChange):N1}% {trendText} спрямо миналия месец
            </p>
        </div>

        <table style='width: 100%; border-collapse: collapse;'>
            <tr>
                <td style='padding: 8px; border-bottom: 1px solid #eee;'>🔢 Брой транзакции:</td>
                <td style='padding: 8px; border-bottom: 1px solid #eee; text-align: right;'>{report.TotalTransactionsCount}</td>
            </tr>
            <tr>
                <td style='padding: 8px; border-bottom: 1px solid #eee;'>📅 Дни без разходи:</td>
                <td style='padding: 8px; border-bottom: 1px solid #eee; text-align: right;'>{report.NoSpendDaysCount}</td>
            </tr>
            <tr>
                <td style='padding: 8px; border-bottom: 1px solid #eee;'>☕ Ср. разход на ден:</td>
                <td style='padding: 8px; border-bottom: 1px solid #eee; text-align: right;'>{report.AverageSpentPerDay:N2} лв.</td>
            </tr>
            <tr>
                <td style='padding: 8px; border-bottom: 1px solid #eee;'>🏆 Най-голям разход:</td>
                <td style='padding: 8px; border-bottom: 1px solid #eee; text-align: right;'>{report.TopAmount:N2} лв.</td>
            </tr>
            <tr>
                <td style='padding: 8px; border-bottom: 1px solid #eee;'>💳 Метод на плащане:</td>
                <td style='padding: 8px; border-bottom: 1px solid #eee; text-align: right;'>{report.PreferredPaymentMethod}</td>
            </tr>
        </table>

        <div style='margin-top: 25px; padding: 10px; border-left: 4px solid #3498db; background: #ecf0f1;'>
            <strong>Най-скъп ден:</strong> {report.MostExpensiveDay:dd.MM.yyyy} ({report.MostExpensiveDayAmount:N2} лв.)
        </div>

        <p style='font-size: 12px; color: #7f8c8d; margin-top: 30px; text-align: center;'>
            Генерирано автоматично от твоя Expense Tracker
        </p>
    </div>";

            await _mailer
                .To(userEmail)
                .Subject($"Твоят финансов отчет за {report.MonthName}")
                .Body(emailHtml, isHtml: true) // ВАЖНО: isHtml: true
                .SendAsync();
        }
    }
}
