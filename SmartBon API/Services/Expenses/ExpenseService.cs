using AutoMapper;
using CsvHelper;
using Data.Interfaces;
using Data.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using OpenAI;
using OpenAI.Chat;
using Services.Interfaces;
using Shared.ApiExceptions;
using Shared.DTOs;
using Shared.DTOs.Expenses;
using Shared.DTOs.Expenses.Ranges;
using Shared.DTOs.Expenses.Recurring;
using Shared.Enums;
using System.Globalization;
using System.Text;
using System.Text.Json;
namespace Services.Expenses
{
    public class ExpenseService(IUserAccessor user, IExpenseRepository expenseRepository, IRecurringExpenseRepository recurringExpenseRepository, IMapper mapper, IBudgetRepository budgetRepository, IConfiguration _configuration, ICategoryRepository categoryRepository, ISubcategoryRepository subcategoryRepository) : IExpenseService
    {
        public async Task<ExpenseReadDto> CreateExpenseAsync(ExpenseCreateDto dto)
        {
            Expense expense = mapper.Map<Expense>(dto);
            expense.CreatedAt = DateTime.Now;
            expense.UserId = user.Id;
            await expenseRepository.AddAsync(expense);

            await UpdateBudgetsCreate(expense);
            return mapper.Map<ExpenseReadDto>(expense);
        }

        public async Task UpdateBudgetsCreate(Expense expense)
        {
            List<string> budgetNamesAlmost = new List<string>();
            List<string> budgetNamesReached = new List<string>();
            List<Budget> budgets = await budgetRepository.GetAllAsync(user.Id);
            foreach (var budget in budgets)
            {
                if ((budget.CategoryIds.Contains(expense.CategoryId) || ((expense.SubcategoryId != null) ? budget.SubcategoryIds.Contains(expense.SubcategoryId!.Value) : false)) &&
                    (budget.From <= expense.ExpenseDate && budget.To >= expense.ExpenseDate))
                {
                    budget.CurrentAmount += expense.Cost;
                    await budgetRepository.UpdateAsync(budget);

                    if (budget.CurrentAmount >= budget.Limit)
                    {
                        budgetNamesReached.Add(budget.Name);
                    }
                    else if (budget.CurrentAmount >= budget.Limit * 0.8m && budget.CurrentAmount < budget.Limit)
                    {
                        budgetNamesAlmost.Add(budget.Name);
                    }
                }

            }
            if (budgetNamesReached.Any())
            {
                throw new BadRequestException($"Budget limit for {string.Join(", ", budgetNamesReached)} reached!");
            }
            if (budgetNamesAlmost.Any())
            {
                throw new BadRequestException($"Budget limit for {string.Join(", ", budgetNamesAlmost)} almost reached!");
            }
        }

        public async Task<List<ExpenseReadDto>> GetExpensesAsync()
        {
            List<Expense> expensesFromDb = await expenseRepository.GetAllAsync(user.Id);

            return mapper.Map<List<ExpenseReadDto>>(expensesFromDb);
        }

        public async Task<ExpenseReadDto> GetExpenseByIdAsync(int id)
        {
            Expense expenseFromDb = await expenseRepository.GetByIdAsync(id) ?? throw new NotFoundException($"Expense with id {id} was not found");  
            if (expenseFromDb.UserId != user.Id)
            {
                throw new UnauthorizedException("User has no access to this content!");
            }
            return mapper.Map<ExpenseReadDto>(expenseFromDb);
        }


        public async Task<ExpenseReadDto> DeleteExpenseAsync(int id)
        {
            Expense expenseFromDb = await expenseRepository.GetByIdAsync(id) ?? throw new NotFoundException($"Expense with id {id} was not found");

            if (expenseFromDb.UserId != user.Id)
            {
                throw new UnauthorizedException("User has no access to this content!");
            }
            await expenseRepository.DeleteAsync(expenseFromDb);

            List<Budget> budgets = await budgetRepository.GetAllAsync(user.Id);
            foreach (var budget in budgets)
            {
                if ((budget.CategoryIds.Contains(expenseFromDb.CategoryId) || ((expenseFromDb.SubcategoryId != null) ? budget.SubcategoryIds.Contains(expenseFromDb.SubcategoryId!.Value) : false)) &&
                    (budget.From <= expenseFromDb.ExpenseDate && budget.To >= expenseFromDb.ExpenseDate))
                {
                    budget.CurrentAmount -= expenseFromDb.Cost;
                    await budgetRepository.UpdateAsync(budget);
                }
            }

            return mapper.Map<ExpenseReadDto>(expenseFromDb);
        }

        public async Task<ExpenseReadDto> UpdateExpenseAsync(int id, ExpenseUpdateDto dto)
        {
            Expense expenseFromDb = await expenseRepository.GetByIdAsync(id) ?? throw new NotFoundException($"Expense with id {id} was not found");

            if (expenseFromDb.UserId != user.Id)
            {
                throw new UnauthorizedException("User has no access to this content!");
            }
            decimal previousCost = expenseFromDb.Cost;
            mapper.Map(dto, expenseFromDb);

            await expenseRepository.UpdateAsync(expenseFromDb);

            List<Budget> budgets = await budgetRepository.GetAllAsync(user.Id);
            foreach (var budget in budgets)
            {
                if ((budget.CategoryIds.Contains(expenseFromDb.CategoryId) || ((expenseFromDb.SubcategoryId != null) ? budget.SubcategoryIds.Contains(expenseFromDb.SubcategoryId!.Value) : false)) &&
                    (budget.From <= expenseFromDb.ExpenseDate && budget.To >= expenseFromDb.ExpenseDate))
                {
                    budget.CurrentAmount -= previousCost;
                    budget.CurrentAmount += expenseFromDb.Cost;
                    await budgetRepository.UpdateAsync(budget);
                }
            }

            return mapper.Map<ExpenseReadDto>(expenseFromDb);
        }

        public async Task<List<ExpenseReadDto>> GetRecentExpensesAsync(int count)
        {
            List<Expense> expensesFromDb = await expenseRepository.GetRecentExpensesAsync(user.Id, count);

            return mapper.Map<List<ExpenseReadDto>>(expensesFromDb);
        }

        public async Task<List<ExpenseReadDto>> GetExpensesWithQueryParamsAsync(ExpenseQueryParams queryParams)
        {
            if(queryParams?.FilterParams?.StartDate > queryParams?.FilterParams?.EndDate)
            {
                throw new BadRequestException("'startDate' cannot be after 'endDate'.");
            }

            if (queryParams?.FilterParams?.FromCost > queryParams?.FilterParams?.ToCost)
            {
                throw new BadRequestException("'fromCost' cannot be larger than 'toCost'.");
            }

            List<Expense> expensesFromDb = await expenseRepository.GetExpensesFromQueryAsync(user.Id, queryParams!);

            return mapper.Map<List<ExpenseReadDto>>(expensesFromDb);
        }

        public async Task<CostRangeDto> GetCostRangeAsync()
        {
            return await expenseRepository.GetCostRangeAsync(user.Id);
        }

        public async Task<DateRangeDto> GetDateRangeAsync()
        {
            return await expenseRepository.GetDateRangeAsync(user.Id);
        }

        public async Task<ExpenseFilledFromImageDto> ExtractExpenseDataAsync(IFormFile image)
        {
            string apiKey = _configuration["ApiKeys:OPENAI_API_KEY"];
            OpenAIClient client = new("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");

            ChatClient chatClient = client.GetChatClient("gpt-4o");

            if (image == null || image.Length == 0)
                throw new BadRequestException("No file uploaded.");

            // 1. Process the stream to BinaryData
            using var stream = new MemoryStream();
            await image.CopyToAsync(stream);
            var imageData = BinaryData.FromBytes(stream.ToArray(), image.ContentType);
            ChatCompletionOptions options = new()
            {
                ResponseFormat = ChatResponseFormat.CreateJsonObjectFormat(),
                Temperature = 0.0f // Keep it consistent for data extraction
            };
            // 2. Create the message using the static factory method CreateImagePart
            List<ChatMessage> messages = new()
            {
                new SystemChatMessage(@"
            You are a professional receipt analyzer for Bulgarian receipts. 
            The input images will be in Bulgarian (Cyrillic).
    
            RULES FOR 'Title':
            1. Look for the merchant name at the top (e.g., 'Kaufland', 'Fantastico').
            2. If no merchant name is visible, categorize the receipt based on the items 
                (e.g., 'Groceries', 'Gas Station', 'Restaurant').
            3. Keep the title short (maximum 3-4 words).

            Return a strictly valid JSON object with:
            - 'Title': Short merchant name (e.g., 'Billa', 'Lidl', 'Shell').
            - 'Cost': The numerical total amount.
            - 'Description': A SINGLE STRING containing all products. 
                Format: '{productName} {productPrice}'. 
                Every product MUST be on a new line within the string.
            - 'ExpenseDate': The date in YYYY-MM-DDTHH:mm:ss format.
    
            If the receipt is blurry or data is missing, use null."),
                new UserChatMessage(
                    ChatMessageContentPart.CreateImagePart(imageData, "image/jpeg"),
                    ChatMessageContentPart.CreateTextPart("Extract the data from this receipt.")
                )
            };

            // 3. Send to the model
            ChatCompletion completion = await chatClient.CompleteChatAsync(messages, options);
            Console.WriteLine($"[ASSISTANT]: {completion.Content[0].Text}");


            string jsonResponse = completion.Content[0].Text;

            // Use JsonSerializer to map the string to your object
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true // This handles "title" vs "Title" automatically
            };

            ExpenseFilledFromImageDto? mappedExpense = JsonSerializer.Deserialize<ExpenseFilledFromImageDto>(jsonResponse, jsonOptions);
            return mappedExpense;
        }

        public async Task<ExpenseReadDto> CreateRecurringExpenseAsync(RecurringExpenseCreateDto dto)
        {
            RecurringExpense recurringExpense = mapper.Map<RecurringExpense>(dto);
            recurringExpense.UserId = user.Id;
            recurringExpense.StartDate = dto.ExpenseDate;
            DateTime period = recurringExpense.StartDate;

            switch (recurringExpense.Frequency)
            {
                case Shared.Enums.RecurringExpenseFrequency.Daily:
                    period = period.AddDays(1);
                    break;
                case Shared.Enums.RecurringExpenseFrequency.Weekly:
                    period = period.AddDays(7);
                    break;
                case Shared.Enums.RecurringExpenseFrequency.Monthly:
                    period = period.AddMonths(1);
                    break;
                case Shared.Enums.RecurringExpenseFrequency.Yearly:
                    period = period.AddYears(1);
                    break;
                default:
                    break;
            }

            recurringExpense.NextExecutionDate = period;
            Expense expense = mapper.Map<Expense>(dto);
            expense.CreatedAt = DateTime.Now;
            expense.UserId = user.Id;
            
            await recurringExpenseRepository.AddAsync(recurringExpense);
            await expenseRepository.AddAsync(expense);

            await UpdateBudgetsCreate(expense);

            return mapper.Map<ExpenseReadDto>(expense);
        }

        public async Task<List<RecurringExpenseReadDto>> GetAllRecurringExpenses()
        {
            List<RecurringExpense> recurringExpenses = await recurringExpenseRepository.GetAllAsync(user.Id);
            return mapper.Map<List<RecurringExpenseReadDto>>(recurringExpenses);
        }

        public async Task<ExportFileResultDto> ExportExpensesAsync(ExpenseQueryParams queryParams)
        {
            User loggedUser = await user.GetUserAsync();
            if (!loggedUser.IsPremium)
            {
                throw new BadRequestException("Exporting data is a remium feature!");
            }
            var expenses = await expenseRepository.GetExpensesFromQueryAsync(user.Id, queryParams);
            var expensesToExport = mapper.Map<List<ExpenseExportImportDto>>(expenses);
            byte[] content; 

            using (var memoryStream = new MemoryStream())
            {
                using (var writer = new StreamWriter(memoryStream, Encoding.UTF8))
                using (var csv = new CsvWriter(writer, CultureInfo.InvariantCulture))
                {
                    csv.WriteRecords(expensesToExport);
                    writer.Flush(); 
                }

                content = memoryStream.ToArray();
            }

            return new ExportFileResultDto
            {
                Content = content,
                ContentType = "text/csv",
                FileName = $"expenses-{DateTime.UtcNow:yyyyMMdd}.csv"
            };
        }

        public async Task<bool> ImportExpensesAsync(IFormFile csvFile)
        {
            User loggedUser = await user.GetUserAsync();
            if (!loggedUser.IsPremium)
            {
                throw new BadRequestException("Importing data is a remium feature!");
            }
            if (csvFile == null || csvFile.Length == 0)
            {
                throw new BadRequestException("File is invalid!");
            }

            List<Expense> expenses = new List<Expense>();
            using (var reader = new StreamReader(csvFile.OpenReadStream()))
            {
                string csvContent = await reader.ReadToEndAsync();
                List<Category> categories = await categoryRepository.GetAllAsync(user.Id);
                List<string> categoryNames = categories.Select(c => c.Name).ToList();

                List<Subcategory> subcategories = categories.SelectMany(c => c.Subcategories).ToList();
                List<string> subcategoryNames = subcategories.Select(c => c.Name).ToList();

                List<string> expensesStrings = csvContent.Split(Environment.NewLine).Skip(1).ToList();
                int lineNumber = 1;

                foreach (var expenseString in expensesStrings)
                {
                    lineNumber++;
                    if (string.IsNullOrWhiteSpace(expenseString)) continue;

                    var properties = expenseString.Split(',');

                    if (properties.Length < 8)
                        throw new Exception($"Error on line {lineNumber}: Invalid row format. Expected 8 columns, but found {properties.Length}.");

                    var dto = new ExpenseExportImportDto();

                    dto.Title = properties[0]?.Trim();
                    if (string.IsNullOrEmpty(dto.Title))
                        throw new Exception($"Error on line {lineNumber}: Title is required.");

                    if (!decimal.TryParse(properties[1], CultureInfo.InvariantCulture, out decimal cost))
                        throw new Exception($"Error on line {lineNumber}: Invalid amount (Cost). Make sure to use '.' as a decimal separator.");
                    dto.Cost = cost;

                    dto.Description = properties[2]?.Trim();

                    string? catName = properties[3]?.Trim();
                    if (string.IsNullOrEmpty(catName))
                        throw new Exception($"Error on line {lineNumber}: Category name is required.");

                    Category? category = categories.FirstOrDefault(c => c.Name == catName);
                    if (category == null)
                        throw new Exception($"Error on line {lineNumber}: Category '{catName}' does not exist.");

                    dto.CategoryName = catName;

                    string? subCatName = properties[4]?.Trim();
                    if (!string.IsNullOrEmpty(subCatName))
                    {
                        bool existsInThisCategory = category.Subcategories.Any(s => s.Name == subCatName);
                        if (!existsInThisCategory)
                            throw new Exception($"Error on line {lineNumber}: Subcategory '{subCatName}' does not belong to category '{catName}'.");

                        dto.SubcategoryName = subCatName;
                    }

                    Subcategory? subcategory = subcategories.FirstOrDefault(c => c.Name == subCatName);

                    string? dateString = properties[5]?.Trim();
                    string expectedFormat = "MM/dd/yyyy HH:mm:ss";

                    if (!DateTime.TryParseExact(dateString, expectedFormat, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime date))
                    {
                        throw new Exception($"Error on line {lineNumber}: Invalid date format '{dateString}'. Please use exactly '{expectedFormat}'.");
                    }
                    dto.ExpenseDate = date;

                    if (!Enum.TryParse<PaymentType>(properties[6], true, out var pType))
                        throw new Exception($"Error on line {lineNumber}: Invalid Payment Type '{properties[6]}'. Available types: {string.Join(", ", Enum.GetNames(typeof(PaymentType)))}.");
                    dto.PaymentType = pType;

                    if (!Enum.TryParse<Currency>(properties[7], true, out var curr))
                        throw new Exception($"Error on line {lineNumber}: Invalid Currency '{properties[7]}'. Available currencies: {string.Join(", ", Enum.GetNames(typeof(Currency)))}.");
                    dto.Currency = curr;

                    Expense expense = mapper.Map<Expense>(dto);
                    expense.CreatedAt = DateTime.Now;
                    expense.UserId = user.Id;
                    expense.CategoryId = category.Id;
                    expense.SubcategoryId = subcategory?.Id;
                    expenses.Add(expense);
                }
            }
            await expenseRepository.AddRangeAsync(expenses);
            return true;
        }
    }
}