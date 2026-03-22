using Data.Interfaces;
using Data.Models;
using Data.Repositories;
using Microsoft.AspNet.Identity;
using Services.Interfaces;
using Shared.DTOs.Expenses;
using Shared.DTOs.Expenses.QueryParams;
using Shared.DTOs.Statistics;
using Shared.Enums;
using System.Globalization;
using static Shared.DTOs.Statistics.CategoriesPieChart;
using static Shared.DTOs.Statistics.ContributionGraphData;
using static Shared.DTOs.Statistics.ExpensesLineChart;
using static Shared.DTOs.Statistics.PaymentTypePieChart;

namespace Services.Statistics
{
    public class StatisticsService(IExpenseRepository expenseRepository, IUserAccessor user) : IStatisticsService
    {
        public async Task<ContributionGraphData> GetContributionGraphAsync()
        {
            ExpenseQueryParams queryParams = new ExpenseQueryParams
            {

                FilterParams = new ExpenseFilterParams
                {
                    StartDate = DateTime.Now.AddDays(-90),
                    EndDate = DateTime.Now,
                },
                SortParams = new ExpenseSortParams
                {
                }

            };

            List<Expense> expenses = await expenseRepository.GetExpensesFromQueryAsync(user.Id, queryParams);
            List<PointCount> pointsCount = new List<PointCount>();
            List<PointAmount> pointsAmount = new List<PointAmount>();
            ContributionGraphData contributionGraphData = new ContributionGraphData();
            
            pointsCount = expenses
                .GroupBy(e => e.ExpenseDate.Date)
                .Select(group => new PointCount
                (
                    group.Key,
                    group.Count()  
                ))
                .OrderByDescending(p => p.Date) 
                .ToList();

            pointsAmount = expenses
                .GroupBy(e => e.ExpenseDate.Date)
                .Select(group => new PointAmount
                (
                    group.Key,
                    group.Sum(g => g.Cost)
                ))
                .OrderByDescending(p => p.Date)
                .ToList();

            contributionGraphData.PointsCount = pointsCount;
            contributionGraphData.PointsAmount = pointsAmount;

            return contributionGraphData;
        }

        public async Task<CategoriesPieChart> GetCategoriesPieChartAsync(ExpenseQueryParams expenseQueryParams)
        {
            List<Expense> expenses = await expenseRepository.GetExpensesFromQueryAsync(user.Id, expenseQueryParams);
            List<CategoryChartData> categoriesData = new List<CategoryChartData>();
            List<CategoryChartData> subcategoriesData = new List<CategoryChartData>();

            categoriesData = expenses
                .GroupBy(e => e.Category)
                .Select(group => new CategoryChartData
                (
                    group.Key.Name,                
                    group.Sum(e => e.Cost),        
                    group.Key.ColorHex,            
                    "#7F7F7F",                     
                    12                            
                ))
                .OrderByDescending(p => p.Population)  
                .ToList();

            subcategoriesData = expenses
                .Where(e => e.Subcategory != null)
                .GroupBy(e => e.Subcategory)
                .Select(group => new CategoryChartData
                (
                    group.Key.Name,
                    group.Sum(e => e.Cost),
                    group.Key.ColorHex,
                    "#7F7F7F",
                    12
                ))
                .OrderByDescending(p => p.Population)
                .ToList();

            CategoriesPieChart categoriesPieChart = new CategoriesPieChart();
            categoriesPieChart.CategoryData = categoriesData;
            categoriesPieChart.SubcategoryData = subcategoriesData;


            return categoriesPieChart;
        }

        public async Task<ExpensesLineChart> GetExpensesLineChartAsync(string range)
        {
            DateTime to = DateTime.Now;
            DateTime from = DateTime.Now;
            switch(range)
            {
                case "Daily": from = new DateTime(DateTime.Now.AddDays(-7).Ticks); break;
                case "Weekly": from = new DateTime(DateTime.Now.AddDays(-30).Ticks); break;
                case "Monthly": from = new DateTime(DateTime.Now.AddDays(-365).Ticks); break;
            }

            ExpenseQueryParams queryParams = new ExpenseQueryParams
            {

                FilterParams = new ExpenseFilterParams
                {
                    StartDate = from,
                    EndDate = to,
                },
                SortParams = new ExpenseSortParams
                {
                }
            };

            List<Expense> expenses = await expenseRepository.GetExpensesFromQueryAsync(user.Id, queryParams);


            var labels = new List<string>();
            var dataPoints = new List<decimal>();
            var englishCulture = CultureInfo.InvariantCulture;

            if (range == "Monthly") // Акумулиране по месеци (за годината)
            {
                var expensesByMonth = expenses
                    .GroupBy(e => new { e.ExpenseDate.Year, e.ExpenseDate.Month })
                    .ToDictionary(g => new DateTime(g.Key.Year, g.Key.Month, 1), g => g.Sum(e => e.Cost));

                for (int i = 11; i >= 0; i--)
                {
                    var firstDayOfMonth = new DateTime(to.Year, to.Month, 1).AddMonths(-i);
                    dataPoints.Add(expensesByMonth.GetValueOrDefault(firstDayOfMonth, 0));

                    if ((firstDayOfMonth.Month - 1) % 3 == 0)
                        labels.Add(firstDayOfMonth.ToString("MMM", englishCulture));
                    else
                        labels.Add("");
                }
            }
            else if (range == "Weekly") // Акумулиране по седмици (за последните няколко месеца)
            {
                // 1. Групираме по номер на седмица в годината
                var expensesByWeek = expenses
                    .GroupBy(e => CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(
                        e.ExpenseDate, CalendarWeekRule.FirstDay, DayOfWeek.Monday))
                    .ToDictionary(g => g.Key, g => g.Sum(e => e.Cost));

                // 2. Генерираме последните 8-12 седмици
                for (int i = 3; i >= 0; i--)
                {
                    var dateInWeek = to.AddDays(-i * 7);
                    int weekNum = CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(
                        dateInWeek, CalendarWeekRule.FirstDay, DayOfWeek.Monday);

                    dataPoints.Add(expensesByWeek.GetValueOrDefault(weekNum, 0));

                    
                        labels.Add(dateInWeek.ToString("dd.MM"));
                    
                }
            }
            else // Daily - Ден по ден
            {
                var allDates = Enumerable.Range(0, (to.Date - from.Date).Days + 1)
                                         .Select(offset => from.Date.AddDays(offset))
                                         .ToList();

                var expensesByDate = expenses
                    .GroupBy(e => e.ExpenseDate.Date)
                    .ToDictionary(g => g.Key, g => g.Sum(e => e.Cost));

                for (int i = 0; i < allDates.Count; i++)
                {
                    var date = allDates[i];
                    dataPoints.Add(expensesByDate.GetValueOrDefault(date, 0));
                    labels.Add(date.ToString("dd.MM")); // В Daily обикновено показваме всички етикети
                }
            }

            return new ExpensesLineChart
            {
                Labels = labels,
                Datasets = new List<Dataset> { new Dataset(dataPoints) }
            };

        }

        public async Task<PaymentTypePieChart> GetPaymentTypePieChartAsync(ExpenseQueryParams expenseQueryParams)
        {
            List<Expense> expenses = await expenseRepository.GetExpensesFromQueryAsync(user.Id, expenseQueryParams);
            List<PaymentTypeData> paymentTypeData = new List<PaymentTypeData>();

            var paymentColors = new Dictionary<PaymentType, string>
            {
                { PaymentType.Cash, "#EF9A9A" },
                { PaymentType.Card, "#81D4FA" },
                { PaymentType.Bank_Transfer, "#E6EE9C" } 
            };

            var paymentTypes = new Dictionary<PaymentType, string>
            {
                { PaymentType.Cash, "Cash" },
                { PaymentType.Card, "Card" },
                { PaymentType.Bank_Transfer, "Transfer" }
            };

            paymentTypeData = expenses
                .GroupBy(e => e.PaymentType)
                .Select(group => new PaymentTypeData
                (
                    paymentTypes.GetValueOrDefault(group.Key, "unidentified"),
                    group.Sum(e => e.Cost),
                    paymentColors.GetValueOrDefault(group.Key, "#7F7F7F"),
                    "#7F7F7F",
                    12
                ))
                .OrderByDescending(p => p.Population)
                .ToList();


            PaymentTypePieChart paymentTypePieChart = new PaymentTypePieChart();
            paymentTypePieChart.PaymentTypePieChartData = paymentTypeData;

            return paymentTypePieChart;
        }

        public async Task<DaysBarChart> GetDaysBarChartAsync()
        {
            List<Expense> expenses = await expenseRepository.GetAllAsync(user.Id);

            var dayLabels = new List<string> { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" };

            var dayMapping = new Dictionary<DayOfWeek, int>
            {
                { DayOfWeek.Monday, 0 }, { DayOfWeek.Tuesday, 1 }, { DayOfWeek.Wednesday, 2 },
                { DayOfWeek.Thursday, 3 }, { DayOfWeek.Friday, 4 }, { DayOfWeek.Saturday, 5 },
                { DayOfWeek.Sunday, 6 }
            };

            var totalsPerDay = new decimal[7];
            var occurrencesPerDay = new HashSet<DateTime>[7];
            for (int i = 0; i < 7; i++) occurrencesPerDay[i] = new HashSet<DateTime>();

            foreach (var expense in expenses)
            {
                int dayIndex = dayMapping[expense.ExpenseDate.DayOfWeek];
                totalsPerDay[dayIndex] += expense.Cost;

                occurrencesPerDay[dayIndex].Add(expense.ExpenseDate.Date);
            }

            var averagePoints = new List<decimal>();
            for (int i = 0; i < 7; i++)
            {
                int count = occurrencesPerDay[i].Count;
                decimal average = count > 0 ? totalsPerDay[i] / count : 0;
                averagePoints.Add(Math.Round(average, 2));
            }

            return new DaysBarChart
            {
                Labels = dayLabels,
                Datasets = new List<DaysBarChart.Dataset>
                {
                    new DaysBarChart.Dataset(averagePoints)
                }
            };
        }

        public async Task<MonthlyReport> GetMonthlyReportAsync()
        {
            DateTime now = DateTime.Now;
            DateTime start = new DateTime(now.Year, now.Month, 1).AddMonths(-1);
            DateTime end = new DateTime(now.Year, now.Month, 1).AddSeconds(-1);

            ExpenseQueryParams queryParams = new ExpenseQueryParams
            {

                FilterParams = new ExpenseFilterParams
                {
                    StartDate = start,
                    EndDate = end,
                },
                SortParams = new ExpenseSortParams
                {
                    Descending = true,
                    Sortby = SortBy.Cost
                }
            };

            List<Expense> expenses = await expenseRepository.GetExpensesFromQueryAsync(user.Id, queryParams);

            DateTime startPrevMonth = new DateTime(now.Year, now.Month, 1).AddMonths(-2);
            DateTime endPrevMonth = new DateTime(now.Year, now.Month, 1).AddMonths(-1).AddSeconds(-1);

            ExpenseQueryParams queryParamsPrevMonth = new ExpenseQueryParams
            {

                FilterParams = new ExpenseFilterParams
                {
                    StartDate = startPrevMonth,
                    EndDate = endPrevMonth,
                },
                SortParams = new ExpenseSortParams
                {
                }
            };
            List<Expense> expensesPrevMonth = await expenseRepository.GetExpensesFromQueryAsync(user.Id, queryParamsPrevMonth);

            MonthlyReport monthlyReport = new MonthlyReport();
            
            if (!expenses.Any())
            {
                return monthlyReport;
            }
            monthlyReport.MonthName = start.ToString("MMMM", CultureInfo.InvariantCulture);
            monthlyReport.TotalTransactionsCount = expenses.Count;
            monthlyReport.TotalCountDifference = expenses.Count - expensesPrevMonth.Count;
            monthlyReport.TotalSpent = expenses.Sum(e => e.Cost);
            monthlyReport.TotalSpentDifference = expenses.Sum(e => e.Cost) - expensesPrevMonth.Sum(e => e.Cost);
            monthlyReport.AverageSpentPerDay = decimal.Round((monthlyReport.TotalSpent / expenses.Count), 2);
            monthlyReport.NoSpendDaysCount = DateTime.DaysInMonth(start.Year, start.Month) - expenses.Select(e => e.ExpenseDate.Date).Distinct().Count();

            if (!expensesPrevMonth.Any())
            {
                monthlyReport.PercentageChange = 100;
            }
            else
            {
                monthlyReport.PercentageChange = decimal.Round(((monthlyReport.TotalSpent - expensesPrevMonth.Sum(e => e.Cost)) / expensesPrevMonth.Sum(e => e.Cost)) * 100 ,2);
            }
            monthlyReport.TopCategoryId = expenses.Take(1).Select(e => e.CategoryId).FirstOrDefault();
            monthlyReport.TopAmount = expenses.Take(1).Select(e => e.Cost).FirstOrDefault();
            monthlyReport.MostExpensiveDay = expenses
                .GroupBy(e => e.ExpenseDate.Date)
                .Select(g => new { Date = g.Key, TotalAmount = g.Sum(e => e.Cost) }) 
                .OrderByDescending(x => x.TotalAmount)
                .Select(x => x.Date)
                .FirstOrDefault(); 
            monthlyReport.MostExpensiveDayAmount = expenses.Where(e => e.ExpenseDate.Date == monthlyReport.MostExpensiveDay.Date).Sum(e => e.Cost);
            monthlyReport.PreferredPaymentMethod = expenses
                .GroupBy(e => e.PaymentType)
                .Select(g => new { PaymentType = g.Key, TotalAmount = g.Sum(e => e.Cost) })
                .OrderByDescending(x => x.TotalAmount)
                .Select(x => x.PaymentType)
                .FirstOrDefault();
            return monthlyReport;
        }
        public async Task<MonthlyReport> GetMonthlyReportAsync(int id)
        {
            DateTime now = DateTime.Now;
            DateTime start = new DateTime(now.Year, now.Month, 1).AddMonths(-1);
            DateTime end = new DateTime(now.Year, now.Month, 1).AddSeconds(-1);

            ExpenseQueryParams queryParams = new ExpenseQueryParams
            {

                FilterParams = new ExpenseFilterParams
                {
                    StartDate = start,
                    EndDate = end,
                },
                SortParams = new ExpenseSortParams
                {
                    Descending = true,
                    Sortby = SortBy.Cost
                }
            };

            List<Expense> expenses = await expenseRepository.GetExpensesFromQueryAsync(id, queryParams);

            DateTime startPrevMonth = new DateTime(now.Year, now.Month, 1).AddMonths(-2);
            DateTime endPrevMonth = new DateTime(now.Year, now.Month, 1).AddMonths(-1).AddSeconds(-1);

            ExpenseQueryParams queryParamsPrevMonth = new ExpenseQueryParams
            {

                FilterParams = new ExpenseFilterParams
                {
                    StartDate = startPrevMonth,
                    EndDate = endPrevMonth,
                },
                SortParams = new ExpenseSortParams
                {
                }
            };
            List<Expense> expensesPrevMonth = await expenseRepository.GetExpensesFromQueryAsync(id, queryParamsPrevMonth);

            MonthlyReport monthlyReport = new MonthlyReport();

            if (!expenses.Any())
            {
                return monthlyReport;
            }
            monthlyReport.MonthName = start.ToString("MMMM", CultureInfo.InvariantCulture);
            monthlyReport.TotalTransactionsCount = expenses.Count;
            monthlyReport.TotalCountDifference = expenses.Count - expensesPrevMonth.Count;
            monthlyReport.TotalSpent = expenses.Sum(e => e.Cost);
            monthlyReport.TotalSpentDifference = expenses.Sum(e => e.Cost) - expensesPrevMonth.Sum(e => e.Cost);
            monthlyReport.AverageSpentPerDay = decimal.Round((monthlyReport.TotalSpent / expenses.Count), 2);
            monthlyReport.NoSpendDaysCount = DateTime.DaysInMonth(start.Year, start.Month) - expenses.Select(e => e.ExpenseDate.Date).Distinct().Count();

            if (!expensesPrevMonth.Any())
            {
                monthlyReport.PercentageChange = 100;
            }
            else
            {
                monthlyReport.PercentageChange = decimal.Round(((monthlyReport.TotalSpent - expensesPrevMonth.Sum(e => e.Cost)) / expensesPrevMonth.Sum(e => e.Cost)) * 100, 2);
            }
            monthlyReport.TopCategoryId = expenses.Take(1).Select(e => e.CategoryId).FirstOrDefault();
            monthlyReport.TopAmount = expenses.Take(1).Select(e => e.Cost).FirstOrDefault();
            monthlyReport.MostExpensiveDay = expenses
                .GroupBy(e => e.ExpenseDate.Date)
                .Select(g => new { Date = g.Key, TotalAmount = g.Sum(e => e.Cost) })
                .OrderByDescending(x => x.TotalAmount)
                .Select(x => x.Date)
                .FirstOrDefault();
            monthlyReport.MostExpensiveDayAmount = expenses.Where(e => e.ExpenseDate.Date == monthlyReport.MostExpensiveDay.Date).Sum(e => e.Cost);
            monthlyReport.PreferredPaymentMethod = expenses
                .GroupBy(e => e.PaymentType)
                .Select(g => new { PaymentType = g.Key, TotalAmount = g.Sum(e => e.Cost) })
                .OrderByDescending(x => x.TotalAmount)
                .Select(x => x.PaymentType)
                .FirstOrDefault();
            return monthlyReport;
        }
    }
}
